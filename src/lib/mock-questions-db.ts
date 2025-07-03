
import { type Subject, Subjects, syllabus, type Chapter } from './syllabus';
import { CambridgeSubjects, CambridgeLevels, cambridgeSyllabus } from './cambridge-syllabus';

export interface MockQuestionDefinition {
  id: string;
  subject: string;
  chapter: string;
  text: string;
  options?: string[];
  type: 'single-choice' | 'multiple-choice' | 'fill-in-the-blank' | 'true-false';
  correctAnswer: string | string[];
  explanation?: string;
  curriculum: 'MDCAT' | 'O Level' | 'A Level';
}

const sanitizeForId = (name: string) => name.replace(/[^a-zA-Z0-9]/g, '');

const generateMdcatQuestionsForChapter = (subject: Subject, chapter: Chapter, numQuestions: number): MockQuestionDefinition[] => {
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
        correctAnswer = options.filter(opt => opt.startsWith("Correct Opt")).slice(0, Math.max(1, Math.floor(Math.random() * 2) + 1));
        if (correctAnswer.length === 0 && options.length > 0) correctAnswer = [options[0]];
        break;
      case 'fill-in-the-blank':
        correctAnswer = `AnswerFor${sanitizeForId(subject)}${sanitizeForId(chapter.name)}Q${i}`;
        break;
      case 'true-false':
      default:
        options = ['True', 'False'];
        correctAnswer = (i % 2 === 0) ? 'True' : 'False';
        break;
    }

    questions.push({
      id: `mq_mdcat_${subject.slice(0,3)}_${sanitizeForId(chapter.name)}_${i}`,
      subject: subject,
      chapter: chapter.name,
      text: `This is mock MDCAT question #${i} for the chapter "${chapter.name}" in ${subject}. What is the correct answer?`,
      options: options,
      type: questionType as MockQuestionDefinition['type'],
      correctAnswer: correctAnswer,
      explanation: `This is a mock explanation for MDCAT question ${i} of ${chapter.name}.`,
      curriculum: 'MDCAT',
    });
  }
  return questions;
};

const generateCambridgeQuestions = (level: 'O Level' | 'A Level', subject: string, chapter: string, numQuestions: number): MockQuestionDefinition[] => {
    const questions: MockQuestionDefinition[] = [];
    for (let i = 1; i <= numQuestions; i++) {
        questions.push({
            id: `mq_${level.replace(' ','')}_${subject.slice(0,3)}_${sanitizeForId(chapter)}_${i}`,
            subject,
            chapter,
            text: `This is a mock ${level} question #${i} for the chapter "${chapter}" in ${subject}.`,
            options: [`${level} Option A`, `Correct ${level} Answer`, `${level} Option C`],
            type: 'single-choice',
            correctAnswer: `Correct ${level} Answer`,
            explanation: `Mock explanation for ${level} ${subject} - ${chapter} question ${i}.`,
            curriculum: level,
        });
    }
    return questions;
}

export const mockQuestionsDb: MockQuestionDefinition[] = [];

// Generate MDCAT questions
Object.values(Subjects).forEach(subject => {
  syllabus[subject].forEach(chapter => {
    const numQuestionsPerChapter = Math.floor(Math.random() * 11) + 5;
    mockQuestionsDb.push(...generateMdcatQuestionsForChapter(subject, chapter, numQuestionsPerChapter));
  });
});

// Generate Cambridge O Level questions
Object.values(CambridgeSubjects).forEach(subject => {
    cambridgeSyllabus[CambridgeLevels.O_LEVEL][subject].forEach(chapter => {
        mockQuestionsDb.push(...generateCambridgeQuestions('O Level', subject, chapter.name, 5));
    });
});

// Generate Cambridge A Level questions
Object.values(CambridgeSubjects).forEach(subject => {
    cambridgeSyllabus[CambridgeLevels.A_LEVEL][subject].forEach(chapter => {
        mockQuestionsDb.push(...generateCambridgeQuestions('A Level', subject, chapter.name, 5));
    });
});


// Add a few more specific questions
mockQuestionsDb.push(
  {
    id: 'bio_cell_custom1',
    subject: Subjects.BIOLOGY,
    chapter: 'Cell Structure & Function',
    text: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Apparatus'],
    type: 'single-choice',
    correctAnswer: 'Mitochondria',
    explanation: 'Mitochondria are responsible for generating most of the cell\'s supply of adenosine triphosphate (ATP), used as a source of chemical energy.',
    curriculum: 'MDCAT',
  },
  {
    id: 'chem_bonds_custom1',
    subject: Subjects.CHEMISTRY,
    chapter: 'Chemical Bonding',
    text: 'Which of the following are types of covalent bonds? (Select all that apply)',
    options: ['Sigma Bond', 'Pi Bond', 'Ionic Bond', 'Metallic Bond'],
    type: 'multiple-choice',
    correctAnswer: ['Sigma Bond', 'Pi Bond'],
    explanation: 'Sigma and Pi bonds are both types of covalent bonds formed by the overlapping of atomic orbitals.',
    curriculum: 'MDCAT',
  },
   {
    id: 'olevel_phys_kinematics_1',
    subject: CambridgeSubjects.PHYSICS,
    chapter: 'Kinematics',
    text: 'What is the definition of acceleration?',
    options: ['Rate of change of distance', 'Rate of change of velocity', 'Rate of change of displacement', 'Rate of change of speed'],
    type: 'single-choice',
    correctAnswer: 'Rate of change of velocity',
    explanation: 'Acceleration is the vector quantity that is defined as the rate at which an object changes its velocity.',
    curriculum: 'O Level',
  },
  {
    id: 'alevel_bio_molecules_1',
    subject: CambridgeSubjects.BIOLOGY,
    chapter: 'Biological Molecules',
    text: 'Which of these is a polysaccharide?',
    options: ['Glucose', 'Fructose', 'Sucrose', 'Starch'],
    type: 'single-choice',
    correctAnswer: 'Starch',
    explanation: 'Starch is a polysaccharide, which is a large molecule made of many smaller monosaccharide units. Glucose, Fructose and Sucrose are mono- or di-saccharides.',
    curriculum: 'A Level',
  }
);
