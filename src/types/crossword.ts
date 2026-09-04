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
  letter?: string;
  isBlock?: boolean;
}

export interface CrosswordClue {
  number: number;
  clue: string;
  answer: string;
  start: CellPosition;
  direction: Direction;
}
