export type Direction = 'across' | 'down';

export interface CellPosition {
  row: number;
  col: number;
}

export interface CrosswordCell {
  row: number;
  col: number;
  number?: number;
  solution?: string;
  isBlock?: boolean;
}

export interface CrosswordClue {
  number: number;
  clue: string;
  answer: string;
  enumeration?: string;
  start: CellPosition;
  direction: Direction;
}

export interface CrosswordJsonEntry {
  number: number;
  row: number;
  column: number;
  answer: string;
  clue: string;
  enumeration?: string;
}

export interface CrosswordJson {
  title: string;
  grid: string[];
  blocks: string;
  entries: {
    across: CrosswordJsonEntry[];
    down: CrosswordJsonEntry[];
  };
}
