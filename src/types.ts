export type LanguageCode = 'ta' | 'hi' | 'en';

export interface PlacementProfile {
  used_smartphone: boolean | null;
  used_whatsapp: boolean | null;
  knows_sharing: boolean | null;
  browsed_independent: boolean | null;
  general_digital_literacy: number; // 1 - 10
  made_digital_payment: boolean | null;
  payment_confidence: number; // 1 - 10
  scam_awareness_confidence: number; // 1 - 10
}

export interface StepAttempt {
  step_id: string;
  module_id: 'pay' | 'message' | 'creyo';
  correct: boolean;
  hesitation_ms: number;
  attempt_number: number;
  timestamp: number;
}

export type AppState =
  | 'WHATSAPP_TUTORIAL'
  | 'LANDING'
  | 'LANGUAGE_SELECT'
  | 'INTRO'
  | 'PLACEMENT'
  | 'HOME'
  | 'SANDBOX'
  | 'RESULTS';

export type ActiveModule = 'pay' | 'message' | 'creyo';

export type StepPhase =
  | 'STEP_INTRO'
  | 'STEP_WAIT_INPUT'
  | 'STEP_CORRECT'
  | 'STEP_INCORRECT'
  | 'SHOW_ME_REPLAY';

export interface DoubtContext {
  isOpen: boolean;
  returnAppState: AppState;
  returnModule: ActiveModule | null;
  returnStepIndex: number;
  contextNote?: string;
}

export interface ConfidenceScoreBreakdown {
  overallScore: number; // 0 - 100
  accuracyScore: number;
  speedScore: number;
  vigilanceScore: number;
  unassistedRate: number;
  hesitationAverageMs: number;
  totalAttempts: number;
  mistakesCount: number;
  replaysUsed: number;
  levelTitle: string;
  summaryFeedback: string;
  recommendations: string[];
}
