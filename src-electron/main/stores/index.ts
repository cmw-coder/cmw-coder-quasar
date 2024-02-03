import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';

import { HuggingFaceConfigStore, LinseerConfigStore } from 'main/stores/config';
import { DataStore } from 'main/stores/data';
import { ApiStyle } from 'main/types/model';
import { registerActionCallback } from 'preload/types/ActionApi';
import { ActionType } from 'shared/types/ActionMessage';
import { DataProjectType } from 'main/stores/data/types';

let apiStyle: ApiStyle;

// eslint-disable-next-line prefer-const
apiStyle = ApiStyle.HuggingFace;

try {
  unlinkSync(join(process.env.APPDATA, 'Comware Coder/config.json'));
} catch {}
const dataPath = join(process.env.APPDATA, 'Comware Coder/data.json');
const dataJson = JSON.parse(readFileSync(dataPath).toString());
if (dataJson.project.pathAndIdMapping) {
  unlinkSync(dataPath);
  const oldProjects = <{ pathAndIdMapping: Record<string, string> }>(
    dataJson.project
  );
  const newProjects: Record<string, DataProjectType> = {};
  for (const [path, id] of Object.entries(oldProjects.pathAndIdMapping)) {
    if (existsSync(path)) {
      newProjects[path] = {
        id,
        lastAddedLines: 0,
        svn: [],
      };
    }
  }
  dataJson.project = newProjects;
  writeFileSync(dataPath, JSON.stringify(dataJson));
}

export const configStore =
  apiStyle === ApiStyle.HuggingFace
    ? new HuggingFaceConfigStore()
    : new LinseerConfigStore();

export const dataStore = new DataStore();

registerActionCallback(ActionType.ConfigStoreSave, ({ type, data }) => {
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
});

registerActionCallback(ActionType.DataStoreSave, ({ type, data }) => {
  switch (type) {
    case 'project': {
      dataStore.project = data;
      break;
    }
    case 'window': {
      dataStore.window = data;
      break;
    }
  }
});
