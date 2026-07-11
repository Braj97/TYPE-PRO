import { useState, useEffect } from "react";
import { ExamType, Difficulty } from "../types";
import { EXAM_PRESETS } from "../data/examTexts";
import { Play, Settings, AlertTriangle, ShieldCheck, CheckCircle2, Clock, HelpCircle } from "lucide-react";

export interface SessionConfig {
  examType: ExamType;
  difficulty: Difficulty;
  duration: number; // seconds
  allowBackspace: boolean;
  targetWPM: number;
  targetAccuracy: number;
}

interface PracticeConfigProps {
  onStart: (config: SessionConfig) => void;
}

export default function PracticeConfig({ onStart }: PracticeConfigProps) {
  const [examType, setExamType] = useState<ExamType>(ExamType.SSC_CGL);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [duration, setDuration] = useState<number>(900); // 15 mins default for CGL
  const [allowBackspace, setAllowBackspace] = useState<boolean>(true);
  const [targetWPM, setTargetWPM] = useState<number>(27);
  const [targetAccuracy, setTargetAccuracy] = useState<number>(95);

  // Sync settings when exam type changes
  useEffect(() => {
    const preset = EXAM_PRESETS[examType];
    if (preset) {
      setDuration(preset.duration);
      setAllowBackspace(preset.allowBackspace);
      setTargetWPM(preset.requiredWPM);
      setTargetAccuracy(preset.requiredAccuracy);

      // Adjust default difficulty based on exam
      if (examType === ExamType.BANK_PO) {
        setDifficulty(Difficulty.HARD);
      } else {
        setDifficulty(Difficulty.MEDIUM);
      }
    }
  }, [examType]);

  const handleStart = () => {
    onStart({
      examType,
      difficulty,
      duration,
      allowBackspace,
      targetWPM,
      targetAccuracy,
    });
  };

  const getExamDurationLabel = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="practice-config-root">
      {/* Left 2 Columns: Config Controls */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#0d0d0d] rounded-2xl border border-zinc-800/80 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-400" />
              Configure Practice Session
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Select an official exam template or customize your parameters for specific skill development.
            </p>
          </div>

          {/* Exam Type Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">1. Target Exam Track</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(EXAM_PRESETS).map(([key, value]) => {
                const isSelected = examType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setExamType(key as ExamType)}
                    className={`p-4 text-left rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/10"
                        : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850/30"
                    }`}
                    id={`btn-config-${key}`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-sm ${isSelected ? "text-emerald-400" : "text-zinc-200"}`}>
                          {value.name.split(" (")[0]}
                        </span>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-3 pt-2 border-t border-zinc-800/60 w-full text-[10px] font-mono text-zinc-500">
                      <span>Goal: {value.requiredWPM} WPM</span>
                      <span>•</span>
                      <span>Acc: {value.requiredAccuracy}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Difficulty Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">2. Text Vocabulary Complexity</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(Difficulty).map((diff) => {
                  const isSelected = difficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500 text-black shadow-xs font-bold"
                          : "border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                      }`}
                      id={`btn-difficulty-${diff}`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {difficulty === Difficulty.EASY && "Easy: Simple short words, basic prose, entirely lowercase."}
                {difficulty === Difficulty.MEDIUM && "Medium: Official prose, capital letters, basic punctuation."}
                {difficulty === Difficulty.HARD && "Hard: Alphanumeric characters, symbols, numbers, complex finance terms."}
              </p>
            </div>

            {/* Test Duration */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">3. Practice Timer Limit</label>
              {examType === ExamType.CUSTOM ? (
                <div className="grid grid-cols-4 gap-2">
                  {[60, 120, 300, 600].map((sec) => {
                    const isSelected = duration === sec;
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setDuration(sec)}
                        className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all text-center ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-500 text-black shadow-xs"
                            : "border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                        }`}
                        id={`btn-duration-${sec}`}
                      >
                        {sec / 60}m
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 py-2 px-3.5 rounded-lg text-zinc-300 text-xs font-mono">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  Exam Prescribed Duration: <span className="font-bold text-emerald-400">{getExamDurationLabel(duration)}</span>
                </div>
              )}
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Official exam sessions use rigid standard duration schedules.
              </p>
            </div>
          </div>

          {/* Goal Settings and Constraints Toggle */}
          <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-800/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Backspace Toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                Backspace Usage
              </label>
              {examType === ExamType.CUSTOM ? (
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setAllowBackspace(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-md border ${
                      allowBackspace ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-zinc-800/50 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    Allow
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllowBackspace(false)}
                    className={`px-3 py-1 text-xs font-bold rounded-md border ${
                      !allowBackspace ? "bg-rose-500/15 text-rose-400 border-rose-500/20" : "bg-zinc-800/50 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    Block
                  </button>
                </div>
              ) : (
                <div className={`text-xs font-bold flex items-center gap-1.5 mt-1.5 ${allowBackspace ? "text-emerald-400" : "text-rose-400"}`}>
                  {allowBackspace ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Allowed
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" /> Strictly Blocked
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Custom Target Speed */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Speed Limit Target</label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={targetWPM}
                  onChange={(e) => setTargetWPM(Math.max(10, parseInt(e.target.value) || 10))}
                  className="w-16 bg-zinc-800/50 border border-zinc-800 py-1 px-2 rounded-md text-xs font-bold focus:outline-none focus:border-emerald-500 text-center text-white"
                  id="target-wpm-input"
                />
                <span className="text-xs text-zinc-500 font-medium">WPM</span>
              </div>
            </div>

            {/* Custom Target Accuracy */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Min Accuracy Target</label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={targetAccuracy}
                  onChange={(e) => setTargetAccuracy(Math.min(100, Math.max(50, parseInt(e.target.value) || 50)))}
                  className="w-16 bg-zinc-800/50 border border-zinc-800 py-1 px-2 rounded-md text-xs font-bold focus:outline-none focus:border-emerald-500 text-center text-white"
                  id="target-acc-input"
                />
                <span className="text-xs text-zinc-500 font-medium">%</span>
              </div>
            </div>
          </div>

          {/* Warning Indicator if Railways NTPC selected */}
          {!allowBackspace && (
            <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-rose-400 text-xs leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300">Strict Railway NTPC Rule Active:</span> Backspace is completely disabled for this mode. You must proceed with caution as spelling mistakes cannot be corrected. This matches actual railway terminal software specifications.
              </div>
            </div>
          )}

          {/* Action Trigger button */}
          <div className="pt-2">
            <button
              onClick={handleStart}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
              id="btn-start-test"
            >
              <Play className="w-5 h-5 fill-black" />
              Launch Typing Practice Terminal
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Rule Card / Instructions */}
      <div className="space-y-6">
        <div className="bg-[#0d0d0d] text-zinc-300 rounded-2xl p-6 border border-zinc-800/80 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-1.5 border-b border-zinc-800/60 pb-3 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            Official Evaluation Manual
          </h3>

          <div className="space-y-4 text-xs text-zinc-400 leading-relaxed">
            <div>
              <h4 className="font-bold text-zinc-200 uppercase tracking-widest text-[10px] text-emerald-400">Net Speed Formula</h4>
              <p className="mt-1">
                Net WPM is calculated as:
              </p>
              <div className="bg-zinc-800/40 border border-zinc-800 p-2.5 rounded-lg font-mono text-[11px] text-emerald-400 mt-1">
                Net WPM = (Total Keystrokes / 5) - (Mistakes * Penalty) / Time in mins
              </div>
            </div>

            <div>
              <h4 className="font-bold text-zinc-200 uppercase tracking-widest text-[10px] text-emerald-400">Key depression counting</h4>
              <p className="mt-1">
                Standard typing metrics count exactly five characters/keystrokes (including spaces) as one single word. This prevents paragraph bias.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-zinc-200 uppercase tracking-widest text-[10px] text-emerald-400">Accuracy Thresholds</h4>
              <p className="mt-1">
                Most competitive exams disqualify candidates who fall below 95% accuracy, regardless of high speed. Accuracy should always be prioritized over sheer velocity.
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-[11px] font-bold text-zinc-200">Anti-Cheat Terminals Simulated</span>
            </div>
          </div>
        </div>

        {/* Level requirements card */}
        <div className="bg-[#0d0d0d] rounded-2xl border border-zinc-800/80 p-5 space-y-3">
          <h4 className="font-bold text-zinc-400 text-xs uppercase tracking-widest text-emerald-400">Speed Milestones Badges</h4>
          <div className="space-y-2.5 text-xs text-zinc-400">
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1.5">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                Novice Scribe
              </span>
              <span className="font-mono text-zinc-500">{"< 25 WPM"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1.5">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Professional Typist
              </span>
              <span className="font-mono text-emerald-400 font-bold">25 - 40 WPM</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1.5">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Speed Demon
              </span>
              <span className="font-mono text-emerald-500 font-bold">40 - 60 WPM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Legendary Scribe
              </span>
              <span className="font-mono text-emerald-400 font-extrabold">{"> 60 WPM"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
