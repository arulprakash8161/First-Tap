/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ActiveModule,
  AppState,
  DoubtContext,
  LanguageCode,
  PlacementProfile,
  StepAttempt,
} from './types';
import { LandingHero } from './components/LandingHero';
import { LanguageSelector } from './components/LanguageSelector';
import { IntroStep } from './components/IntroStep';
import { PlacementQuiz } from './components/PlacementQuiz';
import { HomeScreen } from './components/HomeScreen';
import { FirstTapPay } from './components/FirstTapPay';
import { FirstTapMessage } from './components/FirstTapMessage';
import { CreyoModule } from './components/CreyoModule';
import { DoubtDrawer } from './components/DoubtDrawer';
import { ResultsScreen } from './components/ResultsScreen';
import { WhatsAppTutorialScreen } from './components/WhatsAppTutorialScreen';

const DEFAULT_PLACEMENT_PROFILE: PlacementProfile = {
  used_smartphone: false,
  used_whatsapp: false,
  knows_sharing: false,
  browsed_independent: false,
  general_digital_literacy: 4,
  made_digital_payment: false,
  payment_confidence: 3,
  scam_awareness_confidence: 3,
};

export default function App() {
  const [appState, setAppState] = useState<AppState>('WHATSAPP_TUTORIAL');
  const [language, setLanguage] = useState<LanguageCode>('ta');
  const [placementProfile, setPlacementProfile] = useState<PlacementProfile>(
    DEFAULT_PLACEMENT_PROFILE
  );
  const [activeModule, setActiveModule] = useState<ActiveModule>('pay');
  const [moduleStartStepIndex, setModuleStartStepIndex] = useState<number>(0);
  const [attempts, setAttempts] = useState<StepAttempt[]>([]);

  // Interrupt Doubt Handling Stack
  const [doubtContext, setDoubtContext] = useState<DoubtContext | null>(null);

  // Handlers for App Navigation Flow
  const handleStartFromLanding = () => {
    setAppState('LANGUAGE_SELECT');
  };

  const handleLanguageContinue = () => {
    setAppState('INTRO');
  };

  const handleIntroContinue = () => {
    setAppState('PLACEMENT');
  };

  const handlePlacementComplete = (profile: PlacementProfile) => {
    setPlacementProfile(profile);
    setAppState('HOME');
  };

  const handleSelectModule = (mod: ActiveModule, startingStep: number) => {
    setActiveModule(mod);
    setModuleStartStepIndex(startingStep);
    setAppState('SANDBOX');
  };

  const handleLogAttempt = (attempt: StepAttempt) => {
    setAttempts((prev) => [...prev, attempt]);
  };

  const handleOpenDoubt = (contextNote?: string) => {
    setDoubtContext({
      isOpen: true,
      returnAppState: appState,
      returnModule: appState === 'SANDBOX' ? activeModule : null,
      returnStepIndex: moduleStartStepIndex,
      contextNote,
    });
  };

  const handleCloseDoubt = () => {
    setDoubtContext(null);
  };

  const handleFinishModule = () => {
    setAppState('RESULTS');
  };

  const handleRestartJourney = () => {
    setAttempts([]);
    setAppState('LANGUAGE_SELECT');
  };

  const handleReturnHome = () => {
    setAppState('HOME');
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-slate-800 antialiased font-['Mukta',sans-serif] relative">
      {/* State Machine View Rendering */}
      {appState === 'WHATSAPP_TUTORIAL' && (
        <WhatsAppTutorialScreen
          onBackToMainMenu={() => setAppState('LANDING')}
        />
      )}

      {appState === 'LANDING' && (
        <LandingHero
          language={language}
          onStart={handleStartFromLanding}
          onLanguageChange={setLanguage}
          onOpenDoubt={() => handleOpenDoubt('Landing Page')}
          onOpenWhatsAppTutorial={() => setAppState('WHATSAPP_TUTORIAL')}
        />
      )}

      {appState === 'LANGUAGE_SELECT' && (
        <LanguageSelector
          currentLanguage={language}
          onSelectLanguage={setLanguage}
          onContinue={handleLanguageContinue}
          onBack={() => setAppState('LANDING')}
        />
      )}

      {appState === 'INTRO' && (
        <IntroStep
          language={language}
          onContinue={handleIntroContinue}
          onBack={() => setAppState('LANGUAGE_SELECT')}
        />
      )}

      {appState === 'PLACEMENT' && (
        <PlacementQuiz
          language={language}
          onComplete={handlePlacementComplete}
          onBack={() => setAppState('INTRO')}
        />
      )}

      {appState === 'HOME' && (
        <HomeScreen
          language={language}
          placementProfile={placementProfile}
          onSelectModule={handleSelectModule}
          onOpenDoubt={() => handleOpenDoubt('Home Screen')}
          onRetakePlacement={() => setAppState('PLACEMENT')}
          onViewResults={() => setAppState('RESULTS')}
          onBack={() => setAppState('PLACEMENT')}
        />
      )}

      {appState === 'SANDBOX' && (
        <>
          {activeModule === 'pay' && (
            <FirstTapPay
              language={language}
              initialStepIndex={moduleStartStepIndex}
              onLogAttempt={handleLogAttempt}
              onOpenDoubt={(note) => handleOpenDoubt(note || 'FirstTapPay')}
              onFinishModule={handleFinishModule}
              onExit={handleReturnHome}
            />
          )}

          {activeModule === 'message' && (
            <WhatsAppTutorialScreen
              onBackToMainMenu={handleReturnHome}
            />
          )}

          {activeModule === 'creyo' && (
            <CreyoModule
              language={language}
              initialStepIndex={moduleStartStepIndex}
              onLogAttempt={handleLogAttempt}
              onOpenDoubt={(note) => handleOpenDoubt(note || 'Creyo')}
              onFinishModule={handleFinishModule}
              onExit={handleReturnHome}
            />
          )}
        </>
      )}

      {appState === 'RESULTS' && (
        <ResultsScreen
          language={language}
          attempts={attempts}
          placementProfile={placementProfile}
          onRestart={handleRestartJourney}
          onReturnHome={handleReturnHome}
        />
      )}

      {/* Global Interrupt Doubt Overlay */}
      {doubtContext && doubtContext.isOpen && (
        <DoubtDrawer
          language={language}
          contextNote={doubtContext.contextNote}
          onClose={handleCloseDoubt}
        />
      )}
    </div>
  );
}
