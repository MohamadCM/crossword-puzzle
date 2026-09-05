<script setup lang="ts">
import type { CrosswordClue, Direction } from '@/types/crossword';

defineProps<{
  clues: CrosswordClue[];
  direction: Direction;
  activeClue: CrosswordClue | null;
}>();

const emit = defineEmits<{
  select: [clue: CrosswordClue];
}>();
</script>

<template>
  <section class="clues">
    <div
      v-for="clueDirection in ['across', 'down'] as Direction[]"
      :key="clueDirection"
      class="clues__section"
    >
      <h2 class="clues__heading">
        {{ clueDirection === 'across' ? 'Across' : 'Down' }}
      </h2>

      <button
        v-for="clue in clues.filter((item) => item.direction === clueDirection)"
        :key="`${clue.direction}-${clue.number}`"
        class="clue"
        :class="{
          'clue--active':
            activeClue?.number === clue.number &&
            activeClue?.direction === clue.direction,
        }"
        @click="emit('select', clue)"
      >
        <span class="clue__number">
          {{ clue.number }}
        </span>

        <span>
          {{ clue.clue }}
        </span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.clues {
  display: grid;
  gap: 1.5rem;
}

.clues__section {
  display: grid;
  gap: 0.25rem;
}

.clues__heading {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.clue {
  display: grid;
  grid-template-columns: 2rem 1fr;
  gap: 0.5rem;

  width: 100%;
  padding: 0.5rem;

  border: 0;
  border-radius: var(--p-border-radius-sm);

  background: transparent;
  color: var(--p-surface-500);

  text-align: left;
  cursor: pointer;
}

.clue:hover {
  background: var(--p-surface-100);
}

.clue--active {
  background: var(--p-primary-100);
}

.clue__number {
  font-weight: 600;
}
</style>
