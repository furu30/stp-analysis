import { useMemo, useState } from 'react';
import { useProject } from '../context/ProjectContext';
import AICommentBox from '../components/AICommentBox';
import HelpTip from '../components/HelpTip';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const WEIGHT_OPTIONS = [
  { value: 'high', label: '高', multiplier: 3, color: 'bg-red-100 text-red-700 ring-red-300', barColor: '#ef4444' },
  { value: 'medium', label: '中', multiplier: 2, color: 'bg-yellow-100 text-yellow-700 ring-yellow-300', barColor: '#f59e0b' },
  { value: 'low', label: '低', multiplier: 1, color: 'bg-blue-100 text-blue-700 ring-blue-300', barColor: '#3b82f6' },
];

const TARGET_LABELS = [
  { value: 'main', label: 'メイン', color: 'bg-red-500 text-white' },
  { value: 'sub', label: 'サブ', color: 'bg-amber-500 text-white' },
  { value: 'none', label: '対象外', color: 'bg-gray-300 text-gray-600' },
];

/** Step0の強み参照パネル */
function StrengthsReferencePanel({ top5, companyName }) {
  const [expanded, setExpanded] = useState(false);
  if (!top5 || top5.length === 0) return null;
  return (
    <div className="mb-4 border border-blue-200 rounded-lg bg-blue-50/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-sm font-semibold text-blue-700 cursor-pointer"
      >
        <span>💪 {companyName || '自社'}のTop強み（Step 0で選定済）— 自社適合性の参考に</span>
        <span className="text-xs">{expanded ? '▲ 閉じる' : '▼ 開く'}</span>
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-1.5">
          {top5.map((item, idx) => (
            <div key={item.id} className="flex items-start gap-2 text-xs">
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">{idx + 1}</span>
              <div>
                <span className="font-semibold text-gray-700">{item.name}</span>
                {item.categoryName && <span className="text-gray-400 ml-1">({item.categoryName})</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Step2Targeting({ onNext, onBack, onSkipStep3 }) {
  const { project, dispatch } = useProject();
  const step2 = project.step2;
  // 常にフェーズ1から表示し、全体の流れを把握してもらう
  const [phase, setPhase] = useState(1);

  // Step1のセグメントデータ
  const segmentsByAxis = useMemo(() => {
    const result = {};
    for (const axis of (project.step1.selectedAxes || [])) {
      result[axis.id] = {
        axisName: axis.name,
        segments: (project.step1.segments[axis.id] || []).filter(s => s.name),
      };
    }
    return result;
  }, [project.step1]);

  // Step1で設定した優先度の高い切り口から順に表示し、候補作成の指針にする
  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
  const selectedAxes = [...(project.step1.selectedAxes || [])].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)
  );
  const candidates = step2.candidates || [];
  const axes = step2.axes;
  const scores = step2.scores || {};
  const targets = step2.targets || {};

  // ============= Phase 1: ターゲット候補の作成 =============
  const addCandidate = () => {
    const id = `tc_${Date.now()}`;
    const newCandidates = [...candidates, { id, name: '', segments: [], memo: '' }];
    dispatch({ type: 'UPDATE_STEP2', payload: { candidates: newCandidates } });
  };

  const updateCandidate = (id, field, value) => {
    const newCandidates = candidates.map(c => c.id === id ? { ...c, [field]: value } : c);
    dispatch({ type: 'UPDATE_STEP2', payload: { candidates: newCandidates } });
  };

  const removeCandidate = (id) => {
    dispatch({ type: 'UPDATE_STEP2', payload: { candidates: candidates.filter(c => c.id !== id) } });
  };

  const toggleSegmentForCandidate = (candidateId, axisId, axisName, segName) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;
    const segs = candidate.segments || [];
    const existsIdx = segs.findIndex(s => s.axisId === axisId);
    let newSegs;
    if (existsIdx >= 0 && segs[existsIdx].segName === segName) {
      // 同じものをクリック→解除
      newSegs = segs.filter((_, i) => i !== existsIdx);
    } else if (existsIdx >= 0) {
      // 同じ軸の別セグメント→置換
      newSegs = segs.map((s, i) => i === existsIdx ? { axisId, axisName, segName } : s);
    } else {
      // 新しい軸→追加
      newSegs = [...segs, { axisId, axisName, segName }];
    }
    updateCandidate(candidateId, 'segments', newSegs);
    // 名前を自動生成
    const autoName = newSegs.map(s => s.segName).join('×');
    if (!candidate.name || candidate.name === candidates.find(c => c.id === candidateId)?.segments?.map(s => s.segName).join('×')) {
      updateCandidate(candidateId, 'name', autoName);
    }
  };

  // ============= Phase 2: スコアリング =============
  const setScore = (candidateId, axisId, value) => {
    dispatch({ type: 'UPDATE_STEP2', payload: { scores: { ...scores, [`${candidateId}_${axisId}`]: value } } });
  };

  const setWeight = (axisId, weight) => {
    const newAxes = axes.map(a => a.id === axisId ? { ...a, weight } : a);
    dispatch({ type: 'UPDATE_STEP2', payload: { axes: newAxes } });
  };

  // スコア計算
  const scoredCandidates = useMemo(() => {
    return candidates.map(c => {
      let totalWeighted = 0;
      for (const axis of axes) {
        const raw = scores[`${c.id}_${axis.id}`] || 0;
        const mult = WEIGHT_OPTIONS.find(w => w.value === axis.weight)?.multiplier || 1;
        totalWeighted += raw * mult;
      }
      return { ...c, totalWeighted, target: targets[c.id] };
    }).sort((a, b) => b.totalWeighted - a.totalWeighted);
  }, [candidates, axes, scores, targets]);

  // ============= Phase 3: ターゲット選定 =============
  const setTarget = (candidateId, label) => {
    dispatch({ type: 'UPDATE_STEP2', payload: { targets: { ...targets, [candidateId]: { ...targets[candidateId], label } } } });
  };

  const setTargetReason = (candidateId, reason) => {
    dispatch({ type: 'UPDATE_STEP2', payload: { targets: { ...targets, [candidateId]: { ...targets[candidateId], reason } } } });
  };

  const mainTargets = scoredCandidates.filter(c => c.target?.label === 'main' || c.target?.label === 'sub');
  const hasAnyCandidates = candidates.length > 0;
  const hasAnyScores = Object.keys(scores).some(k => scores[k] > 0);

  // チャートデータ
  const barData = scoredCandidates.map(c => ({
    name: c.name || '(名称未設定)',
    score: c.totalWeighted,
    target: c.target?.label || 'none',
  }));

  return (
    <div className="max-w-6xl mx-auto">
      {/* ステップヘッダー */}
      <div className="card mb-4">
        <h2 className="section-title mb-1">
          Step 2: ターゲティング
          <HelpTip text="Step1で定義したセグメントを掛け合わせてターゲット候補を作り、6R評価で最適なターゲットを選定します。" />
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          セグメントを掛け合わせて「どんな顧客に注力するか」を決めます。
        </p>
        {/* 3フェーズ表示 */}
        <div className="flex items-center gap-2">
          {[
            { num: 1, label: 'ターゲット候補作成', done: hasAnyCandidates },
            { num: 2, label: '6R評価', done: hasAnyScores },
            { num: 3, label: 'メイン/サブ選定', done: mainTargets.length > 0 },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <button
                onClick={() => { if (s.num <= phase || s.done) setPhase(s.num); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer
                  ${phase === s.num ? 'bg-primary text-white' : s.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black
                  ${phase === s.num ? 'bg-white text-primary' : s.done ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'}`}>
                  {s.done && phase !== s.num ? '✓' : s.num}
                </span>
                {s.label}
              </button>
              {i < 2 && <span className="text-gray-300">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 強み参照パネル */}
      <StrengthsReferencePanel top5={project.step0.top5} companyName={project.settings.companyName} />

      {/* ============= Phase 1: ターゲット候補作成 ============= */}
      {phase === 1 && (
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-gray-800">
                ❶ ターゲット候補を作成
                <HelpTip text="Step1のセグメントを掛け合わせて、具体的な顧客像（ターゲット候補）を3〜5個作ります。" detail="例：「航空宇宙業界」×「試作(1〜10個)」×「高精度重視」= 航空宇宙向け高精度試作ニーズ層" />
              </h3>
              <p className="text-xs text-gray-400 mt-1">Step1のセグメントをクリックして掛け合わせ、3〜5個の候補を作りましょう。</p>
            </div>
            <button onClick={addCandidate} className="btn-primary btn-sm">+ 候補を追加</button>
          </div>

          {candidates.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-sm text-gray-400 mb-3">ターゲット候補がまだありません</p>
              <button onClick={addCandidate} className="btn-primary">最初の候補を追加</button>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate, cIdx) => (
                <div key={candidate.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-black shrink-0">
                      {cIdx + 1}
                    </span>
                    <input
                      type="text"
                      className="input-field text-sm font-bold flex-1"
                      value={candidate.name}
                      onChange={(e) => updateCandidate(candidate.id, 'name', e.target.value)}
                      placeholder="ターゲット候補の名前（自動生成 or 直接入力）"
                    />
                    <button onClick={() => removeCandidate(candidate.id)} className="text-gray-300 hover:text-red-500 cursor-pointer">×</button>
                  </div>

                  {/* セグメント選択 */}
                  <div className="space-y-2">
                    {selectedAxes.map(axis => {
                      const { segments } = segmentsByAxis[axis.id] || { segments: [] };
                      if (segments.length === 0) return null;
                      const selected = (candidate.segments || []).find(s => s.axisId === axis.id);
                      return (
                        <div key={axis.id} className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400 w-24 shrink-0 text-right">
                            {axis.priority === 'high' && <span className="text-red-500" title="Step1で優先度:高に設定した切り口">▲ </span>}
                            {axis.name}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {segments.map(seg => {
                              const isSelected = selected?.segName === seg.name;
                              return (
                                <button
                                  key={seg.id}
                                  onClick={() => toggleSegmentForCandidate(candidate.id, axis.id, axis.name, seg.name)}
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all border
                                    ${isSelected
                                      ? 'bg-primary text-white border-primary shadow-sm'
                                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/50 hover:bg-blue-50'}`}
                                >
                                  {isSelected && '✓ '}{seg.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 候補の補足メモ */}
                  <div className="mt-2">
                    <input
                      type="text"
                      className="input-field text-xs py-1"
                      value={candidate.memo || ''}
                      onChange={(e) => updateCandidate(candidate.id, 'memo', e.target.value)}
                      placeholder="この候補の特徴・補足（任意）"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            <button onClick={onBack} className="btn-secondary">← Step 1へ</button>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={() => setPhase(2)}
                disabled={candidates.length === 0}
                className="btn-primary"
              >
                6R評価へ進む →
              </button>
              {candidates.length === 0 && (
                <p className="text-xs text-amber-600">候補を1つ以上作成すると進めます</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============= Phase 2: 6R評価スコアリング ============= */}
      {phase === 2 && (
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-gray-800">
                ❷ 6R評価でスコアリング
                <HelpTip text="6R（市場規模・成長性・競合・自社適合性・到達可能性・収益性）でターゲット候補を比較評価します。" />
              </h3>
              <p className="text-xs text-gray-400 mt-1">各ターゲット候補を6つの評価軸で1〜5点で採点してください。</p>
            </div>
          </div>

          {/* 重みの説明 */}
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
            <span>重み：</span>
            {WEIGHT_OPTIONS.map(w => (
              <span key={w.value} className={`step-badge ${w.color}`}>{w.label} = ×{w.multiplier}</span>
            ))}
            <span className="ml-2">← 各列のヘッダーで設定可</span>
          </div>

          {/* スコアリングテーブル */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b-2 border-gray-200 w-48">ターゲット候補</th>
                  {axes.map(axis => (
                    <th key={axis.id} className="p-2 border-b-2 border-gray-200 text-center min-w-[90px]">
                      <div className="text-xs font-bold text-gray-700">{axis.name}</div>
                      {axis.sixR && <div className="text-[9px] text-gray-400">{axis.sixR}</div>}
                      <div className="flex justify-center gap-0.5 mt-1">
                        {WEIGHT_OPTIONS.map(w => (
                          <button
                            key={w.value}
                            onClick={() => setWeight(axis.id, w.value)}
                            className={`text-[9px] px-1 py-0.5 rounded cursor-pointer transition-colors
                              ${axis.weight === w.value ? w.color : 'bg-gray-50 text-gray-300'}`}
                          >
                            {w.label}
                          </button>
                        ))}
                      </div>
                    </th>
                  ))}
                  <th className="p-2 border-b-2 border-gray-300 text-center font-bold text-gray-800">加重計</th>
                </tr>
              </thead>
              <tbody>
                {scoredCandidates.map((c, idx) => (
                  <tr key={c.id} className={idx % 2 === 0 ? 'bg-gray-50/50' : ''}>
                    <td className="p-2 border-b border-gray-100">
                      <div className="font-semibold text-gray-700 text-xs">{c.name || `候補${idx + 1}`}</div>
                      {c.segments?.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mt-0.5">
                          {c.segments.map((s, i) => (
                            <span key={i} className="text-[9px] px-1 py-0.5 bg-gray-100 text-gray-500 rounded">{s.segName}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    {axes.map(axis => (
                      <td key={axis.id} className="p-1 border-b border-gray-100 text-center">
                        <select
                          value={scores[`${c.id}_${axis.id}`] || 0}
                          onChange={(e) => setScore(c.id, axis.id, parseInt(e.target.value))}
                          className="w-14 text-center text-sm border border-gray-200 rounded py-1 cursor-pointer"
                        >
                          <option value={0}>-</option>
                          {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </td>
                    ))}
                    <td className="p-2 border-b border-gray-100 text-center font-bold text-gray-800 text-base">
                      {c.totalWeighted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 棒グラフ */}
          {hasAnyScores && (
            <div className="mt-6">
              <h4 className="text-sm font-bold text-gray-600 mb-2">総合スコア比較</h4>
              <ResponsiveContainer width="100%" height={Math.max(200, scoredCandidates.length * 40)}>
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.target === 'main' ? '#ef4444' : entry.target === 'sub' ? '#f59e0b' : '#93c5fd'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            <button onClick={() => setPhase(1)} className="btn-secondary">← 候補作成に戻る</button>
            <div className="flex flex-col items-end gap-1">
              <button onClick={() => setPhase(3)} disabled={!hasAnyScores} className="btn-primary">
                ターゲット選定へ →
              </button>
              {!hasAnyScores && (
                <p className="text-xs text-amber-600">スコアを1つ以上入力すると進めます</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============= Phase 3: メイン/サブ選定 ============= */}
      {phase === 3 && (
        <div className="card mb-4">
          <h3 className="text-base font-bold text-gray-800 mb-1">
            ❸ メインターゲット・サブターゲットを選定
            <HelpTip text="スコアと自社の戦略を踏まえ、最も注力するメインターゲットと補助的なサブターゲットを決めます。" detail="メインは1つに絞ることを推奨します。" />
          </h3>
          <p className="text-xs text-gray-400 mb-4">スコアを参考に、メインターゲット（最重要）とサブターゲットを決めてください。</p>

          <div className="space-y-3">
            {scoredCandidates.map((c, idx) => {
              const target = targets[c.id] || {};
              return (
                <div key={c.id} className={`border-2 rounded-xl p-4 transition-colors
                  ${target.label === 'main' ? 'border-red-300 bg-red-50/50' : target.label === 'sub' ? 'border-amber-300 bg-amber-50/50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-gray-300">#{idx + 1}</span>
                      <div>
                        <span className="font-bold text-gray-800">{c.name || `候補${idx + 1}`}</span>
                        <span className="text-xs text-gray-400 ml-2">加重スコア: {c.totalWeighted}点</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {TARGET_LABELS.map(tl => (
                        <button
                          key={tl.value}
                          onClick={() => setTarget(c.id, tl.value)}
                          className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all
                            ${target.label === tl.value ? tl.color : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        >
                          {tl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {c.segments?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {c.segments.map((s, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white rounded-full border border-gray-200 text-gray-500">
                          {s.axisName}: {s.segName}
                        </span>
                      ))}
                    </div>
                  )}

                  {(target.label === 'main' || target.label === 'sub') && (
                    <textarea
                      className="textarea-field text-sm mt-2"
                      rows={2}
                      value={target.reason || ''}
                      onChange={(e) => setTargetReason(c.id, e.target.value)}
                      placeholder="このターゲットを選んだ理由を記入..."
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* AIコメント */}
          <div className="mt-6">
            <AICommentBox
              commentKey="targetingRationale"
              inputData={{
                settings: project.settings,
                top5: project.step0.top5,
                candidates: scoredCandidates,
                targets,
              }}
              label="💡 ターゲティング戦略コメント（AI生成）"
            />
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={() => setPhase(2)} className="btn-secondary">← スコアリングに戻る</button>
            <div className="flex gap-3">
              <button
                onClick={onSkipStep3}
                className="btn-secondary"
              >
                ポジショニングをスキップ →
              </button>
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={onNext}
                  disabled={mainTargets.length === 0}
                  className="btn-primary"
                >
                  次へ：ポジショニング →
                </button>
                {mainTargets.length === 0 && (
                  <p className="text-xs text-amber-600">メインかサブを1つ以上選定すると進めます</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
