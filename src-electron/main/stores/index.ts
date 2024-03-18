import { HuggingFaceConfigStore, LinseerConfigStore } from 'main/stores/config';
import { DataStore } from 'main/stores/data';
import { registerAction } from 'preload/types/ActionApi';
import { runtimeConfig } from 'shared/config';
import { ActionType } from 'shared/types/ActionMessage';
import { ApiStyle } from 'shared/types/model';

export const configStore =
  runtimeConfig.apiStyle === ApiStyle.HuggingFace
    ? new HuggingFaceConfigStore()
    : new LinseerConfigStore();

export const dataStore = new DataStore();

registerAction(
  ActionType.ConfigStoreSave,
  `main.stores.${ActionType.ConfigStoreSave}`,
  ({ type, data }) => {
    switch (type) {
      case 'config': {
        configStore.config = data;
        break;
      }
      case 'data': {
        configStore.data = data;
        break;
      }
    }
  },
);

registerAction(
  ActionType.DataStoreSave,
  `main.stores.${ActionType.DataStoreSave}`,
  (data) => {
    dataStore.store = data;
  },
);
