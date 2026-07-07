/** バリューチェーン8区分 */
export const VALUE_CHAIN_CATEGORIES = [
  {
    id: 'vc1', type: '主活動', no: 1, name: '購買物流',
    description: '原材料・部品の調達・入荷・保管・在庫管理',
    items: ['調達力', '在庫管理', 'サプライヤー関係', 'その他']
  },
  {
    id: 'vc2', type: '主活動', no: 2, name: '製造・オペレーション',
    description: '製品の製造・加工・組立・サービスの提供',
    items: ['製造技術', '生産効率', '品質保証', '柔軟性', '設備・機械', 'その他']
  },
  {
    id: 'vc3', type: '主活動', no: 3, name: '出荷物流',
    description: '製品の保管・出荷・配送・納品',
    items: ['配送スピード', '配送品質', '物流ネットワーク', '梱包', 'その他']
  },
  {
    id: 'vc4', type: '主活動', no: 4, name: 'マーケティング・販売',
    description: '市場調査・広告宣伝・営業活動・受注',
    items: ['ブランド力', '営業力', '顧客基盤', '提案力', '価格競争力', 'その他']
  },
  {
    id: 'vc5', type: '主活動', no: 5, name: 'サービス',
    description: 'アフターサービス・メンテナンス・クレーム対応・技術サポート',
    items: ['サポート体制', '対応スピード', '技術サポート', '保証・補償', 'その他']
  },
  {
    id: 'vc6', type: '支援活動', no: 6, name: '企業インフラ',
    description: '経営管理・財務・法務・総務・品質管理',
    items: ['経営理念・ビジョン', '財務基盤', '品質マネジメント', 'コンプライアンス', 'その他']
  },
  {
    id: 'vc7', type: '支援活動', no: 7, name: '人的資源管理',
    description: '採用・教育・研修・評価・労務管理',
    items: ['人材の質', '教育・研修制度', '従業員満足度', '組織文化', 'その他']
  },
  {
    id: 'vc8', type: '支援活動', no: 8, name: '技術開発',
    description: '研究開発・製品開発・工程改善・IT化',
    items: ['研究開発力', '製品開発力', '特許・知的財産', 'IT・DX推進', 'その他']
  }
];

/** BtoB セグメント切り口（16項目） */
export const BTOB_SEGMENTS = [
  { id: 'b2b_1', name: '顧客の業界', feature: '顧客の業界によって、求められる部品の仕様、品質、納期、価格などが異なる', note: '特定の業界に依存しすぎると、その業界の景気動向に業績が左右されるリスクがある' },
  { id: 'b2b_2', name: '顧客の企業規模', feature: '大手企業と中小企業では、発注量や求めるサービスレベル、価格感度などが異なる', note: '大手企業は競争が激しく、中小企業は小回りが利くなどの特徴がある' },
  { id: 'b2b_3', name: '購買行動', feature: '価格重視・品質重視・納期重視・サポート体制重視など、顧客の購買基準は様々', note: '顧客の購買行動は常に変化する可能性があり、定期的な見直しが必要' },
  { id: 'b2b_4', name: '技術レベル', feature: '顧客の技術レベルによって、求めるサポートや技術情報提供のニーズが異なる', note: '顧客の技術レベルを正確に把握し、適切な情報提供を行う必要がある' },
  { id: 'b2b_5', name: '顧客との関係性', feature: '既存顧客と新規顧客では、アプローチ方法や提供する情報が異なる', note: '既存顧客との関係維持を図りつつ、新規顧客の開拓にも注力する必要がある' },
  { id: 'b2b_6', name: '地理的要素', feature: '地域によって、顧客ニーズや競合状況が異なる', note: '広範囲な営業展開には、営業体制の強化や物流システムの整備などが必要' },
  { id: 'b2b_7', name: '製品の特性', feature: '試作品・量産品・カスタム品など、製品特性によって求められる品質や納期が異なる', note: '製品特性に応じた生産体制や品質管理体制を構築する必要がある' },
  { id: 'b2b_8', name: '発注量・頻度', feature: '発注量や頻度によって、顧客のニーズや求めるサービスレベルが異なる', note: '大口顧客と小口顧客のバランスを考慮し、適切な価格設定やサービス提供を行う' },
  { id: 'b2b_9', name: 'ロットサイズ', feature: '極小ロット（1個〜）から多量ロットまで、顧客ニーズによってロットサイズが大きく異なる', note: '対象企業の生産能力・設備によって対応できるロットサイズを見極める' },
  { id: 'b2b_10', name: '設計・開発能力', feature: '顧客の設計・開発能力によって、求めるサポートや技術情報提供のニーズが異なる', note: '顧客の設計・開発能力を把握し、それに応じたサポート体制を構築する' },
  { id: 'b2b_11', name: '調達方針', feature: 'コスト重視・品質重視・国内調達重視など、顧客の調達方針によって提案内容を調整する', note: '顧客の調達方針を把握し、それに合わせた提案を行うことが重要' },
  { id: 'b2b_12', name: '納入先', feature: '最終製品メーカー・商社・一次請け・二次請けなど、顧客のポジションによって求められる要件が異なる', note: '顧客のポジションを把握し、それに合わせた提案やサポートを行う' },
  { id: 'b2b_13', name: '購買意思決定プロセス', feature: '顧客の購買意思決定プロセスを把握し、各段階で適切なアプローチを行う', note: '購買意思決定プロセスは顧客によって異なるため、個別に把握する必要がある' },
  { id: 'b2b_14', name: '情報収集方法', feature: '顧客がどのような手段で情報収集を行うかを把握し、効果的な情報発信を行う', note: 'インターネット・展示会・専門誌など、顧客が利用する情報源を把握する' },
  { id: 'b2b_15', name: '価格感度', feature: '価格に対する顧客の感度を把握し、適切な価格設定を行う', note: '価格感度は顧客や製品によって異なるため、柔軟な価格設定が必要' },
  { id: 'b2b_16', name: '担当者', feature: '顧客企業の担当者の特性（年齢・経験・性格など）を把握し、効果的なコミュニケーションを図る', note: '担当者との良好な人間関係を構築することが長期的な取引につながる' },
];

/** BtoC セグメント切り口（16項目） */
export const BTOC_SEGMENTS = [
  { id: 'b2c_1', name: 'デモグラフィック属性', feature: '年齢・性別・家族構成・居住地・職業・所得水準など、顧客の基本的な属性に基づいてセグメント化', note: '属性だけでは顧客ニーズを捉えきれない場合がある。心理的・行動変数も組み合わせる必要がある' },
  { id: 'b2c_2', name: 'ライフスタイル', feature: '価値観・趣味・嗜好・行動パターンなど、顧客のライフスタイルに基づいてセグメント化', note: 'ライフスタイルは多様化しており、複雑なセグメント化になる可能性がある' },
  { id: 'b2c_3', name: '購買行動', feature: '購買頻度・購買場所・購買金額・情報収集方法など、顧客の購買行動に基づいてセグメント化', note: '購買行動は製品カテゴリや状況によって変化する可能性があるため、定期的な見直しが必要' },
  { id: 'b2c_4', name: 'ベネフィット', feature: '製品・サービスに求めるベネフィット（機能性・価格・デザイン・ブランドイメージなど）でセグメント化', note: '顧客が求めるベネフィットは多様化しており、複数を組み合わせる必要がある場合もある' },
  { id: 'b2c_5', name: '使用状況', feature: '製品・サービスの使用頻度・使用シーン・使用目的など、顧客の使用状況に基づいてセグメント化', note: '使用状況は製品カテゴリやライフスタイルによって変化する可能性がある' },
  { id: 'b2c_6', name: 'メディア接触', feature: '顧客が利用するメディア（テレビ・雑誌・インターネット・SNSなど）に基づいてセグメント化', note: 'メディア接触状況は顧客の年齢やライフスタイルによって変化する可能性がある' },
  { id: 'b2c_7', name: '価格感度', feature: '価格に対する顧客の感度に基づいてセグメント化。適切な価格設定が可能になる', note: '価格感度は製品カテゴリや顧客属性によって異なるため、柔軟な価格設定が必要' },
  { id: 'b2c_8', name: 'ブランドロイヤルティ', feature: 'ブランドに対する顧客の愛着度に基づいてセグメント化', note: 'ブランドロイヤルティは製品・サービスの品質や顧客体験によって変化するため、継続的改善が必要' },
  { id: 'b2c_9', name: '心理的属性', feature: '性格・価値観・態度など、顧客の心理的属性に基づいてセグメント化', note: '心理的属性は測定が難しく、複雑なセグメント化になる可能性がある' },
  { id: 'b2c_10', name: 'ライフステージ', feature: '結婚・出産・子供の成長・退職など、顧客のライフステージに基づいてセグメント化', note: 'ライフステージは時間の経過とともに変化するため、顧客の変化に対応したマーケティング戦略が必要' },
  { id: 'b2c_11', name: '購買チャネル', feature: '実店舗・ECサイト・カタログ通販など、顧客が利用する購買チャネルに基づいてセグメント化', note: '購買チャネルは顧客の利便性や状況によって変化する可能性がある' },
  { id: 'b2c_12', name: '情報感度', feature: '新しい情報に対する顧客の感度に基づいてセグメント化', note: '情報感度は顧客の年齢やライフスタイルによって異なるため、ターゲットに合わせた情報発信が必要' },
  { id: 'b2c_13', name: '地域特性', feature: '地域ごとの文化・風習・気候などを考慮したセグメンテーション', note: '地域特性は製品・サービスによっては重要度が低い場合もある' },
  { id: 'b2c_14', name: 'コミュニティ', feature: '特定の趣味や関心を持つコミュニティに属する顧客をターゲットに', note: 'コミュニティの規模や影響力を把握し、適切なアプローチ方法を選択する必要がある' },
  { id: 'b2c_15', name: '社会貢献意識', feature: '環境問題や社会問題に関心の高い顧客をターゲットに', note: '社会貢献活動は本業との整合性や継続性が重要であり、一過性の活動にならないように注意が必要' },
  { id: 'b2c_16', name: 'テクノロジーへの関心', feature: 'テクノロジーの進化や新製品への関心の度合いによってセグメント化', note: 'テクノロジーへの関心は年齢やライフスタイルによって異なるため、ターゲットに合わせた情報発信・製品開発が必要' },
];

/** ターゲティング評価軸 */
/** ターゲティング評価軸（6R対応）
 * 6R: Realistic Scale / Rate of Growth / Rival / Rank (=自社適合性) / Reach / Response (=収益性)
 */
export const DEFAULT_TARGETING_AXES = [
  { id: 'ta1', name: '市場規模', description: 'そのセグメントの顧客数・売上ポテンシャルはどれくらいか', sixR: 'Realistic Scale' },
  { id: 'ta2', name: '成長性', description: '今後3〜5年でそのセグメントは拡大するか', sixR: 'Rate of Growth' },
  { id: 'ta3', name: '競合の強さ', description: '既存プレーヤーが強く市場参入が難しいか（逆スコア：弱いほど高評価）', sixR: 'Rival' },
  { id: 'ta4', name: '自社適合性', description: '自社の強み・リソース・既存顧客との親和性はどれくらいか', sixR: 'Rank' },
  { id: 'ta5', name: '到達可能性', description: 'そのセグメントに対して効果的にアプローチできるか（営業・販路・コスト面）', sixR: 'Reach' },
  { id: 'ta6', name: '収益性', description: '価格転嫁のしやすさ・粗利率など収益を確保しやすいか', sixR: 'Response' },
];

/** ポジショニング デフォルト軸 */
export const DEFAULT_POSITIONING_AXES_BTOB = [
  '品質・精度', '納期対応力', '価格競争力', 'カスタム対応', '技術サポート', '量産対応力'
];

export const DEFAULT_POSITIONING_AXES_BTOC = [
  'デザイン性', '価格', '耐久性・品質', 'アフターサービス', 'バリエーション', 'ブランド力'
];

/** 初期プロジェクトデータ */
export function createInitialProject() {
  return {
    settings: {
      projectName: '',
      companyName: '',
      marketType: 'btob',
      productService: '',
      businessDescription: '',
    },
    step0: {
      categories: VALUE_CHAIN_CATEGORIES.map(cat => ({
        id: cat.id,
        categoryName: cat.name,
        categoryDescription: cat.description,
        categoryType: cat.type,
        items: cat.items.map((item, idx) => ({
          id: `${cat.id}_${idx}`,
          name: item,
          strength: '',
          communication: '',
          communicationStatus: '',
          isStrengthFlag: false,
          isCustom: false,
        }))
      })),
      top5: [],
      skipped: false,
    },
    step1: {
      selectedAxes: [],
      segments: {},
    },
    step2: {
      // ターゲット候補: セグメントの掛け算で作る顧客像
      candidates: [], // [{ id, name, segments: [{axisId, axisName, segName}], memo }]
      axes: DEFAULT_TARGETING_AXES.map(a => ({ ...a, weight: 'low' })),
      scores: {},   // { candidateId_axisId: 1-5 }
      targets: {},  // { candidateId: { label: 'main'|'sub'|'none', reason } }
    },
    step3: {
      skipped: false,
      kbf: [], // 購買決定要因 Key Buying Factors: [{ id, name, importance }]
      competitors: [],
      axes: [],
      scores: {},
      maps: [
        { id: 'map1', name: 'マップ1', xAxis: '', yAxis: '' },
        { id: 'map2', name: 'マップ2', xAxis: '', yAxis: '' },
        { id: 'map3', name: 'マップ3', xAxis: '', yAxis: '' },
      ],
      quadrantLabels: {},
    },
    swot: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
      crossStrategies: {
        so: '', // 強み×機会
        st: '', // 強み×脅威
        wo: '', // 弱み×機会
        wt: '', // 弱み×脅威
      },
      skipped: false,
    },
    aiComments: {
      strengthSummary: '',
      targetingRationale: '',
      positioningComment: '',
      swotComment: '',
      overallStrategy: '',
    },
    aiSettings: {
      provider: 'claude',
      apiKey: '',
      model: 'claude-sonnet-4-6',
      tone: 'formal',
    },
    customization: {
      theme: 'light', // light / dark
      brandColor: '#2563eb',
      logoUrl: '',
    },
  };
}
