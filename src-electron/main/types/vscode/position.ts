export class Position {
  public readonly line: number;

  public readonly character: number;

  constructor(line: number, character: number) {
    this.line = line;
    this.character = character;
  }

  /**
   * Create a new position from this position.
   *
   * @param newLineNumber new line number
   * @param newColumn new character
   */
  with(
    newLineNumber: number = this.line,
    newColumn: number = this.character,
  ): Position {
    if (newLineNumber === this.line && newColumn === this.character) {
      return this;
    } else {
      return new Position(newLineNumber, newColumn);
    }
  }

  /**
   * Convert to a human-readable representation.
   */
  public toString(): string {
    return '(' + this.line + ',' + this.character + ')';
  }
}
