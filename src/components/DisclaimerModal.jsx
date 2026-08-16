const DISCLAIMER_KEY = 'stp_disclaimer_agreed_v1';

/** 免責・データ保存に関する注意を初回に表示済みか */
export function hasAgreedDisclaimer() {
  try {
    return !!localStorage.getItem(DISCLAIMER_KEY);
  } catch {
    return false;
  }
}

/**
 * ご利用にあたっての注意（免責）モーダル
 * 初回起動時に1度だけ表示し、同意をlocalStorageに記録する。
 * 第三者（モニター利用者等）への配布を想定した最低限の注意喚起。
 */
export default function DisclaimerModal({ onAgree }) {
  const handleAgree = () => {
    try { localStorage.setItem(DISCLAIMER_KEY, new Date().toISOString()); } catch { /* 保存不可でも続行 */ }
    onAgree();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">ご利用にあたっての注意</h2>
        <p className="text-xs text-gray-500 mb-4">はじめに以下の3点をご確認ください。</p>

        <div className="space-y-3 mb-6">
          <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-xl shrink-0">💾</span>
            <div>
              <p className="text-sm font-bold text-blue-800">データはこのブラウザ内にのみ保存されます</p>
              <p className="text-xs text-blue-700 mt-1">
                サーバーには送信されません。その代わり、ブラウザの変更・キャッシュクリアでデータは消えます。
                重要な分析はヘッダーの「💾 保存」でファイルとして手元に保管してください。
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-xl shrink-0">🤖</span>
            <div>
              <p className="text-sm font-bold text-amber-800">AIの出力は参考情報です</p>
              <p className="text-xs text-amber-700 mt-1">
                AIコメント・AIリサーチの内容は分析のたたき台であり、正確性を保証するものではありません。
                診断・助言・経営判断の最終責任は利用者ご自身にあります。
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <span className="text-xl shrink-0">📋</span>
            <div>
              <p className="text-sm font-bold text-gray-800">AI機能はプロンプトのコピー＆貼り戻しで動作します</p>
              <p className="text-xs text-gray-600 mt-1">
                本アプリが外部のAIサービスへデータを送信することはありません。
                プロンプトをどのAIに貼り付けるかは利用者ご自身の判断となり、
                貼り付け先のサービスの利用規約・データ取扱いは利用者ご自身でご確認ください。
              </p>
            </div>
          </div>
        </div>

        <button onClick={handleAgree} className="btn-primary w-full justify-center">
          確認して利用を開始する
        </button>
      </div>
    </div>
  );
}
