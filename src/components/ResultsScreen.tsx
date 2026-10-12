import React, { useState } from 'react';
import {
  Trophy,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Share2,
} from 'lucide-react';
import { ConfidenceScoreBreakdown, LanguageCode, PlacementProfile, StepAttempt } from '../types';
import { translations } from '../lib/translations';
import { calculateDigitalConfidenceIndex } from '../lib/scoring';

interface ResultsScreenProps {
  language: LanguageCode;
  attempts: StepAttempt[];
  placementProfile: PlacementProfile;
  onRestart: () => void;
  onReturnHome: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  language,
  attempts,
  placementProfile,
  onRestart,
  onReturnHome,
}) => {
  const t = translations[language];
  const [showLogDetails, setShowLogDetails] = useState(false);

  const breakdown: ConfidenceScoreBreakdown = calculateDigitalConfidenceIndex(
    attempts,
    placementProfile,
    language
  );

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-between p-4 max-w-md mx-auto w-full">
      {/* Top Header */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onReturnHome}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.back}</span>
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Confidence Report</span>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-[#0D5C63]">
            {t.digitalConfidenceTitle}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {t.digitalConfidenceSubtitle}
          </p>
        </div>
      </div>

      {/* Main Score Card with Score Dial */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-200/80 my-4 text-center space-y-4">
        {/* Score Ring */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#E2E8F0"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#0D5C63"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * breakdown.overallScore) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-[#0D5C63] font-mono tabular-nums">
              {breakdown.overallScore}
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              மதிப்பெண் (DCI)
            </span>
          </div>
        </div>

        {/* Level Title */}
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {breakdown.levelTitle}
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed px-2 bg-amber-50/70 p-3 rounded-2xl border border-amber-100">
            "{breakdown.summaryFeedback}"
          </p>
        </div>

        {/* 3 Key Metrics Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <Clock className="w-4 h-4 text-teal-600 mx-auto mb-1" />
            <span className="text-xs font-extrabold text-slate-800 block">
              {(breakdown.hesitationAverageMs / 1000).toFixed(1)}s
            </span>
            <span className="text-[10px] text-slate-500">சராசரி தயக்கம்</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <span className="text-xs font-extrabold text-slate-800 block">
              {breakdown.unassistedRate}%
            </span>
            <span className="text-[10px] text-slate-500">சுய வெற்றி வீதம்</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <span className="text-xs font-extrabold text-slate-800 block">
              {breakdown.vigilanceScore}/100
            </span>
            <span className="text-[10px] text-slate-500">மோசடி பாதுகாப்பு</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison: Placement Baseline vs. Measured Performance */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 my-2 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <TrendingUp className="w-4 h-4 text-teal-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {t.placementComparison}
          </h4>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-50">
            <span className="text-slate-600">ஸ்மார்ட்போன் பழக்கம்</span>
            <span className="font-bold text-slate-800">
              {placementProfile.used_smartphone ? 'ஆம் (Yes)' : 'புதியவர் (Novice)'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-50">
            <span className="text-slate-600">வாட்ஸ்அப் பகிர்வு முன் அனுபவம்</span>
            <span className="font-bold text-slate-800">
              {placementProfile.knows_sharing ? 'ஆம் (Known)' : 'இல்லை (Learned now)'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-50">
            <span className="text-slate-600">தொடக்க நம்பிக்கை (Placement)</span>
            <span className="font-bold text-slate-800">
              {placementProfile.general_digital_literacy} / 10
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-50">
            <span className="text-slate-600">பணம் செலுத்தும் நம்பிக்கை (Initial)</span>
            <span className="font-bold text-slate-800">
              {placementProfile.payment_confidence} / 10
            </span>
          </div>

          <div className="flex justify-between items-center py-1 bg-teal-50 px-2 rounded-lg text-teal-900 font-bold">
            <span>பயிற்சிக்கு பிந்தைய உண்மையான குறியீடு</span>
            <span className="text-sm text-[#0D5C63]">{breakdown.overallScore} / 100</span>
          </div>
        </div>

        {/* Recommendations list */}
        <div className="pt-2">
          <h5 className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase">
            அடுத்த கற்றல் பரிந்துரை:
          </h5>
          <div className="space-y-1.5">
            {breakdown.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-amber-50 text-xs text-amber-950 font-medium flex items-start gap-2 border border-amber-200/60"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Telemetry Step Attempts Drawer Toggle */}
      <div className="my-2">
        <button
          onClick={() => setShowLogDetails(!showLogDetails)}
          className="w-full p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
            <span>விரிவான தொடுதல் பதிவுகள் ({attempts.length} attempts)</span>
          </div>
          {showLogDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showLogDetails && (
          <div className="mt-2 p-3 rounded-2xl bg-white border border-slate-200 max-h-48 overflow-y-auto text-[11px] space-y-1.5 divide-y divide-slate-100">
            {attempts.map((att, idx) => (
              <div key={idx} className="pt-1.5 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-slate-800">{att.step_id}</span>
                  <span className="text-[9px] text-slate-400 block">
                    Attempt #{att.attempt_number} · {(att.hesitation_ms / 1000).toFixed(2)}s latency
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    att.correct
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {att.correct ? 'Correct ✓' : 'Retry ✗'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Navigation */}
      <div className="space-y-2 pt-2 pb-4">
        <button
          onClick={onReturnHome}
          className="w-full min-h-[56px] py-4 rounded-2xl bg-[#0D5C63] hover:bg-[#09454A] text-white font-bold text-base shadow-md active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>முகப்புப் பக்கத்திற்குச் செல் (Go to Home)</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={onRestart}
          className="w-full min-h-[48px] py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.restartJourney}</span>
        </button>
      </div>
    </div>
  );
};
