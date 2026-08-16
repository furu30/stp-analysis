import { useMemo, useState } from 'react';
import { AI_CHAT_LINKS, PROMPT_TYPES, buildPrompt, parseAIJson, buildRepairPrompt } from '../utils/aiPrompt';

/**
 * プロンプト配布方式のAI連携モーダル（課題M-01）
 *
 * ❶プロンプトをコピー → ❷AIに貼る → ❸回答を貼り戻す の3ステップを1枚に閉じる。
 * APIキーは不要で、顧客データがアプリから外部へ送信されることもない。
 *
 * props:
 *   type    … PROMPT_TYPES のキー（swotGenerate / crossSwotGenerate）
 *   data    … プロンプトに埋め込む分析データ
 *   onApply … 貼り戻したJSONを受け取る。取り込みに失敗したら文字列でエラー理由を返す
 *   onClose … モーダルを閉じる
 */
export default function AIPromptModal({ type, data, onApply, onClose }) {
  const meta = PROMPT_TYPES[type] || {};
  const prompt = useMemo(() => buildPrompt(type, data), [type, data]);

  const [copied, setCopied] = useState('');
  const [pasted, setPasted] = useState('');
  const [error, setError] = useState('');

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      // クリップボードAPIが使えない環境（権限拒否・古いブラウザ）では手動コピーに委ねる
      setCopied('manual');
    }
  };

  const apply = () => {
    setError('');
    let parsed;
    try {
      parsed = parseAIJson(pasted);
    } catch (e) {
      setError(e.message);
      return;
    }
    const reason = onApply(parsed);
    if (reason) {
      setError(reason);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-bold">🤖 {meta.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <p className="text-sm text-gray-500 mb-5">{meta.lead}</p>

        {/* ❶ プロンプトをコピー */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-700">❶ プロンプトをコピーする</h3>
            <button onClick={() => copy(prompt, 'prompt')} className="btn-accent btn-sm">
              {copied === 'prompt' ? '✓ コピーしました' : '📋 プロンプトをコピー'}
            </button>
          </div>
          {copied === 'manual' && (
            <p className="text-xs text-amber-700 mb-2">
              自動コピーできませんでした。下の枠の中を選択して手動でコピーしてください。
            </p>
          )}
          <textarea
            readOnly
            value={prompt}
            onFocus={e => e.target.select()}
            className="w-full h-32 text-[11px] font-mono border border-gray-200 rounded-lg p-2 bg-gray-50 text-gray-600"
          />
        </div>

        {/* ❷ AIに貼る */}
        <div className="mb-5">
          <h3 className="text-sm font-bold text-gray-700 mb-2">❷ お使いのAIに貼り付ける</h3>
          <div className="flex flex-wrap gap-2">
            {AI_CHAT_LINKS.map(link => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary btn-sm"
              >
                {link.label}を開く ↗
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            APIキーは不要です。無料プランのチャットでも使えます。
          </p>
        </div>

        {/* ❸ 回答を貼り戻す */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">❸ AIの回答をここに貼り付ける</h3>
          <textarea
            value={pasted}
            onChange={e => { setPasted(e.target.value); setError(''); }}
            placeholder={'AIの回答をそのまま貼り付けてください。\n説明文が混ざっていても取り込めます。'}
            className="w-full h-32 text-xs border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700 mb-2">{error}</p>
            <button onClick={() => copy(buildRepairPrompt(pasted), 'repair')} className="btn-secondary btn-sm">
              {copied === 'repair' ? '✓ コピーしました' : '🔧 修正をお願いするプロンプトをコピー'}
            </button>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary btn-sm">キャンセル</button>
          <button onClick={apply} disabled={!pasted.trim()} className="btn-accent btn-sm disabled:opacity-40">
            {meta.applyLabel || '取り込む'}
          </button>
        </div>
      </div>
    </div>
  );
}
