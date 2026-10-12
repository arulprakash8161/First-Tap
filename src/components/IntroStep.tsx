import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, RotateCcw, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../lib/translations';
import { voiceManager } from '../lib/voice';

interface IntroStepProps {
  language: LanguageCode;
  onContinue: () => void;
  onBack: () => void;
}

export const IntroStep: React.FC<IntroStepProps> = ({
  language,
  onContinue,
  onBack,
}) => {
  const t = translations[language];
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(voiceManager.getIsMuted());

  useEffect(() => {
    // Speak introduction automatically
    voiceManager.speak(
      t.introText,
      language,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );

    return () => {
      voiceManager.stop();
    };
  }, [language, t.introText]);

  const handleReplay = () => {
    voiceManager.speak(
      t.introText,
      language,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    voiceManager.setMuted(nextMuted);
    if (!nextMuted) {
      handleReplay();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-between p-4 max-w-md mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg bg-white/80 border border-slate-200 cursor-pointer"
        >
          ← {t.back}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs cursor-pointer hover:border-amber-400"
            title={isMuted ? t.unmute : t.mute}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-[#0D5C63]" />}
          </button>
        </div>
      </div>

      {/* Main Mentor Introduction Card */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-2">
        {/* Selvi Mentor Portrait */}
        <div className="relative mb-5">
          <div
            className={`w-28 h-28 rounded-full overflow-hidden border-4 bg-white shadow-xl transition-all duration-300 ${
              isSpeaking
                ? 'border-amber-400 ring-4 ring-amber-400/30 scale-105'
                : 'border-[#0D5C63]'
            }`}
          >
            <img
              src="/avatar_mentor.png"
              alt="Selvi - Digital Guide"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Voice Wave Animation Badge */}
          {isSpeaking && (
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-2 shadow-md animate-bounce">
              <Volume2 className="w-4 h-4" />
            </div>
          )}
        </div>

        <h2 className="text-2xl font-extrabold text-[#0D5C63]">
          {t.introTitle}
        </h2>
        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mt-1">
          வழிகாட்டி செல்வி (Your AI Companion)
        </p>

        {/* Subtitle Dialogue Card */}
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-amber-100 my-4 text-left relative">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-[11px] font-bold text-[#0D5C63] uppercase tracking-wider">
              {isSpeaking ? 'செல்வி பேசுகிறார் (Speaking)...' : 'வழிகாட்டி செய்தி (Message)'}
            </span>
            <button
              onClick={handleReplay}
              className="flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.replayVoice}</span>
            </button>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            "{t.introText}"
          </p>
        </div>

        {/* 3 Safety Guarantees */}
        <div className="w-full space-y-2 text-left">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-teal-50/70 border border-teal-100 text-xs text-teal-900">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            <span><strong>உண்மையான பணம் இல்லை:</strong> மாதிரி கணக்கு மட்டுமே பயன்பாட்டில் உள்ளது.</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-100 text-xs text-amber-900">
            <CheckCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span><strong>பயமின்றி தவறுகள் செய்யலாம்:</strong> தவறு செய்தால் செல்வி மீண்டும் கற்றுக் கொடுப்பார்.</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 pb-4">
        <button
          onClick={() => {
            voiceManager.stop();
            onContinue();
          }}
          className="w-full min-h-[56px] py-4 rounded-2xl bg-[#0D5C63] hover:bg-[#09454A] text-white font-bold text-base shadow-md active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{t.continue} (Start Placement)</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
