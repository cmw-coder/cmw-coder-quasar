import { readFileSync } from 'fs';
import { decode } from 'iconv-lite';

import { Position } from 'main/types/vscode/position';
import { Range } from 'main/types/vscode/range';

export class TextDocument {
  fileName: string;
  languageId = 'c';
  version = 0;
  lineCount: number;
  private readonly _content: string;

  constructor(filePath: string) {
    this._content = decode(readFileSync(filePath), 'gb2312');
    this.fileName = filePath;
    this.lineCount = this._content.split('\n').length;
  }

  offsetAt(position: Position): number {
    return (
      this._content.split('\n').slice(0, position.line).join('\n').length +
      position.character +
      1
    );
  }

  getText(range?: Range): string {
    if (!range) {
      return this._content;
    }
    return this._content.substring(
      this.offsetAt(range.start),
      this.offsetAt(range.end),
    );
  }
}
