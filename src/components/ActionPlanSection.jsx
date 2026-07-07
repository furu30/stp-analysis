import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { generateActionPlan } from '../utils/aiService';

/** 空のアクションプラン行を作る */
function createEmptyItem() {
  return {
    id: `ap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: '',
    target: '',
    firstStep: '',
    owner: '',
    due: '',
  };
}

/**
 * アクションプラン（実行計画）セクション
 * STP分析の結果を「明日からの行動」に落とし込む。出力画面に配置。
 */
export default function ActionPlanSection() {
  const { project, dispatch } = useProject();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const items = project.actionPlan?.items || [];

  const setItems = (next) => {
    dispatch({ type: 'UPDATE_ACTION_PLAN', payload: { items: next } });
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(it => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const addItem = () => setItems([...items, createEmptyItem()]);

  const removeItem = (id) => setItems(items.filter(it => it.id !== id));

  const moveItem = (idx, dir) => {
    const next = [...items];
    const to = idx + dir;
    if (to < 0 || to >= next.length) return;
    [next[idx], next[to]] = [next[to], next[idx]];
    setItems(next);
  };

  const handleAIGenerate = async () => {
    if (!project.aiSettings.apiKey) {
      setError('APIキーが設定されていません。ヘッダーの「AI設定」からAPIキーを入力してください。');
      return;
    }
    if (items.length > 0 && !window.confirm('現在のアクションプランにAIの提案を追加します。よろしいですか？')) return;
    setLoading(true);
    setError('');
    try {
      const inputData = {
        settings: project.settings,
        top5Strengths: (project.step0.top5 || []).map(t => ({ name: t.name, reason: t.reason })),
        targets: Object.entries(project.step2.targets || {})
          .filter(([, t]) => t.label === 'main' || t.label === 'sub')
          .map(([id, t]) => ({
            name: (project.step2.candidates || []).find(c => c.id === id)?.name || '',
            label: t.label,
            reason: t.reason || '',
          })),
        positioning: project.step3.skipped ? { skipped: true } : {
          axes: (project.step3.axes || []).map(a => a.name),
          selfScores: Object.fromEntries(
            (project.step3.axes || []).map(a => [a.name, project.step3.scores?.[`self_${a.id}`] || 0])
          ),
        },
        swot: project.swot?.skipped ? { skipped: true } : project.swot,
        overallStrategy: project.aiComments?.overallStrategy || '',
      };
      const generated = await generateActionPlan(inputData, project.aiSettings);
      setItems([...items, ...generated]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-6 border-2 border-emerald-200">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h2 className="section-title mb-0">🚀 アクションプラン（実行計画）</h2>
        <button onClick={handleAIGenerate} disabled={loading} className="btn-accent btn-sm">
          {loading ? '⏳ 生成中...' : '✨ AIでドラフト生成'}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        分析を「明日からの行動」に落とし込みましょう。優先度の高い順に3〜5件が目安です。
        AIドラフトはたたき台です。<strong>自社の実情に合わせて必ず手直ししてください。</strong>
      </p>
      {error && <p className="text-sm text-danger mb-3">{error}</p>}

      {items.length === 0 ? (
        <div className="text-center py-8 bg-emerald-50/50 rounded-lg border border-dashed border-emerald-300">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm text-gray-600 mb-1">アクションプランはまだありません</p>
          <p className="text-xs text-gray-400 mb-4">
            「AIでドラフト生成」で分析結果から自動作成するか、手動で行を追加してください
          </p>
          <button onClick={addItem} className="btn-secondary btn-sm">＋ 手動で追加</button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mt-1">
                    {idx + 1}
                  </span>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="label-text">施策名</label>
                      <input
                        className="input-field"
                        value={item.title}
                        onChange={e => updateItem(item.id, 'title', e.target.value)}
                        placeholder="例: メインターゲット向けに高精度加工の事例集を作る"
                      />
                    </div>
                    <div>
                      <label className="label-text">狙い・対象ターゲット</label>
                      <input
                        className="input-field"
                        value={item.target}
                        onChange={e => updateItem(item.id, 'target', e.target.value)}
                        placeholder="例: 医療機器メーカーの調達担当"
                      />
                    </div>
                    <div>
                      <label className="label-text">最初の一歩（1〜2週間で着手できる行動）</label>
                      <input
                        className="input-field"
                        value={item.firstStep}
                        onChange={e => updateItem(item.id, 'firstStep', e.target.value)}
                        placeholder="例: 過去3年の納入実績から事例候補を10件リストアップ"
                      />
                    </div>
                    <div>
                      <label className="label-text">担当</label>
                      <input
                        className="input-field"
                        value={item.owner}
                        onChange={e => updateItem(item.id, 'owner', e.target.value)}
                        placeholder="例: 営業担当"
                      />
                    </div>
                    <div>
                      <label className="label-text">期限目安</label>
                      <input
                        className="input-field"
                        value={item.due}
                        onChange={e => updateItem(item.id, 'due', e.target.value)}
                        placeholder="例: 1ヶ月以内"
                      />
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col gap-1 mt-1">
                    <button
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                      className="btn btn-sm px-2 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                      title="優先度を上げる"
                    >↑</button>
                    <button
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === items.length - 1}
                      className="btn btn-sm px-2 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                      title="優先度を下げる"
                    >↓</button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="btn btn-sm px-2 text-gray-400 hover:text-danger"
                      title="削除"
                    >✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <button onClick={addItem} className="btn-secondary btn-sm">＋ 施策を追加</button>
          </div>
        </>
      )}
    </div>
  );
}
