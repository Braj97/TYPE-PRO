import { useState, useEffect } from "react";
import { TypingSession, UserProfile, ExamType, Difficulty } from "./types";
import { getProfile, getHistory, saveSession } from "./utils/storage";
import { EXAM_PRESETS } from "./data/examTexts";
import PracticeConfig, { SessionConfig } from "./components/PracticeConfig";
import TypingTest from "./components/TypingTest";
import Analytics from "./components/Analytics";
import Leaderboard from "./components/Leaderboard";
import ProfileSettings from "./components/ProfileSettings";
import { Trophy, Award, BarChart2, Flame, Sparkles, BookOpen, Clock, Activity, Keyboard, User, ArrowRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ViewType = "dashboard" | "practice" | "analytics" | "leaderboard" | "profile";

export default function App() {
  const [view, setView] = useState<ViewType>("dashboard");
  const [activeSessionConfig, setActiveSessionConfig] = useState<SessionConfig | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<TypingSession[]>([]);

  // Reload storage resources on startup or after profile modifications
  const reloadData = () => {
    setProfile(getProfile());
    setHistory(getHistory());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleStartPractice = (config: SessionConfig) => {
    setActiveSessionConfig(config);
    setView("practice");
  };

  const handleFinishPractice = (session: TypingSession) => {
    saveSession(session);
    reloadData();
    // After finishing, switch to analytics to see updated progress
    setActiveSessionConfig(null);
    setView("analytics");
  };

  const handleCancelPractice = () => {
    setActiveSessionConfig(null);
    setView("dashboard");
  };

  const handleQuickLaunch = (examType: ExamType) => {
    const preset = EXAM_PRESETS[examType];
    const difficulty = examType === ExamType.BANK_PO ? Difficulty.HARD : Difficulty.MEDIUM;
    handleStartPractice({
      examType,
      difficulty,
      duration: preset.duration,
      allowBackspace: preset.allowBackspace,
      targetWPM: preset.requiredWPM,
      targetAccuracy: preset.requiredAccuracy
    });
  };

  if (!profile) return null;

  // Basic KPI calculations
  const totalTests = history.length;
  const avgWpm = totalTests > 0 ? Math.round(history.reduce((sum, s) => sum + s.wpm, 0) / totalTests) : 0;
  const avgAccuracy = totalTests > 0 ? Math.round(history.reduce((sum, s) => sum + s.accuracy, 0) / totalTests) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 flex flex-col font-sans" id="app-root">
      {/* Dynamic Global Top Header */}
      <header className="bg-[#0d0d0d] border-b border-zinc-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black font-black shadow-sm shadow-emerald-500/20">
              <Keyboard className="w-6 h-6 animate-pulse" style={{ animationDuration: "3s" }} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tighter flex items-center gap-2 uppercase">
                TYPEXAM.PRO
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-sm">Pro</span>
              </h1>
              <p className="text-[11px] text-zinc-500 font-medium">Aspirant Speed & Accuracy Trainer</p>
            </div>
          </div>

          {/* Quick Profile Widget */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("profile")}
              className="flex items-center gap-2 hover:bg-zinc-800/40 border border-zinc-800/50 rounded-xl p-1.5 pr-3 transition-all text-left"
              id="header-profile-btn"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center font-bold text-xs">
                {profile.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-zinc-200 leading-none">{profile.name}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Goal: {profile.targetWPM} WPM</div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Core Layout Grid */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar (or top nav on mobile) */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-4">
          <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-2 block">Menu Navigation</span>
            {[
              { id: "dashboard", label: "Dashboard Hub", icon: Activity },
              { id: "practice", label: "Practice Drills", icon: BookOpen },
              { id: "analytics", label: "Analytics History", icon: BarChart2 },
              { id: "leaderboard", label: "Competitive Ranks", icon: Trophy },
              { id: "profile", label: "Identity Settings", icon: User }
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSessionConfig(null);
                    setView(item.id as ViewType);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    isSelected
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }`}
                  id={`nav-${item.id}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Quick Dashboard Side Statistics card */}
          {view !== "practice" && (
            <div className="bg-gradient-to-b from-[#0d0d0d] to-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 space-y-4 hidden md:block">
              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Candidate Card</span>
                <h3 className="font-extrabold text-white text-sm mt-1">{profile.name}</h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1.5">
                  <span className="text-zinc-400">Total Exercises</span>
                  <span className="font-bold font-mono text-zinc-200">{totalTests}</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1.5">
                  <span className="text-zinc-400">Mean Speed</span>
                  <span className="font-bold text-emerald-400 font-mono">{avgWpm} WPM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Mean Precision</span>
                  <span className="font-bold text-emerald-400 font-mono">{avgAccuracy}%</span>
                </div>
              </div>

              <div className="bg-zinc-800/30 border border-zinc-800/80 p-3 rounded-xl">
                <div className="text-[10px] font-semibold text-zinc-500">TYPING TIER</div>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-emerald-400/10" />
                  {avgWpm < 25 ? "Novice Scribe" : avgWpm < 40 ? "Professional Typist" : avgWpm < 60 ? "Speed Demon" : "Legendary Scribe"}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Dynamic Context Router Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {/* VIEW 1: DASHBOARD HUB */}
              {view === "dashboard" && (
                <div className="space-y-6" id="dashboard-view">
                  {/* Hero Welcoming card */}
                  <div className="bg-gradient-to-r from-zinc-900 to-[#0d0d0d] border border-zinc-800/80 rounded-3xl p-6 md:p-8 text-zinc-300 relative overflow-hidden shadow-md">
                    <div className="absolute -top-10 -right-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl" />
                    <div className="relative space-y-4 max-w-xl">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
                        Target: Government & Banking Exams Preparation
                      </span>
                      <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight text-white">
                        Exceed State-Level Typing Benchmarks Effortlessly
                      </h2>
                      <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                        Prepare effectively for SSC CGL, CHSL, Railways NTPC, and Bank PO tests. Set speed constraints, track errors dynamically, and analyze keystroke accuracy heatmaps.
                      </p>
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => setView("practice")}
                          className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 hover:scale-[1.01]"
                          id="hero-start-btn"
                        >
                          Configure Custom Drills
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setView("leaderboard")}
                          className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 font-bold px-4 py-2.5 rounded-xl text-xs border border-zinc-700 transition-all flex items-center gap-1"
                          id="hero-rankings-btn"
                        >
                          <Trophy className="w-3.5 h-3.5 fill-zinc-800 text-emerald-400" />
                          View Leaderboards
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Standard Quick Launch Presets */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-emerald-500" />
                      1-Click Competitive Exam Launchers
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: ExamType.SSC_CGL, label: "SSC CGL", sub: "15 min exam simulator", req: "27 WPM", acc: "95% Acc" },
                        { id: ExamType.SSC_CHSL, label: "SSC CHSL", sub: "10 min typing sprint", req: "35 WPM", acc: "93% Acc" },
                        { id: ExamType.RRB_NTPC, label: "RRB NTPC", sub: "Backspace Disabled!", req: "30 WPM", acc: "95% Acc" },
                        { id: ExamType.BANK_PO, label: "Bank PO", sub: "Essay descriptive block", req: "40 WPM", acc: "97% Acc" }
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handleQuickLaunch(preset.id)}
                          className="bg-zinc-900/40 border border-zinc-800 hover:border-emerald-500/40 p-4 rounded-2xl text-left hover:shadow-lg transition-all group flex flex-col justify-between h-40"
                          id={`quick-launch-${preset.id}`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-white text-sm group-hover:text-emerald-400 transition-colors">
                                {preset.label}
                              </span>
                              <div className="p-1 bg-zinc-800/50 text-zinc-400 rounded-lg group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                                <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1 block font-medium">
                              {preset.sub}
                            </p>
                          </div>
                          <div className="bg-zinc-850/50 p-2.5 border border-zinc-800/60 rounded-xl flex items-center justify-between text-[10px] font-mono font-bold text-zinc-500 mt-2">
                            <span>Goal: {preset.req}</span>
                            <span>•</span>
                            <span>{preset.acc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Two Column Layout: Brief stats & Recent exercises */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* KPI Widget */}
                    <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between h-56">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          Average Progress Overview
                        </h4>
                        <p className="text-zinc-500 text-[11px] mt-0.5">Summary of all compiled exercises.</p>
                      </div>

                      {totalTests === 0 ? (
                        <div className="py-4 text-center">
                          <p className="text-xs text-zinc-500 font-medium">No tests completed yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 my-2">
                          <div className="p-3 bg-zinc-800/30 border border-zinc-800/60 rounded-xl text-center">
                            <span className="text-[10px] text-zinc-500 font-bold block">AVG SPEED</span>
                            <span className="text-2xl font-black text-emerald-400 block mt-0.5">{avgWpm} WPM</span>
                          </div>
                          <div className="p-3 bg-zinc-800/30 border border-zinc-800/60 rounded-xl text-center">
                            <span className="text-[10px] text-zinc-500 font-bold block">AVG ACCURACY</span>
                            <span className="text-2xl font-black text-emerald-400 block mt-0.5">{avgAccuracy}%</span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setView("analytics")}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        id="kpi-more-analytics"
                      >
                        More Performance Graphs
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Recent Sessions List */}
                    <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between min-h-56">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-zinc-400" />
                          Recent Performance Records
                        </h4>
                        <p className="text-zinc-500 text-[11px] mt-0.5">Past training drills and qualifications.</p>
                      </div>

                      {totalTests === 0 ? (
                        <div className="py-6 text-center text-zinc-500 text-xs">
                          Your completed exercises log will list here.
                        </div>
                      ) : (
                        <div className="divide-y divide-zinc-800 overflow-y-auto max-h-40 mt-3 pr-1 space-y-1">
                          {history.slice(0, 3).map((session) => (
                            <div key={session.id} className="py-2.5 flex items-center justify-between text-xs gap-2">
                              <div>
                                <span className="font-bold text-zinc-200 block">{session.examName}</span>
                                <span className="text-[10px] text-zinc-500 font-medium">
                                  {new Date(session.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <span className="font-bold text-emerald-400 block">{session.wpm} WPM</span>
                                  <span className="text-[10px] text-zinc-500 block">{session.accuracy}% Acc</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  session.wpm >= EXAM_PRESETS[session.examType].requiredWPM && session.accuracy >= EXAM_PRESETS[session.examType].requiredAccuracy
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                }`}>
                                  {session.wpm >= EXAM_PRESETS[session.examType].requiredWPM && session.accuracy >= EXAM_PRESETS[session.examType].requiredAccuracy ? "Qualify" : "Fails"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => setView("analytics")}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-2 self-start"
                        id="recent-history-more"
                      >
                        View Full History Log
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: PRACTICE SESSION LOADER */}
              {view === "practice" && (
                <div id="practice-view">
                  <PracticeConfig onStart={handleStartPractice} />
                </div>
              )}

              {/* VIEW 3: ANALYTICS BOARD */}
              {view === "analytics" && (
                <div id="analytics-view">
                  <Analytics />
                </div>
              )}

              {/* VIEW 4: COMPETITIVE LEADERBOARDS */}
              {view === "leaderboard" && (
                <div id="leaderboard-view">
                  <Leaderboard />
                </div>
              )}

              {/* VIEW 5: USER PROFILE CONFIGS */}
              {view === "profile" && (
                <div id="profile-view">
                  <ProfileSettings onProfileChange={reloadData} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Embedded Practice Session Terminal View Overlay */}
      {activeSessionConfig && view === "practice" && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="max-w-4xl w-full">
            <TypingTest
              config={activeSessionConfig}
              onFinish={handleFinishPractice}
              onCancel={handleCancelPractice}
            />
          </div>
        </div>
      )}

      {/* Visual footer */}
      <footer className="bg-[#0d0d0d] border-t border-zinc-800/50 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-xs text-zinc-500 font-medium">
            Exam Typing Master — Built for State Civil Services, Staff Selection Commission (SSC), & Banking aspirants.
          </p>
          <p className="text-[10px] text-zinc-600">
            © 2026 Competitive Scribe Systems. Standard metric evaluation guidelines simulated.
          </p>
        </div>
      </footer>
    </div>
  );
}
