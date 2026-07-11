import { useState, useEffect } from "react";
import { getHistory, getCharacterStatsFromHistory } from "../utils/storage";
import { TypingSession, ExamType } from "../types";
import { EXAM_PRESETS } from "../data/examTexts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, BarChart2, Calendar, Target, ShieldAlert, Award, Clock, ArrowRight } from "lucide-react";

export default function Analytics() {
  const [history, setHistory] = useState<TypingSession[]>([]);
  const [charStats, setCharStats] = useState<{ [key: string]: { typed: number; errors: number } }>({});

  useEffect(() => {
    setHistory(getHistory());
    setCharStats(getCharacterStatsFromHistory());
  }, []);

  if (history.length === 0) {
    return (
      <div className="bg-[#0d0d0d] rounded-2xl border border-zinc-800 p-12 text-center max-w-xl mx-auto space-y-4" id="analytics-empty">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <BarChart2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">No Analytics Available Yet</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Complete at least one practice test session. Once finished, we'll compile detailed speed trends, precision charts, and character weak points for you.
        </p>
      </div>
    );
  }

  // Prep Recharts data (reverse to show chronological order)
  const chartData = [...history]
    .reverse()
    .map((session, idx) => ({
      name: `Test ${idx + 1}`,
      date: session.date.split("T")[0],
      wpm: session.wpm,
      grossWpm: session.grossWpm,
      accuracy: session.accuracy,
      errors: session.errorsCount,
      exam: EXAM_PRESETS[session.examType]?.name.split(" ")[0] || "Custom"
    }));

  // Character accuracy processing
  const characterAccuracyList = Object.entries(charStats)
    .filter(([char]) => char.match(/^[a-zA-Z0-9]$/)) // filter to common letters and digits
    .map(([char, rawStats]) => {
      const stats = rawStats as { typed: number; errors: number };
      const accuracy = stats.typed > 0 ? Math.round(((stats.typed - stats.errors) / stats.typed) * 100) : 100;
      return { char, typed: stats.typed, errors: stats.errors, accuracy };
    })
    .sort((a, b) => a.accuracy - b.accuracy); // lowest accuracy first to show weak letters!

  // Aggregated calculations
  const totalKeystrokes = history.reduce((acc, curr) => acc + curr.keystrokes, 0);
  const totalErrors = history.reduce((acc, curr) => acc + curr.errorsCount, 0);
  const avgWPM = Math.round(history.reduce((acc, curr) => acc + curr.wpm, 0) / history.length);
  const bestWPM = Math.max(...history.map((s) => s.wpm));
  const avgAccuracy = Math.round(history.reduce((acc, curr) => acc + curr.accuracy, 0) / history.length);
  const totalMinutes = Math.round(history.reduce((acc, curr) => acc + curr.timeSpent, 0) / 60);

  const getExamBadgeColor = (type: ExamType) => {
    switch (type) {
      case ExamType.SSC_CGL:
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case ExamType.SSC_CHSL:
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case ExamType.RRB_NTPC:
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case ExamType.BANK_PO:
        return "bg-teal-500/10 text-teal-400 border border-teal-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border border-zinc-750";
    }
  };

  return (
    <div className="space-y-6" id="analytics-root">
      {/* Top Aggregated metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Best Net Speed</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-emerald-400">{bestWPM}</span>
            <span className="text-xs text-zinc-500 font-medium">WPM</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-2 block border-t border-zinc-800/50 pt-2">
            Average: <span className="font-semibold text-zinc-400">{avgWPM} WPM</span>
          </span>
        </div>

        <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Mean Precision</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-emerald-400">{avgAccuracy}%</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-2 block border-t border-zinc-800/50 pt-2">
            Errors/Session: <span className="font-semibold text-zinc-400">{(totalErrors / history.length).toFixed(1)}</span>
          </span>
        </div>

        <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Total Effort</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-white">{totalKeystrokes.toLocaleString()}</span>
            <span className="text-xs text-zinc-500 font-medium">Keys</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-2 block border-t border-zinc-800/50 pt-2">
            Duration: <span className="font-semibold text-zinc-400">{totalMinutes} min total</span>
          </span>
        </div>

        <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Practice Sessions</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-white">{history.length}</span>
            <span className="text-xs text-zinc-500 font-medium">Tests</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-2 block border-t border-zinc-800/50 pt-2">
            Active streak: <span className="font-semibold text-emerald-400">Practicing</span>
          </span>
        </div>
      </div>

      {/* Recharts Graphs Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Speed Progress Graph */}
        <div className="bg-[#0d0d0d] p-5 rounded-2xl border border-zinc-800/80">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mb-4 border-b border-zinc-800 pb-2 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Speed Trajectory (WPM Progress)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", color: "#fff", border: "none" }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  name="Net Speed"
                  stroke="#10b981"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="grossWpm"
                  name="Gross Speed"
                  stroke="#52525b"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Progress Graph */}
        <div className="bg-[#0d0d0d] p-5 rounded-2xl border border-zinc-800/80">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mb-4 border-b border-zinc-800 pb-2 uppercase tracking-wider">
            <Target className="w-4 h-4 text-emerald-400" />
            Accuracy & Error Tolerance Progress
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                <YAxis domain={[70, 100]} stroke="#52525b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", color: "#fff", border: "none" }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  name="Precision %"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAcc)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Character Weak Points Analyzer */}
      {characterAccuracyList.length > 0 && (
        <div className="bg-[#0d0d0d] p-5 rounded-2xl border border-zinc-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-zinc-800 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                Character Accuracy Analyzer (Key Weaknesses)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Keys listed from lowest to highest accuracy. Concentrate on red keys to improve precision.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-800 py-1 px-2.5 rounded-md self-start">
              Analyzed {characterAccuracyList.length} unique keys
            </span>
          </div>

          {/* Grid Layout of keys */}
          <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-3">
            {characterAccuracyList.slice(0, 24).map(({ char, accuracy, typed }) => {
              let colorClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
              if (accuracy < 90) {
                colorClasses = "bg-rose-500/10 text-rose-400 border-rose-500/20 ring-2 ring-rose-500/10";
              } else if (accuracy < 95) {
                colorClasses = "bg-amber-500/10 text-amber-400 border-amber-500/20";
              }

              return (
                <div
                  key={char}
                  className={`border p-2.5 rounded-xl text-center flex flex-col justify-between ${colorClasses}`}
                >
                  <span className="text-base font-black font-mono">
                    {char === " " ? "␣" : char}
                  </span>
                  <div className="text-[10px] font-bold mt-1.5">{accuracy}%</div>
                  <div className="text-[8px] text-zinc-500 mt-0.5 font-semibold font-mono">{typed} presses</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History Log */}
      <div className="bg-[#0d0d0d] rounded-2xl border border-zinc-800/80 overflow-hidden">
        <div className="p-4 bg-zinc-900/40 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-zinc-400" />
            Historical Sessions Activity Log
          </h3>
          <span className="text-xs text-zinc-500 font-medium">Showing past {history.length} tests</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Target Exam</th>
                <th className="py-3 px-6 text-center">Duration</th>
                <th className="py-3 px-6 text-center">WPM Speed</th>
                <th className="py-3 px-6 text-center">Accuracy</th>
                <th className="py-3 px-6 text-center">Mistakes</th>
                <th className="py-3 px-6 text-center">Backspaces</th>
                <th className="py-3 px-6 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-sm text-zinc-300">
              {history.map((session) => {
                const isPassed = session.wpm >= EXAM_PRESETS[session.examType].requiredWPM && session.accuracy >= EXAM_PRESETS[session.examType].requiredAccuracy;
                const formattedDate = new Date(session.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr key={session.id} className="hover:bg-zinc-900/30">
                    <td className="py-3.5 px-6 font-medium text-zinc-200 text-xs whitespace-nowrap">
                      {formattedDate}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${getExamBadgeColor(session.examType)}`}>
                        {session.examName}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center text-xs font-semibold text-zinc-500">
                      {Math.floor(session.timeSpent / 60)}m {session.timeSpent % 60}s
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <div className="font-bold text-zinc-200">
                        {session.wpm} <span className="text-[10px] text-zinc-500 font-normal">net</span>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {session.grossWpm} gross
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-center font-bold">
                      <span className={session.accuracy >= 95 ? "text-emerald-400" : "text-amber-400"}>
                        {session.accuracy}%
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center text-zinc-400 font-medium">
                      {session.errorsCount}
                    </td>
                    <td className="py-3.5 px-6 text-center text-zinc-500 font-mono text-xs">
                      {session.backspaceCount}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {session.examType === ExamType.CUSTOM ? (
                        <span className="text-xs font-bold text-zinc-400 bg-zinc-800 py-0.5 px-2.5 rounded-full border border-zinc-700">
                          Practice Done
                        </span>
                      ) : isPassed ? (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-0.5 px-2.5 rounded-full">
                          Qualified
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 py-0.5 px-2.5 rounded-full">
                          Unqualified
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
