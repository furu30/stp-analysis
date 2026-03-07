import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { exportToExcel } from '../utils/exportExcel';
import { exportToWord } from '../utils/exportWord';
import { exportToHtmlReport } from '../utils/exportHtml';
import AICommentBox from '../components/AICommentBox';

export default function ExportPage({ onBack }) {
  const { project } = useProject();
  const [exporting, setExporting] = useState('');

  const handleExport = async (type) => {
    setExporting(type);
    try {
      if (type === 'excel') exportToExcel(project);
      else if (type === 'word') await exportToWord(project);
      else if (type === 'html') exportToHtmlReport(project);
    } catch (e) {
      alert(`出力エラー: ${e.message}`);
    } finally {
      setExporting('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h2 className="section-title">出力</h2>
        <p className="text-sm text-gray-500 mb-6">
          STP分析の結果を各種形式で出力します。用途に応じて出力形式を選択してください。
        </p>

        <div className="grid grid-cols-3 gap-4">
          {/* Excel */}
          <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-green-400 transition-colors">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold text-gray-800 mb-1">Excelシート出力</h3>
            <p className="text-xs text-gray-500 mb-3">
              4シート構成（強み棚卸・セグメント・ターゲティング・ポジショニング）。数値データの確認・修正に最適。
            </p>
            <button
              onClick={() => handleExport('excel')}
              disabled={exporting === 'excel'}
              className="btn-primary w-full justify-center"
            >
              {exporting === 'excel' ? '⏳ 出力中...' : '📊 Excelで出力'}
            </button>
          </div>

          {/* Word */}
          <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 transition-colors">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-bold text-gray-800 mb-1">Word文書出力</h3>
            <p className="text-xs text-gray-500 mb-3">
              提案書・報告書として使用可能。表紙・目次・全セクションを構造化。AIコメントも含む。
            </p>
            <button
              onClick={() => handleExport('word')}
              disabled={exporting === 'word'}
              className="btn-primary w-full justify-center"
            >
              {exporting === 'word' ? '⏳ 出力中...' : '📝 Wordで出力'}
            </button>
          </div>

          {/* HTML */}
          <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-400 transition-colors">
            <div className="text-3xl mb-3">🌐</div>
            <h3 className="font-bold text-gray-800 mb-1">HTMLレポート出力</h3>
            <p className="text-xs text-gray-500 mb-3">
              新しいタブでレポートを表示。ブラウザの「印刷→PDF保存」でPDF化可能。グラフはSVGで高品質。
            </p>
            <button
              onClick={() => handleExport('html')}
              disabled={exporting === 'html'}
              className="btn-primary w-full justify-center"
            >
              {exporting === 'html' ? '⏳ 出力中...' : '🌐 レポートを出力'}
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-bold text-gray-600 mb-2">出力形式の使い分け</h4>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>・<strong>Excel</strong>：数値データをクライアントと一緒に確認・修正したいとき</li>
            <li>・<strong>Word</strong>：提案書として製本・送付したいとき。社内稟議書・議事録への添付にも対応</li>
            <li>・<strong>HTML/PDF</strong>：グラフを高品質で印刷したいとき。プロジェクター投影やメール添付に最適</li>
          </ul>
        </div>
      </div>

      {/* Step 3 skipped notice */}
      {project.step3.skipped && (
        <div className="card mb-6 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <span className="text-xl">ℹ️</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">Step 3（ポジショニング）はスキップされました</p>
              <p className="text-xs text-amber-700 mt-1">
                出力にポジショニング分析セクションは含まれません。必要に応じて
                <button onClick={onBack} className="text-primary underline cursor-pointer mx-1 font-bold">
                  ポジショニングに戻って
                </button>
                入力できます。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overall strategy AI comment */}
      <AICommentBox
        commentKey="overallStrategy"
        inputData={{
          settings: project.settings,
          step0: project.step0,
          step1: project.step1,
          step2: project.step2,
          step3: project.step3.skipped ? { skipped: true } : project.step3,
        }}
        label="💡 総合戦略コメント（AIコメント - 報告書用エグゼクティブサマリー）"
      />

      <div className="mt-6 flex justify-start">
        <button onClick={onBack} className="btn-secondary">← 前のステップ</button>
      </div>
    </div>
  );
}
