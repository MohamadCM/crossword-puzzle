## Crossword Data Format

The `crossword.json` file contains:

- `title` — the crossword title.
- `grid` — an array of strings representing the crossword grid. `#` represents a blocked cell.
- `blocks` — the character used to represent blocked cells (`#`).
- `entries.across` / `entries.down` — the crossword clues. Each entry contains:
  - `number` — clue number.
  - `row` / `column` — starting position (1-indexed).
  - `answer` — the correct answer.
  - `clue` — the clue text.
  - `enumeration` — the answer format, e.g. `(6)` or `(5,2)`.

The `answer` field is provided so that the application can determine when a word or the entire crossword has been correctly completed.