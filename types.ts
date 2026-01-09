export enum Subject {
  MATH = 'Math',
  SCIENCE = 'Science',
  HISTORY = 'History',
  ENGLISH = 'English',
  CODING = 'Coding',
  GENERAL = 'General'
}

export enum StudyMode {
  HOMEWORK = 'Homework',
  QUIZ = 'Quiz',
  PRESENTATION = 'Presentation',
  CASUAL = 'Casual'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface SubjectConfig {
  id: Subject;
  name: string;
  icon: string;
  color: string;
  description: string;
  systemInstruction: string;
}

export interface Slide {
  title: string;
  content: string; // Bullet points
  imagePrompt: string;
}

export interface PresentationData {
  topic: string;
  slides: Slide[];
  coverImageBase64?: string;
}