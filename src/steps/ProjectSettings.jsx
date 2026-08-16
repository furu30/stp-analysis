import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import AIResearchModal from '../components/AIResearchModal';
import HelpTip from '../components/HelpTip';
import { INDUSTRY_TEMPLATES, createFromTemplate } from '../data/industryTemplates';
import { DEMO_LIST, createDemoProject, createDemoProjectFuji, createDemoProjectBakery } from '../data/demoData';

const DEMO_FACTORIES = { createDemoProject, createDemoProjectFuji, createDemoProjectBakery };

export default function ProjectSettings({ onNext, onNavigate }) {
  const { project, dispatch } = useProject();
  const s = project.settings;
  const update = (payload) => dispatch({ type: 'UPDATE_SETTINGS', payload });

  const [showResearch, setShowResearch] = useState(false);
  const [touched, setTouched] = useState({});

  // まだ何も入力していない状態（＝初回ユーザーの可能性が高い）でのみデモCTAを表示
  const isFresh = !s.projectName && !s.companyName;

  const loadDemo = (factoryName) => {
    const factory = DEMO_FACTORIES[factoryName];
    if (factory) dispatch({ type: 'SET_PROJECT', payload: factory() });
  };

  const errors = {};
  if (touched.projectName && !s.projectName) errors.projectName = 'プロジェクト名は必須です';
  if (touched.companyName && !s.companyName) errors.companyName = '自社名を入力すると、ポジショニングマップやレポートで使用されます';

  return (
    <div className="max-w-2xl mx-auto">
      {/* 初回ユーザー向け: 記入例（デモ）への明示的な導線 */}
      {isFresh && (
        <div className="card mb-4 border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">👀</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-800 mb-1">はじめての方へ：まず記入例を見るのがおすすめです</h3>
              <p className="text-xs text-gray-600 mb-3">
                3社の記入済みサンプルを読み込んで、各ステップで「何をどの粒度で書けばよいか」を確認できます。
                内容はいつでも「🔄 リセット」で消せます。
              </p>
              <div className="flex flex-wrap gap-2">
                {DEMO_LIST.map(demo => (
                  <button
                    key={demo.id}
                    onClick={() => loadDemo(demo.factory)}
                    className="btn-secondary btn-sm bg-white"
                  >
                    📋 {demo.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="section-title">プロジェクト設定</h2>
        <p className="text-sm text-gray-500 mb-6">
          STP分析を開始するために、基本情報を入力してください。
        </p>

        <div className="space-y-5">
          <div>
            <label className="label-text">
              プロジェクト名 <span className="text-danger">*</span>
              <HelpTip text="分析プロジェクトを識別する名前です。複数の分析を管理する際に使います。" detail="例：ABC製作所 マーケティング戦略2026" />
            </label>
            <input
              type="text"
              className={`input-field ${errors.projectName ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
              value={s.projectName}
              onChange={(e) => update({ projectName: e.target.value })}
              onBlur={() => setTouched(p => ({ ...p, projectName: true }))}
              placeholder="例：ABC製作所 マーケティング戦略2026"
            />
            {errors.projectName && <p className="text-xs text-red-500 mt-1">{errors.projectName}</p>}
          </div>

          <div>
            <label className="label-text">
              自社名 / ブランド名
              <HelpTip text="ポジショニングマップ・戦略キャンバスで「自社」として表示される名前です。" />
            </label>
            <input
              type="text"
              className="input-field"
              value={s.companyName}
              onChange={(e) => update({ companyName: e.target.value })}
              onBlur={() => setTouched(p => ({ ...p, companyName: true }))}
              placeholder="例：ABC製作所"
            />
            {errors.companyName && <p className="text-xs text-amber-500 mt-1">{errors.companyName}</p>}
          </div>

          <div>
            <label className="label-text">
              対象市場タイプ
              <HelpTip text="BtoB/BtoCでセグメンテーションの切り口とポジショニング軸の初期値が変わります。" detail="後から変更するとセグメント選択がリセットされる場合があります。" />
            </label>
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
            <label className="label-text">
              対象製品・サービス（任意）
              <HelpTip text="主力の製品やサービス名を簡潔に入力してください。" />
            </label>
            <input
              type="text"
              className="input-field"
              value={s.productService}
              onChange={(e) => update({ productService: e.target.value })}
              placeholder="例：精密切削加工部品"
            />
          </div>

          <div>
            <label className="label-text">
              事業内容・特徴
              <HelpTip text="AI企業リサーチの精度に直結します。事業の概要・強み・主要顧客・特徴などを具体的に書くほど、AIが的確な分析ドラフトを生成できます。" detail="200〜500文字程度が目安です。Webサイトの会社概要をコピペしてもOKです。" />
            </label>
            <textarea
              className="textarea-field"
              rows={4}
              value={s.businessDescription || ''}
              onChange={(e) => update({ businessDescription: e.target.value })}
              placeholder="例：創業50年の精密切削工具メーカー。超硬合金・ハイス鋼を素材とするエンドミル・ドリル・リーマの製造に特化。5軸CNC研削盤による微細加工技術と、1本からの特注対応が強み。主要顧客は航空宇宙・半導体・自動車部品メーカー。従業員45名、年商8億円。"
            />
            <p className="text-xs text-gray-400 mt-1">
              AI企業リサーチで使用されます。詳しく書くほど分析精度が上がります。
            </p>
          </div>
        </div>

        {/* 業種別テンプレート */}
        <div className="mt-8">
          <label className="label-text mb-2 block">
            業種テンプレートから始める（任意）
            <HelpTip text="業種を選ぶと、対象市場タイプとセグメンテーションの推奨切り口が自動で設定されます。" />
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {INDUSTRY_TEMPLATES.map(tmpl => (
              <button
                key={tmpl.id}
                onClick={() => {
                  const proj = createFromTemplate(tmpl);
                  // 既存の入力値・設定を保持
                  proj.settings.projectName = s.projectName;
                  proj.settings.companyName = s.companyName;
                  proj.settings.businessDescription = s.businessDescription || '';
                  if (project.customization) proj.customization = project.customization;
                  dispatch({ type: 'SET_PROJECT', payload: proj });
                }}
                className={`p-3 rounded-lg border-2 text-left transition-all cursor-pointer hover:border-blue-300 hover:bg-blue-50
                  ${s.marketType === tmpl.marketType && s.productService === tmpl.preset.productService
                    ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}
              >
                <div className="text-lg mb-1">{tmpl.icon}</div>
                <div className="text-xs font-bold text-gray-700">{tmpl.name}</div>
                <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{tmpl.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* AI企業リサーチ セクション */}
        <div className="mt-8 p-5 border-2 border-dashed border-blue-200 rounded-xl bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-800 mb-1">AI企業リサーチ</h3>
              <p className="text-xs text-gray-500 mb-3">
                企業名と事業内容をもとに、バリューチェーン分析・セグメンテーション・ターゲティング・ポジショニングのドラフトを作るプロンプトを用意します。
                お使いのAI（Claude / ChatGPT / Gemini）に貼り付けて、返ってきた回答をアプリに貼り戻してください。APIキーは不要です。
              </p>
              <button
                onClick={() => setShowResearch(true)}
                className="btn-primary btn-sm"
              >
                🔍 AIリサーチを実行
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-end gap-1">
          <button
            onClick={onNext}
            disabled={!s.projectName}
            className="btn-primary"
          >
            次へ：強み棚卸（Step 0）→
          </button>
          {!s.projectName && (
            <p className="text-xs text-amber-600">プロジェクト名を入力すると次へ進めます</p>
          )}
        </div>
      </div>

      {showResearch && (
        <AIResearchModal
          onClose={() => setShowResearch(false)}
          onComplete={() => {
            setShowResearch(false);
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
