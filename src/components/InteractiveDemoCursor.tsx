import React, { useEffect, useState } from 'react';
import { MousePointerClick, Play, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';
import { LanguageCode } from '../types';
import { voiceManager } from '../lib/voice';

export interface DemoStepAction {
  targetLabel: string;
  xPercent: number; // 0 - 100% of container
  yPercent: number; // 0 - 100% of container
  actionDescription: string;
  voiceText: string;
  durationMs?: number;
}

interface InteractiveDemoOverlayProps {
  language: LanguageCode;
  isActive: boolean;
  demoActions: DemoStepAction[];
  onDemoComplete: () => void;
  onSkipDemo: () => void;
}

export const InteractiveDemoOverlay: React.FC<InteractiveDemoOverlayProps> = ({
  language,
  isActive,
  demoActions,
  onDemoComplete,
  onSkipDemo,
}) => {
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    if (!isActive || demoActions.length === 0) return;

    setCurrentActionIndex(0);
    let timer: NodeJS.Timeout;

    const playAction = (index: number) => {
      if (index >= demoActions.length) {
        setIsClicking(false);
        // Completed
        timer = setTimeout(() => {
          onDemoComplete();
        }, 800);
        return;
      }

      const action = demoActions[index];
      // Speak instruction
      voiceManager.speak(action.voiceText, language);

      // Move cursor, then click
      setIsClicking(false);
      const moveDelay = 700;
      const clickDelay = 1200;
      const stepDuration = action.durationMs || 2500;

      timer = setTimeout(() => {
        setIsClicking(true);
      }, clickDelay);

      timer = setTimeout(() => {
        setIsClicking(false);
        setCurrentActionIndex(index + 1);
        playAction(index + 1);
      }, stepDuration);
    };

    playAction(0);

    return () => {
      clearTimeout(timer);
    };
  }, [isActive, demoActions]);

  if (!isActive || demoActions.length === 0) return null;

  const currentAction = demoActions[Math.min(currentActionIndex, demoActions.length - 1)];

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Semi-transparent protective backdrop during demo */}
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] transition-opacity duration-300" />

      {/* Top Demo Status Banner */}
      <div className="absolute top-2 left-2 right-2 pointer-events-auto z-60 animate-in slide-in-from-top duration-300">
        <div className="bg-[#0D5C63] text-white p-3 rounded-2xl shadow-xl border border-teal-400/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                {language === 'ta'
                  ? 'மாதிரி செயல்முறை விளக்கம் (Demo)'
                  : language === 'hi'
                  ? 'डेमो देखें (Demo)'
                  : 'Demo Mode — Watch First'}
              </span>
              <p className="text-xs font-semibold text-white leading-tight">
                {currentAction.actionDescription}
              </p>
            </div>
          </div>

          <button
            onClick={onSkipDemo}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition shrink-0 active:scale-95"
          >
            {language === 'ta' ? 'நானே செய்கிறேன்' : language === 'hi' ? 'खुद करें' : 'Try Myself'}
          </button>
        </div>
      </div>

      {/* Animated Floating Finger / Cursor */}
      <div
        className="absolute transition-all duration-700 ease-out z-70 pointer-events-none"
        style={{
          left: `${currentAction.xPercent}%`,
          top: `${currentAction.yPercent}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Pulsing Ripple Effect on Click */}
        {isClicking && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-16 h-16 rounded-full bg-amber-400/50 animate-ping" />
            <span className="w-8 h-8 rounded-full bg-teal-500/60 animate-pulse" />
          </div>
        )}

        {/* Hand Icon with visual bounce */}
        <div
          className={`flex flex-col items-center transition-transform duration-200 ${
            isClicking ? 'scale-85 translate-y-1' : 'scale-100'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl border-2 border-white">
            <MousePointerClick className="w-6 h-6 fill-slate-950 text-white" />
          </div>

          {/* Click Speech / Label Tag */}
          <div
            className={`mt-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg transition-all ${
              isClicking
                ? 'bg-emerald-600 text-white scale-105'
                : 'bg-slate-900 text-amber-300'
            }`}
          >
            {isClicking ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{language === 'ta' ? 'தட்டவும் (Click!)' : 'Tap here!'}</span>
              </span>
            ) : (
              <span>{currentAction.targetLabel}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface YourTurnBannerProps {
  language: LanguageCode;
  instructionText: string;
  onReplayDemo: () => void;
}

export const YourTurnBanner: React.FC<YourTurnBannerProps> = ({
  language,
  instructionText,
  onReplayDemo,
}) => {
  return (
    <div className="bg-emerald-50 border-b border-emerald-300/80 px-3 py-1.5 flex items-center justify-between text-xs font-semibold text-emerald-950 animate-in fade-in duration-300">
      <div className="flex items-center gap-1.5">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
        </span>
        <span className="font-bold text-emerald-800">
          {language === 'ta'
            ? 'இப்போது நீங்கள் செய்யுங்கள்:'
            : language === 'hi'
            ? 'अब आप करें:'
            : 'Now your turn:'}
        </span>
        <span className="text-[11px] text-slate-700 hidden sm:inline">{instructionText}</span>
      </div>

      <button
        onClick={onReplayDemo}
        className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition cursor-pointer shadow-2xs"
        title="செய்து காட்டுக (Replay Demo)"
      >
        <RotateCcw className="w-3 h-3 text-emerald-600" />
        <span>{language === 'ta' ? 'செய்து காட்டு' : language === 'hi' ? 'डेमो फिर से' : 'Show Demo'}</span>
      </button>
    </div>
  );
};
