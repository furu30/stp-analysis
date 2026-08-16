/**
 * AI企業リサーチサービス
 * 企業名と事業内容からSTP分析のドラフトを3フェーズで自動生成する。
 */

import {
  VALUE_CHAIN_CATEGORIES,
  BTOB_SEGMENTS,
  BTOC_SEGMENTS,
  DEFAULT_TARGETING_AXES,
  DEFAULT_POSITIONING_AXES_BTOB,
  DEFAULT_POSITIONING_AXES_BTOC,
} from '../data/defaultData';
import { parseAIJson } from './aiPrompt';

// ---------------------------------------------------------------------------
// プロンプト配布方式（課題M-01）
// APIは叩かない。プロンプトを組み立て、ユーザーが貼り戻した回答を正規化するだけ。
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 共通の役割指定
// チャットに貼り付ける方式ではsystemロールが使えないため、プロンプト本文の先頭に置く
// ---------------------------------------------------------------------------

const ROLE_PROMPT = `あなたは経営コンサルタント兼マーケティング戦略の専門家です。
企業のSTP（セグメンテーション・ターゲティング・ポジショニング）分析を行います。
指定されたJSON形式のみを出力してください。説明文や前置きは不要です。
（\`\`\`json のコードブロックで囲むのは構いません）
日本語で分析してください。`;

// ---------------------------------------------------------------------------
// Phase 1: 強み分析（step0）
// ---------------------------------------------------------------------------

function buildPhase1Prompt(companyName, productService, marketType) {
  // カテゴリ構造をコンパクトに記述
  const catDesc = VALUE_CHAIN_CATEGORIES.map(c => {
    const items = c.items.map((name, i) => `${c.id}_${i}:"${name}"`).join(', ');
    return `${c.id}(${c.name}): [${items}]`;
  }).join('\n');

  return `## 対象企業
企業名: ${companyName}
事業内容: ${productService}
市場タイプ: ${marketType === 'btob' ? 'BtoB（企業間取引）' : 'BtoC（消費者向け）'}

## タスク
この企業のバリューチェーン分析（ポーターモデル8区分）を実施してください。
各カテゴリの各項目について、この企業の強み・特徴を推定し、分析結果を生成してください。
すべての項目に内容を記入する必要はありません。強みが明確な項目のみ詳しく記入し、それ以外は空文字列としてください。
最後にTopの強みを5〜7個選定し、rank（1〜7）を付与してください。

## バリューチェーン カテゴリ構造（id, 項目名は必ずこの通りに）
${catDesc}

## 出力JSON形式
{
  "marketType": "${marketType}",
  "categories": [
    {
      "id": "vc1",
      "items": [
        {
          "id": "vc1_0",
          "name": "調達力",
          "strength": "この企業の強みの説明（50-150字）。強みがない/不明な場合は空文字列",
          "communication": "強みの対外発信状況（30-100字）。強みがない場合は空文字列",
          "communicationStatus": "communicated|issue|none または空文字列",
          "isStrengthFlag": false,
          "isCustom": false
        }
      ]
    }
  ],
  "top5": [
    {
      "id": "vc2_0",
      "name": "製造技術",
      "rank": 1,
      "categoryName": "製造・オペレーション",
      "categoryId": "vc2",
      "strength": "(strengthと同じ値)",
      "communication": "(communicationと同じ値)",
      "communicationStatus": "communicated",
      "isStrengthFlag": true,
      "isCustom": false,
      "reason": "Top5に選んだ理由（50-100字）"
    }
  ]
}

## 制約
- categoriesは必ず8カテゴリ（vc1〜vc8）を含める
- 各カテゴリのitemsはデフォルト項目数を維持（vc1:4個, vc2:6個, vc3:5個, vc4:6個, vc5:5個, vc6:5個, vc7:5個, vc8:5個）
- Top強みに選んだ項目のisStrengthFlagをtrueにする
- top5は5〜7個（重要なものから順に。5個で十分な場合は5個でよい）
- "その他"項目は基本的にstrengthを空文字列とする
- JSONのみ出力。説明文不要。`;
}

// ---------------------------------------------------------------------------
// Phase 2: セグメンテーション（step1）
// ---------------------------------------------------------------------------

function buildPhase2Prompt(companyName, productService, marketType, top5Summary) {
  const segments = marketType === 'btob' ? BTOB_SEGMENTS : BTOC_SEGMENTS;
  const axesList = segments.map(s => `${s.id}: ${s.name} - ${s.feature.slice(0, 60)}`).join('\n');

  return `## 対象企業
企業名: ${companyName}
事業内容: ${productService}
市場タイプ: ${marketType === 'btob' ? 'BtoB' : 'BtoC'}

## 主要な強み（Top5）
${top5Summary}

## タスク
この企業に最適なセグメンテーション軸を4〜6個選択し、各軸に3〜4個のセグメントを定義してください。
企業の強みが活かせる市場を的確にセグメント化することが重要です。

## 利用可能なセグメンテーション軸（この中から選択）
${axesList}

## 出力JSON形式
{
  "selectedAxes": [
    {
      "id": "${marketType === 'btob' ? 'b2b_1' : 'b2c_1'}",
      "name": "（軸名）",
      "feature": "この企業にとっての軸の意味を50-100字で説明",
      "note": "この軸を使う際の注意点を30-80字で説明",
      "priority": "high|medium|low"
    }
  ],
  "segments": {
    "${marketType === 'btob' ? 'b2b_1' : 'b2c_1'}": [
      { "id": "seg_001", "name": "セグメント名", "memo": "セグメントの特徴説明（30-80字）" }
    ]
  }
}

## 制約
- selectedAxesは4〜6個
- 各軸のidは利用可能リストのidを使用すること（${marketType === 'btob' ? 'b2b_1〜b2b_16' : 'b2c_1〜b2c_16'}）
- priorityはhighを1〜2個、mediumを2〜3個、lowを0〜1個
- segmentsのキーはselectedAxesのidと一致させる
- セグメントidはseg_001から連番（全軸で通し番号）
- 各軸に3〜4個のセグメント
- JSONのみ出力。`;
}

// ---------------------------------------------------------------------------
// Phase 3: ターゲティング＆ポジショニング（step2 + step3）
// ---------------------------------------------------------------------------

function buildPhase3Prompt(companyName, productService, marketType, top5Summary, segmentsInfo) {
  const posAxes = marketType === 'btob' ? DEFAULT_POSITIONING_AXES_BTOB : DEFAULT_POSITIONING_AXES_BTOC;

  return `## 対象企業
企業名: ${companyName}
事業内容: ${productService}
市場タイプ: ${marketType === 'btob' ? 'BtoB' : 'BtoC'}

## 主要な強み（Top5）
${top5Summary}

## セグメント一覧
${segmentsInfo}

## タスク
### Part A: ターゲット候補の作成と評価（step2）
まず、セグメント一覧から**軸をまたいで掛け合わせ**、ターゲット候補を4〜5個つくってください。
候補とは「顧客の業界 × 製品の特性 × ロットサイズ」のように、複数の軸からセグメントを1つずつ選んだ組み合わせです。
次に、各候補を6つの評価軸で1〜5点で評価し、メイン/サブ/対象外に分類してください。
メインは1〜2個、サブは2〜3個が目安です。

### Part B: ポジショニング分析（step3）
3〜5社の競合企業を特定し、6つのポジショニング軸で自社と競合を1〜10点で評価。
3つのポジショニングマップを設計してください。

## ターゲティング評価軸（固定）
ta1:市場規模, ta2:成長性, ta3:競合の少なさ／参入余地(競合が弱いほど高評価), ta4:自社適合性, ta5:到達可能性, ta6:収益性

## ポジショニング軸のデフォルト
${posAxes.map((name, i) => `pa_${i}: ${name}`).join(', ')}
※企業に合わせて軸名を変更してください。

## 出力JSON形式
{
  "step2": {
    "axes": [
      { "id": "ta1", "name": "市場規模", "description": "そのセグメントの顧客数・売上ポテンシャル", "weight": "high|medium|low" }
    ],
    "candidates": [
      {
        "id": "tc_1",
        "name": "候補名（掛け合わせが分かる短い名前）",
        "segments": [
          { "axisId": "b2b_1", "segName": "セグメント一覧にある名前と完全一致させる" },
          { "axisId": "b2b_2", "segName": "同上" }
        ],
        "memo": "この候補の特徴・狙う理由（30-80字）"
      }
    ],
    "scores": {
      "tc_1_ta1": 3,
      "tc_1_ta2": 4
    },
    "targets": {
      "tc_1": { "label": "main", "persona": "ペルソナ名", "reason": "選定理由（50-100字）" },
      "tc_2": { "label": "sub" },
      "tc_3": { "label": "none" }
    }
  },
  "step3": {
    "competitors": [
      { "id": "comp_1", "name": "競合企業名（匿名化）", "scale": "大手|中堅|中小|海外大手" }
    ],
    "axes": [
      { "id": "pa_0", "name": "${posAxes[0]}" },
      { "id": "pa_1", "name": "${posAxes[1]}" },
      { "id": "pa_2", "name": "${posAxes[2]}" },
      { "id": "pa_3", "name": "${posAxes[3]}" },
      { "id": "pa_4", "name": "${posAxes[4]}" },
      { "id": "pa_5", "name": "${posAxes[5]}" }
    ],
    "scores": {
      "self_pa_0": 8,
      "comp_1_pa_0": 7
    },
    "maps": [
      { "id": "map1", "name": "マップ名", "xAxis": "pa_0", "yAxis": "pa_1" },
      { "id": "map2", "name": "マップ名", "xAxis": "pa_2", "yAxis": "pa_3" },
      { "id": "map3", "name": "マップ名", "xAxis": "pa_4", "yAxis": "pa_5" }
    ],
    "quadrantLabels": {
      "map1_topLeft": "左上の象限名",
      "map1_topRight": "右上の象限名",
      "map1_bottomLeft": "左下の象限名",
      "map1_bottomRight": "右下の象限名",
      "map2_topLeft": "...", "map2_topRight": "...", "map2_bottomLeft": "...", "map2_bottomRight": "...",
      "map3_topLeft": "...", "map3_topRight": "...", "map3_bottomLeft": "...", "map3_bottomRight": "..."
    }
  }
}

## 制約
- step2.axesは6個固定（ta1〜ta6）、weightはhigh2個,medium2個,low2個を目安
- step2.candidatesは4〜5個、idは tc_1 から連番
- 各候補のsegmentsは2〜4軸ぶん。axisIdは「セグメント一覧」に出てくる軸のid、segNameはその軸に属するセグメント名と完全一致させる
- 同じ軸から2つ以上のセグメントを1つの候補に入れないこと
- step2.scoresは全候補×6軸分のキーが必要（形式: tc_1_ta1）
- step2.targetsは全候補分のキーが必要
- mainターゲットにはpersonaとreasonを付与。sub/noneはlabelのみでOK
- step3.competitorsは3〜5社、idはcomp_1から連番
- step3.axesは6個、idはpa_0〜pa_5
- step3.scoresはself + 全競合 × 6軸（形式: self_pa_0, comp_1_pa_0）、値は1〜10
- step3.mapsは3個、idはmap1〜map3、xAxisとyAxisはpa_0〜pa_5から選択
- 競合企業名は実在企業を匿名化した形式（例: 大手メーカーO、中堅工具メーカーN）
- JSONのみ出力。`;
}

// ---------------------------------------------------------------------------
// ヘルパー: コンテキスト要約生成
// ---------------------------------------------------------------------------

function summarizeTop5(top5) {
  if (!top5 || top5.length === 0) return '（なし）';
  return top5.map(t => `${t.rank}. ${t.name}（${t.categoryName}）: ${t.strength.slice(0, 80)}`).join('\n');
}

function summarizeSegments(step1) {
  if (!step1?.selectedAxes?.length) return '（なし）';
  return step1.selectedAxes.map(ax => {
    const segs = (step1.segments[ax.id] || []).map(s => `${s.id}:${s.name}`).join(', ');
    return `${ax.id}(${ax.name})[${ax.priority}]: ${segs}`;
  }).join('\n');
}


// ---------------------------------------------------------------------------
// フェーズ定義
// ---------------------------------------------------------------------------

export const PHASES = [
  {
    id: 1,
    name: '強み分析（バリューチェーン）',
    lead: 'バリューチェーンの各工程から強みを洗い出し、Top5を選定してもらいます。',
    requires: null,
  },
  {
    id: 2,
    name: 'セグメンテーション',
    lead: 'Phase 1 で選ばれたTop5の強みを踏まえて、市場の切り口とセグメントを出してもらいます。',
    requires: 1,
  },
  {
    id: 3,
    name: 'ターゲティング & ポジショニング',
    lead: 'Phase 2 のセグメントを踏まえて、6R評価・ターゲット選定・競合比較まで出してもらいます。',
    requires: 2,
  },
];

// ---------------------------------------------------------------------------
// フェーズごとのプロンプト組み立て
//
// 各フェーズのプロンプトは自己完結している（前フェーズの結果はアプリ側が要約して
// 埋め込む）。そのためユーザーは同じチャットを開き続ける必要がなく、途中で閉じても
// プロジェクトに取り込み済みのデータから続きを再開できる。
// ---------------------------------------------------------------------------

/**
 * @param {number} phaseId - 1 | 2 | 3
 * @param {object} context - { companyName, productService, marketType, top5, step1 }
 * @returns {string} AIチャットに貼り付けるプロンプト
 */
export function buildPhasePrompt(phaseId, context) {
  const { companyName, productService, marketType } = context;
  let body;
  switch (phaseId) {
    case 1:
      body = buildPhase1Prompt(companyName, productService, marketType);
      break;
    case 2:
      body = buildPhase2Prompt(companyName, productService, marketType, summarizeTop5(context.top5));
      break;
    case 3:
      body = buildPhase3Prompt(
        companyName, productService, marketType,
        summarizeTop5(context.top5), summarizeSegments(context.step1),
      );
      break;
    default:
      throw new Error(`不明なフェーズ: ${phaseId}`);
  }
  return `${ROLE_PROMPT}\n\n${body}`;
}

/**
 * 貼り戻された回答を、そのフェーズの dispatch 用データに変換する。
 * JSONが読めない場合は日本語のエラーを投げる（呼び出し側が画面に出す）。
 *
 * @param {number} phaseId - 1 | 2 | 3
 * @param {string} rawText - ユーザーが貼り付けたAIの回答
 * @param {object} context - { marketType, step1 }
 * @returns {object} フェーズごとの正規化済みデータ
 */
export function applyPhaseResult(phaseId, rawText, context) {
  const raw = parseAIJson(rawText);
  const marketType = context?.marketType;
  switch (phaseId) {
    case 1: {
      const norm = normalizeStep0(raw, marketType);
      return { step0: norm.step0, marketType: norm.marketType };
    }
    case 2:
      return { step1: normalizeStep1(raw, marketType) };
    case 3: {
      // step1 は候補の軸名を解決するために渡す（課題P-13）
      const norm = normalizeStep2And3(raw, context?.step1);
      return { step2: norm.step2, step3: norm.step3 };
    }
    default:
      throw new Error(`不明なフェーズ: ${phaseId}`);
  }
}


// ---------------------------------------------------------------------------
// Phase 1 後処理: step0 構造の正規化
// ---------------------------------------------------------------------------

function normalizeStep0(raw, marketType) {
  // VALUE_CHAIN_CATEGORIES のデフォルト構造をベースに、AIの出力をマージ
  const defaultCategories = VALUE_CHAIN_CATEGORIES.map(cat => ({
    id: cat.id,
    items: cat.items.map((name, idx) => ({
      id: `${cat.id}_${idx}`,
      name,
      strength: '',
      communication: '',
      communicationStatus: '',
      isStrengthFlag: false,
      isCustom: false,
    })),
  }));

  // AIの出力カテゴリをマッピング
  const aiCatMap = {};
  (raw.categories || []).forEach(c => { aiCatMap[c.id] = c; });

  const categories = defaultCategories.map(defCat => {
    const aiCat = aiCatMap[defCat.id];
    if (!aiCat) return defCat;

    const aiItemMap = {};
    (aiCat.items || []).forEach(item => { aiItemMap[item.id] = item; });

    return {
      id: defCat.id,
      items: defCat.items.map(defItem => {
        const aiItem = aiItemMap[defItem.id];
        if (!aiItem) return defItem;
        return {
          id: defItem.id,
          name: defItem.name, // デフォルト名を使用
          strength: aiItem.strength || '',
          communication: aiItem.communication || '',
          communicationStatus: aiItem.communicationStatus || '',
          isStrengthFlag: !!aiItem.isStrengthFlag,
          isCustom: false,
        };
      }),
    };
  });

  // Top強み（最大7件）の正規化
  const top5 = (raw.top5 || []).slice(0, 7).map((t, i) => ({
    id: t.id || '',
    name: t.name || '',
    rank: t.rank || (i + 1),
    categoryName: t.categoryName || '',
    categoryId: t.categoryId || '',
    strength: t.strength || '',
    communication: t.communication || '',
    communicationStatus: t.communicationStatus || 'communicated',
    isStrengthFlag: true,
    isCustom: false,
    reason: t.reason || '',
  }));

  // Top5にフラグを立てる
  const top5Ids = new Set(top5.map(t => t.id));
  categories.forEach(cat => {
    cat.items.forEach(item => {
      if (top5Ids.has(item.id)) item.isStrengthFlag = true;
    });
  });

  return {
    marketType: raw.marketType || marketType,
    step0: { categories, top5, skipped: false },
  };
}

// ---------------------------------------------------------------------------
// Phase 2 後処理: step1 構造の正規化
// ---------------------------------------------------------------------------

function normalizeStep1(raw, marketType) {
  const allSegments = marketType === 'btob' ? BTOB_SEGMENTS : BTOC_SEGMENTS;
  const segMap = {};
  allSegments.forEach(s => { segMap[s.id] = s; });

  const selectedAxes = (raw.selectedAxes || []).map(ax => ({
    id: ax.id,
    name: segMap[ax.id]?.name || ax.name || '',
    feature: ax.feature || segMap[ax.id]?.feature || '',
    note: ax.note || segMap[ax.id]?.note || '',
    priority: ax.priority || 'medium',
  }));

  const segments = {};
  (raw.selectedAxes || []).forEach(ax => {
    segments[ax.id] = (raw.segments?.[ax.id] || []).map(s => ({
      id: s.id,
      name: s.name || '',
      memo: s.memo || '',
    }));
  });

  return { selectedAxes, segments };
}

// ---------------------------------------------------------------------------
// Phase 3 後処理: step2 + step3 構造の正規化
// ---------------------------------------------------------------------------

function normalizeStep2And3(raw, step1) {
  const s2 = raw.step2 || {};
  const s3 = raw.step3 || {};

  // step2
  // 軸名・説明文はマスタ定義を正とする（AIが勝手に改名しても画面と食い違わないようにする）。
  // AIに任せるのは weight だけ。
  const aiAxisMap = {};
  (s2.axes || []).forEach(a => { if (a?.id) aiAxisMap[a.id] = a; });
  const axes = DEFAULT_TARGETING_AXES.map(master => ({
    ...master,
    weight: aiAxisMap[master.id]?.weight || 'medium',
  }));

  // ターゲット候補（課題P-13）
  // Step2の画面は candidates 起点で描画されるため、ここで必ず作る。
  // 作らないと、AIが返した scores / targets が画面に出ないまま宙に浮く。
  const axisNameById = {};
  (step1?.selectedAxes || []).forEach(ax => { axisNameById[ax.id] = ax.name; });

  const candidates = (s2.candidates || [])
    .filter(c => c && c.id)
    .slice(0, 8)
    .map(c => {
      // 同じ軸から複数セグメントが来た場合は先勝ちで1つに絞る（画面の1軸1セグメント制約に合わせる）
      const usedAxes = new Set();
      const segments = [];
      for (const s of (Array.isArray(c.segments) ? c.segments : [])) {
        if (!s?.axisId || !s?.segName || usedAxes.has(s.axisId)) continue;
        usedAxes.add(s.axisId);
        segments.push({
          axisId: s.axisId,
          axisName: axisNameById[s.axisId] || s.axisName || '',
          segName: s.segName,
        });
      }
      return {
        id: c.id,
        // 名前が無ければ掛け合わせから組み立てる（画面が空欄の候補で埋まるのを防ぐ）
        name: c.name || segments.map(s => s.segName).join('×'),
        segments,
        memo: c.memo || '',
      };
    });

  // 候補に存在しないキーのスコア・ターゲットは捨てる（孤児データを持ち込まない）
  const validIds = new Set(candidates.map(c => c.id));
  const scores = {};
  Object.entries(s2.scores || {}).forEach(([key, value]) => {
    const candidateId = key.replace(/_ta\d+$/, '');
    if (validIds.has(candidateId)) scores[key] = value;
  });
  const targets = {};
  Object.entries(s2.targets || {}).forEach(([key, value]) => {
    if (validIds.has(key)) targets[key] = value;
  });

  const step2 = { candidates, axes, scores, targets };

  // step3
  const competitors = (s3.competitors || []).map(c => ({
    id: c.id,
    name: c.name || '',
    scale: c.scale || '',
  }));

  const posAxes = (s3.axes || []).map(a => ({
    id: a.id,
    name: a.name || '',
  }));

  const maps = (s3.maps || []).slice(0, 3).map((m, i) => ({
    id: m.id || `map${i + 1}`,
    name: m.name || `マップ${i + 1}`,
    xAxis: m.xAxis || '',
    yAxis: m.yAxis || '',
  }));

  // 不足分のマップを補完
  while (maps.length < 3) {
    maps.push({ id: `map${maps.length + 1}`, name: `マップ${maps.length + 1}`, xAxis: '', yAxis: '' });
  }

  const step3 = {
    competitors,
    axes: posAxes,
    scores: s3.scores || {},
    maps,
    quadrantLabels: s3.quadrantLabels || {},
  };

  return { step2, step3 };
}
