import ElectronStore from 'electron-store';
import { existsSync } from 'fs';

import { dataStoreDefault } from 'main/stores/data/default';
import { dataStoreSchema } from 'main/stores/data/schema';
import {
  DataProjectType,
  DataStoreType,
  DataWindowType,
} from 'main/stores/data/types';
import { getRevision, searchSvnDirectories } from 'main/utils/svn';

export class DataStore {
  private _store: ElectronStore<DataStoreType>;

  constructor() {
    this._store = new ElectronStore({
      clearInvalidConfig: true,
      defaults: dataStoreDefault,
      migrations: {
        '1.0.0': async (store) => {
          console.log('DataStore migration from 1.0.0');
          const oldProjects = <{ pathAndIdMapping: Record<string, string> }>(
            (<never>store.get('project'))
          );
          if (oldProjects.pathAndIdMapping) {
            const newProjects: Record<string, DataProjectType> = {};

            for (const [path, id] of Object.entries(
              oldProjects.pathAndIdMapping
            )) {
              if (existsSync(path)) {
                const svnDirectories = await searchSvnDirectories(path);
                if (svnDirectories.length) {
                  newProjects[path] = {
                    id,
                    lastAddedLines: 0,
                    svn: await Promise.all(
                      svnDirectories.map(async (svnDirectory) => ({
                        directory: svnDirectory,
                        revision: await getRevision(svnDirectory),
                      }))
                    ),
                  };
                }
              }
            }

            store.set('project', newProjects);
          }
        },
      },
      name: 'data',
      schema: dataStoreSchema,
    });
  }

  get project(): Record<string, DataProjectType> {
    return this._store.get('project');
  }

  set project(value: Record<string, DataProjectType>) {
    const current = this.project;
    this._store.set('project', { ...current, ...value });
  }

  get window(): DataWindowType {
    return this._store.get('window');
  }

  set window(value: Partial<DataWindowType>) {
    const current = this.window;
    this._store.set('window', { ...current, ...value });
  }

  getProjectId(path: string): string | undefined {
    return this.project[path]?.id;
  }

  async setProjectId(path: string, projectId: string) {
    const current = this.project;
    if (current[path]) {
      current[path].id = projectId;
    } else {
      const data = await Promise.all(
        (
          await searchSvnDirectories(path)
        ).map(async (svnDirectory) => ({
          directory: svnDirectory,
          revision: await getRevision(svnDirectory),
        }))
      );
      console.log('setProjectId', data);
      current[path] = {
        id: projectId,
        lastAddedLines: 0,
        svn: await Promise.all(
          (
            await searchSvnDirectories(path)
          ).map(async (svnDirectory) => ({
            directory: svnDirectory,
            revision: await getRevision(svnDirectory),
          }))
        ),
      };
    }
    this.project = current;
  }

  async setProjectLastAddedLines(path: string, lastAddedLines: number) {
    const current = this.project;
    if (current[path]) {
      current[path].lastAddedLines = lastAddedLines;
      this.project = current;
    }
  }

  async setProjectRevision(path: string) {
    const current = this.project;
    if (current[path]) {
      const svnDirectories = await searchSvnDirectories(path);
      console.log(
        'setProjectRevision',
        await Promise.all(
          svnDirectories.map(async (svnDirectory) => ({
            directory: svnDirectory,
            revision: await getRevision(svnDirectory),
          }))
        )
      );
      current[path].svn = await Promise.all(
        svnDirectories.map(async (svnDirectory) => ({
          directory: svnDirectory,
          revision: await getRevision(svnDirectory),
        }))
      );
      this.project = current;
    }
  }
}
