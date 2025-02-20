export interface Player {
  id: number;
  name: string;
  score: number;
  avatar: string;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface GameConfig {
  questionInterval: number; // seconds between questions
  answerTime: number; // seconds to answer each question
  soundEnabled: boolean;
}

export const DEFAULT_CONFIG: GameConfig = {
  questionInterval: 150,
  answerTime: 60,
  soundEnabled: true,
};

export interface GameState {
  currentQuestion: Question | null;
  currentPlayerId: number | null;
  timeLeft: number;
}

// API Types
export interface AnswerRequest {
  playerId: number;
  answer: string;
  questionId: number;
}

export interface AnswerResponse {
  correct: boolean;
  message: string;
  nextPlayer?: {
    id: number;
    name: string;
  };
}