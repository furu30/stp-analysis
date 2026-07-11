const SYSTEM_PROMPT = 'あなたは経営コンサルタントとして、製造業中小企業のSTP分析結果に基づいたマーケティング戦略コメントを生成します。';

function buildPrompt(type, data) {
  const dataJson = JSON.stringify(data, null, 2);

  const instructions = {
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
  };

  return `${instructions[type]}\n\nデータ:\n${dataJson}\n`;
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

/** SWOTコメント生成をbuildPromptに追加 */
export async function generateAIComment(type, inputData, aiSettings) {
  const { provider, apiKey, model } = aiSettings;
  if (!apiKey) throw new Error('APIキーが設定されていません。ヘッダーの「AI設定」ボタンからAPIキーを入力してください。');

  const userPrompt = buildPrompt(type, inputData);

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
