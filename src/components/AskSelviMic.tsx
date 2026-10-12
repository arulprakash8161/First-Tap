import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Volume2, Sparkles, Send, X, AlertCircle, Loader2 } from 'lucide-react';
import { LanguageCode } from '../types';
import { voiceManager } from '../lib/voice';

// Browser SpeechRecognition interface
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export type MicState = 'idle' | 'listening' | 'thinking' | 'answering';

export interface AskSelviMicProps {
  language: LanguageCode;
  lessonId: string;
  stepId: string;
  stepNumber: number;
  stepCaption: string;
  screenName: string;
  phase: 'demo' | 'test';
  mistakes?: number;
  onPause: () => void;
  onResume: () => Promise<void> | void;
}

export const AskSelviMic: React.FC<AskSelviMicProps> = ({
  language,
  lessonId,
  stepId,
  stepNumber,
  stepCaption,
  screenName,
  phase,
  mistakes = 0,
  onPause,
  onResume,
}) => {
  const [state, setState] = useState<MicState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [typedQuestion, setTypedQuestion] = useState<string>('');
  const [answerCaption, setAnswerCaption] = useState<string | null>(null);
  const [showTypeInput, setShowTypeInput] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHandlingAnswerRef = useRef<boolean>(false);

  const isTamil = language === 'ta';
  const isHindi = language === 'hi';

  const clearAllTimers = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
  };

  const stopRecognitionOnly = () => {
    clearAllTimers();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecognitionOnly();
    };
  }, []);

  // Step 3: Send question to AI, speak answer, show caption
  const handleAskAI = async (questionText: string) => {
    const q = questionText.trim();
    if (!q) {
      handleResumeStep();
      return;
    }

    isHandlingAnswerRef.current = true;
    stopRecognitionOnly();
    setState('thinking');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ask-doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          language,
          lessonId,
          stepId,
          stepCaption,
          screenName,
          phase,
          mistakes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const answer =
        data.answer ||
        (isTamil
          ? 'திரையில் காட்டப்பட்டுள்ள பொத்தானைத் தொட்டு பயிற்சியைத் தொடரவும்.'
          : isHindi
          ? 'स्क्रीन पर दिखाए गए बटन को दबाकर अभ्यास जारी रखें।'
          : 'Please continue following the highlighted target on screen.');

      setState('answering');
      setAnswerCaption(answer);

      // Speak answer with TTS
      await voiceManager.speakAsync(answer, language, { fallbackTimeoutMs: 15000 });

      // Automatically resume after a short pause so user can continue
      setTimeout(() => {
        handleResumeStep();
      }, 1500);
    } catch (err) {
      console.error('Error asking Selvi:', err);
      const fallback =
        isTamil
          ? 'கவலைப்பட வேண்டாம், பயிற்சியை தொடர்ந்து செய்யலாம்.'
          : isHindi
          ? 'कोई बात नहीं, कृपया अभ्यास जारी रखें।'
          : 'Do not worry, you can continue your practice.';
      setState('answering');
      setAnswerCaption(fallback);
      await voiceManager.speakAsync(fallback, language, { fallbackTimeoutMs: 8000 });
      setTimeout(() => {
        handleResumeStep();
      }, 1500);
    } finally {
      isHandlingAnswerRef.current = false;
    }
  };

  // Step 4: Resume at the current step only
  const handleResumeStep = async () => {
    clearAllTimers();
    stopRecognitionOnly();
    voiceManager.stop();
    setAnswerCaption(null);
    setShowTypeInput(false);
    setTranscript('');
    setTypedQuestion('');
    setErrorMessage(null);
    setState('idle');

    console.log(`[mic] resume step ${stepNumber}`);

    // Call onResume which speaks that step's line once and continues
    try {
      await onResume();
    } catch (err) {
      console.error('Error resuming step:', err);
    }
  };

  // Step 2: Start speech recognition
  const startListening = () => {
    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.warn('[mic] SpeechRecognition not supported in browser');
      setShowTypeInput(true);
      setState('idle');
      return;
    }

    try {
      stopRecognitionOnly();

      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;

      recognition.lang = isTamil ? 'ta-IN' : isHindi ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      let currentTranscript = '';

      // Reset silence timer helper: stop after 4s of silence
      const resetSilenceTimer = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          console.log('[mic] 4s silence reached, stopping recognition');
          stopRecognitionOnly();
          if (currentTranscript.trim().length > 0) {
            handleAskAI(currentTranscript);
          } else {
            handleResumeStep();
          }
        }, 4000);
      };

      recognition.onstart = () => {
        setState('listening');
        setErrorMessage(null);
        resetSilenceTimer();

        // 15 seconds maximum listening timeout
        maxTimerRef.current = setTimeout(() => {
          console.log('[mic] 15s max limit reached, stopping recognition');
          stopRecognitionOnly();
          if (currentTranscript.trim().length > 0) {
            handleAskAI(currentTranscript);
          } else {
            handleResumeStep();
          }
        }, 15000);
      };

      recognition.onresult = (event: any) => {
        resetSilenceTimer();
        let str = '';
        for (let i = 0; i < event.results.length; i++) {
          str += event.results[i][0].transcript;
        }
        currentTranscript = str;
        setTranscript(str);
      };

      recognition.onerror = (event: any) => {
        console.warn('[mic] SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage(
            isTamil
              ? 'மைக் அனுமதி மறுக்கப்பட்டுள்ளது. கீழே உங்கள் கேள்வியை தட்டச்சு செய்யவும்.'
              : isHindi
              ? 'माइक अनुमति अस्वीकृत हुई। नीचे अपना सवाल टाइप करें।'
              : 'Microphone permission denied. Type your question below.'
          );
          setShowTypeInput(true);
          setState('idle');
        } else if (event.error === 'no-speech') {
          // If no speech heard, stop after timeout
        }
      };

      recognition.onend = () => {
        if (!isHandlingAnswerRef.current) {
          if (currentTranscript.trim().length > 0) {
            handleAskAI(currentTranscript);
          } else {
            handleResumeStep();
          }
        }
      };

      recognition.start();
    } catch (err) {
      console.error('[mic] Failed to start SpeechRecognition:', err);
      setShowTypeInput(true);
      setState('idle');
    }
  };

  // Main Mic Button Tap Handler
  const handleMicClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // If currently listening, tapping stops listening and submits
    if (state === 'listening') {
      stopRecognitionOnly();
      if (transcript.trim().length > 0) {
        handleAskAI(transcript);
      } else {
        handleResumeStep();
      }
      return;
    }

    // If answering, tapping dismisses answer and resumes immediately
    if (state === 'answering') {
      handleResumeStep();
      return;
    }

    if (state === 'thinking') {
      return;
    }

    // 1. PAUSE everything at action boundary
    console.log(`[mic] pause step ${stepNumber}`);
    onPause();
    voiceManager.stop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setTranscript('');
    setTypedQuestion('');
    setAnswerCaption(null);
    setErrorMessage(null);

    // 2. LISTEN to question
    startListening();
  };

  return (
    <>
      {/* 
        Always-visible Mic Button:
        - Fixed inside phone frame (top-right)
        - At least 56x56 px
        - Above demo touch-blocking overlay and spotlights (z-[85])
        - Small label "Ask"
        - Excluded from tap blockers
      */}
      <div
        data-mic-button="true"
        className="absolute top-12 right-3 z-[85] pointer-events-auto select-none"
      >
        <button
          onClick={handleMicClick}
          aria-label="Ask Selvi"
          title="Ask Selvi (கேள்வி கேளுங்கள்)"
          className={`w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer shadow-xl border-2 active:scale-95 ${
            state === 'listening'
              ? 'bg-emerald-600 border-amber-300 ring-4 ring-emerald-400/80 ring-offset-2 ring-offset-slate-900 animate-pulse text-white'
              : state === 'thinking'
              ? 'bg-teal-700 border-teal-300 text-white'
              : state === 'answering'
              ? 'bg-[#0D5C63] border-amber-400 text-amber-300'
              : 'bg-[#0D5C63] hover:bg-[#09454A] border-white/90 text-white'
          }`}
        >
          {state === 'listening' ? (
            <>
              <div className="relative flex items-center justify-center">
                <span className="w-8 h-8 rounded-full bg-emerald-400/50 animate-ping absolute" />
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-tight text-amber-200 mt-0.5 leading-none">
                Stop
              </span>
            </>
          ) : state === 'thinking' ? (
            <>
              <Loader2 className="w-5 h-5 text-amber-300 animate-spin" />
              <span className="text-[9px] font-bold uppercase tracking-tight text-teal-100 mt-0.5 leading-none">
                Wait
              </span>
            </>
          ) : state === 'answering' ? (
            <>
              <Volume2 className="w-5 h-5 text-amber-300 animate-bounce" />
              <span className="text-[10px] font-extrabold uppercase tracking-tight text-amber-300 mt-0.5 leading-none">
                Selvi
              </span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 text-white" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 mt-0.5 leading-none">
                Ask
              </span>
            </>
          )}
        </button>
      </div>

      {/* Answer & Speaking Caption Banner (shown prominently inside phone frame) */}
      {answerCaption && (
        <div className="absolute top-28 left-3 right-3 z-[90] pointer-events-auto animate-in slide-in-from-top-2 duration-300 select-none">
          <div className="bg-slate-950/95 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-600/40 text-amber-300 flex items-center justify-center shrink-0 border border-teal-400/40">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  செல்வி பதில் (Selvi's Answer):
                </span>
                <button
                  onClick={handleResumeStep}
                  className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed mt-1">
                {answerCaption}
              </p>
              <button
                onClick={handleResumeStep}
                className="mt-2 text-[11px] font-bold text-teal-300 hover:text-teal-200 underline cursor-pointer"
              >
                {isTamil ? 'தொடரவும் (Resume)' : 'Resume lesson'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fallback Text Input when mic is denied or unsupported */}
      {showTypeInput && state !== 'answering' && (
        <div className="absolute top-28 left-3 right-3 z-[90] pointer-events-auto animate-in slide-in-from-top-2 duration-200 select-none">
          <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-2xl shadow-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isTamil ? 'கேள்வி கேட்கவும்' : 'Type your question'}</span>
              </div>
              <button
                onClick={() => {
                  setShowTypeInput(false);
                  handleResumeStep();
                }}
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-2 text-[11px] text-amber-200/90 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (typedQuestion.trim()) {
                  handleAskAI(typedQuestion);
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={typedQuestion}
                onChange={(e) => setTypedQuestion(e.target.value)}
                placeholder={
                  isTamil ? 'உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும்...' : 'Type your question...'
                }
                autoFocus
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400"
              />
              <button
                type="submit"
                disabled={!typedQuestion.trim()}
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white cursor-pointer"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
