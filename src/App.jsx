import { useState, useCallback, useEffect } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import Header from './components/Header';
import StepNavigation from './components/StepNavigation';
import AISettingsModal from './components/AISettingsModal';
import ProjectListModal from './components/ProjectListModal';
import OnboardingWizard from './components/OnboardingWizard';
import LandingPage from './components/LandingPage';
import DisclaimerModal, { hasAgreedDisclaimer } from './components/DisclaimerModal';
import ProjectSettings from './steps/ProjectSettings';
import Step0Strengths from './steps/Step0Strengths';
import Step1Segmentation from './steps/Step1Segmentation';
import Step2Targeting from './steps/Step2Targeting';
import Step3Positioning from './steps/Step3Positioning';
import StepSwot from './steps/StepSwot';
import ExportPage from './steps/ExportPage';
import TutorialPage from './steps/TutorialPage';

function AppContent() {
  const [currentStep, setCurrentStep] = useState('settings');
  const [showAISettings, setShowAISettings] = useState(false);
  const [showProjectList, setShowProjectList] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLanding, setShowLanding] = useState(() => {
    // プロジェクト名が入力済なら表紙をスキップ（作業復帰時）
    return !localStorage.getItem('stp_landing_dismissed');
  });
  const [showDisclaimer, setShowDisclaimer] = useState(() => !hasAgreedDisclaimer());
  const { project, dispatch } = useProject();

  // 初回起動時にオンボーディング表示（ランディング→免責確認の後）
  useEffect(() => {
    if (!showLanding && !showDisclaimer) {
      const seen = localStorage.getItem('stp_onboarding_seen');
      if (!seen) setShowOnboarding(true);
    }
  }, [showLanding, showDisclaimer]);

  const goTo = (step) => setCurrentStep(step);

  const handleReset = useCallback(() => {
    const savedAISettings = { ...project.aiSettings };
    const savedCustomization = { ...project.customization };
    dispatch({ type: 'RESET' });
    dispatch({ type: 'UPDATE_AI_SETTINGS', payload: savedAISettings });
    if (savedCustomization) dispatch({ type: 'UPDATE_CUSTOMIZATION', payload: savedCustomization });
    setCurrentStep('settings');
  }, [project.aiSettings, project.customization, dispatch]);

  // ダークモード適用
  const theme = project.customization?.theme || 'light';
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (showLanding) {
    return (
      <LandingPage onStart={() => {
        setShowLanding(false);
        localStorage.setItem('stp_landing_dismissed', '1');
      }} />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : ''}`}>
      <Header
        onOpenAISettings={() => setShowAISettings(true)}
        onOpenTutorial={() => goTo('tutorial')}
        onReset={handleReset}
        onOpenProjectList={() => setShowProjectList(true)}
      />
      {currentStep !== 'tutorial' && (
        <StepNavigation currentStep={currentStep} onStepChange={setCurrentStep} />
      )}

      <main className="flex-1 py-6 px-4">
        {currentStep === 'settings' && (
          <ProjectSettings onNext={() => goTo('step0')} onNavigate={goTo} />
        )}
        {currentStep === 'step0' && (
          <Step0Strengths
            onNext={() => goTo('step1')}
            onSkip={() => goTo('step1')}
          />
        )}
        {currentStep === 'step1' && (
          <Step1Segmentation
            onNext={() => goTo('step2')}
            onBack={() => goTo('step0')}
          />
        )}
        {currentStep === 'step2' && (
          <Step2Targeting
            onNext={() => goTo(project.step3.skipped ? 'swot' : 'step3')}
            onBack={() => goTo('step1')}
            onSkipStep3={() => {
              dispatch({ type: 'UPDATE_STEP3', payload: { skipped: true } });
              goTo('swot');
            }}
          />
        )}
        {currentStep === 'step3' && (
          <Step3Positioning
            onNext={() => goTo('swot')}
            onBack={() => goTo('step2')}
            onSkipToExport={() => {
              dispatch({ type: 'UPDATE_STEP3', payload: { skipped: true } });
              goTo('swot');
            }}
            onUnskip={() => dispatch({ type: 'UPDATE_STEP3', payload: { skipped: false } })}
          />
        )}
        {currentStep === 'swot' && (
          <StepSwot
            onNext={() => goTo('export')}
            onBack={() => goTo(project.step3.skipped ? 'step2' : 'step3')}
          />
        )}
        {currentStep === 'export' && (
          <ExportPage onBack={() => goTo('swot')} />
        )}
        {currentStep === 'tutorial' && (
          <TutorialPage onClose={() => goTo('settings')} />
        )}
      </main>

      {showDisclaimer && <DisclaimerModal onAgree={() => setShowDisclaimer(false)} />}
      {showAISettings && <AISettingsModal onClose={() => setShowAISettings(false)} />}
      {showProjectList && (
        <ProjectListModal
          onClose={() => setShowProjectList(false)}
          onSwitchProject={() => setCurrentStep('settings')}
        />
      )}
      {showOnboarding && (
        <OnboardingWizard onClose={() => {
          setShowOnboarding(false);
          localStorage.setItem('stp_onboarding_seen', '1');
        }} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}
