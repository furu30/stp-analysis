import { useState } from 'react';

const STEPS = [
  {
    title: '戦略コンパスへようこそ',
    icon: '🎯',
    content: 'このアプリは、自社の強みを起点に、中小企業の経営戦略を体系的に策定するためのツールです。強み棚卸→STP分析→SWOT・戦略オプションの流れをステップバイステップで進められます。',
    image: null,
  },
  {
    title: 'Step 0: 強みの棚卸',
    icon: '💪',
    content: 'まず、Porterのバリューチェーンに沿って自社の強みを整理します。8つのカテゴリ（購買物流・製造・出荷物流・マーケティング・サービス・インフラ・人材・技術）で強みを洗い出し、Top強み（5〜7件）を選定します。',
    tip: 'AI企業リサーチ機能を使うと、入力を自動生成できます',
  },
  {
    title: 'Step 1-2: セグメンテーション & ターゲティング',
    icon: '📊',
    content: 'BtoB/BtoCに応じた16の切り口から市場を細分化し、6つの評価軸で各セグメントをスコアリング。注力すべきターゲットを選定します。',
    tip: '業種テンプレートを選ぶと、推奨の切り口が自動設定されます',
  },
  {
    title: 'Step 3 & SWOT: 分析を深める',
    icon: '📍',
    content: 'ポジショニングマップで競合との差別化ポイントを可視化。さらにSWOT分析で内部環境・外部環境を整理し、クロスSWOTの4視点から自社に合う戦略オプションを導き出して評価します。',
    tip: 'ポジショニングはBtoB下請け企業の場合スキップ可能です',
  },
  {
    title: '出力: プロフェッショナルな提案書',
    icon: '📄',
    content: 'Excel・Word・HTMLの3形式で出力可能。HTMLはブラウザの「印刷→PDFとして保存」でPDF化できます。',
    tip: 'AIの活用にAPIキーは不要です。プロンプトをコピーしてお使いのAIに貼り、回答を貼り戻すだけです',
  },
];

export default function OnboardingWizard({ onClose }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">{current.icon}</div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{current.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{current.content}</p>
          </div>

          {current.tip && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-blue-700">💡 <strong>ヒント:</strong> {current.tip}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-primary w-6' : i < step ? 'bg-primary/40' : 'bg-gray-200'}`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer px-3 py-1.5">
                スキップ
              </button>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="btn-secondary btn-sm">
                  ← 戻る
                </button>
              )}
              <button
                onClick={() => isLast ? onClose() : setStep(s => s + 1)}
                className="btn-primary btn-sm"
              >
                {isLast ? '始める 🚀' : '次へ →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
