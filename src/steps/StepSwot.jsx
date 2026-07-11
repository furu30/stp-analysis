import { useState, useMemo, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import HelpTip from '../components/HelpTip';
import { generateAIComment } from '../utils/aiService';

const QUADRANTS = [
  {
    key: 'strengths', label: '強み (S)', color: 'blue', icon: '💪',
    placeholder: 'Step0で選定した強みが自動反映されます。追加も可能です。',
    help: '内部環境：自社が競合に対して優れている点',
    examples: ['独自技術・特許', '価格競争力', '顧客基盤・リピート率', '立地条件', '人材の質'],
  },
  {
    key: 'weaknesses', label: '弱み (W)', color: 'red', icon: '⚡',
    placeholder: '自社の弱み・改善が必要な点',
    help: '内部環境：競合に比べて劣っている点・課題',
    examples: ['知名度の低さ', '資金力不足', '人材不足・採用難', 'デジタル化の遅れ', '後継者不在'],
  },
  {
    key: 'opportunities', label: '機会 (O)', color: 'green', icon: '🌱',
    placeholder: '市場・業界の追い風となる外部要因',
    help: '外部環境：自社にとって有利な市場・業界の変化',
    examples: ['市場の拡大・成長', '規制緩和', '技術革新', '競合の撤退', '消費者ニーズの変化'],
  },
  {
    key: 'threats', label: '脅威 (T)', color: 'amber', icon: '⚠️',
    placeholder: '市場・業界のリスクとなる外部要因',
    help: '外部環境：自社にとって不利な市場・業界の変化',
    examples: ['競合の激化', '原材料高騰', '人口減少・市場縮小', '法規制の強化', '代替品の出現'],
  },
];

// クロスSWOTの「考える視点」。入力枠ではなく、戦略オプションを発想するためのヒント
const CROSS_VIEWPOINTS = [
  { key: 'so', label: '積極戦略 (S×O)', desc: '強みを活かして機会を最大化', icon: '🚀' },
  { key: 'st', label: '差別化戦略 (S×T)', desc: '強みを活かして脅威を回避・克服', icon: '🛡️' },
  { key: 'wo', label: '改善戦略 (W×O)', desc: '弱みを克服して機会を活用', icon: '🔧' },
  { key: 'wt', label: '防衛戦略 (W×T)', desc: '弱みと脅威の最悪シナリオを回避', icon: '🏰' },
];

const TYPE_BADGE = {
  so: 'bg-blue-100 text-blue-700 border-blue-300',
  st: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  wo: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  wt: 'bg-red-100 text-red-700 border-red-300',
};

const EVAL_LEVELS = ['高', '中', '低'];
const MIN_OPTIONS = 5; // 戦略オプションの初期表示数

// 効果×実現性から優先度を算出（両方入力時のみ）
function calcPriority(effect, feasibility) {
  const score = { '高': 3, '中': 2, '低': 1 };
  if (!score[effect] || !score[feasibility]) return null;
  const total = score[effect] + score[feasibility];
  if (total >= 6) return { label: '◎ 最優先', cls: 'bg-red-500 text-white' };
  if (total >= 5) return { label: '○ 優先', cls: 'bg-orange-400 text-white' };
  if (total >= 4) return { label: '△ 検討', cls: 'bg-yellow-400 text-gray-800' };
  return { label: '▽ 保留', cls: 'bg-gray-300 text-gray-600' };
}

const colorMap = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', header: 'bg-blue-500', tag: 'bg-blue-100 text-blue-700', hoverBg: 'hover:bg-blue-100' },
  red: { bg: 'bg-red-50', border: 'border-red-200', header: 'bg-red-500', tag: 'bg-red-100 text-red-700', hoverBg: 'hover:bg-red-100' },
  green: { bg: 'bg-green-50', border: 'border-green-200', header: 'bg-green-500', tag: 'bg-green-100 text-green-700', hoverBg: 'hover:bg-green-100' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', header: 'bg-amber-500', tag: 'bg-amber-100 text-amber-700', hoverBg: 'hover:bg-amber-100' },
};

const MIN_ROWS = 3; // 各象限の最小行数
const MAX_ROWS = 7; // 各象限の最大項目数

export default function StepSwot({ onNext, onBack, initialShowCross = false }) {
  const { project, dispatch } = useProject();
  const swot = project.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [], strategyOptions: [] };
  const [showCross, setShowCross] = useState(initialShowCross);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiCrossGenerating, setAiCrossGenerating] = useState(false);
  const [showExamples, setShowExamples] = useState({});

  // Step0のTop5強みを自動取り込み
  const top5Names = useMemo(() => {
    return (project.step0.top5 || []).map(t => t.name).filter(Boolean);
  }, [project.step0.top5]);

  const effectiveStrengths = swot.strengths.length > 0 ? swot.strengths : top5Names;

  // Step3の競合比較で自社が全競合を上回った軸を「強み候補」としてサジェスト
  const advantageAxes = useMemo(() => {
    const step3 = project.step3;
    if (!step3 || step3.skipped || (step3.competitors || []).length === 0) return [];
    return (step3.axes || []).filter(axis => {
      const selfScore = step3.scores?.[`self_${axis.id}`] || 0;
      if (selfScore === 0) return false;
      return step3.competitors.every(c => selfScore > (step3.scores?.[`${c.id}_${axis.id}`] || 0));
    }).map(a => `${a.name}で競合を上回る`);
  }, [project.step3]);

  // 各象限のデータ（最低MIN_ROWS行を保証）
  const getItems = useCallback((key) => {
    if (key === 'strengths') {
      const items = effectiveStrengths;
      return items.length >= MIN_ROWS ? items : [...items, ...Array(MIN_ROWS - items.length).fill('')];
    }
    const items = swot[key] || [];
    return items.length >= MIN_ROWS ? items : [...items, ...Array(MIN_ROWS - items.length).fill('')];
  }, [effectiveStrengths, swot]);

  const updateList = (key, items) => {
    dispatch({ type: 'UPDATE_SWOT', payload: { [key]: items } });
  };

  const addItem = (key) => {
    const current = getItems(key);
    if (current.length >= MAX_ROWS) return;
    updateList(key, [...current, '']);
  };

  const updateItem = (key, index, value) => {
    const current = [...getItems(key)];
    current[index] = value;
    updateList(key, current);
  };

  const removeItem = (key, index) => {
    const current = [...getItems(key)];
    current.splice(index, 1);
    // 最低行数を下回らないよう空行追加
    while (current.length < MIN_ROWS) current.push('');
    updateList(key, current);
  };

  // 戦略オプション（最低MIN_OPTIONS枠を表示）
  const getOptions = useCallback(() => {
    const opts = swot.strategyOptions || [];
    if (opts.length >= MIN_OPTIONS) return opts;
    return [
      ...opts,
      ...Array.from({ length: MIN_OPTIONS - opts.length }, (_, i) => ({
        id: `opt_pad_${opts.length + i}`, type: '', text: '', effect: '', feasibility: '',
      })),
    ];
  }, [swot.strategyOptions]);

  const updateOptions = (options) => {
    dispatch({ type: 'UPDATE_SWOT', payload: { strategyOptions: options } });
  };

  const updateOption = (index, field, value) => {
    const options = [...getOptions()];
    options[index] = { ...options[index], [field]: value };
    updateOptions(options);
  };

  const addOption = () => {
    const options = getOptions();
    updateOptions([...options, { id: `opt_${Date.now()}`, type: '', text: '', effect: '', feasibility: '' }]);
  };

  const removeOption = (index) => {
    const options = [...getOptions()];
    options.splice(index, 1);
    while (options.length < MIN_OPTIONS) {
      options.push({ id: `opt_pad_${Date.now()}_${options.length}`, type: '', text: '', effect: '', feasibility: '' });
    }
    updateOptions(options);
  };

  // 例を挿入
  const insertExample = (key, example) => {
    const current = [...getItems(key)];
    // 最初の空行に挿入
    const emptyIdx = current.findIndex(v => !v);
    if (emptyIdx >= 0) {
      current[emptyIdx] = example;
    } else if (current.length < MAX_ROWS) {
      current.push(example);
    } else {
      return; // 最大項目数に達している場合は追加しない
    }
    updateList(key, current);
  };

  // AI一括生成: 弱み・機会・脅威をAIに生成させる
  const generateSwotWithAI = useCallback(async () => {
    if (!project.aiSettings.apiKey) {
      alert('AIを使用するにはヘッダーの「AI設定」からAPIキーを設定してください。');
      return;
    }
    setAiGenerating(true);
    try {
      const result = await generateAIComment('swotGenerate', {
        settings: project.settings,
        top5: project.step0.top5,
        currentStrengths: effectiveStrengths.filter(Boolean),
        step1: project.step1,
        step2: project.step2,
      }, project.aiSettings);

      // AIの結果をパース（JSON配列形式を期待）
      try {
        const parsed = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || result);
        if (parsed.weaknesses) updateList('weaknesses', parsed.weaknesses.slice(0, MAX_ROWS));
        if (parsed.opportunities) updateList('opportunities', parsed.opportunities.slice(0, MAX_ROWS));
        if (parsed.threats) updateList('threats', parsed.threats.slice(0, MAX_ROWS));
        // 強みが空ならAI提案も取り込む
        if (parsed.strengths && effectiveStrengths.filter(Boolean).length === 0) {
          updateList('strengths', parsed.strengths.slice(0, MAX_ROWS));
        }
      } catch {
        // テキストとして行分割
        const lines = result.split('\n').filter(l => l.trim());
        // 簡易パース: W: / O: / T: プレフィックスで分類
        const w = [], o = [], t = [];
        let current = null;
        for (const line of lines) {
          const clean = line.replace(/^[-・*]\s*/, '').trim();
          if (/^[Ww弱]/.test(clean)) current = w;
          else if (/^[Oo機]/.test(clean)) current = o;
          else if (/^[Tt脅]/.test(clean)) current = t;
          if (current && clean) current.push(clean.replace(/^[SWOT弱み機会脅威:\s]+/i, '').trim());
        }
        if (w.length) updateList('weaknesses', w.slice(0, MAX_ROWS));
        if (o.length) updateList('opportunities', o.slice(0, MAX_ROWS));
        if (t.length) updateList('threats', t.slice(0, MAX_ROWS));
      }
    } catch (e) {
      alert(`AI生成エラー: ${e.message}`);
    } finally {
      setAiGenerating(false);
    }
  }, [project, effectiveStrengths]);

  // AIクロスSWOT生成
  const generateCrossWithAI = useCallback(async () => {
    if (!project.aiSettings.apiKey) {
      alert('AIを使用するにはヘッダーの「AI設定」からAPIキーを設定してください。');
      return;
    }
    setAiCrossGenerating(true);
    try {
      const quadrantData = {
        strengths: effectiveStrengths.filter(Boolean),
        weaknesses: (swot.weaknesses || []).filter(Boolean),
        opportunities: (swot.opportunities || []).filter(Boolean),
        threats: (swot.threats || []).filter(Boolean),
      };
      const result = await generateAIComment('crossSwotGenerate', {
        settings: project.settings,
        swot: quadrantData,
        top5: project.step0.top5,
      }, project.aiSettings);

      try {
        const parsed = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || result);
        const options = (parsed.options || [])
          .filter(o => o && o.text)
          .slice(0, 8)
          .map((o, i) => ({
            id: `opt_ai_${Date.now()}_${i}`,
            type: ['so', 'st', 'wo', 'wt'].includes(o.type) ? o.type : '',
            text: o.text,
            effect: EVAL_LEVELS.includes(o.effect) ? o.effect : '',
            feasibility: EVAL_LEVELS.includes(o.feasibility) ? o.feasibility : '',
          }));
        if (options.length > 0) {
          // 手入力済みのオプションは残し、空枠をAI案で置き換える
          const existing = (swot.strategyOptions || []).filter(o => (o.text || '').trim());
          updateOptions([...existing, ...options]);
        }
      } catch {
        // パース失敗時はテキスト全体を1つ目のオプションに入れる
        const existing = (swot.strategyOptions || []).filter(o => (o.text || '').trim());
        updateOptions([...existing, { id: `opt_ai_${Date.now()}`, type: '', text: result.trim(), effect: '', feasibility: '' }]);
      }
    } catch (e) {
      alert(`AI生成エラー: ${e.message}`);
    } finally {
      setAiCrossGenerating(false);
    }
  }, [project, effectiveStrengths, swot]);

  const quadrantData = {
    strengths: getItems('strengths'),
    weaknesses: getItems('weaknesses'),
    opportunities: getItems('opportunities'),
    threats: getItems('threats'),
  };

  const hasData = Object.values(quadrantData).some(arr => arr.some(Boolean));
  const hasApiKey = !!project.aiSettings.apiKey;

  // ---------- クロスSWOT画面 ----------
  if (showCross) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title mb-1">クロスSWOT分析 → 戦略オプション</h2>
              <p className="text-sm text-gray-500">4つの組み合わせ（S×O・S×T・W×O・W×T）の視点で発想し、自社に合う戦略オプションを導き出して評価します。</p>
            </div>
            <div className="flex gap-2">
              {hasApiKey && (
                <button
                  onClick={generateCrossWithAI}
                  disabled={aiCrossGenerating}
                  className="btn-accent btn-sm"
                >
                  {aiCrossGenerating ? '⏳ AI生成中...' : '🤖 AIで戦略案を生成'}
                </button>
              )}
              <button onClick={() => setShowCross(false)} className="btn-secondary btn-sm">← SWOT入力に戻る</button>
            </div>
          </div>

          {/* SWOT要約 */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {QUADRANTS.map(q => (
              <div key={q.key} className={`rounded-lg p-2 ${colorMap[q.color].bg} ${colorMap[q.color].border} border`}>
                <div className="text-xs font-bold text-gray-600 mb-1">{q.icon} {q.label}</div>
                {(quadrantData[q.key] || []).filter(Boolean).map((item, i) => (
                  <div key={i} className={`text-[10px] px-1.5 py-0.5 rounded mb-0.5 ${colorMap[q.color].tag}`}>{item}</div>
                ))}
              </div>
            ))}
          </div>

          {/* 考える視点（ヒントカード）: 入力枠ではなく発想のガイド */}
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-xs font-bold text-gray-600 mb-2">
              💭 4つの組み合わせの視点で考える（すべての枠を埋める必要はありません）
            </p>
            <div className="grid grid-cols-4 gap-2">
              {CROSS_VIEWPOINTS.map(cv => (
                <div key={cv.key} className={`rounded-lg border px-2 py-1.5 bg-white ${TYPE_BADGE[cv.key].split(' ')[2]}`}>
                  <div className="text-[11px] font-bold text-gray-700">{cv.icon} {cv.label}</div>
                  <div className="text-[10px] text-gray-400">{cv.desc}</div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              この4視点をヒントに「自社に合う戦略」をオプションとして挙げ、各オプションがどの組み合わせから生まれたかを選択してください。最後に効果・実現性で評価し、優先順位を付けます。
            </p>
          </div>

          {/* 戦略オプション入力 */}
          <div className="space-y-3">
            {getOptions().map((opt, idx) => {
              const priority = calcPriority(opt.effect, opt.feasibility);
              return (
                <div key={opt.id || idx} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-bold text-primary shrink-0">戦略オプション {idx + 1}</span>
                    <select
                      className="input-field text-xs py-1 w-auto"
                      value={opt.type || ''}
                      onChange={(e) => updateOption(idx, 'type', e.target.value)}
                    >
                      <option value="">組み合わせを選択...</option>
                      {CROSS_VIEWPOINTS.map(cv => (
                        <option key={cv.key} value={cv.key}>{cv.icon} {cv.label}：{cv.desc}</option>
                      ))}
                    </select>
                    {opt.type && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${TYPE_BADGE[opt.type]}`}>
                        {CROSS_VIEWPOINTS.find(cv => cv.key === opt.type)?.label}
                      </span>
                    )}
                    <div className="flex-1" />
                    {priority && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${priority.cls}`}>{priority.label}</span>
                    )}
                    <button
                      onClick={() => removeOption(idx)}
                      className="text-gray-300 hover:text-red-500 text-sm cursor-pointer shrink-0"
                      title="このオプションを削除"
                    >×</button>
                  </div>
                  <textarea
                    className="textarea-field text-sm"
                    rows={3}
                    value={opt.text || ''}
                    onChange={(e) => updateOption(idx, 'text', e.target.value)}
                    placeholder="自社に合うと考えた戦略を記入...（例: 強みの◯◯を活かして、△△市場の拡大に対応する）"
                  />
                  {/* オプション評価 */}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[11px] font-bold text-gray-500">評価:</span>
                    {[['effect', '効果（成果の大きさ）'], ['feasibility', '実現性（実行しやすさ）']].map(([field, label]) => (
                      <div key={field} className="flex items-center gap-1.5">
                        <span className="text-[11px] text-gray-500">{label}</span>
                        {EVAL_LEVELS.map(level => (
                          <button
                            key={level}
                            onClick={() => updateOption(idx, field, opt[field] === level ? '' : level)}
                            className={`text-[11px] px-2 py-0.5 rounded cursor-pointer transition-all border
                              ${opt[field] === level
                                ? 'bg-primary text-white border-primary font-bold'
                                : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'}`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={addOption} className="btn-secondary btn-sm mt-3">
            ＋ 戦略オプションを追加
          </button>

          <div className="mt-6 flex justify-between">
            <button onClick={() => setShowCross(false)} className="btn-secondary">← SWOT入力に戻る</button>
            <button onClick={onNext} className="btn-primary">次へ：出力 →</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- SWOT入力画面 ----------
  return (
    <div className="max-w-5xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="section-title mb-1">
              SWOT分析
              <HelpTip text="自社の内部環境（強み・弱み）と外部環境（機会・脅威）を整理し、戦略の方向性を導き出します。" detail="強みはStep0から自動取り込み。弱み・機会・脅威を入力してください。AIで一括生成も可能です。" />
            </h2>
            <p className="text-sm text-gray-500">内部環境と外部環境を整理し、クロスSWOTで戦略方向性を導きます。</p>
          </div>
          {hasApiKey && (
            <button
              onClick={generateSwotWithAI}
              disabled={aiGenerating}
              className="btn-accent btn-sm"
            >
              {aiGenerating ? '⏳ AI分析中...' : '🤖 AIで弱み・機会・脅威を生成'}
            </button>
          )}
        </div>

        {!hasApiKey && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">💡 ヘッダーの「AI設定」からAPIキーを設定すると、弱み・機会・脅威をAIで一括生成できます。</p>
          </div>
        )}

        {/* Step3の競合比較からの強みサジェスト */}
        {advantageAxes.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-bold text-blue-700 mb-1.5">
              📍 Step3の競合比較で、全競合を上回った軸があります（クリックで強みに追加）
            </p>
            <div className="flex flex-wrap gap-1">
              {advantageAxes.map((name, i) => (
                <button
                  key={i}
                  onClick={() => insertExample('strengths', name)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white text-blue-600 border border-blue-300 hover:bg-blue-100 cursor-pointer transition-colors"
                >
                  + {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SWOT 4象限 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {QUADRANTS.map(q => {
            const items = quadrantData[q.key] || [];
            const c = colorMap[q.color];
            const isExampleOpen = showExamples[q.key];
            return (
              <div key={q.key} className={`rounded-xl border-2 ${c.border} ${c.bg} p-4`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-gray-700">{q.icon} {q.label}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowExamples(prev => ({ ...prev, [q.key]: !prev[q.key] }))}
                      className="text-[10px] text-gray-400 hover:text-blue-500 cursor-pointer"
                    >
                      {isExampleOpen ? '例を閉じる' : '💡 入力例'}
                    </button>
                    <button
                      onClick={() => addItem(q.key)}
                      disabled={items.length >= MAX_ROWS}
                      className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title={items.length >= MAX_ROWS ? `最大${MAX_ROWS}項目までです` : ''}
                    >+ 追加{items.length >= MAX_ROWS ? `（最大${MAX_ROWS}）` : ''}</button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mb-2">{q.help}</p>

                {/* 入力例チップ */}
                {isExampleOpen && (
                  <div className="flex flex-wrap gap-1 mb-2 p-2 bg-white/60 rounded-lg">
                    {q.examples.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => { insertExample(q.key, ex); }}
                        className={`text-[10px] px-2 py-0.5 rounded-full border cursor-pointer transition-all ${c.tag} ${c.hoverBg} border-transparent hover:border-gray-300`}
                      >
                        + {ex}
                      </button>
                    ))}
                  </div>
                )}

                {/* 入力フィールド */}
                <div className="space-y-1.5">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-300 w-4 text-right shrink-0">{idx + 1}</span>
                      <input
                        type="text"
                        className="input-field text-sm flex-1 py-1"
                        value={item}
                        onChange={(e) => updateItem(q.key, idx, e.target.value)}
                        placeholder={q.placeholder}
                      />
                      <button
                        onClick={() => removeItem(q.key, idx)}
                        className="text-gray-300 hover:text-red-500 text-sm cursor-pointer shrink-0"
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 内部/外部ラベル */}
        <div className="flex items-center justify-center gap-8 mb-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-blue-300 inline-block" />
            <span className="w-3 h-0.5 bg-red-300 inline-block" />
            <span>内部環境（強み・弱み）— 自社でコントロール可能</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-green-300 inline-block" />
            <span className="w-3 h-0.5 bg-amber-300 inline-block" />
            <span>外部環境（機会・脅威）— 市場・業界の変化</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button onClick={onBack} className="btn-secondary">← 前のステップ</button>
          <div className="flex gap-3">
            {hasData && (
              <button onClick={() => setShowCross(true)} className="btn-accent">
                クロスSWOT分析へ →
              </button>
            )}
            <button onClick={onNext} className="btn-primary">
              {hasData ? '出力へスキップ →' : '次へ →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
