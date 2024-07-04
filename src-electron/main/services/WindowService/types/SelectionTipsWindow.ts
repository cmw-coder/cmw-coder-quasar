import { WindowType } from 'shared/types/WindowType';
import { BaseWindow } from 'main/services/WindowService/types/BaseWindow';
import { container } from 'main/services';
import { DataStoreService } from 'main/services/DataStoreService';
import { ServiceType } from 'shared/types/service';
import { Selection, TriggerPosition } from 'shared/types/Selection';
import { Range } from 'main/types/vscode/range';

export class SelectionTipsWindow extends BaseWindow {
  selection?: Selection;

  constructor() {
    const { compatibility } = container
      .get<DataStoreService>(ServiceType.DATA_STORE)
      .getAppdata();
    super(WindowType.SelectionTips, {
      useContentSize: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      focusable: true,
      alwaysOnTop: true,
      fullscreenable: false,
      skipTaskbar: true,
      show: false,
      frame: false,
      transparent: !compatibility.transparentFallback,
    });

    this.selection = {
      file: 'D:\\project\\cmw-coder\\cmw-coder-proxy\\components\\ConfigManager.cc',
      content:
        'ConfigManager::ConfigManager()\n    : _shortcutCommit({Key::K, {Modifier::Alt, Modifier::Ctrl}}),\n      _shortcutManualCompletion({Key::Enter, {Modifier::Alt}}) {\n    if (const auto [major, minor, build, _] = system::getVersion(); major == 3 && minor == 5) {\n        _siVersion = make_pair(\n            SiVersion::Major::V35,\n            enum_cast<SiVersion::Minor>(build).value_or(SiVersion::Minor::Unknown)\n        );\n        _siVersionString = "_3.50." + format("{:0>{}}", build, 4);\n    } else {\n        _siVersion = make_pair(\n            SiVersion::Major::V40,\n            enum_cast<SiVersion::Minor>(build).value_or(SiVersion::Minor::Unknown)\n        );\n        _siVersionString = "_4.00." + format("{:0>{}}", build, 4);\n    }\n    _threadRetrieveProjectDirectory();\n    _threadRetrieveSvnDirectory();\n    logger::info(format("Configurator is initialized with version: {}", _siVersionString));\n}',
      range: new Range(20, 1, 40, 2),
      language: 'c',
      block: '',
    };
  }

  trigger(position: TriggerPosition, selection: Selection) {
    if (!this._window) {
      return;
    }
    this.selection = selection;
    this._window.setPosition(position.x, position.y);
    this.show();
  }
}
