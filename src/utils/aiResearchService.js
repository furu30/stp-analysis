/**
 * AI企業リサーチサービス
 * 企業名と事業内容からSTP分析のドラフトを4フェーズで自動生成する。
 */

import {
  VALUE_CHAIN_CATEGORIES,
  BTOB_SEGMENTS,
  BTOC_SEGMENTS,
  DEFAULT_TARGETING_AXES,
  DEFAULT_POSITIONING_AXES_BTOB,
  DEFAULT_POSITIONING_AXES_BTOC,
} from '../data/defaultData';

// ---------------------------------------------------------------------------
// AI プロバイダー呼び出し（aiService.js と独立実装、max_tokens 可変）
// ---------------------------------------------------------------------------

async function callClaude(apiKey, model, systemPrompt, userPrompt, maxTokens, signal) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }] }),
  });
  if (resp.status === 401 || resp.status === 403) throw new Error('AUTH_ERROR');
  if (resp.status === 404) throw new Error(`MODEL_NOT_FOUND:モデル「${model}」が見つかりません。AI設定で別のモデルを選択してください。`);
  if (!resp.ok) throw new Error(`API_ERROR:${resp.status}`);
  const data = await resp.json();
  // thinkingブロックが先頭に来る場合があるため、textブロックを探して返す
  const textBlock = (data.content || []).find(b => b.type === 'text' && b.text);
  if (!textBlock) throw new Error('API_ERROR:予期しない応答形式');
  return textBlock.text;
}

async function callOpenAI(apiKey, model, systemPrompt, userPrompt, maxTokens, signal) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }] }),
  });
  if (resp.status === 401 || resp.status === 403) throw new Error('AUTH_ERROR');
  if (resp.status === 404) throw new Error(`MODEL_NOT_FOUND:モデル「${model}」が見つかりません。AI設定で別のモデルを選択してください。`);
  if (!resp.ok) throw new Error(`API_ERROR:${resp.status}`);
  const data = await resp.json();
  return data.choices[0].message.content;
}

async function callGemini(apiKey, model, systemPrompt, userPrompt, maxTokens, signal) {
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: { maxOutputTokens: maxTokens },
    }),
  });
  if (resp.status === 401 || resp.status === 403) throw new Error('AUTH_ERROR');
  if (resp.status === 404) throw new Error(`MODEL_NOT_FOUND:モデル「${model}」が見つかりません。AI設定で別のモデルを選択してください。`);
  if (!resp.ok) throw new Error(`API_ERROR:${resp.status}`);
  const data = await resp.json();
  return data.candidates[0].content.parts[0].text;
}

function callAI(aiSettings, systemPrompt, userPrompt, maxTokens, signal) {
  const { provider, apiKey, model } = aiSettings;
  switch (provider) {
    case 'claude':  return callClaude(apiKey, model, systemPrompt, userPrompt, maxTokens, signal);
    case 'openai':  return callOpenAI(apiKey, model, systemPrompt, userPrompt, maxTokens, signal);
    case 'gemini':  return callGemini(apiKey, model, systemPrompt, userPrompt, maxTokens, signal);
    default: throw new Error(`未対応のプロバイダー: ${provider}`);
  }
}

// ---------------------------------------------------------------------------
// JSON パース
// ---------------------------------------------------------------------------

function parseAIJSON(rawText) {
  let cleaned = rawText.trim();
  // コードフェンス除去
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
  cleaned = cleaned.trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // 最外側の { } を抽出
    const m = cleaned.match(/(\{[\s\S]*\})/);
    if (m) {
      try { return JSON.parse(m[1]); } catch { /* fall through */ }
    }
    throw new Error('JSON_PARSE_ERROR');
  }
}

// ---------------------------------------------------------------------------
// 共通システムプロンプト
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `あなたは経営コンサルタント兼マーケティング戦略の専門家です。
企業のSTP（セグメンテーション・ターゲティング・ポジショニング）分析を行います。
指定されたJSON形式のみを出力してください。
マークダウンのコードブロックや説明文は含めず、純粋なJSONのみを出力してください。
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
最後にTop5の強みを選定し、rank（1〜5）を付与してください。

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
- Top5に選んだ項目のisStrengthFlagをtrueにする
- top5は必ず5個
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
### Part A: ターゲティング評価（step2）
各セグメントを6つの評価軸で1〜5点で評価し、メイン/サブ/対象外に分類してください。
メインターゲットは2〜3個、サブターゲットは3〜5個が目安です。

### Part B: ポジショニング分析（step3）
3〜5社の競合企業を特定し、6つのポジショニング軸で自社と競合を1〜10点で評価。
3つのポジショニングマップを設計してください。

## ターゲティング評価軸（固定）
ta1:市場規模, ta2:成長性, ta3:競合の強さ(弱い=高評価), ta4:自社適合性, ta5:到達可能性, ta6:収益性

## ポジショニング軸のデフォルト
${posAxes.map((name, i) => `pa_${i}: ${name}`).join(', ')}
※企業に合わせて軸名を変更してください。

## 出力JSON形式
{
  "step2": {
    "axes": [
      { "id": "ta1", "name": "市場規模", "description": "そのセグメントの顧客数・売上ポテンシャル", "weight": "high|medium|low" }
    ],
    "scores": {
      "seg_001_ta1": 3,
      "seg_001_ta2": 4
    },
    "targets": {
      "seg_001": { "label": "main", "persona": "ペルソナ名（複合セグメント名）", "reason": "選定理由（50-100字）" },
      "seg_002": { "label": "sub" },
      "seg_003": { "label": "none" }
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
- step2.scoresは全セグメント×6軸分のキーが必要（形式: seg_XXX_ta1）
- step2.targetsは全セグメント分のキーが必要
- mainターゲットにはpersonaとreasonを付与。sub/noneはlabelのみでOK
- step3.competitorsは3〜5社、idはcomp_1から連番
- step3.axesは6個、idはpa_0〜pa_5
- step3.scoresはself + 全競合 × 6軸（形式: self_pa_0, comp_1_pa_0）、値は1〜10
- step3.mapsは3個、idはmap1〜map3、xAxisとyAxisはpa_0〜pa_5から選択
- 競合企業名は実在企業を匿名化した形式（例: 大手メーカーO、中堅工具メーカーN）
- JSONのみ出力。`;
}

// ---------------------------------------------------------------------------
// Phase 4: AIコメント
// ---------------------------------------------------------------------------

function buildPhase4Prompt(companyName, productService, dataSummary) {
  return `## 対象企業
企業名: ${companyName}
事業内容: ${productService}

## STP分析データの要約
${dataSummary}

## タスク
上記のSTP分析結果に基づき、以下4種類の戦略コメントを生成してください。
各コメントは提案書向けのフォーマルなトーンで400〜600字で記述してください。

## 出力JSON形式
{
  "strengthSummary": "バリューチェーン分析に基づく自社の競争優位性の要約。強みの本質、独自性、競合との違いを分析。",
  "targetingRationale": "メインターゲット選定の根拠。なぜそのセグメントを選んだか、自社の強みとの適合性、市場機会を説明。",
  "positioningComment": "ポジショニング戦略の分析。ストラテジーキャンバスの結果、マップ上の自社ポジション、競合との差別化を説明。",
  "overallStrategy": "【エグゼクティブサマリー】で始まる全体戦略。■強みの核心、■ターゲット戦略、■ポジショニング戦略、■今後の重点施策の4セクションで構成。"
}

## 制約
- 各コメントは400〜600字
- overallStrategyは【エグゼクティブサマリー】で開始し、■で始まる4セクションを含める
- 具体的な企業名・セグメント名・競合名を引用して言及すること
- 数値（スコア）を適宜引用して根拠を示すこと
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

function summarizeAllData(step0, step1, step2, step3) {
  const top5 = summarizeTop5(step0?.top5);
  const segs = summarizeSegments(step1);

  const mainTargets = step2?.targets
    ? Object.entries(step2.targets)
        .filter(([, v]) => v.label === 'main')
        .map(([k, v]) => `${k}: ${v.persona || ''}`)
        .join(', ')
    : '';

  const competitors = step3?.competitors
    ? step3.competitors.map(c => `${c.name}(${c.scale})`).join(', ')
    : '';

  const posAxes = step3?.axes
    ? step3.axes.map(a => a.name).join(', ')
    : '';

  return `## 強み Top5
${top5}

## セグメント
${segs}

## メインターゲット
${mainTargets || '（なし）'}

## 競合企業
${competitors || '（なし）'}

## ポジショニング軸
${posAxes || '（なし）'}`;
}

// ---------------------------------------------------------------------------
// フェーズ定義
// ---------------------------------------------------------------------------

const PHASES = [
  { id: 1, name: '強み分析（バリューチェーン）', maxTokens: 8192 },
  { id: 2, name: 'セグメンテーション', maxTokens: 4096 },
  { id: 3, name: 'ターゲティング & ポジショニング', maxTokens: 8192 },
  { id: 4, name: 'AIコメント生成', maxTokens: 4096 },
];

export { PHASES };

// ---------------------------------------------------------------------------
// 単一フェーズ実行（リトライ付き）
// ---------------------------------------------------------------------------

async function runPhase(phaseId, context, aiSettings, signal) {
  const phase = PHASES.find(p => p.id === phaseId);
  let prompt;

  switch (phaseId) {
    case 1:
      prompt = buildPhase1Prompt(context.companyName, context.productService, context.marketType);
      break;
    case 2:
      prompt = buildPhase2Prompt(context.companyName, context.productService, context.marketType, summarizeTop5(context.top5));
      break;
    case 3:
      prompt = buildPhase3Prompt(context.companyName, context.productService, context.marketType, summarizeTop5(context.top5), summarizeSegments(context.step1));
      break;
    case 4:
      prompt = buildPhase4Prompt(context.companyName, context.productService, summarizeAllData(context.step0, context.step1, context.step2, context.step3));
      break;
    default:
      throw new Error(`不明なフェーズ: ${phaseId}`);
  }

  const MAX_RETRIES = 2;
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const retryHint = attempt > 0 ? '\n\n【重要】前回の出力はJSON解析に失敗しました。正しいJSON形式のみを出力してください。コードブロック(```)は使わないでください。' : '';
      const rawText = await callAI(aiSettings, SYSTEM_PROMPT, prompt + retryHint, phase.maxTokens, signal);
      const result = parseAIJSON(rawText);
      return result;
    } catch (err) {
      if (err.message === 'AUTH_ERROR') {
        throw new Error('APIキーが無効です。AI設定を確認してください。');
      }
      if (err.message.startsWith('MODEL_NOT_FOUND:')) {
        throw new Error(err.message.replace('MODEL_NOT_FOUND:', ''));
      }
      if (err.name === 'AbortError') throw err;

      lastError = err;

      if (err.message.startsWith('API_ERROR:') && attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 2000)); // 2秒待機してリトライ
        continue;
      }
      if (err.message === 'JSON_PARSE_ERROR' && attempt < MAX_RETRIES) {
        continue; // リトライヒント付きで再試行
      }
    }
  }

  throw new Error(`Phase ${phaseId}（${phase.name}）の生成に失敗しました: ${lastError?.message || '不明なエラー'}`);
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

  // Top5 の正規化
  const top5 = (raw.top5 || []).slice(0, 5).map((t, i) => ({
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

function normalizeStep2And3(raw) {
  const s2 = raw.step2 || {};
  const s3 = raw.step3 || {};

  // step2
  const axes = (s2.axes || DEFAULT_TARGETING_AXES).map(a => ({
    id: a.id,
    name: a.name || '',
    description: a.description || '',
    weight: a.weight || 'medium',
  }));

  const step2 = {
    axes,
    scores: s2.scores || {},
    targets: s2.targets || {},
  };

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

// ---------------------------------------------------------------------------
// メインオーケストレーター
// ---------------------------------------------------------------------------

/**
 * 4フェーズで企業調査を実行
 * @param {string} companyName - 企業名
 * @param {string} productService - 事業内容
 * @param {string} marketType - 'btob' | 'btoc'
 * @param {object} aiSettings - { provider, apiKey, model, tone }
 * @param {object} callbacks
 *   - onPhaseStart(phaseId) - フェーズ開始時
 *   - onPhaseComplete(phaseId, result) - フェーズ完了時、result は dispatch 用データ
 *   - onError(phaseId, error) - エラー時
 * @param {AbortSignal} signal - キャンセル用
 * @returns {Promise<object>} 全フェーズの結果を集約したオブジェクト
 */
export async function runFullResearch(companyName, productService, marketType, aiSettings, callbacks, signal) {
  if (!aiSettings.apiKey) {
    throw new Error('APIキーが設定されていません。ヘッダーの「AI設定」からAPIキーを入力してください。');
  }

  const context = { companyName, productService, marketType };
  const results = {};

  // --- Phase 1: 強み分析 ---
  callbacks.onPhaseStart(1);
  const raw1 = await runPhase(1, context, aiSettings, signal);
  const norm1 = normalizeStep0(raw1, marketType);
  context.top5 = norm1.step0.top5;
  context.step0 = norm1.step0;
  results.step0 = norm1.step0;
  results.marketType = norm1.marketType;
  callbacks.onPhaseComplete(1, { step0: norm1.step0, marketType: norm1.marketType });

  // --- Phase 2: セグメンテーション ---
  callbacks.onPhaseStart(2);
  const raw2 = await runPhase(2, context, aiSettings, signal);
  const norm2 = normalizeStep1(raw2, marketType);
  context.step1 = norm2;
  results.step1 = norm2;
  callbacks.onPhaseComplete(2, { step1: norm2 });

  // --- Phase 3: ターゲティング & ポジショニング ---
  callbacks.onPhaseStart(3);
  const raw3 = await runPhase(3, context, aiSettings, signal);
  const norm3 = normalizeStep2And3(raw3);
  context.step2 = norm3.step2;
  context.step3 = norm3.step3;
  results.step2 = norm3.step2;
  results.step3 = norm3.step3;
  callbacks.onPhaseComplete(3, { step2: norm3.step2, step3: norm3.step3 });

  // --- Phase 4: AIコメント ---
  callbacks.onPhaseStart(4);
  const raw4 = await runPhase(4, context, aiSettings, signal);
  const aiComments = {
    strengthSummary: raw4.strengthSummary || '',
    targetingRationale: raw4.targetingRationale || '',
    positioningComment: raw4.positioningComment || '',
    overallStrategy: raw4.overallStrategy || '',
  };
  results.aiComments = aiComments;
  callbacks.onPhaseComplete(4, { aiComments });

  return results;
}
