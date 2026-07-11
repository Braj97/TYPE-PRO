/**
 * Types for the Exam Typing application
 */

export enum ExamType {
  SSC_CGL = "SSC_CGL",
  SSC_CHSL = "SSC_CHSL",
  RRB_NTPC = "RRB_NTPC",
  BANK_PO = "BANK_PO",
  CUSTOM = "CUSTOM"
}

export enum Difficulty {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard"
}

export interface ExamPreset {
  id: ExamType;
  name: string;
  duration: number; // in seconds
  requiredWPM: number;
  requiredAccuracy: number;
  description: string;
  allowBackspace: boolean;
  scoringRules: string;
}

export interface TypingSession {
  id: string;
  date: string; // ISO string
  examType: ExamType;
  examName: string;
  difficulty: Difficulty;
  duration: number; // total time in seconds
  timeSpent: number; // time actually spent in seconds
  wpm: number; // Net WPM
  grossWpm: number;
  accuracy: number; // percentage
  keystrokes: number;
  errorsCount: number;
  backspaceCount: number;
  completed: boolean;
  chartData: { time: number; wpm: number; accuracy: number }[];
  characterStats: { [key: string]: { typed: number; errors: number } };
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  examType: ExamType;
  wpm: number;
  accuracy: number;
  rank: number;
  date: string;
  isCurrentUser?: boolean;
}

export interface UserProfile {
  name: string;
  targetWPM: number;
  targetAccuracy: number;
  soundEnabled: boolean;
  hasSeenIntro: boolean;
}
