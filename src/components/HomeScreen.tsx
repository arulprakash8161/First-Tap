import React from 'react';
import {
  MessageSquare,
  CreditCard,
  Building2,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { ActiveModule, LanguageCode, PlacementProfile } from '../types';
import { translations } from '../lib/translations';

interface HomeScreenProps {
  language: LanguageCode;
  placementProfile: PlacementProfile;
  onSelectModule: (module: ActiveModule, startingStepIndex: number) => void;
  onOpenDoubt: () => void;
  onRetakePlacement: () => void;
  onViewResults: () => void;
  onBack: () => void;
}

interface ModuleCardConfig {
  id: ActiveModule;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  accentBg: string;
  accentColor: string;
  startingStepIndex: number;
  reasonLine?: string;
  priorityScore: number;
  isScamDrillHighlight?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  language,
  placementProfile,
  onSelectModule,
  onOpenDoubt,
  onRetakePlacement,
  onViewResults,
  onBack,
}) => {
  const t = translations[language];

  // Logic to determine module personalization per user specifications:
  // - Low general digital-literacy (1-4) -> FirstTapMessage leads first
  // - Low scam-confidence score (1-4) -> fake-request drill recommended first with reason line: "Let's start here — this is the one most people get wrong"
  // - Low payment confidence (1-4) -> FirstTapPay surfaced with fake request drill earlier
  // - High confidence on all 3 (7-10) -> can skip straight to Creyo
  // - WhatsApp sharing "Yes" -> FirstTapMessage opens past basic intro straight into location/call steps (step index 2 or 3)
  // - Payment "Yes" -> FirstTapPay opens past basic intro straight into amount check or fake request drill (step index 2 or 4)

  const isLowDigitalLiteracy = placementProfile.general_digital_literacy <= 4;
  const isLowScamConfidence = placementProfile.scam_awareness_confidence <= 4;
  const isLowPaymentConfidence = placementProfile.payment_confidence <= 4;
  const isHighAllConfidence =
    placementProfile.general_digital_literacy >= 7 &&
    placementProfile.payment_confidence >= 7 &&
    placementProfile.scam_awareness_confidence >= 7;

  // Calculate starting steps based on placement
  let messageStartStep = 0;
  if (placementProfile.knows_sharing || placementProfile.browsed_independent) {
    messageStartStep = 2; // Jump past chat list straight into sharing / location
  }

  let payStartStep = 0;
  if (isLowScamConfidence) {
    payStartStep = 4; // Jump straight into "Spot a fake request" drill
  } else if (isLowPaymentConfidence) {
    payStartStep = 1; // Start at contact selection
  } else if (placementProfile.made_digital_payment) {
    payStartStep = 2; // Jump to amount & name check
  }

  // Build module list with priority weights
  const modules: ModuleCardConfig[] = [
    {
      id: 'pay',
      title: 'FirstTapPay',
      subtitle:
        language === 'ta'
          ? 'UPI பண பரிவர்த்தனை மற்றும் மோசடி விழிப்புணர்வு'
          : 'UPI digital payments & fraud safety drill',
      badge:
        isLowScamConfidence
          ? language === 'ta'
            ? 'முக்கிய பாதுகாப்பு பயிற்சி'
            : 'Critical Safety Drill'
          : '6 பயிற்சி படிகள்',
      icon: isLowScamConfidence ? (
        <ShieldAlert className="w-6 h-6 text-red-600" />
      ) : (
        <CreditCard className="w-6 h-6 text-[#0D5C63]" />
      ),
      accentBg: isLowScamConfidence ? 'bg-red-50' : 'bg-teal-50',
      accentColor: isLowScamConfidence ? 'text-red-700' : 'text-[#0D5C63]',
      startingStepIndex: payStartStep,
      isScamDrillHighlight: isLowScamConfidence,
      reasonLine: isLowScamConfidence
        ? language === 'ta'
          ? 'இங்கிருந்து தொடங்குவோம் — பெரும்பாலான மக்கள் தவறிழைக்கும் பகுதி இதுவே!'
          : "Let's start here — this is the one most people get wrong"
        : isLowPaymentConfidence
        ? language === 'ta'
          ? 'பணம் செலுத்துவதற்கு முன் பெயரை சரிபார்க்கும் பயிற்சி'
          : 'Practice verifying names before paying'
        : undefined,
      priorityScore: isLowScamConfidence ? 100 : isLowDigitalLiteracy ? 60 : 80,
    },
    {
      id: 'message',
      title: 'FirstTapMessage',
      subtitle:
        language === 'ta'
          ? 'வாட்ஸ்அப் பாணியில் மெசேஜ், புகைப்படம் & லொகேஷன் பகிர்வு'
          : 'WhatsApp-style chat, photo & live location sharing',
      badge: language === 'ta' ? 'பாடங்கள் (W0 - W7)' : 'Lessons (W0 - W7)',
      icon: <MessageSquare className="w-6 h-6 text-emerald-600" />,
      accentBg: 'bg-emerald-50',
      accentColor: 'text-emerald-800',
      startingStepIndex: messageStartStep,
      reasonLine: isLowDigitalLiteracy
        ? language === 'ta'
          ? 'மெசேஜ் அனுப்புவது எளிமையான தொடக்கம் — முதலில் இதை பயிலலாம்'
          : 'Messaging is the gentlest on-ramp — let us start here'
        : messageStartStep > 0
        ? language === 'ta'
          ? 'அடிப்படை தெரியும் என்பதால் நேரடியாக லொகேஷன்/அழைப்பு பயிற்சி'
          : 'Skipped intro to location & call steps based on your experience'
        : undefined,
      priorityScore: isLowDigitalLiteracy ? 90 : 70,
    },
    {
      id: 'creyo',
      title: 'Creyo Finance',
      subtitle:
        language === 'ta'
          ? 'சிறு வணிக கடன் கணக்கு (Khata) & பாதுகாப்பான UPI வசூல்'
          : 'MSME business credit ledger & safe digital collection',
      badge:
        isHighAllConfidence
          ? language === 'ta'
            ? 'மேம்பட்ட நிலை'
            : 'Advanced Track'
          : '4 வணிக படிகள்',
      icon: <Building2 className="w-6 h-6 text-amber-600" />,
      accentBg: 'bg-amber-50',
      accentColor: 'text-amber-800',
      startingStepIndex: 0,
      reasonLine: isHighAllConfidence
        ? language === 'ta'
          ? 'உங்கள் தன்னம்பிக்கை அதிகம் என்பதால் நேரடியாக வணிக கணக்கை கற்கலாம்'
          : 'High confidence on all basics — skip straight to business finance'
        : undefined,
      priorityScore: isHighAllConfidence ? 95 : 50,
    },
  ];

  // Sort modules descending by personalized priority
  modules.sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-between p-4 max-w-md mx-auto w-full">
      {/* Top Header */}
      <div className="pt-2">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              title="பின்செல் (Back)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.back}</span>
            </button>

            <div className="w-9 h-9 rounded-xl overflow-hidden border border-teal-500 bg-white p-0.5 shadow-xs shrink-0">
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
              <span className="text-xs font-bold text-[#0D5C63] block">செல்வி வழிகாட்டி</span>
              <span className="text-[10px] text-slate-500">Learning Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDoubt}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold cursor-pointer transition shadow-xs"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.askSelvi}</span>
            </button>
          </div>
        </div>

        {/* Personalized Placement Summary Bar */}
        <div className="mt-4 p-3 rounded-2xl bg-white border border-teal-600/20 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <div className="text-xs">
              <span className="font-bold text-slate-800">உங்கள் சுயவிவரம்: </span>
              <span className="text-slate-600">
                பொது: {placementProfile.general_digital_literacy}/10 · பணம்: {placementProfile.payment_confidence}/10 · விழிப்புணர்வு: {placementProfile.scam_awareness_confidence}/10
              </span>
            </div>
          </div>

          <button
            onClick={onRetakePlacement}
            className="text-[11px] text-teal-700 hover:underline font-semibold cursor-pointer shrink-0 ml-2"
          >
            மாற்ற
          </button>
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-extrabold text-[#0D5C63]">
            {t.homeTitle}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {t.homeSubtitle}
          </p>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-3.5 my-4">
        {modules.map((m, idx) => (
          <div
            key={m.id}
            className={`p-4 rounded-3xl border bg-white shadow-xs transition-all hover:shadow-md ${
              idx === 0
                ? 'border-2 border-[#0D5C63]/40 ring-2 ring-teal-500/10'
                : 'border-slate-200'
            }`}
          >
            {/* Top Tag */}
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${m.accentBg} ${m.accentColor}`}>
                {m.badge}
              </span>
              {idx === 0 && (
                <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t.recommendedTag}</span>
                </span>
              )}
            </div>

            {/* Title & Icon */}
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-2xl ${m.accentBg} flex items-center justify-center shrink-0`}>
                {m.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {m.subtitle}
                </p>
              </div>
            </div>

            {/* Personalization Reason Line */}
            {m.reasonLine && (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900 font-medium flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{m.reasonLine}</span>
              </div>
            )}

            {/* Launch Button (56px min height) */}
            <button
              onClick={() => onSelectModule(m.id, m.startingStepIndex)}
              className={`w-full min-h-[52px] mt-3.5 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98] ${
                idx === 0
                  ? 'bg-[#0D5C63] hover:bg-[#09454A] text-white shadow-sm'
                  : 'bg-teal-50 hover:bg-teal-100 text-[#0D5C63] border border-teal-200'
              }`}
            >
              <span>{t.startModule}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="pt-2 pb-3 space-y-2">
        <button
          onClick={onViewResults}
          className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>முந்தைய பயிற்சி மதிப்பீட்டு அறிக்கையை பார்க்க (View Confidence Report)</span>
        </button>

        <p className="text-[11px] text-center text-slate-400">
          FirstTap · Practice Mode Sandbox · No Real Financial Calls
        </p>
      </div>
    </div>
  );
};
