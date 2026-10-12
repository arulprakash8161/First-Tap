import React, { useState } from 'react';
import {
  X,
  Volume2,
  Mic,
  Send,
  HelpCircle,
  ShieldCheck,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../lib/translations';
import { voiceManager } from '../lib/voice';

interface DoubtDrawerProps {
  language: LanguageCode;
  contextNote?: string;
  onClose: () => void;
}

export const DoubtDrawer: React.FC<DoubtDrawerProps> = ({
  language,
  contextNote,
  onClose,
}) => {
  const t = translations[language];
  const [userQuery, setUserQuery] = useState('');
  const [activeAnswer, setActiveAnswer] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const handleSelectPreset = (q: string, a: string) => {
    setActiveQuestion(q);
    setActiveAnswer(a);
    voiceManager.speak(a, language);
  };

  const handleCustomQuery = (text: string) => {
    if (!text.trim()) return;
    setActiveQuestion(text);

    // Contextual intelligent responses tailored for digital novices
    const lower = text.toLowerCase();
    let reply = '';

    if (lower.includes('pin') || lower.includes('பின்')) {
      reply =
        language === 'ta'
          ? 'உங்கள் ரகசிய PIN எண்ணை பணம் அனுப்ப மட்டுமே பயன்படுத்த வேண்டும். பணம் பெற ஒருபோதும் PIN தேவையில்லை. வங்கி மேலாளர் கேட்டாலும் சொல்லக்கூடாது.'
          : 'Your PIN is only entered to SEND money. You never need a PIN to receive money. Never share it with anyone.';
    } else if (lower.includes('otp') || lower.includes('ஓடிபி')) {
      reply =
        language === 'ta'
          ? 'OTP என்பது உங்கள் வீட்டின் சாவி போன்றது. போனில் யாராவது பரிசு விழுந்துள்ளது அல்லது வங்கி கணக்கு முடங்கிவிட்டது என்று சொல்லி OTP கேட்டால் ஒருபோதும் தரக்கூடாது.'
          : 'OTP is like the key to your safe. Never share OTP with anyone on phone calls or messages.';
    } else if (lower.includes('qr') || lower.includes('கியூஆர்')) {
      reply =
        language === 'ta'
          ? 'மற்றவருக்கு பணம் அனுப்ப அவர்கள் QR-ஐ நீங்கள் ஸ்கேன் செய்வீர்கள். நீங்கள் பணம் பெற உங்கள் சொந்த QR-ஐ பிறருக்கு காட்டலாம். உங்கள் QR-ஐ காட்டுவதால் பணம் போகாது.'
          : 'Showing your QR code allows others to pay you. It will never debit money from your account.';
    } else if (lower.includes('location') || lower.includes('இருப்பிடம்') || lower.includes('இடம்')) {
      reply =
        language === 'ta'
          ? 'லைவ் லொகேஷன் (Live location) என்பது நீங்கள் இருக்கும் இடத்தை காட்டும். உங்களுக்கு நன்கு தெரிந்த குடும்பத்தினருக்கு மட்டுமே பகிரவும். எப்போது வேண்டுமானாலும் Stop கொடுத்து நிறுத்தலாம்.'
          : 'Only share live location with trusted family members. You can stop sharing at any time.';
    } else {
      reply =
        language === 'ta'
          ? 'கவலைப்பட வேண்டாம்! இந்த மாதிரி சூழலில் உங்கள் பணம் முற்றிலும் பாதுகாப்பாக உள்ளது. நீங்கள் எத்தனை முறை வேண்டுமானாலும் தவறு செய்து பழகலாம்.'
          : 'No need to worry! This practice sandbox has zero real risk. You can practice as many times as you want.';
    }

    setActiveAnswer(reply);
    voiceManager.speak(reply, language);
    setUserQuery('');
  };

  const handleToggleVoiceInput = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      handleCustomQuery('PIN பாதுகாப்பு பற்றி சொல்லுங்கள்');
      return;
    }

    try {
      if (isListening) {
        setIsListening(false);
      } else {
        const recognition = new SpeechRecognitionAPI();
        recognition.lang =
          language === 'ta'
            ? 'ta-IN'
            : language === 'hi'
            ? 'hi-IN'
            : 'en-IN';
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const speechResult = event.results[0][0].transcript;
          setIsListening(false);
          handleCustomQuery(speechResult);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
      }
    } catch {
      setIsListening(false);
      handleCustomQuery('PIN பாதுகாப்பு பற்றி சொல்லுங்கள்');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-teal-600/30 flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Drawer Header */}
        <div className="bg-[#0D5C63] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 bg-white">
              <img
                src="/avatar_mentor.png"
                alt="Selvi"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">{t.doubtDrawerTitle}</h3>
              <p className="text-[11px] text-teal-200">
                {contextNote ? `இடைநிறுத்தப்பட்ட நிலை: ${contextNote}` : t.doubtDrawerSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              voiceManager.stop();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-teal-700 text-white cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Active Doubt Response Bubble */}
          {activeAnswer && (
            <div className="p-4 rounded-2xl bg-white border border-teal-300 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#0D5C63]">
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-amber-500" />
                  <span>{activeQuestion}</span>
                </div>
                <button
                  onClick={() => voiceManager.speak(activeAnswer, language)}
                  className="p-1 rounded bg-teal-50 text-teal-800 hover:bg-teal-100 cursor-pointer"
                  title="Replay Voice"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                "{activeAnswer}"
              </p>
            </div>
          )}

          {/* Quick Preset Common Doubts */}
          <div>
            <h4 className="text-xs font-bold text-slate-600 mb-2.5">
              பொதுவான சந்தேகங்கள் (Frequently Asked Doubts):
            </h4>
            <div className="space-y-2">
              {t.presetDoubts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(item.q, item.a)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 hover:border-teal-400 text-left text-xs font-semibold text-slate-800 transition shadow-2xs hover:bg-teal-50/50 cursor-pointer flex items-center justify-between"
                >
                  <span>{item.q}</span>
                  <HelpCircle className="w-4 h-4 text-teal-600 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Ask Your Own Question Box */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-600 mb-1.5">
              உங்கள் சொந்த கேள்வியை கேட்க:
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCustomQuery(userQuery);
                }}
                placeholder={t.typeDoubtPlaceholder}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-600"
              />

              <button
                onClick={handleToggleVoiceInput}
                className={`p-2.5 rounded-xl border cursor-pointer transition ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse border-red-600'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-teal-600'
                }`}
                title="Tap to speak"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleCustomQuery(userQuery)}
                className="p-2.5 rounded-xl bg-[#0D5C63] text-white hover:bg-[#09454A] cursor-pointer"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Resume Action Button (56px min height) */}
        <div className="p-4 bg-white border-t border-slate-200">
          <button
            onClick={() => {
              voiceManager.stop();
              onClose();
            }}
            className="w-full min-h-[56px] py-3.5 rounded-2xl bg-[#0D5C63] hover:bg-[#09454A] text-white font-bold text-base shadow-md active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-5 h-5 text-amber-300" />
            <span>{t.resumePractice} (Resume Practice)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
