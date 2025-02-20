import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { gameState } from './src/api/gameState';
import { AnswerRequest, AnswerResponse } from './types';
import { players } from './src/data';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    middleware: [
      // CORS middleware
      async (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma');
        
        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }
        
        next();
      },
      // Game state endpoint
      async (req, res, next) => {
        try {
          const url = new URL(req.url!, `http://${req.headers.host}`);
          
          if (url.pathname === '/api/game/state') {
            try {
              const state = gameState.getCurrentState();
              
              // Ensure we always return a valid response object
              const response = {
                currentQuestion: state.currentQuestion,
                currentPlayerId: state.currentPlayerId || null,
                timeLeft: state.timeLeft || 0
              };
              
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              });
              res.end(JSON.stringify(response));
            } catch (error) {
              console.error('Error getting game state:', error);
              // Return a valid response even in error case
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                currentQuestion: null,
                currentPlayerId: null,
                timeLeft: 0
              }));
            }
            return;
          }
          next();
        } catch (error) {
          console.error('Error in game state endpoint:', error);
          // Return a valid response even in error case
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            currentQuestion: null,
            currentPlayerId: null,
            timeLeft: 0
          }));
        }
      },
      // Answer endpoint
      async (req, res, next) => {
        try {
          const url = new URL(req.url!, `http://${req.headers.host}`);
          
          if (url.pathname === '/api/game/answer' && req.method === 'POST') {
            const chunks: Uint8Array[] = [];
            req.on('data', chunk => chunks.push(chunk));
            
            req.on('end', () => {
              try {
                const body = JSON.parse(Buffer.concat(chunks).toString()) as AnswerRequest;
                const state = gameState.getCurrentState();
                
                if (!state.currentQuestion) {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    correct: false,
                    message: 'No active question',
                    nextPlayer: null
                  }));
                  return;
                }

                const response: AnswerResponse = {
                  correct: body.answer === state.currentQuestion.correctAnswer,
                  message: body.answer === state.currentQuestion.correctAnswer 
                    ? 'Correct answer!' 
                    : `Wrong answer. The correct answer was: ${state.currentQuestion.correctAnswer}`,
                };

                const currentPlayerIndex = players.findIndex(p => p.id === body.playerId);
                const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
                
                response.nextPlayer = {
                  id: nextPlayer.id,
                  name: nextPlayer.name
                };

                res.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                  'Pragma': 'no-cache',
                  'Expires': '0'
                });
                res.end(JSON.stringify(response));
              } catch (error) {
                console.error('Error processing answer:', error);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  correct: false,
                  message: 'Invalid request',
                  nextPlayer: null
                }));
              }
            });
            return;
          }
          next();
        } catch (error) {
          console.error('Error in answer endpoint:', error);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            correct: false,
            message: 'Server error',
            nextPlayer: null
          }));
        }
      }
    ]
  }
});