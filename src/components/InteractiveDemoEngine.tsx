import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  MousePointerClick,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { voiceManager } from '../lib/voice';
import { LessonAction } from '../lib/chatLessonScripts';

interface InteractiveDemoEngineProps {
  language: LanguageCode;
  isActive: boolean;
  lessonCode: string;
  actions: LessonAction[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  onDemoComplete: () => void;
  onStopToTry: () => void;
  onActionTrigger?: (action: LessonAction, typedTextSoFar?: string) => void;
}

export const InteractiveDemoEngine: React.FC<InteractiveDemoEngineProps> = ({
  language,
  isActive,
  lessonCode,
  actions,
  containerRef,
  onDemoComplete,
  onStopToTry,
  onActionTrigger,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isClicking, setIsClicking] = useState(false);
  const [typingDisplay, setTypingDisplay] = useState<string>('');
  const [replayCount, setReplayCount] = useState<number>(0);

  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);
  const isCancelledRef = useRef<boolean>(false);
  const currentStepRef = useRef<number>(0);
  const speedRef = useRef<number>(1);
  const isPausedRef = useRef<boolean>(false);

  speedRef.current = speedMultiplier;
  isPausedRef.current = isPaused;
  currentStepRef.current = currentStepIndex;

  const clearAllTimeouts = () => {
    timeoutIdsRef.current.forEach((id) => clearTimeout(id));
    timeoutIdsRef.current = [];
  };

  const scheduleTimeout = (fn: () => void, ms: number) => {
    const adjustedMs = ms / speedRef.current;
    const id = setTimeout(() => {
      if (!isCancelledRef.current && !isPausedRef.current) {
        fn();
      }
    }, adjustedMs);
    timeoutIdsRef.current.push(id);
    return id;
  };

  // Find DOM position of target by data-demo-id
  const locateTarget = useCallback(
    (targetId: string): { x: number; y: number } | null => {
      if (!containerRef.current) return null;
      const el = containerRef.current.querySelector(`[data-demo-id="${targetId}"]`) as HTMLElement;
      if (!el) {
        console.warn(`[FirstTap Demo] Target [data-demo-id="${targetId}"] not found in DOM.`);
        return null;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      const x = ((elRect.left + elRect.width / 2 - containerRect.left) / containerRect.width) * 100;
      const y = ((elRect.top + elRect.height / 2 - containerRect.top) / containerRect.height) * 100;

      return {
        x: Math.min(95, Math.max(5, x)),
        y: Math.min(95, Math.max(5, y)),
      };
    },
    [containerRef]
  );

  const executeAction = useCallback(
    (actionIndex: number) => {
      if (actionIndex >= actions.length) {
        // Log demo_watched event (scoring is NOT affected)
        console.info(`[FirstTap Telemetry] demo_watched`, {
          lesson_id: lessonCode,
          completed: true,
          replays: replayCount,
        });

        scheduleTimeout(() => {
          onDemoComplete();
        }, 800);
        return;
      }

      const action = actions[actionIndex];
      setCurrentStepIndex(actionIndex);
      setIsClicking(false);
      setTypingDisplay('');

      // Speak caption in selected language
      const captionText = action.caption[language] || action.caption.en;
      const voiceText = action.voice[language] || action.voice.en;
      voiceManager.speak(voiceText, language);

      // Locate target
      const pos = locateTarget(action.targetId);
      if (pos) {
        setCursorPos(pos);
      } else {
        // Fallback default center coordinates if element is offscreen/not yet mounted
        setCursorPos({ x: 50, y: 50 });
      }

      // Highlight target element in DOM
      if (containerRef.current) {
        const el = containerRef.current.querySelector(
          `[data-demo-id="${action.targetId}"]`
        ) as HTMLElement;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      if (action.type === 'point' || action.highlightOnly) {
        // Point and explain
        const duration = action.durationMs || 3000;
        scheduleTimeout(() => {
          executeAction(actionIndex + 1);
        }, duration);
      } else if (action.type === 'tap') {
        // Move finger (600ms) -> Click ripple (1000ms) -> Trigger action -> Advance
        scheduleTimeout(() => {
          setIsClicking(true);

          // Trigger simulated action handler in parent if provided
          if (onActionTrigger) {
            onActionTrigger(action);
          }

          // Trigger real DOM click on the button so state updates naturally in the UI
          if (containerRef.current) {
            const targetEl = containerRef.current.querySelector(
              `[data-demo-id="${action.targetId}"]`
            ) as HTMLElement;
            if (targetEl && typeof targetEl.click === 'function') {
              targetEl.click();
            }
          }
        }, 1000);

        scheduleTimeout(() => {
          setIsClicking(false);
          executeAction(actionIndex + 1);
        }, action.durationMs || 2400);
      } else if (action.type === 'type') {
        // Type letter by letter (~150ms per letter)
        const text = action.textToType || '';
        let currentTyped = '';

        scheduleTimeout(() => {
          setIsClicking(true);
        }, 600);

        scheduleTimeout(() => {
          setIsClicking(false);
        }, 900);

        text.split('').forEach((char, idx) => {
          scheduleTimeout(() => {
            currentTyped += char;
            setTypingDisplay(currentTyped);
            if (onActionTrigger) {
              onActionTrigger(action, currentTyped);
            }
          }, 1000 + idx * 150);
        });

        const totalTypingTime = 1000 + text.length * 150 + 800;
        scheduleTimeout(() => {
          executeAction(actionIndex + 1);
        }, Math.max(action.durationMs || 2500, totalTypingTime));
      } else {
        scheduleTimeout(() => {
          executeAction(actionIndex + 1);
        }, action.durationMs || 2000);
      }
    },
    [actions, containerRef, language, lessonCode, locateTarget, onActionTrigger, onDemoComplete, replayCount]
  );

  useEffect(() => {
    if (!isActive || actions.length === 0) return;

    isCancelledRef.current = false;
    setIsPaused(false);
    clearAllTimeouts();

    // Start action execution
    const initialDelayId = setTimeout(() => {
      executeAction(0);
    }, 400);
    timeoutIdsRef.current.push(initialDelayId);

    return () => {
      isCancelledRef.current = true;
      clearAllTimeouts();
      voiceManager.stop();
    };
  }, [isActive, actions, language]); // Language change restarts current step cleanly

  if (!isActive || actions.length === 0) return null;

  const currentAction = actions[Math.min(currentStepIndex, actions.length - 1)];
  const caption = currentAction.caption[language] || currentAction.caption.en;

  const handleTogglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      isPausedRef.current = false;
      // Resume from current step
      executeAction(currentStepRef.current);
    } else {
      setIsPaused(true);
      isPausedRef.current = true;
      voiceManager.stop();
      clearAllTimeouts();
    }
  };

  const handleCycleSpeed = () => {
    const nextSpeed = speedMultiplier === 1 ? 1.5 : speedMultiplier === 1.5 ? 2 : 1;
    setSpeedMultiplier(nextSpeed);
  };

  const handleWatchAgain = () => {
    setReplayCount((prev) => prev + 1);
    clearAllTimeouts();
    setIsPaused(false);
    isPausedRef.current = false;
    executeAction(0);
  };

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden select-none">
      {/* Protective semi-transparent backdrop during WATCH mode */}
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[1px] transition-opacity duration-300 pointer-events-auto" />

      {/* Top Banner: WATCH Mode Controls (Pause, Speed, Watch Again, Stop) */}
      <div className="absolute top-2 left-2 right-2 pointer-events-auto z-60 animate-in slide-in-from-top duration-300">
        <div className="bg-[#0D5C63] text-white p-2.5 rounded-2xl shadow-xl border border-teal-400/40 flex items-center justify-between gap-2">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                {language === 'ta'
                  ? 'மாதிரி செயல்முறை விளக்கம் (WATCH ME)'
                  : language === 'hi'
                  ? 'डेमो देखें (WATCH ME)'
                  : 'WATCH ME DEMO'}
              </span>
              <span className="text-xs font-semibold text-slate-100 line-clamp-1">
                {lessonCode}: {currentStepIndex + 1}/{actions.length}
              </span>
            </div>
          </div>

          {/* Controls Bar: Pause, Speed, Replay, Stop */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Speed toggle */}
            <button
              onClick={handleCycleSpeed}
              className="px-2 py-1 rounded-lg bg-teal-800/80 hover:bg-teal-700 text-[11px] font-bold text-amber-200 transition cursor-pointer"
              title="Change Speed"
            >
              {speedMultiplier}x
            </button>

            {/* Pause / Play */}
            <button
              onClick={handleTogglePause}
              className="p-1.5 rounded-lg bg-teal-800/80 hover:bg-teal-700 text-white transition cursor-pointer"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            {/* Watch Again */}
            <button
              onClick={handleWatchAgain}
              className="p-1.5 rounded-lg bg-teal-800/80 hover:bg-teal-700 text-teal-200 transition cursor-pointer"
              title="Watch Again"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Stop - Let me try button */}
            <button
              onClick={onStopToTry}
              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition active:scale-95 ml-1"
            >
              {language === 'ta'
                ? 'நானே செய்கிறேன்'
                : language === 'hi'
                ? 'खुद करें'
                : 'Stop - let me try'}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Animated Gliding Finger Pointer */}
      <div
        className="absolute transition-all duration-700 ease-out z-70 pointer-events-none"
        style={{
          left: `${cursorPos.x}%`,
          top: `${cursorPos.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Pulsing Tap Ripple */}
        {isClicking && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-16 h-16 rounded-full bg-amber-400/60 animate-ping" />
            <span className="w-8 h-8 rounded-full bg-teal-400/80 animate-pulse" />
          </div>
        )}

        {/* Hand Icon with visual bounce */}
        <div
          className={`flex flex-col items-center transition-transform duration-200 ${
            isClicking ? 'scale-90 translate-y-1' : 'scale-100'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl border-2 border-white ring-2 ring-teal-500/50">
            <MousePointerClick className="w-6 h-6 fill-slate-950 text-white" />
          </div>

          {/* Action indicator tag */}
          <div
            className={`mt-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg transition-all ${
              isClicking
                ? 'bg-emerald-600 text-white scale-105'
                : 'bg-slate-900/90 text-amber-300 border border-amber-400/40'
            }`}
          >
            {isClicking ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-white" />
                <span>{language === 'ta' ? 'தட்டவும்!' : language === 'hi' ? 'टैप!' : 'Tap!'}</span>
              </span>
            ) : typingDisplay ? (
              <span className="font-mono text-white">
                "{typingDisplay}"<span className="animate-pulse">|</span>
              </span>
            ) : (
              <span>{currentAction.targetId}</span>
            )}
          </div>
        </div>
      </div>

      {/* Prominent Bottom Caption Box (Always readable even if sound is off) */}
      <div className="absolute bottom-4 left-3 right-3 pointer-events-auto z-60 animate-in slide-in-from-bottom duration-300">
        <div className="bg-slate-950/95 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-amber-400/60 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-500/30 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/40">
            <Volume2 className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
              செல்வி (Selvi Guide):
            </span>
            <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed mt-0.5">
              {caption}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface YourTurnPromptProps {
  language: LanguageCode;
  promptText: string;
  failedCount?: number;
  onReplayDemo: () => void;
}

export const YourTurnPromptBanner: React.FC<YourTurnPromptProps> = ({
  language,
  promptText,
  failedCount = 0,
  onReplayDemo,
}) => {
  return (
    <div className="bg-emerald-50 border-b border-emerald-300/80 px-3 py-1.5 flex items-center justify-between text-xs font-semibold text-emerald-950 z-30 animate-in fade-in duration-200">
      <div className="flex items-center gap-2">
        <span className="flex h-2.5 w-2.5 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
        </span>
        <div>
          <span className="font-bold text-emerald-800 mr-1">
            {language === 'ta'
              ? 'இப்போது நீங்கள் செய்யுங்கள் (YOUR TURN):'
              : language === 'hi'
              ? 'अब आप करें (YOUR TURN):'
              : 'YOUR TURN:'}
          </span>
          <span className="text-slate-700 text-[11px] hidden sm:inline">{promptText}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {failedCount >= 3 && (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
            {language === 'ta' ? 'உதவி தயார்' : 'Need Help?'}
          </span>
        )}

        <button
          onClick={onReplayDemo}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition cursor-pointer shadow-2xs"
          title="Watch Demo Again"
        >
          <RotateCcw className="w-3 h-3 text-emerald-600" />
          <span>{language === 'ta' ? 'செய்து காட்டு' : language === 'hi' ? 'डेमो देखें' : 'Watch Again'}</span>
        </button>
      </div>
    </div>
  );
};
