<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';

import type {
  CrosswordCell,
  CellPosition,
  Direction,
} from '../types/crossword';

const props = defineProps<{
  grid: CrosswordCell[][];
  selectedCell: CellPosition | null;
  direction: Direction;
  activeCells: CellPosition[];
  getLetter: (row: number, col: number) => string;
}>();

const emit = defineEmits<{
  selectCell: [row: number, col: number];
}>();

const cellRefs = ref<Record<string, HTMLButtonElement>>({});

const rowCount = computed(() => props.grid.length);

const columnCount = computed(() => {
  return Math.max(0, ...props.grid.map((row) => row.length));
});

function cellKey(row: number, col: number) {
  return `${row}-${col}`;
}

function setCellRef(
  row: number,
  col: number,
  element: HTMLButtonElement | null
) {
  const key = cellKey(row, col);

  if (element) {
    cellRefs.value[key] = element;
  } else {
    delete cellRefs.value[key];
  }
}

function isActive(row: number, col: number) {
  return props.activeCells.some((cell) => cell.row === row && cell.col === col);
}

function isSelected(row: number, col: number) {
  return props.selectedCell?.row === row && props.selectedCell?.col === col;
}

function handleCellClick(row: number, col: number) {
  emit('selectCell', row, col);
}

watch(
  () => props.selectedCell,
  async (cell) => {
    if (!cell) {
      return;
    }

    await nextTick();

    cellRefs.value[cellKey(cell.row, cell.col)]?.focus();
  },
  { deep: true }
);
</script>

<template>
  <div
    class="crossword-grid"
    :style="{
      '--column-count': columnCount,
    }"
    role="grid"
    :aria-rowcount="rowCount"
    :aria-colcount="columnCount"
  >
    <template v-for="(row, rowIndex) in grid" :key="rowIndex">
      <button
        v-for="cell in row"
        :key="cellKey(cell.row, cell.col)"
        :ref="
          (element) =>
            setCellRef(cell.row, cell.col, element as HTMLButtonElement | null)
        "
        type="button"
        class="crossword-cell"
        :class="{
          'crossword-cell--active':
            !cell.isBlock && isActive(cell.row, cell.col),
          'crossword-cell--selected':
            !cell.isBlock && isSelected(cell.row, cell.col),
          'crossword-cell--block': cell.isBlock,
        }"
        :disabled="cell.isBlock"
        :aria-label="
          cell.isBlock
            ? 'Blocked cell'
            : `Row ${cell.row + 1}, column ${cell.col + 1}`
        "
        role="gridcell"
        @click="handleCellClick(cell.row, cell.col)"
      >
        <span v-if="cell.number" class="crossword-cell__number">
          {{ cell.number }}
        </span>

        <span class="crossword-cell__letter">
          {{ getLetter(cell.row, cell.col) }}
        </span>
      </button>
    </template>
  </div>
</template>

<style scoped>
.crossword-grid {
  display: grid;
  grid-template-columns: repeat(var(--column-count), minmax(0, 1fr));

  width: min(90vw, 600px);
  aspect-ratio: 1;

  border: 1px solid var(--p-surface-300);

  user-select: none;
}

.crossword-cell {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  min-width: 0;
  min-height: 0;
  padding: 0;

  border: 0;
  border-right: 1px solid var(--p-surface-300);
  border-bottom: 1px solid var(--p-surface-300);
  border-radius: 0;

  background: var(--p-surface-0);
  color: var(--p-text-color);

  font: inherit;
  cursor: pointer;
}

.crossword-cell:focus {
  outline: none;
}

.crossword-cell:focus-visible {
  z-index: 2;
  outline: 2px solid var(--p-primary-color);
  outline-offset: -2px;
}

.crossword-cell--active {
  background: var(--p-primary-100);
}

.crossword-cell--selected {
  background: var(--p-primary-300);
}

.crossword-cell--block {
  background: var(--p-surface-900);
  cursor: default;
}

.crossword-cell__number {
  position: absolute;
  top: 2px;
  left: 3px;

  color: var(--p-text-color);

  font-size: clamp(0.45rem, 1.5vw, 0.7rem);
  font-weight: 500;
  line-height: 1;
}

.crossword-cell__letter {
  font-size: clamp(1rem, 5vw, 2rem);
  font-weight: 500;
  line-height: 1;
}
</style>
