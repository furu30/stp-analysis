import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { generateAIComment } from '../utils/aiService';

export default function AICommentBox({ commentKey, inputData, label }) {
  const { project, dispatch } = useProject();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const comment = project.aiComments[commentKey] || '';

  const handleGenerate = async () => {
    if (!project.aiSettings.apiKey) {
      setError('APIキーが設定されていません。ヘッダーの「AI設定」からAPIキーを入力してください。');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await generateAIComment(commentKey, inputData, project.aiSettings);
      dispatch({ type: 'UPDATE_AI_COMMENTS', payload: { [commentKey]: result } });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (comment && !window.confirm('現在のコメントが上書きされます。再生成しますか？')) return;
    await handleGenerate();
  };

  return (
    <div className="card mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-700">{label}</h3>
        <div className="flex items-center gap-2">
          {!comment ? (
            <button onClick={handleGenerate} disabled={loading} className="btn-primary btn-sm">
              {loading ? '⏳ 生成中...' : '✨ AIコメントを生成'}
            </button>
          ) : (
            <>
              <button onClick={handleRegenerate} disabled={loading} className="btn-secondary btn-sm">
                {loading ? '⏳ 生成中...' : '🔄 再生成'}
              </button>
              <button
                onClick={() => dispatch({ type: 'UPDATE_AI_COMMENTS', payload: { [commentKey]: '' } })}
                className="btn-sm text-gray-400 hover:text-danger cursor-pointer"
              >
                ✕ クリア
              </button>
            </>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-danger mb-2">{error}</p>}
      <textarea
        className="textarea-field min-h-[120px]"
        value={comment}
        onChange={(e) => dispatch({ type: 'UPDATE_AI_COMMENTS', payload: { [commentKey]: e.target.value } })}
        placeholder="AIコメントが生成されるか、直接入力してください..."
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">推奨: 200〜600字</span>
        <span className="text-xs text-gray-400">{comment.length}字</span>
      </div>
    </div>
  );
}
