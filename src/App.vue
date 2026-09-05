<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import Dialog from 'primevue/dialog';
import Select from 'primevue/select';

import CrosswordGrid from './components/CrosswordGrid.vue';
import CrosswordClues from './components/CrosswordClues.vue';
import { useCrossword } from './composables/useCrossword';
import type { CrosswordJson, CrosswordClue } from './types/crossword';

const puzzleFiles = import.meta.glob('./data/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, CrosswordJson>;

interface PuzzleOption {
  name: string;
  puzzle: CrosswordJson;
}

const puzzles = computed<PuzzleOption[]>(() =>
  Object.values(puzzleFiles)
    .map((puzzle) => ({
      name: puzzle.title,
      puzzle,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
);

const selectedPuzzle = ref<PuzzleOption | null>(null);

const showWinDialog = ref(false);

const {
  grid,
  clues,
  selectedCell,
  direction,
  activeCells,
  activeClue,
  isComplete,
  getLetter,
  handleKeydown,
  selectCell,
  loadPuzzle,
} = useCrossword();

function startPuzzle() {
  if (!selectedPuzzle.value) {
    return;
  }

  showWinDialog.value = false;

  loadPuzzle(selectedPuzzle.value.puzzle);
}

function selectPuzzle(puzzle: PuzzleOption) {
  selectedPuzzle.value = puzzle;
  showWinDialog.value = false;

  loadPuzzle(puzzle.puzzle);
}

function selectClue(clue: CrosswordClue) {
  direction.value = clue.direction;

  selectedCell.value = {
    row: clue.start.row,
    col: clue.start.col,
  };
}

function closeWinDialog() {
  showWinDialog.value = false;
}

watch(isComplete, (complete) => {
  if (complete) {
    showWinDialog.value = true;
  }
});

const hasPuzzle = computed(() => grid.value.length > 0);
</script>

<template>
  <main class="app">
    <section v-if="!hasPuzzle" class="puzzle-selection">
      <h1>Crossword</h1>

      <p>Select a puzzle to begin.</p>

      <Select
        v-model="selectedPuzzle"
        :options="puzzles"
        option-label="name"
        placeholder="Select a puzzle"
        class="puzzle-select"
      />

      <button
        class="start-button"
        :disabled="!selectedPuzzle"
        @click="startPuzzle"
      >
        Start puzzle
      </button>

      <p v-if="puzzles.length === 0" class="empty-message">No puzzles found.</p>
    </section>

    <section v-else class="crossword">
      <header class="crossword__header">
        <div>
          <h1>{{ selectedPuzzle?.name }}</h1>

          <Select
            v-model="selectedPuzzle"
            :options="puzzles"
            option-label="name"
            placeholder="Select a puzzle"
            class="puzzle-select"
            @change="selectPuzzle($event.value)"
          />
        </div>
      </header>

      <div class="crossword__content" @keydown="handleKeydown">
        <CrosswordGrid
          :grid="grid"
          :selected-cell="selectedCell"
          :direction="direction"
          :active-cells="activeCells"
          :get-letter="getLetter"
          @select-cell="selectCell"
        />

        <CrosswordClues
          :clues="clues"
          :direction="direction"
          :active-clue="activeClue"
          @select="selectClue"
        />
      </div>
    </section>

    <Dialog
      v-model:visible="showWinDialog"
      modal
      header="Puzzle Complete!"
      :style="{ width: 'min(90vw, 400px)' }"
    >
      <div class="win-dialog">
        <i class="pi pi-check-circle win-dialog__icon"></i>

        <h2>You win! 🎉</h2>

        <p>
          Congratulations! You completed
          <strong>{{ selectedPuzzle?.name }}</strong
          >.
        </p>

        <button class="start-button" @click="closeWinDialog">Continue</button>
      </div>
    </Dialog>
  </main>
</template>

<style scoped>
.app {
  min-height: 100vh;
  padding: 2rem;
}

.puzzle-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 80vh;
  gap: 1rem;

  text-align: center;
}

.puzzle-selection h1 {
  margin: 0;
}

.puzzle-selection p {
  margin: 0;
}

.puzzle-select {
  width: min(90vw, 300px);
}

.start-button {
  padding: 0.75rem 1.5rem;

  border: 0;
  border-radius: var(--p-border-radius-md);

  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);

  font: inherit;
  cursor: pointer;
}

.start-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-message {
  color: var(--p-text-muted-color);
}

.crossword {
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 2rem;
}

.crossword__header {
  width: min(90vw, 900px);
}

.crossword__header h1 {
  margin: 0 0 1rem;
}

.crossword__content {
  display: flex;
  align-items: flex-start;
  justify-content: center;

  gap: 2rem;

  width: 100%;
  outline: none;
}

.win-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 1rem;

  text-align: center;
}

.win-dialog__icon {
  font-size: 3rem;
  color: var(--p-primary-color);
}

.win-dialog h2 {
  margin: 0;
}

.win-dialog p {
  margin: 0;
}

@media (max-width: 800px) {
  .app {
    padding: 1rem;
  }

  .crossword__content {
    flex-direction: column;
    align-items: center;
  }
}
</style>
