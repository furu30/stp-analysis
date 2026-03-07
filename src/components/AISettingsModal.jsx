import { useProject } from '../context/ProjectContext';

const PROVIDERS = [
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    site: 'console.anthropic.com',
    models: [
      { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', tag: '最新・推奨' },
      { value: 'claude-opus-4-6', label: 'Claude Opus 4.6', tag: '最高性能' },
      { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5' },
      { value: 'claude-opus-4-5-20251101', label: 'Claude Opus 4.5' },
      { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', tag: '高速・低コスト' },
    ],
    defaultModel: 'claude-sonnet-4-6',
  },
  {
    id: 'openai',
    name: 'GPT (OpenAI)',
    site: 'platform.openai.com',
    models: [
      { value: 'gpt-5.4', label: 'GPT-5.4', tag: '最新・推奨' },
      { value: 'gpt-5.4-pro', label: 'GPT-5.4 Pro', tag: '最高性能' },
      { value: 'gpt-5-mini', label: 'GPT-5 mini', tag: '高速・低コスト' },
      { value: 'gpt-5-nano', label: 'GPT-5 nano', tag: '最速' },
      { value: 'gpt-4.1', label: 'GPT-4.1' },
    ],
    defaultModel: 'gpt-5.4',
  },
  {
    id: 'gemini',
    name: 'Gemini (Google)',
    site: 'aistudio.google.com',
    models: [
      { value: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro', tag: '最新・推奨' },
      { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', tag: '高性能・高速' },
      { value: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash Lite', tag: '最速・低コスト' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', tag: '安定版' },
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    ],
    defaultModel: 'gemini-3.1-pro-preview',
  },
];

export default function AISettingsModal({ onClose }) {
  const { project, dispatch } = useProject();
  const s = project.aiSettings;

  const update = (payload) => dispatch({ type: 'UPDATE_AI_SETTINGS', payload });
  const currentProvider = PROVIDERS.find(p => p.id === s.provider);
  const isCustomModel = currentProvider && !currentProvider.models.some(m => m.value === s.model);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">🤖 AIプロバイダー設定</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">✕</button>
        </div>

        <div className="space-y-5">
          {/* プロバイダー選択 */}
          <div>
            <label className="label-text">プロバイダー</label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS.map(p => (
                <button
                  key={p.id}
                  onClick={() => update({ provider: p.id, model: p.defaultModel })}
                  className={`p-3 rounded-lg border-2 text-sm font-medium text-center cursor-pointer transition-all
                    ${s.provider === p.id ? 'border-primary bg-primary-light text-primary' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* APIキー */}
          <div>
            <label className="label-text">APIキー</label>
            <input
              type="password"
              className="input-field"
              value={s.apiKey}
              onChange={(e) => update({ apiKey: e.target.value })}
              placeholder={`${currentProvider?.site} から取得`}
            />
            <p className="text-xs text-gray-400 mt-1">
              APIキーはブラウザのメモリにのみ保持され、ファイル保存には含まれません。
            </p>
          </div>

          {/* モデル選択 */}
          <div>
            <label className="label-text">モデル</label>
            <div className="space-y-1.5">
              {currentProvider?.models.map(m => (
                <label
                  key={m.value}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all
                    ${s.model === m.value ? 'border-primary bg-primary-light/40 ring-1 ring-primary/30' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={m.value}
                    checked={s.model === m.value}
                    onChange={() => update({ model: m.value })}
                    className="accent-primary"
                  />
                  <div className="flex-1 flex items-center gap-2">
                    <span className={`text-sm font-medium ${s.model === m.value ? 'text-primary-dark' : 'text-gray-700'}`}>
                      {m.label}
                    </span>
                    {m.tag && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                        ${m.tag.includes('推奨') ? 'bg-blue-100 text-blue-700'
                          : m.tag.includes('最高') ? 'bg-purple-100 text-purple-700'
                          : m.tag.includes('高速') || m.tag.includes('最速') ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'}`}>
                        {m.tag}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{m.value}</span>
                </label>
              ))}

              {/* カスタムモデル入力 */}
              <div className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all
                ${isCustomModel ? 'border-primary bg-primary-light/40 ring-1 ring-primary/30' : 'border-gray-200'}`}>
                <input
                  type="radio"
                  name="model"
                  checked={isCustomModel}
                  onChange={() => update({ model: '' })}
                  className="accent-primary"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-600">カスタムモデル名</span>
                  {isCustomModel && (
                    <input
                      type="text"
                      className="input-field mt-1.5 text-xs"
                      value={s.model}
                      onChange={(e) => update({ model: e.target.value })}
                      placeholder="モデル名を直接入力（例: claude-sonnet-4-7-20260401）"
                      autoFocus
                    />
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              新しいモデルがリリースされた場合は「カスタムモデル名」に直接入力できます。
            </p>
          </div>

          {/* トーン */}
          <div>
            <label className="label-text">トーン</label>
            <div className="flex gap-2">
              <button
                onClick={() => update({ tone: 'formal' })}
                className={`btn flex-1 ${s.tone === 'formal' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                提案書向け（丁寧）
              </button>
              <button
                onClick={() => update({ tone: 'casual' })}
                className={`btn flex-1 ${s.tone === 'casual' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                社内確認向け（簡潔）
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-primary">設定を閉じる</button>
        </div>
      </div>
    </div>
  );
}
