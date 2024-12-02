import { CaretPosition, Selection } from 'cmw-coder-subprocess';
import { readFileSync } from 'fs';
import { decode } from 'iconv-lite';

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

  offsetAt(position: CaretPosition): number {
    return (
      this._content.split('\n').slice(0, position.line).join('\n').length +
      position.character +
      1
    );
  }

  getTruncatedContents(indices: { begin: number; end: number }[]): string {
    // Sort indices in descending order based on startIndex
    indices.sort((a, b) => a.begin - b.begin);
    let content = this._content;
    let offset = 0;
    // Remove substrings from the string
    for (const { begin, end } of indices) {
      content =
        content.substring(0, begin - offset) + content.substring(end - offset);
      offset += end - begin;
    }

    return content;
  }

  getText(range?: Selection): string {
    if (!range) {
      return this._content;
    }
    return this._content.substring(
      this.offsetAt(range.begin),
      this.offsetAt(range.end),
    );
  }
}
