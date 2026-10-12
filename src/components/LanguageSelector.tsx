import React from 'react';
import { Volume2, ArrowRight, ArrowLeft } from 'lucide-react';
import { LanguageCode } from '../types';
import { voiceManager } from '../lib/voice';

interface LanguageSelectorProps {
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onContinue: () => void;
  onBack: () => void;
}

interface LanguageOption {
  code: LanguageCode;
  nativeTitle: string;
  englishTitle: string;
  sampleVoiceText: string;
  subtext: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: 'ta',
    nativeTitle: 'தமிழ்',
    englishTitle: 'Tamil',
    sampleVoiceText: 'வணக்கம்! நான் உங்கள் கற்றல் வழிகாட்டி செல்வி.',
    subtext: 'தமிழ் மொழியில் குரல் மற்றும் வழிகாட்டல்',
  },
  {
    code: 'hi',
    nativeTitle: 'हिन्दी',
    englishTitle: 'Hindi',
    sampleVoiceText: 'नमस्ते! मैं आपकी गाइड सेलवी हूँ।',
    subtext: 'हिन्दी में आवाज़ और सरल निर्देश',
  },
  {
    code: 'en',
    nativeTitle: 'English',
    englishTitle: 'Indian English',
    sampleVoiceText: 'Hello! I am your learning guide Selvi.',
    subtext: 'Clear English instructions and prompts',
  },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onSelectLanguage,
  onContinue,
  onBack,
}) => {
  const handleSelect = (lang: LanguageCode, voiceText: string) => {
    onSelectLanguage(lang);
    voiceManager.speak(voiceText, lang);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-between p-4 max-w-md mx-auto w-full">
      {/* Top Navigation */}
      <div className="pt-2 pb-1 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{currentLanguage === 'ta' ? 'பின்செல்' : currentLanguage === 'hi' ? 'पीछे' : 'Back'}</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <span>வழிகாட்டி செல்வி (Guide Selvi)</span>
        </div>
      </div>

      {/* Top Banner */}
      <div className="pt-2 pb-2 text-center">
        <h2 className="text-2xl font-bold text-[#0D5C63]">மொழியைத் தேர்ந்தெடுக்கவும்</h2>
        <p className="text-xs text-slate-600 mt-1">
          Choose your preferred voice & text language
        </p>
      </div>

      {/* Language Options Grid */}
      <div className="space-y-3 my-4">
        {LANGUAGES.map((item) => {
          const isSelected = currentLanguage === item.code;
          return (
            <button
              key={item.code}
              onClick={() => handleSelect(item.code, item.sampleVoiceText)}
              className={`w-full min-h-[64px] p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#0D5C63] shadow-md ring-2 ring-[#0D5C63]/20'
                  : 'bg-white/80 border-slate-200 hover:border-teal-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    isSelected
                      ? 'bg-[#0D5C63] text-white'
                      : 'bg-teal-50 text-[#0D5C63]'
                  }`}
                >
                  {item.code === 'ta'
                    ? 'த'
                    : item.code === 'hi'
                    ? 'ह'
                    : item.code === 'en'
                    ? 'En'
                    : 'Tg'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">
                      {item.nativeTitle}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({item.englishTitle})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{item.subtext}</p>
                </div>
              </div>

              <div
                className={`p-2 rounded-full ${
                  isSelected
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-slate-400 hover:text-teal-600'
                }`}
                title="Tap to preview voice"
              >
                <Volume2 className="w-5 h-5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Reassurance & Continue Button */}
      <div className="space-y-3 pb-4">
        <p className="text-xs text-center text-slate-500">
          💡 நீங்கள் எப்போது வேண்டுமானாலும் மொழியை மாற்றிக் கொள்ளலாம்
        </p>

        <button
          onClick={onContinue}
          className="w-full min-h-[56px] py-4 rounded-2xl bg-[#0D5C63] hover:bg-[#09454A] text-white font-bold text-base shadow-md active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>தொடரலாம் (Continue)</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
