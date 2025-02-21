export type Question = {
  id?: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type QuizState = {
  questions: Question[];
  currentQuestionIndex: number;
  correctAnswers: number;
  incorrectAnswers: number;
  finished: boolean;
};