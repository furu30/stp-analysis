const SYSTEM_PROMPT = 'あなたは経営コンサルタントとして、製造業中小企業のSTP分析結果に基づいたマーケティング戦略コメントを生成します。';

function buildPrompt(type, data, tone) {
  const toneLabel = tone === 'formal' ? '提案書向け（丁寧・フォーマル）' : '社内確認向け（簡潔）';
  const charGuide = tone === 'formal' ? '400〜600' : '200〜400';
  const dataJson = JSON.stringify(data, null, 2);

  const instructions = {
    strengthSummary: `以下のバリューチェーン分析データとTop5強みに基づき、自社の競争優位性について${toneLabel}のトーンで${charGuide}字程度のコメントを生成してください。数値の羅列ではなく、戦略的示唆を含めること。`,
    targetingRationale: `以下のセグメントスコアデータ・Top5強み・選定ターゲットに基づき、メインターゲット選定の根拠について${toneLabel}のトーンで${charGuide}字程度のコメントを生成してください。`,
    positioningComment: `以下の競合スコアマトリクス・Top5強み・ターゲットに基づき、ポジショニング戦略について${toneLabel}のトーンで${charGuide}字程度のコメントを生成してください。`,
    swotComment: `以下のSWOT分析データに基づき、クロスSWOT戦略の示唆と優先すべきアクションを${toneLabel}のトーンで${charGuide}字程度のコメントとして生成してください。`,
    swotGenerate: `以下の企業情報・強み分析データに基づき、SWOT分析の「弱み(W)」「機会(O)」「脅威(T)」を各3〜5項目ずつ推定してください。
各項目は簡潔な1文（20〜40字）で記述すること。
以下のJSON形式のみを出力。前置き・説明文は不要:
{"weaknesses":["...","...","..."],"opportunities":["...","...","..."],"threats":["...","...","..."]}`,
    crossSwotGenerate: `以下のSWOT分析データに基づき、クロスSWOT（積極戦略S×O・差別化戦略S×T・改善戦略W×O・防衛戦略W×T）の具体的な戦略案を各100〜200字で生成してください。
以下のJSON形式のみを出力。前置き・説明文は不要:
{"so":"...","st":"...","wo":"...","wt":"..."}`,
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
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
  } catch (e) {
    throw new Error(`ネットワークエラー: Claude APIに接続できません。インターネット接続を確認してください。(${e.message})`);
  }
  if (!resp.ok) throw new Error(parseApiError(resp.status, 'Claude'));
  const data = await resp.json();
  if (!data.content?.[0]?.text) throw new Error('Claude APIから予期しない応答形式を受信しました。');
  return data.content[0].text;
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
  const { provider, apiKey, model, tone } = aiSettings;
  if (!apiKey) throw new Error('APIキーが設定されていません。ヘッダーの「AI設定」ボタンからAPIキーを入力してください。');

  const userPrompt = buildPrompt(type, inputData, tone);

  switch (provider) {
    case 'claude':
      return callClaude(apiKey, model, SYSTEM_PROMPT, userPrompt);
    case 'openai':
      return callOpenAI(apiKey, model, SYSTEM_PROMPT, userPrompt);
    case 'gemini':
      return callGemini(apiKey, model, SYSTEM_PROMPT, userPrompt);
    default:
      throw new Error(`未対応のプロバイダー: ${provider}`);
  }
}
