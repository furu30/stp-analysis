import CustomizationPanel from './CustomizationPanel';

/**
 * 設定モーダル
 *
 * かつてはAIプロバイダー・APIキー・モデルの設定を持っていたが、
 * プロンプト配布方式への移行（課題M-01）でAPIキーが不要になったため、
 * 現在はホワイトラベル系のカスタマイズのみを扱う。
 */
export default function SettingsModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">🎨 表示・出力の設定</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">✕</button>
        </div>

        <CustomizationPanel />

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-primary">設定を閉じる</button>
        </div>
      </div>
    </div>
  );
}
