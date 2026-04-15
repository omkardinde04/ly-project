export interface AssessmentQuestion {
  id: number;
  type: 'visual' | 'phonological' | 'memory' | 'sequencing' | 'comprehension' | 'confusion' | 'frequency';
  instruction: string;
  example?: string;
  audioInstruction?: string;
  image: string;
  options: QuestionOption[];
  correctAnswer?: number;
  dimension: 'phonological' | 'visual' | 'workingMemory' | 'processingSpeed' | 'orthographic' | 'executive';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuestionOption {
  id: string;
  text?: string;
  image?: string;
  audio?: string;
  weight?: number;
}

const frequencyOptions: QuestionOption[] = [
  { id: 'a', text: 'Rarely', weight: 0 },
  { id: 'b', text: 'Occasionally', weight: 1 },
  { id: 'c', text: 'Often', weight: 2 },
  { id: 'd', text: 'Most of the time', weight: 3 },
];

// Part A: Indirect Technical Self-Assessment (15 Questions)
export const partAQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    type: 'frequency',
    instruction: 'When reading similar words (cat / cot), how often do you verify which one is written?',
    example: 'cat — cot',
    image: '/assessment/q1-visual-similarity.png',
    options: frequencyOptions,
    dimension: 'visual',
    difficulty: 'easy',
  },
  {
    id: 2,
    type: 'frequency',
    instruction: 'When reading paragraphs, how often do you use a pointer to track the current line?',
    image: '/assessment/q2-line-tracking.png',
    options: frequencyOptions,
    dimension: 'visual',
    difficulty: 'easy',
  },
  {
    id: 3,
    type: 'frequency',
    instruction: 'During conversation, how often do you pause before naming a familiar object?',
    image: '/assessment/q3-object-naming.png',
    options: frequencyOptions,
    dimension: 'phonological',
    difficulty: 'medium',
  },
  {
    id: 4,
    type: 'frequency',
    instruction: 'When following directions, how often do you confirm left vs right?',
    image: '/assessment/q4-direction-processing.png',
    options: frequencyOptions,
    dimension: 'visual',
    difficulty: 'easy',
  },
  {
    id: 5,
    type: 'frequency',
    instruction: 'When viewing maps, how often do you re-check the route?',
    image: '/assessment/q5-map-navigation.png',
    options: frequencyOptions,
    dimension: 'visual',
    difficulty: 'medium',
  },
  {
    id: 6,
    type: 'frequency',
    instruction: 'When reading text, how often do you re-read a sentence?',
    image: '/assessment/q6-sentence-rereading.png',
    options: frequencyOptions,
    dimension: 'executive',
    difficulty: 'medium',
  },
  {
    id: 7,
    type: 'frequency',
    instruction: 'When given multiple steps, how often do you mentally split them?',
    image: '/assessment/q7-multistep-instructions.png',
    options: frequencyOptions,
    dimension: 'workingMemory',
    difficulty: 'medium',
  },
  {
    id: 8,
    type: 'frequency',
    instruction: 'When writing notes, how often do you review for mistakes?',
    image: '/assessment/q8-writing-accuracy.png',
    options: frequencyOptions,
    dimension: 'orthographic',
    difficulty: 'medium',
  },
  {
    id: 9,
    type: 'frequency',
    instruction: 'While speaking, how often do you pause to choose the right word?',
    image: '/assessment/q9-word-retrieval.png',
    options: frequencyOptions,
    dimension: 'phonological',
    difficulty: 'medium',
  },
  {
    id: 10,
    type: 'frequency',
    instruction: 'When solving tasks, how often do you consider more than one solution?',
    image: '/assessment/q10-problem-solving.png',
    options: frequencyOptions,
    dimension: 'executive',
    difficulty: 'hard',
  },
  {
    id: 11,
    type: 'frequency',
    instruction: 'When reading new words, how often do you break them into parts?',
    example: 'e-le-phant',
    image: '/assessment/q11-sound-segmentation.png',
    options: frequencyOptions,
    dimension: 'phonological',
    difficulty: 'hard',
  },
  {
    id: 12,
    type: 'frequency',
    instruction: 'When writing, how often do you rearrange ideas?',
    image: '/assessment/q12-idea-organization.png',
    options: frequencyOptions,
    dimension: 'executive',
    difficulty: 'hard',
  },
  {
    id: 13,
    type: 'frequency',
    instruction: 'When recalling tables, how often do you count instead of remembering?',
    image: '/assessment/q13-multiplication-recall.png',
    options: frequencyOptions,
    dimension: 'workingMemory',
    difficulty: 'hard',
  },
  {
    id: 14,
    type: 'frequency',
    instruction: 'When reciting sequences (A-Z), how often do you check the next letter?',
    image: '/assessment/q14-sequence-recall.png',
    options: frequencyOptions,
    dimension: 'workingMemory',
    difficulty: 'hard',
  },
  {
    id: 15,
    type: 'frequency',
    instruction: 'When reading aloud, how often do you slow down for accuracy?',
    image: '/assessment/q15-reading-aloud.png',
    options: frequencyOptions,
    dimension: 'processingSpeed',
    difficulty: 'hard',
  },
];

// Part B: Next 15 questions - Advanced cognitive challenges
export const partBQuestions: AssessmentQuestion[] = [
  {
    id: 11,
    type: 'memory',
    instruction: 'Quick! Remember this API endpoint: /api/v2/users/auth. What was the FIRST segment after /api/?',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800',
    options: [
      { id: 'a', text: 'v2' },
      { id: 'b', text: 'users' },
      { id: 'c', text: 'auth' },
    ],
    correctAnswer: 0,
    dimension: 'workingMemory',
    difficulty: 'medium',
  },
  {
    id: 12,
    type: 'visual',
    instruction: 'Spot the typo in this error message: "Fiel not found. Chek your path."',
    image: 'https://images.pexels.com/photos/160107/pexels-photo-160107.jpeg?auto=compress&cs=tinysrgb&w=800',
    options: [
      { id: 'a', text: 'Fiel → File' },
      { id: 'b', text: 'Chek → Check' },
      { id: 'c', text: 'Both A and B' },
    ],
    correctAnswer: 2,
    dimension: 'visual',
    difficulty: 'medium',
  },
  {
    id: 13,
    type: 'phonological',
    instruction: 'Podcast host speaking fast: "The new framework uses reactive programming." What word came after "uses"?',
    audioInstruction: 'Audio: "reactive programming"',
    image: 'https://images.pexels.com/photos/3373743/pexels-photo-3373743.jpeg?auto=compress&cs=tinysrgb&w=800',
    options: [
      { id: 'a', text: 'Reactive' },
      { id: 'b', text: 'Relational' },
      { id: 'c', text: 'Recursive' },
    ],
    correctAnswer: 0,
    dimension: 'phonological',
    difficulty: 'medium',
  },
  {
    id: 14,
    type: 'sequencing',
    instruction: 'Organizing your workflow. What\'s the correct order?',
    image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
    options: [
      { id: 'a', text: 'Code → Test → Deploy → Review' },
      { id: 'b', text: 'Code → Review → Test → Deploy' },
      { id: 'c', text: 'Test → Code → Deploy → Review' },
    ],
    correctAnswer: 1,
    dimension: 'executive',
    difficulty: 'medium',
  },
  {
    id: 15,
    type: 'memory',
    instruction: 'Memorize this hex color code for 5 seconds: #4A90E2. What was the THIRD character?',
    image: 'https://images.pexels.com/photos/1762860/pexels-photo-1762860.jpeg?auto=compress&cs=tinysrgb&w=800',
    options: [
      { id: 'a', text: '9' },
      { id: 'b', text: 'A' },
      { id: 'c', text: '0' },
    ],
    correctAnswer: 0,
    dimension: 'workingMemory',
    difficulty: 'medium',
  },
  {
    id: 16,
    type: 'confusion',
    instruction: 'Reading documentation quickly. Which word is the correct technical term?',
    image: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800',
    options: [
      { id: 'a', text: 'Asynchronous' },
      { id: 'b', text: 'Asynchroneous' },
      { id: 'c', text: 'Asynchonous' },
    ],
    correctAnswer: 0,
    dimension: 'phonological',
    difficulty: 'medium',
  },
  {
    id: 17,
    type: 'visual',
    instruction: 'Scanning through a terminal output. Find the line with the ERROR tag:',
    image: 'https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=800',
    options: [
      { id: 'a', text: 'Line 12-15' },
      { id: 'b', text: 'Line 23-26' },
      { id: 'c', text: 'Line 34-37' },
    ],
    correctAnswer: 1,
    dimension: 'visual',
    difficulty: 'medium',
  },
  {
    id: 18,
    type: 'sequencing',
    instruction: 'Git workflow: You made changes, committed them. What comes next?',
    image: 'https://images.pexels.com/photos/9742711/pexels-photo-9742711.jpeg?auto=compress&cs=tinysrgb&w=800',
    options: [
      { id: 'a', text: 'git push origin main' },
      { id: 'b', text: 'git status' },
      { id: 'c', text: 'git init' },
    ],
    correctAnswer: 0,
    dimension: 'executive',
    difficulty: 'medium',
  },
  {
    id: 19,
    type: 'phonological',
    instruction: 'Tech lead says: "We need to refactor the cache layer." How many syllables in "refactor"?',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    options: [
      { id: 'a', text: '2 (re-factor)' },
      { id: 'b', text: '3 (re-fac-tor)' },
      { id: 'c', text: '4 (re-fa-c-tor)' },
    ],
    correctAnswer: 0,
    dimension: 'phonological',
    difficulty: 'medium',
  },
  {
    id: 20,
    type: 'memory',
    instruction: 'Study this JSON for 8 seconds. Which key was NOT present?',
    image: 'https://images.pexels.com/photos/6476587/pexels-photo-6476587.jpeg?auto=compress&cs=tinysrgb&w=800',
    options: [
      { id: 'a', text: 'username' },
      { id: 'b', text: 'email' },
      { id: 'c', text: 'phoneNumber' },
    ],
    correctAnswer: 2,
    dimension: 'workingMemory',
    difficulty: 'hard',
  },
  {
    id: 21,
    type: 'confusion',
    instruction: 'Reading Stack Overflow. Which solution description makes logical sense?',
    image: 'https://images.pexels.com/photos/574073/pexels-photo-574073.jpeg?auto=compress&cs=tinysrgb&w=800',
    options: [
      { id: 'a', text: 'Use async/await to handle the promise' },
      { id: 'b', text: 'Use synchronous code for async operations' },
      { id: 'c', text: 'Delete the database to fix the bug' },
    ],
    correctAnswer: 0,
    dimension: 'executive',
    difficulty: 'hard',
  },
  {
    id: 22,
    type: 'visual',
    instruction: 'Count how many times the letter "i" appears in this function name: "initializeApplication"',
    image: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800',
    options: [
      { id: 'a', text: '3' },
      { id: 'b', text: '4' },
      { id: 'c', text: '5' },
    ],
    correctAnswer: 1,
    dimension: 'visual',
    difficulty: 'hard',
  },
  {
    id: 23,
    type: 'phonological',
    instruction: 'Someone says "I\'m using a NoSQL database." Which word rhymes with "NoSQL"?',
    image: 'https://images.pexels.com/photos/4050349/pexels-photo-4050349.jpeg?auto=compress&cs=tinysrgb&w=800',
    options: [
      { id: 'a', text: 'MySQL' },
      { id: 'b', text: 'PostgreSQL' },
      { id: 'c', text: 'MongoDB' },
    ],
    correctAnswer: 0,
    dimension: 'phonological',
    difficulty: 'hard',
  },
  {
    id: 24,
    type: 'sequencing',
    instruction: 'Rearrange to form a valid instruction: "npm / install / the / dependencies / run / to"',
    image: 'https://images.pexels.com/photos/8611292/pexels-photo-8611292.jpeg?auto=compress&cs=tinysrgb&w=800',
    options: [
      { id: 'a', text: 'Run npm install to the dependencies' },
      { id: 'b', text: 'Run npm install to install the dependencies' },
      { id: 'c', text: 'npm run install to the dependencies' },
    ],
    correctAnswer: 1,
    dimension: 'executive',
    difficulty: 'hard',
  },
  {
    id: 25,
    type: 'comprehension',
    instruction: '"The API returned a 404 status." What does this mean?',
    image: 'https://images.pexels.com/photos/6001397/pexels-photo-6001397.jpeg?auto=compress&cs=tinysrgb&w=800',
    options: [
      { id: 'a', text: 'Server error occurred' },
      { id: 'b', text: 'Resource not found' },
      { id: 'c', text: 'Request was successful' },
    ],
    correctAnswer: 1,
    dimension: 'executive',
    difficulty: 'hard',
  },
];

// Helper function to calculate cognitive dimension scores
export function calculateDimensionScores(
  answers: { questionId: number; selectedOption: number; timeTaken: number }[]
): {
  phonological: number;
  visual: number;
  workingMemory: number;
  processingSpeed: number;
  orthographic: number;
  executive: number;
} {
  const dimensionScores: Record<string, { correct: number; total: number }> = {
    phonological: { correct: 0, total: 0 },
    visual: { correct: 0, total: 0 },
    workingMemory: { correct: 0, total: 0 },
    processingSpeed: { correct: 0, total: 0 },
    orthographic: { correct: 0, total: 0 },
    executive: { correct: 0, total: 0 },
  };

  const allQuestions: AssessmentQuestion[] = [...partAQuestions, ...partBQuestions];

  answers.forEach((answer) => {
    const question = allQuestions.find((q) => q.id === answer.questionId);
    if (question) {
      if (question.type === 'frequency') {
        dimensionScores[question.dimension].total += 3;
        const weight = question.options[answer.selectedOption]?.weight ?? 0;
        // In this dimension mapping, higher correct = better performance (less dyslexia traits)
        // With frequency: weight 0 (Rarely) = good performance (3/3), weight 3 (Most of the time) = bad performance (0/3)
        dimensionScores[question.dimension].correct += Math.max(0, 3 - weight);
      } else {
        dimensionScores[question.dimension].total += 1;
        if (answer.selectedOption === question.correctAnswer) {
          dimensionScores[question.dimension].correct += 1;
        }
      }
    }
  });

  // Calculate percentages
  const result = {
    phonological: Math.round(
      (dimensionScores.phonological.correct / Math.max(1, dimensionScores.phonological.total)) * 100
    ),
    visual: Math.round(
      (dimensionScores.visual.correct / Math.max(1, dimensionScores.visual.total)) * 100
    ),
    workingMemory: Math.round(
      (dimensionScores.workingMemory.correct / Math.max(1, dimensionScores.workingMemory.total)) *
        100
    ),
    processingSpeed: Math.round(
      (dimensionScores.processingSpeed.correct /
        Math.max(1, dimensionScores.processingSpeed.total)) *
        100
    ),
    orthographic: Math.round(
      (dimensionScores.orthographic.correct /
        Math.max(1, dimensionScores.orthographic.total)) *
        100
    ),
    executive: Math.round(
      (dimensionScores.executive.correct / Math.max(1, dimensionScores.executive.total)) * 100
    ),
  };

  return result;
}
