import { useState, useEffect } from 'react';

const FEATURES = [
  { icon: '💪', title: '強み棚卸', desc: 'バリューチェーン分析でTop5を選定' },
  { icon: '📊', title: 'セグメンテーション', desc: '16の切り口で市場を細分化' },
  { icon: '🎯', title: 'ターゲティング', desc: '6軸スコアリングで最適市場を選定' },
  { icon: '📍', title: 'ポジショニング', desc: '競合マップで差別化を可視化' },
  { icon: '🔄', title: 'SWOT分析', desc: 'クロスSWOTで戦略方向性を導出' },
  { icon: '📄', title: '5形式出力', desc: 'Excel・Word・PPTX・PDF・HTML' },
];

const STATS = [
  { value: '12', label: '業種テンプレート' },
  { value: '5', label: '出力形式' },
  { value: '3', label: 'AI対応' },
  { value: '6', label: 'ステップ' },
];

export default function LandingPage({ onStart }) {
  const [visible, setVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setParticlesReady(true), 300);
    const t3 = setTimeout(() => setFeaturesVisible(true), 600);
    const t4 = setTimeout(() => setStatsVisible(true), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const handleStart = () => {
    document.querySelector('.landing-container')?.classList.add('landing-exit');
    setTimeout(onStart, 500);
  };

  return (
    <div className="landing-container fixed inset-0 z-[100] overflow-hidden">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950" />

      {/* アニメーション背景パーティクル */}
      <div className="absolute inset-0 overflow-hidden">
        {particlesReady && Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="landing-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 7}s`,
            }}
          />
        ))}
        {/* グロー背景 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] landing-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] landing-glow-2" />
      </div>

      {/* グリッドパターン */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* メインコンテンツ */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">

        {/* ロゴ・タイトル */}
        <div className={`text-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* アイコンバッジ */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-blue-200 font-medium tracking-wide">Marketing Strategy Tool</span>
          </div>

          {/* メインタイトル */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight leading-tight">
            <span className="landing-text-gradient">STP分析</span>
            <br />
            <span className="text-3xl md:text-5xl font-bold text-blue-200/80">支援アプリ</span>
          </h1>

          {/* サブタイトル */}
          <p className="text-lg md:text-xl text-blue-300/70 max-w-2xl mx-auto mb-4 leading-relaxed font-light">
            中小企業の<span className="text-blue-200 font-medium">マーケティング戦略</span>を
            <br className="hidden md:block" />
            ステップバイステップで策定する
          </p>

          {/* タグライン */}
          <div className="flex items-center justify-center gap-3 text-sm text-blue-400/60 mb-10">
            <span>セグメンテーション</span>
            <span className="w-1 h-1 rounded-full bg-blue-400/40" />
            <span>ターゲティング</span>
            <span className="w-1 h-1 rounded-full bg-blue-400/40" />
            <span>ポジショニング</span>
          </div>

          {/* CTAボタン */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleStart}
              className="landing-cta group relative px-10 py-4 rounded-2xl text-lg font-bold text-white overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
            >
              <span className="relative z-10 flex items-center gap-3">
                分析を始める
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <span className="text-xs text-blue-400/40">ブラウザ上で完結 / 登録不要 / データはローカル保存</span>
          </div>
        </div>

        {/* 統計カード */}
        <div className={`grid grid-cols-4 gap-4 mt-16 max-w-xl w-full transition-all duration-1000 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {STATS.map((stat, i) => (
            <div key={i} className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-black text-white landing-counter" data-target={stat.value}>
                {stat.value}
              </div>
              <div className="text-[10px] md:text-xs text-blue-300/50 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 機能カード */}
        <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 mt-12 max-w-3xl w-full transition-all duration-1000 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="landing-feature-card group p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-default"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
              <h3 className="text-sm font-bold text-white/90 mb-1">{f.title}</h3>
              <p className="text-[10px] text-blue-300/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* フッター */}
        <div className={`mt-16 text-center transition-all duration-1000 delay-500 ${statsVisible ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-xs text-blue-400/20">
            Powered by AI — Claude / GPT / Gemini 対応
          </p>
        </div>
      </div>
    </div>
  );
}
