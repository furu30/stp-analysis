import { useState, useRef, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import { PHASES, runFullResearch } from '../utils/aiResearchService';

/**
 * AI企業リサーチ モーダル
 * 4フェーズでSTP分析ドラフトを自動生成し、プログレスを表示する。
 */
export default function AIResearchModal({ onClose, onComplete }) {
  const { project, dispatch } = useProject();
  const s = project.settings;

  // 状態: 'input' | 'running' | 'done' | 'error'
  const [stage, setStage] = useState('input');
  const [companyName, setCompanyName] = useState(s.companyName || '');
  const [productService, setProductService] = useState(s.productService || '');
  const [marketType, setMarketType] = useState(s.marketType || 'btob');

  // プログレス
  const [currentPhase, setCurrentPhase] = useState(0);
  const [completedPhases, setCompletedPhases] = useState([]);
  const [phaseSummaries, setPhaseSummaries] = useState({});
  const [startTime, setStartTime] = useState(null);

  // エラー
  const [errorMsg, setErrorMsg] = useState('');
  const [errorPhase, setErrorPhase] = useState(0);

  const abortRef = useRef(null);
  const currentPhaseRef = useRef(0);

  // フェーズ完了時の dispatch
  const handlePhaseComplete = useCallback((phaseId, result) => {
    switch (phaseId) {
      case 1:
        dispatch({ type: 'UPDATE_SETTINGS', payload: { marketType: result.marketType } });
        dispatch({ type: 'UPDATE_STEP0', payload: result.step0 });
        setPhaseSummaries(prev => ({ ...prev, 1: `Top5を含む${result.step0.categories.reduce((n, c) => n + c.items.filter(i => i.strength).length, 0)}項目を生成` }));
        break;
      case 2:
        dispatch({ type: 'UPDATE_STEP1', payload: result.step1 });
        {
          const axCnt = result.step1.selectedAxes?.length || 0;
          const segCnt = Object.values(result.step1.segments || {}).reduce((n, arr) => n + arr.length, 0);
          setPhaseSummaries(prev => ({ ...prev, 2: `${axCnt}軸・${segCnt}セグメントを生成` }));
        }
        break;
      case 3:
        dispatch({ type: 'UPDATE_STEP2', payload: result.step2 });
        dispatch({ type: 'UPDATE_STEP3', payload: result.step3 });
        {
          const mainCnt = Object.values(result.step2.targets || {}).filter(t => t.label === 'main').length;
          const compCnt = result.step3.competitors?.length || 0;
          setPhaseSummaries(prev => ({ ...prev, 3: `メイン${mainCnt}セグメント、競合${compCnt}社を分析` }));
        }
        break;
      case 4:
        dispatch({ type: 'UPDATE_AI_COMMENTS', payload: result.aiComments });
        setPhaseSummaries(prev => ({ ...prev, 4: '4種類のコメントを生成' }));
        break;
    }
    setCompletedPhases(prev => [...prev, phaseId]);
  }, [dispatch]);

  // リサーチ実行
  const startResearch = useCallback(async () => {
    // 設定を即反映
    dispatch({ type: 'UPDATE_SETTINGS', payload: { companyName, productService, marketType } });

    setStage('running');
    setCurrentPhase(0);
    setCompletedPhases([]);
    setPhaseSummaries({});
    setStartTime(Date.now());
    setErrorMsg('');
    setErrorPhase(0);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await runFullResearch(
        companyName,
        productService,
        marketType,
        project.aiSettings,
        {
          onPhaseStart: (phaseId) => { currentPhaseRef.current = phaseId; setCurrentPhase(phaseId); },
          onPhaseComplete: handlePhaseComplete,
          onError: () => {},
        },
        controller.signal,
      );
      setStage('done');
    } catch (err) {
      if (err.name === 'AbortError') {
        // キャンセル: 部分結果は保持されている
        setStage('input');
        return;
      }
      setErrorMsg(err.message);
      setErrorPhase(currentPhaseRef.current);
      setStage('error');
    }
  }, [companyName, productService, marketType, project.aiSettings, dispatch, handlePhaseComplete]);

  // キャンセル
  const handleCancel = () => {
    if (abortRef.current) abortRef.current.abort();
    onClose();
  };

  // 完了 → Step0に遷移
  const handleComplete = () => {
    onComplete?.();
    onClose();
  };

  // 推定残り時間
  const estimatedRemaining = () => {
    if (!startTime || completedPhases.length === 0) return '';
    const elapsed = Date.now() - startTime;
    const avgPerPhase = elapsed / completedPhases.length;
    const remaining = Math.round((avgPerPhase * (4 - completedPhases.length)) / 1000);
    return remaining > 0 ? `約${remaining}秒` : 'まもなく完了';
  };

  // フェーズアイコン
  const phaseIcon = (id) => {
    if (completedPhases.includes(id)) return '✅';
    if (currentPhase === id) return '⏳';
    return '○';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => e.target === e.currentTarget && stage !== 'running' && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {stage === 'input' && '🔍 AI企業リサーチ'}
            {stage === 'running' && '🔍 分析中...'}
            {stage === 'done' && '✅ リサーチ完了'}
            {stage === 'error' && '⚠️ エラー発生'}
          </h2>
          {stage !== 'running' && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">✕</button>
          )}
        </div>

        {/* 本体 */}
        <div className="px-6 py-5">
          {/* --- 入力フォーム --- */}
          {stage === 'input' && (
            <>
              <p className="text-sm text-gray-500 mb-4">
                企業名と事業内容をもとに、AIがSTP分析のドラフトを自動生成します。
              </p>

              <div className="space-y-4">
                <div>
                  <label className="label-text">企業名 <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="input-field"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="例：ABC製作所"
                  />
                </div>
                <div>
                  <label className="label-text">製品・サービスの概要 <span className="text-danger">*</span></label>
                  <textarea
                    className="textarea-field min-h-[80px]"
                    value={productService}
                    onChange={(e) => setProductService(e.target.value)}
                    placeholder="例：精密切削工具の製造・販売。エンドミル・ドリル・リーマ等の特注品を中心に、航空宇宙・半導体向けの高精度加工に強み。"
                  />
                </div>
                <div>
                  <label className="label-text">対象市場タイプ</label>
                  <div className="flex gap-3 mt-1">
                    {[
                      { value: 'btob', label: 'BtoB' },
                      { value: 'btoc', label: 'BtoC' },
                    ].map(opt => (
                      <label
                        key={opt.value}
                        className={`flex-1 text-center py-2 px-3 rounded-lg border-2 cursor-pointer text-sm font-semibold transition-all
                          ${marketType === opt.value ? 'border-primary bg-primary-light text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                      >
                        <input type="radio" className="sr-only" value={opt.value} checked={marketType === opt.value} onChange={() => setMarketType(opt.value)} />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  ⚠️ 既存のプロジェクトデータは上書きされます。重要なデータがある場合は先に保存してください。
                </p>
              </div>
            </>
          )}

          {/* --- プログレス表示 --- */}
          {stage === 'running' && (
            <>
              <p className="text-sm text-gray-600 mb-5">
                「{companyName}」を分析しています...
              </p>

              <div className="space-y-3 mb-5">
                {PHASES.map(phase => (
                  <div key={phase.id} className="flex items-center gap-3">
                    <span className="text-lg w-6 text-center">
                      {phaseIcon(phase.id)}
                    </span>
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${
                        completedPhases.includes(phase.id) ? 'text-green-700' :
                        currentPhase === phase.id ? 'text-blue-700' : 'text-gray-400'
                      }`}>
                        Phase {phase.id}: {phase.name}
                      </span>
                      {completedPhases.includes(phase.id) && phaseSummaries[phase.id] && (
                        <p className="text-xs text-green-600 mt-0.5">{phaseSummaries[phase.id]}</p>
                      )}
                    </div>
                    {currentPhase === phase.id && (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                ))}
              </div>

              {/* プログレスバー */}
              <div className="mb-3">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(completedPhases.length / 4) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">{completedPhases.length} / 4 フェーズ完了</span>
                  <span className="text-xs text-gray-400">{estimatedRemaining() && `残り ${estimatedRemaining()}`}</span>
                </div>
              </div>
            </>
          )}

          {/* --- 完了 --- */}
          {stage === 'done' && (
            <>
              <p className="text-sm text-gray-600 mb-5">
                STP分析のドラフトが生成されました。
              </p>

              <div className="space-y-2 mb-5">
                {PHASES.map(phase => (
                  <div key={phase.id} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <span className="text-lg">✅</span>
                    <div>
                      <span className="text-sm font-medium text-green-800">
                        Phase {phase.id}: {phase.name}
                      </span>
                      {phaseSummaries[phase.id] && (
                        <p className="text-xs text-green-600">{phaseSummaries[phase.id]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 生成されたデータはドラフトです。各ステップで内容を確認・修正してください。
                </p>
              </div>
            </>
          )}

          {/* --- エラー --- */}
          {stage === 'error' && (
            <>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-sm text-red-700 font-medium mb-1">
                  Phase {errorPhase} でエラーが発生しました
                </p>
                <p className="text-xs text-red-600">{errorMsg}</p>
              </div>

              {completedPhases.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">完了済みフェーズのデータは保持されています:</p>
                  {completedPhases.map(id => {
                    const phase = PHASES.find(p => p.id === id);
                    return (
                      <div key={id} className="flex items-center gap-2 text-xs text-green-600 mb-1">
                        <span>✅</span> Phase {id}: {phase?.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          {stage === 'input' && (
            <>
              <button onClick={onClose} className="btn-secondary">キャンセル</button>
              <button
                onClick={startResearch}
                disabled={!companyName.trim() || !productService.trim()}
                className="btn-primary"
              >
                🔍 リサーチ開始
              </button>
            </>
          )}
          {stage === 'running' && (
            <button onClick={handleCancel} className="btn-secondary">
              中止
            </button>
          )}
          {stage === 'done' && (
            <button onClick={handleComplete} className="btn-primary">
              分析を開始する →
            </button>
          )}
          {stage === 'error' && (
            <>
              <button onClick={onClose} className="btn-secondary">閉じる</button>
              <button onClick={startResearch} className="btn-primary">
                🔄 再試行
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
