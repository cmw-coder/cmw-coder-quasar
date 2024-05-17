import Conf from 'conf';
import log from 'electron-log/main';
import ElectronStore from 'electron-store';
import { existsSync } from 'fs';

import { dataStoreDefault } from 'main/stores/data/default';
import {
  DataStoreType,
  DataStoreTypeBefore_1_0_1,
  DataStoreTypeBefore_1_0_2,
  DataStoreTypeBefore_1_0_4,
} from 'main/stores/data/types';

const getAs = <T>(store: unknown, key: string): T => {
  return <T>(<Conf>store).get(key);
};

export class DataStoreBefore1_2_0 {
  private _store: ElectronStore<DataStoreType>;

  constructor() {
    this._store = new ElectronStore<DataStoreType>({
      clearInvalidConfig: true,
      defaults: dataStoreDefault,
      migrations: {
        '1.0.1': (store) => {
          log.info('Upgrading "data" store to 1.0.1 ...');
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
          log.info('Upgrading "data" store to 1.0.2 ...');
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
          log.info('Upgrading "data" store to 1.0.4 ...');
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
        '1.0.6': (store) => {
          log.info('Upgrading "data" store to 1.0.6 ...');
          store.set('window', dataStoreDefault.window);
        },
      },
      name: 'data',
      // schema: dataStoreSchema,
    });
  }

  get store(): DataStoreType {
    return this._store.store;
  }
}
