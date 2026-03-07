const SYSTEM_PROMPT = 'あなたは経営コンサルタントとして、製造業中小企業のSTP分析結果に基づいたマーケティング戦略コメントを生成します。';

function buildPrompt(type, data, tone) {
  const toneLabel = tone === 'formal' ? '提案書向け（丁寧・フォーマル）' : '社内確認向け（簡潔）';
  const charGuide = tone === 'formal' ? '400〜600' : '200〜400';
  const dataJson = JSON.stringify(data, null, 2);

  const instructions = {
    strengthSummary: `以下のバリューチェーン分析データとTop5強みに基づき、自社の競争優位性について${toneLabel}のトーンで${charGuide}字程度のコメントを生成してください。数値の羅列ではなく、戦略的示唆を含めること。`,
    targetingRationale: `以下のセグメントスコアデータ・Top5強み・選定ターゲットに基づき、メインターゲット選定の根拠について${toneLabel}のトーンで${charGuide}字程度のコメントを生成してください。`,
    positioningComment: `以下の競合スコアマトリクス・Top5強み・ターゲットに基づき、ポジショニング戦略について${toneLabel}のトーンで${charGuide}字程度のコメントを生成してください。`,
    overallStrategy: `以下のSTP分析全データに基づき、全体を通じた戦略的示唆を${toneLabel}のトーンで${charGuide}字程度のエグゼクティブサマリーとして生成してください。`,
  };

  return `${instructions[type]}\n\nデータ:\n${dataJson}\n\nコメントのみを出力。前置きや説明文は不要。`;
}

async function callClaude(apiKey, model, systemPrompt, userPrompt) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
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
  if (!resp.ok) throw new Error(`Claude API error: ${resp.status}`);
  const data = await resp.json();
  return data.content[0].text;
}

async function callOpenAI(apiKey, model, systemPrompt, userPrompt) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
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
  if (!resp.ok) throw new Error(`OpenAI API error: ${resp.status}`);
  const data = await resp.json();
  return data.choices[0].message.content;
}

async function callGemini(apiKey, model, systemPrompt, userPrompt) {
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
    }),
  });
  if (!resp.ok) throw new Error(`Gemini API error: ${resp.status}`);
  const data = await resp.json();
  return data.candidates[0].content.parts[0].text;
}

export async function generateAIComment(type, inputData, aiSettings) {
  const { provider, apiKey, model, tone } = aiSettings;
  if (!apiKey) throw new Error('APIキーが設定されていません。設定画面からAPIキーを入力してください。');

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
