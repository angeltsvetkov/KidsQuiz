import React from 'react';
import { Star, Trophy, ArrowRight } from 'lucide-react';
import { Player } from '../types';

interface ScoreboardProps {
  players: Player[];
  currentPlayerIndex: number;
}

export function Scoreboard({ players, currentPlayerIndex }: ScoreboardProps) {
  // Calculate progress percentage (assuming max score of 10 for demonstration)
  const getProgressPercentage = (score: number) => Math.min((score / 10) * 100, 100);
  
  // Get encouraging message based on score
  const getProgressMessage = (score: number) => {
    if (score >= 8) return "Невероятно постижение!";
    if (score >= 5) return "Страхотен напредък!";
    if (score >= 3) return "Продължавай напред!";
    return "Ти можеш!";
  };

  // Calculate next player index
  const getNextPlayerIndex = (index: number) => (index + 1) % players.length;
  const nextPlayerIndex = getNextPlayerIndex(currentPlayerIndex);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {players.map((player, index) => (
        <div
          key={player.id}
          className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <img
                src={player.avatar}
                alt={player.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-blue-100"
              />
              {player.score > 0 && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                  <Star className="w-4 h-4 text-white" />
                </div>
              )}
              {index === nextPlayerIndex && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 animate-pulse">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{player.name}</h3>
              <p className="text-blue-600 font-medium">
                {getProgressMessage(player.score)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-600">Напредък</span>
              <span className="text-sm font-medium text-blue-600">
                {player.score} точки
              </span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-out"
                style={{ width: `${getProgressPercentage(player.score)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-500">
                  {player.score > 0 
                    ? `${player.score} правилни отговора`
                    : 'Започваме!'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}