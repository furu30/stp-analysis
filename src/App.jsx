import { useState, useCallback } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import Header from './components/Header';
import StepNavigation from './components/StepNavigation';
import AISettingsModal from './components/AISettingsModal';
import ProjectSettings from './steps/ProjectSettings';
import Step0Strengths from './steps/Step0Strengths';
import Step1Segmentation from './steps/Step1Segmentation';
import Step2Targeting from './steps/Step2Targeting';
import Step3Positioning from './steps/Step3Positioning';
import ExportPage from './steps/ExportPage';
import TutorialPage from './steps/TutorialPage';

function AppContent() {
  const [currentStep, setCurrentStep] = useState('settings');
  const [showAISettings, setShowAISettings] = useState(false);
  const { project, dispatch } = useProject();

  const goTo = (step) => setCurrentStep(step);

  const handleReset = useCallback(() => {
    // AI設定（APIキー等）を保持してリセット
    const savedAISettings = { ...project.aiSettings };
    dispatch({ type: 'RESET' });
    dispatch({ type: 'UPDATE_AI_SETTINGS', payload: savedAISettings });
    setCurrentStep('settings');
  }, [project.aiSettings, dispatch]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenAISettings={() => setShowAISettings(true)} onOpenTutorial={() => goTo('tutorial')} onReset={handleReset} />
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
            onNext={() => goTo(project.step3.skipped ? 'export' : 'step3')}
            onBack={() => goTo('step1')}
            onSkipStep3={() => {
              dispatch({ type: 'UPDATE_STEP3', payload: { skipped: true } });
              goTo('export');
            }}
          />
        )}
        {currentStep === 'step3' && (
          <Step3Positioning
            onNext={() => goTo('export')}
            onBack={() => goTo('step2')}
            onSkipToExport={() => {
              dispatch({ type: 'UPDATE_STEP3', payload: { skipped: true } });
              goTo('export');
            }}
            onUnskip={() => dispatch({ type: 'UPDATE_STEP3', payload: { skipped: false } })}
          />
        )}
        {currentStep === 'export' && (
          <ExportPage onBack={() => goTo(project.step3.skipped ? 'step2' : 'step3')} />
        )}
        {currentStep === 'tutorial' && (
          <TutorialPage onClose={() => goTo('settings')} />
        )}
      </main>

      {showAISettings && <AISettingsModal onClose={() => setShowAISettings(false)} />}
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
