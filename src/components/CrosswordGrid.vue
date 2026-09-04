<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type { CellPosition, CrosswordCell } from '@/types/crossword';
import type { Direction } from '@/types/crossword';

const props = defineProps<{
  grid: CrosswordCell[][];
  selectedCell: CellPosition | null;
  direction: Direction;
  activeCells: CellPosition[];
  entries: Record<string, string>;
  getLetter: (position: CellPosition) => string;
}>();

const emit = defineEmits<{
  select: [position: CellPosition];
  keydown: [event: KeyboardEvent];
}>();

const gridRef = ref<HTMLElement>();

const columnCount = computed(() => props.grid[0]?.length ?? 0);

const activeCellKeys = computed(() => {
  return new Set(props.activeCells.map((cell) => `${cell.row}-${cell.col}`));
});

function cellKey(cell: CrosswordCell) {
  return `${cell.row}-${cell.col}`;
}

function isSelected(cell: CrosswordCell) {
  return (
    props.selectedCell?.row === cell.row && props.selectedCell?.col === cell.col
  );
}

function isInActiveClue(cell: CrosswordCell) {
  return activeCellKeys.value.has(cellKey(cell));
}

function focusSelectedCell() {
  if (!props.selectedCell) return;

  const selector =
    `[data-row="${props.selectedCell.row}"]` +
    `[data-col="${props.selectedCell.col}"]`;

  gridRef.value?.querySelector<HTMLButtonElement>(selector)?.focus();
}

watch(
  () => props.selectedCell,
  async () => {
    await nextTick();
    focusSelectedCell();
  }
);
</script>

<template>
  <div
    ref="gridRef"
    class="crossword-grid"
    :style="{
      '--grid-columns': columnCount,
    }"
    role="grid"
    aria-label="Crossword puzzle"
    @keydown="emit('keydown', $event)"
  >
    <template v-for="row in grid" :key="row[0]?.row">
      <button
        v-for="cell in row"
        :key="cellKey(cell)"
        class="crossword-cell"
        :class="{
          'crossword-cell--block': cell.isBlock,
          'crossword-cell--active': isInActiveClue(cell),
          'crossword-cell--selected': isSelected(cell),
        }"
        :data-row="cell.row"
        :data-col="cell.col"
        :disabled="cell.isBlock"
        role="gridcell"
        tabindex="-1"
        :aria-label="
          cell.isBlock
            ? undefined
            : `Row ${cell.row + 1}, column ${cell.col + 1}`
        "
        @click="
          emit('select', {
            row: cell.row,
            col: cell.col,
          })
        "
      >
        <span v-if="cell.number" class="crossword-cell__number">
          {{ cell.number }}
        </span>

        <span class="crossword-cell__letter">
          {{ getLetter(cell) }}
        </span>
      </button>
    </template>
  </div>
</template>

<style scoped>
.crossword-grid {
  display: grid;
  grid-template-columns: repeat(v-bind(columnCount), minmax(0, 1fr));

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
