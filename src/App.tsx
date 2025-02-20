import React, { useState, useEffect } from 'react';
import { Scoreboard } from './components/Scoreboard';
import { QuestionCard } from './components/QuestionCard';
import { GameConfigModal } from './components/GameConfigModal';
import { players as initialPlayers, sampleQuestions } from './data';
import { Player, Question, GameConfig, DEFAULT_CONFIG } from './types';
import { Brain, Sparkles, Star, ArrowRight, Settings, ExternalLink } from 'lucide-react';
import { gameState } from './api/gameState';

export default function App() {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(sampleQuestions[0]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [countdown, setCountdown] = useState(DEFAULT_CONFIG.questionInterval);
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const unsubscribe = gameState.subscribe((state) => {
      if (state.currentQuestion) {
        setCurrentQuestion(state.currentQuestion);
      }
      if (state.currentPlayerId !== null) {
        const newIndex = players.findIndex(p => p.id === state.currentPlayerId);
        if (newIndex !== -1) {
          setCurrentPlayerIndex(newIndex);
        }
      }
    });

    return () => unsubscribe();
  }, [players]);

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    
    if (!showQuestion) {
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setShowQuestion(true);
            setQuestionIndex((prevIdx) => (prevIdx + 1) % sampleQuestions.length);
            setCurrentPlayerIndex((prevIdx) => (prevIdx + 1) % players.length);
            gameState.setCurrentQuestion(sampleQuestions[(questionIndex + 1) % sampleQuestions.length]);
            gameState.setCurrentPlayer(players[(currentPlayerIndex + 1) % players.length].id);
            return config.questionInterval;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [showQuestion, players.length, config.questionInterval, questionIndex, currentPlayerIndex]);

  useEffect(() => {
    setCurrentQuestion(sampleQuestions[questionIndex]);
    gameState.setCurrentQuestion(sampleQuestions[questionIndex]);
  }, [questionIndex]);

  const handleAnswer = (playerId: number, isCorrect: boolean) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === playerId
          ? { ...player, score: player.score + (isCorrect ? 1 : 0) }
          : player
      )
    );
  };

  const handleNextQuestion = () => {
    setShowQuestion(false);
    setCountdown(config.questionInterval);
  };

  const currentPlayer = players[currentPlayerIndex];
  const nextPlayer = players[(currentPlayerIndex + 1) % players.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 mb-12 shadow-lg">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain className="w-12 h-12 text-blue-600" />
                <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Семейна Викторина!
                </h1>
                <p className="text-gray-600 mt-1">Забавление и знание за цялото семейство</p>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-6 bg-blue-50 rounded-xl p-3 pr-6">
              <div className="relative">
                <img
                src={nextPlayer.avatar}
                alt={nextPlayer.name}
                className="w-16 h-16 rounded-full border-4 border-blue-500 shadow-lg transform hover:scale-105 transition-transform"
                />
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1.5 shadow-lg animate-bounce">
                <Star className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-blue-600 font-medium">Да се готви:</span>
                <span className="text-xl font-bold text-gray-800">{nextPlayer.name}</span>
              </div>
              </div>
            </div>
          </div>
        </div>

        <Scoreboard players={players} currentPlayerIndex={currentPlayerIndex} />
      </div>

      {/* Question Overlay */}
      {showQuestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-5xl w-full animate-slideIn">
            <QuestionCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              onNext={handleNextQuestion}
              players={players}
              selectedPlayerId={currentPlayer.id}
              answerTime={config.answerTime}
              soundEnabled={config.soundEnabled}
            />
          </div>
        </div>
      )}

      <GameConfigModal
        config={config}
        onConfigChange={setConfig}
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
      />
    </div>
  );
}