import { useState, useEffect } from "react";
import { getLeaderboard, getProfile } from "../utils/storage";
import { LeaderboardEntry, ExamType } from "../types";
import { EXAM_PRESETS } from "../data/examTexts";
import { Trophy, Medal, Search, Flame, Award, ShieldAlert, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<ExamType | "ALL">("ALL");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const profile = getProfile();

  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  // Filter entries
  const filteredEntries = leaderboard
    .filter((entry) => {
      if (activeTab !== "ALL" && entry.examType !== activeTab) return false;
      if (searchQuery.trim() !== "") {
        return entry.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      // Sort in descending order of WPM, then accuracy
      if (b.wpm !== a.wpm) return b.wpm - a.wpm;
      return b.accuracy - a.accuracy;
    });

  // Re-rank items specifically for the filtered subset so visual list ranks make sense
  const rankedSubset = filteredEntries.map((entry, idx) => ({
    ...entry,
    visualRank: idx + 1,
  }));

  const topThree = rankedSubset.slice(0, 3);
  const remainingList = rankedSubset.slice(3);

  // Get user's current rank in active category
  const userBestInActive = leaderboard.find(
    (e) => e.isCurrentUser && (activeTab === "ALL" || e.examType === activeTab)
  );

  const getExamBadgeColor = (type: ExamType) => {
    switch (type) {
      case ExamType.SSC_CGL:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case ExamType.SSC_CHSL:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case ExamType.RRB_NTPC:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case ExamType.BANK_PO:
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-750";
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30 shadow-sm">
            <Trophy className="w-4 h-4 mr-0.5 text-amber-500 fill-amber-300/30" />
            1
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-700/20 text-zinc-300 font-bold border border-zinc-700/40 shadow-sm">
            <Medal className="w-4 h-4 mr-0.5 text-zinc-400 fill-zinc-200/20" />
            2
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10 text-orange-400 font-bold border border-orange-500/20 shadow-sm">
            <Medal className="w-4 h-4 mr-0.5 text-orange-500 fill-orange-400/20" />
            3
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800/40 text-zinc-400 font-medium text-sm border border-zinc-700/60">
            {rank}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6" id="leaderboard-root">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d0d0d] p-6 rounded-2xl border border-zinc-800/80">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400 fill-amber-500/10 animate-pulse" />
            Competitive Leaderboard
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            See how your typing skills match up against state-level aspirants and current toppers.
          </p>
        </div>

        {/* User Stats Card */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500/5 to-zinc-900/40 px-4 py-3 rounded-xl border border-emerald-500/20">
          <Award className="w-10 h-10 text-emerald-400" />
          <div>
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest">Your Identity</div>
            <div className="font-bold text-white flex items-center gap-1.5 text-sm">
              {profile.name}
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">
              Target Speed: <span className="font-semibold text-emerald-400">{profile.targetWPM} WPM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl max-w-fit">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "ALL"
              ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
          id="tab-all"
        >
          All Exams
        </button>
        {Object.values(ExamType).map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === type
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
            }`}
            id={`tab-${type}`}
          >
            {EXAM_PRESETS[type].name.split(" ")[0]} {EXAM_PRESETS[type].name.split(" ")[1] || ""}
          </button>
        ))}
      </div>

      {/* Podium Showcase */}
      {topThree.length > 0 && searchQuery === "" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4 pb-2">
          {/* Rank 2 */}
          {topThree[1] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-6 text-center order-2 md:order-1 h-56 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-zinc-600" />
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center font-bold text-zinc-100 text-lg">
                    {topThree[1].name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-zinc-600 text-white rounded-full w-5 h-5 text-[11px] font-bold flex items-center justify-center">
                    2
                  </span>
                </div>
                <h4 className="font-bold text-zinc-200 text-sm truncate max-w-full">
                  {topThree[1].name}
                  {topThree[1].isCurrentUser && <span className="ml-1 text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">You</span>}
                </h4>
                <p className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-zinc-800 mt-1 max-w-full truncate bg-zinc-900 text-zinc-400">
                  {EXAM_PRESETS[topThree[1].examType].name.split(" ")[0]}
                </p>
              </div>

              <div className="bg-zinc-950 rounded-xl py-2 px-3 border border-zinc-850">
                <div className="text-xl font-bold text-zinc-100">{topThree[1].wpm} <span className="text-xs font-normal text-zinc-500">WPM</span></div>
                <div className="text-[10px] text-zinc-400 font-semibold">{topThree[1].accuracy}% Accuracy</div>
              </div>
            </motion.div>
          )}

          {/* Rank 1 (Topper) */}
          {topThree[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-b from-amber-500/5 to-zinc-900/60 rounded-2xl border-2 border-amber-500/30 shadow-md p-6 text-center order-1 md:order-2 h-64 flex flex-col justify-between relative overflow-hidden ring-4 ring-amber-500/5"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 to-yellow-600" />
              <div className="absolute top-2 right-2">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-100/10 animate-spin" style={{ animationDuration: "12s" }} />
              </div>
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center font-bold text-amber-400 text-xl shadow-inner">
                    {topThree[0].name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-amber-400">
                    <Trophy className="w-5 h-5 fill-amber-300/10" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black rounded-full w-6 h-6 text-[12px] font-bold flex items-center justify-center shadow-xs">
                    1
                  </span>
                </div>
                <h4 className="font-extrabold text-amber-300 text-base truncate max-w-full">
                  {topThree[0].name}
                  {topThree[0].isCurrentUser && <span className="ml-1 text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">You</span>}
                </h4>
                <p className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 mt-1 max-w-full truncate bg-amber-500/10 text-amber-400 flex items-center gap-1 justify-center">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-100/10" />
                  {EXAM_PRESETS[topThree[0].examType].name.split(" ")[0]} Champion
                </p>
              </div>

              <div className="bg-amber-500/10 rounded-xl py-2.5 px-3 border border-amber-500/20">
                <div className="text-2xl font-black text-amber-400">{topThree[0].wpm} <span className="text-xs font-normal text-amber-500">WPM</span></div>
                <div className="text-[11px] text-amber-500 font-bold">{topThree[0].accuracy}% Accuracy</div>
              </div>
            </motion.div>
          )}

          {/* Rank 3 */}
          {topThree[2] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-6 text-center order-3 h-48 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-orange-500/60" />
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 border-2 border-orange-400/40 flex items-center justify-center font-bold text-orange-400 text-lg">
                    {topThree[2].name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-orange-500 text-white rounded-full w-5 h-5 text-[11px] font-bold flex items-center justify-center">
                    3
                  </span>
                </div>
                <h4 className="font-bold text-zinc-200 text-sm truncate max-w-full">
                  {topThree[2].name}
                  {topThree[2].isCurrentUser && <span className="ml-1 text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">You</span>}
                </h4>
                <p className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-orange-500/20 mt-1 max-w-full truncate bg-orange-500/5 text-orange-400">
                  {EXAM_PRESETS[topThree[2].examType].name.split(" ")[0]}
                </p>
              </div>

              <div className="bg-orange-500/5 rounded-xl py-2 px-3 border border-orange-500/10">
                <div className="text-xl font-bold text-orange-400">{topThree[2].wpm} <span className="text-xs font-normal text-zinc-500">WPM</span></div>
                <div className="text-[10px] text-orange-400 font-semibold">{topThree[2].accuracy}% Accuracy</div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Motivational Bar / Beat the next target */}
      {topThree.length > 0 && searchQuery === "" && (
        <div className="bg-gradient-to-r from-zinc-900 to-emerald-950/20 border border-zinc-800 rounded-xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-100">
                {userBestInActive ? (
                  <>
                    Your Best: <span className="text-emerald-400">{userBestInActive.wpm} WPM</span> (Rank #{userBestInActive.rank})
                  </>
                ) : (
                  "You haven't submitted a score in this category yet!"
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {userBestInActive && userBestInActive.rank > 1 ? (
                  `You are just ${
                    (rankedSubset.find((e) => e.visualRank === userBestInActive.rank - 1)?.wpm || 0) - userBestInActive.wpm + 1
                  } WPM away from climbing to Rank #${userBestInActive.rank - 1}!`
                ) : userBestInActive?.rank === 1 ? (
                  "Outstanding! You are currently sitting at the absolute top of the leaderboard!"
                ) : (
                  "Take a test right now to set your benchmark and start climbing the local rankings!"
                )}
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-zinc-400 bg-zinc-800/40 border border-zinc-700 py-1 px-2.5 rounded-md">
            Exam Prep Mode Active
          </div>
        </div>
      )}

      {/* Leaderboard Table & Search */}
      <div className="bg-[#0d0d0d] rounded-2xl border border-zinc-800/80 shadow-xs overflow-hidden">
        {/* Search header */}
        <div className="p-4 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/40">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search aspirant by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              id="leaderboard-search"
            />
          </div>
          <div className="text-xs text-zinc-500 font-medium">
            Showing <span className="font-semibold text-zinc-400">{rankedSubset.length}</span> candidates
          </div>
        </div>

        {/* Table representation */}
        {rankedSubset.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldAlert className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium">No candidates found.</p>
            <p className="text-zinc-600 text-xs mt-1">Try modifying your search or exam filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                  <th className="py-3 px-6 text-center w-16">Rank</th>
                  <th className="py-3 px-6">Candidate</th>
                  <th className="py-3 px-6">Exam Target</th>
                  <th className="py-3 px-6 text-center">Net Speed</th>
                  <th className="py-3 px-6 text-center">Accuracy</th>
                  <th className="py-3 px-6 text-right w-28">Submission Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-sm">
                {rankedSubset.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`transition-colors group hover:bg-zinc-900/20 ${
                      entry.isCurrentUser ? "bg-emerald-500/5 hover:bg-emerald-500/10" : ""
                    }`}
                  >
                    <td className="py-3.5 px-6 font-bold text-center">
                      <div className="flex justify-center">{getRankBadge(entry.visualRank)}</div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          entry.isCurrentUser ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-300"
                        }`}>
                          {entry.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                            {entry.name}
                            {entry.isCurrentUser && (
                              <span className="text-[10px] font-extrabold bg-emerald-500 text-black px-2 py-0.5 rounded-full shadow-inner">
                                You
                              </span>
                            )}
                          </div>
                          {entry.isCurrentUser && (
                            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Verified Profile</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getExamBadgeColor(entry.examType)}`}>
                        {EXAM_PRESETS[entry.examType].name.split(" ")[0]} {EXAM_PRESETS[entry.examType].name.split(" ")[1] || ""}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center font-bold text-zinc-200">
                      <span className="text-base font-black text-white">{entry.wpm}</span>{" "}
                      <span className="text-xs text-zinc-500 font-normal">WPM</span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`font-semibold ${entry.accuracy >= 95 ? "text-emerald-400" : "text-amber-400"}`}>
                          {entry.accuracy}%
                        </span>
                        <div className="w-12 h-1.5 bg-zinc-850 rounded-full hidden sm:block overflow-hidden">
                          <div
                            className={`h-full rounded-full ${entry.accuracy >= 95 ? "bg-emerald-500" : "bg-amber-500"}`}
                            style={{ width: `${entry.accuracy}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-right text-zinc-500 font-medium text-xs">
                      {entry.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
