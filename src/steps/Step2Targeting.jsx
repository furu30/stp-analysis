import { useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import AICommentBox from '../components/AICommentBox';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis, Legend, LabelList,
} from 'recharts';

/**
 * バブルチャートのラベル: 番号表示 + 凡例テーブル方式
 * - 各バブルの中心付近に太い番号を表示
 * - 白ハロー(paintOrder)で背景を問わず高視認性
 */
function renderBubbleNumberLabel(props) {
  const { x, y, value } = props;
  return (
    <text
      x={x}
      y={y + 5}
      textAnchor="middle"
      fontSize={11}
      fontWeight={900}
      fill="#1e293b"
      stroke="#fff"
      strokeWidth={3}
      paintOrder="stroke"
    >
      {value}
    </text>
  );
}

/**
 * 同じ座標のデータポイントをずらして重なりを防ぐ
 * @param {Array} data - [{x, y, ...}]
 * @param {number} offset - ずらし量
 * @returns {Array} ずらし済みデータ
 */
function jitterOverlaps(data, offset = 0.15) {
  const seen = new Map();
  return data.map(d => {
    const key = `${d.x}_${d.y}`;
    const count = seen.get(key) || 0;
    seen.set(key, count + 1);
    if (count === 0) return d;
    // 同座標の2番目以降を放射状にずらす
    const angles = [0, Math.PI, Math.PI / 2, -Math.PI / 2, Math.PI / 4, -Math.PI / 4];
    const angle = angles[(count - 1) % angles.length];
    const r = offset * Math.ceil(count / angles.length);
    return { ...d, x: d.x + r * Math.cos(angle), y: d.y + r * Math.sin(angle) };
  });
}

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

function StepBadge({ num, label, done, active }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all
      ${done ? 'bg-green-100 text-green-700' : active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black
        ${done ? 'bg-green-500 text-white' : active ? 'bg-white text-primary' : 'bg-gray-300 text-white'}`}>
        {done ? '✓' : num}
      </span>
      {label}
    </div>
  );
}

/** セグメントタグ掛け合わせで顧客像名を作れるカード */
function PersonaCard({ seg, targets, setTargetField, allSegments, selectedAxes, segmentsByAxis }) {
  const persona = targets[seg.id]?.persona || '';

  // 切り口ごとにセグメントをグループ化
  const axisGroups = useMemo(() => {
    return selectedAxes.map(axis => ({
      axisName: axis.name,
      axisId: axis.id,
      segments: (segmentsByAxis[axis.id] || []).filter(s => s.name),
    })).filter(g => g.segments.length > 0);
  }, [selectedAxes, segmentsByAxis]);

  // タグをクリックして顧客像名に追加/削除
  const toggleTag = (segName) => {
    const parts = persona ? persona.split('×').map(s => s.trim()).filter(Boolean) : [];
    const idx = parts.indexOf(segName);
    let newParts;
    if (idx >= 0) {
      newParts = parts.filter((_, i) => i !== idx);
    } else {
      newParts = [...parts, segName];
    }
    setTargetField(seg.id, 'persona', newParts.join('×'));
  };

  const personaParts = persona ? persona.split('×').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className={`border rounded-lg p-3 mb-3 ${seg.target?.label === 'main' ? 'border-red-200 bg-red-50/30' : 'border-amber-200 bg-amber-50/30'}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`step-badge ${seg.target?.label === 'main' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
          {seg.target?.label === 'main' ? 'メイン' : 'サブ'}
        </span>
        <span className="font-semibold text-sm">{seg.name}</span>
        <span className="text-xs text-gray-400 ml-auto">加重スコア: {seg.totalWeighted}点</span>
      </div>

      {/* 顧客像名ビルダー */}
      <div className="mb-3">
        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
          顧客像名 <span className="font-normal text-gray-400">— タグをクリックして掛け合わせ、または直接入力</span>
        </label>

        {/* タグ選択エリア */}
        <div className="p-2.5 bg-white border border-gray-200 rounded-lg mb-2 space-y-2">
          {axisGroups.map(group => (
            <div key={group.axisId} className="flex items-start gap-2">
              <span className="text-[10px] font-bold text-gray-400 w-16 shrink-0 pt-1 text-right">{group.axisName}</span>
              <div className="flex flex-wrap gap-1">
                {group.segments.map(s => {
                  const isSelected = personaParts.includes(s.name);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleTag(s.name)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-all border
                        ${isSelected
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/50 hover:bg-blue-50'}`}
                    >
                      {isSelected && '✓ '}{s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 結合結果プレビュー＋直接編集 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 shrink-0">結果：</span>
          <input
            type="text"
            className="input-field text-sm flex-1"
            value={persona}
            onChange={(e) => setTargetField(seg.id, 'persona', e.target.value)}
            placeholder="タグをクリックするか、直接入力してください"
          />
          {persona && (
            <button
              onClick={() => setTargetField(seg.id, 'persona', '')}
              className="text-gray-400 hover:text-danger text-xs cursor-pointer shrink-0"
            >✕ クリア</button>
          )}
        </div>
      </div>

      {/* 選定理由 */}
      <div>
        <label className="text-xs font-semibold text-gray-500">選定理由</label>
        <textarea
          className="textarea-field text-sm mt-1"
          rows={2}
          value={targets[seg.id]?.reason || ''}
          onChange={(e) => setTargetField(seg.id, 'reason', e.target.value)}
          placeholder="このセグメントをターゲットに選んだ理由を記入..."
        />
      </div>
    </div>
  );
}

export default function Step2Targeting({ onNext, onBack, onSkipStep3 }) {
  const { project, dispatch } = useProject();
  const step2 = project.step2;

  // Get all defined segments from step1
  const allSegments = useMemo(() => {
    const segs = [];
    for (const [axisId, segList] of Object.entries(project.step1.segments || {})) {
      const axis = project.step1.selectedAxes.find(a => a.id === axisId);
      for (const seg of segList) {
        if (seg.name) {
          segs.push({ ...seg, axisName: axis?.name || '', axisId });
        }
      }
    }
    return segs;
  }, [project.step1]);

  const axes = step2.axes;
  const scores = step2.scores;
  const targets = step2.targets;

  const setScore = (segId, axisId, value) => {
    const newScores = { ...scores, [`${segId}_${axisId}`]: value };
    dispatch({ type: 'UPDATE_STEP2', payload: { scores: newScores } });
  };

  const setWeight = (axisId, weight) => {
    const newAxes = axes.map(a => a.id === axisId ? { ...a, weight } : a);
    dispatch({ type: 'UPDATE_STEP2', payload: { axes: newAxes } });
  };

  const setTarget = (segId, value) => {
    const newTargets = { ...targets, [segId]: { ...targets[segId], label: value } };
    dispatch({ type: 'UPDATE_STEP2', payload: { targets: newTargets } });
  };

  const setTargetField = (segId, field, value) => {
    const newTargets = { ...targets, [segId]: { ...targets[segId], [field]: value } };
    dispatch({ type: 'UPDATE_STEP2', payload: { targets: newTargets } });
  };

  const addAxis = () => {
    const id = `ta_custom_${Date.now()}`;
    const newAxes = [...axes, { id, name: '', description: '', weight: 'low', isCustom: true }];
    dispatch({ type: 'UPDATE_STEP2', payload: { axes: newAxes } });
  };

  const removeAxis = (axisId) => {
    dispatch({ type: 'UPDATE_STEP2', payload: { axes: axes.filter(a => a.id !== axisId) } });
  };

  const updateAxisName = (axisId, name) => {
    dispatch({ type: 'UPDATE_STEP2', payload: { axes: axes.map(a => a.id === axisId ? { ...a, name } : a) } });
  };

  // Calculate weighted scores
  const scoredSegments = useMemo(() => {
    return allSegments.map(seg => {
      let totalWeighted = 0;
      const axisScores = {};
      for (const axis of axes) {
        const raw = scores[`${seg.id}_${axis.id}`] || 0;
        const mult = WEIGHT_OPTIONS.find(w => w.value === axis.weight)?.multiplier || 1;
        axisScores[axis.id] = { raw, weighted: raw * mult };
        totalWeighted += raw * mult;
      }
      return { ...seg, axisScores, totalWeighted, target: targets[seg.id] };
    }).sort((a, b) => b.totalWeighted - a.totalWeighted);
  }, [allSegments, axes, scores, targets]);

  // Progress checks
  const hasAnyScore = Object.keys(scores).some(k => scores[k] > 0);
  const hasAnyTarget = Object.values(targets).some(t => t?.label === 'main' || t?.label === 'sub');
  const mainTargets = scoredSegments.filter(s => s.target?.label === 'main' || s.target?.label === 'sub');

  // Chart data
  const barData = scoredSegments.map(s => ({
    name: s.name, score: s.totalWeighted, target: s.target?.label || 'none'
  }));

  // 凡例用: スコア順の番号付きデータ（元の順序を保持）
  const bubbleLegend = useMemo(() => {
    return scoredSegments.map((s, i) => ({
      name: s.name,
      displayNum: i + 1,
      target: s.target?.label || 'none',
    }));
  }, [scoredSegments]);

  const bubbleData = useMemo(() => {
    // スコア順で番号を振る
    const raw = scoredSegments.map((s, i) => ({
      name: s.name,
      displayNum: i + 1,
      x: s.axisScores['ta1']?.raw || 0,
      y: s.axisScores['ta4']?.raw || 0,
      z: (s.axisScores['ta2']?.raw || 1) * 100,
      target: s.target?.label || 'none',
    }));
    // 重要度順にソート: none(グレー)→sub(オレンジ)→main(赤)
    // SVGは後に描画される要素が上になるので、重要度が高いものを後に配置
    const priority = { none: 0, sub: 1, main: 2 };
    const sorted = [...raw].sort((a, b) => (priority[a.target] || 0) - (priority[b.target] || 0));
    return jitterOverlaps(sorted);
  }, [scoredSegments]);

  const getBarColor = (target) => {
    if (target === 'main') return '#ef4444';
    if (target === 'sub') return '#f59e0b';
    return '#94a3b8';
  };

  const top5 = project.step0.top5 || [];
  const showTop5Panel = top5.length > 0 && !project.step0.skipped;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-4">
        {/* Main content */}
        <div className={`flex-1 ${showTop5Panel ? 'max-w-[calc(100%-280px)]' : ''}`}>

          {/* Page title */}
          <div className="card mb-4">
            <h2 className="section-title mb-1">Step 2: ターゲティング</h2>
            <p className="text-sm text-gray-500 mb-4">
              Step 1で定義したセグメントを評価し、注力すべきターゲットを選定します。
            </p>

            {/* Progress steps */}
            <div className="flex items-center gap-2">
              <StepBadge num="1" label="スコアリング" done={hasAnyScore} active={!hasAnyScore} />
              <span className="text-gray-300">→</span>
              <StepBadge num="2" label="ターゲット選定" done={hasAnyTarget} active={hasAnyScore && !hasAnyTarget} />
              <span className="text-gray-300">→</span>
              <StepBadge num="3" label="詳細記入" done={mainTargets.some(s => targets[s.id]?.persona || targets[s.id]?.reason)} active={hasAnyTarget} />
            </div>
          </div>

          {/* ========== STEP ❶ SCORING ========== */}
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-black shrink-0">1</span>
                <div>
                  <h3 className="text-base font-bold text-gray-800">スコアリング</h3>
                  <p className="text-xs text-gray-500">各セグメントを6つの評価軸で1〜5点で採点してください</p>
                </div>
              </div>
              <button onClick={addAxis} className="btn-secondary btn-sm">＋ 評価軸を追加</button>
            </div>

            {/* Weight guide */}
            <div className="mb-3 p-2.5 bg-blue-50 rounded-lg flex items-center gap-4 text-xs text-blue-800">
              <span className="font-bold shrink-0">💡 重みの意味：</span>
              <span><span className="inline-block px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold">高</span> スコア×3倍</span>
              <span><span className="inline-block px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-bold">中</span> スコア×2倍</span>
              <span><span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">低</span> スコア×1倍</span>
              <span className="text-blue-500">← 各列のヘッダーで設定できます</span>
            </div>

            {allSegments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                セグメントが定義されていません。Step 1でセグメントを定義してください。
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-2 sticky left-0 bg-white z-10 min-w-[120px]">セグメント</th>
                      {axes.map(axis => (
                        <th key={axis.id} className="text-center py-1 px-2 min-w-[80px]">
                          <div className="space-y-1">
                            {axis.isCustom ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  className="input-field text-xs py-0.5 text-center"
                                  value={axis.name}
                                  onChange={(e) => updateAxisName(axis.id, e.target.value)}
                                  placeholder="軸名"
                                />
                                <button onClick={() => removeAxis(axis.id)} className="text-gray-400 hover:text-danger text-xs cursor-pointer">✕</button>
                              </div>
                            ) : (
                              <span className="text-xs font-bold">{axis.name}</span>
                            )}
                            <div className="flex gap-0.5 justify-center">
                              {WEIGHT_OPTIONS.map(w => (
                                <button
                                  key={w.value}
                                  onClick={() => setWeight(axis.id, w.value)}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all
                                    ${axis.weight === w.value ? w.color + ' ring-1 ring-current' : 'bg-gray-50 text-gray-300'}`}
                                >
                                  {w.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </th>
                      ))}
                      <th className="text-center py-2 px-2 min-w-[70px] bg-gray-50">加重合計</th>
                      <th className="text-center py-2 px-2 min-w-[80px]">
                        <span className="text-xs font-bold">区分</span>
                        <div className="text-[9px] text-gray-400 font-normal">②で設定</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoredSegments.map((seg, idx) => (
                      <tr key={seg.id} className={`border-b border-gray-100 ${seg.target?.label === 'main' ? 'bg-red-50' : seg.target?.label === 'sub' ? 'bg-amber-50' : ''}`}>
                        <td className="py-1.5 px-2 sticky left-0 bg-inherit z-10">
                          <div className="font-medium text-xs">{seg.name}</div>
                          <div className="text-[10px] text-gray-400">{seg.axisName}</div>
                        </td>
                        {axes.map(axis => (
                          <td key={axis.id} className="text-center py-1.5 px-1">
                            <select
                              value={scores[`${seg.id}_${axis.id}`] || 0}
                              onChange={(e) => setScore(seg.id, axis.id, Number(e.target.value))}
                              className="w-14 px-1 py-0.5 border border-gray-200 rounded text-xs text-center cursor-pointer"
                            >
                              <option value={0}>-</option>
                              {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </td>
                        ))}
                        <td className="text-center py-1.5 px-2 bg-gray-50 font-bold text-sm">{seg.totalWeighted}</td>
                        <td className="text-center py-1.5 px-2">
                          <div className="flex gap-0.5 justify-center">
                            {TARGET_LABELS.map(t => (
                              <button
                                key={t.value}
                                onClick={() => setTarget(seg.id, t.value)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all
                                  ${seg.target?.label === t.value ? t.color : 'bg-gray-100 text-gray-400'}`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ========== STEP ❷ TARGET SELECTION (shows after scoring) ========== */}
          {hasAnyScore && (
            <div className={`card mb-4 ${!hasAnyTarget ? 'ring-2 ring-primary/30 ring-offset-2' : ''}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black shrink-0
                  ${hasAnyTarget ? 'bg-green-500 text-white' : 'bg-primary text-white'}`}>
                  {hasAnyTarget ? '✓' : '2'}
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-800">ターゲット選定</h3>
                  <p className="text-xs text-gray-500">
                    スコアとチャートを参考に、表の右端「区分」列で
                    <span className="inline-block mx-1 px-1.5 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold">メイン</span>
                    <span className="inline-block mx-1 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold">サブ</span>
                    を設定してください
                  </p>
                </div>
              </div>

              {/* Charts */}
              {allSegments.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">総合スコア棒グラフ</h4>
                    <ResponsiveContainer width="100%" height={Math.max(250, allSegments.length * 32)}>
                      <BarChart data={barData} layout="vertical" margin={{ left: 100, right: 20, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                        <Tooltip />
                        <Bar dataKey="score" name="加重合計スコア" radius={[0, 4, 4, 0]}>
                          {barData.map((entry, idx) => (
                            <Cell key={idx} fill={getBarColor(entry.target)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-4 mt-2 text-[10px]">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block"></span> メイン</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block"></span> サブ</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-400 inline-block"></span> 未選択/対象外</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">バブルチャート（市場規模 × 自社適合性 × 成長性）</h4>
                    <div className="text-[10px] text-gray-500 mb-1 grid grid-cols-2 gap-1">
                      <div className="p-1 bg-green-50 rounded">右上：最優先ターゲット</div>
                      <div className="p-1 bg-yellow-50 rounded">右下：差別化戦略が必要</div>
                      <div className="p-1 bg-blue-50 rounded">左上：ニッチ戦略に有効</div>
                      <div className="p-1 bg-gray-50 rounded">左下：優先度を下げる候補</div>
                    </div>
                    <ResponsiveContainer width="100%" height={340}>
                      <ScatterChart margin={{ top: 30, right: 20, bottom: 30, left: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="x" name="市場規模" domain={[0, 5.5]} ticks={[0, 1, 2, 3, 4, 5]} label={{ value: '市場規模', position: 'bottom', offset: 15, fontSize: 11 }} />
                        <YAxis type="number" dataKey="y" name="自社適合性" domain={[0, 5.5]} ticks={[0, 1, 2, 3, 4, 5]} label={{ value: '自社適合性', angle: -90, position: 'left', offset: 15, fontSize: 11 }} />
                        <ZAxis type="number" dataKey="z" range={[100, 800]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                          if (!payload?.[0]) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="bg-white shadow-lg rounded p-2 text-xs border">
                              <div className="font-bold">{d.name}</div>
                              <div>市場規模: {d.x} / 自社適合性: {d.y}</div>
                              <div>成長性: {d.z / 100}</div>
                            </div>
                          );
                        }} />
                        <Scatter data={bubbleData} fill="#3b82f6">
                          {bubbleData.map((entry, idx) => (
                            <Cell key={idx} fill={getBarColor(entry.target)} fillOpacity={0.85} stroke={getBarColor(entry.target)} strokeWidth={1.5} />
                          ))}
                          <LabelList dataKey="displayNum" content={renderBubbleNumberLabel} />
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                    {/* 番号→名前の凡例テーブル（スコア順） */}
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]">
                      {bubbleLegend.map((d) => (
                        <span key={d.displayNum} className="flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                                style={{ backgroundColor: getBarColor(d.target) }}>
                            {d.displayNum}
                          </span>
                          <span className="text-gray-700">{d.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!hasAnyTarget && allSegments.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
                  <span className="text-lg">👆</span>
                  上の表に戻り、右端の「区分」列で <strong>メイン</strong> または <strong>サブ</strong> をクリックしてターゲットを選んでください。
                </div>
              )}
            </div>
          )}

          {/* ========== STEP ❸ TARGET DETAIL (shows after target selection) ========== */}
          {hasAnyTarget && (
            <div className={`card mb-4 ${!mainTargets.some(s => targets[s.id]?.reason) ? 'ring-2 ring-primary/30 ring-offset-2' : ''}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black shrink-0
                  ${mainTargets.some(s => targets[s.id]?.reason) ? 'bg-green-500 text-white' : 'bg-primary text-white'}`}>
                  {mainTargets.some(s => targets[s.id]?.reason) ? '✓' : '3'}
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-800">ターゲット詳細を記入</h3>
                  <p className="text-xs text-gray-500">選定したターゲットに「顧客像名」と「選定理由」を入力してください（エクスポートやAIコメントに反映されます）</p>
                </div>
              </div>

              {mainTargets.map(seg => (
                <PersonaCard
                  key={seg.id}
                  seg={seg}
                  targets={targets}
                  setTargetField={setTargetField}
                  allSegments={allSegments}
                  selectedAxes={project.step1.selectedAxes}
                  segmentsByAxis={project.step1.segments}
                />
              ))}
            </div>
          )}

          <AICommentBox
            commentKey="targetingRationale"
            inputData={{ segments: scoredSegments, top5: project.step0.top5, axes }}
            label="💡 ターゲティング選定根拠（AIコメント）"
          />

          <div className="mt-6 flex justify-between items-center">
            <button onClick={onBack} className="btn-secondary">← 前のステップ</button>
            <div className="flex items-center gap-3">
              <button onClick={onSkipStep3} className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2 cursor-pointer">
                Step 3をスキップして出力へ →
              </button>
              <button onClick={onNext} className="btn-primary">次へ：ポジショニング（Step 3）→</button>
            </div>
          </div>
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              💡 <strong>下請け企業などで明確な競合が設定しにくい場合</strong>は、Step 3（ポジショニング）をスキップして出力に進めます。後からいつでもStep 3に戻って入力できます。
            </p>
          </div>
        </div>

        {/* Top5 side panel */}
        {showTop5Panel && (
          <div className="w-[260px] shrink-0">
            <div className="card sticky top-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">💪 Top5 強み（参照）</h3>
              <div className="space-y-2">
                {top5.map((item, idx) => (
                  <div key={item.id} className="p-2 bg-blue-50 rounded text-xs">
                    <div className="font-bold text-primary">#{idx + 1} {item.name}</div>
                    <div className="text-gray-600 mt-0.5">{item.strength?.slice(0, 60)}{item.strength?.length > 60 ? '...' : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
