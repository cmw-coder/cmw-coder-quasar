import { HuggingFaceConfigStore, LinseerConfigStore } from 'main/stores/config';
import { DataStore } from 'main/stores/data';
import { ApiStyle } from 'main/types/model';
import { registerActionCallback } from 'preload/types/ActionApi';
import { ActionType } from 'shared/types/ActionMessage';

let apiStyle: ApiStyle;

// eslint-disable-next-line prefer-const
apiStyle = ApiStyle.Linseer;

export const configStore =
  apiStyle === ApiStyle.HuggingFace
    ? new HuggingFaceConfigStore()
    : new LinseerConfigStore();

export const dataStore = new DataStore();

registerActionCallback(ActionType.ConfigStoreSave, ({ type, data }) => {
  switch (type) {
    case 'config':
      configStore.config = data;
      break;
    case 'data':
      configStore.data = data;
      break;
  }
});

registerActionCallback(ActionType.DataStoreSave, ({ type, data }) => {
  switch (type) {
    case 'window':
      dataStore.window = data;
      break;
  }
});
