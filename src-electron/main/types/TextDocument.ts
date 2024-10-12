import { readFileSync } from 'fs';
import { decode } from 'iconv-lite';

import { Position } from 'main/types/vscode/position';
import { Range } from 'main/types/vscode/range';
import { NEW_LINE_REGEX } from 'shared/constants/common';

export class TextDocument {
  fileName: string;
  languageId = 'c';
  lineCount: number;
  private readonly _content: string;

  constructor(filePath: string, content?: string) {
    if (content) {
      this._content = content;
    } else {
      this._content = decode(readFileSync(filePath), 'gb2312');
    }
    this.fileName = filePath.replaceAll('\\', '/');
    this.lineCount = this._content.split(NEW_LINE_REGEX).length;
  }

  offsetAt(position: Position): number {
    return (
      this._content.split('\n').slice(0, position.line).join('\n').length +
      position.character +
      1
    );
  }

  getTruncatedContents(indices: { begin: number; end: number }[]): string {
    // Sort indices in descending order based on startIndex
    indices.sort((a, b) => b.begin - a.end);

    let content = this._content;
    let offset = 0;
    // Remove substrings from the string
    for (const { begin, end } of indices) {
      const adjustedStartIndex = begin - offset;
      const adjustedEndIndex = end - offset;
      content =
        content.slice(0, adjustedStartIndex) +
        content.slice(adjustedEndIndex + 1);
      offset += end - begin + 1;
    }

    return content;
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
