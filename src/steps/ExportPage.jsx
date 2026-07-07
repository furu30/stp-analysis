import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { exportToWord } from '../utils/exportWord';
import { exportToHtmlReport } from '../utils/exportHtml';
import AICommentBox from '../components/AICommentBox';
import ActionPlanSection from '../components/ActionPlanSection';

export default function ExportPage({ onBack }) {
  const { project } = useProject();
  const [exporting, setExporting] = useState('');

  const handleExport = async (type) => {
    setExporting(type);
    try {
      if (type === 'word') await exportToWord(project);
      else if (type === 'html') exportToHtmlReport(project);
    } catch (e) {
      const messages = {
        word: 'Word出力に失敗しました',
        html: 'HTMLレポート出力に失敗しました',
      };
      alert(`${messages[type] || '出力エラー'}: ${e.message}\n\n対処法:\n・ブラウザを再読み込みして再試行\n・データが正しく入力されているか確認`);
    } finally {
      setExporting('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
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

      {/* まとめ→実行計画→出力 の順で「明日から動ける」状態に落とし込む */}
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

      <div className="mt-6">
        <ActionPlanSection />
      </div>

      <div className="card mb-6">
        <h2 className="section-title">出力</h2>
        <p className="text-sm text-gray-500 mb-6">
          STP分析の結果を各種形式で出力します。用途に応じて出力形式を選択してください。
          アクションプランを入力しておくと、レポートの最終章「実行計画」として出力されます。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Word */}
          <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 transition-colors">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-bold text-gray-800 mb-1">Word</h3>
            <p className="text-xs text-gray-500 mb-3">
              提案書・報告書として使用可能。SWOT分析・クロス戦略・AIコメントまで全セクションを含む完全版。
            </p>
            <button
              onClick={() => handleExport('word')}
              disabled={exporting === 'word'}
              className="btn-primary w-full justify-center"
            >
              {exporting === 'word' ? '⏳ 出力中...' : '📝 Word'}
            </button>
          </div>

          {/* HTML */}
          <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-400 transition-colors">
            <div className="text-3xl mb-3">🌐</div>
            <h3 className="font-bold text-gray-800 mb-1">HTML</h3>
            <p className="text-xs text-gray-500 mb-3">
              ブラウザで表示→印刷でPDF化。SVGグラフ付き。社内共有・画面確認用。
            </p>
            <button
              onClick={() => handleExport('html')}
              disabled={exporting === 'html'}
              className="btn-primary w-full justify-center"
            >
              {exporting === 'html' ? '⏳ 出力中...' : '🌐 HTML'}
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-bold text-gray-600 mb-2">出力形式の使い分け</h4>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>・<strong>Word</strong>：提案書として製本・送付したいとき。社内稟議書への添付にも。</li>
            <li>・<strong>HTML</strong>：ブラウザで表示。SVGグラフ付きでビジュアル確認や印刷／PDF化（ブラウザの「印刷→PDFとして保存」）に対応。</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 flex justify-start">
        <button onClick={onBack} className="btn-secondary">← 前のステップ</button>
      </div>
    </div>
  );
}
