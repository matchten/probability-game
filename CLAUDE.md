# The Hartwell Museum Heist — Game Mechanics Plan

## Overview

A linear, single-player web-based assessment game for high school students covering three
Common Core probability standards: conditional probability (HSS-CP.B.6), independence
(HSS-CP.A.5), and the addition rule (HSS-CP.B.7). Students play the role of a detective
solving a museum theft by working through three evidence-based probability clues, then
making a final deduction. A summary screen is generated at the end for teacher review.

**Stack:** React (or plain HTML/CSS/JS — see note at bottom). No backend required.
All state lives client-side. No authentication.

---

## Screen Flow

```
Intro → Suspects Briefing → Clue #1 → Clue #2 → Clue #3 → Deduction → Summary
  0           1               2          3          4          5           6
```

Phase is stored as an integer (0–6) in state. Navigation is strictly linear — no back
button. The only way to advance is to satisfy the completion condition for each screen
(described below under each phase).

---

## Global State Shape

```js
{
  phase: 0,                    // current screen (0–6)
  studentName: "",             // entered on intro screen

  answers: {
    clue1: {
      partA: null,             // integer index of selected MC option (0–3), or null
      partB: null,             // integer index of selected MC option (0–3), or null
      work:  ""                // free-text textarea
    },
    clue2: {
      partA: null,
      work:  ""
    },
    clue3: {
      partA: null,
      work:  ""
    },
    deduction: {
      suspect:   null,         // string: "voss" | "webb" | "sharma" | "doran" | null
      reasoning: ""            // free-text textarea
    }
  }
}
```

---

## Static Data

### Suspects

```js
const SUSPECTS = [
  {
    id:     "voss",
    name:   "Dr. Elena Voss",
    role:   "Museum Curator",
    detail: "Keycard: YES  ·  Left at 8:50 PM  ·  No activity recorded after departure",
    guilty: false
  },
  {
    id:     "webb",
    name:   "Marcus Webb",
    role:   "Head of Security",
    detail: "Keycard: YES  ·  On duty 9 PM–5 AM  ·  Vault log entry at 8:55 PM",
    guilty: false
  },
  {
    id:     "sharma",
    name:   "Priya Sharma",
    role:   "Visiting Scholar",
    detail: "Keycard: NO   ·  Signed out at 8:30 PM  ·  First visit to museum",
    guilty: false
  },
  {
    id:     "doran",
    name:   "Felix Doran",
    role:   "Maintenance Worker",
    detail: "Keycard: YES  ·  Stayed after 9 PM  ·  Keycard used near vault at 9:40 PM",
    guilty: true
  }
];
```

### Clue Puzzles

```js
const CLUES = [
  {
    id:        "clue1",
    title:     "Clue #1 — The Visitor Log",
    standard:  "Conditional Probability · HSS-CP.B.6",
    narrative: `Security recovered the museum's visitor log. It records whether each of
                the 60 visitors present that night had a keycard and whether they stayed
                after 9:00 PM — when the theft occurred.`,

    // Two-way table data
    table: {
      headers: ["", "Had Keycard", "No Keycard", "Total"],
      rows: [
        { label: "Left before 9 PM",  cells: ["8",  "27", "35"] },
        { label: "Stayed after 9 PM", cells: ["12", "13", "25"] },
        { label: "Total",             cells: ["20", "40", "60"], isTotalsRow: true }
      ]
    },

    parts: [
      {
        id:       "partA",
        stateKey: "partA",
        question: "Part A. What is the probability that a randomly chosen visitor had a keycard AND stayed after 9 PM?",
        options:  ["12/60 = 0.20", "12/25 = 0.48", "20/60 ≈ 0.33", "8/60 ≈ 0.13"],
        correct:  0,   // index into options[]
        explanation: "P(keycard ∩ stayed) = 12/60 = 0.20. Count the intersection cell and divide by total."
      },
      {
        id:       "partB",
        stateKey: "partB",
        question: "Part B. Given that a visitor had a keycard, what is the probability they stayed after 9 PM?",
        options:  ["12/60 = 0.20", "12/35 ≈ 0.34", "12/20 = 0.60", "25/60 ≈ 0.42"],
        correct:  2,
        explanation: "P(stayed | keycard) = 12/20 = 0.60. Restrict the sample space to the 20 keycard holders."
      }
    ],

    // Completion condition: both partA and partB must be non-null
    isComplete: (clueAnswers) => clueAnswers.partA !== null && clueAnswers.partB !== null
  },

  {
    id:        "clue2",
    title:     "Clue #2 — The Alibis",
    standard:  "Independence · HSS-CP.A.5",
    narrative: `Two alibi checks were conducted for suspects. The detective must determine
                whether confirming one alibi is statistically independent of the other.`,

    // Code-block style data display (no table)
    given: [
      "Event A: Alibi A confirmed (was at the gala)",
      "Event B: Alibi B confirmed (visible on security camera)",
      "",
      "P(A)       = 0.50",
      "P(B)       = 0.40",
      "P(A and B) = 0.20"
    ],

    parts: [
      {
        id:       "partA",
        stateKey: "partA",
        question: "Are events A and B independent? Show your reasoning.",
        options: [
          "Yes — P(A ∩ B) = P(A) · P(B), so A and B are independent",
          "No — P(A ∩ B) ≠ P(A) · P(B), so A and B are dependent",
          "Cannot be determined without more information",
          "Yes — because the two events describe different locations"
        ],
        correct: 0,
        explanation: "P(A) · P(B) = 0.50 × 0.40 = 0.20 = P(A ∩ B). The condition holds, so A and B are independent."
      }
    ],

    isComplete: (clueAnswers) => clueAnswers.partA !== null
  },

  {
    id:        "clue3",
    title:     "Clue #3 — The Probability Profile",
    standard:  "Addition Rule · HSS-CP.B.7",
    narrative: `From the physical evidence, the detective builds a probability profile.
                The following probabilities apply to a suspect randomly selected from
                those who match the behavioral evidence.`,

    given: [
      "P(museum employee)                      = 0.60",
      "P(had prior vault access)               = 0.50",
      "P(employee AND had prior vault access)  = 0.35"
    ],

    parts: [
      {
        id:       "partA",
        stateKey: "partA",
        question: "What is the probability the culprit is a museum employee OR had prior vault access?",
        options: [
          "0.60 + 0.50 = 1.10",
          "0.60 + 0.50 − 0.35 = 0.75",
          "0.60 × 0.50 = 0.30",
          "1 − 0.35 = 0.65"
        ],
        correct: 1,
        explanation: "By the Addition Rule: P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = 0.60 + 0.50 − 0.35 = 0.75."
      }
    ],

    isComplete: (clueAnswers) => clueAnswers.partA !== null
  }
];
```

### Answer Key (for Summary screen)

```js
const ANSWER_KEY = {
  clue1: { partA: 0, partB: 2 },
  clue2: { partA: 0 },
  clue3: { partA: 1 },
  deduction: { suspect: "doran" }
};
```

---

## Screen-by-Screen Mechanics

### Phase 0 — Intro

**Renders:** Title, brief case description (see copy below), a text input for student name,
and a "Open Case File" button.

**Completion condition:** `studentName.trim().length > 0`

**Button behavior:** Disabled (visually muted, non-clickable) until condition is met.
On click, advance phase to 1.

**Copy:**
> On the night of March 14th, a 17th-century golden astrolabe valued at $2.4 million was
> stolen from the Hartwell Museum's vault. Four individuals had access to the building that
> evening. As lead detective, you will examine three pieces of evidence using probability to
> identify the culprit. Work through each clue, show your calculations, and make your final
> deduction. Your teacher will review your reasoning.

---

### Phase 1 — Suspects Briefing

**Renders:** Incident summary paragraph, four suspect cards in a 2×2 grid, "Examine Clue #1"
button.

**Suspect cards:** Non-interactive (display only). Show name, role, and detail string.
Do not reveal which suspect is guilty.

**Completion condition:** None — button is always active.

---

### Phase 2 — Clue #1 (Conditional Probability)

**Renders:**
1. Clue narrative paragraph
2. Two-way table (styled, with a totals row)
3. Part A: question text → four MC option buttons → "show your work" textarea
4. Part B: question text → four MC option buttons
5. "Proceed to Clue #2" button

**Multiple choice behavior:**
- Render each option as a `<button>` (not `<input type="radio">`).
- On click, set the corresponding answer index in state (`clue1.partA` or `clue1.partB`).
- Selected option gets a distinct highlighted style (border color, background tint).
- No correctness feedback is shown during play — feedback is deferred to the Summary screen.
- A student may change their selection at any point before advancing.

**Work textarea:** Unvalidated free text. Stored in `clue1.work`. Label: "Show your work."

**Completion condition:** `clue1.partA !== null && clue1.partB !== null`

**Note:** The work textarea does NOT gate advancement — only the MC answers do.

---

### Phase 3 — Clue #2 (Independence)

**Renders:**
1. Clue narrative paragraph
2. Monospace code block displaying the given probabilities
3. Part A: question text → four MC option buttons
4. "Show your work" textarea (`clue2.work`)
5. "Proceed to Clue #3" button

**Completion condition:** `clue2.partA !== null`

---

### Phase 4 — Clue #3 (Addition Rule)

**Renders:**
1. Clue narrative paragraph
2. Monospace code block displaying the given probabilities
3. Part A: question text → four MC option buttons
4. "Show your work" textarea (`clue3.work`)
5. "Make Your Deduction" button

**Completion condition:** `clue3.partA !== null`

---

### Phase 5 — Deduction

**Renders:**
1. Brief instruction paragraph (name the culprit; cite at least one calculation)
2. Four suspect cards — now interactive/selectable
3. "Justify your deduction" textarea (`deduction.reasoning`)
4. "Submit Case File" button

**Suspect card selection:**
- Clicking a card sets `deduction.suspect` to that suspect's `id`.
- Selected card gets a distinct highlighted border.
- Only one card can be selected at a time (selecting another deselects the previous).

**Completion condition:**
`deduction.suspect !== null && deduction.reasoning.trim().length > 15`

The minimum character check discourages students from typing a single word. It does not
validate quality — that is the teacher's job on the Summary screen.

---

### Phase 6 — Summary (Teacher Review)

**Renders:**
1. Header: "Case File Summary — Detective [studentName]"
2. Score card: X/5 correct (all MC questions)
3. Deduction result: correct or incorrect, with correct answer stated if wrong
4. Per-clue breakdown (three sections):
   - Clue title + standard
   - Each MC answer: label, student's choice, correct/incorrect indicator
   - Student's written work in a read-only monospace block (if non-empty)
5. Deduction section:
   - Named suspect, correct/incorrect
   - Student's reasoning in a read-only block
6. "Print for Teacher" button → calls `window.print()`

**Score calculation:**
```js
const score = [
  answers.clue1.partA === ANSWER_KEY.clue1.partA,
  answers.clue1.partB === ANSWER_KEY.clue1.partB,
  answers.clue2.partA === ANSWER_KEY.clue2.partA,
  answers.clue3.partA === ANSWER_KEY.clue3.partA,
  answers.deduction.suspect === ANSWER_KEY.deduction.suspect
];
const total = score.filter(Boolean).length;  // out of 5
```

**Correct/incorrect display:** Green text/indicator for correct, red for incorrect.
Show the student's selected option text alongside the correct answer text if wrong.

**Print behavior:** `window.print()` — no special print stylesheet required, though
adding `@media print { .no-print { display: none; } }` to hide the print button itself
is recommended.

**No restart button.** This is an assessment, not a game to be replayed. If a teacher
wants a student to retake it, they refresh the page.

---

## Progress Indicator

A row of dots/pills at the top of screens 1–6 (not on the Intro screen). One indicator
per phase (6 total). States:

- **Completed** (phase > indicator index): filled gold
- **Current** (phase === indicator index): wider pill, bright gold
- **Upcoming** (phase < indicator index): dim/empty

Implemented with simple conditional styling — no animation library required.

---

## Validation Rules Summary

| Field                  | Gates Advancement | Minimum Requirement                  |
|------------------------|-------------------|--------------------------------------|
| studentName            | Yes               | Non-empty string after trim          |
| clue1.partA            | Yes               | Non-null (any option selected)       |
| clue1.partB            | Yes               | Non-null (any option selected)       |
| clue1.work             | No                | None — optional free text            |
| clue2.partA            | Yes               | Non-null                             |
| clue2.work             | No                | None                                 |
| clue3.partA            | Yes               | Non-null                             |
| clue3.work             | No                | None                                 |
| deduction.suspect      | Yes               | Non-null (a card selected)           |
| deduction.reasoning    | Yes               | > 15 characters after trim          |

---

## What Is Not In Scope

- **No backend / persistence.** State lives in memory. Refreshing the page resets the game.
- **No login or student tracking.** One student per session.
- **No real-time feedback during play.** Correct/incorrect is only shown on the Summary screen.
- **No timer.** This is not a timed assessment.
- **No randomization.** Questions and suspects are fixed — the game is the same every run.
- **No accessibility beyond semantic HTML.** Screen reader support is not a requirement for
  this prototype, but using `<button>` for interactive elements and `<label>` for inputs is
  expected.

---

## Implementation Note

This game has no routing, no API calls, and no complex side effects. A single React
component file with `useState` for the global state shape above is sufficient. Alternatively,
it can be built in plain HTML/CSS/JS with a single `state` object and a `render()` function
that re-draws the active screen. Either approach is appropriate for a classroom prototype.

If React is used: one top-level `<App>` component holding all state, with a sub-component
per phase (`<IntroScreen>`, `<BriefingScreen>`, `<ClueScreen>`, `<DeductionScreen>`,
`<SummaryScreen>`). `<ClueScreen>` is reusable across phases 2–4 — it accepts a clue data
object and the relevant slice of `answers` as props.

Inherit the graphic style already imported from Claude Design.