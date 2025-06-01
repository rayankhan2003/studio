
// src/lib/mock-questions-db.ts
import { type Subject, Subjects, syllabus, type Chapter, allSubjects } from './syllabus';

export interface MockQuestionDefinition {
  id: string;
  subject: Subject;
  chapter: string;
  text: string;
  options?: string[];
  type: 'single-choice' | 'multiple-choice' | 'fill-in-the-blank' | 'true-false';
  correctAnswer: string | string[];
  explanation?: string; // Optional explanation
}

const sanitizeForId = (name: string) => name.replace(/[^a-zA-Z0-9]/g, ''); // Removes spaces and special characters

const generateQuestionsForChapter = (subject: Subject, chapter: Chapter, numQuestions: number): MockQuestionDefinition[] => {
  const questions: MockQuestionDefinition[] = [];
  for (let i = 1; i <= numQuestions; i++) {
    const questionType = ['single-choice', 'multiple-choice', 'fill-in-the-blank', 'true-false'][i % 4];
    let options: string[] | undefined = undefined;
    let correctAnswer: string | string[];

    switch (questionType) {
      case 'single-choice':
        options = [`Option A for ${subject} ${chapter.name} Q${i}`, `Correct Answer for ${subject} ${chapter.name} Q${i}`, `Option C for ${subject} ${chapter.name} Q${i}`, `Option D for ${subject} ${chapter.name} Q${i}`].sort(() => 0.5 - Math.random());
        correctAnswer = options.find(opt => opt.startsWith("Correct Answer")) || options[1];
        break;
      case 'multiple-choice':
        options = [`Correct Opt W for ${subject} ${chapter.name} Q${i}`, `Correct Opt X for ${subject} ${chapter.name} Q${i}`, `Option Y for ${subject} ${chapter.name} Q${i}`, `Option Z for ${subject} ${chapter.name} Q${i}`, `Option V for ${subject} ${chapter.name} Q${i}`].sort(() => 0.5 - Math.random());
        correctAnswer = options.filter(opt => opt.startsWith("Correct Opt")).slice(0, Math.max(1, Math.floor(Math.random() * 2) + 1)); // 1 or 2 correct
        if (correctAnswer.length === 0 && options.length > 0) correctAnswer = [options[0]]; // Ensure at least one correct if logic fails
        break;
      case 'fill-in-the-blank':
        correctAnswer = `AnswerFor${sanitizeForId(subject)}${sanitizeForId(chapter.name)}Q${i}`;
        break;
      case 'true-false':
      default: // Default to true-false if type somehow unknown
        options = ['True', 'False'];
        correctAnswer = (i % 2 === 0) ? 'True' : 'False';
        break;
    }

    questions.push({
      id: `mq_${subject.slice(0,3)}_${sanitizeForId(chapter.name)}_${i}`, // Changed to use sanitized full chapter name
      subject: subject,
      chapter: chapter.name,
      text: `This is mock question #${i} for the chapter "${chapter.name}" in ${subject}. What is the correct answer?`,
      options: options,
      type: questionType as MockQuestionDefinition['type'],
      correctAnswer: correctAnswer,
      explanation: `This is a mock explanation for question ${i} of ${chapter.name}. The correct answer is what it is because of reasons relevant to ${subject}.`
    });
  }
  return questions;
};

export const mockQuestionsDb: MockQuestionDefinition[] = [];

allSubjects.forEach(subject => {
  const chapters = syllabus[subject];
  chapters.forEach(chapter => {
    // Generate a varying number of questions per chapter (e.g., 5 to 15)
    const numQuestionsPerChapter = Math.floor(Math.random() * 11) + 5; // 5 to 15 questions
    mockQuestionsDb.push(...generateQuestionsForChapter(subject, chapter, numQuestionsPerChapter));
  });
});

// Example of adding a few more specific questions:
mockQuestionsDb.push(
  {
    id: 'bio_cell_custom1',
    subject: Subjects.BIOLOGY,
    chapter: 'Cell Structure & Function',
    text: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Apparatus'],
    type: 'single-choice',
    correctAnswer: 'Mitochondria',
    explanation: 'Mitochondria are responsible for generating most of the cell\'s supply of adenosine triphosphate (ATP), used as a source of chemical energy.'
  },
  {
    id: 'chem_bonds_custom1',
    subject: Subjects.CHEMISTRY,
    chapter: 'Chemical Bonding',
    text: 'Which of the following are types of covalent bonds? (Select all that apply)',
    options: ['Sigma Bond', 'Pi Bond', 'Ionic Bond', 'Metallic Bond'],
    type: 'multiple-choice',
    correctAnswer: ['Sigma Bond', 'Pi Bond'],
    explanation: 'Sigma and Pi bonds are both types of covalent bonds formed by the overlapping of atomic orbitals. Ionic and metallic bonds are different types of chemical bonds.'
  },
  {
    id: 'phys_force_custom1',
    subject: Subjects.PHYSICS,
    chapter: 'Force & Motion',
    text: 'Newton\'s first law is also known as the law of _____.',
    type: 'fill-in-the-blank',
    correctAnswer: 'Inertia',
    explanation: 'Newton\'s first law of motion states that an object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force. This is also known as the law of inertia.'
  },
  {
    id: 'eng_gram_custom1',
    subject: Subjects.ENGLISH,
    chapter: 'Grammar',
    text: 'The statement "The cat sat on the mat" is grammatically correct.',
    options: ['True', 'False'],
    type: 'true-false',
    correctAnswer: 'True',
    explanation: 'This sentence follows standard English subject-verb-object structure and is grammatically correct.'
  }
);
