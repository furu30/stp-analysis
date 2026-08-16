/**
 * プロンプト配布方式のAI連携（課題M-01）
 *
 * APIを直接叩かず、アプリはプロンプトを組み立てるだけ。ユーザーが普段使っている
 * AIチャットに自分で貼り付け、返ってきた回答をアプリに貼り戻す。
 * 顧客データがアプリから外部へ送信されないため、課題M-02も同時に解消する。
 *
 * チャットに貼る方式ではsystemロールが使えないため、役割指定と出力形式の指示は
 * すべてプロンプト本文に畳み込んでいる。
 */

/** プロンプトを貼る先のAIチャット */
export const AI_CHAT_LINKS = [
  { label: 'Claude', url: 'https://claude.ai/new' },
  { label: 'ChatGPT', url: 'https://chatgpt.com/' },
  { label: 'Gemini', url: 'https://gemini.google.com/app' },
];

const ROLE = `あなたは経営コンサルタントとして、製造業中小企業のSTP分析結果に基づいたマーケティング戦略を検討します。
日本語で回答し、指定したJSON形式のみを出力してください。`;

const INSTRUCTIONS = {
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

/** 画面に出す見出し・説明。AIPromptModal がそのまま使う */
export const PROMPT_TYPES = {
  swotGenerate: {
    title: '弱み・機会・脅威をAIに考えてもらう',
    lead: '入力済みの企業情報と強みをもとにしたプロンプトを用意しました。お使いのAIに貼り付けて、返ってきた回答をこの画面に貼り戻してください。',
    applyLabel: '弱み・機会・脅威に取り込む',
  },
  crossSwotGenerate: {
    title: '戦略オプションをAIに考えてもらう',
    lead: '入力済みのSWOTをもとにしたプロンプトを用意しました。お使いのAIに貼り付けて、返ってきた回答をこの画面に貼り戻してください。',
    applyLabel: '戦略オプションに取り込む',
  },
};

/** AIチャットに貼り付けるプロンプトを組み立てる */
export function buildPrompt(type, data) {
  const instruction = INSTRUCTIONS[type];
  if (!instruction) throw new Error(`未対応のプロンプト種別: ${type}`);
  return `${ROLE}\n\n${instruction}\n\nデータ:\n${JSON.stringify(data, null, 2)}\n`;
}

/** 貼り付けられたテキストからJSON部分だけを取り出す */
export function sliceJson(raw) {
  const text = (raw || '').trim();
  if (!text) throw new Error('貼り付け欄が空です。AIの回答をコピーして貼り付けてください。');

  // ```json ... ``` のコードブロックがあれば最後のものを採用する
  // （AIが説明の途中で例示のJSONを出すことがあるため、最後＝最終結果を優先する）
  const fences = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)];
  if (fences.length > 0) {
    const last = fences[fences.length - 1][1].trim();
    if (last) return last;
  }

  // コードブロックが無い場合は、最初の { から最後の } までを切り出す
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('JSONが見つかりませんでした。AIの回答を、途中で切らずに全文コピーして貼り付けてください。');
  }
  return text.slice(start, end + 1);
}

/** 貼り付けられたテキストをJSONとして読み取る。失敗時は日本語のエラーを投げる */
export function parseAIJson(raw) {
  const sliced = sliceJson(raw);
  try {
    return JSON.parse(sliced);
  } catch {
    throw new Error('JSONの形が崩れています。下の「修正をお願いするプロンプト」をAIに貼って、直った回答を貼り戻してください。');
  }
}

/**
 * 壊れたJSONをAI自身に直させるためのプロンプト。
 * 「JSONが壊れています」で行き止まりにせず、コピーして貼れば復旧できる導線にする。
 */
export function buildRepairPrompt(raw) {
  return `直前の回答のJSONが正しく読み取れませんでした。
説明文・前置き・後書きを一切付けず、正しいJSONだけをもう一度出力してください。
コードブロック（\`\`\`json）で囲んで構いません。

読み取れなかった回答:
${(raw || '').trim().slice(0, 2000)}
`;
}
