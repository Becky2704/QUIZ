
export interface MultipleChoiceQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface ReadingQuestion {
  id: number;
  prompt: string;
  options: string[];
  correctAnswer: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  passage: string;
  questions: ReadingQuestion[];
}

export interface UserAnswers {
  [key: string]: string;
}

// Multiplayer Types
export interface Player {
    id: string;
    name: string;
    isHost: boolean;
    score?: number;
}

export interface Room {
    id: string;
    status: 'waiting' | 'in_progress' | 'finished';
    players: { [id: string]: Player };
    questions: MultipleChoiceQuestion[];
    answers: { [playerId: string]: UserAnswers };
}
