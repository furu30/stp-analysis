import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import AIResearchModal from '../components/AIResearchModal';

export default function ProjectSettings({ onNext, onNavigate }) {
  const { project, dispatch } = useProject();
  const s = project.settings;
  const update = (payload) => dispatch({ type: 'UPDATE_SETTINGS', payload });

  const [showResearch, setShowResearch] = useState(false);

  const hasApiKey = !!project.aiSettings.apiKey;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="section-title">プロジェクト設定</h2>
        <p className="text-sm text-gray-500 mb-6">
          STP分析を開始するために、基本情報を入力してください。
        </p>

        <div className="space-y-5">
          <div>
            <label className="label-text">プロジェクト名 <span className="text-danger">*</span></label>
            <input
              type="text"
              className="input-field"
              value={s.projectName}
              onChange={(e) => update({ projectName: e.target.value })}
              placeholder="例：ABC製作所 マーケティング戦略2026"
            />
          </div>

          <div>
            <label className="label-text">自社名 / ブランド名</label>
            <input
              type="text"
              className="input-field"
              value={s.companyName}
              onChange={(e) => update({ companyName: e.target.value })}
              placeholder="例：ABC製作所"
            />
            <p className="text-xs text-gray-400 mt-1">ポジショニングマップで「自社」として表示されます</p>
          </div>

          <div>
            <label className="label-text">対象市場タイプ</label>
            <div className="flex gap-4 mt-2">
              {[
                { value: 'btob', label: 'BtoB（企業間取引）', desc: '製造業・商社など企業向けビジネス' },
                { value: 'btoc', label: 'BtoC（消費者向け）', desc: '個人消費者向けビジネス' },
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${s.marketType === opt.value ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input
                    type="radio"
                    name="marketType"
                    value={opt.value}
                    checked={s.marketType === opt.value}
                    onChange={(e) => update({ marketType: e.target.value })}
                    className="sr-only"
                  />
                  <div className="font-semibold text-sm">{opt.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label-text">対象製品・サービス（任意）</label>
            <input
              type="text"
              className="input-field"
              value={s.productService}
              onChange={(e) => update({ productService: e.target.value })}
              placeholder="例：精密切削加工部品"
            />
          </div>
        </div>

        {/* AI企業リサーチ セクション */}
        <div className="mt-8 p-5 border-2 border-dashed border-blue-200 rounded-xl bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-800 mb-1">AI企業リサーチ</h3>
              <p className="text-xs text-gray-500 mb-3">
                企業名と事業内容をもとに、AIがバリューチェーン分析・セグメンテーション・ターゲティング・ポジショニングのドラフトを自動生成します。
              </p>
              {!hasApiKey && (
                <p className="text-xs text-amber-600 mb-3">
                  ⚠️ ヘッダーの「AI設定」からAPIキーを設定してください。
                </p>
              )}
              <button
                onClick={() => setShowResearch(true)}
                disabled={!hasApiKey}
                className="btn-primary btn-sm"
              >
                🔍 AIリサーチを実行
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onNext}
            disabled={!s.projectName}
            className="btn-primary"
          >
            次へ：強み棚卸（Step 0）→
          </button>
        </div>
      </div>

      {showResearch && (
        <AIResearchModal
          onClose={() => setShowResearch(false)}
          onComplete={() => {
            setShowResearch(false);
            // プロジェクト名が空なら企業名で自動設定
            if (!s.projectName && s.companyName) {
              update({ projectName: `${s.companyName} STP分析` });
            }
            onNavigate?.('step0');
          }}
        />
      )}
    </div>
  );
}
