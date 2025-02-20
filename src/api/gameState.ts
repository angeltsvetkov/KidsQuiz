import { GameState, Question } from '../types';
import { sampleQuestions } from '../data';

class GameStateManager {
  private state: GameState;
  private subscribers: ((state: GameState) => void)[] = [];

  constructor() {
    const firstQuestion = sampleQuestions[0];
    this.state = {
      currentQuestion: firstQuestion ? {
        ...firstQuestion,
        options: [...firstQuestion.options]
      } : null,
      currentPlayerId: 1,
      timeLeft: 0,
    };
  }

  subscribe(callback: (state: GameState) => void) {
    if (typeof callback !== 'function') return () => {};
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notify() {
    const currentState = this.getCurrentState();
    this.subscribers.forEach(callback => callback(currentState));
  }

  getCurrentState(): GameState {
    if (!this.state) {
      throw new Error('Game state not initialized');
    }

    return {
      currentPlayerId: this.state.currentPlayerId,
      timeLeft: this.state.timeLeft,
      currentQuestion: this.state.currentQuestion ? {
        id: this.state.currentQuestion.id,
        text: this.state.currentQuestion.text,
        options: [...this.state.currentQuestion.options],
        correctAnswer: this.state.currentQuestion.correctAnswer
      } : null
    };
  }

  setCurrentQuestion(question: Question) {
    if (!question) {
      throw new Error('Cannot set null question');
    }

    this.state = {
      ...this.state,
      currentQuestion: {
        id: question.id,
        text: question.text,
        options: [...question.options],
        correctAnswer: question.correctAnswer
      }
    };
    this.notify();
  }

  setCurrentPlayer(playerId: number) {
    if (typeof playerId !== 'number' || playerId < 1) {
      throw new Error('Invalid player ID');
    }

    this.state = {
      ...this.state,
      currentPlayerId: playerId
    };
    this.notify();
  }

  setTimeLeft(time: number) {
    if (typeof time !== 'number' || time < 0) {
      throw new Error('Invalid time value');
    }

    this.state = {
      ...this.state,
      timeLeft: time
    };
    this.notify();
  }
}

export const gameState = new GameStateManager();