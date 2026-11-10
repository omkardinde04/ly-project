export type AdaptiveSkill = 'sound' | 'focus' | 'memory' | 'speed';

export interface AdaptiveQuestion {
  id: string;
  skill: AdaptiveSkill;
  prompt: string;
  options: string[];
  answer: number;
  difficulty: number;
}

export interface PublicAdaptiveQuestion {
  prompt: string;
  options: string[];
  difficulty: number;
}

export const PRACTICE_QUESTION_COUNT = 8;
export const BATTLE_QUESTION_COUNT = 8;
export const DEFAULT_ABILITY = 2.5;

export const adaptiveQuestionBank: AdaptiveQuestion[] = [
  { id: 'sound-sun-1', skill: 'sound', prompt: 'Which word starts with the same sound as SUN?', options: ['Moon', 'Sock', 'Tree', 'Fish'], answer: 1, difficulty: 1 },
  { id: 'sound-cat-1', skill: 'sound', prompt: 'Which word ends with the same sound as CAT?', options: ['Cup', 'Map', 'Dog', 'Sun'], answer: 1, difficulty: 1 },
  { id: 'sound-light-1', skill: 'sound', prompt: 'Which word rhymes with LIGHT?', options: ['Late', 'Night', 'Lot', 'Lift'], answer: 1, difficulty: 2 },
  { id: 'sound-bell-1', skill: 'sound', prompt: 'Which word starts with the same sound as BELL?', options: ['Ball', 'Moon', 'Fish', 'Tree'], answer: 0, difficulty: 2 },
  { id: 'sound-day-1', skill: 'sound', prompt: 'Which word rhymes with DAY?', options: ['Die', 'Toy', 'Say', 'Do'], answer: 2, difficulty: 3 },
  { id: 'sound-fish-1', skill: 'sound', prompt: 'Which word starts with the same sound as FISH?', options: ['Fan', 'Goat', 'Ship', 'Tree'], answer: 0, difficulty: 3 },
  { id: 'sound-book-1', skill: 'sound', prompt: 'Which word rhymes with BOOK?', options: ['Back', 'Look', 'Bike', 'Bake'], answer: 1, difficulty: 4 },
  { id: 'sound-star-1', skill: 'sound', prompt: 'Which word starts with the same sound as STAR?', options: ['Stone', 'Car', 'Rain', 'Door'], answer: 0, difficulty: 4 },
  { id: 'sound-ring-1', skill: 'sound', prompt: 'Which word rhymes with RING?', options: ['Rain', 'Sing', 'Run', 'Rock'], answer: 1, difficulty: 2 },
  { id: 'sound-play-1', skill: 'sound', prompt: 'Which word rhymes with PLAY?', options: ['Pie', 'Day', 'Blue', 'Pool'], answer: 1, difficulty: 3 },
  { id: 'sound-m-1', skill: 'sound', prompt: 'Which word begins with the /m/ sound?', options: ['Moon', 'Sun', 'Fish', 'Tree'], answer: 0, difficulty: 1 },
  { id: 'sound-red-1', skill: 'sound', prompt: 'Which word rhymes with RED?', options: ['Bed', 'Rain', 'Cat', 'Sun'], answer: 0, difficulty: 1 },
  { id: 'sound-tree-1', skill: 'sound', prompt: 'Which word starts with the same sound as TREE?', options: ['Treat', 'Cat', 'Ball', 'Moon'], answer: 0, difficulty: 2 },
  { id: 'sound-bell-pair-1', skill: 'sound', prompt: 'Which pair of words both rhyme with BELL?', options: ['Tell, sell', 'Toll, tall', 'Ball, bell', 'Feel, fall'], answer: 0, difficulty: 3 },
  { id: 'sound-book-vowel-1', skill: 'sound', prompt: 'Which word has the same vowel sound as BOOK?', options: ['Look', 'Boot', 'Back', 'Bake'], answer: 0, difficulty: 4 },
  { id: 'sound-coat-1', skill: 'sound', prompt: 'Which word does not rhyme with COAT, BOAT, and GOAT?', options: ['Float', 'Note', 'Throat', 'Boot'], answer: 3, difficulty: 4 },
  { id: 'focus-square-1', skill: 'focus', prompt: 'Which shape has four equal sides?', options: ['Triangle', 'Square', 'Circle', 'Oval'], answer: 1, difficulty: 1 },
  { id: 'focus-letter-1', skill: 'focus', prompt: 'Which letter comes third alphabetically?', options: ['b', 'd', 'p', 'q'], answer: 2, difficulty: 1 },
  { id: 'focus-symbol-1', skill: 'focus', prompt: 'Which symbol is different from the others?', options: ['+', 'x', 'o', '-'], answer: 2, difficulty: 2 },
  { id: 'focus-backwards-1', skill: 'focus', prompt: 'Which word is written backwards?', options: ['TOP', 'SUN', 'RAT', 'GOD'], answer: 3, difficulty: 2 },
  { id: 'focus-pair-1', skill: 'focus', prompt: 'Which pair is exactly the same?', options: ['READ / REED', 'FOCUS / FOCUS', 'BRAIN / BRIAN', 'NOTE / NOT'], answer: 1, difficulty: 3 },
  { id: 'focus-order-1', skill: 'focus', prompt: 'Which sequence is in alphabetical order?', options: ['DOG, CAT, BIRD', 'APPLE, BERRY, CHERRY', 'ZOO, ANT, BEE', 'SUN, MOON, STAR'], answer: 1, difficulty: 3 },
  { id: 'focus-pairs-1', skill: 'focus', prompt: 'Which word contains two or more pairs of repeated letters?', options: ['BOOKKEEPER', 'CAT', 'SUN', 'FISH'], answer: 0, difficulty: 4 },
  { id: 'focus-length-1', skill: 'focus', prompt: 'Which option has the most letters?', options: ['MAP', 'READ', 'UNDERSTAND', 'BOOK'], answer: 2, difficulty: 4 },
  { id: 'focus-identical-1', skill: 'focus', prompt: 'Which pair matches exactly?', options: ['PLAN / PLANE', 'BRIGHT / BRIGHT', 'FORM / FROM', 'TRAIL / TRIAL'], answer: 1, difficulty: 2 },
  { id: 'focus-count-1', skill: 'focus', prompt: 'How many times does the letter A appear in BANANA?', options: ['1', '2', '3', '4'], answer: 2, difficulty: 3 },
  { id: 'focus-shape-1', skill: 'focus', prompt: 'Which shape has no straight sides?', options: ['Circle', 'Square', 'Triangle', 'Rectangle'], answer: 0, difficulty: 1 },
  { id: 'focus-book-count-1', skill: 'focus', prompt: 'How many letters are in the word BOOK?', options: ['3', '4', '5', '6'], answer: 1, difficulty: 1 },
  { id: 'focus-order-break-1', skill: 'focus', prompt: 'Which sequence breaks the increasing order?', options: ['1, 2, 3, 4', '2, 4, 3, 5', '5, 6, 7, 8', '10, 20, 30, 40'], answer: 1, difficulty: 2 },
  { id: 'focus-double-1', skill: 'focus', prompt: 'Which word has two identical letters next to each other?', options: ['TABLE', 'RABBIT', 'STONE', 'CLOUD'], answer: 1, difficulty: 3 },
  { id: 'focus-neuro-1', skill: 'focus', prompt: 'Which option is spelled exactly NEURO?', options: ['NEURO', 'NERUO', 'NEROU', 'NEUOR'], answer: 0, difficulty: 4 },
  { id: 'focus-order-break-2', skill: 'focus', prompt: 'Which number sequence is not increasing?', options: ['2, 4, 6, 8', '1, 3, 2, 4', '5, 6, 7, 8', '10, 20, 30, 40'], answer: 1, difficulty: 4 },
  { id: 'memory-sequence-1', skill: 'memory', prompt: 'Remember: A, 3, B. What came after A?', options: ['B', '3', 'A', '2'], answer: 1, difficulty: 1 },
  { id: 'memory-first-1', skill: 'memory', prompt: 'Remember: red, blue, green. What was first?', options: ['Green', 'Blue', 'Red', 'Yellow'], answer: 2, difficulty: 1 },
  { id: 'memory-number-1', skill: 'memory', prompt: 'What number comes next: 2, 4, 6, ...?', options: ['7', '8', '9', '10'], answer: 1, difficulty: 2 },
  { id: 'memory-letter-1', skill: 'memory', prompt: 'What letter comes before D?', options: ['B', 'C', 'E', 'F'], answer: 1, difficulty: 2 },
  { id: 'memory-order-1', skill: 'memory', prompt: 'Which sequence matches: sun, book, tree?', options: ['sun, tree, book', 'book, sun, tree', 'sun, book, tree', 'tree, book, sun'], answer: 2, difficulty: 3 },
  { id: 'memory-missing-1', skill: 'memory', prompt: 'What is missing: 5, 10, __, 20?', options: ['12', '14', '15', '18'], answer: 2, difficulty: 3 },
  { id: 'memory-pattern-1', skill: 'memory', prompt: 'Which pattern follows A1, B2, C3?', options: ['D4', 'D3', 'E4', 'C4'], answer: 0, difficulty: 4 },
  { id: 'memory-position-1', skill: 'memory', prompt: 'Which came third: first, second, third, fourth?', options: ['First', 'Second', 'Third', 'Fourth'], answer: 2, difficulty: 4 },
  { id: 'memory-reverse-1', skill: 'memory', prompt: 'A list is red, blue, green, yellow. Which color is third?', options: ['Red', 'Blue', 'Green', 'Yellow'], answer: 2, difficulty: 2 },
  { id: 'memory-step-1', skill: 'memory', prompt: 'Follow the pattern: 3, 6, 9. What comes next?', options: ['10', '11', '12', '13'], answer: 2, difficulty: 3 },
  { id: 'memory-position-2', skill: 'memory', prompt: 'Remember: 4, 1, 7, 2. Which number came second?', options: ['4', '1', '7', '2'], answer: 1, difficulty: 1 },
  { id: 'memory-first-2', skill: 'memory', prompt: 'Remember: blue, red, green. Which color came first?', options: ['Blue', 'Red', 'Green', 'Yellow'], answer: 0, difficulty: 1 },
  { id: 'memory-letter-step-1', skill: 'memory', prompt: 'What letter comes next: A, C, E, ...?', options: ['F', 'G', 'H', 'I'], answer: 1, difficulty: 2 },
  { id: 'memory-code-1', skill: 'memory', prompt: 'If A2, B4, C6 follow a pattern, what is the pair for C?', options: ['A2', 'B4', 'C6', 'D8'], answer: 2, difficulty: 3 },
  { id: 'memory-math-steps-1', skill: 'memory', prompt: 'Start at 10, subtract 2, then add 3. What number do you get?', options: ['9', '10', '11', '12'], answer: 2, difficulty: 4 },
  { id: 'memory-alternate-1', skill: 'memory', prompt: 'What number comes next: 1, 4, 2, 5, 3, ...?', options: ['4', '5', '6', '7'], answer: 2, difficulty: 4 },
  { id: 'speed-word-1', skill: 'speed', prompt: 'Which word means moving quickly?', options: ['slow', 'quick', 'steady', 'later'], answer: 1, difficulty: 1 },
  { id: 'speed-number-1', skill: 'speed', prompt: 'Which number is largest?', options: ['3', '8', '5', '1'], answer: 1, difficulty: 1 },
  { id: 'speed-odd-1', skill: 'speed', prompt: 'Which word does not belong?', options: ['Run', 'Walk', 'Jump', 'Blue'], answer: 3, difficulty: 2 },
  { id: 'speed-add-1', skill: 'speed', prompt: 'What is 7 + 5?', options: ['10', '11', '12', '13'], answer: 2, difficulty: 2 },
  { id: 'speed-multiply-1', skill: 'speed', prompt: 'What is 3 × 4?', options: ['7', '10', '12', '14'], answer: 2, difficulty: 3 },
  { id: 'speed-fraction-1', skill: 'speed', prompt: 'Which fraction is greatest?', options: ['1/4', '1/2', '1/8', '1/10'], answer: 1, difficulty: 3 },
  { id: 'speed-subtract-1', skill: 'speed', prompt: 'What is 18 − 9?', options: ['7', '8', '9', '10'], answer: 2, difficulty: 4 },
  { id: 'speed-times-1', skill: 'speed', prompt: 'What is 6 × 7?', options: ['36', '40', '42', '48'], answer: 2, difficulty: 4 },
  { id: 'speed-even-1', skill: 'speed', prompt: 'Which number is even?', options: ['5', '7', '8', '9'], answer: 2, difficulty: 2 },
  { id: 'speed-add-2', skill: 'speed', prompt: 'What is 14 + 6?', options: ['18', '19', '20', '21'], answer: 2, difficulty: 3 },
  { id: 'speed-small-1', skill: 'speed', prompt: 'Which number is smallest?', options: ['2', '7', '5', '9'], answer: 0, difficulty: 1 },
  { id: 'speed-add-3', skill: 'speed', prompt: 'What is 6 + 3?', options: ['8', '9', '10', '11'], answer: 1, difficulty: 1 },
  { id: 'speed-category-1', skill: 'speed', prompt: 'Which option is a color?', options: ['Chair', 'Blue', 'Jump', 'Slowly'], answer: 1, difficulty: 2 },
  { id: 'speed-add-25-17', skill: 'speed', prompt: 'What is 25 + 17?', options: ['40', '41', '42', '43'], answer: 2, difficulty: 3 },
  { id: 'speed-multiply-2', skill: 'speed', prompt: 'What is 9 × 8?', options: ['63', '72', '81', '88'], answer: 1, difficulty: 4 },
  { id: 'speed-subtract-3', skill: 'speed', prompt: 'What is 100 − 37?', options: ['53', '63', '67', '73'], answer: 1, difficulty: 4 },
];

export function updateAbility(ability: number, correct: boolean, difficulty: number): number {
  const expected = 1 / (1 + Math.exp(-(ability - difficulty)));
  const observed = correct ? 1 : 0;
  return Math.max(1, Math.min(4, ability + 0.75 * (observed - expected)));
}

export function selectAdaptiveQuestion(
  skill: AdaptiveSkill,
  ability: number,
  excludedIds: ReadonlySet<string>,
  avoidIds: ReadonlySet<string> = new Set(),
): AdaptiveQuestion {
  const pool = adaptiveQuestionBank.filter(question => question.skill === skill);
  const available = pool.filter(question => !avoidIds.has(question.id));
  const unseen = available.filter(question => !excludedIds.has(question.id));
  const candidates = unseen.length ? unseen : available.length ? available : pool;
  const targetDifficulty = Math.max(1, Math.min(4, Math.round(ability)));
  const nearestDistance = Math.min(...candidates.map(question => Math.abs(question.difficulty - targetDifficulty)));
  const nearest = candidates.filter(question => Math.abs(question.difficulty - targetDifficulty) === nearestDistance);
  return nearest[Math.floor(Math.random() * nearest.length)];
}

export function toPublicQuestion(question: AdaptiveQuestion): PublicAdaptiveQuestion {
  return { prompt: question.prompt, options: question.options, difficulty: question.difficulty };
}
