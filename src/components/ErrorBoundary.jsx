import { Component } from 'react';

const STORAGE_KEY = 'stpAnalysisProject_v1';

/**
 * 描画中の例外でアプリ全体が白画面になるのを防ぐ（課題C-01）。
 *
 * このアプリは state を localStorage に自動保存するため、壊れたデータで例外が出ると
 * 「白画面 → リロード → 同じ壊れたデータを読んでまた白画面」の無限ループに陥り、
 * ユーザーは自力で復帰できない。そのため、フォールバックでは必ず
 *   ・作業内容をJSONで手元に退避する
 *   ・ローカルデータを破棄してやり直す
 * の2つを提供する。
 *
 * ProjectProvider の「内側」に置くこと。Provider 自体が落ちた場合でも
 * localStorage から直接読むため、Context に依存しない実装にしてある。
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // 開発時の調査用。ユーザーには下のフォールバックUIで案内する
    console.error('画面の描画中にエラーが発生しました:', error, info);
  }

  /** 壊れている可能性はあるが、ユーザーの作業内容そのものなので必ず退避手段を残す */
  handleDownload = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        alert('保存データが見つかりませんでした。');
        return;
      }
      const blob = new Blob([raw], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `戦略コンパス_復旧用データ_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.stp.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      alert('データの取り出しに失敗しました。');
    }
  };

  handleDiscard = () => {
    if (!window.confirm('このブラウザに保存されている分析データを削除して、最初からやり直します。よろしいですか？\n（先に「JSONでダウンロード」しておくと、あとで読み込み直せる場合があります）')) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* 削除できなくてもリロードは試みる */ }
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
          <h1 className="text-lg font-bold text-gray-800 mb-2">⚠️ 画面の表示中に問題が発生しました</h1>
          <p className="text-sm text-gray-600 mb-4">
            申し訳ありません。分析データの一部が読み取れず、画面を表示できませんでした。
            <strong className="text-gray-800">作業内容はこのブラウザに残っています。</strong>
            まず「JSONでダウンロード」で手元に退避してから、やり直してください。
          </p>

          <div className="flex flex-col gap-2 mb-4">
            <button onClick={this.handleDownload} className="btn-primary w-full justify-center">
              💾 作業内容をJSONでダウンロード
            </button>
            <button onClick={() => window.location.reload()} className="btn-secondary w-full justify-center">
              🔄 もう一度読み込む
            </button>
            <button
              onClick={this.handleDiscard}
              className="btn w-full justify-center bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
            >
              🗑 ローカルデータを破棄してやり直す
            </button>
          </div>

          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer">技術的な詳細（サポートに伝える場合）</summary>
            <pre className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 overflow-x-auto whitespace-pre-wrap">
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
