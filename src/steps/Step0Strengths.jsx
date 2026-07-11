import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { VALUE_CHAIN_CATEGORIES } from '../data/defaultData';

const TOP_MIN = 5; // 強み選定の推奨数
const TOP_MAX = 7; // 強み選定の最大数

const STATUS_OPTIONS = [
  { value: 'communicated', label: '伝達できている', color: 'bg-green-100 text-green-700' },
  { value: 'issue', label: '課題あり', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'none', label: '未対応', color: 'bg-gray-100 text-gray-500' },
];

export default function Step0Strengths({ onNext, onSkip }) {
  const { project, dispatch } = useProject();
  const [activeTab, setActiveTab] = useState('vc1');
  const [showTop5, setShowTop5] = useState(false);

  const step0 = project.step0;
  const categories = step0.categories;

  const updateItem = (catId, itemId, field, value) => {
    const newCats = categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(item =>
          item.id === itemId ? { ...item, [field]: value } : item
        ),
      };
    });
    dispatch({ type: 'UPDATE_STEP0', payload: { categories: newCats } });
  };

  const addCustomItem = (catId) => {
    const newCats = categories.map(cat => {
      if (cat.id !== catId) return cat;
      const newItem = {
        id: `${catId}_custom_${Date.now()}`,
        name: '',
        strength: '',
        communication: '',
        communicationStatus: '',
        isStrengthFlag: false,
        isCustom: true,
      };
      return { ...cat, items: [...cat.items, newItem] };
    });
    dispatch({ type: 'UPDATE_STEP0', payload: { categories: newCats } });
  };

  const flaggedItems = categories.flatMap(cat =>
    cat.items.filter(i => i.isStrengthFlag).map(i => ({
      ...i,
      categoryName: cat.categoryName || VALUE_CHAIN_CATEGORIES.find(c => c.id === cat.id)?.name,
      categoryId: cat.id,
    }))
  );

  const top5 = step0.top5 || [];

  const confirmTop5 = () => {
    const selected = flaggedItems.slice(0, TOP_MAX).map((item, idx) => ({
      ...item,
      rank: idx + 1,
      reason: top5.find(t => t.id === item.id)?.reason || '',
    }));
    dispatch({ type: 'UPDATE_STEP0', payload: { top5: selected } });
  };

  const updateTop5Reason = (itemId, reason) => {
    const newTop5 = (step0.top5 || []).map(t =>
      t.id === itemId ? { ...t, reason } : t
    );
    dispatch({ type: 'UPDATE_STEP0', payload: { top5: newTop5 } });
  };

  const moveTop5 = (idx, dir) => {
    const arr = [...(step0.top5 || [])];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    arr.forEach((item, i) => item.rank = i + 1);
    dispatch({ type: 'UPDATE_STEP0', payload: { top5: arr } });
  };

  const activeCat = categories.find(c => c.id === activeTab);
  // カテゴリメタデータ: プロジェクトデータに含まれていればそちらを優先、なければマスタ参照
  const masterCat = VALUE_CHAIN_CATEGORIES.find(c => c.id === activeTab);
  const catMeta = {
    ...masterCat,
    name: activeCat?.categoryName || masterCat?.name,
    description: activeCat?.categoryDescription || masterCat?.description,
    type: activeCat?.categoryType || masterCat?.type,
  };

  if (showTop5) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">強みTop選定（5〜7件）</h2>
            <button onClick={() => setShowTop5(false)} className="btn-secondary btn-sm">← バリューチェーン入力に戻る</button>
          </div>

          {flaggedItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              「★ 強みとして選択」ボタンでフラグを付けた項目がここに表示されます。<br />
              バリューチェーン入力に戻って、強みをマークしてください。
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                フラグを付けた項目が {flaggedItems.length} 件あります。上位最大{TOP_MAX}件を「Top強み」として確定してください（5件でも十分です）。
              </p>
              <div className="space-y-3">
                {(step0.top5.length > 0 ? step0.top5 : flaggedItems.slice(0, TOP_MAX)).map((item, idx) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex gap-4 items-start">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg font-bold text-primary">#{idx + 1}</span>
                      <button onClick={() => moveTop5(idx, -1)} disabled={idx === 0} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-30">▲</button>
                      <button onClick={() => moveTop5(idx, 1)} disabled={idx >= (step0.top5.length || flaggedItems.length) - 1} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-30">▼</button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="step-badge bg-blue-100 text-blue-700">{item.categoryName}</span>
                        <span className="font-semibold">{item.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.strength}</p>
                      <div>
                        <label className="text-xs font-semibold text-gray-500">重要理由（模倣困難性 / 希少性 / 顧客価値）</label>
                        <textarea
                          className="textarea-field mt-1 text-sm"
                          rows={2}
                          value={item.reason || ''}
                          onChange={(e) => updateTop5Reason(item.id, e.target.value)}
                          placeholder="この強みがなぜ重要か、競合が模倣しにくい理由を記入..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={confirmTop5} className="btn-primary">
                  Top強みを確定する（最大{TOP_MAX}件）
                </button>
              </div>
            </>
          )}

          <div className="mt-6 flex justify-end">
            <button onClick={onNext} className="btn-primary">
              次へ：セグメンテーション（Step 1）→
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title mb-1">Step 0: 自社の強み棚卸</h2>
            <p className="text-sm text-gray-500">Porterのバリューチェーンに沿って、自社の競争優位性を整理します。</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onSkip} className="btn-secondary btn-sm">スキップ →</button>
            <button onClick={() => setShowTop5(true)} className="btn-accent btn-sm">
              強みを整理する（{flaggedItems.length}件）
            </button>
          </div>
        </div>

        {/* このステップのゴールを先に示す（全項目入力は不要と明示して入力負荷の不安を下げる） */}
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-900 font-semibold mb-1">
            🎯 このステップのゴール：自信のある項目に「★」を5〜7つ付けること
          </p>
          <p className="text-xs text-emerald-800">
            バリューチェーンとは、仕事の流れを「調達→製造→出荷→販売→サービス」＋それを支える活動の8つに分けたものです。
            <strong>全部の欄を埋める必要はありません。</strong>
            タブを順に見ながら「これはウチの強みだ」と思う項目だけ記入し、★を付けてください。
            ★が5つ以上（最大7つ）集まったら右上の「強みを整理する」へ。
          </p>
          <p className="text-xs text-emerald-700 mt-2 font-semibold">
            ★の数: {flaggedItems.length} / 5〜{TOP_MAX} {flaggedItems.length >= TOP_MIN ? '✅ →「強みを整理する」でTop強みを確定しましょう' : ''}
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto border-b border-gray-200 pb-2">
          {categories.map(cat => {
            const master = VALUE_CHAIN_CATEGORIES.find(c => c.id === cat.id);
            const name = cat.categoryName || master?.name || cat.id;
            const type = cat.categoryType || master?.type || '';
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors
                  ${activeTab === cat.id ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}
                  ${type === '支援活動' ? 'border-l-2 border-l-amber-400' : ''}`}
              >
                {type === '支援活動' && '🔧 '}{name}
              </button>
            );
          })}
        </div>

        {/* Active category content */}
        {catMeta && activeCat && (
          <div>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="step-badge bg-blue-100 text-blue-700">{catMeta.type}</span>
                <span className="font-bold text-sm">{catMeta.name}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{catMeta.description}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-2 w-32">項目名</th>
                    <th className="text-left py-2 px-2">当社の強み</th>
                    <th className="text-left py-2 px-2">顧客への伝達</th>
                    <th className="text-center py-2 px-2 w-28">伝達状況</th>
                    <th className="text-center py-2 px-2 w-20">強み★</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCat.items.map(item => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2">
                        {item.isCustom ? (
                          <input
                            type="text"
                            className="input-field text-xs"
                            value={item.name}
                            onChange={(e) => updateItem(activeTab, item.id, 'name', e.target.value)}
                            placeholder="項目名を入力"
                          />
                        ) : (
                          <span className="font-medium text-gray-700">{item.name}</span>
                        )}
                      </td>
                      <td className="py-2 px-2">
                        <textarea
                          className="textarea-field text-xs"
                          rows={2}
                          maxLength={500}
                          value={item.strength}
                          onChange={(e) => updateItem(activeTab, item.id, 'strength', e.target.value)}
                          placeholder="例: 5軸加工で±0.005mmの精度を安定して出せる"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <textarea
                          className="textarea-field text-xs"
                          rows={2}
                          maxLength={500}
                          value={item.communication}
                          onChange={(e) => updateItem(activeTab, item.id, 'communication', e.target.value)}
                          placeholder="例: Webに加工事例を掲載済み／展示会で説明のみ"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex flex-col gap-1">
                          {STATUS_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => updateItem(activeTab, item.id, 'communicationStatus', opt.value)}
                              className={`text-xs px-2 py-0.5 rounded cursor-pointer transition-all
                                ${item.communicationStatus === opt.value ? opt.color + ' font-bold ring-1 ring-current' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => updateItem(activeTab, item.id, 'isStrengthFlag', !item.isStrengthFlag)}
                          className={`text-lg cursor-pointer transition-transform hover:scale-110 ${item.isStrengthFlag ? 'text-amber-500' : 'text-gray-300'}`}
                        >
                          {item.isStrengthFlag ? '★' : '☆'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => addCustomItem(activeTab)}
              className="btn-secondary btn-sm mt-3"
            >
              ＋ カスタム項目を追加
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
