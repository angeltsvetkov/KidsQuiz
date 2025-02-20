import React, { useState, useEffect } from 'react';
import { GameState, AnswerRequest, AnswerResponse } from '../types';
import { Brain, Loader2, RefreshCcw, Clock } from 'lucide-react';

export default function RemoteAnswer() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResponse | null>(null);
  const letters = ['A', 'B', 'C', 'D'];

  const fetchGameState = async () => {
    try {
      setError(null);
      const response = await fetch('/api/game/state', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Don't throw error for no current question, it's a valid state
      setGameState(data);
    } catch (err) {
      setError('Could not connect to the game. Please try again.');
      console.error('Error fetching game state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, 3000);
    return () => clearInterval(interval);
  }, []);

  const submitAnswer = async (answer: string) => {
    if (!gameState?.currentQuestion) return;

    setSelectedAnswer(answer);
    try {
      const request: AnswerRequest = {
        playerId: gameState.currentPlayerId || 1,
        answer,
        questionId: gameState.currentQuestion.id
      };

      const response = await fetch('/api/game/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAnswerResult(result);

      setTimeout(() => {
        setSelectedAnswer(null);
        setAnswerResult(null);
      }, 3000);
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
      console.error('Error submitting answer:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-lg text-blue-600">Loading game state...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md w-full">
          <div className="text-red-600 text-center mb-4">{error}</div>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchGameState();
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Опитай отново</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Дистанционно Отговаряне
            </h1>
          </div>

          {gameState?.currentQuestion ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {gameState.currentQuestion.text}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {gameState.currentQuestion.options.map((option, index) => (
                  <button
                    key={option}
                    onClick={() => submitAnswer(option)}
                    disabled={!!selectedAnswer}
                    className={`relative p-6 rounded-xl text-center transition-all ${
                      selectedAnswer === option
                        ? answerResult?.correct
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
                    }`}
                  >
                    <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                      {letters[index]}
                    </div>
                    <span className="text-2xl block mt-2">{option}</span>
                  </button>
                ))}
              </div>

              {answerResult && (
                <div className={`p-4 rounded-lg text-center ${
                  answerResult.correct 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-red-50 text-red-600'
                }`}>
                  {answerResult.message}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-600">
              <Clock className="w-12 h-12 text-blue-400 animate-pulse mb-4" />
              <p className="text-xl font-medium">Изчакване на следващия въпрос...</p>
              <p className="text-sm text-gray-500 mt-2">Страницата ще се обнови автоматично</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}