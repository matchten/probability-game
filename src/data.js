export const SUSPECTS = [
  {
    id: 'voss',
    name: 'Dr. Elena Voss',
    role: 'Museum Curator',
    initial: 'V',
    fileNo: 'HM-001-A',
    detail: 'Keycard: YES  ·  Left at 8:50 PM  ·  No activity recorded after departure',
    guilty: false,
  },
  {
    id: 'webb',
    name: 'Marcus Webb',
    role: 'Head of Security',
    initial: 'W',
    fileNo: 'HM-001-B',
    detail: 'Keycard: YES  ·  On duty 9 PM–5 AM  ·  Vault log entry at 8:55 PM',
    guilty: false,
  },
  {
    id: 'sharma',
    name: 'Priya Sharma',
    role: 'Visiting Scholar',
    initial: 'S',
    fileNo: 'HM-001-C',
    detail: 'Keycard: NO   ·  Signed out at 8:30 PM  ·  First visit to museum',
    guilty: false,
  },
  {
    id: 'doran',
    name: 'Felix Doran',
    role: 'Maintenance Worker',
    initial: 'D',
    fileNo: 'HM-001-D',
    detail: 'Keycard: YES  ·  Stayed after 9 PM  ·  Keycard used near vault at 9:40 PM',
    guilty: true,
  },
];

export const PHASE_LABELS = [
  'Briefing',
  'Suspects',
  'Clue I',
  'Clue II',
  'Clue III',
  'Deduction',
  'Case File',
];

export const CLUES = [
  {
    id: 'clue1',
    title: 'Clue #1 — The Visitor Log',
    standard: 'Conditional Probability · HSS-CP.B.6',
    narrative:
      "Security recovered the museum's visitor log. It records whether each of the 60 visitors present that night had a keycard and whether they stayed after 9:00 PM — when the theft occurred.",
    table: {
      headers: ['', 'Had Keycard', 'No Keycard', 'Total'],
      rows: [
        { label: 'Left before 9 PM', cells: ['8', '27', '35'] },
        { label: 'Stayed after 9 PM', cells: ['12', '13', '25'], highlight: [0] },
        { label: 'Total', cells: ['20', '40', '60'], isTotalsRow: true },
      ],
    },
    parts: [
      {
        id: 'partA',
        question:
          'Part A. What is the probability that a randomly chosen visitor had a keycard AND stayed after 9 PM?',
        options: ['12/60 = 0.20', '12/25 = 0.48', '20/60 ≈ 0.33', '8/60 ≈ 0.13'],
        correct: 0,
      },
      {
        id: 'partB',
        question:
          'Part B. Given that a visitor had a keycard, what is the probability they stayed after 9 PM?',
        options: ['12/60 = 0.20', '12/35 ≈ 0.34', '12/20 = 0.60', '25/60 ≈ 0.42'],
        correct: 2,
      },
    ],
  },
  {
    id: 'clue2',
    title: 'Clue #2 — The Alibis',
    standard: 'Independence · HSS-CP.A.5',
    narrative:
      'Two alibi checks were conducted for suspects. The detective must determine whether confirming one alibi is statistically independent of the other.',
    given: [
      'Event A: Alibi A confirmed (was at the gala)',
      'Event B: Alibi B confirmed (visible on security camera)',
      '',
      'P(A)       = 0.50',
      'P(B)       = 0.40',
      'P(A and B) = 0.20',
    ],
    parts: [
      {
        id: 'partA',
        question: 'Are events A and B independent? Show your reasoning.',
        options: [
          'Yes — P(A ∩ B) = P(A) · P(B), so A and B are independent',
          'No — P(A ∩ B) ≠ P(A) · P(B), so A and B are dependent',
          'Cannot be determined without more information',
          'Yes — because the two events describe different locations',
        ],
        correct: 0,
      },
    ],
  },
  {
    id: 'clue3',
    title: 'Clue #3 — The Probability Profile',
    standard: 'Addition Rule · HSS-CP.B.7',
    narrative:
      'From the physical evidence, the detective builds a probability profile. The following probabilities apply to a suspect randomly selected from those who match the behavioral evidence.',
    given: [
      'P(museum employee)                      = 0.60',
      'P(had prior vault access)               = 0.50',
      'P(employee AND had prior vault access)  = 0.35',
    ],
    parts: [
      {
        id: 'partA',
        question:
          'What is the probability the culprit is a museum employee OR had prior vault access?',
        options: [
          '0.60 + 0.50 = 1.10',
          '0.60 + 0.50 − 0.35 = 0.75',
          '0.60 × 0.50 = 0.30',
          '1 − 0.35 = 0.65',
        ],
        correct: 1,
      },
    ],
  },
];

export const ANSWER_KEY = {
  clue1: { partA: 0, partB: 2 },
  clue2: { partA: 0 },
  clue3: { partA: 1 },
  deduction: { suspect: 'doran' },
};
