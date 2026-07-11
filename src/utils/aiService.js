const SYSTEM_PROMPT = 'あなたは経営コンサルタントとして、製造業中小企業のSTP分析結果に基づいたマーケティング戦略コメントを生成します。';

function buildPrompt(type, data, tone) {
  const toneLabel = tone === 'formal' ? '提案書向け（丁寧・フォーマル）' : '社内確認向け（簡潔）';
  const charGuide = tone === 'formal' ? '400〜600' : '200〜400';
  const dataJson = JSON.stringify(data, null, 2);

  const instructions = {
    strengthSummary: `以下のバリューチェーン分析データとTop5強みに基づき、自社の競争優位性について${toneLabel}のトーンで${charGuide}字程度のコメントを生成してください。数値の羅列ではなく、戦略的示唆を含めること。`,
    targetingRationale: `以下のセグメントスコアデータ・Top5強み・選定ターゲットに基づき、メインターゲット選定の根拠について${toneLabel}のトーンで${charGuide}字程度のコメントを生成してください。`,
    positioningComment: `以下の競合スコアマトリクス・Top5強み・ターゲットに基づき、ポジショニング戦略について${toneLabel}のトーンで${charGuide}字程度のコメントを生成してください。`,
    swotComment: `以下のSWOT分析データ（4象限と戦略オプションの一覧）に基づき、戦略オプションの評価・優先順位の示唆と優先すべきアクションを${toneLabel}のトーンで${charGuide}字程度のコメントとして生成してください。`,
    swotGenerate: `以下の企業情報・強み分析データに基づき、SWOT分析の「弱み(W)」「機会(O)」「脅威(T)」を各3〜7項目ずつ（重要なものから順に）推定してください。
各項目は簡潔な1文（20〜40字）で記述すること。
以下のJSON形式のみを出力。前置き・説明文は不要:
{"weaknesses":["...","...","..."],"opportunities":["...","...","..."],"threats":["...","...","..."]}`,
    crossSwotGenerate: `以下のSWOT分析データに基づき、クロスSWOTの4つの組み合わせ視点（S×O積極戦略・S×T差別化戦略・W×O改善戦略・W×T防衛戦略）で発想し、この会社に合った具体的な戦略オプションを5個生成してください。
・戦略の中心は多くの場合「S×O（強みを活かして機会を掴む）」になる。S×Oのオプションを多め（5個中2〜3個以上）にすること
・4視点すべてを無理に使う必要はなく、この会社に合うオプションを優先すること（同じ視点から複数生成してもよく、出てこない視点があってもよい）
・各オプションのtextは80〜150字の具体的な戦略にすること
・typeは so / st / wo / wt のいずれか
・effect（効果）とfeasibility（実現性）は 高 / 中 / 低 のいずれかで評価すること
以下のJSON形式のみを出力。前置き・説明文は不要:
{"options":[{"type":"so","text":"...","effect":"高","feasibility":"中"}]}`,
    overallStrategy: `以下のSTP分析全データに基づき、全体を通じた戦略的示唆を${toneLabel}のトーンで${charGuide}字程度のエグゼクティブサマリーとして生成してください。`,
  };

  return `${instructions[type]}\n\nデータ:\n${dataJson}\n\n${type.includes('Generate') ? '' : 'コメントのみを出力。前置きや説明文は不要。'}`;
}

/** API エラーを分かりやすいメッセージに変換 */
function parseApiError(status, provider) {
  const common = {
    401: `認証エラー: ${provider}のAPIキーが正しくありません。設定画面でAPIキーを確認してください。`,
    403: `アクセス拒否: ${provider}のAPIキーに必要な権限がありません。`,
    429: `レート制限: ${provider}のAPIリクエスト上限に達しました。しばらく待ってから再試行してください。`,
    500: `${provider}のサーバーでエラーが発生しました。時間をおいて再試行してください。`,
    503: `${provider}のサービスが一時的に利用できません。時間をおいて再試行してください。`,
  };
  return common[status] || `${provider} API エラー (HTTP ${status})`;
}

async function callClaude(apiKey, model, systemPrompt, userPrompt) {
  let resp;
  try {
    resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        // Sonnet 5以降はadaptive thinkingが既定で有効になり出力を消費するため余裕を持たせる
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
  } catch (e) {
    throw new Error(`ネットワークエラー: Claude APIに接続できません。インターネット接続を確認してください。(${e.message})`);
  }
  if (!resp.ok) throw new Error(parseApiError(resp.status, 'Claude'));
  const data = await resp.json();
  // thinkingブロックが先頭に来る場合があるため、textブロックを探して返す
  const textBlock = (data.content || []).find(b => b.type === 'text' && b.text);
  if (!textBlock) throw new Error('Claude APIから予期しない応答形式を受信しました。');
  return textBlock.text;
}

/** 一時的なエラー（レート制限・サーバーエラー・ネットワーク断）は1回だけ自動リトライする */
async function withRetry(fn) {
  try {
    return await fn();
  } catch (e) {
    const msg = e?.message || '';
    const retryable = msg.includes('レート制限') || msg.includes('サーバーでエラー')
      || msg.includes('一時的に利用できません') || msg.includes('ネットワークエラー');
    if (!retryable) throw e;
    await new Promise(r => setTimeout(r, 2000));
    return fn();
  }
}

async function callOpenAI(apiKey, model, systemPrompt, userPrompt) {
  let resp;
  try {
    resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1024,
      }),
    });
  } catch (e) {
    throw new Error(`ネットワークエラー: OpenAI APIに接続できません。(${e.message})`);
  }
  if (!resp.ok) throw new Error(parseApiError(resp.status, 'OpenAI'));
  const data = await resp.json();
  if (!data.choices?.[0]?.message?.content) throw new Error('OpenAI APIから予期しない応答形式を受信しました。');
  return data.choices[0].message.content;
}

async function callGemini(apiKey, model, systemPrompt, userPrompt) {
  let resp;
  try {
    resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
      }),
    });
  } catch (e) {
    throw new Error(`ネットワークエラー: Gemini APIに接続できません。(${e.message})`);
  }
  if (!resp.ok) throw new Error(parseApiError(resp.status, 'Gemini'));
  const data = await resp.json();
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) throw new Error('Gemini APIから予期しない応答形式を受信しました。');
  return data.candidates[0].content.parts[0].text;
}

/** ポジショニング軸をAIに推薦させる */
export async function suggestPositioningAxes(inputData, aiSettings) {
  const { provider, apiKey, model } = aiSettings;
  if (!apiKey) throw new Error('APIキーが設定されていません。');

  const prompt = `以下の企業のSTP分析データ（強み・ターゲット）に基づき、ポジショニングマップに最適な評価軸を6つ提案してください。

データ:
${JSON.stringify(inputData, null, 2)}

以下の形式でJSON配列のみを返してください。前置き・説明は不要:
["軸名1", "軸名2", "軸名3", "軸名4", "軸名5", "軸名6"]`;

  let result;
  switch (provider) {
    case 'claude': result = await callClaude(apiKey, model, SYSTEM_PROMPT, prompt); break;
    case 'openai': result = await callOpenAI(apiKey, model, SYSTEM_PROMPT, prompt); break;
    case 'gemini': result = await callGemini(apiKey, model, SYSTEM_PROMPT, prompt); break;
    default: throw new Error(`未対応のプロバイダー: ${provider}`);
  }
  try {
    const match = result.match(/\[[\s\S]*?\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch { return []; }
}

/** 競合企業のスコアをAIに推定させる */
export async function suggestCompetitorScores(inputData, aiSettings) {
  const { provider, apiKey, model } = aiSettings;
  if (!apiKey) throw new Error('APIキーが設定されていません。');

  const prompt = `以下の企業情報・ポジショニング軸に基づき、各競合企業のスコア（1-10）を推定してください。

データ:
${JSON.stringify(inputData, null, 2)}

以下の形式でJSONオブジェクトのみを返してください。キーは "企業ID_軸ID" 形式:
{"comp1_pa_0": 7, "comp1_pa_1": 5, ...}`;

  let result;
  switch (provider) {
    case 'claude': result = await callClaude(apiKey, model, SYSTEM_PROMPT, prompt); break;
    case 'openai': result = await callOpenAI(apiKey, model, SYSTEM_PROMPT, prompt); break;
    case 'gemini': result = await callGemini(apiKey, model, SYSTEM_PROMPT, prompt); break;
    default: throw new Error(`未対応のプロバイダー: ${provider}`);
  }
  try {
    const match = result.match(/\{[\s\S]*?\}/);
    return match ? JSON.parse(match[0]) : {};
  } catch { return {}; }
}

/** STP分析全体から実行アクションプランのドラフトを生成する */
export async function generateActionPlan(inputData, aiSettings) {
  const { provider, apiKey, model } = aiSettings;
  if (!apiKey) throw new Error('APIキーが設定されていません。ヘッダーの「AI設定」ボタンからAPIキーを入力してください。');

  const prompt = `以下の中小企業のSTP分析結果（強み・ターゲット・ポジショニング・SWOT）に基づき、「明日から動ける」実行アクションプランを3〜5件提案してください。

条件:
- 各施策は、選定したメインターゲット・自社の強みと必ず結びつけること
- 「最初の一歩」は、追加投資なしで1〜2週間以内に着手できる具体的な行動にすること（例:「既存顧客上位10社に◯◯のヒアリングを行う」）
- 担当は役割名で書くこと（例: 社長、営業担当、製造リーダー）
- 期限は「2週間以内」「1ヶ月以内」「3ヶ月以内」のいずれかの目安で書くこと
- 優先度の高い順に並べること

データ:
${JSON.stringify(inputData, null, 2)}

以下のJSON形式のみを出力。前置き・説明文は不要:
{"items":[{"title":"施策名（30字以内）","target":"狙い・対象ターゲット","firstStep":"最初の一歩（具体的な行動）","owner":"担当（役割名）","due":"期限目安"}]}`;

  let result;
  switch (provider) {
    case 'claude': result = await withRetry(() => callClaude(apiKey, model, SYSTEM_PROMPT, prompt)); break;
    case 'openai': result = await withRetry(() => callOpenAI(apiKey, model, SYSTEM_PROMPT, prompt)); break;
    case 'gemini': result = await withRetry(() => callGemini(apiKey, model, SYSTEM_PROMPT, prompt)); break;
    default: throw new Error(`未対応のプロバイダー: ${provider}`);
  }
  const match = result.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AIの応答からアクションプランを読み取れませんでした。もう一度お試しください。');
  try {
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed.items)) throw new Error();
    return parsed.items.map((it, idx) => ({
      id: `ap_${Date.now()}_${idx}`,
      title: String(it.title || ''),
      target: String(it.target || ''),
      firstStep: String(it.firstStep || ''),
      owner: String(it.owner || ''),
      due: String(it.due || ''),
    }));
  } catch {
    throw new Error('AIの応答形式が不正でした。もう一度お試しください。');
  }
}

/** SWOTコメント生成をbuildPromptに追加 */
export async function generateAIComment(type, inputData, aiSettings) {
  const { provider, apiKey, model, tone } = aiSettings;
  if (!apiKey) throw new Error('APIキーが設定されていません。ヘッダーの「AI設定」ボタンからAPIキーを入力してください。');

  const userPrompt = buildPrompt(type, inputData, tone);

  switch (provider) {
    case 'claude':
      return withRetry(() => callClaude(apiKey, model, SYSTEM_PROMPT, userPrompt));
    case 'openai':
      return withRetry(() => callOpenAI(apiKey, model, SYSTEM_PROMPT, userPrompt));
    case 'gemini':
      return withRetry(() => callGemini(apiKey, model, SYSTEM_PROMPT, userPrompt));
    default:
      throw new Error(`未対応のプロバイダー: ${provider}`);
  }
}
