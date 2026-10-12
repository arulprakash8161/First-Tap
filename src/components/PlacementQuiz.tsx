import React, { useState, useEffect } from 'react';
import { Volume2, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import { LanguageCode, PlacementProfile } from '../types';
import { translations } from '../lib/translations';
import { voiceManager } from '../lib/voice';

interface PlacementQuizProps {
  language: LanguageCode;
  onComplete: (profile: PlacementProfile) => void;
  onBack: () => void;
}

export const PlacementQuiz: React.FC<PlacementQuizProps> = ({
  language,
  onComplete,
  onBack,
}) => {
  const t = translations[language];
  const questions = t.placementQuestions;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Profile accumulator state
  const [profile, setProfile] = useState<PlacementProfile>({
    used_smartphone: null,
    used_whatsapp: null,
    knows_sharing: null,
    browsed_independent: null,
    general_digital_literacy: 5,
    made_digital_payment: null,
    payment_confidence: 5,
    scam_awareness_confidence: 5,
  });

  const [currentScaleValue, setCurrentScaleValue] = useState<number>(5);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    // Speak question aloud
    if (currentQ) {
      voiceManager.speak(
        currentQ.voiceText,
        language,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }

    return () => {
      voiceManager.stop();
    };
  }, [currentIndex, language, currentQ]);

  const handleReplayVoice = () => {
    if (currentQ) {
      voiceManager.speak(
        currentQ.voiceText,
        language,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  const handleYesNoAnswer = (val: boolean) => {
    voiceManager.stop();
    const updated = { ...profile };

    if (currentQ.id === 'q1') updated.used_smartphone = val;
    else if (currentQ.id === 'q2') updated.used_whatsapp = val;
    else if (currentQ.id === 'q3') updated.knows_sharing = val;
    else if (currentQ.id === 'q4') updated.browsed_independent = val;
    else if (currentQ.id === 'q6') updated.made_digital_payment = val;

    setProfile(updated);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(updated);
    }
  };

  const handleScaleSubmit = (score: number) => {
    voiceManager.stop();
    const updated = { ...profile };

    if (currentQ.id === 'q5') updated.general_digital_literacy = score;
    else if (currentQ.id === 'q7') updated.payment_confidence = score;
    else if (currentQ.id === 'q8') updated.scam_awareness_confidence = score;

    setProfile(updated);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setCurrentScaleValue(5);
    } else {
      onComplete(updated);
    }
  };

  const handlePreviousQuestion = () => {
    voiceManager.stop();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-between p-4 max-w-md mx-auto w-full">
      {/* Top Header & Progress */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handlePreviousQuestion}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-white/80 border border-slate-200 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.back}</span>
          </button>

          <span className="text-xs font-bold text-[#0D5C63]">
            கேள்வி {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-600 to-amber-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="flex-1 flex flex-col justify-center my-6">
        <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-amber-100/80 relative">
          {/* Guide Header Banner */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full overflow-hidden border-2 shrink-0 ${
                  isSpeaking ? 'border-amber-400 ring-2 ring-amber-300 animate-pulse' : 'border-[#0D5C63]'
                }`}
              >
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
                <span className="text-xs font-bold text-[#0D5C63] block">செல்வி கேட்கிறார்</span>
                <span className="text-[10px] text-slate-400">Selvi asks</span>
              </div>
            </div>

            <button
              onClick={handleReplayVoice}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition cursor-pointer"
              title={t.replayVoice}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t.replayVoice}</span>
            </button>
          </div>

          {/* Question Text */}
          <h3 className="text-xl font-bold text-slate-900 leading-snug">
            {currentQ.question}
          </h3>
          <p className="text-xs text-slate-500 mt-2">
            {currentQ.subtext}
          </p>

          {/* Interactive Answer Formats */}
          <div className="mt-8">
            {currentQ.type === 'yes_no' ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleYesNoAnswer(true)}
                  className="min-h-[56px] py-4 rounded-2xl bg-teal-50 border-2 border-teal-600/30 hover:border-teal-700 text-teal-900 font-bold text-lg active:scale-95 transition flex items-center justify-center cursor-pointer shadow-xs"
                >
                  ✓ {t.yes}
                </button>

                <button
                  onClick={() => handleYesNoAnswer(false)}
                  className="min-h-[56px] py-4 rounded-2xl bg-slate-50 border-2 border-slate-300 hover:border-slate-500 text-slate-700 font-bold text-lg active:scale-95 transition flex items-center justify-center cursor-pointer shadow-xs"
                >
                  ✗ {t.no}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-[#0D5C63]">
                    {currentScaleValue}
                  </span>
                  <span className="text-xs text-slate-500 block">/ 10</span>
                </div>

                {/* 1 - 10 Quick Select Grid (56px minimum hitboxes) */}
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isSelected = currentScaleValue === num;
                    return (
                      <button
                        key={num}
                        onClick={() => setCurrentScaleValue(num)}
                        className={`min-h-[48px] rounded-xl font-bold text-base transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0D5C63] text-white shadow-md scale-105'
                            : 'bg-slate-100 hover:bg-teal-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between text-[11px] font-semibold text-slate-500 px-1 pt-1">
                  <span>1: பயம் / தெரியாது</span>
                  <span>10: முழு நம்பிக்கை</span>
                </div>

                <button
                  onClick={() => handleScaleSubmit(currentScaleValue)}
                  className="w-full min-h-[56px] mt-4 py-3.5 rounded-2xl bg-[#0D5C63] hover:bg-[#09454A] text-white font-bold text-base shadow-md active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t.confirm || 'உறுதி செய்க'} (Next)</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Safety Reassurance Note */}
      <div className="text-center pb-2">
        <p className="text-[11px] text-slate-500">
          💡 இது மதிப்பீட்டு தேர்வு அல்ல. உங்கள் வேகத்திற்கு ஏற்ப பயிற்சியை அமைக்க மட்டுமே.
        </p>
      </div>
    </div>
  );
};
