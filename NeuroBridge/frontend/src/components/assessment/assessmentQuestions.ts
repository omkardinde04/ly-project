export interface AssessmentQuestion {
  id: number;
  type: 'visual' | 'phonological' | 'memory' | 'sequencing' | 'comprehension' | 'confusion' | 'frequency' | 'reading_tracking' | 'object_naming' | 'camera_direction';
  instruction: string;
  example?: string;
  audioInstruction?: string;
  image?: string;
  options: QuestionOption[];
  correctAnswer?: number;
  dimension: 'phonological' | 'visual' | 'workingMemory' | 'processingSpeed' | 'orthographic' | 'executive';
  difficulty: 'easy' | 'medium' | 'hard';
  paragraph?: string | string[];
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

const homeApplianceVariants = [
  {
    imageType: 'chair',
    options: [
      { id: 'a', text: 'Table', weight: 3 },
      { id: 'b', text: 'Chair', weight: 0 },
      { id: 'c', text: 'Spoon', weight: 3 },
      { id: 'd', text: 'Dish', weight: 3 }
    ],
    correctAnswer: 1
  },
  {
    imageType: 'spoon',
    options: [
      { id: 'a', text: 'Fork', weight: 3 },
      { id: 'b', text: 'Knife', weight: 3 },
      { id: 'c', text: 'Spoon', weight: 0 },
      { id: 'd', text: 'Plate', weight: 3 }
    ],
    correctAnswer: 2
  },
  {
    imageType: 'bed',
    options: [
      { id: 'a', text: 'Sofa', weight: 3 },
      { id: 'b', text: 'Desk', weight: 3 },
      { id: 'c', text: 'Chair', weight: 3 },
      { id: 'd', text: 'Bed', weight: 0 }
    ],
    correctAnswer: 3
  },
  {
    imageType: 'clock',
    options: [
      { id: 'a', text: 'Clock', weight: 0 },
      { id: 'b', text: 'Mirror', weight: 3 },
      { id: 'c', text: 'Frame', weight: 3 },
      { id: 'd', text: 'Window', weight: 3 }
    ],
    correctAnswer: 0
  }
];

const selectedAppliance = homeApplianceVariants[Math.floor(Math.random() * homeApplianceVariants.length)];

// Part A: 15 frequency-based self-assessment questions with inline SVG illustrations
export const partAQuestions: AssessmentQuestion[] = [
  {
    id: 2,
    type: 'reading_tracking',
    instruction: "Please read the paragraph aloud. Don't use your mouse pointer to track the words as you read.",
    paragraph: [
      'Dyslexia is not a reflection of intelligence. It is simply a different way that the brain processes language. Many highly successful people are dyslexic.',
      'The quick brown fox jumps over the lazy dog. Reading can be fun when you take your time and practice every day.',
      'Learning to read is a complex process. Everyone learns at their own pace. Do not worry if you read differently than others.',
      'Creativity often comes naturally to dyslexic individuals. They excel at thinking outside the box and solving complex problems.',
      'A positive mindset goes a long way. Challenges in reading do not define your potential to achieve great things in life.'
    ],
    options: [],
    dimension: 'visual',
    difficulty: 'easy',
  },
  {
    id: 3,
    type: 'object_naming',
    instruction: 'Identify the familiar object below as quickly as possible:',
    image: selectedAppliance.imageType,
    options: selectedAppliance.options,
    correctAnswer: selectedAppliance.correctAnswer,
    dimension: 'phonological',
    difficulty: 'medium',
  },
  {
    id: 4,
    type: 'camera_direction',
    instruction: 'When following directions, confirm your left vs right:',
    options: [
      { id: 'correct', text: 'Correct', weight: 0 },
      { id: 'wrong', text: 'Wrong', weight: 3 }
    ],
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

// Part B: Advanced cognitive challenges (kept for future use)
export const partBQuestions: AssessmentQuestion[] = [
  {
    id: 16,
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
    id: 17,
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
    id: 18,
    type: 'sequencing',
    instruction: "Organizing your workflow. What's the correct order?",
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
        // weight 0 (Rarely) = better performance; weight 3 (Most of the time) = more difficulty
        dimensionScores[question.dimension].correct += Math.max(0, 3 - weight);
      } else if (question.type === 'reading_tracking') {
         // for tracking questions, full score for completion in this basic implementation
         dimensionScores[question.dimension].total += 3;
         dimensionScores[question.dimension].correct += 3;
      } else {
        dimensionScores[question.dimension].total += 1;
        if (answer.selectedOption === question.correctAnswer) {
          dimensionScores[question.dimension].correct += 1;
        }
      }
    }
  });

  return {
    phonological: Math.round(
      (dimensionScores.phonological.correct / Math.max(1, dimensionScores.phonological.total)) * 100
    ),
    visual: Math.round(
      (dimensionScores.visual.correct / Math.max(1, dimensionScores.visual.total)) * 100
    ),
    workingMemory: Math.round(
      (dimensionScores.workingMemory.correct / Math.max(1, dimensionScores.workingMemory.total)) * 100
    ),
    processingSpeed: Math.round(
      (dimensionScores.processingSpeed.correct / Math.max(1, dimensionScores.processingSpeed.total)) * 100
    ),
    orthographic: Math.round(
      (dimensionScores.orthographic.correct / Math.max(1, dimensionScores.orthographic.total)) * 100
    ),
    executive: Math.round(
      (dimensionScores.executive.correct / Math.max(1, dimensionScores.executive.total)) * 100
    ),
  };
}
