import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Camera,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Info,
  Volume2,
  Share2,
  Building2,
  Calendar,
} from 'lucide-react';
import { LanguageCode, StepAttempt, StepPhase } from '../types';
import { translations } from '../lib/translations';
import { voiceManager } from '../lib/voice';
import {
  InteractiveDemoOverlay,
  YourTurnBanner,
  DemoStepAction,
} from './InteractiveDemoCursor';

interface CreyoModuleProps {
  language: LanguageCode;
  initialStepIndex?: number;
  onLogAttempt: (attempt: StepAttempt) => void;
  onOpenDoubt: (contextNote?: string) => void;
  onFinishModule: () => void;
  onExit: () => void;
}

export const CreyoModule: React.FC<CreyoModuleProps> = ({
  language,
  initialStepIndex = 0,
  onLogAttempt,
  onOpenDoubt,
  onFinishModule,
  onExit,
}) => {
  const t = translations[language];
  const [currentStep, setCurrentStep] = useState(initialStepIndex);
  const [stepPhase, setStepPhase] = useState<StepPhase>('STEP_INTRO');
  const [isDemoActive, setIsDemoActive] = useState<boolean>(true);
  const [attemptCount, setAttemptCount] = useState<number>(1);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [highlightTarget, setHighlightTarget] = useState<boolean>(false);

  const stepStartTimeRef = useRef<number>(Date.now());

  const guideLines = [
    {
      stepId: 'creyo_select_customer',
      banner: 'செல்வி: முருகன் ஸ்டோர்ஸ் (Murugan Store) கணக்கைத் தேர்ந்தெடுக்கவும்.',
      voice:
        language === 'ta'
          ? 'வணிக கணக்கை பதிவு செய்ய முருகன் ஸ்டோர்ஸ் என்பதைத் தொடுங்கள்.'
          : 'Tap Murugan Store to manage credit records.',
    },
    {
      stepId: 'creyo_record_credit',
      banner: 'செல்வி: கடன் கொடுத்த ₹500 தொகையைப் பதிவு செய்ய "Save Credit" தொடவும்.',
      voice:
        language === 'ta'
          ? 'கடன் கொடுத்த தொகையை பதிவு செய்ய Save Credit என்பதைத் தொடுங்கள்.'
          : 'Tap Save Credit to record the transaction.',
    },
    {
      stepId: 'creyo_send_reminder',
      banner: 'செல்வி: பாதுகாப்பான UPI கட்டண இணைப்புடன் நினைவூட்டல் அனுப்பவும்.',
      voice:
        language === 'ta'
          ? 'வாட்ஸ்அப் மூலம் நினைவூட்டல் அனுப்ப Send WhatsApp Reminder தொடுங்கள்.'
          : 'Tap Send WhatsApp Reminder with safe UPI payment link.',
    },
    {
      stepId: 'creyo_summary_complete',
      banner: 'செல்வி: மிக நன்று! உங்கள் வணிக கணக்கு டிஜிட்டல் முறையில் பாதுகாப்பாக உள்ளது.',
      voice:
        language === 'ta'
          ? 'அருமை! காகித நோட்டு புத்தகம் தொலைந்தாலும் டிஜிட்டல் கணக்கு எப்போதும் பாதுகாப்பானது.'
          : 'Well done! Digital business records are always safe and organized.',
    },
  ];

  const currentGuide = guideLines[currentStep] || guideLines[0];

  const demoActionsByStep: Record<number, DemoStepAction[]> = {
    0: [
      {
        targetLabel: 'Murugan Store',
        xPercent: 50,
        yPercent: 44,
        actionDescription: language === 'ta' ? 'முருகன் ஸ்டோர்ஸ் கணக்கைத் தொடுகிறேன்' : 'Tapping Murugan Store account',
        voiceText: language === 'ta' ? 'பாருங்கள், முருகன் ஸ்டோர்ஸ் கணக்கைத் திறக்க இப்படி தொட வேண்டும்.' : 'Watch, tap Murugan Store like this.',
        durationMs: 2500,
      },
    ],
    1: [
      {
        targetLabel: 'Save Credit',
        xPercent: 50,
        yPercent: 78,
        actionDescription: language === 'ta' ? 'கடன் தொகையைச் சேமிக்க Save Credit தொடுகிறேன்' : 'Tapping Save Credit button',
        voiceText: language === 'ta' ? 'தொகையை சரிபார்த்து Save Credit பொத்தானைத் தொட வேண்டும்.' : 'Verify amount, then tap Save Credit.',
        durationMs: 2600,
      },
    ],
    2: [
      {
        targetLabel: 'Send Reminder',
        xPercent: 50,
        yPercent: 64,
        actionDescription: language === 'ta' ? 'வாட்ஸ்அப் நினைவூட்டல் அனுப்ப தொடுகிறேன்' : 'Tapping Send WhatsApp Reminder',
        voiceText: language === 'ta' ? 'வாட்ஸ்அப் நினைவூட்டல் அனுப்ப இந்த பச்சை பொத்தானைத் தொட வேண்டும்.' : 'Tap this green button to send payment link.',
        durationMs: 2600,
      },
    ],
    3: [
      {
        targetLabel: 'Finish',
        xPercent: 50,
        yPercent: 84,
        actionDescription: language === 'ta' ? 'பாதுகாப்பு விதிகளை நிறைவு செய்ய தொடுகிறேன்' : 'Tapping Finish button',
        voiceText: language === 'ta' ? 'பாதுகாப்பு விதிகளைப் படித்து நிறைவு செய்ய Finish தொட வேண்டும்.' : 'Review safety rules, then tap Finish.',
        durationMs: 2500,
      },
    ],
  };

  const initStep = useCallback((stepIdx: number) => {
    stepStartTimeRef.current = Date.now();
    setAttemptCount(1);
    setFeedbackMessage(null);
    setIsSuccess(false);
    setHighlightTarget(false);
    setStepPhase('STEP_INTRO');
    setIsDemoActive(true);
  }, []);

  useEffect(() => {
    initStep(currentStep);
    return () => {
      voiceManager.stop();
    };
  }, [currentStep, initStep]);

  const handleCorrectTap = (targetName: string) => {
    const hesitationMs = Date.now() - stepStartTimeRef.current;
    onLogAttempt({
      step_id: currentGuide.stepId,
      module_id: 'creyo',
      correct: true,
      hesitation_ms: hesitationMs,
      attempt_number: attemptCount,
      timestamp: Date.now(),
    });

    setIsSuccess(true);
    setStepPhase('STEP_CORRECT');
    setFeedbackMessage('மிகச் சரி! (Correct)');

    voiceManager.speak(
      language === 'ta' ? 'அருமை! மிகச் சரியான தேர்வு.' : 'Perfect tap!',
      language
    );

    setTimeout(() => {
      if (currentStep + 1 < guideLines.length) {
        setCurrentStep(currentStep + 1);
      } else {
        onFinishModule();
      }
    }, 1200);
  };

  const handleIncorrectTap = (wrongName: string) => {
    const hesitationMs = Date.now() - stepStartTimeRef.current;
    const currentAttempt = attemptCount;

    onLogAttempt({
      step_id: currentGuide.stepId,
      module_id: 'creyo',
      correct: false,
      hesitation_ms: hesitationMs,
      attempt_number: currentAttempt,
      timestamp: Date.now(),
    });

    setAttemptCount((prev) => prev + 1);
    setStepPhase('STEP_INCORRECT');

    if (currentAttempt >= 3) {
      setFeedbackMessage(
        language === 'ta'
          ? 'கவலைப்பட வேண்டாம்! "மீண்டும் காட்டுங்கள்" தொட்டால் வழிகாட்டுகிறேன்.'
          : "Tap 'Show me again' to view the correct spot."
      );
    } else {
      setFeedbackMessage(
        language === 'ta'
          ? 'இது தவறானது. செல்வியின் வழிகாட்டலை கவனித்து மீண்டும் முயலவும்.'
          : 'Not quite. Check Selvi\'s tip below.'
      );
    }
  };

  const handleShowMeAgain = () => {
    setHighlightTarget(true);
    voiceManager.speak(currentGuide.voice, language);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-between max-w-md mx-auto w-full relative select-none">
      {/* Top Banner */}
      <div className="bg-amber-50 border-b border-amber-200/80 px-3 py-1.5 flex items-center justify-between text-xs font-semibold text-amber-900 z-30">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              voiceManager.stop();
              if (currentStep > 0) {
                setCurrentStep(currentStep - 1);
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
          <div className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">{t.practiceBanner}</span>
            <span className="sm:hidden">வணிக பயிற்சி</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-teal-800">
            படி {currentStep + 1} / 4
          </span>
          <button
            onClick={() => onOpenDoubt(`Creyo Screen ${currentStep + 1}`)}
            className="text-[11px] text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
          >
            {t.askSelvi}
          </button>
        </div>
      </div>

      {/* Your Turn Active Banner */}
      {!isDemoActive && (
        <YourTurnBanner
          language={language}
          instructionText={currentGuide.banner}
          onReplayDemo={() => setIsDemoActive(true)}
        />
      )}

      {/* Interactive Demo Overlay */}
      <InteractiveDemoOverlay
        language={language}
        isActive={isDemoActive}
        demoActions={demoActionsByStep[currentStep] || []}
        onDemoComplete={() => {
          setIsDemoActive(false);
          voiceManager.speak(
            language === 'ta'
              ? 'இப்போது உங்கள் முறை! நீங்கள் செய்து பாருங்கள்.'
              : "Now it's your turn! Go ahead and try.",
            language
          );
        }}
        onSkipDemo={() => {
          setIsDemoActive(false);
          voiceManager.speak(
            language === 'ta'
              ? 'சரி, இப்போது நீங்கள் செய்து பாருங்கள்.'
              : 'Okay, go ahead and try it yourself.',
            language
          );
        }}
      />

      {/* Screen Content */}
      <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
        {/* ================= SCREEN 1: CUSTOMER LEDGER LIST ================= */}
        {currentStep === 0 && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-[#0D5C63] text-white p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onExit}
                    className="p-1 rounded-full hover:bg-teal-700 cursor-pointer"
                    title="முகப்புக்கு திரும்பு (Back to Home)"
                  >
                    <ArrowLeft className="w-4 h-4 text-white" />
                  </button>
                  <Building2 className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold text-base">Creyo Business Ledger</h3>
                </div>
                <span className="text-[10px] bg-teal-800 px-2 py-0.5 rounded-full">
                  MSME Khata
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-teal-600/50 text-center">
                <div>
                  <span className="text-[10px] text-teal-200 block">வர வேண்டியது (You will get)</span>
                  <span className="text-lg font-extrabold text-amber-300">₹ 1,650</span>
                </div>
                <div>
                  <span className="text-[10px] text-teal-200 block">கொடுக்க வேண்டியது (You will give)</span>
                  <span className="text-lg font-extrabold text-white">₹ 0</span>
                </div>
              </div>
            </div>

            {/* Search and Customer List */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-700">வாடிக்கையாளர்கள் (Customers)</span>
                <span className="text-xs text-teal-700 font-semibold cursor-pointer">
                  + புதிய வாடிக்கையாளர்
                </span>
              </div>

              {/* Murugan Store (CORRECT TARGET) */}
              <button
                onClick={() => handleCorrectTap('Murugan Store')}
                className={`w-full min-h-[60px] p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  highlightTarget
                    ? 'ring-4 ring-amber-400 bg-amber-50 animate-pulse border-amber-500'
                    : 'bg-white border-teal-500 hover:bg-teal-50/50 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-[#0D5C63] font-bold flex items-center justify-center shrink-0">
                    M
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">முருகன் ஸ்டோர்ஸ்</h4>
                    <p className="text-[11px] text-slate-500">Murugan Stores · 2 மணி முன்</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-red-600">₹ 1,200</span>
                  <span className="text-[10px] text-slate-400 block">வர வேண்டும்</span>
                </div>
              </button>

              {/* Anand Provisions */}
              <button
                onClick={() => handleIncorrectTap('Anand Provisions')}
                className="w-full min-h-[60px] p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0">
                    A
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">ஆனந்த் மளிகை</h4>
                    <p className="text-[11px] text-slate-500">Anand Provisions · நேற்று</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-red-600">₹ 450</span>
                  <span className="text-[10px] text-slate-400 block">வர வேண்டும்</span>
                </div>
              </button>

              {/* Kavitha Bakery */}
              <button
                onClick={() => handleIncorrectTap('Kavitha Bakery')}
                className="w-full min-h-[60px] p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                    K
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">கவிதா பேக்கரி</h4>
                    <p className="text-[11px] text-slate-500">Kavitha Bakery · தீர்க்கப்பட்டது</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-700">₹ 0</span>
                  <span className="text-[10px] text-emerald-600 block">முழுவதும் செலுத்தப்பட்டது</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 2: RECORD CREDIT ================= */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <ArrowLeft
                onClick={() => setCurrentStep(0)}
                className="w-5 h-5 text-slate-700 cursor-pointer"
              />
              <h3 className="font-bold text-slate-900 text-sm">முருகன் ஸ்டோர்ஸ் — புதிய வரவு/கடன்</h3>
            </div>

            {/* Transaction Form Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="text-center">
                <span className="text-xs text-slate-500 font-semibold block">பரிவர்த்தனை தொகை</span>
                <span className="text-3xl font-extrabold text-red-600">₹ 500</span>
                <span className="text-[11px] text-red-700 block font-semibold mt-0.5">
                  கடன் கொடுத்தது (You gave credit)
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">பொருட்கள் குறிப்பு:</span>
                  <span className="font-bold text-slate-800">அரிசி மூட்டை (Rice Bag)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">தேதி:</span>
                  <span className="font-semibold text-slate-700">இன்று, 11:30 AM</span>
                </div>
              </div>

              {/* Receipt photo button */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs justify-center cursor-pointer">
                <Camera className="w-4 h-4 text-teal-600" />
                <span>ரசீது படம் இணைக்கப்பட்டுள்ளது (Receipt.jpg)</span>
              </div>

              {/* Save Credit Button (CORRECT TARGET) */}
              <button
                onClick={() => handleCorrectTap('Save Credit')}
                className={`w-full min-h-[56px] py-4 rounded-2xl font-bold text-base shadow-md active:scale-[0.98] transition cursor-pointer text-white ${
                  highlightTarget
                    ? 'ring-4 ring-amber-400 animate-pulse bg-teal-800'
                    : 'bg-[#0D5C63] hover:bg-[#09454A]'
                }`}
              >
                கணக்கில் சேமி (Save Credit)
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 3: PAYMENT REMINDER ================= */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <ArrowLeft
                onClick={() => setCurrentStep(1)}
                className="w-5 h-5 text-slate-700 cursor-pointer"
              />
              <h3 className="font-bold text-slate-900 text-sm">பணம் வசூல் நினைவூட்டல்</h3>
            </div>

            {/* Reminder Message Preview Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs text-teal-800 font-bold">
                <Share2 className="w-4 h-4 text-[#0D5C63]" />
                <span>வாட்ஸ்அப் செய்தி முன்னோட்டம் (WhatsApp Preview)</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-slate-800 leading-relaxed space-y-2">
                <p>
                  "வணக்கம் முருகன் அவர்களே, உங்கள் கடையின் நிலுவைத் தொகை <strong>₹1,700</strong>. கீழே உள்ள பாதுகாப்பான UPI லிங்க் மூலம் உடனடியாக செலுத்தலாம்."
                </p>
                <div className="bg-white p-2 rounded-xl border border-emerald-300 text-[11px] text-teal-900 font-mono">
                  🔗 upi://pay?pa=creyo-store@upi&am=1700
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                நேரில் கேட்க கூச்சமாக இருக்கும்போது, இந்த எளிய நினைவூட்டல் உறவை பாதிக்காமல் பணத்தை பெற்றுத் தரும்.
              </p>

              {/* Send WhatsApp Reminder Button (CORRECT TARGET) */}
              <button
                onClick={() => handleCorrectTap('Send WhatsApp Reminder')}
                className={`w-full min-h-[56px] py-4 rounded-2xl font-bold text-base shadow-md active:scale-[0.98] transition cursor-pointer text-white flex items-center justify-center gap-2 ${
                  highlightTarget
                    ? 'ring-4 ring-amber-400 animate-pulse bg-emerald-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Send className="w-5 h-5" />
                <span>Send WhatsApp Reminder</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 4: SAFE SUMMARY ================= */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <ArrowLeft
                onClick={() => setCurrentStep(2)}
                className="w-5 h-5 text-slate-700 cursor-pointer"
              />
              <h3 className="font-bold text-slate-900 text-sm">வணிக பாதுகாப்பு விதிகள்</h3>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-teal-200 shadow-sm text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <h4 className="text-xl font-bold text-slate-900">
                வணிக பாதுகாப்பு விதிகள்
              </h4>

              <div className="space-y-2 text-left text-xs text-slate-700 pt-2">
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-100">
                  <strong>1. காகித நோட்டு வேண்டாம்:</strong> மொபைலில் பதிவு செய்தால் மழை, தீ அல்லது தொலைந்து போவதால் கணக்கு அழியாது.
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <strong>2. வாடிக்கையாளருக்கு SMS/வாட்ஸ்அப்:</strong> ஒவ்வொரு பதிவிற்கும் தானாக கணக்கு சென்று விடுவதால் வாக்குவாதம் வராது.
                </div>
                <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <strong>3. OTP பாதுகாப்பு:</strong> வாடிக்கையாளரோ அல்லது சப்ளையரோ போன் செய்து OTP கேட்டால் எக்காரணம் கொண்டும் தரக் கூடாது.
                </div>
              </div>

              <button
                onClick={() => handleCorrectTap('Complete Creyo')}
                className="w-full min-h-[56px] mt-4 py-4 rounded-2xl bg-[#0D5C63] hover:bg-[#09454A] text-white font-bold text-base shadow-md active:scale-[0.98] transition cursor-pointer"
              >
                பயிற்சியை நிறைவு செய்க (Finish)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guide Banner at Bottom */}
      <div className="p-3 bg-white border-t border-slate-200 z-20 space-y-2">
        {feedbackMessage && (
          <div
            className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${
              isSuccess
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <XCircle className="w-4 h-4 text-amber-600" />
              )}
              <span>{feedbackMessage}</span>
            </div>

            {attemptCount >= 3 && !isSuccess && (
              <button
                onClick={handleShowMeAgain}
                className="text-[11px] bg-amber-600 text-white px-2.5 py-1 rounded-lg font-bold hover:bg-amber-700 cursor-pointer"
              >
                {t.showMeAgain}
              </button>
            )}
          </div>
        )}

        <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-teal-600 shrink-0 bg-white">
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
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                SELVI, YOUR GUIDE
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">
                {currentGuide.banner}
              </p>
            </div>
          </div>

          <button
            onClick={() => voiceManager.speak(currentGuide.voice, language)}
            className="p-1.5 rounded-lg bg-white border border-teal-200 text-teal-800 hover:bg-teal-100 transition cursor-pointer shrink-0"
            title={t.replayVoice}
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
