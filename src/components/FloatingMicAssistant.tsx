import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Send, Sparkles, AlertCircle, Play, RotateCcw } from 'lucide-react';
import { LanguageCode } from '../types';
import { voiceManager } from '../lib/voice';

// Define SpeechRecognition interface for browsers
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface FloatingMicAssistantProps {
  language: LanguageCode;
  currentApp?: string;
  lessonTitle?: string;
  stepNarration?: string;
  currentScreen?: string;
  onPauseEverything: () => void;
  onResumeEverything: () => void;
}

export const FloatingMicAssistant: React.FC<FloatingMicAssistantProps> = ({
  language,
  currentApp,
  lessonTitle,
  stepNarration,
  currentScreen,
  onPauseEverything,
  onResumeEverything,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [typedQuestion, setTypedQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isTamil = language === 'ta';

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleOpenMic = () => {
    // 1. Immediately pause everything
    onPauseEverything();
    voiceManager.stop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsOpen(true);
    setAnswer(null);
    setTranscript('');
    setTypedQuestion('');
    setErrorMessage(null);

    // 2. Start speech recognition
    startListening();
  };

  const startListening = () => {
    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMessage(
        isTamil
          ? 'இந்த உலாவியில் மைக் வசதி நேரடியாக ஆதரிக்கப்படவில்லை. உங்கள் கேள்வியை கீழே தட்டச்சு செய்யவும்.'
          : 'Speech recognition is not directly supported in this browser. Please type your question below.'
      );
      setIsListening(false);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;

      // Use selected app language by default, but don't strictly pin
      recognition.lang = isTamil ? 'ta-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      setIsListening(true);
      setErrorMessage(null);

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript;
        }
        setTranscript(finalTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage(
            isTamil
              ? 'மைக் அனுமதி மறுக்கப்பட்டுள்ளது. நீங்கள் கீழே தட்டச்சு செய்து கேட்கலாம்.'
              : 'Microphone permission was denied. You can type your question below.'
          );
        } else if (event.error === 'no-speech') {
          // user was quiet, allow them to re-tap or type
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // If we got a final transcript, automatically submit it!
        if (transcript.trim().length > 1) {
          askGemini(transcript);
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setIsListening(false);
      setErrorMessage(
        isTamil
          ? 'மைக் தொடங்குவதில் சிக்கல். கீழே கேள்வியை தட்டச்சு செய்யவும்.'
          : 'Could not start microphone. Please type your question below.'
      );
    }
  };

  const stopListeningAndAsk = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    if (transcript.trim().length > 0) {
      askGemini(transcript);
    }
  };

  const askGemini = async (questionText: string) => {
    const q = questionText.trim();
    if (!q) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ask-doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          currentApp,
          lessonTitle,
          stepNarration,
          screen: currentScreen,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const answerText = data.answer || (isTamil ? 'பயிற்சியைத் தொடர்ந்து செய்யலாம்.' : 'You can continue your practice.');
      setAnswer(answerText);

      // Speak the answer in user's language
      voiceManager.speakAsync(answerText, language, { fallbackTimeoutMs: 15000 });
    } catch (err) {
      console.error('Error asking doubt:', err);
      const fallback = isTamil
        ? 'கவலைப்பட வேண்டாம், நீங்கள் திரையில் ஒளிரும் பொத்தானை தொட்டு தொடரலாம்.'
        : 'Do not worry, you can continue by tapping the glowing button on screen.';
      setAnswer(fallback);
      voiceManager.speakAsync(fallback, language);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = () => {
    voiceManager.stop();
    setIsOpen(false);
    onResumeEverything();
  };

  const handleAskAnother = () => {
    voiceManager.stop();
    setAnswer(null);
    setTranscript('');
    setTypedQuestion('');
    startListening();
  };

  return (
    <>
      {/* Fixed Floating Microphone Button: present on EVERY screen */}
      <div className="fixed right-4 bottom-5 z-50 pointer-events-auto">
        <button
          onClick={handleOpenMic}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-2xl border-2 border-white/80 active:scale-95 transition cursor-pointer ring-4 ring-emerald-400/30 group"
          title={isTamil ? 'கேள்வி கேளுங்கள் (Talk Now)' : 'Ask a question (Talk Now)'}
        >
          <div className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center shadow-md animate-pulse">
            <Mic className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-xs font-extrabold pr-1 tracking-wide">
            {isTamil ? 'கேளுங்கள் (Talk Now)' : 'Talk Now'}
          </span>
        </button>
      </div>

      {/* Listening & Q&A Full Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 text-white animate-in fade-in duration-200 select-none">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative flex flex-col items-center text-center">
            {/* Top Close / Resume button */}
            <button
              onClick={handleResume}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Mentor Badge */}
            <div className="flex items-center gap-2 mb-4 bg-teal-900/60 px-3.5 py-1.5 rounded-full border border-teal-500/40 text-xs font-bold text-teal-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isTamil ? 'செல்வி உங்கள் AI ஆசிரியர்' : 'Selvi, Your AI Mentor'}</span>
            </div>

            {/* Big Animated Mic Icon when listening */}
            {isListening ? (
              <div className="relative my-4 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 animate-ping absolute" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-2xl border-4 border-emerald-300 animate-pulse">
                  <Mic className="w-10 h-10 text-white" />
                </div>
              </div>
            ) : isLoading ? (
              <div className="my-6 flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-teal-300 font-bold">
                  {isTamil ? 'பதிலை யோசிக்கிறேன்...' : 'Thinking of the answer...'}
                </span>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-teal-900/80 border-2 border-teal-500 text-teal-300 flex items-center justify-center mb-3">
                <Volume2 className="w-8 h-8" />
              </div>
            )}

            {/* Title / Status */}
            <h3 className="text-lg font-bold text-white mb-1">
              {isListening
                ? isTamil
                  ? 'கேட்கிறேன்... உங்கள் கேள்வியை பேசுங்கள்'
                  : 'Listening... speak your question'
                : answer
                ? isTamil
                  ? 'செல்வியின் பதில்'
                  : "Selvi's Answer"
                : isTamil
                ? 'உங்கள் கேள்வியைக் கேளுங்கள்'
                : 'Ask Your Question'}
            </h3>

            {/* Recognized transcript */}
            {transcript && (
              <div className="w-full bg-slate-800/80 p-3 rounded-2xl border border-slate-700 my-2 text-sm text-slate-200 font-medium italic">
                "{transcript}"
              </div>
            )}

            {/* Stop listening button if speaking */}
            {isListening && (
              <button
                onClick={stopListeningAndAsk}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer transition active:scale-95"
              >
                {isTamil ? 'பேசி முடித்தேன் (Done)' : 'Done speaking'}
              </button>
            )}

            {/* Answer Display */}
            {answer && !isLoading && (
              <div className="w-full bg-emerald-950/70 border border-emerald-500/50 rounded-2xl p-4 my-3 text-left shadow-inner animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-1.5 text-xs text-emerald-400 font-bold">
                  <Volume2 className="w-4 h-4" />
                  <span>{isTamil ? 'விளக்கம்' : 'Answer'}</span>
                </div>
                <p className="text-sm text-white font-medium leading-relaxed">{answer}</p>
              </div>
            )}

            {/* Error or unsupported mic fallback */}
            {errorMessage && (
              <div className="w-full bg-red-950/60 border border-red-800 rounded-xl p-3 my-2 text-xs text-red-200 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Fallback Text Input if user wants to type or mic is denied */}
            {(!isListening || errorMessage) && !answer && !isLoading && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (typedQuestion.trim()) {
                    askGemini(typedQuestion);
                  }
                }}
                className="w-full mt-3 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={typedQuestion}
                  onChange={(e) => setTypedQuestion(e.target.value)}
                  placeholder={
                    isTamil
                      ? 'அல்லது உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும்...'
                      : 'Or type your question here...'
                  }
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-teal-400"
                />
                <button
                  type="submit"
                  disabled={!typedQuestion.trim()}
                  className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Post-Answer Buttons: "Continue where I left off" and "Ask another question" */}
            {answer && !isLoading && (
              <div className="w-full space-y-2 mt-4">
                <button
                  onClick={handleResume}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#008069] to-emerald-600 hover:opacity-95 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>
                    {isTamil
                      ? 'நிறுத்திய இடத்திலிருந்து தொடரவும் (Continue)'
                      : 'Continue where I left off'}
                  </span>
                </button>

                <button
                  onClick={handleAskAnother}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isTamil ? 'இன்னொரு கேள்வி கேட்கவும்' : 'Ask another question'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
