import React, { useReducer, useRef, useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Search,
  Building,
  FileText,
  Smartphone,
  CheckSquare,
  Repeat,
  BarChart3,
  QrCode,
  Info,
  CheckCircle2,
  Delete,
  RotateCcw,
  Home,
  Tag,
  Gift,
  Clock,
  MousePointerClick,
  Volume2,
} from 'lucide-react';
import { LanguageCode, StepAttempt } from '../types';
import { translations } from '../lib/translations';
import { LESSON_1_SEND_MONEY } from '../lib/lessonData';
import { DemoRunnerOverlay } from './DemoRunnerOverlay';
import { AskSelviMic } from './AskSelviMic';
import { voiceManager } from '../lib/voice';

type PayScreen =
  | 'HOME'
  | 'SEND_PHONE'
  | 'AMOUNT'
  | 'PIN'
  | 'SUCCESS';

interface PayState {
  screen: PayScreen;
  phoneNumber: string;
  amount: string;
  pin: string;
  selectedContact: { name: string; phone: string } | null;
  isDemoActive: boolean;
  phase: 'DEMO' | 'PRACTICE' | 'DONE';
}

type PayAction =
  | { type: 'GO_HOME' }
  | { type: 'START_SEND_MONEY' }
  | { type: 'KEYPAD_PRESS'; char: string }
  | { type: 'KEYPAD_BACKSPACE' }
  | { type: 'SELECT_CONTACT'; contact: { name: string; phone: string } }
  | { type: 'TAP_PAY' }
  | { type: 'FINISH_PAY' }
  | { type: 'SET_DEMO_ACTIVE'; active: boolean }
  | { type: 'RESET' };

const initialState: PayState = {
  screen: 'HOME',
  phoneNumber: '',
  amount: '',
  pin: '',
  selectedContact: null,
  isDemoActive: true,
  phase: 'DEMO',
};

function payReducer(state: PayState, action: PayAction): PayState {
  switch (action.type) {
    case 'GO_HOME':
      return { ...state, screen: 'HOME' };

    case 'START_SEND_MONEY':
      return {
        ...state,
        screen: 'SEND_PHONE',
        phoneNumber: '',
        amount: '',
        pin: '',
        selectedContact: null,
      };

    case 'KEYPAD_PRESS': {
      if (state.screen === 'SEND_PHONE') {
        if (state.phoneNumber.length >= 10) return state;
        return { ...state, phoneNumber: state.phoneNumber + action.char };
      }
      if (state.screen === 'AMOUNT') {
        if (state.amount.length >= 6) return state;
        const newAmt = state.amount === '0' ? action.char : state.amount + action.char;
        return { ...state, amount: newAmt };
      }
      if (state.screen === 'PIN') {
        if (state.pin.length >= 4) return state;
        return { ...state, pin: state.pin + action.char };
      }
      return state;
    }

    case 'KEYPAD_BACKSPACE': {
      if (state.screen === 'SEND_PHONE') {
        return { ...state, phoneNumber: state.phoneNumber.slice(0, -1) };
      }
      if (state.screen === 'AMOUNT') {
        return { ...state, amount: state.amount.slice(0, -1) };
      }
      if (state.screen === 'PIN') {
        return { ...state, pin: state.pin.slice(0, -1) };
      }
      return state;
    }

    case 'SELECT_CONTACT':
      return {
        ...state,
        screen: 'AMOUNT',
        selectedContact: action.contact,
        amount: '',
      };

    case 'TAP_PAY':
      return {
        ...state,
        screen: 'PIN',
        pin: '',
      };

    case 'FINISH_PAY':
      return {
        ...state,
        screen: 'SUCCESS',
      };

    case 'SET_DEMO_ACTIVE':
      return {
        ...state,
        isDemoActive: action.active,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

interface FirstTapPayProps {
  language: LanguageCode;
  initialStepIndex?: number;
  onLogAttempt: (attempt: StepAttempt) => void;
  onOpenDoubt: (contextNote?: string) => void;
  onFinishModule: () => void;
  onExit: () => void;
}

export const FirstTapPay: React.FC<FirstTapPayProps> = ({
  language,
  initialStepIndex = 0,
  onLogAttempt,
  onOpenDoubt,
  onFinishModule,
  onExit,
}) => {
  const t = translations[language];
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [state, dispatch] = useReducer(payReducer, initialState);
  const [isPausedForMic, setIsPausedForMic] = useState<boolean>(false);
  const [demoStepIndex, setDemoStepIndex] = useState<number>(0);
  const [demoCaption, setDemoCaption] = useState<string>('');
  const [mistakesCount, setMistakesCount] = useState<number>(0);

  // Test Mode State
  const [phase, setPhase] = useState<'DEMO' | 'TEST' | 'COMPLETED'>('DEMO');
  const [testAttempt, setTestAttempt] = useState<number>(1);
  const [testMistakes, setTestMistakes] = useState<number>(0);
  const [hintTarget, setHintTarget] = useState<string | null>(null);
  const [hintPos, setHintPos] = useState<{ x: number; y: number } | null>(null);

  const testAmounts = ['50', '500', '100'];
  const currentTestAmount = testAmounts[(testAttempt - 1) % testAmounts.length];
  const IDLE_SECONDS = 8;
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getExpectedTargetId = useCallback((): string | null => {
    if (state.screen === 'HOME') {
      return 'tile-send-money';
    }
    if (state.screen === 'SEND_PHONE') {
      if (state.phoneNumber.length < 10) {
        const requiredDigits = '9000000000';
        return `key-${requiredDigits[state.phoneNumber.length]}`;
      }
      return 'contact-ravi';
    }
    if (state.screen === 'AMOUNT') {
      if (state.amount !== currentTestAmount) {
        const nextChar = currentTestAmount[state.amount.length];
        return `key-${nextChar}`;
      }
      return 'pay-btn';
    }
    if (state.screen === 'PIN') {
      if (state.pin.length < 4) {
        const pinDigits = '1234';
        return `key-${pinDigits[state.pin.length]}`;
      }
      return null;
    }
    return null;
  }, [state.screen, state.phoneNumber, state.amount, state.pin, currentTestAmount]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (phase !== 'TEST') return;

    idleTimerRef.current = setTimeout(() => {
      const target = getExpectedTargetId();
      if (target) {
        console.log(`[test] idle hint step ${state.screen}_${target}`);
        setHintTarget(target);
        const tapHere =
          language === 'ta'
            ? 'இங்கே தொடவும்'
            : language === 'hi'
            ? 'यहाँ टैप करें'
            : 'Tap here';
        voiceManager.speakAsync(tapHere, language, { fallbackTimeoutMs: 3000 });
      }
    }, IDLE_SECONDS * 1000);
  }, [phase, state.screen, getExpectedTargetId, language]);

  // Restart idle timer when state changes in test
  useEffect(() => {
    if (phase === 'TEST') {
      resetIdleTimer();
    }
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [phase, state.screen, state.phoneNumber, state.amount, state.pin, resetIdleTimer]);

  // Track hint coordinates for "TAP HERE" pointer
  useEffect(() => {
    if (!hintTarget || !containerRef.current) {
      setHintPos(null);
      return;
    }

    const updatePos = () => {
      if (!containerRef.current) return;
      const el = containerRef.current.querySelector(`[data-demo-id="${hintTarget}"]`) as HTMLElement;
      if (el) {
        const cRect = containerRef.current.getBoundingClientRect();
        const eRect = el.getBoundingClientRect();
        const x = ((eRect.left + eRect.width / 2 - cRect.left) / cRect.width) * 100;
        const y = ((eRect.top + eRect.height / 2 - cRect.top) / cRect.height) * 100;
        setHintPos({ x, y });
      }
    };

    updatePos();
    const interval = setInterval(updatePos, 200);
    return () => clearInterval(interval);
  }, [hintTarget]);

  // Start Test Mode
  const startTestMode = (attemptNum = 1) => {
    console.log('[demo] complete -> startTest');
    const amount = testAmounts[(attemptNum - 1) % testAmounts.length];
    console.log(`[test] attempt ${attemptNum} amount ${amount}`);

    dispatch({ type: 'RESET' });
    dispatch({ type: 'SET_DEMO_ACTIVE', active: false });
    setPhase('TEST');
    setTestAttempt(attemptNum);
    setTestMistakes(0);
    setHintTarget(null);

    const introText =
      language === 'ta'
        ? 'இப்போது நீங்கள் ஆரம்பத்திலிருந்து நீங்களே செய்யுங்கள்.'
        : language === 'hi'
        ? 'अब आप इसे शुरू से खुद करें।'
        : 'Now you do it, from the beginning.';

    voiceManager.speakAsync(introText, language, { fallbackTimeoutMs: 6000 });
  };

  // Wrong Tap capture handler
  const handleContainerClickCapture = (e: React.MouseEvent) => {
    if (phase !== 'TEST') return;

    const target = e.target as HTMLElement;

    // Mic button is always excluded
    if (target.closest('[data-mic-button="true"]')) {
      return;
    }

    const expected = getExpectedTargetId();
    if (!expected) return;

    const clickedDemoEl = target.closest('[data-demo-id]');
    const clickedId = clickedDemoEl?.getAttribute('data-demo-id');

    if (clickedId === expected) {
      // Correct tap!
      setHintTarget(null);
      resetIdleTimer();
      return;
    }

    // Wrong tap!
    e.stopPropagation();
    e.preventDefault();

    setTestMistakes((prev) => {
      const nextM = prev + 1;
      setMistakesCount(nextM);
      return nextM;
    });
    setHintTarget(expected);

    const sayLine =
      language === 'ta'
        ? 'இங்கே தொடவும்'
        : language === 'hi'
        ? 'यहाँ टैप करें'
        : 'Tap here';
    voiceManager.speakAsync(sayLine, language, { fallbackTimeoutMs: 3000 });
    resetIdleTimer();
  };

  // Test Attempt completion & retry logic
  useEffect(() => {
    if (phase === 'TEST' && state.screen === 'SUCCESS') {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      setHintTarget(null);

      const mistakes = testMistakes;
      if (mistakes >= 3) {
        console.log(`[test] attempt ${testAttempt} mistakes ${mistakes} -> redemo`);
        if (testAttempt < 3) {
          const redemoLine =
            language === 'ta'
              ? 'மீண்டும் ஒருமுறை செய்து காட்டுகிறேன்.'
              : language === 'hi'
              ? 'मैं आपको एक बार फिर दिखाती हूँ।'
              : 'Let me show you once more.';
          voiceManager.speakAsync(redemoLine, language, { fallbackTimeoutMs: 4000 }).then(() => {
            setTestAttempt((prev) => prev + 1);
            setTestMistakes(0);
            dispatch({ type: 'RESET' });
            dispatch({ type: 'SET_DEMO_ACTIVE', active: true });
            setPhase('DEMO');
          });
        } else {
          // After 3rd attempt
          const finishLine =
            language === 'ta'
              ? 'இதை பின்னர் மீண்டும் பயிற்சி செய்யலாம்.'
              : language === 'hi'
              ? 'हम इसका अभ्यास बाद में फिर करेंगे।'
              : "Let's practise this again later.";
          voiceManager.speakAsync(finishLine, language, { fallbackTimeoutMs: 4000 });
          setPhase('COMPLETED');
        }
      } else {
        setPhase('COMPLETED');
      }
    }
  }, [phase, state.screen, testMistakes, testAttempt, language]);

  // Auto transition to SUCCESS when 4 PIN digits are entered
  useEffect(() => {
    if (state.screen === 'PIN' && state.pin.length === 4) {
      const timer = setTimeout(() => {
        dispatch({ type: 'FINISH_PAY' });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.screen, state.pin]);

  // Keypad Helper Component: Keypad keys key-0..key-9 and key-back
  const renderNumericKeypad = (showZero = true) => {
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    return (
      <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto w-full pt-2 select-none">
        {digits.map((digit) => (
          <button
            key={digit}
            data-demo-id={`key-${digit}`}
            onClick={() => dispatch({ type: 'KEYPAD_PRESS', char: digit })}
            className="min-h-[54px] rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 active:bg-teal-50 text-xl font-bold text-slate-800 shadow-xs active:scale-95 transition cursor-pointer flex items-center justify-center border-b-2"
          >
            {digit}
          </button>
        ))}

        <div className="min-h-[54px]" />

        {showZero && (
          <button
            data-demo-id="key-0"
            onClick={() => dispatch({ type: 'KEYPAD_PRESS', char: '0' })}
            className="min-h-[54px] rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 active:bg-teal-50 text-xl font-bold text-slate-800 shadow-xs active:scale-95 transition cursor-pointer flex items-center justify-center border-b-2"
          >
            0
          </button>
        )}

        <button
          data-demo-id="key-back"
          onClick={() => dispatch({ type: 'KEYPAD_BACKSPACE' })}
          className="min-h-[54px] rounded-2xl bg-slate-100 border border-slate-200 hover:bg-slate-200 active:scale-95 text-slate-700 shadow-xs transition flex items-center justify-center cursor-pointer border-b-2"
          title="Backspace"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      onClickCapture={handleContainerClickCapture}
      className="min-h-screen bg-[#F8F6F0] flex flex-col justify-between max-w-md mx-auto w-full relative select-none shadow-2xl font-sans"
    >
      {/* 1. Top Persistent Practice Banner */}
      <div className="bg-amber-50 border-b border-amber-200/90 px-3 py-1.5 flex items-center justify-between text-xs font-semibold text-amber-950 z-40">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (state.screen !== 'HOME') {
                dispatch({ type: 'GO_HOME' });
              } else {
                onExit();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-slate-800 text-[11px] font-bold hover:bg-amber-100 transition cursor-pointer"
            title="பின்செல் (Back)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.back}</span>
          </button>
          <div className="flex items-center gap-1 text-[11px] text-amber-900 font-bold">
            <Info className="w-3.5 h-3.5 text-amber-700" />
            <span>Practice mode – not a real app</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!state.isDemoActive && phase === 'COMPLETED' && (
            <button
              onClick={() => {
                dispatch({ type: 'RESET' });
                dispatch({ type: 'SET_DEMO_ACTIVE', active: true });
                setPhase('DEMO');
                setTestAttempt(1);
                setTestMistakes(0);
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-800 text-white text-[10px] font-bold hover:bg-teal-900 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3 h-3 text-amber-300" />
              <span>Replay Demo</span>
            </button>
          )}

          <button
            onClick={() => onOpenDoubt('FirstTapPay: Lesson 1 Send Money')}
            className="text-[11px] text-amber-900 hover:text-amber-950 font-bold underline cursor-pointer"
          >
            {t.askSelvi}
          </button>
        </div>
      </div>

      {/* Test Instruction Banner */}
      {phase === 'TEST' && (
        <div className="bg-amber-100/95 border-b border-amber-300 px-3 py-2 flex items-center justify-between text-xs font-bold text-amber-950 z-40 animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-teal-800 text-white text-[10px] font-extrabold">
              Test {testAttempt}/3
            </span>
            <span className="line-clamp-1">
              {language === 'ta'
                ? `ரவிக்கு ₹${currentTestAmount} அனுப்பவும் (90000 00000)`
                : language === 'hi'
                ? `रवि को ₹${currentTestAmount} भेजें (90000 00000)`
                : `Send ${currentTestAmount} rupees to Ravi (90000 00000)`}
            </span>
          </div>
          {testMistakes > 0 && (
            <span className="text-[11px] text-red-700 font-bold shrink-0">
              Mistakes: {testMistakes}/3
            </span>
          )}
        </div>
      )}

      {/* 2. DEMO Runner Overlay Engine */}
      <DemoRunnerOverlay
        language={language}
        lesson={LESSON_1_SEND_MONEY}
        containerRef={containerRef}
        isActive={state.isDemoActive}
        isExternalPaused={isPausedForMic}
        onStepProgress={(idx, step, cap) => {
          setDemoStepIndex(idx);
          setDemoCaption(cap);
        }}
        onDemoComplete={() => {
          startTestMode(testAttempt);
        }}
        onStopLetMeTry={() => {
          console.log('[demo] Learner stopped demo to try');
          startTestMode(testAttempt);
        }}
      />

      {/* 2b. Always-Visible Mic ("Ask Selvi") - visible during demo, test, and between steps */}
      <AskSelviMic
        language={language}
        lessonId={LESSON_1_SEND_MONEY.id}
        stepId={LESSON_1_SEND_MONEY.steps[demoStepIndex]?.id || 'step_1_home_point'}
        stepNumber={demoStepIndex + 1}
        stepCaption={demoCaption || LESSON_1_SEND_MONEY.steps[demoStepIndex]?.say[language] || ''}
        screenName={state.screen}
        phase={state.isDemoActive ? 'demo' : 'test'}
        mistakes={mistakesCount}
        onPause={() => {
          setIsPausedForMic(true);
        }}
        onResume={async () => {
          // Speak that step's line once and continue
          const currentStep = LESSON_1_SEND_MONEY.steps[demoStepIndex];
          if (currentStep) {
            const line = currentStep.say[language] || currentStep.say.en;
            await voiceManager.speakAsync(line, language);
          }
          setIsPausedForMic(false);
        }}
      />

      {/* TAP HERE Pointer during TEST mode (Wrong tap or 8s Idle) */}
      {phase === 'TEST' && hintPos && (
        <div
          className="absolute transition-all duration-300 ease-out z-[75] pointer-events-none"
          style={{
            left: `${hintPos.x}%`,
            top: `${hintPos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Pulsing Tap Ripple */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-16 h-16 rounded-full bg-amber-400/60 animate-ping" />
            <span className="w-8 h-8 rounded-full bg-teal-400/80 animate-pulse" />
          </div>

          {/* Hand Pointer Icon with multilingual label */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-teal-500/40 animate-bounce">
              <MousePointerClick className="w-6 h-6 fill-slate-950 text-white" />
            </div>

            <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-950/90 text-amber-300 text-[10px] font-bold shadow-lg border border-amber-400/40 whitespace-nowrap">
              {language === 'ta' ? 'இங்கே தொடவும்' : language === 'hi' ? 'यहाँ टैप करें' : 'Tap here'}
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Sandbox Screens under One State */}
      <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
        {/* ================= SCREEN 1: HOME ================= */}
        {state.screen === 'HOME' && (
          <div className="space-y-4">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  G
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Google Pay (Practice)</span>
                  <span className="text-[10px] text-slate-500">Secure UPI Sandbox</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <Search className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Bank balance card: data-demo-id="balance-card" */}
            <div data-demo-id="balance-card" className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Practice Bank • 1234</h4>
                  <p className="text-[10px] text-slate-400">Primary simulated account</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#0D5C63] font-bold block">Check balance &gt;</span>
                  <span className="text-xs font-extrabold text-slate-800">₹ 5,000</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid: data-demo-id="tile-grid" */}
            <div data-demo-id="tile-grid">
              <h5 className="text-xs font-bold text-slate-700 mb-2">
                Payment and transfers
              </h5>
              <div className="grid grid-cols-4 gap-2 text-center">
                {/* 1. Send Money: data-demo-id="tile-send-money" */}
                <button
                  data-demo-id="tile-send-money"
                  onClick={() => dispatch({ type: 'START_SEND_MONEY' })}
                  className="p-2.5 rounded-2xl border border-teal-500 bg-teal-50/70 hover:bg-teal-100 shadow-xs flex flex-col items-center justify-center transition cursor-pointer active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center mb-1 text-sm font-bold shadow-xs">
                    ₹
                  </div>
                  <span className="text-[11px] font-bold text-slate-900 leading-tight">
                    Send to number
                  </span>
                </button>

                {/* 2. Bank transfer */}
                <button className="p-2.5 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-1">
                    <Building className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-slate-700 leading-tight">Bank or UPI</span>
                </button>

                {/* 3. Pay bills */}
                <button className="p-2.5 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-1">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-slate-700 leading-tight">Pay bills</span>
                </button>

                {/* 4. Recharge */}
                <button className="p-2.5 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-1">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-slate-700 leading-tight">Recharge</span>
                </button>

                {/* 5. Approve requests */}
                <button className="p-2.5 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-slate-700 leading-tight">Approve</span>
                </button>

                {/* 6. AutoPay */}
                <button className="p-2.5 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-slate-700 leading-tight">AutoPay</span>
                </button>

                {/* 7. Monthly spends */}
                <button className="p-2.5 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-slate-700 leading-tight">Spends</span>
                </button>

                {/* 8. My QR */}
                <button className="p-2.5 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-slate-700 leading-tight">My QR</span>
                </button>
              </div>
            </div>

            {/* Bottom Tab Bar */}
            <div className="border-t border-slate-200/80 pt-2 flex items-center justify-around text-slate-400 text-[10px]">
              <div className="flex flex-col items-center text-[#0D5C63] font-bold">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </div>
              <div className="flex flex-col items-center">
                <Tag className="w-4 h-4" />
                <span>Offers</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#0D5C63] text-white flex items-center justify-center shadow-xs">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-center">
                <Gift className="w-4 h-4" />
                <span>Rewards</span>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="w-4 h-4" />
                <span>History</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= SCREEN 2: SEND TO A PHONE NUMBER ================= */}
        {state.screen === 'SEND_PHONE' && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <button
                  onClick={() => dispatch({ type: 'GO_HOME' })}
                  className="p-1 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <h3 className="font-bold text-slate-900 text-sm">
                  Send to a phone number (எண்ணிற்கு அனுப்புதல்)
                </h3>
              </div>

              {/* Fictional number instruction note */}
              <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-teal-950 font-medium">
                💡 <strong>மாதிரி எண் (Practice Number):</strong> 90000 00000 (fictional number for practice)
              </div>

              {/* Phone number display input: data-demo-id="phone-input" */}
              <div
                data-demo-id="phone-input"
                className="w-full bg-white border-2 border-teal-500 rounded-2xl p-3.5 text-center shadow-xs"
              >
                <span className="text-[11px] font-bold text-slate-400 block mb-1">
                  Recipient Phone Number:
                </span>
                <span className="text-2xl font-mono font-extrabold text-slate-900 tracking-wider">
                  {state.phoneNumber || (
                    <span className="text-slate-300">90000 00000</span>
                  )}
                </span>
              </div>

              {/* When 10 digits typed: Contact Card Ravi appears with data-demo-id="contact-ravi" */}
              {state.phoneNumber.length >= 10 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="text-[11px] font-bold text-teal-800 block mb-1">
                    கண்டறியப்பட்ட நபர் (Matched Contact):
                  </span>
                  <button
                    data-demo-id="contact-ravi"
                    onClick={() =>
                      dispatch({
                        type: 'SELECT_CONTACT',
                        contact: { name: 'Ravi (ரவி)', phone: '+91 90000 00000' },
                      })
                    }
                    className="w-full p-3 rounded-2xl bg-white border-2 border-amber-400 shadow-md flex items-center justify-between text-left hover:bg-amber-50/50 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                        R
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Ravi (ரவி)</h4>
                        <p className="text-xs text-slate-500 font-mono">+91 90000 00000</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-xl bg-teal-50 text-[#0D5C63] text-xs font-bold border border-teal-200 group-hover:bg-teal-100">
                      தொடக்க &gt;
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Keypad */}
            {renderNumericKeypad(true)}
          </div>
        )}

        {/* ================= SCREEN 3: AMOUNT SCREEN ================= */}
        {state.screen === 'AMOUNT' && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <button
                  onClick={() => dispatch({ type: 'START_SEND_MONEY' })}
                  className="p-1 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <h3 className="font-bold text-slate-900 text-sm">Paying</h3>
              </div>

              {/* Recipient Details */}
              <div className="text-center pt-2">
                <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                  R
                </div>
                <h4 className="font-bold text-slate-900 text-base">Ravi (ரவி)</h4>
                <p className="text-xs text-slate-500 font-mono">{state.selectedContact?.phone || '+91 90000 00000'}</p>
              </div>

              {/* Amount Display: data-demo-id="amount-display" */}
              <div
                data-demo-id="amount-display"
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs"
              >
                <span className="text-xs font-bold text-slate-400 block mb-1">
                  தொகை (Enter Amount):
                </span>
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  ₹ {state.amount || '0'}
                </span>
              </div>
            </div>

            {/* Sliding Pay Bar at Bottom: data-demo-id="pay-btn" */}
            <div className="space-y-3">
              {Number(state.amount) > 0 && (
                <div className="animate-in slide-in-from-bottom-3 duration-300">
                  <button
                    data-demo-id="pay-btn"
                    onClick={() => dispatch({ type: 'TAP_PAY' })}
                    className="w-full min-h-[56px] py-4 rounded-2xl bg-[#0D5C63] hover:bg-[#09454A] text-white font-bold text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                  >
                    <span>Pay ₹ {state.amount} (பணம் செலுத்து)</span>
                  </button>
                </div>
              )}

              {/* Keypad */}
              {renderNumericKeypad(true)}
            </div>
          </div>
        )}

        {/* ================= SCREEN 4: PIN SCREEN ================= */}
        {state.screen === 'PIN' && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <button
                  onClick={() => dispatch({ type: 'SELECT_CONTACT', contact: state.selectedContact || { name: 'Ravi', phone: '+91 90000 00000' } })}
                  className="p-1 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <h3 className="font-bold text-slate-900 text-sm">Enter UPI PIN</h3>
              </div>

              <div className="text-center pt-2 space-y-1">
                <p className="text-xs text-slate-500">
                  Paying ₹ {state.amount || '100'} to Ravi
                </p>
                <p className="text-xs font-bold text-slate-800">
                  மாதிரி PIN (Practice PIN: 1234)
                </p>

                {/* 4 PIN Dots: data-demo-id="pin-dots" */}
                <div
                  data-demo-id="pin-dots"
                  className="flex justify-center items-center gap-4 py-4"
                >
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        idx < state.pin.length
                          ? 'bg-slate-900 border-slate-900 scale-125'
                          : 'border-slate-300 bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-950 font-medium text-center">
                🔒 <strong>பாதுகாப்பு விதி:</strong> பணம் அனுப்ப மட்டுமே PIN தேவை. யாரிடமும் PIN சொல்லக்கூடாது.
              </div>
            </div>

            {/* Keypad */}
            {renderNumericKeypad(true)}
          </div>
        )}

        {/* ================= SCREEN 5: SUCCESS SCREEN ================= */}
        {state.screen === 'SUCCESS' && (
          <div className="my-auto text-center space-y-4 p-4">
            {/* Success Card: data-demo-id="success-card" */}
            <div
              data-demo-id="success-card"
              className="bg-white rounded-3xl p-6 border-2 border-emerald-400 shadow-xl space-y-4 animate-in zoom-in-95 duration-300"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-1">
                  வெற்றிகரமாக அனுப்பப்பட்டது!
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  ₹ {state.amount || '50'} Sent (Practice)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  To: Ravi (ரவி) · +91 90000 00000
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Transaction:</span>
                  <span className="font-mono font-bold text-slate-800">TXN-DEMO-98401</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Debited from:</span>
                  <span className="font-bold text-slate-800">Bank • 1234 (Practice)</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 font-medium">
                ✨ நீங்கள் பயிற்சி சுற்றை வெற்றிகரமாக முடித்துவிட்டீர்கள்!
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {phase === 'COMPLETED' && (
                <button
                  onClick={() => {
                    dispatch({ type: 'RESET' });
                    dispatch({ type: 'SET_DEMO_ACTIVE', active: true });
                    setPhase('DEMO');
                    setTestAttempt(1);
                    setTestMistakes(0);
                  }}
                  className="w-full min-h-[52px] py-3 rounded-2xl bg-[#0D5C63] hover:bg-[#09454A] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-amber-300" />
                  <span>Watch Demo Again (மீண்டும் பார்க்க)</span>
                </button>
              )}

              <button
                onClick={() => dispatch({ type: 'GO_HOME' })}
                className="w-full py-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Back to Home (முகப்புக்கு செல்ல)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
