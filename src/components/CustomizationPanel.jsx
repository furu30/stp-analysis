import { useProject } from '../context/ProjectContext';

const COLOR_PRESETS = [
  { name: 'ブルー（デフォルト）', value: '#2563eb' },
  { name: 'インディゴ', value: '#4f46e5' },
  { name: 'エメラルド', value: '#059669' },
  { name: 'アンバー', value: '#d97706' },
  { name: 'ローズ', value: '#e11d48' },
  { name: 'スレート', value: '#475569' },
];

export default function CustomizationPanel() {
  const { project, dispatch } = useProject();
  const c = project.customization || {};

  const update = (payload) => dispatch({ type: 'UPDATE_CUSTOMIZATION', payload });

  return (
    <div className="space-y-5">
      {/* テーマ */}
      <div>
        <label className="label-text mb-2 block">テーマ</label>
        <div className="flex gap-3">
          {[
            { value: 'light', label: '☀️ ライト', desc: '明るい背景' },
            { value: 'dark', label: '🌙 ダーク', desc: '暗い背景' },
          ].map(opt => (
            <label
              key={opt.value}
              className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all text-center
                ${c.theme === opt.value ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <input
                type="radio"
                name="theme"
                value={opt.value}
                checked={c.theme === opt.value}
                onChange={(e) => update({ theme: e.target.value })}
                className="sr-only"
              />
              <div className="font-semibold text-sm">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
            </label>
          ))}
        </div>
      </div>

      {/* ブランドカラー */}
      <div>
        <label className="label-text mb-2 block">ブランドカラー</label>
        <div className="flex items-center gap-3 mb-2">
          <input
            type="color"
            value={c.brandColor || '#2563eb'}
            onChange={(e) => update({ brandColor: e.target.value })}
            className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={c.brandColor || '#2563eb'}
            onChange={(e) => update({ brandColor: e.target.value })}
            className="input-field w-32"
            placeholder="#2563eb"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {COLOR_PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => update({ brandColor: p.value })}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border cursor-pointer transition-all
                ${c.brandColor === p.value ? 'border-gray-400 bg-gray-100' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.value }} />
              {p.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-amber-600 mt-2">
          ⚠️ 現在この色は出力ファイルには反映されません（対応予定）。設定は保存されます。
        </p>
      </div>

      {/* ロゴURL */}
      <div>
        <label className="label-text mb-1 block">ロゴ画像URL（任意）</label>
        <input
          type="text"
          className="input-field"
          value={c.logoUrl || ''}
          onChange={(e) => update({ logoUrl: e.target.value })}
          placeholder="https://example.com/logo.png"
        />
        <p className="text-xs text-amber-600 mt-1">
          ⚠️ 現在このロゴは出力ファイルには反映されません（対応予定）。設定は保存されます。
        </p>
        {c.logoUrl && (
          <div className="mt-2 flex items-center gap-2">
            <img src={c.logoUrl} alt="ロゴプレビュー" className="h-8 object-contain" onError={(e) => e.target.style.display = 'none'} />
            <span className="text-xs text-gray-400">プレビュー</span>
          </div>
        )}
      </div>
    </div>
  );
}
