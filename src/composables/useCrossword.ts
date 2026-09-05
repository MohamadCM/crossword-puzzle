import { computed, reactive, ref } from 'vue';

import type {
  CellPosition,
  CrosswordClue,
  CrosswordJson,
  CrosswordCell,
  Direction,
} from '../types/crossword';

export function useCrossword() {
  const grid = ref<CrosswordCell[][]>([]);
  const clues = ref<CrosswordClue[]>([]);

  const selectedCell = ref<CellPosition | null>(null);
  const direction = ref<Direction>('across');

  const entries = reactive<Record<string, string>>({});

  function cellKey(row: number, col: number) {
    return `${row}-${col}`;
  }

  function getLetter(row: number, col: number) {
    return entries[cellKey(row, col)] ?? '';
  }

  function loadPuzzle(puzzle: CrosswordJson) {
    // Create the grid
    grid.value = puzzle.grid.map((row, rowIndex) =>
      row.split('').map((value, colIndex) => ({
        row: rowIndex,
        col: colIndex,
        isBlock: value === puzzle.blocks,
        solution: value === puzzle.blocks ? undefined : value,
      }))
    );

    // Convert JSON entries into CrosswordClue objects
    clues.value = [
      ...puzzle.entries.across.map((entry) => ({
        number: entry.number,
        clue: entry.clue,
        answer: entry.answer,
        enumeration: entry.enumeration,
        start: {
          row: entry.row - 1,
          col: entry.column - 1,
        },
        direction: 'across' as Direction,
      })),

      ...puzzle.entries.down.map((entry) => ({
        number: entry.number,
        clue: entry.clue,
        answer: entry.answer,
        enumeration: entry.enumeration,
        start: {
          row: entry.row - 1,
          col: entry.column - 1,
        },
        direction: 'down' as Direction,
      })),
    ];

    // Add clue numbers to the grid cells.
    //
    // A cell can start both an Across and a Down clue,
    // but it should only display the number once.
    for (const clue of clues.value) {
      const cell = grid.value[clue.start.row]?.[clue.start.col];

      if (cell && !cell.isBlock) {
        cell.number = clue.number;
      }
    }

    // Clear previous user answers
    Object.keys(entries).forEach((key) => {
      delete entries[key];
    });

    // Select the first playable cell
    selectedCell.value = findFirstPlayableCell();
    direction.value = 'across';
  }

  function findFirstPlayableCell(): CellPosition | null {
    for (const row of grid.value) {
      for (const cell of row) {
        if (!cell.isBlock) {
          return {
            row: cell.row,
            col: cell.col,
          };
        }
      }
    }

    return null;
  }

  function getClueForCell(
    position: CellPosition,
    dir: Direction
  ): CrosswordClue | undefined {
    return clues.value.find((clue) => {
      if (clue.direction !== dir) {
        return false;
      }

      const startRow = clue.start.row;
      const startCol = clue.start.col;
      const length = clue.answer.length;

      if (dir === 'across') {
        return (
          position.row === startRow &&
          position.col >= startCol &&
          position.col < startCol + length
        );
      }

      return (
        position.col === startCol &&
        position.row >= startRow &&
        position.row < startRow + length
      );
    });
  }

  const activeClue = computed(() => {
    if (!selectedCell.value) {
      return null;
    }

    return getClueForCell(selectedCell.value, direction.value) ?? null;
  });

  const activeCells = computed(() => {
    if (!activeClue.value) {
      return [];
    }

    const cells: CellPosition[] = [];
    const clue = activeClue.value;

    for (let i = 0; i < clue.answer.length; i++) {
      cells.push({
        row: clue.start.row + (clue.direction === 'down' ? i : 0),
        col: clue.start.col + (clue.direction === 'across' ? i : 0),
      });
    }

    return cells;
  });

  function isActiveCell(row: number, col: number) {
    return activeCells.value.some(
      (cell) => cell.row === row && cell.col === col
    );
  }

  function selectCell(row: number, col: number) {
    const cell = grid.value[row]?.[col];

    if (!cell || cell.isBlock) {
      return;
    }

    const position = {
      row,
      col,
    };

    const acrossClue = getClueForCell(position, 'across');

    const downClue = getClueForCell(position, 'down');

    // Clicking the currently selected cell toggles
    // between Across and Down when both exist.
    if (
      selectedCell.value &&
      selectedCell.value.row === row &&
      selectedCell.value.col === col
    ) {
      if (direction.value === 'across' && downClue) {
        direction.value = 'down';
      } else if (direction.value === 'down' && acrossClue) {
        direction.value = 'across';
      }
    } else if (getClueForCell(position, direction.value)) {
      // Keep the current direction.
    } else if (acrossClue) {
      direction.value = 'across';
    } else if (downClue) {
      direction.value = 'down';
    }

    selectedCell.value = position;
  }

  function moveBy(rowDelta: number, colDelta: number) {
    if (!selectedCell.value) {
      return;
    }

    let row = selectedCell.value.row + rowDelta;

    let col = selectedCell.value.col + colDelta;

    while (
      row >= 0 &&
      row < grid.value.length &&
      col >= 0 &&
      col < (grid.value[row]?.length ?? 0)
    ) {
      const cell = grid.value[row][col];

      if (!cell.isBlock) {
        selectedCell.value = {
          row,
          col,
        };

        return;
      }

      row += rowDelta;
      col += colDelta;
    }
  }

  function selectNextCell() {
    if (!selectedCell.value) {
      return;
    }

    if (direction.value === 'across') {
      moveBy(0, 1);
    } else {
      moveBy(1, 0);
    }
  }

  function selectPreviousCell() {
    if (!selectedCell.value) {
      return;
    }

    if (direction.value === 'across') {
      moveBy(0, -1);
    } else {
      moveBy(-1, 0);
    }
  }

  function enterLetter(letter: string) {
    if (!selectedCell.value) {
      return;
    }

    const { row, col } = selectedCell.value;
    const cell = grid.value[row]?.[col];

    if (!cell || cell.isBlock) {
      return;
    }

    // Replace whatever letter is currently in the cell.
    entries[cellKey(row, col)] = letter.toUpperCase();

    selectNextCell();
  }

  function handleBackspace() {
    if (!selectedCell.value) {
      return;
    }

    const { row, col } = selectedCell.value;
    const key = cellKey(row, col);

    // If the current cell contains a letter,
    // remove it without moving.
    if (entries[key]) {
      delete entries[key];
      return;
    }

    // Otherwise move backwards and clear that cell.
    selectPreviousCell();

    if (!selectedCell.value) {
      return;
    }

    const previousKey = cellKey(selectedCell.value.row, selectedCell.value.col);

    delete entries[previousKey];
  }

  function handleDelete() {
    if (!selectedCell.value) {
      return;
    }

    const key = cellKey(selectedCell.value.row, selectedCell.value.col);

    delete entries[key];
  }

  function toggleDirection() {
    direction.value = direction.value === 'across' ? 'down' : 'across';
  }

  function handleKeydown(event: KeyboardEvent) {
    // Letter
    if (event.key.length === 1 && /^[a-zA-Z]$/.test(event.key)) {
      event.preventDefault();
      enterLetter(event.key);
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        direction.value = 'across';
        moveBy(0, -1);
        break;

      case 'ArrowRight':
        event.preventDefault();
        direction.value = 'across';
        moveBy(0, 1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        direction.value = 'down';
        moveBy(-1, 0);
        break;

      case 'ArrowDown':
        event.preventDefault();
        direction.value = 'down';
        moveBy(1, 0);
        break;

      case ' ':
        event.preventDefault();
        toggleDirection();
        break;

      case 'Backspace':
        event.preventDefault();
        handleBackspace();
        break;

      case 'Delete':
        event.preventDefault();
        handleDelete();
        break;

      case 'Tab':
        event.preventDefault();

        if (event.shiftKey) {
          selectPreviousCell();
        } else {
          selectNextCell();
        }

        break;

      case 'Home':
        event.preventDefault();

        if (activeClue.value) {
          selectedCell.value = {
            ...activeClue.value.start,
          };
        }

        break;

      case 'End':
        event.preventDefault();

        if (activeClue.value) {
          const clue = activeClue.value;
          const lastIndex = clue.answer.length - 1;

          selectedCell.value = {
            row: clue.start.row + (clue.direction === 'down' ? lastIndex : 0),

            col: clue.start.col + (clue.direction === 'across' ? lastIndex : 0),
          };
        }

        break;
    }
  }

  return {
    grid,
    clues,
    selectedCell,
    direction,
    activeCells,
    activeClue,
    getLetter,
    isActiveCell,
    loadPuzzle,
    selectCell,
    selectNextCell,
    selectPreviousCell,
    handleKeydown,
  };
}
