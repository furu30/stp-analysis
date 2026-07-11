/** 利用可能なデモデータ一覧 */
export const DEMO_LIST = [
  { id: 'seimitsu', label: 'A精密工業（切削工具・BtoB）', factory: 'createDemoProject' },
  { id: 'fuji', label: 'B木工製作所（木工家具・BtoB）', factory: 'createDemoProjectFuji' },
  { id: 'bakery', label: 'Cベーカリー（パン製造直売・BtoC）', factory: 'createDemoProjectBakery' },
];

/**
 * デモデータ: 精密切削工具メーカー（匿名化）
 * モデル企業を参考にした架空データです。
 */
export function createDemoProject() {
  return {
    settings: {
      projectName: 'A精密工業 STP分析',
      companyName: 'A精密工業',
      marketType: 'btob',
      productService: '精密切削工具（エンドミル・ドリル・リーマ等）の製造および再研磨サービス',
      businessDescription: '創業45年の精密切削工具専業メーカー。超硬合金・ハイス鋼を主要素材とし、エンドミル・ドリル・リーマ等の標準品および特注品を製造。最新鋭の5軸CNC工具研削盤を8台保有し、μm単位の超精密研削加工を実現。1本からの試作・特注対応と、独自開発の加工プログラムによる複雑形状の異形工具製造が最大の強み。主要顧客は航空宇宙部品メーカー、半導体製造装置メーカー、自動車Tier1サプライヤー。全品検査体制（3次元測定器・画像測定器完備）により公差±2μm以内の安定品質を保証。再研磨サービスでは工具寿命を最大3倍に延長し、顧客のコスト削減に貢献。従業員48名、年商9.5億円。ISO 9001認証取得。',
    },

    step0: {
      categories: [
        // vc1: 購買物流
        {
          id: 'vc1',
          items: [
            {
              id: 'vc1_0', name: '調達力',
              strength: '超硬合金・ハイス鋼等の高品質工具素材を複数の国内主要メーカーから安定的に調達。20年以上の取引実績に基づく優先供給体制を確立。',
              communication: 'Webサイトに素材調達方針を掲載。商談時に素材の品質証明書を提示。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc1_1', name: '在庫管理',
              strength: '主要グレードの超硬素材を常時ストック。短納期対応のための素材バッファを確保し、受注から製造開始までのリードタイムを最短化。',
              communication: '営業担当が口頭で説明する程度。体系的な発信はできていない。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc1_2', name: 'サプライヤー関係',
              strength: '素材メーカー3社との長期安定取引。新素材の先行サンプル提供を受けられる関係性を構築。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc1_3', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc2: 製造・オペレーション
        {
          id: 'vc2',
          items: [
            {
              id: 'vc2_0', name: '製造技術',
              strength: '最新鋭の5軸CNC工具研削盤を複数台保有し、μm単位の超精密研削加工を実現。独自開発の加工プログラムにより複雑な刃先形状も高精度で再現可能。',
              communication: '技術紹介ページ・展示会出展で加工精度をアピール。サンプル工具の無償提供も実施。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc2_1', name: '生産効率',
              strength: 'コンピューター統合管理による24時間自動運転体制。少人数でも高い生産性を維持し、夜間の無人運転により納期短縮とコスト競争力を両立。',
              communication: '工場見学時に設備を紹介。定量的な生産性データの発信は未実施。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc2_2', name: '品質保証',
              strength: '全品検査体制を確立。3次元測定器・画像測定器・表面粗さ計を駆使し、公差±2μm以内の安定品質を保証。検査成績書を全品添付。',
              communication: '検査成績書の標準添付に加え、Webサイトで品質管理体制を紹介。ISO認証も取得済み。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc2_3', name: '柔軟性',
              strength: '多品種少量生産に強み。1本からの試作対応、特殊形状の異形工具・複合工具の製造が可能。顧客図面からの特注品製作実績が年間500型以上。',
              communication: '特殊工具の事例集をWebサイトと技術カタログに掲載。「1本から対応」を営業資料で訴求。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc2_4', name: '設備・機械',
              strength: '世界トップクラスのCNC工具研削盤メーカーの最新機を導入。3年ごとの計画的設備更新により、常に最先端の加工能力を維持。',
              communication: '設備一覧をWebサイトに掲載。年1回のプレスリリースで設備投資を発信。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc2_5', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc3: 出荷物流
        {
          id: 'vc3',
          items: [
            {
              id: 'vc3_0', name: '配送スピード',
              strength: '関東圏は翌日配送が標準。緊急品は当日出荷の実績あり（年間約50件）。再研磨品は最短3営業日で納品。',
              communication: '営業時に納期目安を口頭で説明。Webサイトでの明示はしていない。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc3_1', name: '配送品質',
              strength: '工具専用の個別ケースと緩衝材を使用した丁寧な梱包。過去3年間の配送トラブルゼロ。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc3_2', name: '物流ネットワーク',
              strength: '主要宅配3社との法人契約。全国翌々日配送に対応。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc3_3', name: '梱包',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc3_4', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc4: マーケティング・販売
        {
          id: 'vc4',
          items: [
            {
              id: 'vc4_0', name: 'ブランド力',
              strength: '業界内での認知度は中程度。技術力の評判は高いが、マーケティング面での発信力に課題あり。',
              communication: '展示会への年2回出展。技術系Webメディアへの記事掲載実績あり。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc4_1', name: '営業力',
              strength: '技術営業チーム4名が顧客の加工現場を訪問し、加工課題を直接ヒアリング。課題解決型の提案営業を実践。',
              communication: '技術営業が直接訪問して提案。オンラインでの発信は少ない。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc4_2', name: '顧客基盤',
              strength: '自動車部品・航空機・半導体装置・金型メーカーを中心に約150社の取引実績。リピート率85%以上。',
              communication: '導入事例を一部Webサイトに掲載。顧客の声は未収集。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc4_3', name: '提案力',
              strength: '顧客の加工条件（被削材・回転数・送り速度等）に最適な工具形状・コーティングを設計提案。テスト加工サービスにより効果を事前検証。年間120件以上の提案実績。',
              communication: '提案書に技術データを添付。成功事例はWebサイトにも掲載。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc4_4', name: '価格競争力',
              strength: '大手メーカーと比較して20-30%のコスト優位性。ただし海外製低価格品との競合では劣位。',
              communication: '見積書での価格提示のみ。コストメリットの体系的な訴求は未実施。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc4_5', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc5: サービス
        {
          id: 'vc5',
          items: [
            {
              id: 'vc5_0', name: 'サポート体制',
              strength: '専門技術者3名による技術相談窓口を設置。電話・メール・オンラインミーティングで対応。',
              communication: 'Webサイトに問い合わせフォームを設置。電話番号を明示。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc5_1', name: '対応スピード',
              strength: '技術的な問い合わせに対して原則24時間以内の初回回答。緊急時は電話で即時対応。',
              communication: '「24時間以内回答」をWebサイトに明記。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc5_2', name: '技術サポート',
              strength: '加工条件の最適化アドバイス、工具選定コンサルティング、トラブルシューティングを無償提供。年間200件以上の技術相談に対応。工具の摩耗分析レポートも作成。',
              communication: '技術サポート内容をWebサイトで紹介。成功事例も掲載。顧客からの紹介が多い。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc5_3', name: '保証・補償',
              strength: '工具の不具合に対する迅速な代替品提供。加工不良が発生した場合の原因分析を無償で実施。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc5_4', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc6: 企業インフラ
        {
          id: 'vc6',
          items: [
            {
              id: 'vc6_0', name: '経営理念・ビジョン',
              strength: '「精密加工技術で製造業の未来を支える」を企業理念に掲げ、技術革新への投資を継続。',
              communication: 'Webサイトに掲載。社内への浸透度は高い。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc6_1', name: '財務基盤',
              strength: '無借金経営を維持。設備投資のための内部留保を確保。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc6_2', name: '品質マネジメント',
              strength: 'ISO 9001:2015認証取得。品質目標の設定と月次レビューを実施。顧客クレーム率0.1%以下を継続達成。',
              communication: 'ISO認証をWebサイト・名刺・カタログに表示。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc6_3', name: 'コンプライアンス',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc6_4', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc7: 人的資源管理
        {
          id: 'vc7',
          items: [
            {
              id: 'vc7_0', name: '人材の質',
              strength: '工具研削歴20年以上の熟練技能者4名を含む製造チーム12名体制。技能検定1級保有者が5名在籍。若手社員へのOJTによる技能伝承を体系的に実施。',
              communication: '技能者紹介をWebサイトに掲載。展示会では熟練技能者がデモ加工を実施。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc7_1', name: '教育・研修制度',
              strength: '毎月の技術勉強会、年2回の外部研修参加、工具メーカーへの技術視察を実施。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc7_2', name: '従業員満足度',
              strength: '従業員定着率90%以上。技能手当・資格手当制度により処遇面でもモチベーションを維持。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc7_3', name: '組織文化',
              strength: 'ものづくりへのこだわりが全社に浸透。改善提案制度により年間50件以上の改善を実現。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc7_4', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc8: 技術開発
        {
          id: 'vc8',
          items: [
            {
              id: 'vc8_0', name: '研究開発力',
              strength: '新素材（CFRP・チタン合金等）対応工具の開発に注力。コーティングメーカーとの共同開発により、高耐久・高性能工具を継続的にリリース。',
              communication: '新製品情報をWebサイト・メールマガジンで発信。技術論文の学会発表実績あり。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc8_1', name: '製品開発力',
              strength: '顧客の加工課題に対応したオーダーメイド工具の設計・開発力。CAD/CAMによる3D設計と加工シミュレーションにより、試作前に性能を予測。',
              communication: '設計プロセスを技術資料で説明。3Dモデルでの事前提案を実施。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc8_2', name: '特許・知的財産',
              strength: '工具形状に関する実用新案を3件保有。ノウハウは社内に蓄積。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc8_3', name: 'IT・DX推進',
              strength: '生産管理システムを自社開発し、受注から出荷までの一元管理を実現。3D CAD/CAMの全面導入。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc8_4', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
      ],

      top5: [
        {
          id: 'vc2_0', name: '製造技術', rank: 1,
          categoryName: '製造・オペレーション', categoryId: 'vc2',
          strength: '最新鋭の5軸CNC工具研削盤を複数台保有し、μm単位の超精密研削加工を実現。独自開発の加工プログラムにより複雑な刃先形状も高精度で再現可能。',
          communication: '技術紹介ページ・展示会出展で加工精度をアピール。サンプル工具の無償提供も実施。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '5軸CNC研削盤と独自プログラムの組み合わせは国内同規模企業では希少。設備投資に加え長年蓄積した加工ノウハウがセットであり、競合による短期間での模倣は困難。超精密加工ニーズを持つ顧客にとって最も直接的な価値を提供する。',
        },
        {
          id: 'vc2_3', name: '柔軟性', rank: 2,
          categoryName: '製造・オペレーション', categoryId: 'vc2',
          strength: '多品種少量生産に強み。1本からの試作対応、特殊形状の異形工具・複合工具の製造が可能。顧客図面からの特注品製作実績が年間500型以上。',
          communication: '特殊工具の事例集をWebサイトと技術カタログに掲載。「1本から対応」を営業資料で訴求。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '大手工具メーカーは量産品に注力しており、1本単位の特注対応は採算面から敬遠する傾向。当社の多品種少量対応力は、大手では満たせないニッチニーズに応える希少な能力。年間500型の実績が裏付け。',
        },
        {
          id: 'vc2_2', name: '品質保証', rank: 3,
          categoryName: '製造・オペレーション', categoryId: 'vc2',
          strength: '全品検査体制を確立。3次元測定器・画像測定器・表面粗さ計を駆使し、公差±2μm以内の安定品質を保証。検査成績書を全品添付。',
          communication: '検査成績書の標準添付に加え、Webサイトで品質管理体制を紹介。ISO認証も取得済み。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '±2μm以内の公差保証は中小規模の工具メーカーとしては突出したレベル。全品検査と検査成績書の標準添付は、航空宇宙・半導体など高品質要求市場への参入障壁を下げる重要な差別化要素。',
        },
        {
          id: 'vc4_3', name: '提案力', rank: 4,
          categoryName: 'マーケティング・販売', categoryId: 'vc4',
          strength: '顧客の加工条件（被削材・回転数・送り速度等）に最適な工具形状・コーティングを設計提案。テスト加工サービスにより効果を事前検証。年間120件以上の提案実績。',
          communication: '提案書に技術データを添付。成功事例はWebサイトにも掲載。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '単なる工具販売ではなく「加工課題の解決」を提案できる能力は、製造現場の生産性向上に直結する顧客価値。テスト加工サービスはリスク低減にもつながり、顧客のスイッチングコストを下げる有効な仕組み。',
        },
        {
          id: 'vc5_2', name: '技術サポート', rank: 5,
          categoryName: 'サービス', categoryId: 'vc5',
          strength: '加工条件の最適化アドバイス、工具選定コンサルティング、トラブルシューティングを無償提供。年間200件以上の技術相談に対応。工具の摩耗分析レポートも作成。',
          communication: '技術サポート内容をWebサイトで紹介。成功事例も掲載。顧客からの紹介が多い。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '工具メーカーとしての技術力を活かした「加工の相談役」としてのポジションは、顧客との長期的な信頼関係構築に不可欠。年間200件の対応実績が顧客ロイヤルティの源泉であり、価格競争に巻き込まれにくい関係性を構築。',
        },
        {
          id: 'vc2_4', name: '設備・機械', rank: 6,
          categoryName: '製造・オペレーション', categoryId: 'vc2',
          strength: '世界トップクラスのCNC工具研削盤メーカーの最新機を導入。3年ごとの計画的設備更新により、常に最先端の加工能力を維持。',
          communication: '設備一覧をWebサイトに掲載。年1回のプレスリリースで設備投資を発信。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '3年ごとの計画的な設備更新は安定した財務基盤があってこそ可能であり、常に最先端の加工能力を保つ体制は同規模企業では模倣が難しい。超精密加工技術を支える物的基盤。',
        },
        {
          id: 'vc7_0', name: '人材の質', rank: 7,
          categoryName: '人的資源管理', categoryId: 'vc7',
          strength: '工具研削歴20年以上の熟練技能者4名を含む製造チーム12名体制。技能検定1級保有者が5名在籍。若手社員へのOJTによる技能伝承を体系的に実施。',
          communication: '技能者紹介をWebサイトに掲載。展示会では熟練技能者がデモ加工を実施。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '設備だけでは超精密加工は実現できず、熟練技能者のノウハウが品質の最終保証となる。技能検定1級5名の体制と体系的なOJTによる技能伝承は、人材面での参入障壁を形成する。',
        },
      ],
      skipped: false,
    },

    step1: {
      selectedAxes: [
        { id: 'b2b_1', name: '顧客の業界', feature: '顧客の業界によって、求められる部品の仕様、品質、納期、価格などが異なる', note: '特定の業界に依存しすぎると、その業界の景気動向に業績が左右されるリスクがある', priority: 'high' },
        { id: 'b2b_2', name: '顧客の企業規模', feature: '大手企業と中小企業では、発注量や求めるサービスレベル、価格感度などが異なる', note: '大手企業は競争が激しく、中小企業は小回りが利くなどの特徴がある', priority: 'medium' },
        { id: 'b2b_7', name: '製品の特性', feature: '試作品・量産品・カスタム品など、製品特性によって求められる品質や納期が異なる', note: '製品特性に応じた生産体制や品質管理体制を構築する必要がある', priority: 'high' },
        { id: 'b2b_9', name: 'ロットサイズ', feature: '極小ロット（1個〜）から多量ロットまで、顧客ニーズによってロットサイズが大きく異なる', note: '対象企業の生産能力・設備によって対応できるロットサイズを見極める', priority: 'high' },
        { id: 'b2b_3', name: '購買行動', feature: '価格重視・品質重視・納期重視・サポート体制重視など、顧客の購買基準は様々', note: '顧客の購買行動は常に変化する可能性があり、定期的な見直しが必要', priority: 'medium' },
      ],
      segments: {
        'b2b_1': [
          { id: 'seg_d01', name: '自動車部品メーカー', memo: '量産用標準工具と試作用特殊工具の両方のニーズ。コスト意識が高く価格交渉が厳しい' },
          { id: 'seg_d02', name: '航空・宇宙関連', memo: '難削材（チタン・インコネル）加工用の高性能工具が必須。品質基準・トレーサビリティ要求が非常に厳しい' },
          { id: 'seg_d03', name: '半導体製造装置', memo: '超精密微細加工用工具のニーズ。高い加工精度要求。市場成長率が高い' },
          { id: 'seg_d04', name: '金型メーカー', memo: '高硬度材（SKD・HPM等）の加工。長寿命・高剛性工具を求める傾向。リピート発注が多い' },
        ],
        'b2b_2': [
          { id: 'seg_d05', name: '大手メーカー（500名超）', memo: '大量定期発注。調達部門による厳格な価格査定。品質認定プロセスが長い' },
          { id: 'seg_d06', name: '中堅メーカー（50-500名）', memo: '多品種少量の発注傾向。技術サポートへのニーズが高い。意思決定が比較的早い' },
          { id: 'seg_d07', name: '小規模工場（50名未満）', memo: '極小ロット・短納期重視。柔軟な対応を重視。技術力にばらつきがあり相談ニーズも高い' },
        ],
        'b2b_7': [
          { id: 'seg_d08', name: '標準工具（カタログ品）', memo: '汎用エンドミル・ドリル・リーマ。価格競争が激しい。大手メーカーが強い領域' },
          { id: 'seg_d09', name: '特殊・異形工具（特注品）', memo: '顧客図面に基づく特注設計。高付加価値だが設計工数がかかる。競合が少ない' },
          { id: 'seg_d10', name: '再研磨サービス', memo: '使用済み工具の切れ味復元。新品比60-70%のコストで同等性能。環境意識の高い企業に訴求' },
        ],
        'b2b_9': [
          { id: 'seg_d11', name: '極小ロット（1-10本）', memo: '試作・テスト用。短納期重視。単価は高くても対応してほしい層' },
          { id: 'seg_d12', name: '中ロット（10-100本）', memo: '定期的な生産用発注。品質安定性と適正価格のバランスを重視' },
          { id: 'seg_d13', name: '量産ロット（100本超）', memo: '大量生産ライン用。コスト最優先。自動化ラインへの安定供給が必須' },
        ],
        'b2b_3': [
          { id: 'seg_d14', name: '品質最優先型', memo: '加工精度・工具寿命・表面品位を最重視。多少高くても高品質を選ぶ' },
          { id: 'seg_d15', name: 'コスト最優先型', memo: '価格を最重視。再研磨を積極利用。海外製品も検討する層' },
          { id: 'seg_d16', name: 'パートナーシップ型', memo: '技術サポートと信頼関係を重視。工具だけでなく加工ノウハウも求める' },
        ],
      },
    },

    step2: {
      candidates: [
        {
          id: 'tc_a1', name: '航空・宇宙関連×特殊・異形工具（特注品）×極小ロット（1-10本）×品質最優先型',
          segments: [
            { axisId: 'b2b_1', axisName: '顧客の業界', segName: '航空・宇宙関連' },
            { axisId: 'b2b_7', axisName: '製品の特性', segName: '特殊・異形工具（特注品）' },
            { axisId: 'b2b_9', axisName: 'ロットサイズ', segName: '極小ロット（1-10本）' },
            { axisId: 'b2b_3', axisName: '購買行動', segName: '品質最優先型' },
          ],
          memo: '難削材加工向け高性能特注工具。品質認定が参入障壁となり長期的関係構築が可能。',
        },
        {
          id: 'tc_a2', name: '半導体製造装置×特殊・異形工具（特注品）×中ロット（10-100本）×品質最優先型',
          segments: [
            { axisId: 'b2b_1', axisName: '顧客の業界', segName: '半導体製造装置' },
            { axisId: 'b2b_7', axisName: '製品の特性', segName: '特殊・異形工具（特注品）' },
            { axisId: 'b2b_9', axisName: 'ロットサイズ', segName: '中ロット（10-100本）' },
            { axisId: 'b2b_3', axisName: '購買行動', segName: '品質最優先型' },
          ],
          memo: '半導体市場の成長に伴い需要拡大中。超精密加工技術が活きる。',
        },
        {
          id: 'tc_a3', name: '中堅メーカー（50-500名）×特殊・異形工具（特注品）×極小ロット（1-10本）×パートナーシップ型',
          segments: [
            { axisId: 'b2b_2', axisName: '顧客の企業規模', segName: '中堅メーカー（50-500名）' },
            { axisId: 'b2b_7', axisName: '製品の特性', segName: '特殊・異形工具（特注品）' },
            { axisId: 'b2b_9', axisName: 'ロットサイズ', segName: '極小ロット（1-10本）' },
            { axisId: 'b2b_3', axisName: '購買行動', segName: 'パートナーシップ型' },
          ],
          memo: '技術相談から入れる関係性。意思決定が早く、営業効率が良い。',
        },
        {
          id: 'tc_a4', name: '自動車部品メーカー×標準工具（カタログ品）×量産ロット（100本超）×コスト最優先型',
          segments: [
            { axisId: 'b2b_1', axisName: '顧客の業界', segName: '自動車部品メーカー' },
            { axisId: 'b2b_7', axisName: '製品の特性', segName: '標準工具（カタログ品）' },
            { axisId: 'b2b_9', axisName: 'ロットサイズ', segName: '量産ロット（100本超）' },
            { axisId: 'b2b_3', axisName: '購買行動', segName: 'コスト最優先型' },
          ],
          memo: '市場規模は大きいが、大手工具メーカーとの価格競争に巻き込まれるリスク。',
        },
        {
          id: 'tc_a5', name: '金型メーカー×再研磨サービス×中ロット（10-100本）×パートナーシップ型',
          segments: [
            { axisId: 'b2b_1', axisName: '顧客の業界', segName: '金型メーカー' },
            { axisId: 'b2b_7', axisName: '製品の特性', segName: '再研磨サービス' },
            { axisId: 'b2b_9', axisName: 'ロットサイズ', segName: '中ロット（10-100本）' },
            { axisId: 'b2b_3', axisName: '購買行動', segName: 'パートナーシップ型' },
          ],
          memo: '既存工具の再研磨で工具コスト削減を提案。リピート率が高い。',
        },
      ],
      axes: [
        { id: 'ta1', name: '市場規模', description: 'そのセグメントの顧客数・売上ポテンシャルはどれくらいか', weight: 'medium', sixR: 'Realistic Scale' },
        { id: 'ta2', name: '成長性', description: '今後3〜5年でそのセグメントは拡大するか', weight: 'high', sixR: 'Rate of Growth' },
        { id: 'ta3', name: '競合の強さ', description: '既存プレーヤーが強く市場参入が難しいか（逆スコア：弱いほど高評価）', weight: 'medium', sixR: 'Rival' },
        { id: 'ta4', name: '自社適合性', description: '自社の強み・リソース・既存顧客との親和性はどれくらいか', weight: 'high', sixR: 'Rank' },
        { id: 'ta5', name: '到達可能性', description: 'そのセグメントに対して効果的にアプローチできるか（営業・販路・コスト面）', weight: 'medium', sixR: 'Reach' },
        { id: 'ta6', name: '収益性', description: '価格転嫁のしやすさ・粗利率など収益を確保しやすいか', weight: 'high', sixR: 'Response' },
      ],
      scores: {
        'tc_a1_ta1': 3, 'tc_a1_ta2': 5, 'tc_a1_ta3': 4, 'tc_a1_ta4': 5, 'tc_a1_ta5': 3, 'tc_a1_ta6': 5,
        'tc_a2_ta1': 4, 'tc_a2_ta2': 5, 'tc_a2_ta3': 3, 'tc_a2_ta4': 5, 'tc_a2_ta5': 3, 'tc_a2_ta6': 5,
        'tc_a3_ta1': 4, 'tc_a3_ta2': 4, 'tc_a3_ta3': 4, 'tc_a3_ta4': 5, 'tc_a3_ta5': 4, 'tc_a3_ta6': 4,
        'tc_a4_ta1': 5, 'tc_a4_ta2': 2, 'tc_a4_ta3': 1, 'tc_a4_ta4': 2, 'tc_a4_ta5': 4, 'tc_a4_ta6': 1,
        'tc_a5_ta1': 3, 'tc_a5_ta2': 3, 'tc_a5_ta3': 3, 'tc_a5_ta4': 4, 'tc_a5_ta5': 4, 'tc_a5_ta6': 3,
      },
      targets: {
        'tc_a1': { label: 'main', reason: '難削材加工向け高性能工具の需要が拡大中。当社の超精密加工技術・品質保証体制との適合性が極めて高く、高付加価値・高収益が見込める。品質認定のハードルが参入障壁となり長期的な関係構築が可能。' },
        'tc_a2': { label: 'sub', reason: '半導体市場の成長に伴い需要拡大。超精密加工技術と品質保証体制が活かせる。業界特有の認定プロセスへの対応投資が必要なため段階的に参入。' },
        'tc_a3': { label: 'sub', reason: '提案力・サポート力との親和性が高い。意思決定が早く営業効率が良い。既存顧客の多くがこの層。' },
        'tc_a4': { label: 'none' },
        'tc_a5': { label: 'sub', reason: '再研磨サービスでリピート率が高い。工具コスト削減提案で顧客価値を創出。' },
      },
    },

    step3: {
      kbf: [
        { id: 'kbf_a1', name: '品質・精度', importance: 'high' },
        { id: 'kbf_a2', name: '納期対応力', importance: 'high' },
        { id: 'kbf_a3', name: '価格競争力', importance: 'medium' },
        { id: 'kbf_a4', name: 'カスタム対応', importance: 'high' },
        { id: 'kbf_a5', name: '技術サポート', importance: 'medium' },
        { id: 'kbf_a6', name: '量産対応力', importance: 'low' },
      ],
      competitors: [
        { id: 'comp_1', name: '大手工具メーカーO', scale: '大手' },
        { id: 'comp_2', name: '微細工具メーカーN', scale: '中堅' },
        { id: 'comp_3', name: '総合機械メーカーF', scale: '大手' },
        { id: 'comp_4', name: '欧州工具メーカーS', scale: '海外大手' },
      ],
      axes: [
        { id: 'pa_0', name: '品質・精度' },
        { id: 'pa_1', name: '納期対応力' },
        { id: 'pa_2', name: '価格競争力' },
        { id: 'pa_3', name: 'カスタム対応' },
        { id: 'pa_4', name: '技術サポート' },
        { id: 'pa_5', name: '量産対応力' },
      ],
      scores: {
        // A精密工業（自社）
        'self_pa_0': 8, 'self_pa_1': 9, 'self_pa_2': 5, 'self_pa_3': 10, 'self_pa_4': 7, 'self_pa_5': 3,
        // 大手工具メーカーO（タップ世界首位、総合工具最大手）
        'comp_1_pa_0': 9, 'comp_1_pa_1': 7, 'comp_1_pa_2': 7, 'comp_1_pa_3': 5, 'comp_1_pa_4': 8, 'comp_1_pa_5': 10,
        // 微細工具メーカーN（超小径エンドミル国内首位）
        'comp_2_pa_0': 9, 'comp_2_pa_1': 6, 'comp_2_pa_2': 6, 'comp_2_pa_3': 4, 'comp_2_pa_4': 7, 'comp_2_pa_5': 8,
        // 総合機械メーカーF（ブローチ工具世界首位、多角経営）
        'comp_3_pa_0': 8, 'comp_3_pa_1': 6, 'comp_3_pa_2': 7, 'comp_3_pa_3': 5, 'comp_3_pa_4': 7, 'comp_3_pa_5': 9,
        // 欧州工具メーカーS（超硬工具世界最大手、33カ国展開）
        'comp_4_pa_0': 9, 'comp_4_pa_1': 5, 'comp_4_pa_2': 4, 'comp_4_pa_3': 4, 'comp_4_pa_4': 9, 'comp_4_pa_5': 10,
      },
      maps: [
        { id: 'map1', name: '品質 × 価格', xAxis: 'pa_2', yAxis: 'pa_0' },
        { id: 'map2', name: 'カスタム × 量産', xAxis: 'pa_5', yAxis: 'pa_3' },
        { id: 'map3', name: '技術力 × 納期', xAxis: 'pa_1', yAxis: 'pa_4' },
      ],
      quadrantLabels: {
        'map1_topLeft': '高品質・高価格\n（プレミアム戦略）',
        'map1_topRight': '高品質・低価格\n（理想的ポジション）',
        'map1_bottomLeft': '低品質・高価格\n（淘汰対象）',
        'map1_bottomRight': '低品質・低価格\n（コスト勝負）',
        'map2_topLeft': 'カスタム特化\n（当社の強み領域）',
        'map2_topRight': 'フルレンジ対応\n（大手の領域）',
        'map2_bottomLeft': 'ニッチ\n（特定用途限定）',
        'map2_bottomRight': '量産特化\n（海外メーカーの領域）',
        'map3_topLeft': '技術力重視\n（コンサル型）',
        'map3_topRight': '総合力\n（理想形）',
        'map3_bottomLeft': '限定的サービス',
        'map3_bottomRight': '納期重視\n（スピード型）',
      },
    },

    swot: {
      // Step0で選定した強みTop（7件）に対応した文章。並び順はtop5のrank順
      strengths: [
        '【製造技術】5軸CNC工具研削盤と独自プログラムによる超精密μm単位の研削加工技術',
        '【柔軟性】1本からの特注対応力と異形・複合工具の製作実績（年間500型以上）',
        '【品質保証】全品検査体制と公差±2μm以内の品質保証（検査成績書を全品添付）',
        '【提案力】顧客の加工課題に対する提案力とテスト加工サービス（年間120件以上）',
        '【技術サポート】工具選定・トラブルシューティングの技術サポート体制（年間200件以上）',
        '【設備・機械】世界トップクラスの最新CNC研削盤と3年ごとの計画的設備更新体制',
        '【人材】熟練技能者4名・技能検定1級5名の製造チームと体系的な技能伝承（OJT）',
      ],
      weaknesses: [
        '量産対応力が大手・海外メーカーに劣り、コスト競争で不利',
        'マーケティング発信が属人化しており、技術力の組織的ブランディングが不十分',
        '海外展開・輸出比率が低く、国内製造業の景気変動の影響を受けやすい',
        '熟練工に依存しており、若手育成サイクルが長く技能継承に時間を要する',
        '5軸CNC等の設備投資負担が大きく、稼働率低下時の固定費リスクが高い',
        '動画・SNS等のデジタルマーケティング活用が遅れ、新規接点がWeb・展示会に偏る',
      ],
      opportunities: [
        '航空・宇宙、医療、半導体製造装置など難削材加工市場の継続的成長',
        'カーボンニュートラル対応で軽量化部品（チタン・複合材）加工需要が拡大',
        '半導体投資の継続による超精密・微細加工工具のニーズ拡大',
        '大手工具メーカーが量産品に注力する中、特注ニッチ領域は競合が限定的',
        '製造業の人手不足を背景に「加工コンサル」「ワンストップ提案」へのニーズ増',
        '環境意識の高まりによる再研磨・工具リサイクルサービスへの需要拡大',
      ],
      threats: [
        '国内製造業の海外移転加速による国内工具需要の縮小リスク',
        '為替変動（円安）による超硬合金等の原材料調達コスト上昇',
        '中国・韓国・台湾の精密工具メーカーの技術力向上と価格攻勢',
        'AI最適化加工や3Dプリンティング等の代替加工技術の台頭',
        '熟練職人の高齢化と若手採用難（業界共通課題）',
        '顧客側の内製化（工具研削設備の導入）による外注需要の減少リスク',
      ],
      // クロスSWOTの4視点から導き出した戦略オプション（type: so/st/wo/wt、effect/feasibility: 高/中/低）
      strategyOptions: [
        {
          id: 'demo_a_opt1', type: 'so',
          text: '超精密加工技術と特注対応力を航空・宇宙・半導体製造装置市場に集中投下する。Nadcap等の品質認定取得で参入障壁の内側に入り込み、技術提案型営業によって「工具売り」から「加工課題解決パートナー」への関係性シフトを進める。',
          effect: '高', feasibility: '中',
        },
        {
          id: 'demo_a_opt2', type: 'st',
          text: '特注異形工具という大手・海外メーカーが構造的に参入しにくい領域に経営資源を集中させ、価格競争を回避する。技術コンサル型サービスで顧客との関係性を深め、代替加工技術の台頭に対しても「課題解決の伴走者」というポジションで価値提供を続ける。',
          effect: '高', feasibility: '高',
        },
        {
          id: 'demo_a_opt3', type: 'wo',
          text: '属人化したマーケティングを組織化するため、Web・展示会・技術論文等で事例ベースの情報発信を体系化する。航空・宇宙・半導体の成長市場に向けたコンテンツマーケティングで、営業担当者個人ではなく「A精密工業ブランド」として認知される基盤を作る。',
          effect: '中', feasibility: '高',
        },
        {
          id: 'demo_a_opt4', type: 'so',
          text: '再研磨・工具リサイクルサービスを環境対応メニューとして体系化し、既存顧客約150社へ横展開して安定収益源を育てる。環境意識の高い大手サプライチェーンへの新規参入の入り口としても活用する。',
          effect: '中', feasibility: '高',
        },
        {
          id: 'demo_a_opt5', type: 'wt',
          text: '量産・コスト面の弱みは追わず、特注分野での圧倒的差別化に経営資源を集中する。為替・原材料リスクは中長期契約と複数調達ルートで軽減し、設備稼働率の低下リスクは特注分野での受注予測精度向上と多能工化で吸収する。',
          effect: '中', feasibility: '中',
        },
      ],
      skipped: false,
    },

    aiComments: {
      strengthSummary: 'A精密工業の競争優位性は、5軸CNC工具研削盤を活用した超精密加工技術と、多品種少量の特注対応力という2つの柱に集約される。特に年間500型を超える異形工具の製作実績は、同規模企業の中で突出しており、大手メーカーが採算面から敬遠する「1本からの試作対応」という独自のポジションを確立している。\n\n品質面では、全品検査体制と公差±2μm以内の安定品質が、航空宇宙・半導体といった高精度要求市場への参入を可能にしている。また、単なる工具製造にとどまらず、顧客の加工課題に対する解決提案力（年間120件）と技術サポート（年間200件）は、価格競争に巻き込まれない長期的な顧客関係の源泉となっている。\n\n一方、これらの強みの対外的な発信力には改善余地がある。技術力・品質の高さに対して、マーケティング面での訴求が営業担当者の属人的な活動に依存している点は、今後の成長戦略において解消すべき課題である。',
      targetingRationale: 'メインターゲットとして「航空・宇宙関連」と「特殊・異形工具」の2セグメントを選定した。この選定は、自社の超精密加工技術と多品種少量対応力が最も高い付加価値を発揮できる領域に経営資源を集中する戦略に基づく。\n\n航空・宇宙セグメントは、難削材加工需要の拡大（成長性スコア5）と当社技術との高い適合性（スコア5）を兼ね備え、品質認定による参入障壁が競合の模倣を困難にする。特殊・異形工具セグメントは、競合の少なさ（スコア5）と高い収益性（スコア5）が際立ち、当社の差別化の根幹を成す。\n\nサブターゲットの「半導体製造装置」は成長性が高く将来の主力市場となり得る。「中堅メーカー」は既存顧客基盤を活かした効率的な営業展開が可能である。一方、標準工具・量産ロット・コスト最優先型は大手・海外メーカーの領域であり、意図的に回避することで経営資源の分散を防ぐ。',
      positioningComment: 'ストラテジーキャンバスの分析から、A精密工業は「カスタム対応」で満点（10点）を獲得し、「納期対応力」（9点）でも全競合を上回っている。一方、大手工具メーカーOや欧州工具メーカーSは「量産対応力」と「品質・精度」で高スコアを記録しており、標準品市場での優位性は揺るがない。\n\nポジショニングマップ「品質×価格」では、自社は左上の「高品質・高価格（プレミアム）」象限に位置する。欧州工具メーカーSがさらに左上（最高品質・高価格）、大手工具メーカーOが右寄りの「高品質・中価格」であるのに対し、当社はカスタム対応力で差別化する独自のポジションを確立している。\n\n「カスタム×量産」マップでは、当社は左上の「カスタム特化」象限で他社と完全に差別化されている。大手工具メーカーOと欧州工具メーカーSは右下の「量産特化」に集中しており、この「少量特注×短納期」というポジションは大手メーカーが構造的に参入しにくい独自の競争空間である。',
      swotComment: 'A精密工業のSWOT分析は、同社の競争優位性が「ニッチ深掘り戦略」にあることを明示している。強みである超精密加工・特注対応力・技術サポート力は、量産・コスト勝負を志向する大手競合が構造的に参入しにくい領域でこそ最大限に発揮されるため、競合と直接ぶつかることなく高付加価値顧客との長期関係を構築できる。\n\n戦略の核心はSO戦略にある。航空・宇宙・半導体製造装置という成長市場に対し、品質認定取得を通じて「参入障壁の内側」に入り込み、技術コンサル型営業で「加工課題の解決パートナー」というポジションを獲得する。逆に量産・コスト面の弱みを直接補おうとすると経営資源の分散を招くため、WT戦略は「弱みを追わず差別化に集中する」という選択と集中の発想で対処することが重要である。\n\n短期的に最も投資対効果が高いのはWO戦略、すなわちマーケティング発信力の組織化である。技術力の客観的証跡（事例・データ・認定取得）を蓄積し、属人営業から組織的ブランディングへ移行することで、価格競争に巻き込まれない関係性を保ちながら新規顧客接点を広げることができる。',
      overallStrategy: '【エグゼクティブサマリー】\n\nA精密工業のSTP分析結果は、同社が「精密切削工具の多品種少量特注メーカー」として、大手・海外メーカーとは明確に異なる独自の競争空間を有していることを示している。\n\n■ 強みの核心\n超精密CNC研削技術、1本からの特注対応力、全品検査による品質保証の3つが有機的に結合し、競合が模倣困難な価値提供基盤を形成している。\n\n■ ターゲット戦略\n「航空・宇宙×特殊工具×品質最優先」をコアターゲットとし、成長市場かつ当社技術との適合性が高いセグメントに集中する。標準品・量産・コスト勝負の市場は意図的に回避し、経営資源を高付加価値領域に集中投下する。\n\n■ ポジショニング戦略\n「少量特注×超精密×技術コンサルティング」というトリプルバリューで独自ポジションを確立。単なる工具サプライヤーではなく「加工課題の解決パートナー」として顧客と長期的な関係を構築する。\n\n■ 今後の重点施策\n1. マーケティング発信力の強化（技術力のブランディング）\n2. 航空・宇宙分野の品質認定（Nadcap等）取得推進\n3. 半導体製造装置市場への段階的参入準備\n4. デジタルマーケティングの活用による新規顧客開拓',
    },

    aiSettings: {
      provider: 'claude',
      apiKey: '',
      model: 'claude-sonnet-4-6',
      tone: 'formal',
    },
  };
}

/**
 * デモデータ: 特注木工家具・店舗什器メーカー（匿名化）
 * モデル企業を参考にした架空データです。
 */
export function createDemoProjectFuji() {
  return {
    settings: {
      projectName: 'B木工製作所 STP分析',
      companyName: 'B木工製作所',
      marketType: 'btob',
      productService: '特注木工家具・店舗什器・建築造作の設計・製造・施工',
      businessDescription: '創業60年の木工家具・造作専門メーカー。国産無垢材（ナラ・ウォールナット・ヒノキ等）を中心に、特注家具・店舗什器・建築造作の設計から製造・現場施工までを一貫対応。熟練職人12名が在籍し、手加工とNCルーターを組み合わせた精密な木工技術が強み。カフェ・レストラン・ホテルなど商業施設の内装什器を年間40件以上手がけ、設計事務所やインテリアデザイナーとの協業実績が豊富。天然木の経年変化を活かしたオイル仕上げや、曲木・組子細工などの伝統技法にも対応。小ロット（1台〜）から量産（100台規模）まで柔軟に対応可能。従業員28名、年商4.2億円。FSC認証材の取り扱いにも対応し、サステナブルな調達を推進。',
    },

    step0: {
      categories: [
        // vc1: 購買物流
        {
          id: 'vc1',
          items: [
            {
              id: 'vc1_0', name: '調達力',
              strength: '国産広葉樹（ナラ・タモ・ウォールナット等）を産地の製材所から直接仕入れ。乾燥材の品質を現地で目利きし、含水率管理を徹底。10年以上の取引で安定供給ルートを確保。',
              communication: 'Webサイトに「素材へのこだわり」ページを掲載。SNSで製材所訪問の様子を発信。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc1_1', name: '在庫管理',
              strength: '人気樹種の乾燥材を常時ストック。天然乾燥と人工乾燥を組み合わせた独自の養生プロセスで、反りや割れを最小化。',
              communication: '工房見学時に木材倉庫を案内。体系的な情報発信は未実施。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc1_2', name: 'サプライヤー関係',
              strength: '北海道・東北の製材所3社、突板メーカー2社との長期取引。特注サイズの製材にも対応してもらえる関係性。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc1_3', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc2: 製造・オペレーション
        {
          id: 'vc2',
          items: [
            {
              id: 'vc2_0', name: '製造技術',
              strength: '伝統的なほぞ組み・蟻継ぎなどの手加工技術と、CNCルーターによる精密加工を融合。曲面加工・彫刻・象嵌など高度な意匠表現が可能。木工歴30年以上の熟練職人が品質を担保。',
              communication: '施工事例を写真・動画でWebサイト・Instagramに掲載。工房見学で加工工程をデモ。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc2_1', name: '生産効率',
              strength: 'CNCルーター導入で定型パーツの加工時間を50%短縮。手仕上げ工程と機械加工の最適な工程分割により、品質を維持しつつ生産性を向上。',
              communication: '工場見学時に設備紹介。対外的な発信は少ない。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc2_2', name: '品質保証',
              strength: '完成品全数の検品体制。含水率・仕上がり精度・塗装品質を独自チェックシートで管理。納品後1年間の無償修理保証を標準付帯。',
              communication: '保証書を全案件に発行。品質管理プロセスのWebサイト掲載は未実施。',
              communicationStatus: 'issue', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc2_3', name: '柔軟性',
              strength: '1点ものから小ロット量産まで対応。建築家やデザイナーのスケッチ段階からの相談に対応し、素材選定・構造設計・仕上げ方法まで一貫して提案。年間80件以上の特注案件を手がける。',
              communication: '特注事例をWebサイトのポートフォリオに掲載。「1点からお受けします」を営業資料で訴求。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc2_4', name: '設備・機械',
              strength: '3軸CNCルーター、ワイドベルトサンダー、スライドテーブルソー、自動かんな盤等を保有。手工具も充実し、機械では出せない繊細な仕上げに対応。',
              communication: '設備一覧はWebサイトに掲載。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc2_5', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc3: 出荷物流
        {
          id: 'vc3',
          items: [
            {
              id: 'vc3_0', name: '配送スピード',
              strength: '神奈川・東京エリアは自社便で直接搬入。大型什器も分割搬入・現場組立で対応。納品日の柔軟な調整が可能。',
              communication: '営業時に配送エリアと対応範囲を説明。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc3_1', name: '配送品質',
              strength: '家具専用の養生・梱包資材を使用。搬入経路の事前確認を徹底し、建物を傷つけない搬入を実現。搬入トラブルゼロを5年間継続。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc3_2', name: '物流ネットワーク',
              strength: '関東圏は自社配送、遠方は美術品専門輸送業者と提携。海外への輸出実績もあり。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc3_3', name: '梱包',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc3_4', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc4: マーケティング・販売
        {
          id: 'vc4',
          items: [
            {
              id: 'vc4_0', name: 'ブランド力',
              strength: '「木の温もりを空間に届ける」をブランドコンセプトに、デザイン性と職人品質を両立。Instagram フォロワー8,000人。建築・インテリア系メディアへの掲載実績多数。',
              communication: 'Instagram・Webサイトで施工事例を定期発信。メディア掲載実績をまとめたプレスキットを用意。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc4_1', name: '営業力',
              strength: '建築家・インテリアデザイナーとの直接的なネットワーク。設計事務所への定期訪問とサンプル材提供で関係構築。紹介経由の案件が全体の60%。',
              communication: '木材サンプルキットを設計事務所に配布。ただしデジタルでの営業活動は弱い。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc4_2', name: '顧客基盤',
              strength: '設計事務所約40社、店舗デザイン会社15社、ゼネコン内装部門5社との取引実績。リピート率75%。',
              communication: '一部の導入事例をWebサイトに掲載。顧客の声は未収集。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc4_3', name: '提案力',
              strength: 'デザイナーのコンセプトを理解し、素材・構造・仕上げの最適解を提案する「デザイン通訳」としての役割を果たす。3D CADによるイメージパース作成、実寸サンプル製作で意思決定を支援。',
              communication: '提案プロセスをWebサイトで紹介。3Dパース事例も掲載。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc4_4', name: '価格競争力',
              strength: '大手什器メーカーの量産品と比較すると高価格だが、同等のカスタム対応ができる都内の工房よりは20-30%安い。郊外の工房という立地コスト優位性。',
              communication: '見積時に価格の根拠（素材・工程）を明示。コスト比較の訴求は未実施。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc4_5', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc5: サービス
        {
          id: 'vc5',
          items: [
            {
              id: 'vc5_0', name: 'サポート体制',
              strength: '納品後のメンテナンス相談に随時対応。店舗の模様替えや什器の追加・改修もワンストップで対応可能。',
              communication: 'メンテナンスガイドを納品時に同梱。定期的なフォローの仕組みは未整備。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc5_1', name: '対応スピード',
              strength: '簡易な修理・補修は1週間以内に対応。緊急時（店舗オープン前の不具合等）は即日駆けつけ対応。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc5_2', name: '技術サポート',
              strength: '木材の経年変化に関するアドバイス、日常メンテナンス方法の指導、塗装の塗り直しサービスを提供。「育てる家具」というコンセプトで長期的な関係を構築。',
              communication: 'メンテナンスブログを月1回更新。SNSでも木材のお手入れ情報を発信。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc5_3', name: '保証・補償',
              strength: '構造に関わる不具合は納品後3年間無償修理。塗装の塗り直しは有償だが優待価格で提供。',
              communication: '保証内容を見積書・納品書に明記。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc5_4', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc6: 企業インフラ
        {
          id: 'vc6',
          items: [
            {
              id: 'vc6_0', name: '経営理念・ビジョン',
              strength: '「木と人をつなぐ、空間をつくる」を企業理念に掲げ、国産材の活用と職人技術の継承を両立。地域の林業振興にも貢献。',
              communication: 'Webサイトに掲載。地域イベントでも発信。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc6_1', name: '財務基盤',
              strength: '創業25年の実績。無借金経営で安定した財務体質。設備投資のための内部留保を確保。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc6_2', name: '品質マネジメント',
              strength: '独自の品質チェックシートによる全数検品。過去の不具合事例をデータベース化し、再発防止に活用。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc6_3', name: 'コンプライアンス',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc6_4', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc7: 人的資源管理
        {
          id: 'vc7',
          items: [
            {
              id: 'vc7_0', name: '人材の質',
              strength: '木工歴30年の親方を筆頭に、熟練職人3名・中堅2名・若手2名の計8名体制。家具技能士1級保有者3名。伝統的な手加工からCNCプログラミングまで幅広いスキルを保有。',
              communication: '職人紹介をWebサイトに掲載。SNSで製作風景を定期発信。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc7_1', name: '教育・研修制度',
              strength: '若手職人への徒弟制度的OJT。年1回の産地研修（林業現場・製材所見学）。外部の木工技術セミナーへの参加支援。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc7_2', name: '従業員満足度',
              strength: '職人の定着率が高く、直近5年の離職ゼロ。ものづくりへのやりがいと働きやすい職場環境を両立。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc7_3', name: '組織文化',
              strength: '「良い仕事は良い素材と腕から」という職人気質と、デザイナーとの協業を楽しむオープンな姿勢が共存。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc7_4', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc8: 技術開発
        {
          id: 'vc8',
          items: [
            {
              id: 'vc8_0', name: '研究開発力',
              strength: '新しい樹種・仕上げ技法の研究を継続。焼杉・藍染め・漆塗りなど伝統技法の現代的アレンジにも取り組む。サステナブル素材（間伐材・古材リユース）の活用にも注力。',
              communication: '新技法の試作品をSNSで発信。展示会で実物を展示。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc8_1', name: '製品開発力',
              strength: '3D CAD（Rhinoceros）を活用した設計力。デザイナーの2Dスケッチから3Dモデルを起こし、構造検討・素材積算まで一貫対応。VRによる空間シミュレーションも試験導入。',
              communication: '3Dパースの事例をWebサイトに掲載。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc8_2', name: '特許・知的財産',
              strength: '独自の接合金物について実用新案を1件保有。デザインのオリジナリティはポートフォリオで訴求。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc8_3', name: 'IT・DX推進',
              strength: '見積・工程管理にクラウドツールを導入。3D CAD/CAMでCNCルーターと連携し、設計データからの直接加工を実現。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc8_4', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
      ],

      top5: [
        {
          id: 'vc2_0', name: '木工技術', rank: 1,
          categoryName: '製造・オペレーション', categoryId: 'vc2',
          strength: '伝統的なほぞ組み・蟻継ぎなどの手加工技術と、CNCルーターによる精密加工を融合。曲面加工・彫刻・象嵌など高度な意匠表現が可能。木工歴30年以上の熟練職人が品質を担保。',
          communication: '施工事例を写真・動画でWebサイト・Instagramに掲載。工房見学で加工工程をデモ。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '伝統技法とデジタル加工の融合は、同規模の木工所では珍しい。30年以上の熟練技術は短期間で模倣不可能であり、CNCの精度と手仕上げの温かみを両立できることが最大の差別化要素。',
        },
        {
          id: 'vc4_3', name: 'デザイン提案力', rank: 2,
          categoryName: 'マーケティング・販売', categoryId: 'vc4',
          strength: 'デザイナーのコンセプトを理解し、素材・構造・仕上げの最適解を提案する「デザイン通訳」としての役割を果たす。3D CADによるイメージパース作成、実寸サンプル製作で意思決定を支援。',
          communication: '提案プロセスをWebサイトで紹介。3Dパース事例も掲載。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '単なる「図面通りに作る」ではなく、デザイナーの意図を汲み取り素材と構造の知見から最適解を提案できる能力は、建築家・デザイナーとの協業において極めて高い価値を持つ。',
        },
        {
          id: 'vc1_0', name: '素材選定力', rank: 3,
          categoryName: '購買物流', categoryId: 'vc1',
          strength: '国産広葉樹（ナラ・タモ・ウォールナット等）を産地の製材所から直接仕入れ。乾燥材の品質を現地で目利きし、含水率管理を徹底。10年以上の取引で安定供給ルートを確保。',
          communication: 'Webサイトに「素材へのこだわり」ページを掲載。SNSで製材所訪問の様子を発信。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '木材の品質は最終製品の仕上がりを大きく左右する。産地直接仕入れと目利き力は、安定した品質の家具製作に不可欠であり、量産什器メーカーにはない強み。',
        },
        {
          id: 'vc2_3', name: 'カスタム対応力', rank: 4,
          categoryName: '製造・オペレーション', categoryId: 'vc2',
          strength: '1点ものから小ロット量産まで対応。建築家やデザイナーのスケッチ段階からの相談に対応し、素材選定・構造設計・仕上げ方法まで一貫して提案。年間80件以上の特注案件を手がける。',
          communication: '特注事例をWebサイトのポートフォリオに掲載。「1点からお受けします」を営業資料で訴求。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '大手什器メーカーはロット生産に最適化されており、1点もののカスタム対応は不得意。当社の「スケッチから完成まで」のワンストップ対応力は、デザイン性を重視する顧客にとって大きな価値。',
        },
        {
          id: 'vc7_0', name: '職人チーム', rank: 5,
          categoryName: '人的資源管理', categoryId: 'vc7',
          strength: '木工歴30年の親方を筆頭に、熟練職人3名・中堅2名・若手2名の計8名体制。家具技能士1級保有者3名。伝統的な手加工からCNCプログラミングまで幅広いスキルを保有。',
          communication: '職人紹介をWebサイトに掲載。SNSで製作風景を定期発信。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '熟練職人の存在は木工品質の根幹。技能士1級が3名在籍する体制は中小木工所として突出しており、技術の幅広さ（手加工〜CNC）が多様な案件への対応力を支える。',
        },
        {
          id: 'vc5_2', name: '長期メンテナンスサービス', rank: 6,
          categoryName: 'サービス', categoryId: 'vc5',
          strength: '木材の経年変化に関するアドバイス、日常メンテナンス方法の指導、塗装の塗り直しサービスを提供。「育てる家具」というコンセプトで長期的な関係を構築。',
          communication: 'メンテナンスブログを月1回更新。SNSでも木材のお手入れ情報を発信。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '「育てる家具」という長期サポートのコンセプトは、納品して終わりの量産什器メーカーとの明確な差別化。経年変化を楽しむ顧客との継続接点が、リピートと紹介の源泉になる。',
        },
        {
          id: 'vc2_2', name: '品質保証体制', rank: 7,
          categoryName: '製造・オペレーション', categoryId: 'vc2',
          strength: '完成品全数の検品体制。含水率・仕上がり精度・塗装品質を独自チェックシートで管理。納品後1年間の無償修理保証を標準付帯。',
          communication: '保証書を全案件に発行。品質管理プロセスのWebサイト掲載は未実施。',
          communicationStatus: 'issue', isStrengthFlag: true, isCustom: false,
          reason: '全数検品と無償修理保証は、高額な特注家具を発注する顧客の不安を取り除く仕組み。品質への自信の裏付けとして、デザイン重視の顧客層への訴求力を支える。',
        },
      ],
      skipped: false,
    },

    step1: {
      selectedAxes: [
        { id: 'b2b_1', name: '顧客の業界', feature: '顧客の業界によって、求められる家具・什器の仕様、品質、デザイン性、予算感が異なる', note: '特定の業界に依存しすぎると景気動向に左右されるリスクがある', priority: 'high' },
        { id: 'b2b_2', name: '発注者の種類', feature: '設計事務所・デザイン会社・ゼネコン・施主直接など、発注者によって意思決定プロセスや求めるものが異なる', note: '最終決定者が誰かを見極めることが重要', priority: 'high' },
        { id: 'b2b_7', name: '製品カテゴリ', feature: '店舗什器・建築造作・オフィス家具・住宅家具など、カテゴリで求められる品質・デザイン・耐久性が異なる', note: 'カテゴリごとの製造ノウハウと施工条件が異なる', priority: 'high' },
        { id: 'b2b_9', name: 'プロジェクト規模', feature: '1点ものの小規模案件から大型商業施設まで、規模で対応体制が大きく異なる', note: '大型案件は売上が大きいが、リスクと資金繰り負荷も高い', priority: 'medium' },
        { id: 'b2b_3', name: '購買行動', feature: 'デザイン重視・コスト重視・品質耐久性重視・納期重視など、発注者の優先事項は様々', note: '購買基準を見極め適切なアプローチを行う必要がある', priority: 'medium' },
      ],
      segments: {
        'b2b_1': [
          { id: 'seg_f01', name: '飲食店・カフェ', memo: 'カウンター、テーブル、棚、看板等。デザイン性と耐久性の両立が必要。開業ラッシュで需要安定' },
          { id: 'seg_f02', name: 'ホテル・旅館', memo: 'フロント、客室家具、レストラン什器。高級感と耐久性を要求。改装サイクルで定期需要あり' },
          { id: 'seg_f03', name: 'オフィス・コワーキング', memo: '会議テーブル、受付カウンター、収納什器。機能性とデザインの両立。リモートワーク普及で変化中' },
          { id: 'seg_f04', name: '物販・アパレル店', memo: '陳列棚、フィッティングルーム、レジカウンター。ブランドイメージに合わせた什器デザインが重要' },
          { id: 'seg_f05', name: '注文住宅・リノベ', memo: 'キッチン収納、造作家具、建具。施主のこだわりが強く、細かい打ち合わせが必要' },
        ],
        'b2b_2': [
          { id: 'seg_f06', name: '建築家・設計事務所', memo: 'デザインへのこだわりが強い。素材や仕上げの提案力を求める。長期的な関係になりやすい' },
          { id: 'seg_f07', name: '店舗デザイン会社', memo: '飲食・物販の内装設計を手がける。施工管理も含めた一括対応を求める傾向。案件数が多い' },
          { id: 'seg_f08', name: 'ゼネコン内装部門', memo: '大型案件が中心。品質基準が厳格で見積比較が厳しい。一度取引が始まれば大口になりやすい' },
          { id: 'seg_f09', name: '施主・オーナー直接', memo: '中間マージンなしで直接取引。こだわりが強いが予算管理が甘いケースも。個人対応の負荷が高い' },
        ],
        'b2b_7': [
          { id: 'seg_f10', name: '店舗カウンター・什器', memo: '一枚板カウンター、陳列什器等。デザイン性と強度の両立。現場での搬入・施工が伴う' },
          { id: 'seg_f11', name: '建築造作（壁面・天井）', memo: 'ルーバー、パネル、天井装飾等。建築と一体化する造作。精度要求が高い' },
          { id: 'seg_f12', name: 'オリジナル家具', memo: 'テーブル、椅子、収納等の単品家具。デザイナーとのコラボ品やオーダーメイド' },
          { id: 'seg_f13', name: '木製サイン・ディスプレイ', memo: '看板、メニューボード、展示什器等。小〜中規模。短納期案件が多い' },
        ],
        'b2b_9': [
          { id: 'seg_f14', name: '大型案件（500万超）', memo: '商業施設・ホテル全館等。設計〜施工まで3〜6ヶ月。利益は大きいが制作リソースの確保が課題' },
          { id: 'seg_f15', name: '中規模案件（100〜500万）', memo: '店舗1軒分、住宅造作等。2〜3ヶ月の工期。最も得意な規模感で利益率も高い' },
          { id: 'seg_f16', name: '小規模案件（100万未満）', memo: '単品家具、サイン、修理等。1ヶ月以内。件数は多いが1件あたりの利益は小さい' },
        ],
        'b2b_3': [
          { id: 'seg_f17', name: 'デザイン重視型', memo: '空間の世界観を最重視。素材・仕上げ・ディテールにこだわる。予算は比較的柔軟' },
          { id: 'seg_f18', name: 'コスト重視型', memo: '予算内での最大効果を求める。相見積もりを取る。コストダウン提案を歓迎' },
          { id: 'seg_f19', name: '品質・耐久性重視型', memo: '長期使用を前提。メンテナンス性・堅牢性を重視。ホテル・公共施設に多い' },
        ],
      },
    },

    step2: {
      candidates: [
        {
          id: 'tc_f1', name: '飲食店・カフェ×デザイン重視型×中規模案件（100〜500万）',
          segments: [
            { axisId: 'b2b_1', axisName: '顧客の業界', segName: '飲食店・カフェ' },
            { axisId: 'b2b_3', axisName: '購買行動', segName: 'デザイン重視型' },
            { axisId: 'b2b_9', axisName: 'プロジェクト規模', segName: '中規模案件（100〜500万）' },
          ],
          memo: 'デザイン性の高い一枚板カウンターや造作什器。開業ラッシュで新規案件が継続発生。',
        },
        {
          id: 'tc_f2', name: '建築家・設計事務所×品質・耐久性重視型',
          segments: [
            { axisId: 'b2b_2', axisName: '発注者の種類', segName: '建築家・設計事務所' },
            { axisId: 'b2b_3', axisName: '購買行動', segName: '品質・耐久性重視型' },
          ],
          memo: '「デザイン通訳」としての提案力を評価。紹介でネットワーク拡大。',
        },
        {
          id: 'tc_f3', name: 'ホテル・旅館×デザイン重視型×大型案件（500万超）',
          segments: [
            { axisId: 'b2b_1', axisName: '顧客の業界', segName: 'ホテル・旅館' },
            { axisId: 'b2b_3', axisName: '購買行動', segName: 'デザイン重視型' },
            { axisId: 'b2b_9', axisName: 'プロジェクト規模', segName: '大型案件（500万超）' },
          ],
          memo: '高付加価値・高収益だが参入には品質実績とコネクションが必要。',
        },
        {
          id: 'tc_f4', name: 'ゼネコン内装部門×コスト重視型×大型案件（500万超）',
          segments: [
            { axisId: 'b2b_2', axisName: '発注者の種類', segName: 'ゼネコン内装部門' },
            { axisId: 'b2b_3', axisName: '購買行動', segName: 'コスト重視型' },
            { axisId: 'b2b_9', axisName: 'プロジェクト規模', segName: '大型案件（500万超）' },
          ],
          memo: '規模は大きいが価格競争が激しく、当社の強みが活きにくい。',
        },
      ],
      axes: [
        { id: 'ta1', name: '市場規模', description: 'そのセグメントの案件数・売上ポテンシャル', weight: 'medium', sixR: 'Realistic Scale' },
        { id: 'ta2', name: '成長性', description: '今後3〜5年の市場拡大見込み', weight: 'high', sixR: 'Rate of Growth' },
        { id: 'ta3', name: '競合の強さ', description: '既存プレーヤーが強いか（弱いほど高評価）', weight: 'medium', sixR: 'Rival' },
        { id: 'ta4', name: '自社適合性', description: '自社の強み・技術との親和性', weight: 'high', sixR: 'Rank' },
        { id: 'ta5', name: '到達可能性', description: '営業・ネットワークでアプローチできるか', weight: 'medium', sixR: 'Reach' },
        { id: 'ta6', name: '収益性', description: '粗利率・価格転嫁のしやすさ', weight: 'high', sixR: 'Response' },
      ],
      scores: {
        'tc_f1_ta1': 4, 'tc_f1_ta2': 4, 'tc_f1_ta3': 3, 'tc_f1_ta4': 5, 'tc_f1_ta5': 4, 'tc_f1_ta6': 4,
        'tc_f2_ta1': 3, 'tc_f2_ta2': 4, 'tc_f2_ta3': 4, 'tc_f2_ta4': 5, 'tc_f2_ta5': 5, 'tc_f2_ta6': 5,
        'tc_f3_ta1': 3, 'tc_f3_ta2': 4, 'tc_f3_ta3': 2, 'tc_f3_ta4': 5, 'tc_f3_ta5': 3, 'tc_f3_ta6': 5,
        'tc_f4_ta1': 5, 'tc_f4_ta2': 3, 'tc_f4_ta3': 1, 'tc_f4_ta4': 2, 'tc_f4_ta5': 2, 'tc_f4_ta6': 2,
      },
      targets: {
        'tc_f1': { label: 'main', reason: 'デザイン性の高い一枚板カウンターや造作什器のニーズが安定。当社の木工技術とデザイン提案力が最も活きる領域。開業ラッシュで新規案件が継続的に発生し、SNS映えする什器は口コミ効果も期待できる。' },
        'tc_f2': { label: 'main', reason: '当社の「デザイン通訳」としての提案力を最も評価してくれる層。紹介経由で案件が広がるネットワーク効果が高い。素材選定から構造提案まで一貫対応できることが大きな差別化要素。' },
        'tc_f3': { label: 'sub', reason: '高付加価値・高収益が見込めるが、参入には品質実績とコネクションが必要。既存の設計事務所経由で段階的に実績を積む。' },
        'tc_f4': { label: 'none' },
      },
    },

    step3: {
      kbf: [
        { id: 'kbf_f1', name: 'デザイン性', importance: 'high' },
        { id: 'kbf_f2', name: '素材品質', importance: 'high' },
        { id: 'kbf_f3', name: '価格競争力', importance: 'medium' },
        { id: 'kbf_f4', name: 'カスタム対応', importance: 'high' },
        { id: 'kbf_f5', name: '施工力', importance: 'medium' },
        { id: 'kbf_f6', name: '納期対応', importance: 'medium' },
      ],
      competitors: [
        { id: 'comp_1', name: '大手什器メーカーT', scale: '大手' },
        { id: 'comp_2', name: '地元木工所M', scale: '中小' },
        { id: 'comp_3', name: 'デザイン家具工房A', scale: '中堅' },
        { id: 'comp_4', name: '海外量産メーカーF', scale: '大手' },
      ],
      axes: [
        { id: 'pa_0', name: 'デザイン性' },
        { id: 'pa_1', name: '素材品質' },
        { id: 'pa_2', name: '価格競争力' },
        { id: 'pa_3', name: 'カスタム対応' },
        { id: 'pa_4', name: '施工力' },
        { id: 'pa_5', name: '納期対応' },
      ],
      scores: {
        // B木工製作所（自社）
        'self_pa_0': 8, 'self_pa_1': 9, 'self_pa_2': 4, 'self_pa_3': 9, 'self_pa_4': 7, 'self_pa_5': 4,
        // 大手什器メーカーT（タテヤマアドバンスをモデル）
        'comp_1_pa_0': 5, 'comp_1_pa_1': 6, 'comp_1_pa_2': 7, 'comp_1_pa_3': 5, 'comp_1_pa_4': 9, 'comp_1_pa_5': 8,
        // 地元木工所M（円山工芸をモデル）
        'comp_2_pa_0': 5, 'comp_2_pa_1': 8, 'comp_2_pa_2': 6, 'comp_2_pa_3': 7, 'comp_2_pa_4': 6, 'comp_2_pa_5': 5,
        // デザイン家具工房A（秋山木工をモデル）
        'comp_3_pa_0': 9, 'comp_3_pa_1': 9, 'comp_3_pa_2': 3, 'comp_3_pa_3': 8, 'comp_3_pa_4': 7, 'comp_3_pa_5': 4,
        // 海外量産メーカーF（藤沢工業/TOKIOをモデル）
        'comp_4_pa_0': 4, 'comp_4_pa_1': 5, 'comp_4_pa_2': 9, 'comp_4_pa_3': 3, 'comp_4_pa_4': 4, 'comp_4_pa_5': 8,
      },
      maps: [
        { id: 'map1', name: 'デザイン × 価格', xAxis: 'pa_2', yAxis: 'pa_0' },
        { id: 'map2', name: 'カスタム × 施工', xAxis: 'pa_4', yAxis: 'pa_3' },
        { id: 'map3', name: '素材品質 × 納期', xAxis: 'pa_5', yAxis: 'pa_1' },
      ],
      quadrantLabels: {
        'map1_topLeft': '高デザイン・高価格\n（プレミアム工房）',
        'map1_topRight': '高デザイン・低価格\n（理想ポジション）',
        'map1_bottomLeft': 'コモディティ\n（淘汰対象）',
        'map1_bottomRight': '低価格量産\n（海外・大手の領域）',
        'map2_topLeft': 'カスタム特化\n（デザイン工房）',
        'map2_topRight': 'フルサービス\n（当社の目標）',
        'map2_bottomLeft': '限定対応\n（小規模工房）',
        'map2_bottomRight': '施工特化\n（ゼネコン系）',
        'map3_topLeft': '高品質・長納期\n（こだわり型）',
        'map3_topRight': '高品質・短納期\n（理想形）',
        'map3_bottomLeft': '低品質・長納期',
        'map3_bottomRight': '量産・短納期\n（大手の領域）',
      },
    },

    swot: {
      // Step0で選定した強みTop（7件）に対応した文章。並び順はtop5のrank順
      strengths: [
        '【木工技術】伝統技法（ほぞ組み・蟻継ぎ）とCNCルーターを融合した精密木工技術',
        '【デザイン提案力】デザイナーの意図を汲み取る「デザイン通訳」としての提案力（3DCAD・実寸サンプル）',
        '【素材選定力】国産広葉樹の産地直接仕入れと含水率管理による素材選定力',
        '【カスタム対応力】1点もの〜小ロットの柔軟なカスタム対応（年間80件以上の特注案件）',
        '【職人チーム】家具技能士1級3名を含む熟練職人チーム体制（手加工〜CNCの幅広いスキル）',
        '【長期サポート】「育てる家具」コンセプトの経年変化アドバイス・塗り直し等の長期メンテナンス体制',
        '【品質保証】完成品全数検品と納品後1年間の無償修理保証（独自チェックシートで管理）',
      ],
      weaknesses: [
        '量産対応力が限定的で、ロット規模の大きい案件は機会損失が生じる',
        '大型案件（500万超）における資金繰り・先行投資リスクが高い',
        'Webサイト・SNS発信が施工事例中心で、ブランドストーリー訴求が不足',
        '価格帯が高く、コスト重視顧客（ゼネコン・量産家具市場）には選ばれにくい',
        '職人依存度が高く、繁忙期の人員ボトルネックと若手育成課題を抱える',
        '納品後の定期フォローが未整備で、リピート・追加案件の機会を取りこぼしている',
      ],
      opportunities: [
        '飲食店・カフェの開業ラッシュとデザイン重視志向の継続',
        'インバウンド回復によるホテル・旅館の改装・新築案件の増加',
        'SDGs・サステナビリティ意識の高まりによる国産材・無垢材の評価向上',
        '建築家・設計事務所との協業ネットワーク拡大（紹介経由の好循環）',
        'リノベ・店舗デザインのSNS発信文化により顧客側の宣伝効果が期待できる',
        '間伐材・古材活用など環境配慮型の素材ニーズの高まり（独自ブランド化の余地）',
      ],
      threats: [
        '輸入家具・量産什器との価格競争の激化',
        '国産広葉樹の原材料価格高騰と供給不安定リスク',
        '飲食業界の景気変動による開業・改装案件の波',
        'ゼネコン経由の大型案件における中間マージン圧縮と工期短縮要求',
        '木工職人の高齢化・若手担い手不足（業界共通課題）',
        '3Dプリンタ・新素材など代替製作手法の進化による木工需要の侵食リスク',
      ],
      // クロスSWOTの4視点から導き出した戦略オプション（type: so/st/wo/wt、effect/feasibility: 高/中/低）
      strategyOptions: [
        {
          id: 'demo_b_opt1', type: 'so',
          text: 'デザイン提案力と素材選定力を活かし、建築家・設計事務所との上流協業を深化させる。飲食店・カフェ・ホテル開業案件に対し「デザイン通訳」として企画段階から関与し、SNS映えする什器で口コミ拡散と紹介案件を生む循環を加速する。',
          effect: '高', feasibility: '高',
        },
        {
          id: 'demo_b_opt2', type: 'so',
          text: 'インバウンド回復で増えるホテル・旅館の改装需要に対し、設計事務所経由で客室・ロビー什器市場へ段階的に参入する。国産材ストーリーとサステナブル文脈はホテルブランドの発信素材にもなり、高単価案件の柱を育てられる。',
          effect: '高', feasibility: '中',
        },
        {
          id: 'demo_b_opt3', type: 'st',
          text: '量産輸入家具とは戦わず、「伝統技法×デザイン×サステナブル素材」というオンリーワン領域で差別化する。ストーリー性のあるブランド訴求で価値共感型の顧客を獲得し、原材料高騰に対しては素材の希少性を価値として顧客に共有することで価格転嫁を可能にする。',
          effect: '高', feasibility: '中',
        },
        {
          id: 'demo_b_opt4', type: 'wo',
          text: '発信力の弱さを克服するため、施工事例だけでなく「素材調達ストーリー」「職人の手仕事」「経年変化の美」をコンテンツ化する。サステナブル意識の高い建築家・施主に向けた共感型コンテンツマーケティングを展開し、紹介依存から組織的なリード獲得へ転換する。',
          effect: '中', feasibility: '高',
        },
        {
          id: 'demo_b_opt5', type: 'wt',
          text: 'ゼネコン経由の大型案件は採算性を厳格に選別し、利益率の低い案件は意図的に断る。施主・設計事務所との直接取引を強化することで中間マージン圧縮の脅威を回避し、職人不足に対しては手加工とCNCの分業設計で生産性を平準化する。',
          effect: '中', feasibility: '高',
        },
      ],
      skipped: false,
    },

    aiComments: {
      strengthSummary: 'B木工製作所の競争優位性は、伝統的な手加工技術とCNCデジタル加工の融合、そして建築家・デザイナーの意図を汲み取る「デザイン通訳」としての提案力に集約される。木工歴30年の親方を筆頭とする熟練職人チームは、ほぞ組みや蟻継ぎといった伝統技法から曲面加工・象嵌まで幅広い技術を持ち、同規模の木工所では類を見ない技術の幅広さを誇る。\n\n素材面では、国産広葉樹を産地から直接仕入れる目利き力と含水率管理の徹底が、安定した品質の家具製作を支えている。これは量産什器メーカーにはない「素材を知り尽くした職人」ならではの強みである。\n\n一方、マーケティング面では紹介経由の案件が60%と既存ネットワークへの依存度が高く、デジタルでの新規開拓やブランド発信力に改善余地がある。郊外という立地は都内の工房より低コストという利点がある一方、顧客アクセスの面では不利にもなり得る。',
      targetingRationale: 'メインターゲットとして「飲食店・カフェ」と「建築家・設計事務所」を選定した。飲食店・カフェは、デザイン性の高い一枚板カウンターや造作什器という当社の看板商品が最も求められる市場であり、SNS映えする空間づくりのニーズが継続的に発生している。\n\n建築家・設計事務所は、当社の「デザイン通訳」としての提案力を最も正当に評価してくれる層であり、一度信頼を得れば紹介ネットワークで案件が広がる好循環が期待できる。両セグメントとも自社適合性・収益性のスコアが高く、価格よりも品質・デザインで選ばれるため、コスト競争に巻き込まれにくい。\n\n対象外としたゼネコン内装部門やコスト重視型は、価格競争が激しく当社の強みが活きにくい。大型案件も制作リソースの制約から積極的に追わず、中規模案件に集中することで品質と収益性を両立する。',
      positioningComment: 'ストラテジーキャンバスの分析から、B木工製作所は「カスタム対応」（9点）と「素材品質」（9点）で最高水準を獲得しており、大手什器メーカーTや海外量産メーカーFとは明確に異なるポジションを確立している。\n\nポジショニングマップ「デザイン×価格」では、自社は左上の「高デザイン・プレミアム」象限に位置する。デザイン家具工房Aと近い位置にあるが、カスタム対応の総合力と施工力で差別化できている。海外量産メーカーFは右下の「低価格量産」、大手什器メーカーTは中間に位置する。\n\n「カスタム×施工」マップでは、自社が右上の「フルサービス」に最も近い位置にあり、カスタム対応力と施工力の両立で他社を大きく引き離している。大手什器メーカーTは施工力こそ高いがカスタム性に欠け、デザイン家具工房Aはカスタム性は高いが施工は外注。この「特注設計×自社製作×現場施工」のワンストップ対応は、デザインにこだわる飲食店・ホテル・建築家にとって最も価値の高いポジションである。',
      swotComment: 'B木工製作所のSWOT分析は、「ストーリー価値で勝負する木工メーカー」というポジショニングの正当性を裏付けている。伝統技法×CNC×素材選定力という3つの強みは、個別に競合できる企業はあっても、3つを束ねて「デザイン通訳」として機能できる体制は希少であり、これが建築家・設計事務所との協業ネットワークの源泉となっている。\n\n戦略の核心はSO戦略にある。飲食店・カフェ・ホテルの開業改装ラッシュに対し、デザイナーとの上流協業から入り込み、施工事例をSNSで波及させる循環を作る。サステナブル意識との接続（国産材・FSC認証）はオンリーワン領域の付加価値をさらに高める要素となる。一方、輸入家具・ゼネコン経由の大型案件との価格競争には引きずられないことが鉄則であり、ST/WT戦略では「戦わない領域の明示」が経営判断として重要になる。\n\n短期的に最も即効性のあるのはWO戦略、コンテンツマーケティングの強化である。施工事例だけでなく「素材調達ストーリー」「職人の手仕事」を可視化することで、価値共感型の顧客（建築家・施主）との接点を組織的に増やし、紹介依存の脆弱性を解消できる。',
      overallStrategy: '【エグゼクティブサマリー】\n\nB木工製作所のSTP分析結果は、同社が「デザイン×職人技×ワンストップ」という独自の競争空間を持つ特注木工メーカーであることを示している。\n\n■ 強みの核心\n伝統技法とCNC加工の融合、国産材の目利き力、デザイナーとの協業力の3つが有機的に結合し、量産メーカーにも低価格競合にも模倣困難な価値を提供している。\n\n■ ターゲット戦略\n「飲食店・カフェ×デザイン重視」と「建築家・設計事務所」をコアターゲットとし、デザインと品質で選ばれる高付加価値市場に集中する。ゼネコン入札・量産什器・コスト競争市場は意図的に回避。\n\n■ ポジショニング戦略\n「特注設計×職人品質×現場施工」のトリプルバリューで独自ポジションを確立。単なる家具製作所ではなく「空間づくりのパートナー」として建築家・デザイナーとの長期的な協業関係を構築する。\n\n■ 今後の重点施策\n1. ポートフォリオサイトとSNSの強化（施工事例の発信力向上）\n2. 建築家・デザイナー向けの工房見学会・素材勉強会の定期開催\n3. ホテル・旅館市場への段階的参入（設計事務所経由）\n4. サステナブル素材（間伐材・古材）を活用した独自ブランドの構築',
    },

    aiSettings: {
      provider: 'claude',
      apiKey: '',
      model: 'claude-sonnet-4-6',
      tone: 'formal',
    },
  };
}

/**
 * デモデータ: パン製造直売（BtoC・匿名化）
 * モデル企業を参考にした架空データです。
 */
export function createDemoProjectBakery() {
  return {
    settings: {
      projectName: 'Cベーカリー STP分析',
      companyName: 'Cベーカリー',
      marketType: 'btoc',
      productService: 'パンの製造および工場直売所での販売。名物の丹沢あんぱんを中心に、食パン・惣菜パン・菓子パンなど約50種類を製造。工場併設の直売所で焼きたてを提供。',
      businessDescription: '神奈川県秦野市で30年以上続く地域密着型ベーカリー。自社工場で毎日早朝から焼き上げるパンを、工場併設の直売所で販売。看板商品の「丹沢あんぱん」は地元産の丹沢小豆を使用し、年間12万個を販売するロングセラー。食パン・惣菜パン・菓子パン・ハード系パンなど常時約50種類をラインナップ。国産小麦（春よ恋・キタノカオリ）と自家製天然酵母にこだわり、添加物を極力使わない製法が特徴。直売所は毎朝7時オープンで、焼きたてパンの香りに誘われて近隣住民が行列を作る地元の名物店。法人向け（ホテル朝食・カフェ卸）の取引も拡大中。従業員18名（うちパン職人6名）、年商1.8億円。地元の小学校への食育授業やパン教室も定期開催し、地域貢献にも注力。',
    },

    step0: {
      categories: [
        // vc1: 製品企画・開発
        {
          id: 'vc1',
          items: [
            {
              id: 'vc1_0', name: '商品開発力',
              strength: '名物あんぱんを筆頭に50種類以上のレパートリー。季節限定商品や地元食材コラボなど、年間20種以上の新商品を開発。パン職人歴40年のベテランが監修。',
              communication: 'SNSや店頭POPで新商品情報を発信。地元メディアにも定期的に取り上げられる。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc1_1', name: 'レシピの独自性',
              strength: '創業以来守り続ける自家製あんこのレシピ。北海道産小豆を使用し、甘さ控えめの上品な味わいが特徴。食パンも独自配合で耳まで柔らかい。',
              communication: 'メディア取材時にストーリーとして紹介。日常的な発信は限定的。',
              communicationStatus: 'issue', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc1_2', name: '地元食材の活用',
              strength: '地元農家から直接仕入れた野菜・果物を使った季節パンが人気。地産地消の取り組みが地域メディアで評価。',
              communication: '店頭で産地表示。SNSで農家との関係を紹介。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc1_3', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc2: 製造
        {
          id: 'vc2',
          items: [
            {
              id: 'vc2_0', name: '製パン技術',
              strength: '大量生産と手作り品質を両立する独自の製造ライン。1日3,000個以上を製造しながら、主力商品は手成形にこだわり。低温長時間発酵で風味を引き出す技術。',
              communication: '工場見学や直売所のガラス越しに製造工程を公開。「見せる工場」として差別化。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc2_1', name: '焼きたてオペレーション',
              strength: '直売所営業中は1時間おきに焼きたてパンを陳列。「次の焼き上がり時刻」を掲示し、来店タイミングの分散と滞在時間の延長を実現。',
              communication: '店頭掲示とSNSのリアルタイム投稿で告知。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc2_2', name: '衛生管理',
              strength: 'HACCP対応の製造ラインを整備。衛生管理マニュアルに基づく徹底した品質管理体制。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc2_3', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc3: 販売・店舗
        {
          id: 'vc3',
          items: [
            {
              id: 'vc3_0', name: '工場直売価格',
              strength: '中間マージンを排除した工場直売価格。あんぱん1個120円、食パン1斤280円など、品質に対して圧倒的なコストパフォーマンス。',
              communication: '「工場直売だからこの価格」を店頭・チラシで訴求。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc3_1', name: '直売所の体験価値',
              strength: '製造工程が見えるガラス張りの直売所。焼きたての香りが店内に充満し、五感で楽しめる空間。試食コーナーやイートインスペースも完備。',
              communication: '口コミサイトやSNSで「工場見学気分で買い物できる」と自然拡散。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc3_2', name: '立地とアクセス',
              strength: '幹線道路沿いに位置し、大型駐車場（50台）完備。ドライブルートの途中にあり、観光客の立ち寄りスポットとして定着。',
              communication: 'Googleマップ・グルメサイトで高評価。ドライブ情報サイトにも掲載。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc3_3', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc4: マーケティング
        {
          id: 'vc4',
          items: [
            {
              id: 'vc4_0', name: '地域ブランド力',
              strength: '創業40年以上の歴史を持つ地域の名物パン屋として圧倒的な知名度。「あのパン屋さん」で通じるレベルのブランド認知。地元テレビ・雑誌での露出多数。',
              communication: 'メディア露出が自然にブランドを強化。ただしブランド戦略として体系的に管理はできていない。',
              communicationStatus: 'issue', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc4_1', name: 'SNS・口コミ',
              strength: 'Instagram フォロワー1.2万人。お客様の投稿（UGC）が月100件以上。Google口コミ4.3点（800件以上）。',
              communication: 'Instagramでの新商品告知と顧客投稿のリポスト中心。公式の発信頻度にムラあり。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc4_2', name: 'イベント・地域連携',
              strength: '地域の祭りやマルシェへの出店、小学校の社会科見学受け入れ、パン教室の開催など、地域密着型の活動を継続。',
              communication: '地元広報誌や町内掲示板で告知。デジタルでの告知は弱い。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc4_3', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc5: サービス・顧客対応
        {
          id: 'vc5',
          items: [
            {
              id: 'vc5_0', name: '地域顧客基盤',
              strength: '半径10km圏内に週1回以上来店するリピーターが推定3,000世帯。お客様の顔と好みを覚えているスタッフが多く、「うちのパン屋」として生活に組み込まれている。',
              communication: '接客を通じた口コミが最大のチャネル。ポイントカード会員は5,000人超。',
              communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
            },
            {
              id: 'vc5_1', name: '接客品質',
              strength: '「どのパンが焼きたて？」「子供向けはどれ？」など、スタッフが商品知識を持って応対。常連客との会話も大切にする温かい接客。',
              communication: '口コミで「スタッフが親切」と高評価。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc5_2', name: '予約・取り置き',
              strength: '電話予約による取り置きサービス。常連客の「いつものセット」を覚えているスタッフも。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc5_3', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc6: 調達・原材料
        {
          id: 'vc6',
          items: [
            {
              id: 'vc6_0', name: '原材料へのこだわり',
              strength: '国産小麦粉を主体に、北海道産バター、地元産卵など品質重視の調達。小豆は北海道十勝産を直接仕入れ。',
              communication: '店頭POPで「北海道産小豆使用」など表示。体系的な素材訴求は不足。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc6_1', name: 'コスト管理',
              strength: '大量仕入れによるスケールメリットと、直売による中間コスト削減で、高品質を低価格で実現。廃棄ロスは5%以下に管理。',
              communication: '',
              communicationStatus: 'none', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc6_2', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc7: 人材・組織
        {
          id: 'vc7',
          items: [
            {
              id: 'vc7_0', name: '職人チーム',
              strength: '製パン技能士1級保持者2名を含む職人8名体制。パン職人歴40年の創業者が技術指導。若手育成にも注力し、技術の世代間継承を推進。',
              communication: '求人サイトでアピール。顧客向けには「職人紹介」コーナーを店内に設置。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc7_1', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
        // vc8: 技術・ノウハウ
        {
          id: 'vc8',
          items: [
            {
              id: 'vc8_0', name: '発酵技術',
              strength: '低温長時間発酵を中心とした独自の発酵管理ノウハウ。季節・湿度に応じた微調整を熟練の感覚で行い、年間を通じて安定した味を実現。',
              communication: 'パン教室で一部を紹介。一般向けの発信は限定的。',
              communicationStatus: 'issue', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc8_1', name: 'あんこ製造技術',
              strength: '創業以来の自家製あんこ製造。小豆の浸水時間から火加減まで、マニュアル化が難しい職人技で独自の味を守り続けている。',
              communication: '「自家製あんこ」であることは訴求。製法の詳細は企業秘密として非公開。',
              communicationStatus: 'communicated', isStrengthFlag: false, isCustom: false,
            },
            {
              id: 'vc8_2', name: 'その他',
              strength: '',
              communication: '',
              communicationStatus: '', isStrengthFlag: false, isCustom: false,
            },
          ],
        },
      ],
      top5: [
        {
          id: 'vc2_0', name: '製パン技術', rank: 1,
          categoryName: '製造', categoryId: 'vc2',
          strength: '大量生産と手作り品質を両立する独自の製造ライン。1日3,000個以上を製造しながら、主力商品は手成形にこだわり。低温長時間発酵で風味を引き出す技術。',
          communication: '工場見学や直売所のガラス越しに製造工程を公開。「見せる工場」として差別化。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '量と質を両立する独自の製造体制は短期間で模倣できない技術資産。1日3,000個の生産量を維持しつつ主力商品は手成形を守る運用は、ベーカリー業界における差別化の根幹である。',
        },
        {
          id: 'vc4_0', name: '地域ブランド力', rank: 2,
          categoryName: 'マーケティング', categoryId: 'vc4',
          strength: '創業40年以上の歴史を持つ地域の名物パン屋として圧倒的な知名度。「あのパン屋さん」で通じるレベルのブランド認知。地元テレビ・雑誌での露出多数。',
          communication: 'メディア露出が自然にブランドを強化。ただしブランド戦略として体系的に管理はできていない。',
          communicationStatus: 'issue', isStrengthFlag: true, isCustom: false,
          reason: '40年以上の歴史と地域での圧倒的な認知は短期間で構築できない無形資産であり、新規参入者にとって最も模倣困難な競争優位。一方でブランド戦略として体系化されていない点は伸びしろでもある。',
        },
        {
          id: 'vc3_0', name: '工場直売価格', rank: 3,
          categoryName: '販売・店舗', categoryId: 'vc3',
          strength: '中間マージンを排除した工場直売価格。あんぱん1個120円、食パン1斤280円など、品質に対して圧倒的なコストパフォーマンス。',
          communication: '「工場直売だからこの価格」を店頭・チラシで訴求。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '製造小売モデルによる中間マージン排除は価格優位の構造的源泉。コンビニ・大手チェーンが模倣しにくいビジネスモデル自体の差別化要素である。',
        },
        {
          id: 'vc5_0', name: '地域顧客基盤', rank: 4,
          categoryName: 'サービス・顧客対応', categoryId: 'vc5',
          strength: '半径10km圏内に週1回以上来店するリピーターが推定3,000世帯。お客様の顔と好みを覚えているスタッフが多く、「うちのパン屋」として生活に組み込まれている。',
          communication: '接客を通じた口コミが最大のチャネル。ポイントカード会員は5,000人超。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: 'リピーター3,000世帯の生活インフラ化と顧客の顔・好みを記憶する接客は、価格やシステムで代替できない関係性資産。安定収益の最も信頼性の高い源泉である。',
        },
        {
          id: 'vc2_1', name: '焼きたてオペレーション', rank: 5,
          categoryName: '製造', categoryId: 'vc2',
          strength: '直売所営業中は1時間おきに焼きたてパンを陳列。「次の焼き上がり時刻」を掲示し、来店タイミングの分散と滞在時間の延長を実現。',
          communication: '店頭掲示とSNSのリアルタイム投稿で告知。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '来店タイミングの分散と滞在時間延長を意図的に設計したオペレーションは、コンビニ・大手チェーンが構造的に提供できない体験価値。客単価とリピート率を底上げする運営ノウハウ。',
        },
        {
          id: 'vc1_0', name: '商品開発力', rank: 6,
          categoryName: '製品企画・開発', categoryId: 'vc1',
          strength: '名物あんぱんを筆頭に50種類以上のレパートリー。季節限定商品や地元食材コラボなど、年間20種以上の新商品を開発。パン職人歴40年のベテランが監修。',
          communication: 'SNSや店頭POPで新商品情報を発信。地元メディアにも定期的に取り上げられる。',
          communicationStatus: 'communicated', isStrengthFlag: true, isCustom: false,
          reason: '年間20種以上の新商品開発は来店動機を継続的に生み出すエンジン。地元食材コラボはメディア露出の入口にもなり、飽きられないブランドを支える組織的な開発力である。',
        },
        {
          id: 'vc1_1', name: 'レシピの独自性', rank: 7,
          categoryName: '製品企画・開発', categoryId: 'vc1',
          strength: '創業以来守り続ける自家製あんこのレシピ。北海道産小豆を使用し、甘さ控えめの上品な味わいが特徴。食パンも独自配合で耳まで柔らかい。',
          communication: 'メディア取材時にストーリーとして紹介。日常的な発信は限定的。',
          communicationStatus: 'issue', isStrengthFlag: true, isCustom: false,
          reason: '創業以来の自家製あんこレシピは競合が模倣できない味の資産であり、名物あんぱんのブランド価値の源泉。価格でなく味で選ばれる理由そのものである。',
        },
      ],
    },

    step1: {
      selectedAxes: [
        { id: 'b2c_1', name: 'デモグラフィック属性', feature: '年齢・家族構成・居住地など顧客の基本属性でセグメント化。パン購入行動は家族構成に大きく左右される', note: '属性だけでは来店動機を捉えきれないため、行動変数との組み合わせが重要', priority: 'high' },
        { id: 'b2c_5', name: '来店目的・使用状況', feature: '日常の食事・レジャー・ギフト・体験など、来店目的によって購買行動と客単価が大きく異なる', note: '同一顧客でもシーンによって目的が変わるため、複数セグメントに属する場合がある', priority: 'high' },
        { id: 'b2c_4', name: 'ベネフィット', feature: '味・コスパ・体験・健康安全など、製品・サービスに求める価値でセグメント化', note: '顧客が求めるベネフィットは多様であり、自社の強みとの適合度を見極めることが重要', priority: 'high' },
        { id: 'b2c_13', name: '地域特性', feature: '商圏距離によって来店頻度・客単価・来店動機が異なる', note: '遠方客は高単価だが頻度が低い。地元客は安定売上の基盤', priority: 'medium' },
        { id: 'b2c_3', name: '購買頻度', feature: '来店頻度によって顧客のロイヤルティや売上貢献度が異なる', note: 'ヘビーユーザーの維持とライトユーザーの引き上げで異なるアプローチが必要', priority: 'medium' },
      ],
      segments: {
        'b2c_1': [
          { id: 'seg_b01', name: 'ファミリー層（子育て世帯）', memo: '大量買いが多く客単価が高い。子供向けパンのニーズ。週末の来店率が高い' },
          { id: 'seg_b02', name: 'シニア夫婦', memo: '平日の安定来店。購入量は少なめだが来店頻度は高い。食パン・あんぱんなど定番志向' },
          { id: 'seg_b03', name: '単身・若年層', memo: '来店頻度・購入額ともに低い。コンビニパンとの競合が激しい。SNS拡散力は高い' },
          { id: 'seg_b04', name: '観光・ドライブ客', memo: '客単価が最も高い（平均1,500円超）。SNS拡散力が強い。季節・天候に左右される' },
        ],
        'b2c_5': [
          { id: 'seg_b05', name: '日常の食事パン購入', memo: '最大の顧客層。価格感度が高い。食パン・惣菜パン中心。利便性を重視' },
          { id: 'seg_b06', name: 'お出かけ・レジャーの立ち寄り', memo: '休日・祝日中心。体験価値を求める。購入点数が多い。口コミ拡散力あり' },
          { id: 'seg_b07', name: '手土産・ギフト購入', memo: '単価が高い。パッケージ・見栄えを重視。名物あんぱんの詰め合わせが人気' },
          { id: 'seg_b08', name: '体験・工場見学目的', memo: '焼きたてパンと製造工程見学が目的。滞在時間が長く追加購入も多い' },
        ],
        'b2c_4': [
          { id: 'seg_b09', name: '味重視層（品質・おいしさ優先）', memo: '素材と製法にこだわる。リピート率が高い。口コミでの影響力大。多少高くても良いものを選ぶ' },
          { id: 'seg_b10', name: 'コスパ重視層（価格×品質のバランス）', memo: '工場直売価格を評価。来店頻度が高い。大量購入傾向。チラシ・セールに反応しやすい' },
          { id: 'seg_b11', name: '体験重視層（焼きたて・工場見学の楽しさ）', memo: '五感で楽しむ消費。SNS投稿率が高い。イベントや限定商品への反応が良い' },
          { id: 'seg_b12', name: '健康・安全重視層（原材料・添加物を気にする）', memo: '国産・無添加を重視。価格よりも安心感。自然食品店・オーガニック店と比較する層' },
        ],
        'b2c_13': [
          { id: 'seg_b13', name: '地元住民（半径5km圏内）', memo: '週1〜2回の定期来店。「うちのパン屋」として生活に組み込まれている。ポイントカード利用率高' },
          { id: 'seg_b14', name: '近隣住民（5〜20km圏）', memo: '月1〜2回。車で来店。まとめ買い傾向。わざわざ来る動機づけが必要' },
          { id: 'seg_b15', name: '遠方からの来訪者（20km以上）', memo: '観光・ドライブ客と重複が多い。SNS・メディア経由で認知。年数回だが高単価' },
        ],
        'b2c_3': [
          { id: 'seg_b16', name: 'ヘビーユーザー（週2回以上）', memo: '売上の柱。推定3,000世帯。顔なじみが多い。新商品のお試し率も高い' },
          { id: 'seg_b17', name: 'レギュラー（週1回程度）', memo: '安定顧客層。曜日固定の来店パターン。来店頻度の引き上げ余地あり' },
          { id: 'seg_b18', name: 'ライトユーザー（月1〜2回）', memo: '潜在顧客。来店のきっかけ作りが課題。イベントや季節限定で誘引可能' },
        ],
      },
    },

    step2: {
      candidates: [
        {
          id: 'tc_b1', name: '観光・ドライブ客×お出かけ・レジャーの立ち寄り×体験重視層（焼きたて・工場見学の楽しさ）',
          segments: [
            { axisId: 'b2c_1', axisName: 'デモグラフィック属性', segName: '観光・ドライブ客' },
            { axisId: 'b2c_5', axisName: '来店目的・使用状況', segName: 'お出かけ・レジャーの立ち寄り' },
            { axisId: 'b2c_4', axisName: 'ベネフィット', segName: '体験重視層（焼きたて・工場見学の楽しさ）' },
          ],
          memo: '客単価最高（平均1,500円超）。SNS拡散力が強く、幹線道路沿い・大型駐車場・ガラス張り工場がフィット。',
        },
        {
          id: 'tc_b2', name: '味重視層（品質・おいしさ優先）×ヘビーユーザー（週2回以上）',
          segments: [
            { axisId: 'b2c_4', axisName: 'ベネフィット', segName: '味重視層（品質・おいしさ優先）' },
            { axisId: 'b2c_3', axisName: '購買頻度', segName: 'ヘビーユーザー（週2回以上）' },
          ],
          memo: '製パン技術と素材へのこだわりを最も正当に評価。リピート率が高く口コミエンジン。',
        },
        {
          id: 'tc_b3', name: 'ファミリー層（子育て世帯）×日常の食事パン購入×コスパ重視層（価格×品質のバランス）',
          segments: [
            { axisId: 'b2c_1', axisName: 'デモグラフィック属性', segName: 'ファミリー層（子育て世帯）' },
            { axisId: 'b2c_5', axisName: '来店目的・使用状況', segName: '日常の食事パン購入' },
            { axisId: 'b2c_4', axisName: 'ベネフィット', segName: 'コスパ重視層（価格×品質のバランス）' },
          ],
          memo: '日常利用の安定客。大量買いで客単価が高い。子供向けパンで差別化。',
        },
        {
          id: 'tc_b4', name: '手土産・ギフト購入×遠方からの来訪者（20km以上）',
          segments: [
            { axisId: 'b2c_5', axisName: '来店目的・使用状況', segName: '手土産・ギフト購入' },
            { axisId: 'b2c_13', axisName: '地域特性', segName: '遠方からの来訪者（20km以上）' },
          ],
          memo: '丹沢あんぱんの名物ブランドで高単価ギフト需要。観光シーズンに集中。',
        },
        {
          id: 'tc_b5', name: '単身・若年層×コスパ重視層（価格×品質のバランス）',
          segments: [
            { axisId: 'b2c_1', axisName: 'デモグラフィック属性', segName: '単身・若年層' },
            { axisId: 'b2c_4', axisName: 'ベネフィット', segName: 'コスパ重視層（価格×品質のバランス）' },
          ],
          memo: '立地の不便さから取り込みにくい。コンビニに流れやすい層。',
        },
      ],
      axes: [
        { id: 'ta1', name: '市場規模', description: 'そのセグメントの顧客数・売上ポテンシャル', weight: 'medium', sixR: 'Realistic Scale' },
        { id: 'ta2', name: '成長性', description: '今後3〜5年でそのセグメントは拡大するか', weight: 'high', sixR: 'Rate of Growth' },
        { id: 'ta3', name: '競合の強さ', description: '既存プレーヤーが強いか（弱いほど高評価）', weight: 'medium', sixR: 'Rival' },
        { id: 'ta4', name: '自社適合性', description: '自社の強み・リソースとの親和性', weight: 'high', sixR: 'Rank' },
        { id: 'ta5', name: '到達可能性', description: 'そのセグメントに効果的にアプローチできるか', weight: 'medium', sixR: 'Reach' },
        { id: 'ta6', name: '収益性', description: '客単価・粗利率など収益を確保しやすいか', weight: 'high', sixR: 'Response' },
      ],
      scores: {
        'tc_b1_ta1': 4, 'tc_b1_ta2': 4, 'tc_b1_ta3': 3, 'tc_b1_ta4': 5, 'tc_b1_ta5': 4, 'tc_b1_ta6': 5,
        'tc_b2_ta1': 4, 'tc_b2_ta2': 3, 'tc_b2_ta3': 3, 'tc_b2_ta4': 5, 'tc_b2_ta5': 3, 'tc_b2_ta6': 5,
        'tc_b3_ta1': 4, 'tc_b3_ta2': 3, 'tc_b3_ta3': 3, 'tc_b3_ta4': 4, 'tc_b3_ta5': 4, 'tc_b3_ta6': 4,
        'tc_b4_ta1': 3, 'tc_b4_ta2': 3, 'tc_b4_ta3': 2, 'tc_b4_ta4': 4, 'tc_b4_ta5': 3, 'tc_b4_ta6': 4,
        'tc_b5_ta1': 2, 'tc_b5_ta2': 3, 'tc_b5_ta3': 4, 'tc_b5_ta4': 2, 'tc_b5_ta5': 2, 'tc_b5_ta6': 2,
      },
      targets: {
        'tc_b1': { label: 'main', reason: '客単価が最も高く（平均1,500円超）、SNSでの拡散力が非常に強い。幹線道路沿いの立地・大型駐車場・ガラス張り工場という当社のハード面の強みと、名物あんぱん・焼きたて体験というソフト面の強みが最もフィットする。' },
        'tc_b2': { label: 'main', reason: '当社の製パン技術と素材へのこだわりを最も正当に評価してくれる層。リピート率が高く口コミの発信力も強い。新規顧客獲得のエンジンとなる。' },
        'tc_b3': { label: 'sub', reason: '日常利用の安定客。大量買いが多く客単価が高い。子供向けパンの品揃えで差別化可能。' },
        'tc_b4': { label: 'sub', reason: '丹沢あんぱんの名物ブランドで高単価ギフト需要。季節変動が大きいが単価は高い。' },
        'tc_b5': { label: 'none' },
      },
    },

    step3: {
      kbf: [
        { id: 'kbf_b1', name: '品質・おいしさ', importance: 'high' },
        { id: 'kbf_b2', name: '価格の手頃さ', importance: 'high' },
        { id: 'kbf_b3', name: '品揃え・種類', importance: 'medium' },
        { id: 'kbf_b4', name: '体験価値・エンタメ性', importance: 'high' },
        { id: 'kbf_b5', name: 'アクセス・利便性', importance: 'medium' },
        { id: 'kbf_b6', name: 'ブランド・知名度', importance: 'low' },
      ],
      competitors: [
        { id: 'comp_1', name: 'チェーンベーカリーP', scale: '大手' },
        { id: 'comp_2', name: '個人ブーランジェリーY', scale: '中小' },
        { id: 'comp_3', name: '大手コンビニS', scale: '大手' },
        { id: 'comp_4', name: '道の駅パン工房H', scale: '中堅' },
      ],
      axes: [
        { id: 'pa_0', name: '品質・おいしさ' },
        { id: 'pa_1', name: '価格の手頃さ' },
        { id: 'pa_2', name: '品揃え・種類' },
        { id: 'pa_3', name: '体験価値・エンタメ性' },
        { id: 'pa_4', name: 'アクセス・利便性' },
        { id: 'pa_5', name: 'ブランド・知名度' },
      ],
      scores: {
        // Cベーカリー（自社）
        'self_pa_0': 7, 'self_pa_1': 9, 'self_pa_2': 7, 'self_pa_3': 9, 'self_pa_4': 4, 'self_pa_5': 6,
        // チェーンベーカリーP（ポンパドウルをモデル）
        'comp_1_pa_0': 7, 'comp_1_pa_1': 5, 'comp_1_pa_2': 8, 'comp_1_pa_3': 4, 'comp_1_pa_4': 8, 'comp_1_pa_5': 8,
        // 個人ブーランジェリーY（ブーランジェリーヤマシタをモデル）
        'comp_2_pa_0': 9, 'comp_2_pa_1': 3, 'comp_2_pa_2': 5, 'comp_2_pa_3': 6, 'comp_2_pa_4': 3, 'comp_2_pa_5': 5,
        // 大手コンビニS（セブン-イレブンをモデル）
        'comp_3_pa_0': 5, 'comp_3_pa_1': 7, 'comp_3_pa_2': 7, 'comp_3_pa_3': 1, 'comp_3_pa_4': 10, 'comp_3_pa_5': 10,
        // 道の駅パン工房H（道の駅清川をモデル）
        'comp_4_pa_0': 7, 'comp_4_pa_1': 7, 'comp_4_pa_2': 3, 'comp_4_pa_3': 7, 'comp_4_pa_4': 3, 'comp_4_pa_5': 3,
      },
      maps: [
        { id: 'map1', name: '品質 × 価格', xAxis: 'pa_1', yAxis: 'pa_0' },
        { id: 'map2', name: '品質 × 体験', xAxis: 'pa_3', yAxis: 'pa_0' },
        { id: 'map3', name: '利便性 × 体験', xAxis: 'pa_4', yAxis: 'pa_3' },
      ],
      quadrantLabels: {
        'map1_topLeft': '高品質・高価格\n（高級ブーランジェリー）',
        'map1_topRight': '高品質・手頃\n（当社の強み）',
        'map1_bottomLeft': '低品質・高価格\n（存在困難）',
        'map1_bottomRight': '手頃だが品質普通\n（コンビニ・量販）',
        'map2_topLeft': '高品質・低体験\n（こだわりパン屋）',
        'map2_topRight': '高品質・高体験\n（当社の目標）',
        'map2_bottomLeft': '低品質・低体験\n（コンビニ）',
        'map2_bottomRight': '体験重視・品質並\n（観光施設）',
        'map3_topLeft': '不便だが体験◎\n（目的地型）',
        'map3_topRight': '便利で体験◎\n（理想形）',
        'map3_bottomLeft': '不便で体験△\n（淘汰対象）',
        'map3_bottomRight': '便利だが体験△\n（日常使い）',
      },
    },

    swot: {
      // Step0で選定した強みTop（7件）に対応した文章。並び順はtop5のrank順
      strengths: [
        '【製パン技術】1日3,000個以上を製造しながら主力商品は手成形を維持する製パン技術',
        '【地域ブランド力】創業40年以上の歴史と「あのパン屋さん」で通じる圧倒的な地域ブランド認知',
        '【工場直売価格】中間マージン排除による工場直売価格（あんぱん1個120円・食パン1斤280円の価格優位）',
        '【地域顧客基盤】半径10km圏内に週1回以上来店するリピーター推定3,000世帯の安定基盤',
        '【焼きたてオペレーション】1時間おきの焼きたて陳列と「次の焼き上がり時刻」掲示による滞在価値演出',
        '【商品開発力】年間20種以上の新商品開発と地元食材コラボ（50種類以上のレパートリー）',
        '【レシピの独自性】創業以来の自家製あんこレシピと北海道産小豆による名物あんぱんの味',
      ],
      weaknesses: [
        '立地が幹線道路沿いで、徒歩圏の地元住民取り込みが構造的に限定的',
        'レシピの独自性・素材へのこだわりがメディア取材時のみ伝わり、日常発信が弱い',
        '主力客層が観光客・ファミリー層に偏り、シニア・若年層の取り込みが手薄',
        'ECや通販対応が限定的で、商圏外への販路拡大が進んでいない',
        '人気商品の品切れや行列が発生し、機会損失が顕在化している',
        'ブランド戦略が体系化されておらず、メディア露出頼みの受け身の発信になっている',
      ],
      opportunities: [
        '観光・ドライブ需要の回復とSNS拡散による広域集客の拡大',
        '地産地消・無添加志向の継続的な拡大（地元食材コラボの機会）',
        '体験消費（工場見学・焼きたて）への関心の高まり',
        '手土産・ギフト市場の高単価化（特に名物ブランドへの需要）',
        '地元食材コラボや新商品ストーリーによる地域メディア露出の機会',
        '冷凍パン・お取り寄せ市場の拡大による商圏外販売のチャンス',
      ],
      threats: [
        'コンビニベーカリー・大手チェーンとの価格・利便性競争',
        '小麦粉・バター等の原材料費高騰（円安・輸入依存）',
        '観光需要の季節・天候依存リスク',
        '若年層・単身世帯の主食パン消費減少傾向',
        'パン職人・店舗スタッフの採用難（地方の人材難）',
        '近隣への大型商業施設・競合ベーカリー出店による商圏侵食リスク',
      ],
      // クロスSWOTの4視点から導き出した戦略オプション（type: so/st/wo/wt、effect/feasibility: 高/中/低）
      strategyOptions: [
        {
          id: 'demo_c_opt1', type: 'so',
          text: '焼きたて体験と工場見学を「インスタ映えする体験消費」として観光客向けに磨き込む。SNS拡散を狙ったフォトスポット設置と限定商品で滞在時間・客単価を伸ばし、口コミによる広域集客を加速させる。地元食材コラボ商品で地域メディア露出も継続的に獲得する。',
          effect: '高', feasibility: '高',
        },
        {
          id: 'demo_c_opt2', type: 'so',
          text: 'パン作り体験・工場見学ツアーを有料プログラム化し、体験消費ニーズを客単価と滞在時間の向上につなげる。体験参加者がSNS発信の担い手となる仕組みを作り、ファミリー層のリピート来店にも波及させる。',
          effect: '中', feasibility: '高',
        },
        {
          id: 'demo_c_opt3', type: 'st',
          text: 'コンビニ・大手チェーンが提供できない「焼きたて・手成形・体験」という3点セットで差別化する。原材料高騰には主力商品の価値訴求（北海道産小豆・自家製あんこ等）で対応し、価格より価値で選ばれるブランドを目指して、価格競争に巻き込まれない関係性を維持する。',
          effect: '高', feasibility: '中',
        },
        {
          id: 'demo_c_opt4', type: 'wo',
          text: '日常発信の弱さを解消するため、新商品ストーリーや地元食材コラボを毎週SNS発信する習慣を作る。地元住民向けロイヤルティアプリ・ポイント制度の導入で、観光客頼みの客層構造を是正し、平日の安定売上を底上げする。',
          effect: '中', feasibility: '高',
        },
        {
          id: 'demo_c_opt5', type: 'wt',
          text: 'ECや通販は名物あんぱん等の日持ち商品に絞って慎重に展開し、観光に依存しない商圏外売上の柱を育てる。季節変動はギフト需要と季節限定商品で平準化し、人材難に対しては作業の標準化・多能工化と「見せる工場」の体験価値を採用ブランディングに活用する。',
          effect: '中', feasibility: '中',
        },
      ],
      skipped: false,
    },

    aiComments: {
      strengthSummary: 'Cベーカリーの最大の強みは、「製造×直売×体験」の三位一体モデルにある。パン職人歴40年のベテランが率いる製パンチームは、創業以来守り続ける自家製あんこのレシピと低温長時間発酵技術によって、大量生産と手作り品質を両立させている。1日3,000個以上を製造しながら主力商品は手成形にこだわるという、量と質のバランスが他社にない独自性である。\n\n直売モデルによる中間マージンの排除は、あんぱん1個120円という圧倒的なコストパフォーマンスを実現。これに工場併設のガラス張り直売所での「焼きたて体験」が加わり、品質・価格・体験の3要素で顧客を惹きつけるビジネスモデルが完成している。\n\n一方で課題もある。ブランド認知は地元では圧倒的だが、体系的なブランド戦略としての管理ができておらず、SNS発信にもムラがある。メディア露出への依存度が高く、自律的なデジタルマーケティングの構築が求められる。',
      targetingRationale: 'メインターゲットとして「観光・ドライブ客」と「味重視層」を選定した。観光・ドライブ客は、客単価が全セグメント中最も高く（平均購入額1,500円超）、SNSでの拡散力が非常に強い。幹線道路沿いの立地・大型駐車場・ガラス張り工場という当社のハード面の強みと、名物あんぱん・焼きたて体験というソフト面の強みが最もフィットするセグメントである。\n\n味重視層は、当社の製パン技術と素材へのこだわりを最も正当に評価してくれるセグメントであり、リピート率が高い。口コミの発信力も強く、新規顧客獲得のエンジンとなっている。\n\nサブターゲットとしてファミリー層・日常利用客・体験重視層を設定し、平日の安定売上と休日の高単価を組み合わせた収益構造を目指す。単身・若年層とコンビニ利用層は、価格・利便性での競争が厳しいため、積極的なアプローチ対象からは外している。',
      positioningComment: 'ストラテジーキャンバスの分析から、Cベーカリーは「体験価値・エンタメ性」（9点）と「価格の手頃さ」（9点）で最高水準を獲得し、この2軸で全競合を引き離している。「品質・おいしさ」（7点）でもチェーンベーカリーPと同水準を維持し、価格・品質・体験の3軸での総合力が最大の差別化ポイントとなっている。\n\nポジショニングマップ「品質×価格」では、自社は右上の「高品質・手頃」象限に位置し、独自のポジションを確立。個人ブーランジェリーYは品質は最高水準だが価格も高く（左上）、大手コンビニSは手頃だが品質で劣る（右下）と、いずれも自社の象限には到達できていない。チェーンベーカリーPは品質は同等だが価格面で自社に及ばない。\n\n「品質×体験」マップでは、自社が右上の「高品質・高体験」に唯一位置しており、製造現場が見えるガラス張り直売所という体験価値で圧倒的な差別化を実現。道の駅パン工房Hが体験で一定のスコアを持つが、品揃え面で自社に及ばない。',
      swotComment: 'CベーカリーのSWOT分析は、「立地・ハード×焼きたて体験×名物ブランド」という3点セットが、観光・ドライブ客の高単価市場で最も価値を発揮することを示している。コンビニベーカリーや大手チェーンが提供できない「五感で楽しむ消費体験」は、SNS拡散とリピート購買の両方を駆動するエンジンであり、これが客単価1,500円超を支える根拠となっている。\n\n戦略の核心はSO戦略にある。観光客の体験消費需要に対し、工場見学・焼きたて陳列・フォトスポットを「インスタ映えする体験」として磨き込み、地産地消やコラボ商品で地域メディア露出を獲得し、口コミによる広域集客を加速させる。一方、観光客頼みの客層構造には季節・天候リスクが内在するため、WO/WT戦略では地元住民向けロイヤルティ施策と日持ち商品のEC化で平準化を図ることが必要である。\n\n短期的に最も即効性が高いのはWO戦略、すなわち日常発信の組織化である。新商品ストーリーや素材へのこだわりを毎週発信する習慣を作り、メディア取材依存の発信構造から脱却することで、地元住民の認知再構築と観光客集客の両輪体制を確立できる。',
      overallStrategy: '【エグゼクティブサマリー】\n\nCベーカリーのSTP分析結果は、同社が「製造直売×焼きたて体験×名物パン」という三位一体の競争優位を持つ、地域を代表するパン製造直売所であることを示している。\n\n■ 強みの核心\n40年にわたる製パン技術と自家製あんこのレシピ、工場直売による圧倒的コストパフォーマンス、そしてガラス張り工場での焼きたて体験。この3要素の組み合わせは、チェーンベーカリーPのような大手にもこだわりの個人ブーランジェリーYにも模倣困難である。\n\n■ ターゲット戦略\n「観光・ドライブ客」と「味重視層」をメインターゲットとし、名物パンと体験価値で高単価・高拡散を実現。ファミリー層・日常利用客をサブターゲットとして安定売上を確保する二層構造。\n\n■ ポジショニング戦略\n「高品質×手頃な価格×高い体験価値」のトリプルバリューで、品質では個人ブーランジェリーYに匹敵し、価格では大手コンビニSに迫り、体験では全競合を凌駕する独自ポジションを確立。\n\n■ 今後の重点施策\n1. SNS・デジタルマーケティングの体系的強化（特にInstagram・Googleマップの活用）\n2. 名物あんぱんのブランド化推進（パッケージリニューアル・ギフト展開）\n3. 観光客向け体験プログラムの拡充（パン作り体験・季節イベント）\n4. ECサイト開設による商圏拡大（冷凍パン・焼き菓子の通販）',
    },

    aiSettings: {
      provider: 'claude',
      apiKey: '',
      model: 'claude-sonnet-4-6',
      tone: 'formal',
    },
  };
}
