<script setup lang="ts">
import CrosswordGrid from '@/components/CrosswordGrid.vue';
import { useCrossword } from '@/composables/useCrossword';
import type { CrosswordClue, CrosswordCell } from '@/types/crossword';

const grid: CrosswordCell[][] = [
  [
    { row: 0, col: 0, number: 1 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
    { row: 0, col: 3, isBlock: true },
  ],
  [
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: 2 },
    { row: 1, col: 3, number: 2 },
  ],
  [
    { row: 2, col: 0, isBlock: true },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
    { row: 2, col: 3 },
  ],
  [
    { row: 3, col: 0, number: 3 },
    { row: 3, col: 1 },
    { row: 3, col: 2 },
    { row: 3, col: 3, isBlock: true },
  ],
];

const {
  selectedCell,
  direction,
  entries,
  getLetter,
  activeClue,
  activeCells,
  selectCell,
  handleKeydown,
} = useCrossword(grid, []);
</script>

<template>
  <main class="crossword">
    <div class="crossword__board">
      <CrosswordGrid
        :grid="grid"
        :selected-cell="selectedCell"
        :direction="direction"
        :active-cells="activeCells"
        :entries="entries"
        :get-letter="getLetter"
        @select="selectCell"
        @keydown="handleKeydown"
      />
    </div>
  </main>
</template>

<style scoped>
.crossword {
  display: grid;
  grid-template-columns: minmax(0, 600px) minmax(240px, 360px);
  gap: 2rem;
  align-items: start;
  justify-content: center;
  padding: 2rem;
}

.crossword__board {
  display: flex;
  justify-content: center;
}

@media (max-width: 800px) {
  .crossword {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .crossword__clues {
    max-width: 600px;
    margin-inline: auto;
  }
}
</style>
