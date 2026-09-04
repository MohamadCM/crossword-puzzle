import { computed, reactive, ref } from 'vue';
import type {
  CellPosition,
  CrosswordCell,
  CrosswordClue,
  Direction,
} from '@/types/crossword';

export function useCrossword(grid: CrosswordCell[][], clues: CrosswordClue[]) {
  const selectedCell = ref<CellPosition | null>(null);
  const direction = ref<Direction>('across');

  // User entered letters.
  const entries = reactive<Record<string, string>>({});

  const rows = computed(() => grid.length);
  const cols = computed(() => grid[0]?.length ?? 0);

  const activeClue = computed(() => {
    if (!selectedCell.value) {
      return null;
    }

    return (
      clues.find(
        (clue) =>
          clue.direction === direction.value &&
          containsCell(clue, selectedCell.value!)
      ) ?? null
    );
  });

  const activeCells = computed(() => {
    if (!activeClue.value) {
      return [];
    }

    return getClueCells(activeClue.value);
  });

  function getCellKey(position: CellPosition) {
    return `${position.row}-${position.col}`;
  }

  function getCell(position: CellPosition) {
    return grid[position.row]?.[position.col];
  }

  function getLetter(position: CellPosition) {
    return entries[getCellKey(position)] ?? '';
  }

  function isValidPosition(position: CellPosition) {
    return (
      position.row >= 0 &&
      position.row < rows.value &&
      position.col >= 0 &&
      position.col < cols.value
    );
  }

  function isPlayable(position: CellPosition) {
    const cell = getCell(position);

    return cell != null && !cell.isBlock;
  }

  function containsCell(clue: CrosswordClue, position: CellPosition) {
    return getClueCells(clue).some(
      (cell) => cell.row === position.row && cell.col === position.col
    );
  }

  function getClueCells(clue: CrosswordClue): CellPosition[] {
    const result: CellPosition[] = [];

    let row = clue.start.row;
    let col = clue.start.col;

    while (isValidPosition({ row, col })) {
      const cell = getCell({ row, col });

      if (!cell || cell.isBlock) {
        break;
      }

      result.push({ row, col });

      if (clue.direction === 'across') {
        col++;
      } else {
        row++;
      }
    }

    return result;
  }

  function getCluesForCell(position: CellPosition) {
    return clues.filter((clue) => containsCell(clue, position));
  }

  function selectCell(position: CellPosition) {
    if (!isPlayable(position)) {
      return;
    }

    const sameCell =
      selectedCell.value?.row === position.row &&
      selectedCell.value?.col === position.col;

    // Clicking the currently selected cell toggles
    // Across/Down.
    if (sameCell) {
      toggleDirection();
      return;
    }

    selectedCell.value = {
      ...position,
    };

    // If the selected cell doesn't belong to the current
    // direction, automatically switch direction.
    const currentDirectionClue = getCluesForCell(position).some(
      (clue) => clue.direction === direction.value
    );

    if (!currentDirectionClue) {
      direction.value = direction.value === 'across' ? 'down' : 'across';
    }
  }

  function toggleDirection() {
    if (!selectedCell.value) {
      return;
    }

    const otherDirection: Direction =
      direction.value === 'across' ? 'down' : 'across';

    const hasOtherDirection = getCluesForCell(selectedCell.value).some(
      (clue) => clue.direction === otherDirection
    );

    if (hasOtherDirection) {
      direction.value = otherDirection;
    }
  }

  function moveBy(rowDelta: number, colDelta: number) {
    if (!selectedCell.value) {
      return;
    }

    let row = selectedCell.value.row + rowDelta;
    let col = selectedCell.value.col + colDelta;

    while (isValidPosition({ row, col })) {
      if (isPlayable({ row, col })) {
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

  function moveToFirstCell() {
    const cells = activeCells.value;

    if (cells.length > 0) {
      selectedCell.value = {
        ...cells[0],
      };
    }
  }

  function moveToLastCell() {
    const cells = activeCells.value;

    if (cells.length > 0) {
      const cell = cells[cells.length - 1];

      selectedCell.value = {
        ...cell,
      };
    }
  }

  // Enter or replace the letter in the selected cell.
  function enterLetter(letter: string) {
    if (!selectedCell.value) {
      return;
    }

    const cell = getCell(selectedCell.value);

    if (!cell || cell.isBlock) {
      return;
    }

    const normalizedLetter = letter.trim().charAt(0).toUpperCase();

    if (!/^[A-Z]$/.test(normalizedLetter)) {
      return;
    }

    // Replace the current value.
    entries[getCellKey(selectedCell.value)] = normalizedLetter;
  }

  // Remove the letter from the current cell.
  function clearCell() {
    if (!selectedCell.value) {
      return;
    }

    delete entries[getCellKey(selectedCell.value)];
  }

  // Delete removes the current cell's letter without moving
  function handleDelete() {
    clearCell();
  }

  // Handle all keyboard interaction from the grid.
  function handleKeydown(event: KeyboardEvent) {
    if (!selectedCell.value) {
      return;
    }

    // A-Z
    if (/^[a-zA-Z]$/.test(event.key)) {
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

      case 'Backspace':
        event.preventDefault();

        handleDelete();

        break;

      case 'Delete':
        event.preventDefault();

        handleDelete();

        break;

      case ' ':
        event.preventDefault();

        toggleDirection();

        break;

      case 'Home':
        event.preventDefault();

        moveToFirstCell();

        break;

      case 'End':
        event.preventDefault();

        moveToLastCell();

        break;

      case 'Tab':
        event.preventDefault();

        if (event.shiftKey) {
          selectPreviousCell();
        } else {
          selectNextCell();
        }

        break;
    }
  }

  return {
    // State
    selectedCell,
    direction,
    entries,

    // Derived state
    activeClue,
    activeCells,

    // Cell helpers
    getCell,
    getLetter,
    getCellKey,
    getClueCells,
    getCluesForCell,

    // Selection
    selectCell,
    toggleDirection,

    // Navigation
    moveBy,
    moveToFirstCell,
    moveToLastCell,

    // Input
    enterLetter,
    clearCell,
    handleDelete,
    handleKeydown,
  };
}
