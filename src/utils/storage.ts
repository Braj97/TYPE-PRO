import { TypingSession, LeaderboardEntry, UserProfile, ExamType } from "../types";

const HISTORY_KEY = "exam_typing_history_v1";
const LEADERBOARD_KEY = "exam_typing_leaderboard_v1";
const PROFILE_KEY = "exam_typing_profile_v1";

const DEFAULT_PROFILE: UserProfile = {
  name: "Candidate_Alpha",
  targetWPM: 40,
  targetAccuracy: 95,
  soundEnabled: true,
  hasSeenIntro: false
};

const SEED_LEADERBOARD: LeaderboardEntry[] = [
  // SSC CGL Seed
  { id: "seed_1", name: "Vikram_CGL", examType: ExamType.SSC_CGL, wpm: 46, accuracy: 98.8, rank: 1, date: "2026-07-01" },
  { id: "seed_2", name: "Ananya_S", examType: ExamType.SSC_CGL, wpm: 42, accuracy: 97.5, rank: 2, date: "2026-07-03" },
  { id: "seed_3", name: "Rajat_Prasad", examType: ExamType.SSC_CGL, wpm: 39, accuracy: 96.2, rank: 3, date: "2026-07-08" },
  { id: "seed_4", name: "Meera_Patel", examType: ExamType.SSC_CGL, wpm: 34, accuracy: 95.8, rank: 4, date: "2026-07-10" },
  { id: "seed_5", name: "Sumit_Singh", examType: ExamType.SSC_CGL, wpm: 29, accuracy: 95.1, rank: 5, date: "2026-07-11" },

  // SSC CHSL Seed
  { id: "seed_6", name: "SpeedyScribe", examType: ExamType.SSC_CHSL, wpm: 58, accuracy: 99.1, rank: 1, date: "2026-07-02" },
  { id: "seed_7", name: "Rohan_CHSL", examType: ExamType.SSC_CHSL, wpm: 52, accuracy: 96.8, rank: 2, date: "2026-07-05" },
  { id: "seed_8", name: "Neha_Gupta", examType: ExamType.SSC_CHSL, wpm: 47, accuracy: 95.5, rank: 3, date: "2026-07-07" },
  { id: "seed_9", name: "Rahul_V", examType: ExamType.SSC_CHSL, wpm: 41, accuracy: 94.2, rank: 4, date: "2026-07-09" },
  { id: "seed_10", name: "Aditi_Mishra", examType: ExamType.SSC_CHSL, wpm: 36, accuracy: 93.9, rank: 5, date: "2026-07-11" },

  // RRB NTPC Seed
  { id: "seed_11", name: "TrainTypist", examType: ExamType.RRB_NTPC, wpm: 50, accuracy: 98.5, rank: 1, date: "2026-07-04" },
  { id: "seed_12", name: "Kavach_Master", examType: ExamType.RRB_NTPC, wpm: 44, accuracy: 97.2, rank: 2, date: "2026-07-06" },
  { id: "seed_13", name: "StationChief", examType: ExamType.RRB_NTPC, wpm: 39, accuracy: 96.1, rank: 3, date: "2026-07-09" },
  { id: "seed_14", name: "Rly_Aspirant", examType: ExamType.RRB_NTPC, wpm: 35, accuracy: 95.4, rank: 4, date: "2026-07-10" },
  { id: "seed_15", name: "Preeti_R", examType: ExamType.RRB_NTPC, wpm: 31, accuracy: 95.0, rank: 5, date: "2026-07-11" },

  // Bank PO Seed
  { id: "seed_16", name: "FinTech_Scribe", examType: ExamType.BANK_PO, wpm: 65, accuracy: 99.4, rank: 1, date: "2026-07-01" },
  { id: "seed_17", name: "SBI_Aspirant", examType: ExamType.BANK_PO, wpm: 58, accuracy: 98.1, rank: 2, date: "2026-07-03" },
  { id: "seed_18", name: "Arjun_Po", examType: ExamType.BANK_PO, wpm: 51, accuracy: 97.5, rank: 3, date: "2026-07-05" },
  { id: "seed_19", name: "Divya_K", examType: ExamType.BANK_PO, wpm: 46, accuracy: 97.0, rank: 4, date: "2026-07-08" },
  { id: "seed_20", name: "Suresh_Banker", examType: ExamType.BANK_PO, wpm: 42, accuracy: 97.2, rank: 5, date: "2026-07-11" },

  // Custom Seed
  { id: "seed_21", name: "TypeNinja", examType: ExamType.CUSTOM, wpm: 104, accuracy: 99.6, rank: 1, date: "2026-06-25" },
  { id: "seed_22", name: "SonicKeys", examType: ExamType.CUSTOM, wpm: 88, accuracy: 98.7, rank: 2, date: "2026-06-30" },
  { id: "seed_23", name: "TactileTactics", examType: ExamType.CUSTOM, wpm: 76, accuracy: 97.9, rank: 3, date: "2026-07-02" },
  { id: "seed_24", name: "KeyBlazer", examType: ExamType.CUSTOM, wpm: 66, accuracy: 97.2, rank: 4, date: "2026-07-05" },
  { id: "seed_25", name: "SlowAndSteady", examType: ExamType.CUSTOM, wpm: 45, accuracy: 99.2, rank: 5, date: "2026-07-10" }
];

export function getHistory(): TypingSession[] {
  const data = localStorage.getItem(HISTORY_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as TypingSession[];
  } catch {
    return [];
  }
}

export function saveSession(session: TypingSession): void {
  const history = getHistory();
  history.unshift(session);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

  // Also submit to leaderboard if it's completed
  if (session.completed) {
    submitToLeaderboard(session);
  }
}

export function getLeaderboard(): LeaderboardEntry[] {
  const data = localStorage.getItem(LEADERBOARD_KEY);
  if (!data) {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(SEED_LEADERBOARD));
    return SEED_LEADERBOARD;
  }
  try {
    return JSON.parse(data) as LeaderboardEntry[];
  } catch {
    return SEED_LEADERBOARD;
  }
}

export function submitToLeaderboard(session: TypingSession): void {
  const profile = getProfile();
  const leaderboard = getLeaderboard();

  // Create new entry
  const newEntry: LeaderboardEntry = {
    id: `user_${Date.now()}`,
    name: profile.name,
    examType: session.examType,
    wpm: session.wpm,
    accuracy: session.accuracy,
    rank: 0, // calculated later
    date: new Date().toISOString().split("T")[0],
    isCurrentUser: true
  };

  // Check if current user already has an entry on this exam type with lower or higher score
  const existingIndex = leaderboard.findIndex(
    (e) => e.name === profile.name && e.examType === session.examType && e.isCurrentUser
  );

  if (existingIndex !== -1) {
    // Only update if WPM is better, or if same WPM but accuracy is better
    const existing = leaderboard[existingIndex];
    if (session.wpm > existing.wpm || (session.wpm === existing.wpm && session.accuracy > existing.accuracy)) {
      leaderboard[existingIndex] = newEntry;
    } else {
      // Don't update since user has a better score already
      return;
    }
  } else {
    leaderboard.push(newEntry);
  }

  // Recalculate ranks grouped by exam type
  const reRankedLeaderboard = reCalculateRanks(leaderboard);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(reRankedLeaderboard));
}

function reCalculateRanks(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  // Group by exam type
  const types = Object.values(ExamType);
  let allReRanked: LeaderboardEntry[] = [];

  types.forEach((type) => {
    const typeEntries = entries.filter((e) => e.examType === type);
    // Sort desc by WPM, then accuracy, then date
    typeEntries.sort((a, b) => {
      if (b.wpm !== a.wpm) return b.wpm - a.wpm;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return b.date.localeCompare(a.date);
    });

    // Assign rank
    typeEntries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    allReRanked = [...allReRanked, ...typeEntries];
  });

  return allReRanked;
}

export function getProfile(): UserProfile {
  const data = localStorage.getItem(PROFILE_KEY);
  if (!data) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(DEFAULT_PROFILE));
    return DEFAULT_PROFILE;
  }
  try {
    return { ...DEFAULT_PROFILE, ...JSON.parse(data) } as UserProfile;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

  // Sync current user's name on existing leaderboard entries
  const leaderboard = getLeaderboard();
  let updated = false;
  const updatedLeaderboard = leaderboard.map((entry) => {
    if (entry.isCurrentUser) {
      updated = true;
      return { ...entry, name: profile.name };
    }
    return entry;
  });

  if (updated) {
    // Re-rank just in case name change conflicts or needs saving
    const reRanked = reCalculateRanks(updatedLeaderboard);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(reRanked));
  }
}

export function getCharacterStatsFromHistory(): { [key: string]: { typed: number; errors: number } } {
  const history = getHistory();
  const merged: { [key: string]: { typed: number; errors: number } } = {};

  history.forEach((session) => {
    if (!session.characterStats) return;
    Object.entries(session.characterStats).forEach(([char, stats]) => {
      if (!merged[char]) {
        merged[char] = { typed: 0, errors: 0 };
      }
      merged[char].typed += stats.typed;
      merged[char].errors += stats.errors;
    });
  });

  return merged;
}

export function clearAllHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
  // Reset leaderboard to seed
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(SEED_LEADERBOARD));
}
