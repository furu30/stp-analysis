import { useState, useMemo, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { DEFAULT_POSITIONING_AXES_BTOB, DEFAULT_POSITIONING_AXES_BTOC } from '../data/defaultData';
import AICommentBox from '../components/AICommentBox';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell, LabelList,
} from 'recharts';

const COMPANY_COLORS = ['#2563eb', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

/**
 * ポジショニングマップ: 番号表示 + 凡例テーブル方式
 * - 太い番号 + 白ハローで高視認性
 * - 自社は★マーク
 */
function renderPosNumberLabel(props) {
  const { x, y, index, payload } = props;
  const isSelf = payload?.isSelf;
  return (
    <text
      x={x}
      y={y + 5}
      textAnchor="middle"
      fontSize={isSelf ? 13 : 11}
      fontWeight={900}
      fill={isSelf ? '#1e3a8a' : '#1e293b'}
      stroke="#fff"
      strokeWidth={3}
      paintOrder="stroke"
    >
      {isSelf ? '★' : index + 1}
    </text>
  );
}

export default function Step3Positioning({ onNext, onBack, onSkipToExport, onUnskip }) {
  const { project, dispatch } = useProject();
  const step3 = project.step3;
  const [activeMapTab, setActiveMapTab] = useState('map1');

  // ブレッドクラムから遷移してきた場合、skippedフラグを自動解除
  useEffect(() => {
    if (step3.skipped) {
      onUnskip?.();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const marketType = project.settings.marketType;
  const defaultAxes = marketType === 'btob' ? DEFAULT_POSITIONING_AXES_BTOB : DEFAULT_POSITIONING_AXES_BTOC;
  const top5 = project.step0.top5 || [];
  const showTop5 = top5.length > 0 && !project.step0.skipped;

  // Target persona display（新candidates構造 + 旧構造に対応）
  const mainTargets = useMemo(() => {
    const candidates = project.step2.candidates || [];
    const targets = project.step2.targets || {};
    if (candidates.length > 0) {
      // 新構造: candidates からターゲットを取得
      return candidates
        .filter(c => targets[c.id]?.label === 'main' || targets[c.id]?.label === 'sub')
        .map(c => ({ id: c.id, label: targets[c.id].label, persona: c.name, reason: targets[c.id].reason, segments: c.segments }));
    }
    // 旧構造: 互換
    return Object.entries(targets)
      .filter(([, v]) => v.label === 'main' || v.label === 'sub')
      .map(([id, v]) => ({ id, ...v }));
  }, [project.step2]);

  const allSegments = useMemo(() => {
    const segs = [];
    for (const [, segList] of Object.entries(project.step1.segments || {})) {
      for (const seg of segList) { if (seg.name) segs.push(seg); }
    }
    return segs;
  }, [project.step1]);

  // 軸が未設定なら初期軸を投入（レンダー中のdispatchは白画面の原因になるためuseEffectで行う）
  useEffect(() => {
    if (step3.axes.length === 0) {
      dispatch({ type: 'UPDATE_STEP3', payload: { axes: defaultAxes.map((name, idx) => ({ id: `pa_${idx}`, name })) } });
    }
  }, [step3.axes.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (step3.axes.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card text-center py-10 text-sm text-gray-400">評価軸を準備しています...</div>
      </div>
    );
  }

  const companyName = project.settings.companyName || '自社';

  const addCompetitor = () => {
    if (step3.competitors.length >= 9) return; // max 10 including self
    const id = `comp_${Date.now()}`;
    dispatch({ type: 'UPDATE_STEP3', payload: {
      competitors: [...step3.competitors, { id, name: '', scale: '中堅' }]
    }});
  };

  const updateCompetitor = (id, field, value) => {
    dispatch({ type: 'UPDATE_STEP3', payload: {
      competitors: step3.competitors.map(c => c.id === id ? { ...c, [field]: value } : c)
    }});
  };

  const removeCompetitor = (id) => {
    dispatch({ type: 'UPDATE_STEP3', payload: {
      competitors: step3.competitors.filter(c => c.id !== id)
    }});
  };

  const addAxis = (name = '') => {
    const id = `pa_${Date.now()}`;
    dispatch({ type: 'UPDATE_STEP3', payload: { axes: [...step3.axes, { id, name }] } });
  };

  const removeAxis = (id) => {
    dispatch({ type: 'UPDATE_STEP3', payload: { axes: step3.axes.filter(a => a.id !== id) } });
  };

  const updateAxisName = (id, name) => {
    dispatch({ type: 'UPDATE_STEP3', payload: {
      axes: step3.axes.map(a => a.id === id ? { ...a, name } : a)
    }});
  };

  const setScore = (companyId, axisId, value) => {
    dispatch({ type: 'UPDATE_STEP3', payload: {
      scores: { ...step3.scores, [`${companyId}_${axisId}`]: value }
    }});
  };

  const updateMap = (mapId, field, value) => {
    dispatch({ type: 'UPDATE_STEP3', payload: {
      maps: step3.maps.map(m => m.id === mapId ? { ...m, [field]: value } : m)
    }});
  };

  const updateQuadrantLabel = (mapId, quadrant, value) => {
    dispatch({ type: 'UPDATE_STEP3', payload: {
      quadrantLabels: { ...step3.quadrantLabels, [`${mapId}_${quadrant}`]: value }
    }});
  };

  // All companies (self + competitors)
  const allCompanies = [
    { id: 'self', name: companyName, scale: '', isSelf: true },
    ...step3.competitors,
  ];

  // Strategy canvas data
  const canvasData = step3.axes.map(axis => {
    const point = { name: axis.name };
    allCompanies.forEach(comp => {
      point[comp.id] = step3.scores[`${comp.id}_${axis.id}`] || 0;
    });
    return point;
  });

  // Active map
  const activeMap = step3.maps.find(m => m.id === activeMapTab) || step3.maps[0];

  // Position map data
  const posMapData = activeMap ? allCompanies.map((comp, idx) => ({
    name: comp.name,
    x: step3.scores[`${comp.id}_${activeMap.xAxis}`] || 0,
    y: step3.scores[`${comp.id}_${activeMap.yAxis}`] || 0,
    z: comp.scale === '大手' ? 600 : comp.scale === '中堅' ? 400 : 200,
    isSelf: comp.isSelf,
    color: COMPANY_COLORS[idx % COMPANY_COLORS.length],
  })) : [];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Skip banner */}
      <div className="card mb-4 bg-amber-50 border-amber-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <span className="text-lg">💡</span>
            <span>下請け企業などで競合設定が難しい場合は、このステップをスキップできます。</span>
          </div>
          <button
            onClick={onSkipToExport}
            className="btn-secondary btn-sm shrink-0"
          >
            スキップして出力へ →
          </button>
        </div>
      </div>

      {/* ターゲット顧客＆KBF（購買決定要因） */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-700">🎯 ターゲット顧客と購買決定要因（KBF）</h3>
        </div>

        {mainTargets.length > 0 ? (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Step 2で選定したターゲット顧客</p>
            <div className="flex flex-wrap gap-2">
              {mainTargets.map(t => {
                const seg = allSegments.find(s => s.id === t.id);
                return (
                  <div key={t.id} className={`px-3 py-2 rounded-lg border-2 ${t.label === 'main' ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${t.label === 'main' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                        {t.label === 'main' ? 'メイン' : 'サブ'}
                      </span>
                      <span className="text-sm font-bold text-gray-800">{t.persona || t.name || t.id}</span>
                    </div>
                    {t.segments?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {t.segments.map((s, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 bg-white rounded-full border border-gray-200 text-gray-500">{s.axisName}: {s.segName}</span>
                        ))}
                      </div>
                    )}
                    {t.reason && <p className="text-[10px] text-gray-500 mt-1 ml-1">{t.reason}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-400">
            Step 2でターゲット顧客が選定されていません。先にStep 2を完了してください。
          </div>
        )}

        {/* KBF: 購買決定要因 */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-bold text-gray-700">
                📋 購買決定要因（KBF）
              </p>
              <p className="text-xs text-gray-400">
                ターゲット顧客が商品・サービスを選ぶ際に重視するポイントを洗い出してください。これがポジショニング軸の候補になります。
              </p>
            </div>
            <div className="flex gap-2">
              {(step3.kbf || []).length > 0 && (
                <button
                  onClick={() => {
                    const kbfNames = (step3.kbf || []).filter(k => k.name).map((k, idx) => ({ id: `pa_${idx}`, name: k.name }));
                    if (kbfNames.length > 0) {
                      dispatch({ type: 'UPDATE_STEP3', payload: { axes: kbfNames } });
                    }
                  }}
                  className="btn-accent btn-sm"
                >
                  KBFをポジショニング軸に反映 →
                </button>
              )}
              <button
                onClick={() => {
                  const id = `kbf_${Date.now()}`;
                  dispatch({ type: 'UPDATE_STEP3', payload: { kbf: [...(step3.kbf || []), { id, name: '', importance: 'high' }] } });
                }}
                className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer"
              >
                + 追加
              </button>
            </div>
          </div>

          {(!step3.kbf || step3.kbf.length === 0) ? (
            <div className="grid grid-cols-2 gap-2">
              {/* KBFの入力例チップ */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] font-bold text-gray-500 mb-1.5">入力例（クリックで追加）</p>
                <div className="flex flex-wrap gap-1">
                  {(marketType === 'btob'
                    ? ['品質・精度', '価格', '納期', '技術サポート', 'カスタム対応', '実績・信頼性', '小ロット対応', '提案力']
                    : ['品質', '価格', '立地・アクセス', 'デザイン', 'ブランド', '接客・サービス', '品揃え', '口コミ評価']
                  ).map(name => (
                    <button
                      key={name}
                      onClick={() => {
                        const id = `kbf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                        dispatch({ type: 'UPDATE_STEP3', payload: { kbf: [...(step3.kbf || []), { id, name, importance: 'high' }] } });
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors"
                    >
                      + {name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-[10px] font-bold text-blue-600 mb-1">💡 KBFとは？</p>
                <p className="text-[10px] text-blue-500 leading-relaxed">
                  Key Buying Factor（購買決定要因）＝ ターゲット顧客が「どの会社（商品）を選ぶか」を決める際に重視する要素。
                  ここで整理したKBFがそのままポジショニングマップの軸候補になります。
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {(step3.kbf || []).map((kbf, idx) => (
                <div key={kbf.id} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-300 w-4 text-right shrink-0">{idx + 1}</span>
                  <input
                    type="text"
                    className="input-field text-sm flex-1 py-1"
                    value={kbf.name}
                    onChange={(e) => {
                      const newKbf = (step3.kbf || []).map(k => k.id === kbf.id ? { ...k, name: e.target.value } : k);
                      dispatch({ type: 'UPDATE_STEP3', payload: { kbf: newKbf } });
                    }}
                    placeholder="購買決定要因を入力..."
                  />
                  <div className="flex gap-0.5 shrink-0">
                    {['high', 'medium', 'low'].map(imp => (
                      <button
                        key={imp}
                        onClick={() => {
                          const newKbf = (step3.kbf || []).map(k => k.id === kbf.id ? { ...k, importance: imp } : k);
                          dispatch({ type: 'UPDATE_STEP3', payload: { kbf: newKbf } });
                        }}
                        className={`text-[9px] px-1.5 py-0.5 rounded cursor-pointer transition-colors
                          ${kbf.importance === imp
                            ? imp === 'high' ? 'bg-red-500 text-white' : imp === 'medium' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                      >
                        {imp === 'high' ? '高' : imp === 'medium' ? '中' : '低'}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      dispatch({ type: 'UPDATE_STEP3', payload: { kbf: (step3.kbf || []).filter(k => k.id !== kbf.id) } });
                    }}
                    className="text-gray-300 hover:text-red-500 cursor-pointer shrink-0"
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Competitor settings */}
        <div className="card">
          <h3 className="text-base font-bold text-gray-700 mb-3">競合企業の設定</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-primary-light rounded-lg">
              <span className="text-xs font-bold text-primary flex-1">⭐ {companyName}（自社）</span>
            </div>
            {step3.competitors.map(comp => (
              <div key={comp.id} className="flex items-center gap-2">
                <input
                  type="text"
                  className="input-field text-sm flex-1"
                  value={comp.name}
                  onChange={(e) => updateCompetitor(comp.id, 'name', e.target.value)}
                  placeholder="企業名"
                />
                <select
                  value={comp.scale}
                  onChange={(e) => updateCompetitor(comp.id, 'scale', e.target.value)}
                  className="input-field text-xs w-24"
                >
                  <option value="大手">大手</option>
                  <option value="中堅">中堅</option>
                  <option value="中小">中小</option>
                </select>
                <button onClick={() => removeCompetitor(comp.id)} className="text-gray-400 hover:text-danger cursor-pointer">✕</button>
              </div>
            ))}
            <button onClick={addCompetitor} className="btn-secondary btn-sm" disabled={step3.competitors.length >= 9}>
              ＋ 競合を追加（残り{9 - step3.competitors.length}社）
            </button>
          </div>
        </div>

        {/* Axis settings */}
        <div className="card">
          <h3 className="text-base font-bold text-gray-700 mb-3">評価軸（ポジショニング軸）</h3>
          <div className="space-y-2">
            {step3.axes.map(axis => (
              <div key={axis.id} className="flex items-center gap-2">
                <input
                  type="text"
                  className="input-field text-sm flex-1"
                  value={axis.name}
                  onChange={(e) => updateAxisName(axis.id, e.target.value)}
                />
                <button onClick={() => removeAxis(axis.id)} className="text-gray-400 hover:text-danger cursor-pointer">✕</button>
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={() => addAxis()} className="btn-secondary btn-sm">＋ 軸を追加</button>
            </div>
            {showTop5 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">💪 Top強みからサジェスト：</p>
                <div className="flex flex-wrap gap-1">
                  {top5.map(item => (
                    <button
                      key={item.id}
                      onClick={() => addAxis(item.name)}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs cursor-pointer hover:bg-blue-100"
                    >
                      + {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Score input table */}
      <div className="card mb-4">
        <h3 className="text-base font-bold text-gray-700 mb-3">スコア入力（1〜10）</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 px-2 min-w-[120px]">企業</th>
                {step3.axes.map(axis => (
                  <th key={axis.id} className="text-center py-2 px-2 text-xs min-w-[80px]">{axis.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allCompanies.map((comp, idx) => (
                <tr key={comp.id} className={`border-b border-gray-100 ${comp.isSelf ? 'bg-blue-50' : ''}`}>
                  <td className="py-1.5 px-2 font-medium text-xs">
                    <span style={{ color: COMPANY_COLORS[idx % COMPANY_COLORS.length] }}>●</span> {comp.name || '(未入力)'}
                    {comp.isSelf && ' ⭐'}
                  </td>
                  {step3.axes.map(axis => (
                    <td key={axis.id} className="text-center py-1 px-1">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        className="w-14 px-1 py-0.5 border border-gray-200 rounded text-xs text-center"
                        value={step3.scores[`${comp.id}_${axis.id}`] || ''}
                        onChange={(e) => setScore(comp.id, axis.id, Math.min(10, Math.max(0, Number(e.target.value))))}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategy Canvas */}
      <div className="card mb-4">
        <h3 className="text-base font-bold text-gray-700 mb-3">ストラテジーキャンバス</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={canvasData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            {allCompanies.map((comp, idx) => (
              <Line
                key={comp.id}
                type="monotone"
                dataKey={comp.id}
                name={comp.name || '(未入力)'}
                stroke={COMPANY_COLORS[idx % COMPANY_COLORS.length]}
                strokeWidth={comp.isSelf ? 3 : 1.5}
                dot={{ r: comp.isSelf ? 5 : 3 }}
                activeDot={{ r: comp.isSelf ? 7 : 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Positioning Maps (tabs) */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-700">ポジショニングマップ</h3>
          <div className="flex gap-1">
            {step3.maps.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMapTab(m.id)}
                className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors
                  ${activeMapTab === m.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {activeMap && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-500">タブ名</label>
                <input
                  type="text"
                  className="input-field text-sm mt-1"
                  value={activeMap.name}
                  onChange={(e) => updateMap(activeMap.id, 'name', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">X軸</label>
                <select
                  className="input-field text-sm mt-1"
                  value={activeMap.xAxis}
                  onChange={(e) => updateMap(activeMap.id, 'xAxis', e.target.value)}
                >
                  <option value="">選択してください</option>
                  {step3.axes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Y軸</label>
                <select
                  className="input-field text-sm mt-1"
                  value={activeMap.yAxis}
                  onChange={(e) => updateMap(activeMap.id, 'yAxis', e.target.value)}
                >
                  <option value="">選択してください</option>
                  {step3.axes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>

            {activeMap.xAxis && activeMap.yAxis && (
              <>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map(q => (
                    <input
                      key={q}
                      type="text"
                      className="input-field text-xs"
                      value={step3.quadrantLabels[`${activeMap.id}_${q}`] || ''}
                      onChange={(e) => updateQuadrantLabel(activeMap.id, q, e.target.value)}
                      placeholder={`${q === 'topLeft' ? '左上' : q === 'topRight' ? '右上' : q === 'bottomLeft' ? '左下' : '右下'}の象限ラベル`}
                    />
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart margin={{ top: 30, right: 20, bottom: 40, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number" dataKey="x" domain={[0, 10]}
                      label={{ value: step3.axes.find(a => a.id === activeMap.xAxis)?.name || '', position: 'bottom', offset: 20, fontSize: 12 }}
                    />
                    <YAxis
                      type="number" dataKey="y" domain={[0, 10]}
                      label={{ value: step3.axes.find(a => a.id === activeMap.yAxis)?.name || '', angle: -90, position: 'left', offset: 20, fontSize: 12 }}
                    />
                    <ZAxis type="number" dataKey="z" range={[100, 600]} />
                    <Tooltip content={({ payload }) => {
                      if (!payload?.[0]) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white shadow-lg rounded p-2 text-xs border">
                          <div className="font-bold">{d.name} {d.isSelf ? '⭐' : ''}</div>
                          <div>X: {d.x} / Y: {d.y}</div>
                        </div>
                      );
                    }} />
                    <Scatter data={posMapData}>
                      {posMapData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={entry.color}
                          fillOpacity={0.85}
                          stroke={entry.isSelf ? '#000' : entry.color}
                          strokeWidth={entry.isSelf ? 2.5 : 1}
                        />
                      ))}
                      <LabelList dataKey="name" content={renderPosNumberLabel} />
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                {/* 番号→企業名の凡例 */}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  {posMapData.map((d, idx) => (
                    <span key={idx} className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: d.color, border: d.isSelf ? '2px solid #000' : 'none' }}>
                        {d.isSelf ? '★' : idx + 1}
                      </span>
                      <span className={`${d.isSelf ? 'font-bold text-blue-800' : 'text-gray-700'}`}>
                        {d.name}{d.isSelf ? '（自社）' : ''}
                      </span>
                    </span>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <AICommentBox
        commentKey="positioningComment"
        inputData={{
          competitors: allCompanies,
          axes: step3.axes,
          scores: step3.scores,
          top5: project.step0.top5,
          targets: project.step2.targets,
        }}
        label="💡 ポジショニングコメント（AIコメント）"
      />

      <div className="mt-6 flex justify-between">
        <button onClick={onBack} className="btn-secondary">← 前のステップ</button>
        <button onClick={onNext} className="btn-primary">次へ：出力 →</button>
      </div>
    </div>
  );
}
