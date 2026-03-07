import { useProject } from '../context/ProjectContext';

const STEPS = [
  { id: 'settings', label: '設定', icon: '⚙️' },
  { id: 'step0', label: 'Step 0: 強み棚卸', icon: '💪' },
  { id: 'step1', label: 'Step 1: セグメンテーション', icon: '📊' },
  { id: 'step2', label: 'Step 2: ターゲティング', icon: '🎯' },
  { id: 'step3', label: 'Step 3: ポジショニング', icon: '📍' },
  { id: 'export', label: '出力', icon: '📄' },
];

export default function StepNavigation({ currentStep, onStepChange }) {
  const { project } = useProject();
  const step3Skipped = project.step3?.skipped;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.id;
            const stepIdx = STEPS.findIndex(s => s.id === currentStep);
            const isPast = idx < stepIdx;
            const isSkipped = step.id === 'step3' && step3Skipped && !isActive;
            return (
              <button
                key={step.id}
                onClick={() => onStepChange(step.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer
                  ${isActive ? 'bg-primary text-white shadow-sm' : isPast ? 'text-primary bg-primary-light/50' : 'text-gray-500 hover:bg-gray-100'}
                  ${isSkipped ? 'opacity-50' : ''}`}
              >
                <span>{step.icon}</span>
                <span className={isSkipped ? 'line-through' : ''}>{step.label}</span>
                {isSkipped && (
                  <span className="text-[10px] bg-gray-300 text-gray-600 px-1.5 py-0.5 rounded-full">スキップ</span>
                )}
                {idx < STEPS.length - 1 && (
                  <span className={`ml-2 ${isActive || isPast ? 'text-primary' : 'text-gray-300'}`}>→</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
