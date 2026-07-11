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
    const crossFilled = (swot.strategyOptions || []).filter(o => (o.text || '').trim()).length;
    p.swot = Math.round(((Math.min(swotItems, 8) / 8) * 50 + (Math.min(crossFilled, 3) / 3) * 50));
  }

  p.export = 0; // always available
  return p;
}

/** 各ステップの「次にやること」を返す（完了なら空文字） */
function nextActions(project) {
  const a = {};

  const s = project.settings;
  a.settings = !s.projectName ? 'プロジェクト名を入力しましょう'
    : !s.companyName ? '自社名を入力するとマップやレポートに反映されます'
    : '';

  const flagged = project.step0.categories.flatMap(c => c.items.filter(i => i.isStrengthFlag)).length;
  const top5 = (project.step0.top5 || []).length;
  a.step0 = project.step0.skipped ? ''
    : flagged < 5 ? `強みに★を付けましょう（あと${5 - flagged}個）`
    : top5 < 5 ? '「強みを整理する」からTop強み（5〜7件）を確定しましょう'
    : '';

  const axes = project.step1.selectedAxes.length;
  const segs = Object.values(project.step1.segments).flatMap(x => x).filter(x => x.name).length;
  a.step1 = axes === 0 ? '市場を分ける切り口を2〜3個選びましょう'
    : segs < 2 ? '選んだ切り口ごとにセグメント（区分）を定義しましょう'
    : '';

  const candidates = (project.step2.candidates || []).length;
  const scoreCount = Object.keys(project.step2.scores || {}).length;
  const targetCount = Object.values(project.step2.targets || {}).filter(t => t?.label === 'main' || t?.label === 'sub').length;
  a.step2 = candidates === 0 ? 'セグメントを掛け合わせてターゲット候補を3〜5個作りましょう'
    : scoreCount === 0 ? '各候補を6つの軸で採点しましょう'
    : targetCount === 0 ? 'メイン／サブターゲットを選定しましょう'
    : '';

  if (project.step3.skipped) {
    a.step3 = '';
  } else {
    const comps = project.step3.competitors.length;
    const posScores = Object.keys(project.step3.scores).length;
    a.step3 = comps === 0 ? '競合企業を1社以上登録しましょう（難しければスキップ可）'
      : posScores === 0 ? '自社と競合のスコアを入力しましょう'
      : '';
  }

  const swot = project.swot || {};
  if (swot.skipped) {
    a.swot = '';
  } else {
    const swotItems = [...(swot.weaknesses || []), ...(swot.opportunities || []), ...(swot.threats || [])].filter(Boolean).length;
    const crossFilled = (swot.strategyOptions || []).filter(o => (o.text || '').trim()).length;
    a.swot = swotItems === 0 ? '弱み・機会・脅威を入力しましょう（AI生成も使えます）'
      : crossFilled === 0 ? 'クロスSWOTの4視点で戦略オプションを検討・入力しましょう'
      : '';
  }

  a.export = 'アクションプランをまとめてレポートを出力しましょう';
  return a;
}

export default function StepNavigation({ currentStep, onStepChange }) {
  const { project } = useProject();
  const step3Skipped = project.step3?.skipped;
  const progress = calcProgress(project);
  const actions = nextActions(project);
  const currentAction = actions[currentStep] || '';
  const currentPct = progress[currentStep] || 0;

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
                title={actions[step.id] || `${step.label}: 完了`}
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
        {/* 現在のステップの「次にやること」ガイド */}
        {currentStep !== 'export' && (
          <div className="pb-2 -mt-0.5 flex items-center gap-2 text-xs">
            {currentAction ? (
              <>
                <span className="text-amber-600 font-semibold shrink-0">👉 次にやること:</span>
                <span className="text-gray-600">{currentAction}</span>
                {currentPct > 0 && currentPct < 100 && (
                  <span className="text-gray-400">（進捗 {currentPct}%）</span>
                )}
              </>
            ) : (
              <span className="text-green-600 font-semibold">✅ このステップは完了しています。次のステップへ進みましょう</span>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
