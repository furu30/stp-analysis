import { useState, useEffect, useRef } from 'react';

const SECTIONS = [
  { id: 'overview', label: '概要', icon: '📖' },
  { id: 'quickstart', label: 'クイックスタート', icon: '🚀' },
  { id: 'toolbar', label: 'ツールバーの使い方', icon: '🧰' },
  { id: 'ai-research', label: 'AI企業リサーチ', icon: '🤖' },
  { id: 'step0', label: 'Step 0: 強み棚卸', icon: '💪' },
  { id: 'step1', label: 'Step 1: セグメンテーション', icon: '📊' },
  { id: 'step2', label: 'Step 2: ターゲティング', icon: '🎯' },
  { id: 'step3', label: 'Step 3: ポジショニング', icon: '📍' },
  { id: 'export', label: 'エクスポート', icon: '📄' },
  { id: 'tips', label: '活用のコツ', icon: '💡' },
];

function SectionCard({ id, title, icon, children }) {
  return (
    <section id={id} className="card scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Screenshot({ src, alt, caption }) {
  return (
    <figure className="my-4">
      <img
        src={src}
        alt={alt}
        className="w-full rounded-lg border border-gray-200 shadow-sm"
        loading="lazy"
      />
      {caption && (
        <figcaption className="text-xs text-gray-500 mt-2 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function StepBadge({ number, text }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">
        {number}
      </span>
      <span className="text-sm font-semibold text-gray-700">{text}</span>
    </div>
  );
}

function Tip({ children }) {
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg my-3">
      <p className="text-sm text-blue-700">💡 {children}</p>
    </div>
  );
}

function Warning({ children }) {
  return (
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg my-3">
      <p className="text-sm text-amber-700">⚠️ {children}</p>
    </div>
  );
}

export default function TutorialPage({ onClose }) {
  const [activeSection, setActiveSection] = useState('overview');
  const contentRef = useRef(null);

  // スクロール位置に応じてアクティブセクションを更新
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto" ref={contentRef}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-3xl">📚</span>
          STP分析支援アプリ 使い方ガイド
        </h1>
        <button
          onClick={onClose}
          className="btn-secondary"
        >
          ← アプリに戻る
        </button>
      </div>

      <div className="flex gap-6">
        {/* サイドナビゲーション */}
        <nav className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-4 space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
              目次
            </p>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer
                  ${activeSection === s.id
                    ? 'bg-primary-light text-primary font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
              >
                <span className="mr-1.5">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        {/* メインコンテンツ */}
        <div className="flex-1 space-y-6 min-w-0">

          {/* === 概要 === */}
          <SectionCard id="overview" title="このアプリについて" icon="📖">
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              STP分析支援アプリは、マーケティング戦略の基本フレームワークである
              <strong>STP分析</strong>（Segmentation・Targeting・Positioning）を
              ステップバイステップで進められるツールです。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {[
                { letter: 'S', title: 'セグメンテーション', desc: '市場を細分化して顧客グループを定義' },
                { letter: 'T', title: 'ターゲティング', desc: '最も魅力的なセグメントを選定' },
                { letter: 'P', title: 'ポジショニング', desc: '競合との差別化ポジションを確立' },
              ].map((item) => (
                <div key={item.letter} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="text-2xl font-black text-primary mb-1">{item.letter}</div>
                  <div className="text-sm font-bold text-gray-800 mb-1">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-bold text-gray-700 mb-2">分析の全体フロー</h3>
            <div className="flex items-center gap-1 flex-wrap text-xs mb-3">
              {[
                '⚙️ プロジェクト設定',
                '💪 強み棚卸',
                '📊 セグメンテーション',
                '🎯 ターゲティング',
                '📍 ポジショニング',
                '📄 エクスポート',
              ].map((step, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="px-2 py-1 bg-white border border-gray-200 rounded-md font-medium text-gray-700">
                    {step}
                  </span>
                  {i < 5 && <span className="text-gray-400">→</span>}
                </span>
              ))}
            </div>

            <p className="text-sm text-gray-600">
              各ステップの画面上部にあるナビゲーションバーで、いつでも他のステップに移動できます。
              新しいプロジェクトを始めるときは、ヘッダーの「🔄 リセット」ボタンで初期化できます。
            </p>
          </SectionCard>

          {/* === クイックスタート === */}
          <SectionCard id="quickstart" title="クイックスタート" icon="🚀">
            <p className="text-sm text-gray-600 mb-4">
              初めての方は、以下の流れで体験してみましょう。
            </p>

            <h3 className="text-sm font-bold text-gray-700 mb-3">ステップ①：デモデータで全体を把握</h3>
            <StepBadge number={1} text="ヘッダーの「📋 デモデータ」ボタンをクリック" />
            <StepBadge number={2} text="読み込みたい企業を選択（例：B木工製作所）" />
            <StepBadge number={3} text="各ステップのタブを順に確認し、分析の流れを把握" />

            <Screenshot
              src="/tutorial/settings.png"
              alt="プロジェクト設定ページ"
              caption="デモデータ読み込み後の設定ページ（B木工製作所の例）"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-bold text-gray-700 mb-1">A精密工業</p>
                <p className="text-xs text-gray-500">精密切削工具メーカー（BtoB）</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-bold text-blue-700 mb-1">B木工製作所</p>
                <p className="text-xs text-blue-600">オーダーメイド木工家具（BtoB）</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-bold text-gray-700 mb-1">Cベーカリー</p>
                <p className="text-xs text-gray-500">地域密着型ベーカリー（BtoC）</p>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-700 mb-3 mt-6">ステップ②：リセットして自社の分析を開始</h3>
            <StepBadge number={1} text="ヘッダーの「🔄 リセット」ボタンをクリック" />
            <StepBadge number={2} text="確認ダイアログで「リセットして新規作成」を選択" />
            <StepBadge number={3} text="空の設定ページが表示されるので、自社の情報を入力" />

            <Tip>
              リセットしてもAI設定（APIキー）は保持されるので、再入力は不要です。
            </Tip>
          </SectionCard>

          {/* === ツールバーの使い方 === */}
          <SectionCard id="toolbar" title="ツールバーの使い方" icon="🧰">
            <p className="text-sm text-gray-600 mb-4">
              ヘッダーのツールバーには、分析作業を支援する6つのボタンがあります。
            </p>

            <div className="space-y-3">
              {[
                {
                  btn: '📋 デモデータ',
                  color: 'bg-amber-50 border-amber-200',
                  tagColor: 'bg-amber-500',
                  desc: 'あらかじめ用意された3社分のサンプルデータを読み込みます。各ステップの入力例を確認したいときに便利です。',
                },
                {
                  btn: '💾 保存',
                  color: 'bg-gray-50 border-gray-200',
                  tagColor: 'bg-gray-500',
                  desc: '現在のプロジェクトデータをJSONファイルとしてダウンロードします。作業中のデータを安全に保管できます。',
                },
                {
                  btn: '📂 開く',
                  color: 'bg-gray-50 border-gray-200',
                  tagColor: 'bg-gray-500',
                  desc: '保存済みのJSONファイルを読み込んで、以前の作業を再開します。',
                },
                {
                  btn: '🤖 AI設定',
                  color: 'bg-gray-50 border-gray-200',
                  tagColor: 'bg-gray-500',
                  desc: 'AI企業リサーチやAIコメント生成に使用するAIプロバイダーとAPIキーを設定します。',
                },
                {
                  btn: '📚 使い方',
                  color: 'bg-gray-50 border-gray-200',
                  tagColor: 'bg-gray-500',
                  desc: 'この使い方ガイド（今読んでいるページ）を開きます。',
                },
                {
                  btn: '🔄 リセット',
                  color: 'bg-red-50 border-red-200',
                  tagColor: 'bg-red-500',
                  desc: '全データを初期化して新しいプロジェクトを開始します。確認ダイアログが表示されるため、誤操作の心配はありません。',
                },
              ].map((item) => (
                <div key={item.btn} className={`flex items-start gap-3 p-3 rounded-lg border ${item.color}`}>
                  <span className={`shrink-0 text-xs px-2.5 py-1 rounded-md text-white font-bold ${item.tagColor}`}>
                    {item.btn}
                  </span>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>

            <Warning>
              このアプリはブラウザ上で動作するため、ページをリロードするとデータが消えます。作業中はこまめに「💾 保存」を行いましょう。
            </Warning>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 mt-4">
              <p className="text-xs font-bold text-gray-700 mb-2">おすすめの作業フロー</p>
              <div className="flex items-center gap-1 flex-wrap text-xs">
                {[
                  '📋 デモで体験',
                  '🔄 リセット',
                  '🤖 AI設定',
                  '🔍 AIリサーチ',
                  '✏️ 各ステップ編集',
                  '💾 保存',
                  '📄 エクスポート',
                ].map((step, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="px-2 py-1 bg-white border border-gray-200 rounded-md font-medium text-gray-700">
                      {step}
                    </span>
                    {i < 6 && <span className="text-gray-400">→</span>}
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* === AI企業リサーチ === */}
          <SectionCard id="ai-research" title="AI企業リサーチ" icon="🤖">
            <p className="text-sm text-gray-600 mb-4">
              企業名と事業概要を入力するだけで、AIがSTP分析のドラフトを自動生成します。
              手入力の手間を大幅に削減できます。
            </p>

            <h3 className="text-sm font-bold text-gray-700 mb-3">事前準備：APIキーの設定</h3>
            <StepBadge number={1} text="ヘッダーの「🤖 AI設定」ボタンをクリック" />
            <StepBadge number={2} text="お使いのAIプロバイダーを選択（Claude / GPT / Gemini）" />
            <StepBadge number={3} text="APIキーを入力" />

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 my-4">
              <p className="text-xs font-bold text-gray-700 mb-2">対応プロバイダー</p>
              <div className="flex gap-3">
                {['Claude (Anthropic)', 'GPT (OpenAI)', 'Gemini (Google)'].map((p) => (
                  <span key={p} className="text-xs px-2 py-1 bg-white rounded border border-gray-300 text-gray-600">{p}</span>
                ))}
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-700 mb-3 mt-6">AIリサーチの実行</h3>
            <StepBadge number={1} text="設定ページの「🔍 AIリサーチを実行」ボタンをクリック" />
            <StepBadge number={2} text="企業名と製品・サービス概要を入力" />
            <StepBadge number={3} text="「リサーチ開始」をクリック" />
            <StepBadge number={4} text="4フェーズの分析が自動実行（約40〜70秒）" />

            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 my-4">
              <p className="text-xs font-bold text-gray-700 mb-2">自動生成される内容（4フェーズ）</p>
              <div className="space-y-1.5">
                {[
                  'Phase 1: バリューチェーン分析（強みの棚卸）',
                  'Phase 2: セグメンテーション（軸選択＋セグメント定義）',
                  'Phase 3: ターゲティング＆ポジショニング（評価・競合分析）',
                  'Phase 4: AIコメント生成（戦略コメント4種類）',
                ].map((phase, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-gray-600">{phase}</span>
                  </div>
                ))}
              </div>
            </div>

            <Warning>
              AIリサーチを実行すると既存データが上書きされます。重要なデータがある場合は事前に「保存」してください。
            </Warning>

            <Tip>
              生成されたデータはドラフトです。各ステップで内容を確認・修正して、より精度の高い分析に仕上げてください。
            </Tip>
          </SectionCard>

          {/* === Step 0 === */}
          <SectionCard id="step0" title="Step 0: 強み棚卸（バリューチェーン分析）" icon="💪">
            <p className="text-sm text-gray-600 mb-4">
              ポーターのバリューチェーンモデルに基づく8つのカテゴリで、自社の強みを体系的に洗い出します。
            </p>

            <Screenshot
              src="/tutorial/step0.png"
              alt="Step0 強み棚卸ページ"
              caption="バリューチェーン8カテゴリで強みを整理（B木工製作所の例）"
            />

            <h3 className="text-sm font-bold text-gray-700 mb-3 mt-4">操作方法</h3>
            <StepBadge number={1} text="カテゴリタブ（調達〜マージン管理）を切り替えて各項目を確認" />
            <StepBadge number={2} text="各項目の「強み・特徴」欄に自社の強みを記入" />
            <StepBadge number={3} text="「対外発信」欄に、その強みをどう発信しているか記入" />
            <StepBadge number={4} text="画面下部の「Top5」で特に重要な強みを5つ選定" />

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 my-4">
              <p className="text-xs font-bold text-gray-700 mb-2">8つのバリューチェーンカテゴリ</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['調達', '製造・オペレーション', '出荷物流', 'マーケ・販売', 'サービス', '技術開発', '人材管理', 'マージン管理'].map((cat) => (
                  <span key={cat} className="text-xs px-2 py-1.5 bg-white rounded border border-gray-200 text-center text-gray-600">{cat}</span>
                ))}
              </div>
            </div>

            <Tip>
              全項目を埋める必要はありません。強みが明確な項目を中心に記入し、Top5の選定に注力しましょう。
            </Tip>
          </SectionCard>

          {/* === Step 1 === */}
          <SectionCard id="step1" title="Step 1: セグメンテーション" icon="📊">
            <p className="text-sm text-gray-600 mb-4">
              市場を細分化するための「軸」を選択し、各軸に具体的なセグメント（顧客グループ）を定義します。
            </p>

            <Screenshot
              src="/tutorial/step1.png"
              alt="Step1 セグメンテーションページ"
              caption="セグメンテーション軸の選択とセグメント定義（B木工製作所の例）"
            />

            <h3 className="text-sm font-bold text-gray-700 mb-3 mt-4">操作方法</h3>
            <StepBadge number={1} text="左側のリストから分析に使う軸を4〜6個チェック" />
            <StepBadge number={2} text="各軸の優先度（高・中・低）を設定" />
            <StepBadge number={3} text="右側で各軸のセグメント（3〜4個ずつ）を定義" />
            <StepBadge number={4} text="セグメント名と特徴メモを入力" />

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 my-4">
              <p className="text-xs font-bold text-gray-700 mb-2">BtoB向け セグメンテーション軸の例</p>
              <div className="grid grid-cols-2 gap-2">
                {['業種・業態', '企業規模', '地域', '購買行動', '技術レベル', '予算規模'].map((ax) => (
                  <span key={ax} className="text-xs px-2 py-1.5 bg-white rounded border border-gray-200 text-gray-600">{ax}</span>
                ))}
              </div>
            </div>

            <Tip>
              自社の強み（Step 0のTop5）が活かせる軸を優先的に選択すると、効果的なセグメンテーションができます。
            </Tip>
          </SectionCard>

          {/* === Step 2 === */}
          <SectionCard id="step2" title="Step 2: ターゲティング" icon="🎯">
            <p className="text-sm text-gray-600 mb-4">
              定義した各セグメントを6つの評価軸でスコアリングし、メインターゲットとサブターゲットを選定します。
            </p>

            <Screenshot
              src="/tutorial/step2.png"
              alt="Step2 ターゲティングページ"
              caption="セグメント評価スコアリングとターゲット選定（B木工製作所の例）"
            />

            <h3 className="text-sm font-bold text-gray-700 mb-3 mt-4">3ステップの流れ</h3>
            <StepBadge number={1} text="スコアリング：各セグメントを6軸で1〜5点評価" />
            <StepBadge number={2} text="ターゲット選定：メイン/サブ/対象外に分類" />
            <StepBadge number={3} text="ペルソナ定義：メインターゲットの選定理由を記述" />

            <Screenshot
              src="/tutorial/step2-chart.png"
              alt="Step2 評価チャート"
              caption="評価結果はチャートで視覚化され、セグメント間の比較が容易になります"
            />

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 my-4">
              <p className="text-xs font-bold text-gray-700 mb-2">6つの評価軸</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { name: '市場規模', desc: '顧客数・売上ポテンシャル' },
                  { name: '成長性', desc: '今後の市場拡大見込み' },
                  { name: '競合の弱さ', desc: '競合が少ない=高評価' },
                  { name: '自社適合性', desc: '自社の強みとの適合度' },
                  { name: '到達可能性', desc: '顧客へのアクセスしやすさ' },
                  { name: '収益性', desc: '利益率の高さ' },
                ].map((ax) => (
                  <div key={ax.name} className="text-xs px-2 py-1.5 bg-white rounded border border-gray-200">
                    <span className="font-bold text-gray-700">{ax.name}</span>
                    <span className="text-gray-400 ml-1">- {ax.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <Tip>
              メインターゲットは2〜3個、サブターゲットは3〜5個が目安です。すべてのセグメントをターゲットにするのは非推奨です。
            </Tip>
          </SectionCard>

          {/* === Step 3 === */}
          <SectionCard id="step3" title="Step 3: ポジショニング" icon="📍">
            <p className="text-sm text-gray-600 mb-4">
              競合企業を特定し、6つのポジショニング軸で自社と競合を比較。
              ストラテジーキャンバスとポジショニングマップで差別化ポジションを可視化します。
            </p>

            <Screenshot
              src="/tutorial/step3.png"
              alt="Step3 ポジショニングページ"
              caption="ストラテジーキャンバスで競合比較を視覚化（B木工製作所の例）"
            />

            <h3 className="text-sm font-bold text-gray-700 mb-3 mt-4">操作方法</h3>
            <StepBadge number={1} text="競合企業を3〜5社登録（企業名と規模）" />
            <StepBadge number={2} text="6つのポジショニング軸の名前を設定" />
            <StepBadge number={3} text="自社と各競合を1〜10点でスコアリング" />
            <StepBadge number={4} text="ポジショニングマップ（3枚）の軸を選択" />

            <Screenshot
              src="/tutorial/step3-map.png"
              alt="Step3 ポジショニングマップ"
              caption="ポジショニングマップでは、2軸上に自社と競合のポジションをプロット"
            />

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 my-4">
              <p className="text-xs font-bold text-gray-700 mb-2">2種類の可視化</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">ストラテジーキャンバス</p>
                  <p className="text-xs text-gray-500">6軸のレーダーチャートで全社を一覧比較。どの軸で差別化できているか一目で把握</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">ポジショニングマップ</p>
                  <p className="text-xs text-gray-500">2軸のバブルチャートで空白ポジションを発見。3枚まで作成可能</p>
                </div>
              </div>
            </div>

            <Tip>
              競合名は匿名化（例：大手メーカーA）でも実名でも構いません。分析の精度を上げるには具体的な企業名を入れるのが効果的です。
            </Tip>
          </SectionCard>

          {/* === エクスポート === */}
          <SectionCard id="export" title="エクスポート" icon="📄">
            <p className="text-sm text-gray-600 mb-4">
              完成したSTP分析を、提案書や社内資料として活用できる形式でエクスポートします。
            </p>

            <Screenshot
              src="/tutorial/export.png"
              alt="エクスポートページ"
              caption="3つのフォーマットでエクスポート可能"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-bold text-green-700 mb-1">📊 Excel</p>
                <p className="text-xs text-green-600">全データを構造化して出力。データの二次加工や社内報告に最適</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-bold text-blue-700 mb-1">📝 Word</p>
                <p className="text-xs text-blue-600">提案書フォーマットで出力。そのまま顧客向け資料として利用可能</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-bold text-purple-700 mb-1">🌐 HTML</p>
                <p className="text-xs text-purple-600">インタラクティブなレポートとして出力。ブラウザで閲覧・印刷可能</p>
              </div>
            </div>

            <Tip>
              作業途中でもJSON形式でプロジェクトを保存できます（ヘッダーの「💾 保存」ボタン）。後から「📂 開く」で再開できます。
            </Tip>
          </SectionCard>

          {/* === Tips === */}
          <SectionCard id="tips" title="活用のコツ" icon="💡">
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <h3 className="text-sm font-bold text-gray-800 mb-2">1. デモデータ → リセット → 自社分析</h3>
                <p className="text-xs text-gray-600">
                  初めて使う場合は、まずデモデータを読み込んで全ステップを確認しましょう。
                  流れを把握したら「🔄 リセット」で初期化し、自社の分析を始めるのがスムーズです。
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <h3 className="text-sm font-bold text-gray-800 mb-2">2. AI企業リサーチで出発点を作る</h3>
                <p className="text-xs text-gray-600">
                  全て手入力する代わりに、まずAIリサーチでドラフトを生成し、
                  それを叩き台として修正・ブラッシュアップするのが効率的です。
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <h3 className="text-sm font-bold text-gray-800 mb-2">3. Top5の強みが分析の軸になる</h3>
                <p className="text-xs text-gray-600">
                  Step 0で選定するTop5の強みが、以降のセグメンテーション軸選定、
                  ターゲティング評価、ポジショニング軸設計のすべてに影響します。
                  ここに時間をかけることが分析全体の質を左右します。
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <h3 className="text-sm font-bold text-gray-800 mb-2">4. こまめに保存する</h3>
                <p className="text-xs text-gray-600">
                  このアプリはブラウザ上で動作するため、リロードするとデータが消えます。
                  こまめに「💾 保存」ボタンでJSONファイルとして保存してください。
                  保存したファイルは「📂 開く」でいつでも再開できます。
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-xl border border-cyan-100">
                <h3 className="text-sm font-bold text-gray-800 mb-2">5. AIコメントを活用する</h3>
                <p className="text-xs text-gray-600">
                  各ステップの画面下部にある「AIコメント生成」ボタンで、
                  入力データに基づいた戦略コメントを自動生成できます。
                  提案書作成の参考になります。
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 rounded-xl border border-rose-100">
                <h3 className="text-sm font-bold text-gray-800 mb-2">6. 複数プロジェクトを管理する</h3>
                <p className="text-xs text-gray-600">
                  複数の分析プロジェクトを進める場合は、プロジェクトごとに「💾 保存」でファイルを分けて管理しましょう。
                  別のプロジェクトに切り替えるときは、現在のプロジェクトを保存してから「🔄 リセット」または「📂 開く」を使います。
                </p>
              </div>
            </div>
          </SectionCard>

          {/* フッター */}
          <div className="text-center py-8">
            <button
              onClick={onClose}
              className="btn-primary"
            >
              ← アプリに戻って分析を始める
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
