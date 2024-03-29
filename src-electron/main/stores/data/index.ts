import Conf from 'conf';
import ElectronStore from 'electron-store';
import { existsSync } from 'fs';
import { extend } from 'quasar';

import { dataStoreDefault } from 'main/stores/data/default';
import {
  DataStoreType,
  DataStoreTypeBefore_1_0_1,
  DataStoreTypeBefore_1_0_2,
  DataStoreTypeBefore_1_0_4,
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
          console.info('Upgrading "data" store to 1.0.1 ...');
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
          console.info('Upgrading "data" store to 1.0.2 ...');
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
        '1.0.4': (store) => {
          console.log('Upgrading "data" store to 1.0.4 ...');
          const { main, zoom } = getAs<DataStoreTypeBefore_1_0_4['window']>(
            store,
            'window',
          );
          store.set('compatibility', {
            transparentFallback:
              dataStoreDefault.compatibility.transparentFallback,
            zoomFix: zoom ? zoom !== 1 : false,
          });
          store.set('window', {
            main,
          });
        },
        '1.0.6': () => {
          console.log('Upgrading "data" store to 1.0.6 ...');
          this._store.set('window', dataStoreDefault.window);
        },
      },
      name: 'data',
      // schema: dataStoreSchema,
    });
  }

  get store(): DataStoreType {
    return this._store.store;
  }

  set store(value: Partial<DataStoreType>) {
    this._store.store = extend(true, this._store.store, value);
  }

  getProjectId(path: string): string | undefined {
    return this.store.project[path]?.id;
  }

  async setProjectId(path: string, projectId: string) {
    const store = this.store;
    if (store.project[path]) {
      store.project[path].id = projectId;
    } else {
      store.project[path] = {
        id: projectId,
        lastAddedLines: 0,
        svn: [],
      };
      this.store = store;
      store.project[path].svn = await Promise.all(
        (await searchSvnDirectories(path)).map(async (svnDirectory) => ({
          directory: svnDirectory,
          revision: await getRevision(svnDirectory),
        })),
      );
    }
    this.store = store;
  }

  async setProjectLastAddedLines(path: string, lastAddedLines: number) {
    const store = this.store;
    if (store.project[path]) {
      store.project[path].lastAddedLines = lastAddedLines;
      this.store = store;
    }
  }

  async setProjectRevision(path: string) {
    const store = this.store;
    if (store.project[path]) {
      const svnDirectories = await searchSvnDirectories(path);
      store.project[path].svn = await Promise.all(
        svnDirectories.map(async (svnDirectory) => ({
          directory: svnDirectory,
          revision: await getRevision(svnDirectory),
        })),
      );
      this.store = store;
    }
  }
}
