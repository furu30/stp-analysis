import { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { PHASES, buildPhasePrompt, applyPhaseResult } from '../utils/aiResearchService';
import { AI_CHAT_LINKS, buildRepairPrompt } from '../utils/aiPrompt';

/**
 * AI企業リサーチ モーダル（プロンプト配布方式・課題M-01）
 *
 * APIは叩かない。フェーズごとに ❶プロンプトをコピー → ❷AIに貼る → ❸回答を貼り戻す
 * を繰り返す。取り込んだ時点でプロジェクトに反映されるため、途中で閉じても
 * 次に開いたときに続きのフェーズから再開できる。
 */
export default function AIResearchModal({ onClose, onComplete }) {
  const { project, dispatch } = useProject();
  const s = project.settings;

  // 'input'（企業情報の入力） | 'phase'（フェーズ実行中） | 'done'
  const [stage, setStage] = useState('input');
  const [companyName, setCompanyName] = useState(s.companyName || '');
  const [productService, setProductService] = useState(s.productService || '');
  const [businessDescription, setBusinessDescription] = useState(s.businessDescription || '');
  const [marketType, setMarketType] = useState(s.marketType || 'btob');

  const [currentPhase, setCurrentPhase] = useState(1);
  const [completedPhases, setCompletedPhases] = useState([]);
  const [phaseSummaries, setPhaseSummaries] = useState({});

  const [pasted, setPasted] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  // 前フェーズの結果はプロジェクト本体から読む（＝閉じても再開できる）
  const hasTop5 = (project.step0?.top5 || []).length > 0;
  const hasSegments = (project.step1?.selectedAxes || []).length > 0;
  const phaseReady = { 1: true, 2: hasTop5, 3: hasSegments };

  const prompt = useMemo(() => {
    if (stage !== 'phase') return '';
    try {
      return buildPhasePrompt(currentPhase, {
        companyName,
        productService: [productService, businessDescription].filter(Boolean).join('\n'),
        marketType,
        top5: project.step0?.top5,
        step1: project.step1,
      });
    } catch (e) {
      return `プロンプトを組み立てられませんでした: ${e.message}`;
    }
  }, [stage, currentPhase, companyName, productService, businessDescription, marketType, project.step0, project.step1]);

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      setCopied('manual');
    }
  };

  // 企業情報を確定してPhase 1へ
  const startResearch = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { companyName, productService, businessDescription, marketType } });
    setStage('phase');
    setCurrentPhase(1);
    setCompletedPhases([]);
    setPhaseSummaries({});
    setPasted('');
    setError('');
  };

  // 貼り戻された回答を取り込む
  const applyPasted = () => {
    setError('');
    let result;
    try {
      result = applyPhaseResult(currentPhase, pasted, { marketType, step1: project.step1 });
    } catch (e) {
      setError(e.message);
      return;
    }

    switch (currentPhase) {
      case 1:
        dispatch({ type: 'UPDATE_SETTINGS', payload: { marketType: result.marketType } });
        dispatch({ type: 'UPDATE_STEP0', payload: result.step0 });
        setPhaseSummaries(prev => ({
          ...prev,
          1: `Top5を含む${result.step0.categories.reduce((n, c) => n + c.items.filter(i => i.strength).length, 0)}項目を取り込み`,
        }));
        break;
      case 2: {
        dispatch({ type: 'UPDATE_STEP1', payload: result.step1 });
        const axCnt = result.step1.selectedAxes?.length || 0;
        const segCnt = Object.values(result.step1.segments || {}).reduce((n, arr) => n + arr.length, 0);
        setPhaseSummaries(prev => ({ ...prev, 2: `${axCnt}軸・${segCnt}セグメントを取り込み` }));
        break;
      }
      case 3: {
        dispatch({ type: 'UPDATE_STEP2', payload: result.step2 });
        dispatch({ type: 'UPDATE_STEP3', payload: result.step3 });
        const candCnt = result.step2.candidates?.length || 0;
        const mainCnt = Object.values(result.step2.targets || {}).filter(t => t.label === 'main').length;
        const compCnt = result.step3.competitors?.length || 0;
        setPhaseSummaries(prev => ({ ...prev, 3: `ターゲット候補${candCnt}件（うちメイン${mainCnt}件）、競合${compCnt}社を取り込み` }));
        break;
      }
    }

    setCompletedPhases(prev => (prev.includes(currentPhase) ? prev : [...prev, currentPhase]));
    setPasted('');
    if (currentPhase < PHASES.length) setCurrentPhase(currentPhase + 1);
    else setStage('done');
  };

  const phaseIcon = (id) => {
    if (completedPhases.includes(id)) return '✅';
    if (currentPhase === id && stage === 'phase') return '▶';
    return '○';
  };

  const phase = PHASES.find(p => p.id === currentPhase);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-gray-800">
            {stage === 'input' && '🔍 AI企業リサーチ'}
            {stage === 'phase' && `🔍 Phase ${currentPhase} / ${PHASES.length}：${phase?.name}`}
            {stage === 'done' && '✅ リサーチ完了'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">✕</button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          {/* --- 入力フォーム --- */}
          {stage === 'input' && (
            <>
              <p className="text-sm text-gray-500 mb-4">
                企業名と事業内容をもとに、STP分析のドラフトを作るプロンプトを3回に分けて用意します。
                お使いのAIに貼り付けて、返ってきた回答をこの画面に貼り戻してください。
                <strong className="text-gray-700">APIキーは不要です。</strong>
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
                  <label className="label-text">製品・サービス名</label>
                  <input
                    type="text"
                    className="input-field"
                    value={productService}
                    onChange={(e) => setProductService(e.target.value)}
                    placeholder="例：精密切削工具（エンドミル・ドリル・リーマ等）"
                  />
                </div>
                <div>
                  <label className="label-text">事業内容・特徴 <span className="text-danger">*</span></label>
                  <textarea
                    className="textarea-field min-h-[100px]"
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    placeholder="例：創業50年の精密切削工具メーカー。超硬合金・ハイス鋼を素材とするエンドミル・ドリル・リーマの製造に特化。5軸CNC研削盤による微細加工技術と、1本からの特注対応が強み。主要顧客は航空宇宙・半導体・自動車部品メーカー。従業員45名、年商8億円。"
                  />
                  <p className="text-xs text-gray-400 mt-1">詳しく書くほどAIの分析精度が上がります（200〜500字程度推奨）</p>
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
                  ⚠️ 取り込んだフェーズのデータは既存のプロジェクトデータを上書きします。重要なデータがある場合は先に保存してください。
                </p>
              </div>
            </>
          )}

          {/* --- フェーズ実行 --- */}
          {stage === 'phase' && (
            <>
              {/* フェーズの進捗 */}
              <div className="flex gap-2 mb-4">
                {PHASES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setCurrentPhase(p.id); setPasted(''); setError(''); }}
                    disabled={!phaseReady[p.id]}
                    title={phaseReady[p.id] ? '' : `Phase ${p.requires} の取り込みが先に必要です`}
                    className={`flex-1 text-left px-3 py-2 rounded-lg border text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed
                      ${currentPhase === p.id ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <span className="font-bold">{phaseIcon(p.id)} Phase {p.id}</span>
                    <span className="block text-gray-500 mt-0.5">{p.name}</span>
                    {phaseSummaries[p.id] && (
                      <span className="block text-green-600 mt-0.5">{phaseSummaries[p.id]}</span>
                    )}
                  </button>
                ))}
              </div>

              <p className="text-sm text-gray-500 mb-4">{phase?.lead}</p>

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
                  className="w-full h-28 text-[11px] font-mono border border-gray-200 rounded-lg p-2 bg-gray-50 text-gray-600"
                />
              </div>

              {/* ❷ AIに貼る */}
              <div className="mb-5">
                <h3 className="text-sm font-bold text-gray-700 mb-2">❷ お使いのAIに貼り付ける</h3>
                <div className="flex flex-wrap gap-2">
                  {AI_CHAT_LINKS.map(link => (
                    <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
                      {link.label}を開く ↗
                    </a>
                  ))}
                </div>
              </div>

              {/* ❸ 回答を貼り戻す */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2">❸ AIの回答をここに貼り付ける</h3>
                <textarea
                  value={pasted}
                  onChange={e => { setPasted(e.target.value); setError(''); }}
                  placeholder={'AIの回答をそのまま貼り付けてください。\n説明文が混ざっていても取り込めます。'}
                  className="w-full h-28 text-xs border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {error && (
                <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700 mb-2">{error}</p>
                  <button onClick={() => copy(buildRepairPrompt(pasted), 'repair')} className="btn-secondary btn-sm">
                    {copied === 'repair' ? '✓ コピーしました' : '🔧 修正をお願いするプロンプトをコピー'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* --- 完了 --- */}
          {stage === 'done' && (
            <>
              <p className="text-sm text-gray-600 mb-5">STP分析のドラフトが揃いました。</p>
              <div className="space-y-2 mb-5">
                {PHASES.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <span className="text-lg">✅</span>
                    <div>
                      <span className="text-sm font-medium text-green-800">Phase {p.id}: {p.name}</span>
                      {phaseSummaries[p.id] && <p className="text-xs text-green-600">{phaseSummaries[p.id]}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 取り込んだデータはドラフトです。各ステップで内容を確認・修正してください。
                </p>
              </div>
            </>
          )}
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          {stage === 'input' && (
            <>
              <button onClick={onClose} className="btn-secondary">キャンセル</button>
              <button
                onClick={startResearch}
                disabled={!companyName.trim() || (!productService.trim() && !businessDescription.trim())}
                className="btn-primary"
              >
                🔍 プロンプトを作る →
              </button>
            </>
          )}
          {stage === 'phase' && (
            <>
              <button onClick={onClose} className="btn-secondary">中断して閉じる</button>
              <button onClick={applyPasted} disabled={!pasted.trim()} className="btn-primary disabled:opacity-40">
                取り込む{currentPhase < PHASES.length ? ` → Phase ${currentPhase + 1}へ` : ''}
              </button>
            </>
          )}
          {stage === 'done' && (
            <button onClick={() => { onComplete?.(); onClose(); }} className="btn-primary">
              分析を開始する →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
