import React, { useState, useEffect, useRef } from "react";
import { SessionConfig } from "./PracticeConfig";
import { getRandomPassage } from "../data/examTexts";
import { TypingSession, ExamType } from "../types";
import { getProfile } from "../utils/storage";
import { Clock, RefreshCw, XCircle, Play, CheckCircle, AlertCircle, Award } from "lucide-react";
import { motion } from "motion/react";

interface TypingTestProps {
  config: SessionConfig;
  onFinish: (session: TypingSession) => void;
  onCancel: () => void;
}

export default function TypingTest({ config, onFinish, onCancel }: TypingTestProps) {
  const profile = getProfile();
  const soundEnabled = profile.soundEnabled;

  // Retrieve passage
  const [passage, setPassage] = useState(() => getRandomPassage(config.examType, config.difficulty));

  // Typing states
  const [typedText, setTypedText] = useState("");
  const [timeSpent, setTimeSpent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.duration);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [errorsCount, setErrorsCount] = useState(0);

  // For real-time graphing
  const [chartData, setChartData] = useState<{ time: number; wpm: number; accuracy: number }[]>([]);

  // Track keystrokes details
  const [characterStats, setCharacterStats] = useState<{ [key: string]: { typed: number; errors: number } }>({});

  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Web Audio API synthesizer for key clicks
  const playSound = (type: "click" | "error" | "complete") => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (type === "click") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === "error") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.setValueAtTime(130, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "complete") {
        // Play a neat double-chime success sound
        const playChime = (freq: number, delay: number, dur: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
          gain.gain.setValueAtTime(0, ctx.currentTime + delay);
          gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + delay + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + dur);
        };
        playChime(523.25, 0, 0.3); // C5
        playChime(659.25, 0.12, 0.4); // E5
      }
    } catch (e) {
      console.warn("Sound generation disabled or failed: ", e);
    }
  };

  // Focus input on mount & on clicking the container
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Main countdown timer and graph tracking
  useEffect(() => {
    if (!isTestStarted || isFinished) return;

    const timer = setInterval(() => {
      setTimeSpent((prev) => {
        const nextTime = prev + 1;

        // Record real-time chart data every 5 seconds
        if (nextTime % 5 === 0) {
          const currentStats = calculateLiveStats(nextTime);
          setChartData((prevData) => [
            ...prevData,
            { time: nextTime, wpm: currentStats.netWpm, accuracy: currentStats.accuracy },
          ]);
        }

        return nextTime;
      });

      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestStarted, isFinished]);

  // Calculate live speed and accuracy metrics
  const calculateLiveStats = (currTimeSpent: number = timeSpent) => {
    const timeInMins = currTimeSpent > 0 ? currTimeSpent / 60 : 1 / 60;
    const totalKeystrokes = typedText.length;

    // Gross WPM
    const grossWpm = Math.round(totalKeystrokes / 5 / timeInMins);

    // Errors - compare characters with passage
    let uncorrectedErrors = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] !== passage.text[i]) {
        uncorrectedErrors++;
      }
    }

    // Accuracy
    const accuracy = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errorsCount) / totalKeystrokes) * 100) : 100;

    // Net WPM (Gross Speed penalized for uncorrected mistakes)
    // Standard competitive formula: Net WPM = (Keystrokes / 5 - Uncorrected Errors) / Minutes
    const netWords = totalKeystrokes / 5 - uncorrectedErrors;
    const netWpm = Math.max(0, Math.round(netWords / timeInMins));

    return { grossWpm, netWpm, accuracy };
  };

  const liveStats = calculateLiveStats();

  // Key pressed listener
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;

    const val = e.target.value;

    // Prevent typing past the passage length
    if (val.length > passage.text.length) return;

    // If test hasn't started yet, trigger start
    if (!isTestStarted && val.length > 0) {
      setIsTestStarted(true);
    }

    // Detect backspace
    const isDeletion = val.length < typedText.length;

    if (isDeletion) {
      if (!config.allowBackspace) {
        // If backspace is blocked, do not update typed text
        return;
      }
      setBackspaceCount((prev) => prev + 1);
      setTypedText(val);
      playSound("click");
      return;
    }

    // Direct character typed
    const addedChar = val[val.length - 1];
    const expectedChar = passage.text[val.length - 1];
    const isError = addedChar !== expectedChar;

    // Record individual character statistics
    setCharacterStats((prev) => {
      const charKey = expectedChar.toLowerCase();
      const current = prev[charKey] || { typed: 0, errors: 0 };
      return {
        ...prev,
        [charKey]: {
          typed: current.typed + 1,
          errors: current.errors + (isError ? 1 : 0),
        },
      };
    });

    if (isError) {
      setErrorsCount((prev) => prev + 1);
      playSound("error");
    } else {
      playSound("click");
    }

    setTypedText(val);

    // Auto-complete test if user finished typing the whole passage
    if (val.length === passage.text.length) {
      finishTest(val);
    }
  };

  const finishTest = (finalTyped: string = typedText) => {
    setIsFinished(true);
    playSound("complete");

    // final calculations
    const finalTimeSpent = timeSpent === 0 ? 1 : timeSpent;
    const timeInMins = finalTimeSpent / 60;
    const totalKeystrokes = finalTyped.length;

    let uncorrectedErrors = 0;
    for (let i = 0; i < finalTyped.length; i++) {
      if (finalTyped[i] !== passage.text[i]) {
        uncorrectedErrors++;
      }
    }

    const accuracy = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errorsCount) / totalKeystrokes) * 100) : 100;
    const grossWpm = Math.round(totalKeystrokes / 5 / timeInMins);
    const netWords = totalKeystrokes / 5 - uncorrectedErrors;
    const netWpm = Math.max(0, Math.round(netWords / timeInMins));

    // Construct session details
    const session: TypingSession = {
      id: `session_${Date.now()}`,
      date: new Date().toISOString(),
      examType: config.examType,
      examName: config.examType === ExamType.CUSTOM ? "Custom Training" : config.examType.replace("_", " "),
      difficulty: config.difficulty,
      duration: config.duration,
      timeSpent: finalTimeSpent,
      wpm: netWpm,
      grossWpm,
      accuracy,
      keystrokes: totalKeystrokes,
      errorsCount: errorsCount,
      backspaceCount,
      completed: true,
      chartData: chartData.length > 0 ? chartData : [{ time: finalTimeSpent, wpm: netWpm, accuracy }],
      characterStats,
    };

    onFinish(session);
  };

  const handleRestart = () => {
    setPassage(getRandomPassage(config.examType, config.difficulty));
    setTypedText("");
    setTimeSpent(0);
    setTimeLeft(config.duration);
    setIsTestStarted(false);
    setIsFinished(false);
    setBackspaceCount(0);
    setErrorsCount(0);
    setChartData([]);
    setCharacterStats({});
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Generate interactive highlighted typography block
  const renderPassageChars = () => {
    const chars = passage.text.split("");
    return chars.map((char, index) => {
      let charClass = "text-zinc-500 font-mono text-lg leading-relaxed transition-all";
      const isTyped = index < typedText.length;
      const isActive = index === typedText.length;

      if (isTyped) {
        const isCorrect = typedText[index] === char;
        charClass = isCorrect
          ? "text-zinc-100 bg-emerald-500/10 font-bold border-b border-transparent font-mono text-lg"
          : "text-rose-400 bg-rose-500/10 font-bold border-b-2 border-rose-500 font-mono text-lg";
      }

      return (
        <span key={index} className="relative inline-block">
          {isActive && (
            <span className="absolute -bottom-0.5 inset-x-0 h-0.5 bg-emerald-400 animate-pulse" />
          )}
          <span className={charClass}>{char}</span>
        </span>
      );
    });
  };

  // Check if targets are being hit
  const isWPMGoalMet = liveStats.netWpm >= config.targetWPM;
  const isAccGoalMet = liveStats.accuracy >= config.targetAccuracy;

  return (
    <div className="space-y-6" id="typing-test-root">
      {/* Test Controls / Stats Bar */}
      <div className="bg-[#0d0d0d] rounded-2xl border border-zinc-800/80 p-5 flex flex-wrap items-center justify-between gap-4">
        {/* Exam Title badge */}
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">Active Practice Domain</span>
          <h2 className="text-lg font-bold text-white">
            {config.examType === ExamType.CUSTOM
              ? `Custom Session • ${config.difficulty}`
              : `${config.examType.replace("_", " ")} Prep Terminal`}
          </h2>
        </div>

        {/* Floating statistics panel */}
        <div className="flex items-center gap-4">
          {/* Timer card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-center flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Clock</div>
              <div className="font-mono font-bold text-white text-sm">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* Speed Card */}
          <div className={`border rounded-xl px-4 py-2 text-center transition-all ${
            isWPMGoalMet ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-amber-500/5 border-amber-500/20 text-amber-400"
          }`}>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Net Speed</div>
            <div className="font-mono font-bold text-sm">
              {liveStats.netWpm} <span className="text-[10px] font-normal">WPM</span>
            </div>
          </div>

          {/* Accuracy Card */}
          <div className={`border rounded-xl px-4 py-2 text-center transition-all ${
            isAccGoalMet ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-rose-500/5 border-rose-500/20 text-rose-400"
          }`}>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Accuracy</div>
            <div className="font-mono font-bold text-sm">
              {liveStats.accuracy}%
            </div>
          </div>
        </div>

        {/* Control Button stack */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRestart}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-850 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all"
            title="Restart Practice Run"
            id="btn-restart-typing"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onCancel}
            className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-all"
            title="Cancel practice run"
            id="btn-cancel-typing"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Warning Ribbon if falling behind */}
      {isTestStarted && (!isWPMGoalMet || !isAccGoalMet) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2.5 text-amber-400 text-xs"
        >
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <span className="font-bold text-amber-300">Performance Warning:</span> You are currently falling below your selected thresholds. Keep pushing! Target: <span className="font-semibold">{config.targetWPM} WPM</span> & <span className="font-semibold">{config.targetAccuracy}% Accuracy</span>.
          </div>
        </motion.div>
      )}

      {/* Main Interactive Typing Area */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="bg-[#070707] rounded-2xl border border-zinc-800/80 p-6 md:p-8 shadow-inner relative overflow-hidden min-h-64 cursor-text focus-within:ring-2 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 transition-all"
        id="typing-arena-box"
      >
        {/* Invisible capturing textbox */}
        <textarea
          ref={inputRef}
          value={typedText}
          onChange={handleChange}
          disabled={isFinished}
          className="absolute -top-40 -left-40 w-10 h-10 opacity-0 pointer-events-none"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          id="invisible-capture-input"
        />

        {/* Visual Focus Prompt Overlay when not typing */}
        {!isTestStarted && !isFinished && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-4 z-10 transition-all">
            <Play className="w-12 h-12 text-emerald-400 fill-emerald-500/10 animate-bounce mb-3" />
            <h3 className="font-bold text-zinc-200">Terminal Ready</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              Click anywhere in this box or start typing to engage the clock and launch your examination prep test.
            </p>
          </div>
        )}

        {/* Text Presentation Box */}
        <div className="select-none tracking-wide text-justify font-mono max-h-80 overflow-y-auto pr-1">
          {renderPassageChars()}
        </div>

        {/* Character limits indicator */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-6 pt-4 border-t border-zinc-800/60 font-mono font-bold">
          <div>
            Depressions: {typedText.length} / {passage.text.length} characters
          </div>
          <div className="flex items-center gap-4">
            <span>Errors: <span className="text-rose-400">{errorsCount}</span></span>
            {config.allowBackspace && (
              <span>Backspaces: <span className="text-emerald-400">{backspaceCount}</span></span>
            )}
          </div>
        </div>
      </div>

      {/* Finished Result Modal Dashboard (rendered overlay) */}
      {isFinished && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
          id="results-overlay"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-[#0d0d0d] rounded-3xl border border-zinc-800/80 max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6"
          >
            {/* Header success */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Practice Run Logged!</h3>
              <p className="text-xs text-zinc-400">
                Excellent perseverance. We have saved your results to your candidate profile.
              </p>
            </div>

            {/* Scorecard grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 text-center">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Net Speed</span>
                <span className="text-2xl font-black text-emerald-400 block mt-1">{liveStats.netWpm}</span>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">WPM</span>
              </div>

              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 text-center">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Accuracy</span>
                <span className="text-2xl font-black text-emerald-400 block mt-1">{liveStats.accuracy}%</span>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">Precision</span>
              </div>

              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 text-center">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Errors</span>
                <span className="text-2xl font-black text-zinc-200 block mt-1">{errorsCount}</span>
                <span className="text-[10px] text-zinc-400 font-semibold block mt-0.5">Mistakes</span>
              </div>

              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 text-center">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Keystrokes</span>
                <span className="text-2xl font-black text-zinc-200 block mt-1">{typedText.length}</span>
                <span className="text-[10px] text-zinc-400 font-semibold block mt-0.5">Total keys</span>
              </div>
            </div>

            {/* Qualification card if standard exam selected */}
            {config.examType !== ExamType.CUSTOM && (
              <div className="border border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
                {/* Header */}
                <div className="bg-zinc-900/40 p-3 text-xs font-bold text-zinc-400 border-b border-zinc-850 flex items-center justify-between">
                  <span>{config.examType.replace("_", " ")} Requirements Match</span>
                  <Award className="w-4 h-4 text-zinc-500" />
                </div>
                {/* Comparison content */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h5 className="font-semibold text-zinc-500 uppercase tracking-widest text-[9px]">Speed Benchmark</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-zinc-200">{liveStats.netWpm} WPM</span>
                      <span className="text-zinc-500">vs</span>
                      <span className="font-bold text-zinc-400">{config.targetWPM} WPM (req)</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-zinc-500 uppercase tracking-widest text-[9px]">Accuracy Benchmark</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-zinc-200">{liveStats.accuracy}%</span>
                      <span className="text-zinc-500">vs</span>
                      <span className="font-bold text-zinc-400">{config.targetAccuracy}% (req)</span>
                    </div>
                  </div>
                </div>

                {/* Final verdict */}
                <div className={`p-3 text-center text-xs font-bold border-t ${
                  isWPMGoalMet && isAccGoalMet
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  {isWPMGoalMet && isAccGoalMet ? (
                    <span>Congratulations! Your metrics would qualify for this exam seat.</span>
                  ) : (
                    <span>You are short of exam parameters. Consistent drills will bridge the gap!</span>
                  )}
                </div>
              </div>
            )}

            {/* Actions button list */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="flex-1 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold py-3 px-4 rounded-xl text-sm border border-zinc-700/60 transition-all flex items-center justify-center gap-1.5"
                id="btn-modal-retry"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Exercise
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold py-3 px-4 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-1"
                id="btn-modal-return"
              >
                Return to Dashboard
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
