import React, { useState, useEffect } from 'react';
import { Question, Player } from '../types';
import { HelpCircle, CheckCircle, XCircle, Timer, Star, Trophy } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  onAnswer: (playerId: number, isCorrect: boolean) => void;
  onNext: () => void;
  players: Player[];
  selectedPlayerId: number;
  answerTime: number;
  soundEnabled: boolean;
}

export function QuestionCard({ 
  question, 
  onAnswer, 
  onNext, 
  players, 
  selectedPlayerId,
  answerTime,
  soundEnabled
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(answerTime);
  const [confetti, setConfetti] = useState<{ id: number; color: string; left: string; delay: string }[]>([]);
  const [correctSound] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'));
  const [wrongSound] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3'));

  const letters = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    if (showResult) {
      const timer = setTimeout(() => {
        resetQuestion();
      }, 3000);
      return () => clearTimeout(timer);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResult]);

  const createConfetti = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
    const newConfetti = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`
    }));
    setConfetti(newConfetti);
  };

  const playSound = (isCorrect: boolean) => {
    if (!soundEnabled) return;
    const sound = isCorrect ? correctSound : wrongSound;
    sound.currentTime = 0;
    sound.play().catch(error => console.log('Audio playback failed:', error));
  };

  const handleTimeUp = () => {
    if (!showResult) {
      setShowResult(true);
      playSound(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === question.correctAnswer;
    if (isCorrect) {
      createConfetti();
    }
    playSound(isCorrect);
    onAnswer(selectedPlayerId, isCorrect);
    setShowResult(true);
  };

  const resetQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setConfetti([]);
    onNext();
  };

  const selectedPlayer = players.find(p => p.id === selectedPlayerId)!;

  return (
    <>
      {confetti.length > 0 && (
        <div className="confetti-container">
          {confetti.map(({ id, color, left, delay }) => (
            <div
              key={id}
              className="confetti"
              style={{
                backgroundColor: color,
                left,
                animationDelay: delay
              }}
            />
          ))}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-2xl p-8 w-[90vw] max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <HelpCircle className="w-8 h-8 text-blue-500" />
            <h2 className="text-3xl font-bold">Време за въпрос!</h2>
            <div className="flex items-center gap-3">
              <img
                src={selectedPlayer.avatar}
                alt={selectedPlayer.name}
                className="w-12 h-12 rounded-full border-3 border-blue-500"
              />
              <span className="text-xl font-medium text-blue-600">{selectedPlayer.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full">
            <Timer className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-medium text-blue-600">{timeLeft}s</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-6 text-center">{question.text}</h3>
          <div className="grid grid-cols-2 gap-6">
            {question.options.map((option, index) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`relative p-6 rounded-xl text-center text-lg font-medium transition-all transform hover:scale-[1.02] ${
                  selectedAnswer === option && showResult
                    ? option === question.correctAnswer
                      ? 'bg-green-500 text-white shadow-lg animate-[pulse_0.5s_ease-in-out_infinite]'
                      : 'bg-red-500 text-white shadow-lg'
                    : selectedAnswer === option
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
                }`}
                disabled={showResult}
              >
                <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                  {letters[index]}
                </div>
                <span className="text-2xl block mt-2">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {showResult && (
          <div className="text-center">
            {timeLeft === 0 ? (
              <div className="flex items-center justify-center gap-3 text-yellow-500 text-xl">
                <Timer className="w-8 h-8" />
                <span className="font-semibold">Времето изтече!</span>
              </div>
            ) : selectedAnswer === question.correctAnswer ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-3 text-green-500 text-2xl animate-[bounce_0.5s_ease-in-out_infinite]">
                  <Trophy className="w-10 h-10 text-yellow-400 animate-[sparkle_1s_ease-in-out_infinite]" />
                  <span className="font-bold">Браво! +1 точка</span>
                  <Star className="w-10 h-10 text-yellow-400 animate-[sparkle_1s_ease-in-out_infinite]" />
                </div>
                <p className="text-blue-600 text-lg">Продължавай все така!</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 text-red-500 text-xl">
                <XCircle className="w-8 h-8" />
                <span className="font-semibold">
                  Съжалявам, правилният отговор беше {question.correctAnswer}
                </span>
              </div>
            )}
          </div>
        )}

        {!showResult && (
          <div className="h-16 rounded-xl overflow-hidden relative">
            <div 
              className="absolute inset-0 bg-blue-500 transition-transform duration-1000 ease-linear origin-left"
              style={{ transform: `scaleX(${timeLeft / answerTime})` }}
            />
            {/* <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xl font-medium z-10 drop-shadow-md">
                Кажи буквата на отговора ({timeLeft}s)
              </span>
            </div> */}
          </div>
        )}
      </div>
    </>
  );
}