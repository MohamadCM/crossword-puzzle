# Tech Challenge: Crossword Puzzle

A crossword puzzle visualizer that shows the clues and can be solved.

## Source Code
The complete source code is available on GitHub:

[GitHub Repository](https://github.com/MohamadCM/crossword-puzzle)

## Running and building the project

On Node 23+.

```bash
npm install     # Install the requirements.
npm run dev     # Run the project in development mode, app on http://localhost:5173
npm run build   # Build everything
```

## Implementation Notes

### Tech Stack

- Vue 3
- TypeScript
- Vite (for scaffolding)
- PrimeVue 4 (+ Aura theme and PrimeIcons)

### Project Structure

```text
src/
├── components/
│   ├── CrosswordGrid.vue
│   └── CrosswordClues.vue
├── composables/
│   └── useCrossword.ts
├── data/
│   └── *.json
├── types/
│   └── crossword.ts
├── App.vue
└── main.ts
```
### Puzzle selection

The application starts with a simple puzzle-selection screen. Puzzle data is loaded from JSON files in the data folder, and the puzzle can be switched at any time in the beginning or during a game.

### Design & UX Decisions
Crosswords are naturally suited to keyboard interaction, so keyboard input was treated as a primary interaction. Hence, keyboard base movement is implemented for Arrow keys, TAB, END, Backspace,and HOME, buttons. (Checkout uscrossword.ts to see the implementation).

The currently active clue is highlighted in the clues panel, using a watched property to have a two-way connection with the selected cell.

The responsiveness is mainly implemented by using PrimeVue features, the grid and clues are arranged side-by-side on larger screens and switch to a vertical layout on smaller screens.

## What I Prioritized

Given the time limit, I prioritized the movement and core grid experience rather than making it extra pretty. I wanted the crossword grid to be polished and the keyboard movement to be intuitive for any user, including showing a straightforward connection between the clues and the cells.

I also tried to make the system reusable by having a simple puzzle load and selection, which allows the owner to very easily add new puzzles to the system.

## Suggested improvements

Most importantly, I would have added a way to persist the puzzles in local storage. This could significantly improve the experience for playing multiple puzzles at the same time.

Also adding extra movement animation and hinting on wrong answers could make this project better. 

One more thing is the responsiveness for all devices, since I prioritized keyboard movement, the game may not be as smooth on mobile/touch devices.
