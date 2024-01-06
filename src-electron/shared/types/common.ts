export interface CaretPosition {
  character: number;
  line: number;
}

export class CaretPosition {
  constructor(line = -1, character = -1) {
    this.character = character;
    this.line = line;
  }

  isValid() {
    return this.line >= 0 && this.character >= 0;
  }
}

export interface Completions {
  contents: string[];
  type: 'function' | 'line' | 'snippet';
}
