import React from 'react';
import { Settings, Volume2, VolumeX } from 'lucide-react';
import { GameConfig } from '../types';

interface GameConfigModalProps {
  config: GameConfig;
  onConfigChange: (config: GameConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function GameConfigModal({ config, onConfigChange, isOpen, onClose }: GameConfigModalProps) {
  if (!isOpen) return null;

  const handleChange = (key: keyof GameConfig, value: number | boolean) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md animate-slideIn">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Настройки на играта</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Интервал между въпросите (секунди)
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={config.questionInterval}
              onChange={(e) => handleChange('questionInterval', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>5s</span>
              <span className="font-medium">{config.questionInterval}s</span>
              <span>30s</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Време за отговор (секунди)
            </label>
            <input
              type="range"
              min="30"
              max="120"
              step="15"
              value={config.answerTime}
              onChange={(e) => handleChange('answerTime', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>30s</span>
              <span className="font-medium">{config.answerTime}s</span>
              <span>120s</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div 
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  config.soundEnabled ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                onClick={() => handleChange('soundEnabled', !config.soundEnabled)}
              >
                <div 
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    config.soundEnabled ? 'left-7' : 'left-1'
                  }`} 
                />
              </div>
              <span className="text-sm font-medium text-gray-700">Звукови ефекти</span>
              {config.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
            </label>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}