/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Position } from 'main/types/vscode/position';

/**
 * A range in the editor. (start.line, start.character) is <= (end.line, end.character)
 */
export class Range {
  public readonly start: Position;
  public readonly end: Position;

  constructor(
    startLine: number,
    startCharacter: number,
    endLine: number,
    endCharacter: number,
  ) {
    if (
      startLine > endLine ||
      (startLine === endLine && startCharacter > endCharacter)
    ) {
      this.start = new Position(endLine, endCharacter);
      this.end = new Position(startLine, startCharacter);
    } else {
      this.start = new Position(startLine, startCharacter);
      this.end = new Position(endLine, endCharacter);
    }
  }
}
