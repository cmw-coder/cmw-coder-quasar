export enum Modifier {
  Alt = 'Alt',
  Ctrl = 'Ctrl',
  Shift = 'Shift',
}

export interface Shortcut {
  keycode: number;
  modifiers: Modifier[];
}
