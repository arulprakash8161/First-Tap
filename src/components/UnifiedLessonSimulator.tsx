import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  MoreVertical,
  ArrowLeft,
  Paperclip,
  Send,
  Mic,
  Camera,
  ImageIcon,
  FileText,
  MapPin,
  User,
  Phone,
  Video,
  Volume2,
  MicOff,
  PhoneOff,
  Check,
  CheckCheck,
  Plus,
  Play,
  X,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  Info,
  MousePointer,
  Home,
  CheckCircle2,
  Delete,
  Building,
  Tag,
  Gift,
  Clock,
  QrCode,
  Repeat,
  BarChart3,
  CheckSquare,
} from 'lucide-react';
import { LanguageCode } from '../types';
import {
  ALL_LESSONS,
  LessonDefinition,
  PracticeTaskData,
  PracticeStep,
  DemoStep,
} from '../lib/allLessonsData';
import { voiceManager } from '../lib/voice';

export interface UnifiedLessonSimulatorProps {
  lessonId: number;
  language: LanguageCode;
  onGoHome: () => void;
  onGoLessonList: () => void;
  onNextLesson: (nextId: number) => void;
  onOpenMic: () => void;
  isPausedForMic?: boolean;
}

export const UnifiedLessonSimulator: React.FC<UnifiedLessonSimulatorProps> = ({
  lessonId,
  language,
  onGoHome,
  onGoLessonList,
  onNextLesson,
  onOpenMic,
  isPausedForMic = false,
}) => {
  const isTamil = language === 'ta';

  // Find active lesson definition
  const lesson: LessonDefinition =
    ALL_LESSONS.find((l) => l.id === lessonId) || ALL_LESSONS[0];

  // Simulator phases: 'DEMO' | 'PRACTICE_ROUND_1' | 'PRACTICE_ROUND_2' | 'COMPLETE'
  const [phase, setPhase] = useState<'DEMO' | 'PRACTICE_ROUND_1' | 'PRACTICE_ROUND_2' | 'COMPLETE'>('DEMO');

  // Step indexes
  const [demoStepIndex, setDemoStepIndex] = useState<number>(0);
  const [practiceStepIndex, setPracticeStepIndex] = useState<number>(0);
  const [demoCaption, setDemoCaption] = useState<string>('');

  // Practice task data for Round 1 & Round 2
  const [practiceRoundData, setPracticeRoundData] = useState(() => lesson.createPractice(1));

  // Visual cues
  const [isTargetGlowing, setIsTargetGlowing] = useState<boolean>(false);
  const [wrongTapMessage, setWrongTapMessage] = useState<string | null>(null);
  const [isWrongTargetShaking, setIsWrongTargetShaking] = useState<boolean>(false);

  // Demo cursor animation
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 50, y: 70 });
  const [pointerVisible, setPointerVisible] = useState<boolean>(false);
  const [isRippling, setIsRippling] = useState<boolean>(false);

  // Sub-screens
  // For WhatsApp: 'HOME' | 'NEW_CONTACT' | 'SEARCH' | 'CHAT' | 'SHARING_MENU' | 'PHOTO_PICKER' | 'LOCATION' | 'CALL'
  // For GPay: 'HOME' | 'SEND_PHONE' | 'AMOUNT' | 'PIN' | 'SUCCESS'
  const [screen, setScreen] = useState<string>('HOME');
  const [activeTab, setActiveTab] = useState<'chats' | 'calls' | 'help'>('chats');

  // Input states
  const [contactNameInput, setContactNameInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [chatInputText, setChatInputText] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [hasSentPhoto, setHasSentPhoto] = useState<boolean>(false);
  const [hasSentLocation, setHasSentLocation] = useState<boolean>(false);
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  const [hasReply, setHasReply] = useState<boolean>(false);

  // Refs for stable tracking (solving PART B stale closure and wrong-tap bugs)
  const phoneContainerRef = useRef<HTMLDivElement | null>(null);
  const abortDemoRef = useRef<boolean>(false);
  const lastSpokenKeyRef = useRef<string>('');
  const lastTapTimeRef = useRef<number>(0);

  // Timers
  const idleGlowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleVoiceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleVoiceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // The active practice step
  const currentPracticeStep: PracticeStep | undefined =
    practiceRoundData.steps[practiceStepIndex] || practiceRoundData.steps[0];

  // Ref tracking expectedTargetId to prevent race conditions & stale state
  const expectedTargetIdRef = useRef<string>(currentPracticeStep?.targetId || '');
  expectedTargetIdRef.current = currentPracticeStep?.targetId || '';

  // Sleep utility with abort check
  const sleep = (ms: number) =>
    new Promise((resolve) => {
      const start = Date.now();
      const interval = setInterval(() => {
        if (abortDemoRef.current || Date.now() - start >= ms) {
          clearInterval(interval);
          resolve(true);
        }
      }, 30);
    });

  // Clear idle timers
  const clearPracticeIdleTimers = useCallback(() => {
    if (idleGlowTimerRef.current) clearTimeout(idleGlowTimerRef.current);
    if (idleVoiceTimerRef.current) clearTimeout(idleVoiceTimerRef.current);
    if (idleVoiceIntervalRef.current) clearInterval(idleVoiceIntervalRef.current);
    idleGlowTimerRef.current = null;
    idleVoiceTimerRef.current = null;
    idleVoiceIntervalRef.current = null;
  }, []);

  // Safe speak function waiting for onend with 15s fallback
  const speakLine = useCallback(
    async (text: string, key?: string) => {
      if (key) {
        if (lastSpokenKeyRef.current === key) return;
        lastSpokenKeyRef.current = key;
      }
      await voiceManager.speakAsync(text, language, {
        fallbackTimeoutMs: 15000,
        cancelPrevious: false,
      });
    },
    [language]
  );

  // Start idle timers for practice step
  const startPracticeIdleTimers = useCallback(
    (step: PracticeStep, stepIdx: number) => {
      clearPracticeIdleTimers();
      setIsTargetGlowing(false);

      const instruction = isTamil ? step.say.ta : step.say.en;
      const stepKey = `practice_${lesson.id}_${phase}_${stepIdx}`;
      speakLine(instruction, stepKey);

      // Timer 1: at 5 seconds show pulsing glow and bouncing arrow
      idleGlowTimerRef.current = setTimeout(() => {
        setIsTargetGlowing(true);
      }, 5000);

      // Timer 2: at 7 seconds repeat voice reminder
      idleVoiceTimerRef.current = setTimeout(() => {
        voiceManager.speakAsync(instruction, language, { fallbackTimeoutMs: 12000 });
        idleVoiceIntervalRef.current = setInterval(() => {
          voiceManager.speakAsync(instruction, language, { fallbackTimeoutMs: 12000 });
        }, 7000);
      }, 7000);
    },
    [clearPracticeIdleTimers, isTamil, lesson.id, phase, speakLine, language]
  );

  // Reset simulator
  const resetSimulator = useCallback(
    (targetPhase: 'DEMO' | 'PRACTICE_ROUND_1' | 'PRACTICE_ROUND_2', roundNumber: 1 | 2 = 1) => {
      voiceManager.stop();
      abortDemoRef.current = true;
      clearPracticeIdleTimers();

      setPhase(targetPhase);
      setDemoStepIndex(0);
      setPracticeStepIndex(0);
      setContactNameInput('');
      setPhoneInput('');
      setSearchQuery('');
      setChatInputText('');
      setAmountInput('');
      setPinInput('');
      setHasSentPhoto(false);
      setHasSentLocation(false);
      setSentMessages([]);
      setHasReply(false);
      setWrongTapMessage(null);
      setIsWrongTargetShaking(false);
      setIsTargetGlowing(false);
      setPointerVisible(false);
      setActiveTab('chats');
      lastSpokenKeyRef.current = '';

      // Starting screen
      if (lesson.app === 'whatsapp') {
        if (lesson.id === 1 || lesson.id === 2) {
          setScreen('HOME');
        } else {
          setScreen('CHAT');
        }
      } else {
        setScreen('HOME');
      }

      if (targetPhase === 'PRACTICE_ROUND_1' || targetPhase === 'PRACTICE_ROUND_2') {
        const newData = lesson.createPractice(roundNumber);
        setPracticeRoundData(newData);
        expectedTargetIdRef.current = newData.steps[0].targetId;
        setTimeout(() => {
          startPracticeIdleTimers(newData.steps[0], 0);
        }, 300);
      }
    },
    [clearPracticeIdleTimers, lesson, startPracticeIdleTimers]
  );

  // Switch lesson or phase reset
  useEffect(() => {
    resetSimulator('DEMO');
  }, [lessonId]);

  // Demo Runner Loop
  useEffect(() => {
    if (phase !== 'DEMO' || isPausedForMic) return;

    abortDemoRef.current = false;
    let isSubscribed = true;

    const runDemo = async () => {
      await sleep(350);

      for (let i = 0; i < lesson.demoSteps.length; i++) {
        if (abortDemoRef.current || !isSubscribed || isPausedForMic) return;

        const step = lesson.demoSteps[i];
        setDemoStepIndex(i);

        const captionText = isTamil ? step.say.ta : step.say.en;
        setDemoCaption(captionText);
        setScreen(step.screen);

        // Speak instruction once and wait for onend with 15s fallback
        const stepKey = `demo_${lesson.id}_${i}`;
        await speakLine(captionText, stepKey);

        // Natural pause of ~1.0 second after voice finishes before action
        await sleep(1000);
        if (abortDemoRef.current || !isSubscribed || isPausedForMic) return;

        // Perform Demo Action
        if (step.action === 'tap') {
          const targetEl = phoneContainerRef.current?.querySelector(
            `[data-demo-id="${step.targetId}"]`
          ) as HTMLElement;

          if (targetEl && !abortDemoRef.current) {
            // Smooth cursor move
            const phoneRect = phoneContainerRef.current!.getBoundingClientRect();
            const elRect = targetEl.getBoundingClientRect();
            const x = ((elRect.left + elRect.width / 2 - phoneRect.left) / phoneRect.width) * 100;
            const y = ((elRect.top + elRect.height / 2 - phoneRect.top) / phoneRect.height) * 100;

            setPointerPos({ x: Math.min(94, Math.max(6, x)), y: Math.min(94, Math.max(6, y)) });
            setPointerVisible(true);
            await sleep(650);

            setIsRippling(true);
            await sleep(180);
            setIsRippling(false);

            targetEl.click();
            await sleep(850);
          }
        } else if (step.action === 'type' && step.textToType) {
          const targetEl = phoneContainerRef.current?.querySelector(
            `[data-demo-id="${step.targetId}"]`
          ) as HTMLElement;

          if (targetEl && !abortDemoRef.current) {
            const phoneRect = phoneContainerRef.current!.getBoundingClientRect();
            const elRect = targetEl.getBoundingClientRect();
            const x = ((elRect.left + elRect.width / 2 - phoneRect.left) / phoneRect.width) * 100;
            const y = ((elRect.top + elRect.height / 2 - phoneRect.top) / phoneRect.height) * 100;

            setPointerPos({ x: Math.min(94, Math.max(6, x)), y: Math.min(94, Math.max(6, y)) });
            setPointerVisible(true);
            await sleep(600);

            setIsRippling(true);
            await sleep(150);
            setIsRippling(false);

            // Typing effect
            let typed = '';
            for (const ch of step.textToType.split('')) {
              if (abortDemoRef.current || !isSubscribed) return;
              typed += ch;

              if (step.targetId === 'contact-name-input') setContactNameInput(typed);
              else if (step.targetId === 'contact-phone-input') setPhoneInput(typed);
              else if (step.targetId === 'phone-input') setPhoneInput(typed);
              else if (step.targetId === 'search-input-field') setSearchQuery(typed);
              else if (step.targetId === 'chat-input-field') setChatInputText(typed);
              else if (step.targetId === 'pin-dots') setPinInput(typed);

              await sleep(160);
            }
            await sleep(750);
          }
        } else if (step.action === 'wait') {
          setPointerVisible(false);
          if (step.waitMs) {
            await sleep(step.waitMs);
          }
        }

        if (abortDemoRef.current || !isSubscribed || isPausedForMic) return;
        await sleep(500);
      }

      // Auto start Practice within 2 seconds
      if (isSubscribed && !abortDemoRef.current && !isPausedForMic) {
        await sleep(750);
        setPointerVisible(false);

        const tryMsg = isTamil
          ? 'இப்போது உங்கள் முறை. நீங்களே முயற்சி செய்யுங்கள்.'
          : "Now it's your turn. Try it yourself.";
        setDemoCaption(tryMsg);
        await voiceManager.speakAsync(tryMsg, language, { fallbackTimeoutMs: 6000 });
        await sleep(500);

        if (isSubscribed && !abortDemoRef.current) {
          resetSimulator('PRACTICE_ROUND_1', 1);
        }
      }
    };

    runDemo();

    return () => {
      isSubscribed = false;
      abortDemoRef.current = true;
      voiceManager.stop();
    };
  }, [phase, lesson, language, isPausedForMic, isTamil, resetSimulator, speakLine]);

  // Advance practice step logic
  const advancePracticeStep = useCallback(
    (stepId: string, completionSpoken?: boolean) => {
      clearPracticeIdleTimers();
      setWrongTapMessage(null);
      setIsWrongTargetShaking(false);
      setIsTargetGlowing(false);

      const nextIndex = practiceStepIndex + 1;

      // Check if finished current practice round
      if (nextIndex >= practiceRoundData.steps.length) {
        if (phase === 'PRACTICE_ROUND_1') {
          // Transition to Round 2 with fresh random data!
          const r2Msg = isTamil
            ? 'அருமை! இப்போது புதிய விவரங்களுடன் மீண்டும் ஒரு முறை முயற்சிப்போம்.'
            : "Great job! Now let's try once more with new data.";
          speakLine(r2Msg, `r2_intro_${lesson.id}`);
          setTimeout(() => {
            resetSimulator('PRACTICE_ROUND_2', 2);
          }, 1500);
        } else {
          // Finished Round 2 -> Complete!
          setPhase('COMPLETE');
          const succMsg = isTamil ? lesson.successMessage.ta : lesson.successMessage.en;
          speakLine(succMsg, `success_${lesson.id}`);
        }
      } else {
        setPracticeStepIndex(nextIndex);
        const nextStep = practiceRoundData.steps[nextIndex];
        expectedTargetIdRef.current = nextStep.targetId;

        // If a completion speech line was already playing, start timers after slight delay
        setTimeout(() => {
          startPracticeIdleTimers(nextStep, nextIndex);
        }, completionSpoken ? 1000 : 300);
      }
    },
    [clearPracticeIdleTimers, practiceStepIndex, practiceRoundData.steps, phase, isTamil, speakLine, lesson, resetSimulator, startPracticeIdleTimers]
  );

  // AUTO ADVANCE ON CORRECT PHONE NUMBER TYPED (Fix A2)
  useEffect(() => {
    if (phase !== 'PRACTICE_ROUND_1' && phase !== 'PRACTICE_ROUND_2') return;

    // Check if current step is typing phone number
    if (currentPracticeStep?.actionType === 'type' && (currentPracticeStep.targetId === 'phone-input' || currentPracticeStep.targetId === 'contact-phone-input')) {
      const cleanTyped = phoneInput.replace(/\s+/g, '');
      const cleanExpected = practiceRoundData.task.phoneRaw.replace(/\s+/g, '');

      if (cleanTyped.length >= 10 && cleanTyped === cleanExpected) {
        // Fix A2: mark step complete, voice says "Good. Now tap Continue", move glow to Continue
        const goodMsg = isTamil
          ? 'நன்று. இப்போது தொடரவும் என்பதைத் தொடவும்.'
          : 'Good. Now tap Continue.';
        voiceManager.speakAsync(goodMsg, language, { cancelPrevious: true });
        advancePracticeStep(currentPracticeStep.id, true);
      }
    }
  }, [phoneInput, currentPracticeStep, practiceRoundData.task.phoneRaw, phase, isTamil, language, advancePracticeStep]);

  // Click capture listener for wrong tap handling (Fix PART B)
  const handlePhoneContainerClickCapture = (e: React.MouseEvent) => {
    if (phase !== 'PRACTICE_ROUND_1' && phase !== 'PRACTICE_ROUND_2') return;

    // Prevent double-firing (touchstart + click)
    const now = Date.now();
    if (now - lastTapTimeRef.current < 250) {
      return;
    }
    lastTapTimeRef.current = now;

    const clickTarget = e.target as HTMLElement;
    const expectedId = expectedTargetIdRef.current;
    if (!expectedId) return;

    // Find the expected element in DOM
    const targetEl = phoneContainerRef.current?.querySelector(
      `[data-demo-id="${expectedId}"]`
    ) as HTMLElement | null;

    // PART B: Compare tapped element's id and accept any descendant child!
    const isDirectMatch =
      clickTarget.getAttribute('data-demo-id') === expectedId ||
      clickTarget.closest(`[data-demo-id="${expectedId}"]`) !== null;

    const isInsideExpected = targetEl ? targetEl.contains(clickTarget) : false;

    if (isDirectMatch || isInsideExpected) {
      // Correct tap! Clear wrong message and let it through!
      setWrongTapMessage(null);
      setIsWrongTargetShaking(false);
      return;
    }

    // Allow typing on keypad during numeric entry without wrong tap warning
    if (clickTarget.closest('button[data-demo-id^="key-"]') || clickTarget.tagName === 'INPUT') {
      return;
    }

    // Truly wrong tap!
    e.preventDefault();
    e.stopPropagation();

    setIsWrongTargetShaking(true);
    setIsTargetGlowing(true); // Keep glowing!

    const wrongMsg = isTamil
      ? 'இந்த பொத்தான் அல்ல, ஒளிரும் பொத்தானைத் தொடவும்.'
      : 'Not this one, tap the glowing button.';
    setWrongTapMessage(wrongMsg);
    voiceManager.speakAsync(wrongMsg, language, { cancelPrevious: true });

    setTimeout(() => setIsWrongTargetShaking(false), 500);
    setTimeout(() => setWrongTapMessage(null), 2500);
  };

  // Handlers for specific lesson actions
  const handleKeypadPress = (digit: string) => {
    if (screen === 'SEND_PHONE') {
      if (phoneInput.length >= 11) return;
      setPhoneInput((prev) => prev + digit);
    } else if (screen === 'AMOUNT') {
      if (amountInput.length >= 5) return;
      setAmountInput((prev) => prev + digit);
    } else if (screen === 'PIN') {
      if (pinInput.length >= 4) return;
      const newPin = pinInput + digit;
      setPinInput(newPin);
      if (newPin.length === 4) {
        setTimeout(() => {
          setScreen('SUCCESS');
          advancePracticeStep('gp_p5');
        }, 500);
      }
    }
  };

  const handleKeypadBackspace = () => {
    if (screen === 'SEND_PHONE') setPhoneInput((prev) => prev.slice(0, -1));
    else if (screen === 'AMOUNT') setAmountInput((prev) => prev.slice(0, -1));
    else if (screen === 'PIN') setPinInput((prev) => prev.slice(0, -1));
  };

  const handleSaveContact = () => {
    setScreen('HOME');
    advancePracticeStep('p1_s4');
  };

  const handleSendMessage = () => {
    const text = chatInputText.trim() || (isTamil ? 'வணக்கம்' : 'Hello');
    setSentMessages((prev) => [...prev, text]);
    setChatInputText('');
    setTimeout(() => setHasReply(true), 1200);
    advancePracticeStep('p2_s6');
  };

  const currentGuideText =
    phase === 'DEMO'
      ? demoCaption
      : isTamil
      ? currentPracticeStep?.say.ta
      : currentPracticeStep?.say.en;

  return (
    <div className="min-h-screen bg-[#1E293B] text-slate-100 flex flex-col justify-between items-center py-2 px-2 sm:px-4 font-sans select-none">
      {/* 1. TOP HEADER & APP/LESSON TITLE */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between gap-2 mb-2 bg-slate-900/90 p-2.5 sm:p-3 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={onGoLessonList}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer"
            title={isTamil ? 'பாடங்கள் பட்டியல்' : 'Back to Lessons'}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isTamil ? 'பாடங்கள்' : 'Lessons'}</span>
          </button>
          <button
            onClick={onGoHome}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer"
            title={isTamil ? 'முகப்பு' : 'Home'}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{isTamil ? 'முகப்பு' : 'Home'}</span>
          </button>
        </div>

        <div className="text-center truncate px-1">
          <h2 className="text-xs sm:text-sm font-bold text-white truncate">
            {isTamil ? lesson.title.ta : lesson.title.en}
          </h2>
        </div>

        {/* Phase Badge */}
        <span
          className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider ${
            phase === 'DEMO'
              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
              : phase === 'PRACTICE_ROUND_1'
              ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
              : phase === 'PRACTICE_ROUND_2'
              ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
              : 'bg-purple-400/20 text-purple-300 border border-purple-400/40'
          }`}
        >
          {phase === 'DEMO'
            ? isTamil ? 'விளக்கம்' : 'Demo'
            : phase === 'PRACTICE_ROUND_1'
            ? isTamil ? 'பயிற்சி 1' : 'Round 1'
            : phase === 'PRACTICE_ROUND_2'
            ? isTamil ? 'பயிற்சி 2' : 'Round 2'
            : isTamil ? 'வெற்றி' : 'Done'}
        </span>
      </header>

      {/* 2. CENTERED PHONE-SHAPED FRAME */}
      <main className="flex-1 flex flex-col items-center justify-center w-full my-auto">
        <div
          ref={phoneContainerRef}
          onClickCapture={handlePhoneContainerClickCapture}
          className="relative w-full max-w-[370px] sm:max-w-[390px] h-[740px] sm:h-[780px] bg-white rounded-[40px] shadow-2xl overflow-hidden border-[8px] sm:border-[10px] border-slate-900 flex flex-col select-none ring-1 ring-slate-800"
        >
          {/* Top Phone Cutout */}
          <div className="h-5 bg-slate-900 z-50 flex items-center justify-center shrink-0">
            <div className="w-20 h-3 bg-black rounded-b-xl flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-800 rounded-full" />
            </div>
          </div>

          {/* ================= FIX A3: TOP BAR LAYOUT ================= */}
          {/* Row 1: Back, Replay Demo, Microphone on ONE row */}
          <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between z-40 shrink-0 gap-1.5">
            <button
              onClick={onGoHome}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 text-[11px] font-bold hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>{isTamil ? 'முகப்பு' : 'Home'}</span>
            </button>

            <button
              onClick={() => resetSimulator('DEMO')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-[11px] font-bold cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3 h-3 text-amber-300" />
              <span>{isTamil ? 'மீண்டும் பார்க்க' : 'Replay Demo'}</span>
            </button>

            <button
              onClick={onOpenMic}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer shadow-2xs animate-pulse"
              title={isTamil ? 'கேளுங்கள்' : 'Talk Now'}
            >
              <Mic className="w-3 h-3" />
              <span>{isTamil ? 'கேளுங்கள்' : 'Talk Now'}</span>
            </button>
          </div>

          {/* Row 2: Practice mode banner on its own small line */}
          <div className="bg-[#FFF6D6] border-b border-[#F0E6B9] px-2 py-0.5 text-center text-[10px] font-semibold text-slate-700 z-40 shrink-0">
            <span>{isTamil ? 'பயிற்சி பயன்முறை — உண்மையான செயலி அல்ல' : 'Practice mode — not a real app'}</span>
          </div>

          {/* Row 3: Task Banner & Step Badge during practice */}
          {(phase === 'PRACTICE_ROUND_1' || phase === 'PRACTICE_ROUND_2') && (
            <div className="bg-amber-100 border-b border-amber-300 px-3 py-1.5 flex items-center justify-between text-xs font-bold text-amber-950 z-40 shrink-0 shadow-xs gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping shrink-0" />
                <span className="text-[11px] leading-tight truncate">
                  <strong>{isTamil ? 'பணி:' : 'Task:'}</strong>{' '}
                  {isTamil ? practiceRoundData.task.taskBanner.ta : practiceRoundData.task.taskBanner.en}
                </span>
              </div>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold shrink-0">
                {isTamil ? `படி ${practiceStepIndex + 1} / ${practiceRoundData.steps.length}` : `Step ${practiceStepIndex + 1} of ${practiceRoundData.steps.length}`}
              </span>
            </div>
          )}

          {/* ================= APPLICATION BODY: WHATSAPP ================= */}
          {lesson.app === 'whatsapp' && (
            <div className="flex-1 flex flex-col justify-between bg-white relative overflow-hidden">
              {/* SCREEN: HOME */}
              {screen === 'HOME' && (
                <div className="flex-1 flex flex-col justify-between bg-white overflow-hidden">
                  <div className="bg-[#008069] text-white px-4 pt-2.5 pb-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold tracking-tight">WhatsApp</h2>
                      <div className="flex items-center gap-3">
                        <button
                          data-demo-id="search-icon-btn"
                          onClick={() => {
                            setScreen('SEARCH');
                            advancePracticeStep('p2_s1');
                          }}
                          className="p-1 rounded-full hover:bg-teal-700/60 cursor-pointer"
                        >
                          <Search className="w-4 h-4 text-white" />
                        </button>
                        <button className="p-1 rounded-full hover:bg-teal-700/60 cursor-pointer">
                          <MoreVertical className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <button className="bg-[#0F6B60] text-white px-3 py-0.5 rounded-full font-medium">All</button>
                      <button className="bg-[#EFEAE2] text-[#54656F] px-3 py-0.5 rounded-full font-medium">Unread</button>
                      <button className="bg-[#EFEAE2] text-[#54656F] px-3 py-0.5 rounded-full font-medium">Family</button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-[#F2F2F2]">
                    {activeTab === 'chats' ? (
                      <>
                        <div
                          data-demo-id="search-result-amma"
                          onClick={() => {
                            setScreen('CHAT');
                            advancePracticeStep('p2_s3');
                          }}
                          className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#C2E7FF] text-[#004A77] font-bold flex items-center justify-center">
                            A
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <h4 className="font-bold text-xs text-[#111B21]">Amma (அம்மா)</h4>
                              <span className="text-[10px] text-[#667781]">10:42</span>
                            </div>
                            <p className="text-xs text-[#667781] truncate">Have you eaten lunch?</p>
                          </div>
                        </div>

                        <div
                          data-demo-id="search-result-ravi"
                          onClick={() => {
                            setScreen('CHAT');
                            advancePracticeStep('p2_s3');
                          }}
                          className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#FFE082] text-[#6D4C41] font-bold flex items-center justify-center">
                            R
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <h4 className="font-bold text-xs text-[#111B21]">Ravi (ரவி)</h4>
                              <span className="text-[10px] text-[#667781]">Yesterday</span>
                            </div>
                            <p className="text-xs text-[#667781] truncate">Hello!</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#C2E7FF] text-[#004A77] font-bold text-xs flex items-center justify-center">A</div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">Amma</p>
                              <p className="text-[10px] text-emerald-600">↗ Incoming call (2 mins)</p>
                            </div>
                          </div>
                          <Phone className="w-4 h-4 text-[#008069]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FAB */}
                  {activeTab === 'chats' && (
                    <button
                      data-demo-id="new-contact-fab"
                      onClick={() => {
                        setScreen('NEW_CONTACT');
                        advancePracticeStep('p1_s1');
                      }}
                      className="absolute right-4 bottom-20 w-12 h-12 rounded-full bg-[#008069] text-white flex items-center justify-center shadow-xl hover:bg-[#075E54] cursor-pointer z-20 border-2 border-white"
                      title="New contact"
                    >
                      <Plus className="w-6 h-6 stroke-[2.5]" />
                    </button>
                  )}

                  {/* WhatsApp Bottom Nav Tabs */}
                  <div className="bg-white border-t border-slate-200 px-6 py-2 flex items-center justify-between text-xs shrink-0 z-10">
                    <button
                      onClick={() => setActiveTab('chats')}
                      className={`flex flex-col items-center gap-0.5 cursor-pointer font-bold ${
                        activeTab === 'chats' ? 'text-[#008069]' : 'text-[#667781]'
                      }`}
                    >
                      <span>Chats</span>
                      {activeTab === 'chats' && <span className="w-6 h-0.5 bg-[#008069] rounded-full" />}
                    </button>
                    <button
                      data-demo-id="bottom-tab-calls"
                      onClick={() => {
                        setActiveTab('calls');
                        advancePracticeStep('p5_s4');
                      }}
                      className={`flex flex-col items-center gap-0.5 cursor-pointer font-medium ${
                        activeTab === 'calls' ? 'text-[#008069] font-bold' : 'text-[#667781]'
                      }`}
                    >
                      <span>Calls</span>
                      {activeTab === 'calls' && <span className="w-6 h-0.5 bg-[#008069] rounded-full" />}
                    </button>
                    <button
                      onClick={() => setActiveTab('help')}
                      className={`flex flex-col items-center gap-0.5 cursor-pointer font-medium ${
                        activeTab === 'help' ? 'text-[#008069] font-bold' : 'text-[#667781]'
                      }`}
                    >
                      <span>Help</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN: NEW CONTACT */}
              {screen === 'NEW_CONTACT' && (
                <div className="flex-1 flex flex-col justify-between bg-[#FAFAFA]">
                  <div className="bg-[#008069] text-white px-3 py-2.5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setScreen('HOME')} className="p-1 rounded-full cursor-pointer">
                        <ArrowLeft className="w-4 h-4 text-white" />
                      </button>
                      <h3 className="font-bold text-xs">{isTamil ? 'புதிய தொடர்பு' : 'New contact'}</h3>
                    </div>
                    <button
                      data-demo-id="save-contact-btn"
                      onClick={handleSaveContact}
                      className="px-3 py-1 bg-white text-[#008069] rounded-full font-bold text-xs hover:bg-slate-100 cursor-pointer shadow-xs"
                    >
                      {isTamil ? 'சேமி (Save)' : 'Save'}
                    </button>
                  </div>

                  <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                    <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-500 mx-auto flex items-center justify-center border-2 border-slate-300">
                      <User className="w-8 h-8" />
                    </div>

                    <div className="space-y-3 bg-white p-3.5 rounded-2xl shadow-xs border border-slate-100">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase">
                          {isTamil ? 'பெயர் (Name)' : 'Name'}
                        </label>
                        <input
                          data-demo-id="contact-name-input"
                          type="text"
                          value={contactNameInput}
                          onChange={(e) => setContactNameInput(e.target.value)}
                          onBlur={() => {
                            if (contactNameInput.trim().length > 0) advancePracticeStep('p1_s2');
                          }}
                          placeholder={isTamil ? practiceRoundData.task.nameTa : practiceRoundData.task.name}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#008069]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase">
                          {isTamil ? 'தொலைபேசி எண்' : 'Phone'}
                        </label>
                        <input
                          data-demo-id="contact-phone-input"
                          type="tel"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder={practiceRoundData.task.phone}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#008069]"
                        />
                      </div>
                    </div>

                    <button
                      data-demo-id="save-contact-btn"
                      onClick={handleSaveContact}
                      className="w-full py-3 rounded-2xl bg-[#008069] text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isTamil ? 'சேமி (Save Contact)' : 'Save Contact'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN: SEARCH */}
              {screen === 'SEARCH' && (
                <div className="flex-1 flex flex-col justify-between bg-white">
                  <div className="bg-[#008069] text-white px-3 py-2 flex items-center gap-2 shadow-xs">
                    <button onClick={() => setScreen('HOME')} className="p-1 rounded-full cursor-pointer">
                      <ArrowLeft className="w-4 h-4 text-white" />
                    </button>
                    <input
                      data-demo-id="search-input-field"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value.length > 2) advancePracticeStep('p2_s2');
                      }}
                      placeholder={isTamil ? 'தொடர்புகளைத் தேடுங்கள்...' : 'Search contacts...'}
                      className="flex-1 bg-transparent text-white placeholder-teal-200 text-xs focus:outline-none"
                      autoFocus
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-[#F2F2F2]">
                    <div
                      data-demo-id="search-result-amma"
                      onClick={() => {
                        setScreen('CHAT');
                        advancePracticeStep('p2_s3');
                      }}
                      className="p-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#C2E7FF] text-[#004A77] font-bold flex items-center justify-center">A</div>
                      <div>
                        <h4 className="font-bold text-xs text-[#111B21]">Amma (அம்மா)</h4>
                        <p className="text-[11px] text-[#667781]">Online</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN: CHAT */}
              {screen === 'CHAT' && (
                <div className="flex-1 flex flex-col justify-between bg-[#EFEAE2] overflow-hidden">
                  <div className="bg-[#008069] text-white px-3 py-2 flex items-center justify-between shadow-xs shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        data-demo-id="chat-back-arrow"
                        onClick={() => {
                          setScreen('HOME');
                          advancePracticeStep('p5_s3');
                        }}
                        className="p-1 rounded-full cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4 text-white" />
                      </button>
                      <div className="w-7 h-7 rounded-full bg-[#C2E7FF] text-[#004A77] font-bold text-xs flex items-center justify-center">A</div>
                      <div>
                        <h4 className="font-bold text-xs leading-none">Amma</h4>
                        <span className="text-[9px] text-teal-200">online</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button data-demo-id="header-voice-call-btn" onClick={() => { setScreen('CALL'); advancePracticeStep('p5_s1'); }} className="p-1 cursor-pointer">
                        <Phone className="w-4 h-4 text-white" />
                      </button>
                      <button className="p-1 cursor-pointer">
                        <MoreVertical className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto space-y-2">
                    <div className="max-w-[80%] bg-white p-2 rounded-xl text-xs text-slate-800">
                      Have you eaten lunch? (சாப்பிட்டாயா?)
                    </div>

                    {hasSentPhoto && (
                      <div className="max-w-[75%] ml-auto bg-[#D9FDD3] p-1.5 rounded-xl text-xs">
                        <img
                          src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=300&auto=format&fit=crop&q=80"
                          alt="Photo"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {hasSentLocation && (
                      <div className="max-w-[75%] ml-auto bg-[#D9FDD3] p-2 rounded-xl text-xs text-slate-800">
                        <MapPin className="w-4 h-4 text-red-500 inline mr-1" />
                        <span className="font-bold">Location Shared (இருப்பிடம்)</span>
                      </div>
                    )}

                    {sentMessages.map((m, idx) => (
                      <div key={idx} className="max-w-[75%] ml-auto bg-[#D9FDD3] p-2 rounded-xl text-xs text-slate-800">
                        {m}
                      </div>
                    ))}

                    {hasReply && (
                      <div className="max-w-[80%] bg-white p-2 rounded-xl text-xs text-slate-800">
                        நன்றாக இருக்கிறாயா? (How are you?)
                      </div>
                    )}
                  </div>

                  {/* Input bar */}
                  <div className="bg-[#F0F2F5] p-2 flex items-center gap-1.5 border-t border-slate-200 shrink-0">
                    <div
                      data-demo-id="chat-input-box"
                      onClick={() => advancePracticeStep('p2_s4')}
                      className="flex-1 bg-white rounded-full px-3 py-1.5 flex items-center justify-between border border-slate-200"
                    >
                      <input
                        data-demo-id="chat-input-field"
                        type="text"
                        value={chatInputText}
                        onChange={(e) => {
                          setChatInputText(e.target.value);
                          if (e.target.value.length > 2) advancePracticeStep('p2_s5');
                        }}
                        placeholder={isTamil ? 'செய்தி தட்டச்சு செய்க...' : 'Type a message...'}
                        className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
                      />
                      <button
                        data-demo-id="paperclip-attach-btn"
                        onClick={() => {
                          setScreen('SHARING_MENU');
                          advancePracticeStep('p3_s1');
                          advancePracticeStep('p4_s1');
                        }}
                        className="text-slate-500 p-0.5 cursor-pointer"
                      >
                        <Paperclip className="w-4 h-4 -rotate-45" />
                      </button>
                    </div>

                    <button
                      data-demo-id="send-message-btn"
                      onClick={handleSendMessage}
                      className="w-8 h-8 rounded-full bg-[#008069] text-white flex items-center justify-center cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN: SHARING MENU */}
              {screen === 'SHARING_MENU' && (
                <div className="flex-1 flex flex-col justify-end bg-black/60">
                  <div className="bg-white rounded-t-[28px] p-4 shadow-2xl">
                    <h4 className="font-bold text-slate-800 text-xs mb-3">
                      {isTamil ? 'பகிர்வு விருப்பங்கள்' : 'Share with Amma'}
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <button
                        data-demo-id="share-menu-photo"
                        onClick={() => {
                          setScreen('PHOTO_PICKER');
                          advancePracticeStep('p3_s2');
                        }}
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#008069] text-white flex items-center justify-center shadow-md mb-1">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700">Photo</span>
                      </button>

                      <button
                        data-demo-id="share-menu-location"
                        onClick={() => {
                          setScreen('LOCATION');
                          advancePracticeStep('p4_s2');
                        }}
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#D84315] text-white flex items-center justify-center shadow-md mb-1">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700">Location</span>
                      </button>

                      <div className="flex flex-col items-center opacity-60">
                        <div className="w-12 h-12 rounded-full bg-[#1E88E5] text-white flex items-center justify-center shadow-md mb-1">
                          <Camera className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700">Camera</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN: PHOTO PICKER */}
              {screen === 'PHOTO_PICKER' && (
                <div className="flex-1 flex flex-col justify-between bg-slate-900 text-white p-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <button onClick={() => setScreen('CHAT')} className="p-1 cursor-pointer">
                      <ArrowLeft className="w-4 h-4 text-white" />
                    </button>
                    <h3 className="font-bold text-xs">{isTamil ? 'புகைப்படம் தேர்வு' : 'Select photo'}</h3>
                    <div className="w-4" />
                  </div>

                  <div className="flex-1 py-3 flex items-center justify-center">
                    <div
                      data-demo-id="sample-photo-1"
                      onClick={() => advancePracticeStep('p3_s3')}
                      className="w-full h-56 rounded-2xl overflow-hidden border-2 border-[#008069] cursor-pointer"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&auto=format&fit=crop&q=80"
                        alt="Sample"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <button
                    data-demo-id="send-photo-btn"
                    onClick={() => {
                      setHasSentPhoto(true);
                      setScreen('CHAT');
                      advancePracticeStep('p3_s4');
                    }}
                    className="w-full py-3 rounded-2xl bg-[#008069] text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isTamil ? 'அனுப்பு (Send)' : 'Send photo'}</span>
                  </button>
                </div>
              )}

              {/* SCREEN: LOCATION */}
              {screen === 'LOCATION' && (
                <div className="flex-1 flex flex-col justify-between bg-white">
                  <div className="bg-[#008069] text-white px-3 py-2 flex items-center gap-2 shadow-xs">
                    <button onClick={() => setScreen('CHAT')} className="p-1 cursor-pointer">
                      <ArrowLeft className="w-4 h-4 text-white" />
                    </button>
                    <h3 className="font-bold text-xs">{isTamil ? 'இருப்பிடம் அனுப்புதல்' : 'Send location'}</h3>
                  </div>

                  <div className="flex-1 bg-slate-100 flex items-center justify-center relative">
                    <div className="w-10 h-10 rounded-full bg-[#008069] text-white flex items-center justify-center shadow-lg">
                      <MapPin className="w-6 h-6 fill-white text-[#008069]" />
                    </div>
                  </div>

                  <div className="p-3 space-y-2 bg-white">
                    <button
                      data-demo-id="send-current-location-btn"
                      onClick={() => {
                        setHasSentLocation(true);
                        setScreen('CHAT');
                        advancePracticeStep('p4_s3');
                      }}
                      className="w-full py-3 rounded-2xl bg-[#008069] text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{isTamil ? 'இந்த இருப்பிடத்தை அனுப்பு (Send)' : 'Send this location'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN: CALL */}
              {screen === 'CALL' && (
                <div className="flex-1 flex flex-col justify-between bg-[#083A34] text-white p-4">
                  <div className="text-center pt-8 space-y-2">
                    <div className="w-20 h-20 rounded-full bg-white text-[#083A34] font-bold text-3xl flex items-center justify-center mx-auto shadow-xl">
                      A
                    </div>
                    <h3 className="font-bold text-lg text-white">Amma</h3>
                    <span className="text-xs text-emerald-300">Calling...</span>
                  </div>

                  <div className="space-y-4 pb-4">
                    <div className="flex justify-around items-center">
                      <button data-demo-id="call-video-control" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                        <Video className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      data-demo-id="end-call-btn"
                      onClick={() => {
                        setScreen('CHAT');
                        advancePracticeStep('p5_s2');
                      }}
                      className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center mx-auto shadow-xl cursor-pointer"
                    >
                      <PhoneOff className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= APPLICATION BODY: GOOGLE PAY ================= */}
          {lesson.app === 'gpay' && (
            <div className="flex-1 flex flex-col justify-between bg-[#F8F6F0] relative overflow-y-auto p-3">
              {/* SCREEN: HOME */}
              {screen === 'HOME' && (
                <div className="space-y-3">
                  {/* Bank balance card */}
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

                  {/* Tile grid */}
                  <div data-demo-id="tile-grid">
                    <h5 className="text-[11px] font-bold text-slate-700 mb-2">
                      {isTamil ? 'பணம் அனுப்புதல் மற்றும் சேவைகள்' : 'Payments & transfers'}
                    </h5>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <button
                        data-demo-id="tile-send-money"
                        onClick={() => {
                          setScreen('SEND_PHONE');
                          advancePracticeStep('gp_p1');
                        }}
                        className="p-2 rounded-2xl border border-teal-500 bg-teal-50/70 hover:bg-teal-100 shadow-2xs flex flex-col items-center justify-center cursor-pointer active:scale-95 transition"
                      >
                        <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center mb-1 text-sm font-bold shadow-xs">
                          ₹
                        </div>
                        <span className="text-[10px] font-bold text-slate-900 leading-tight">
                          {isTamil ? 'எண்ணிற்கு' : 'Send to number'}
                        </span>
                      </button>

                      <div className="p-2 rounded-2xl border border-slate-100 bg-white flex flex-col items-center justify-center opacity-70">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-1 text-xs">
                          <Building className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-slate-600">Bank</span>
                      </div>

                      <div className="p-2 rounded-2xl border border-slate-100 bg-white flex flex-col items-center justify-center opacity-70">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-1 text-xs">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-slate-600">Bills</span>
                      </div>

                      <div className="p-2 rounded-2xl border border-slate-100 bg-white flex flex-col items-center justify-center opacity-70">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-1 text-xs">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-slate-600">QR</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN: SEND PHONE */}
              {screen === 'SEND_PHONE' && (
                <div className="flex-1 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                      <button onClick={() => setScreen('HOME')} className="p-1 cursor-pointer">
                        <ArrowLeft className="w-4 h-4 text-slate-700" />
                      </button>
                      <h3 className="font-bold text-slate-900 text-xs">
                        {isTamil ? 'தொலைபேசி எண் வழி அனுப்புதல்' : 'Send to phone number'}
                      </h3>
                    </div>

                    {/* Hint box */}
                    <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-[11px] text-teal-950 font-medium">
                      💡 <strong>{isTamil ? 'மாதிரி எண்:' : 'Practice Number:'}</strong> {practiceRoundData.task.phone}
                    </div>

                    {/* Phone Number Display: data-demo-id="phone-input" */}
                    <div
                      data-demo-id="phone-input"
                      className="w-full bg-white border-2 border-teal-500 rounded-2xl p-3 text-center shadow-xs"
                    >
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                        {isTamil ? 'பெறுநரின் தொலைபேசி எண்:' : 'Recipient Phone Number:'}
                      </span>
                      <span className="text-xl font-mono font-extrabold text-slate-900 tracking-wider">
                        {phoneInput || <span className="text-slate-300">{practiceRoundData.task.phone}</span>}
                      </span>
                    </div>

                    {/* Matched contact card when number matches */}
                    {phoneInput.replace(/\s+/g, '') === practiceRoundData.task.phoneRaw.replace(/\s+/g, '') && (
                      <div className="animate-in fade-in duration-300 pt-1">
                        <span className="text-[10px] font-bold text-teal-800 block mb-1">
                          {isTamil ? 'கண்டறியப்பட்ட நபர் (Matched Contact):' : 'Matched Contact:'}
                        </span>
                        <button
                          data-demo-id="contact-ravi"
                          onClick={() => {
                            setScreen('AMOUNT');
                            advancePracticeStep('gp_p3');
                          }}
                          className="w-full p-2.5 rounded-2xl bg-white border-2 border-amber-400 shadow-md flex items-center justify-between text-left hover:bg-amber-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                              {practiceRoundData.task.name[0]}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs">
                                {isTamil ? practiceRoundData.task.nameTa : practiceRoundData.task.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-mono">{practiceRoundData.task.phone}</p>
                            </div>
                          </div>
                          <div className="px-2.5 py-1 rounded-xl bg-teal-50 text-[#0D5C63] text-xs font-bold border border-teal-200">
                            {isTamil ? 'தொடரவும் &gt;' : 'Continue &gt;'}
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* FIX A4: Compact, scrollable keypad with 0 and backspace fully visible */}
                  <div className="grid grid-cols-3 gap-1.5 max-w-xs mx-auto w-full pt-2 select-none shrink-0">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        data-demo-id={`key-${digit}`}
                        onClick={() => handleKeypadPress(digit)}
                        className="h-11 rounded-xl bg-white border border-slate-200 active:bg-teal-50 text-lg font-bold text-slate-800 shadow-2xs active:scale-95 transition cursor-pointer flex items-center justify-center border-b-2"
                      >
                        {digit}
                      </button>
                    ))}
                    <div className="h-11" />
                    <button
                      data-demo-id="key-0"
                      onClick={() => handleKeypadPress('0')}
                      className="h-11 rounded-xl bg-white border border-slate-200 active:bg-teal-50 text-lg font-bold text-slate-800 shadow-2xs active:scale-95 transition cursor-pointer flex items-center justify-center border-b-2"
                    >
                      0
                    </button>
                    <button
                      data-demo-id="key-back"
                      onClick={handleKeypadBackspace}
                      className="h-11 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 active:scale-95 text-slate-700 shadow-2xs transition flex items-center justify-center cursor-pointer border-b-2"
                      title="Backspace"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN: AMOUNT */}
              {screen === 'AMOUNT' && (
                <div className="flex-1 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-3">
                    <div className="text-center pt-2">
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center mx-auto mb-1 shadow-md">
                        {practiceRoundData.task.name[0]}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {isTamil ? practiceRoundData.task.nameTa : practiceRoundData.task.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">{practiceRoundData.task.phone}</p>
                    </div>

                    <div className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-xs">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                        {isTamil ? 'தொகை உள்ளிடவும்:' : 'Enter Amount:'}
                      </span>
                      <span className="text-3xl font-extrabold text-slate-900">
                        ₹ {amountInput || practiceRoundData.task.amount || '50'}
                      </span>
                    </div>

                    <button
                      data-demo-id="pay-btn"
                      onClick={() => {
                        setScreen('PIN');
                        advancePracticeStep('gp_p4');
                      }}
                      className="w-full py-3 rounded-2xl bg-[#0D5C63] hover:bg-[#09454A] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
                    >
                      <span>
                        {isTamil ? `பணம் செலுத்து ₹ ${amountInput || practiceRoundData.task.amount || '50'}` : `Pay ₹ ${amountInput || practiceRoundData.task.amount || '50'}`}
                      </span>
                    </button>
                  </div>

                  {/* Compact keypad */}
                  <div className="grid grid-cols-3 gap-1.5 max-w-xs mx-auto w-full pt-2 select-none shrink-0">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        data-demo-id={`key-${digit}`}
                        onClick={() => handleKeypadPress(digit)}
                        className="h-11 rounded-xl bg-white border border-slate-200 text-lg font-bold text-slate-800 shadow-2xs cursor-pointer flex items-center justify-center border-b-2"
                      >
                        {digit}
                      </button>
                    ))}
                    <div className="h-11" />
                    <button
                      data-demo-id="key-0"
                      onClick={() => handleKeypadPress('0')}
                      className="h-11 rounded-xl bg-white border border-slate-200 text-lg font-bold text-slate-800 shadow-2xs cursor-pointer flex items-center justify-center border-b-2"
                    >
                      0
                    </button>
                    <button
                      data-demo-id="key-back"
                      onClick={handleKeypadBackspace}
                      className="h-11 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs flex items-center justify-center cursor-pointer border-b-2"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN: PIN */}
              {screen === 'PIN' && (
                <div className="flex-1 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-3">
                    <div className="text-center pt-2">
                      <p className="text-xs font-bold text-slate-800">
                        {isTamil ? 'மாதிரி PIN: 1234' : 'Practice PIN: 1234'}
                      </p>
                      <div data-demo-id="pin-dots" className="flex justify-center items-center gap-3 py-3">
                        {[0, 1, 2, 3].map((idx) => (
                          <div
                            key={idx}
                            className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                              idx < pinInput.length
                                ? 'bg-slate-900 border-slate-900 scale-125'
                                : 'border-slate-300 bg-white'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-950 font-medium text-center">
                      🔒 <strong>{isTamil ? 'பாதுகாப்பு விதி:' : 'Safety rule:'}</strong>{' '}
                      {isTamil ? 'பணம் அனுப்ப மட்டுமே PIN தேவை. யாரிடமும் PIN சொல்லக்கூடாது.' : 'PIN is only used to send money, never to receive.'}
                    </div>
                  </div>

                  {/* Compact keypad */}
                  <div className="grid grid-cols-3 gap-1.5 max-w-xs mx-auto w-full pt-2 select-none shrink-0">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        data-demo-id={`key-${digit}`}
                        onClick={() => handleKeypadPress(digit)}
                        className="h-11 rounded-xl bg-white border border-slate-200 text-lg font-bold text-slate-800 shadow-2xs cursor-pointer flex items-center justify-center border-b-2"
                      >
                        {digit}
                      </button>
                    ))}
                    <div className="h-11" />
                    <button
                      data-demo-id="key-0"
                      onClick={() => handleKeypadPress('0')}
                      className="h-11 rounded-xl bg-white border border-slate-200 text-lg font-bold text-slate-800 shadow-2xs cursor-pointer flex items-center justify-center border-b-2"
                    >
                      0
                    </button>
                    <button
                      data-demo-id="key-back"
                      onClick={handleKeypadBackspace}
                      className="h-11 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs flex items-center justify-center cursor-pointer border-b-2"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN: SUCCESS */}
              {screen === 'SUCCESS' && (
                <div className="my-auto text-center space-y-3 p-2">
                  <div className="bg-white rounded-3xl p-5 border-2 border-emerald-400 shadow-xl space-y-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      ₹ {practiceRoundData.task.amount || '50'}{' '}
                      {isTamil ? 'வெற்றிகரமாக அனுப்பப்பட்டது!' : 'Sent Successfully!'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isTamil ? practiceRoundData.task.nameTa : practiceRoundData.task.name} ({practiceRoundData.task.phone})
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guide Card at Bottom */}
          {screen !== 'SUCCESS' && phase !== 'COMPLETE' && (
            <div className="px-3 pb-2 pt-1 bg-white border-t border-slate-100 shrink-0 z-10">
              <div className="bg-white rounded-2xl p-2.5 border-2 border-[#008069] shadow-sm flex flex-col text-left">
                <span className="text-[9px] font-extrabold text-[#008069] uppercase tracking-wider mb-0.5">
                  {isTamil ? 'செல்வி, உங்கள் வழிகாட்டி' : 'MEERA / SELVI, YOUR GUIDE'}
                </span>
                <p className="text-xs font-semibold text-slate-800 leading-snug">
                  {currentGuideText}
                </p>
              </div>
            </div>
          )}

          {/* ================= DEMO CURSOR & BLOCKING OVERLAY ================= */}
          {phase === 'DEMO' && (
            <div className="absolute inset-0 z-50 pointer-events-none select-none">
              <div className="absolute inset-0 pointer-events-auto cursor-default" />

              {pointerVisible && (
                <div
                  style={{
                    left: `${pointerPos.x}%`,
                    top: `${pointerPos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    transition: 'left 0.65s cubic-bezier(0.25, 1, 0.5, 1), top 0.65s cubic-bezier(0.25, 1, 0.5, 1)',
                  }}
                  className="absolute pointer-events-none z-50 flex flex-col items-center"
                >
                  {isRippling && (
                    <div className="absolute w-12 h-12 -top-2 -left-2 rounded-full border-4 border-emerald-400 bg-emerald-400/30 animate-ping pointer-events-none" />
                  )}
                  <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl border-2 border-white">
                    <MousePointer className="w-5 h-5 fill-slate-950" />
                  </div>
                </div>
              )}

              {/* Bottom Demo Bar */}
              <div className="absolute bottom-2 left-2 right-2 pointer-events-auto z-50">
                <div className="bg-slate-950/90 text-white p-2 rounded-2xl shadow-xl border border-slate-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>{isTamil ? 'செயல்முறை விளக்கம்...' : 'Demo playing...'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => resetSimulator('DEMO')}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-400" />
                      <span>{isTamil ? 'மீண்டும்' : 'Replay'}</span>
                    </button>
                    <button
                      onClick={() => resetSimulator('PRACTICE_ROUND_1', 1)}
                      className="px-2.5 py-1 rounded-xl bg-[#008069] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isTamil ? 'பயிற்சிக்கு செல்' : 'Skip to practice'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= FIX A1 & PART B: SMART TARGET SPOTLIGHT ================= */}
          {(phase === 'PRACTICE_ROUND_1' || phase === 'PRACTICE_ROUND_2') && currentPracticeStep?.targetId && (
            <SmartTargetSpotlight
              containerRef={phoneContainerRef}
              targetId={currentPracticeStep.targetId}
              guideText={isTamil ? currentPracticeStep.guideText.ta : currentPracticeStep.guideText.en}
              isShaking={isWrongTargetShaking}
              isGlowing={isTargetGlowing}
            />
          )}

          {/* Wrong Tap Alert Toast */}
          {wrongTapMessage && (
            <div className="absolute top-20 left-4 right-4 z-50 p-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-2xl text-center border-2 border-white animate-in fade-in duration-200">
              {wrongTapMessage}
            </div>
          )}

          {/* ================= COMPLETION MODAL ================= */}
          {phase === 'COMPLETE' && (
            <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center text-white animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-[#008069] text-white flex items-center justify-center shadow-2xl border-4 border-[#25D366] mb-4">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">
                {isTamil ? lesson.successMessage.ta : lesson.successMessage.en}
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mb-6">
                {isTamil
                  ? 'நீங்கள் இரண்டு சுற்றுகளையும் வெற்றிகரமாக முடித்துவிட்டீர்கள்!'
                  : 'You have mastered both practice rounds successfully!'}
              </p>
              <div className="w-full max-w-xs space-y-2.5">
                <button
                  onClick={() => {
                    const currentIndex = ALL_LESSONS.findIndex((l) => l.id === lesson.id);
                    const nextLessonDef = ALL_LESSONS[(currentIndex + 1) % ALL_LESSONS.length];
                    onNextLesson(nextLessonDef.id);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#008069] hover:bg-[#075E54] text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <span>{isTamil ? 'அடுத்த பாடம் (Next lesson)' : 'Next lesson'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => resetSimulator('PRACTICE_ROUND_1', 1)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isTamil ? 'மீண்டும் பயிற்சி செய்' : 'Practice again'}</span>
                </button>
                <button
                  onClick={onGoLessonList}
                  className="w-full py-2 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  {isTamil ? 'பாடங்கள் பட்டியலுக்கு செல்' : 'Back to lessons'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// ================= SMART TARGET SPOTLIGHT (FIX A1 & PART B) =================
interface SmartTargetSpotlightProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  targetId: string;
  guideText: string;
  isShaking: boolean;
  isGlowing: boolean;
}

const SmartTargetSpotlight: React.FC<SmartTargetSpotlightProps> = ({
  containerRef,
  targetId,
  guideText,
  isShaking,
  isGlowing,
}) => {
  const [rect, setRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const el = containerRef.current.querySelector(`[data-demo-id="${targetId}"]`) as HTMLElement;
      if (el) {
        const cR = containerRef.current.getBoundingClientRect();
        const eR = el.getBoundingClientRect();
        if (eR.width > 0 && eR.height > 0) {
          setRect({
            top: eR.top - cR.top,
            left: eR.left - cR.left,
            width: eR.width,
            height: eR.height,
          });
          return;
        }
      }
      setRect(null);
    };

    update();
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, [containerRef, targetId]);

  if (!rect) return null;

  // FIX A1: Smart above/below placement to NEVER overlap hint box or input text!
  const isCloseToTop = rect.top < 75;

  return (
    <div
      style={{
        position: 'absolute',
        top: `${rect.top - 4}px`,
        left: `${rect.left - 4}px`,
        width: `${rect.width + 8}px`,
        height: `${rect.height + 8}px`,
      }}
      className={`pointer-events-none z-40 rounded-2xl ring-4 ring-[#25D366] shadow-xl ring-offset-2 ring-offset-slate-900 transition-all duration-300 ${
        isShaking
          ? 'animate-bounce ring-red-500'
          : isGlowing
          ? 'animate-pulse opacity-100 ring-4'
          : 'opacity-50 ring-2'
      }`}
    >
      {/* Tooltip & Bouncing Arrow with smart above/below placement */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center transition-transform duration-200 z-50 ${
          isCloseToTop ? 'top-[calc(100%+8px)]' : '-top-10'
        } ${isGlowing ? 'animate-bounce opacity-100 scale-100' : 'opacity-80 scale-95'}`}
      >
        {!isCloseToTop ? (
          <>
            <div className="bg-[#008069] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg border border-white whitespace-nowrap">
              {guideText}
            </div>
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#008069]" />
          </>
        ) : (
          <>
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-[#008069]" />
            <div className="bg-[#008069] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg border border-white whitespace-nowrap">
              {guideText}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
