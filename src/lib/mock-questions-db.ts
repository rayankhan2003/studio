
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

/**
 * The user wants to clear the default question bank and upload their own from scratch.
 * The `customQuestionBank` stored in localStorage will be the primary source of questions.
 */
export const mockQuestionsDb: MockQuestionDefinition[] = [];
