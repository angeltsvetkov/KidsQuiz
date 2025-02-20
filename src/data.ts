import { Player, Question } from './types';

export const players: Player[] = [
  {
    id: 1,
    name: "Самуил",
    score: 0,
    avatar: "sami.png"
  },
  {
    id: 2,
    name: "Кети",
    score: 0,
    avatar: "keti.png"
  },
  {
    id: 3,
    name: "Радост",
    score: 0,
    avatar: "radost.png"
  }
];

export const sampleQuestions: Question[] = [
  {
    id: 1,
    text: "Колко е 7 + 8?",
    options: ["13", "14", "15", "16"],
    correctAnswer: "15"
  },
  {
    id: 2,
    text: "Коя планета е известна като Червената планета?",
    options: ["Венера", "Марс", "Юпитер", "Сатурн"],
    correctAnswer: "Марс"
  },
  {
    id: 3,
    text: "Колко континента има?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "7"
  }
];