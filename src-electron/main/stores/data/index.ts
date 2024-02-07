import Conf from 'conf';
import ElectronStore from 'electron-store';
import { existsSync } from 'fs';

import { dataStoreDefault } from 'main/stores/data/default';
import {
  DataProjectType,
  DataStoreType,
  DataStoreTypeBefore_1_0_1,
  DataStoreTypeBefore_1_0_2,
  DataWindowType,
} from 'main/stores/data/types';
import { getRevision, searchSvnDirectories } from 'main/utils/svn';

const getAs = <T>(store: unknown, key: string): T => {
  return <T>(<Conf>store).get(key);
};

export class DataStore {
  private _store: ElectronStore<DataStoreType>;

  constructor() {
    this._store = new ElectronStore<DataStoreType>({
      clearInvalidConfig: true,
      defaults: dataStoreDefault,
      migrations: {
        '1.0.1': (store) => {
          console.info('Migrating "data" store to 1.0.1 ...');
          const oldProjects = getAs<DataStoreTypeBefore_1_0_1['project']>(
            store,
            'project',
          );
          if (oldProjects.pathAndIdMapping) {
            const newProjects: DataStoreTypeBefore_1_0_2['project'] = {};
            for (const [path, id] of Object.entries(
              oldProjects.pathAndIdMapping,
            )) {
              if (existsSync(path)) {
                newProjects[path] = {
                  id,
                  lastAddedLines: 0,
                  revision: -1,
                };
              }
            }
            store.set('project', newProjects);
          }
        },
        '1.0.2': (store) => {
          console.info('Migrating "data" store to 1.0.2 ...');
          const oldProjects = getAs<DataStoreTypeBefore_1_0_2['project']>(
            store,
            'project',
          );
          const newProjects: DataStoreType['project'] = {};
          for (const path in oldProjects) {
            const { id, lastAddedLines } = oldProjects[path];
            newProjects[path] = {
              id,
              lastAddedLines,
              svn: [],
            };
          }
          store.set('project', newProjects);
        },
      },
      name: 'data',
      // schema: dataStoreSchema,
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
        (await searchSvnDirectories(path)).map(async (svnDirectory) => ({
          directory: svnDirectory,
          revision: await getRevision(svnDirectory),
        })),
      );
      console.log('setProjectId', data);
      current[path] = {
        id: projectId,
        lastAddedLines: 0,
        svn: await Promise.all(
          (await searchSvnDirectories(path)).map(async (svnDirectory) => ({
            directory: svnDirectory,
            revision: await getRevision(svnDirectory),
          })),
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
          })),
        ),
      );
      current[path].svn = await Promise.all(
        svnDirectories.map(async (svnDirectory) => ({
          directory: svnDirectory,
          revision: await getRevision(svnDirectory),
        })),
      );
      this.project = current;
    }
  }
}
