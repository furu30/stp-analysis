import { useProject } from '../context/ProjectContext';

const STEPS = [
  { id: 'settings', label: '設定', icon: '⚙️' },
  { id: 'step0', label: 'Step 0: 強み棚卸', icon: '💪' },
  { id: 'step1', label: 'Step 1: セグメンテーション', icon: '📊' },
  { id: 'step2', label: 'Step 2: ターゲティング', icon: '🎯' },
  { id: 'step3', label: 'Step 3: ポジショニング', icon: '📍' },
  { id: 'swot', label: 'SWOT分析', icon: '🔄' },
  { id: 'export', label: '出力', icon: '📄' },
];

/** 各ステップの進捗度を計算 */
function calcProgress(project) {
  const p = {};

  // settings
  const s = project.settings;
  const settingsFields = [s.projectName, s.companyName, s.productService].filter(Boolean).length;
  p.settings = Math.round((settingsFields / 3) * 100);

  // step0
  const flagged = project.step0.categories.flatMap(c => c.items.filter(i => i.isStrengthFlag)).length;
  const top5 = (project.step0.top5 || []).length;
  if (project.step0.skipped) {
    p.step0 = 100;
  } else {
    p.step0 = Math.round(((Math.min(flagged, 5) / 5) * 50 + (Math.min(top5, 5) / 5) * 50));
  }

  // step1
  const axes = project.step1.selectedAxes.length;
  const segs = Object.values(project.step1.segments).flatMap(s => s).filter(s => s.name).length;
  p.step1 = axes === 0 ? 0 : Math.round(((Math.min(axes, 3) / 3) * 40 + (Math.min(segs, 6) / 6) * 60));

  // step2（新candidates構造対応）
  const candidates = (project.step2.candidates || []).length;
  const scoreCount = Object.keys(project.step2.scores || {}).length;
  const targetCount = Object.values(project.step2.targets || {}).filter(t => t?.label === 'main' || t?.label === 'sub').length;
  const expectedScores = candidates * (project.step2.axes || []).length;
  const candidatePct = candidates > 0 ? 30 : 0;
  const scorePct = expectedScores === 0 ? 0 : Math.min(scoreCount / expectedScores, 1) * 40;
  const targetPct = candidates === 0 ? 0 : Math.min(targetCount / candidates, 1) * 30;
  p.step2 = Math.round(candidatePct + scorePct + targetPct);

  // step3
  if (project.step3.skipped) {
    p.step3 = -1; // skipped
  } else {
    const comps = project.step3.competitors.length;
    const posAxes = project.step3.axes.length;
    const posScores = Object.keys(project.step3.scores).length;
    const expectedPosScores = (comps + 1) * posAxes; // +1 for self
    const posPct = expectedPosScores === 0 ? 0 : Math.min(posScores / expectedPosScores, 1);
    p.step3 = Math.round(((comps > 0 ? 30 : 0) + posPct * 70));
  }

  // swot
  const swot = project.swot || {};
  if (swot.skipped) {
    p.swot = -1;
  } else {
    const swotItems = [...(swot.strengths || []), ...(swot.weaknesses || []), ...(swot.opportunities || []), ...(swot.threats || [])].filter(Boolean).length;
    const crossFilled = Object.values(swot.crossStrategies || {}).filter(Boolean).length;
    p.swot = Math.round(((Math.min(swotItems, 8) / 8) * 50 + (crossFilled / 4) * 50));
  }

  p.export = 0; // always available
  return p;
}

export default function StepNavigation({ currentStep, onStepChange }) {
  const { project } = useProject();
  const step3Skipped = project.step3?.skipped;
  const progress = calcProgress(project);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.id;
            const stepIdx = STEPS.findIndex(s => s.id === currentStep);
            const isPast = idx < stepIdx;
            const isSkipped = step.id === 'step3' && step3Skipped && !isActive;
            const pct = progress[step.id] || 0;
            const isDone = pct >= 80 || (step.id === 'export');
            return (
              <button
                key={step.id}
                onClick={() => onStepChange(step.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer
                  ${isActive ? 'bg-primary text-white shadow-sm' : isPast && isDone ? 'text-green-700 bg-green-50' : isPast ? 'text-primary bg-primary-light/50' : 'text-gray-500 hover:bg-gray-100'}
                  ${isSkipped ? 'opacity-50' : ''}`}
              >
                <span>{step.icon}</span>
                <span className={isSkipped ? 'line-through' : ''}>{step.label}</span>
                {/* 進捗インジケーター */}
                {step.id !== 'export' && !isActive && !isSkipped && pct > 0 && pct < 80 && (
                  <span className="text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">
                    {pct}%
                  </span>
                )}
                {step.id !== 'export' && !isActive && isDone && !isSkipped && pct >= 80 && (
                  <span className="text-[9px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">✓</span>
                )}
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
