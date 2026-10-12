import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  BookOpen,
  Volume2,
  ArrowRight,
  Shield,
  Smartphone,
  MessageCircle,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../lib/translations';

interface LandingHeroProps {
  onStart: () => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenDoubt?: () => void;
  onOpenWhatsAppTutorial?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStart,
  language,
  onLanguageChange,
  onOpenDoubt,
  onOpenWhatsAppTutorial,
}) => {
  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-between text-slate-800 relative selection:bg-teal-200">
      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-slate-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-2xs z-20">
        {/* Left: Brand & AI Mentor Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-sky-300 bg-white flex items-center justify-center p-1 shadow-2xs overflow-hidden">
            <img
              src="/logo.png"
              alt="FirstTap"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 leading-tight">FirstTap</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold tracking-tight">
                AI Mentor
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-none mt-0.5">
              டிஜிட்டல் வழிகாட்டி (Digital Literacy Guide)
            </p>
          </div>
        </div>

        {/* Right: Language Button & 100% Safety Pill */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              const nextLang: LanguageCode =
                language === 'ta' ? 'hi' : language === 'hi' ? 'en' : 'ta';
              onLanguageChange(nextLang);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-slate-700 text-xs font-semibold shadow-2xs hover:bg-amber-50/60 transition cursor-pointer"
            title="Switch Language"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {language === 'ta'
                ? 'தமிழ்'
                : language === 'hi'
                ? 'हिन्दी'
                : 'English'}
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% பாதுகாப்பான பயிற்சி</span>
          </div>
        </div>
      </header>

      {/* Main Center Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full text-center">
        {/* Centered Large App Logo */}
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-white p-3 shadow-md border-2 border-sky-400 flex items-center justify-center mb-4 transform hover:scale-105 transition-transform duration-300">
          <img
            src="/logo.png"
            alt="FirstTap Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Small Tag Pill above title */}
        <div className="inline-flex items-center px-3.5 py-1 rounded-md bg-cyan-50 border border-cyan-200/90 text-teal-800 text-xs font-bold mb-3 shadow-2xs">
          உங்கள் முதல் டிஜிட்டல் படி
        </div>

        {/* Big Main Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight mb-2">
          FirstTap – டிஜிட்டல் கற்றல் வழிகாட்டி
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6 font-medium">
          முதியவர்கள் மற்றும் முதல்முறை ஸ்மார்ட்போன் பயன்படுத்துவோருக்கு அன்பான, பொறுமையான தமிழ் குரல் வழிகாட்டி.
        </p>

        {/* 3 Feature Cards Side-by-Side (Exact Screenshot Match) */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-md mb-6">
          {/* Card 1: 100% பாதுகாப்பு */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center min-h-[76px] transition hover:shadow-xs">
            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
              <Shield className="w-4 h-4 text-blue-600 fill-blue-600/20" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">100% பாதுகாப்பு</span>
          </div>

          {/* Card 2: குரல் வழிகாட்டி */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center min-h-[76px] transition hover:shadow-xs">
            <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
              <Volume2 className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">குரல் வழிகாட்டி</span>
          </div>

          {/* Card 3: தொட்டு பயிற்சி */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center min-h-[76px] transition hover:shadow-xs">
            <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
              <Smartphone className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">தொட்டு பயிற்சி</span>
          </div>
        </div>

        {/* Primary CTA Button: கற்றலைத் தொடங்கலாம் (Start Learning) */}
        <div className="w-full max-w-md">
          <button
            onClick={onStart}
            className="w-full min-h-[56px] py-4 px-6 rounded-2xl bg-[#0D5C63] hover:bg-[#09454A] text-white font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition flex items-center justify-between cursor-pointer border border-teal-400/30 group"
          >
            <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="flex-1 text-center font-bold text-white tracking-wide">
              கற்றலைத் தொடங்கலாம் (Start Learning)
            </span>
            <ArrowRight className="w-5 h-5 text-teal-200 group-hover:translate-x-1 transition-transform" />
          </button>

          {onOpenWhatsAppTutorial && (
            <button
              onClick={onOpenWhatsAppTutorial}
              className="w-full mt-3 py-3 px-4 rounded-2xl bg-white hover:bg-emerald-50 text-[#008069] font-bold text-xs shadow-xs border border-emerald-300 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span>வாட்ஸ்அப் பயிற்சி (WhatsApp Beginner Tutorial - Lessons 1-5)</span>
            </button>
          )}
        </div>
      </main>

      {/* Floating Selvi Assistant / Doubt Button (Matching bottom right in screenshot) */}
      <button
        onClick={onOpenDoubt}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#0D5C63] hover:bg-[#09454A] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition cursor-pointer border-2 border-white z-50 group"
        title="செல்வியிடம் சந்தேகம் கேளுங்கள் (Ask Selvi)"
      >
        <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Bottom left small avatar */}
      <div className="fixed bottom-6 left-6 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-md z-40 opacity-80">
        N
      </div>
    </div>
  );
};
