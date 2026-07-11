import React, { useState, useEffect } from "react";
import { getProfile, saveProfile, getHistory, clearAllHistory } from "../utils/storage";
import { UserProfile } from "../types";
import { User, Target, Volume2, VolumeX, ShieldAlert, BadgeCheck, RotateCcw, Save } from "lucide-react";

interface ProfileSettingsProps {
  onProfileChange: () => void;
}

export default function ProfileSettings({ onProfileChange }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [targetWPM, setTargetWPM] = useState(40);
  const [targetAccuracy, setTargetAccuracy] = useState(95);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [userStats, setUserStats] = useState({ totalTests: 0, avgWpm: 0, avgAccuracy: 0 });

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    setName(p.name);
    setTargetWPM(p.targetWPM);
    setTargetAccuracy(p.targetAccuracy);
    setSoundEnabled(p.soundEnabled);

    // Compute basic user stats
    const history = getHistory();
    if (history.length > 0) {
      const sumWpm = history.reduce((acc, curr) => acc + curr.wpm, 0);
      const sumAcc = history.reduce((acc, curr) => acc + curr.accuracy, 0);
      setUserStats({
        totalTests: history.length,
        avgWpm: Math.round(sumWpm / history.length),
        avgAccuracy: Math.round(sumAcc / history.length)
      });
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === "") return;

    const updatedProfile: UserProfile = {
      name: name.trim(),
      targetWPM,
      targetAccuracy,
      soundEnabled,
      hasSeenIntro: true
    };

    saveProfile(updatedProfile);
    setSaveSuccess(true);
    onProfileChange();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    clearAllHistory();
    setUserStats({ totalTests: 0, avgWpm: 0, avgAccuracy: 0 });
    setResetConfirm(false);
    onProfileChange();
  };

  const getTierBadge = (wpm: number) => {
    if (wpm === 0) return { label: "Aspirant", color: "bg-zinc-800 text-zinc-400 border-zinc-750" };
    if (wpm < 25) return { label: "Novice Scribe", color: "bg-orange-500/10 text-orange-400 border border-orange-500/20" };
    if (wpm < 40) return { label: "Professional Typist", color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" };
    if (wpm < 60) return { label: "Speed Demon", color: "bg-teal-500/10 text-teal-400 border border-teal-500/20" };
    return { label: "Legendary Scribe", color: "bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold" };
  };

  const badge = getTierBadge(userStats.avgWpm);

  if (!profile) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="profile-settings-root">
      {/* Configuration Form */}
      <div className="md:col-span-2 bg-[#0d0d0d] rounded-2xl border border-zinc-800/80 p-6 shadow-xs">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-4 mb-6">
          <User className="w-5 h-5 text-emerald-400" />
          Aspirant Identity & Audio
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Candidate Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                type="text"
                maxLength={20}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-semibold"
                id="profile-name-input"
              />
            </div>
            <p className="text-[11px] text-zinc-500">
              This name will represent you on the local competitive exam leaderboards.
            </p>
          </div>

          {/* Goal Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Target Speed Goal</label>
              <div className="relative">
                <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={targetWPM}
                  onChange={(e) => setTargetWPM(Math.max(10, parseInt(e.target.value) || 10))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-bold"
                  id="profile-target-wpm"
                />
              </div>
              <p className="text-[11px] text-zinc-500">Your desired target speed (Words Per Minute).</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Min Accuracy Target</label>
              <div className="relative">
                <BadgeCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={targetAccuracy}
                  onChange={(e) => setTargetAccuracy(Math.min(100, Math.max(50, parseInt(e.target.value) || 50)))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-bold"
                  id="profile-target-acc"
                />
              </div>
              <p className="text-[11px] text-zinc-500">Target precision. Standard exams require ≥ 95%.</p>
            </div>
          </div>

          {/* Sound Controls */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Tactile Audio Assistance</label>
            <div className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-emerald-400 animate-bounce" style={{ animationDuration: "3s" }} />
                ) : (
                  <VolumeX className="w-5 h-5 text-zinc-500" />
                )}
                <div>
                  <div className="text-xs font-bold text-zinc-250">Typing Sound Effects</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Plays key clicks & warnings on typo errors.</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  soundEnabled ? "bg-emerald-500" : "bg-zinc-800"
                }`}
                id="toggle-sound"
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    soundEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2 flex items-center gap-4">
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold py-2.5 px-6 rounded-xl shadow-xs transition-all flex items-center gap-2 text-sm"
              id="btn-save-profile"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-bold animate-pulse">
                ✓ Identity details updated successfully!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Stats Summary & Hard Reset */}
      <div className="space-y-6">
        <div className="bg-[#0d0d0d] rounded-2xl border border-zinc-800/80 p-6 shadow-xs text-center space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Candidate Scorecard</h3>

          {/* Badge */}
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-zinc-300 font-bold mb-3 shadow-inner text-xl">
              {name.substring(0, 2).toUpperCase()}
            </div>
            <div className="font-bold text-white text-lg">{name}</div>
            <span className={`inline-block mt-2 px-3 py-1 text-xs font-bold border rounded-full ${badge.color}`}>
              {badge.label}
            </span>
          </div>

          {/* Summary Stats Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-center">
            <div className="p-2">
              <div className="text-lg font-black text-zinc-200">{userStats.totalTests}</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sessions</div>
            </div>
            <div className="p-2 border-x border-zinc-800">
              <div className="text-lg font-black text-emerald-400">{userStats.avgWpm}</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Avg WPM</div>
            </div>
            <div className="p-2">
              <div className="text-lg font-black text-emerald-400">{userStats.avgAccuracy}%</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Avg Acc</div>
            </div>
          </div>
        </div>

        {/* Data Erasure Area */}
        <div className="bg-rose-500/5 border border-rose-500/15 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
            <h4 className="font-bold text-sm">Danger Zone</h4>
          </div>
          <p className="text-xs text-rose-300/80 leading-relaxed">
            Resetting clears your local typing session log and restores default competitive scores. This action cannot be reversed.
          </p>

          {!resetConfirm ? (
            <button
              onClick={() => setResetConfirm(true)}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 pt-1.5 transition-all"
              id="btn-confirm-reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Practice Records
            </button>
          ) : (
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleReset}
                className="bg-rose-650 text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-rose-700 shadow-sm"
                id="btn-confirm-delete"
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setResetConfirm(false)}
                className="text-zinc-400 hover:text-zinc-300 font-bold text-xs"
                id="btn-cancel-delete"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
