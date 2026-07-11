export function exportToHtmlReport(project) {
  const { settings, step0, step1, step2, step3, swot } = project;

  const companies = step3?.skipped ? [] : [{ id: 'self', name: settings.companyName || '自社' }, ...(step3?.competitors || [])];

  const canvasSvg = step3?.skipped ? '' : buildCanvasSvg(step3, companies);
  const posMapSvg = step3?.skipped ? '' : buildPositionMapSvg(step3, companies);

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>STP分析レポート - ${escapeHtml(settings.projectName || '')}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Sans JP', sans-serif; color: #1e293b; background: #f8fafc; line-height: 1.7; }
  .container { max-width: 1000px; margin: 0 auto; padding: 40px; background: #fff; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
  h1 { font-size: 28px; border-bottom: 3px solid #2563eb; padding-bottom: 10px; margin: 50px 0 25px; color: #1e40af; }
  h2 { font-size: 22px; margin: 35px 0 15px; color: #334155; border-left: 5px solid #2563eb; padding-left: 12px; }
  h3 { font-size: 18px; margin: 25px 0 12px; color: #475569; }
  h4 { font-size: 16px; margin: 18px 0 8px; color: #64748b; font-weight: 700; }
  p { margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px; }
  th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; vertical-align: top; }
  th { background: #f1f5f9; font-weight: 700; color: #334155; }
  td.numeric { text-align: center; font-variant-numeric: tabular-nums; }
  td.total { background: #eef2ff; font-weight: 700; text-align: center; }
  td.self { background: #fef3c7; font-weight: 700; }

  .badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
  .badge-main { background: #dc2626; color: #fff; }
  .badge-sub { background: #f59e0b; color: #fff; }
  .badge-none { background: #e5e7eb; color: #6b7280; }
  .badge-high { background: #ef4444; color: #fff; }
  .badge-medium { background: #f59e0b; color: #fff; }
  .badge-low { background: #3b82f6; color: #fff; }

  .comment-box { background: #f0f9ff; border-left: 4px solid #2563eb; padding: 18px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
  .comment-box h3 { margin: 0 0 10px; color: #1e40af; font-size: 16px; }
  .comment-box p { white-space: pre-wrap; font-size: 14px; }

  .strength-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 16px 0; background: #fafafa; }
  .strength-card .rank { display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; background: #2563eb; color: #fff; border-radius: 50%; font-weight: 700; margin-right: 10px; font-size: 14px; }
  .strength-card .name { font-size: 18px; font-weight: 700; color: #1e40af; }
  .strength-card .cat { font-size: 13px; color: #64748b; margin-left: 8px; }
  .strength-card .body { margin: 10px 0; padding: 10px 0; border-top: 1px solid #e5e7eb; }
  .strength-card .label { font-weight: 700; color: #475569; font-size: 13px; margin-bottom: 4px; }

  .candidate-card { border: 2px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 14px 0; background: #fff; }
  .candidate-card.main { border-color: #fecaca; background: linear-gradient(to right, #fef2f2, #fff); }
  .candidate-card.sub { border-color: #fde68a; background: linear-gradient(to right, #fffbeb, #fff); }
  .candidate-card .head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
  .candidate-card .head .name { font-weight: 700; font-size: 16px; }
  .candidate-card .composition { font-size: 12px; color: #64748b; margin: 8px 0; }
  .candidate-card .composition .chip { display: inline-block; padding: 2px 8px; margin: 2px; background: #f1f5f9; border-radius: 9999px; }
  .candidate-card .reason { background: #f8fafc; padding: 10px; border-radius: 6px; margin-top: 8px; font-size: 13px; white-space: pre-wrap; }

  .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
  .swot-cell { border-radius: 10px; padding: 16px; }
  .swot-cell h4 { font-size: 16px; margin: 0 0 10px; }
  .swot-cell ul { margin: 0; padding-left: 20px; font-size: 14px; }
  .swot-cell li { margin: 4px 0; line-height: 1.6; }
  .swot-s { background: #dbeafe; border: 2px solid #93c5fd; }
  .swot-s h4 { color: #1e40af; }
  .swot-w { background: #fecaca; border: 2px solid #fca5a5; }
  .swot-w h4 { color: #991b1b; }
  .swot-o { background: #d1fae5; border: 2px solid #6ee7b7; }
  .swot-o h4 { color: #065f46; }
  .swot-t { background: #fed7aa; border: 2px solid #fdba74; }
  .swot-t h4 { color: #92400e; }

  .cross-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 12px 0; background: #fff; }
  .cross-card .label { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
  .cross-card .sub { font-size: 12px; color: #64748b; margin-bottom: 10px; }
  .cross-card .text { font-size: 14px; line-height: 1.7; white-space: pre-wrap; }
  .cross-so .label { color: #1e40af; }
  .cross-st .label { color: #7c3aed; }
  .cross-wo .label { color: #065f46; }
  .cross-wt .label { color: #991b1b; }

  .overview-box { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; margin: 14px 0; }
  .overview-box p { white-space: pre-wrap; font-size: 14px; line-height: 1.7; }

  .title-page { text-align: center; padding: 100px 0 60px; border-bottom: 2px solid #e5e7eb; margin-bottom: 30px; }
  .title-page .main { font-size: 42px; font-weight: 700; color: #1e40af; margin-bottom: 30px; letter-spacing: 0.05em; }
  .title-page .project { font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 20px; }
  .title-page .meta { color: #64748b; font-size: 16px; margin: 4px 0; }

  .svg-container { text-align: center; margin: 20px 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
  .svg-container svg { max-width: 100%; }

  .toc { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; margin: 20px 0 30px; }
  .toc h3 { margin: 0 0 10px; color: #475569; }
  .toc ol { margin: 0 0 0 25px; }
  .toc a { color: #2563eb; text-decoration: none; }
  .toc a:hover { text-decoration: underline; }

  .footer { margin-top: 80px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #94a3b8; font-size: 12px; }

  @media print {
    body { background: #fff; padding: 0; }
    .container { max-width: none; box-shadow: none; padding: 20px; }
    .print-break { page-break-before: always; }
    @page { size: A4; margin: 15mm; }
    @page { @top-center { content: "${escapeHtml(settings.projectName || 'STP分析レポート')}"; } @bottom-center { content: counter(page); } }
    h1 { page-break-after: avoid; }
    h2 { page-break-after: avoid; }
    .swot-cell, .strength-card, .candidate-card, .cross-card { page-break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="container">

<!-- タイトルページ -->
<div class="title-page">
  <div class="main">STP分析レポート</div>
  <div class="project">${escapeHtml(settings.projectName || '')}</div>
  <div class="meta">${escapeHtml(settings.companyName || '')}</div>
  <div class="meta">市場タイプ: ${settings.marketType === 'btob' ? 'BtoB' : 'BtoC'}</div>
  <div class="meta">作成日: ${new Date().toLocaleDateString('ja-JP')}</div>
</div>

<!-- 目次 -->
<div class="toc">
  <h3>📑 目次</h3>
  <ol>
    ${settings.productService || settings.businessDescription ? '<li><a href="#overview">経営概要</a></li>' : ''}
    <li><a href="#sec1">1. 自社の強み（バリューチェーン分析）</a></li>
    <li><a href="#sec2">2. セグメンテーション</a></li>
    <li><a href="#sec3">3. ターゲティング</a></li>
    <li><a href="#sec4">4. ポジショニング</a></li>
    <li><a href="#sec5">5. SWOT分析</a></li>
  </ol>
</div>

${settings.productService || settings.businessDescription ? `
<div class="print-break"></div>
<h1 id="overview">経営概要</h1>
${settings.productService ? `
<h4>主要事業・商材</h4>
<div class="overview-box"><p>${escapeHtml(settings.productService)}</p></div>
` : ''}
${settings.businessDescription ? `
<h4>事業内容</h4>
<div class="overview-box"><p>${escapeHtml(settings.businessDescription)}</p></div>
` : ''}
` : ''}

<!-- 1. 自社の強み -->
<div class="print-break"></div>
<h1 id="sec1">1. 自社の強み（バリューチェーン分析）</h1>
${(step0.top5 || []).length > 0 ? `
<h2>1.1 Top強み</h2>
${step0.top5.map((item, idx) => `
<div class="strength-card">
  <div>
    <span class="rank">${idx + 1}</span>
    <span class="name">${escapeHtml(item.name || '')}</span>
    <span class="cat">〔${escapeHtml(item.categoryName || '')}〕</span>
  </div>
  ${item.strength ? `<div class="body"><div class="label">■ 強みの内容</div><div>${escapeHtml(item.strength)}</div></div>` : ''}
  ${item.reason ? `<div class="body"><div class="label">■ 重要理由（模倣困難性・希少性・顧客価値）</div><div>${escapeHtml(item.reason)}</div></div>` : ''}
  ${item.communication ? `<div class="body"><div class="label">■ 顧客への伝達状況</div><div>${escapeHtml(item.communication)}</div></div>` : ''}
</div>
`).join('')}
` : '<p style="color:#94a3b8;">（Top強みが未選定です）</p>'}


<!-- 2. セグメンテーション -->
<div class="print-break"></div>
<h1 id="sec2">2. セグメンテーション</h1>
${(step1.selectedAxes || []).length > 0 ? `
<p style="color:#64748b; font-size:14px; margin-bottom:15px;">市場を分類する切り口（軸）と、各軸の中の具体的なセグメント。</p>
${step1.selectedAxes.map(axis => {
  const segs = (step1.segments?.[axis.id] || []).filter(s => s.name);
  if (segs.length === 0) return '';
  return `
<h3>${escapeHtml(axis.name)} <span class="badge badge-${axis.priority || 'low'}">${escapeHtml(axis.priority || '-')}</span></h3>
<table>
  <tr><th style="width:30%">セグメント名</th><th>特性メモ</th></tr>
  ${segs.map(seg => `<tr><td><strong>${escapeHtml(seg.name)}</strong></td><td>${escapeHtml(seg.memo || '')}</td></tr>`).join('')}
</table>
`;
}).join('')}
` : '<p style="color:#94a3b8;">（未設定）</p>'}

<!-- 3. ターゲティング -->
<div class="print-break"></div>
<h1 id="sec3">3. ターゲティング</h1>
${buildTargetingSection(settings, step2)}


<!-- 4. ポジショニング -->
<div class="print-break"></div>
<h1 id="sec4">4. ポジショニング</h1>
${step3?.skipped ? `
<p style="color:#92400e;background:#fffbeb;border:1px solid #fde68a;padding:15px;border-radius:8px;">ポジショニング分析はスキップされました（下請け企業等で競合設定が難しい場合）。</p>
` : `
${(step3.kbf || []).length > 0 ? `
<h2>4.1 購買決定要因（KBF）</h2>
<table>
  <tr><th style="width:60%">要因</th><th style="text-align:center">重要度</th></tr>
  ${step3.kbf.filter(k => k.name).map(k => `
  <tr><td>${escapeHtml(k.name)}</td><td style="text-align:center"><span class="badge badge-${k.importance || 'low'}">${k.importance === 'high' ? '高' : k.importance === 'medium' ? '中' : '低'}</span></td></tr>
  `).join('')}
</table>
` : ''}

${(step3.axes || []).length > 0 ? `
<h2>4.2 ストラテジーキャンバス</h2>
${buildScoreTable(step3, companies)}
<div class="svg-container">${canvasSvg}</div>

<h2>4.3 ポジショニングマップ</h2>
<div class="svg-container">${posMapSvg}</div>
` : ''}


`}

<!-- 5. SWOT分析 -->
<div class="print-break"></div>
<h1 id="sec5">5. SWOT分析</h1>
${buildSwotSection(swot, step0)}





<div class="footer">
  戦略コンパス にて作成 | ${new Date().toLocaleDateString('ja-JP')}
</div>

</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

function buildTargetingSection(settings, step2) {
  const candidates = step2.candidates || [];
  const axes = step2.axes || [];
  if (candidates.length === 0) return '<p style="color:#94a3b8;">（候補が未設定です）</p>';

  // 3.1 候補一覧
  const compTable = `
<h2>3.1 ターゲット候補と構成</h2>
<table>
  <tr><th style="width:35%">候補名</th><th>構成セグメント</th></tr>
  ${candidates.map(c => `
  <tr>
    <td><strong>${escapeHtml(c.name || '(名称未設定)')}</strong></td>
    <td>${(c.segments || []).map(s => `<span class="chip" style="display:inline-block;padding:3px 10px;margin:2px;background:#f1f5f9;border-radius:9999px;font-size:12px;">${escapeHtml(s.axisName)}: ${escapeHtml(s.segName)}</span>`).join('') || '<span style="color:#94a3b8">(未設定)</span>'}</td>
  </tr>
  `).join('')}
</table>
`;

  // 3.2 スコア（加重合計でソート）
  let scoreTable = '';
  if (axes.length > 0) {
    const sorted = [...candidates].map(c => {
      let total = 0;
      const raws = axes.map(axis => {
        const raw = step2.scores?.[`${c.id}_${axis.id}`] || 0;
        const mult = axis.weight === 'high' ? 3 : axis.weight === 'medium' ? 2 : 1;
        total += raw * mult;
        return raw;
      });
      const target = step2.targets?.[c.id] || {};
      return { c, raws, total, target };
    }).sort((a, b) => b.total - a.total);

    const header = axes.map(a => {
      const mult = a.weight === 'high' ? 3 : a.weight === 'medium' ? 2 : 1;
      return `<th style="text-align:center">${escapeHtml(a.name)}<br><span style="font-size:11px;color:#94a3b8;">(×${mult})</span></th>`;
    }).join('');

    scoreTable = `
<h2>3.2 6R評価スコア</h2>
<table>
  <tr><th>候補</th>${header}<th style="text-align:center">加重合計</th><th style="text-align:center">区分</th></tr>
  ${sorted.map(({ c, raws, total, target }) => `
  <tr>
    <td><strong>${escapeHtml(c.name || '(名称未設定)')}</strong></td>
    ${raws.map(r => `<td class="numeric">${r}</td>`).join('')}
    <td class="total">${total}</td>
    <td style="text-align:center"><span class="badge badge-${target.label === 'main' ? 'main' : target.label === 'sub' ? 'sub' : 'none'}">${target.label === 'main' ? 'メイン' : target.label === 'sub' ? 'サブ' : '対象外'}</span></td>
  </tr>
  `).join('')}
</table>
`;
  }

  // 3.3 メイン/サブの選定理由
  const selectedTargets = candidates
    .map(c => ({ c, target: step2.targets?.[c.id] || {} }))
    .filter(({ target }) => target.label === 'main' || target.label === 'sub');

  let reasonsSection = '';
  if (selectedTargets.length > 0) {
    reasonsSection = `
<h2>3.3 選定したターゲットと理由</h2>
${selectedTargets.map(({ c, target }) => `
<div class="candidate-card ${target.label}">
  <div class="head">
    <span class="badge badge-${target.label}">${target.label === 'main' ? 'メイン' : 'サブ'}</span>
    <span class="name">${escapeHtml(c.name || '(名称未設定)')}</span>
  </div>
  ${(c.segments || []).length > 0 ? `<div class="composition">${c.segments.map(s => `<span class="chip">${escapeHtml(s.axisName)}: ${escapeHtml(s.segName)}</span>`).join('')}</div>` : ''}
  ${target.reason ? `<div class="reason">${escapeHtml(target.reason)}</div>` : ''}
</div>
`).join('')}
`;
  }

  return compTable + scoreTable + reasonsSection;
}

function buildSwotSection(swot, step0) {
  if (!swot || swot.skipped) {
    return '<p style="color:#94a3b8;">SWOT分析はスキップされました。</p>';
  }
  const effectiveStrengths = (swot.strengths || []).filter(Boolean).length > 0
    ? swot.strengths.filter(Boolean)
    : ((step0.top5 || []).map(t => t.name).filter(Boolean));
  const weaknesses = (swot.weaknesses || []).filter(Boolean);
  const opportunities = (swot.opportunities || []).filter(Boolean);
  const threats = (swot.threats || []).filter(Boolean);
  const strategyOptions = (swot.strategyOptions || []).filter(o => (o.text || '').trim());

  let html = '';

  if (effectiveStrengths.length + weaknesses.length + opportunities.length + threats.length > 0) {
    html += `
<h2>5.1 SWOT 4象限</h2>
<div class="swot-grid">
  <div class="swot-cell swot-s">
    <h4>💪 強み (Strengths)</h4>
    <ul>${effectiveStrengths.map(s => `<li>${escapeHtml(s)}</li>`).join('') || '<li style="color:#94a3b8">（未入力）</li>'}</ul>
  </div>
  <div class="swot-cell swot-o">
    <h4>🌱 機会 (Opportunities)</h4>
    <ul>${opportunities.map(o => `<li>${escapeHtml(o)}</li>`).join('') || '<li style="color:#94a3b8">（未入力）</li>'}</ul>
  </div>
  <div class="swot-cell swot-w">
    <h4>⚡ 弱み (Weaknesses)</h4>
    <ul>${weaknesses.map(w => `<li>${escapeHtml(w)}</li>`).join('') || '<li style="color:#94a3b8">（未入力）</li>'}</ul>
  </div>
  <div class="swot-cell swot-t">
    <h4>⚠️ 脅威 (Threats)</h4>
    <ul>${threats.map(t => `<li>${escapeHtml(t)}</li>`).join('') || '<li style="color:#94a3b8">（未入力）</li>'}</ul>
  </div>
</div>
`;
  }

  if (strategyOptions.length > 0) {
    const typeMeta = {
      so: '積極戦略（S×O）',
      st: '差別化戦略（S×T）',
      wo: '改善戦略（W×O）',
      wt: '防衛戦略（W×T）',
    };
    html += `<h2>5.2 戦略オプション（クロスSWOT）</h2>`;
    html += `<p style="font-size:12px;color:#64748b;">4つの組み合わせ視点（S×O・S×T・W×O・W×T）から導き出した戦略オプションと評価。</p>`;
    strategyOptions.forEach((opt, idx) => {
      const evalParts = [];
      if (opt.effect) evalParts.push(`効果:${escapeHtml(opt.effect)}`);
      if (opt.feasibility) evalParts.push(`実現性:${escapeHtml(opt.feasibility)}`);
      html += `
<div class="cross-card cross-${opt.type || 'none'}">
  <div class="label">戦略オプション${idx + 1}</div>
  ${typeMeta[opt.type] ? `<div class="sub">〔${typeMeta[opt.type]}〕${evalParts.length > 0 ? ` ［${evalParts.join('・')}］` : ''}</div>` : (evalParts.length > 0 ? `<div class="sub">［${evalParts.join('・')}］</div>` : '')}
  <div class="text">${escapeHtml(opt.text)}</div>
</div>
`;
    });
  }

  return html;
}

function buildScoreTable(step3, companies) {
  if ((step3.axes || []).length === 0) return '';
  const headerCells = step3.axes.map(a => '<th style="text-align:center">' + escapeHtml(a.name) + '</th>').join('');
  const rows = companies.map(comp => {
    const cells = step3.axes.map(axis => {
      const score = step3.scores?.[comp.id + '_' + axis.id] || 0;
      return '<td class="numeric' + (comp.id === 'self' ? ' self' : '') + '">' + score + '</td>';
    }).join('');
    const label = escapeHtml(comp.name || '(未入力)') + (comp.id === 'self' ? ' ⭐' : '');
    return '<tr><td' + (comp.id === 'self' ? ' class="self"' : '') + '>' + label + '</td>' + cells + '</tr>';
  }).join('');
  return '<table><tr><th>企業</th>' + headerCells + '</tr>' + rows + '</table>';
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>');
}

const COLORS = ['#2563eb', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

function buildCanvasSvg(step3, companies) {
  const W = 700, padL = 50, padR = 30, padT = 30, padB = 50;
  const axes = step3.axes || [];
  if (axes.length < 2) return '<p style="color:#94a3b8;">（評価軸が不足しています）</p>';

  const chartH = 350;
  const plotW = W - padL - padR;
  const plotH = chartH - padT - padB;
  const stepX = plotW / (axes.length - 1);

  const charW = 7;
  const iconW = 18;
  const itemGap = 20;
  const maxLegendW = W - padL - padR;
  const legendLineH = 20;

  const legendRows = [];
  let currentRow = [];
  let currentX = 0;
  companies.forEach((comp, ci) => {
    const name = comp.name || '(未入力)';
    const itemW = iconW + name.length * charW;
    if (currentX > 0 && currentX + itemGap + itemW > maxLegendW) {
      legendRows.push(currentRow);
      currentRow = [];
      currentX = 0;
    }
    currentRow.push({ name, color: COLORS[ci % COLORS.length], offsetX: currentX });
    currentX += itemW + itemGap;
  });
  if (currentRow.length > 0) legendRows.push(currentRow);

  const legendH = legendRows.length * legendLineH + 10;
  const H = chartH + legendH;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  for (let i = 0; i <= 10; i += 2) {
    const y = padT + plotH - (i / 10) * plotH;
    svg += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3,3"/>`;
    svg += `<text x="${padL - 5}" y="${y + 4}" text-anchor="end" font-size="10" fill="#94a3b8">${i}</text>`;
  }
  axes.forEach((axis, i) => {
    const x = padL + i * stepX;
    svg += `<text x="${x}" y="${chartH - 10}" text-anchor="middle" font-size="10" fill="#64748b">${escapeHtml(axis.name)}</text>`;
  });
  companies.forEach((comp, ci) => {
    const color = COLORS[ci % COLORS.length];
    const sw = comp.id === 'self' ? 3 : 1.5;
    const points = axes.map((axis, i) => {
      const val = step3.scores?.[`${comp.id}_${axis.id}`] || 0;
      const x = padL + i * stepX;
      const y = padT + plotH - (val / 10) * plotH;
      return `${x},${y}`;
    }).join(' ');
    svg += `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    axes.forEach((axis, i) => {
      const val = step3.scores?.[`${comp.id}_${axis.id}`] || 0;
      const x = padL + i * stepX;
      const y = padT + plotH - (val / 10) * plotH;
      const r = comp.id === 'self' ? 5 : 3;
      svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
    });
  });
  legendRows.forEach((rowItems, ri) => {
    rowItems.forEach(item => {
      const lx = padL + item.offsetX;
      const ly = chartH + ri * legendLineH + 5;
      svg += `<rect x="${lx}" y="${ly}" width="12" height="12" fill="${item.color}" rx="2"/>`;
      svg += `<text x="${lx + 16}" y="${ly + 10}" font-size="10" fill="#334155">${escapeHtml(item.name)}</text>`;
    });
  });
  svg += '</svg>';
  return svg;
}

function buildPositionMapSvg(step3, companies) {
  const map = (step3.maps || [])[0];
  if (!map || !map.xAxis || !map.yAxis) return '<p style="color:#94a3b8;">（軸が未設定です）</p>';

  // チャート寸法を拡大し、右側に凡例エリアを確保
  const W = 700, H = 580, pad = 60;
  const plotW = W - pad * 2;
  const plotH = H - pad * 2 - 60; // 凡例分を確保

  const xAxisName = (step3.axes || []).find(a => a.id === map.xAxis)?.name || '';
  const yAxisName = (step3.axes || []).find(a => a.id === map.yAxis)?.name || '';

  // 各社のプロット位置を計算
  const points = companies.map((comp, ci) => {
    const xVal = step3.scores?.[`${comp.id}_${map.xAxis}`] || 0;
    const yVal = step3.scores?.[`${comp.id}_${map.yAxis}`] || 0;
    return {
      comp,
      ci,
      cx: pad + (xVal / 10) * plotW,
      cy: pad + plotH - (yVal / 10) * plotH,
      r: comp.id === 'self' ? 12 : 8,
      color: COLORS[ci % COLORS.length],
      name: comp.name || '(未入力)',
      xVal,
      yVal,
    };
  });

  // 衝突を避けるラベル配置: 8方向の候補から空いている位置を探す
  const fontSize = 11;
  const charWJ = fontSize * 1.05; // 日本語1文字の概算幅
  const placedBoxes = [];

  function intersects(a, b) {
    return !(a.x2 < b.x1 || a.x1 > b.x2 || a.y2 < b.y1 || a.y1 > b.y2);
  }

  function bboxFor(lx, ly, anchor, textW, textH) {
    const half = textW / 2;
    if (anchor === 'middle') return { x1: lx - half, y1: ly - textH, x2: lx + half, y2: ly + 2 };
    if (anchor === 'start') return { x1: lx, y1: ly - textH, x2: lx + textW, y2: ly + 2 };
    return { x1: lx - textW, y1: ly - textH, x2: lx, y2: ly + 2 }; // end
  }

  // 自社を最初に配置（一番見やすい位置を確保）
  const sorted = [...points].sort((a, b) => (a.comp.id === 'self' ? -1 : b.comp.id === 'self' ? 1 : 0));

  const labels = [];
  sorted.forEach(pt => {
    const textW = pt.name.length * charWJ;
    const textH = fontSize + 2;
    const pad2 = 6;
    // 候補位置（dx, dy, anchor, leader）
    const candidates = [
      { dx: 0, dy: -(pt.r + pad2), anchor: 'middle', leader: false },
      { dx: 0, dy: pt.r + textH + 2, anchor: 'middle', leader: false },
      { dx: pt.r + pad2, dy: textH / 2 - 2, anchor: 'start', leader: false },
      { dx: -(pt.r + pad2), dy: textH / 2 - 2, anchor: 'end', leader: false },
      { dx: pt.r + 4, dy: -(pt.r + 4), anchor: 'start', leader: true },
      { dx: -(pt.r + 4), dy: -(pt.r + 4), anchor: 'end', leader: true },
      { dx: pt.r + 4, dy: pt.r + textH + 2, anchor: 'start', leader: true },
      { dx: -(pt.r + 4), dy: pt.r + textH + 2, anchor: 'end', leader: true },
      // さらにオフセットを大きく
      { dx: pt.r + 20, dy: -(pt.r + 10), anchor: 'start', leader: true },
      { dx: -(pt.r + 20), dy: -(pt.r + 10), anchor: 'end', leader: true },
      { dx: pt.r + 20, dy: pt.r + textH + 8, anchor: 'start', leader: true },
      { dx: -(pt.r + 20), dy: pt.r + textH + 8, anchor: 'end', leader: true },
    ];

    let chosen = null;
    for (const cand of candidates) {
      const lx = pt.cx + cand.dx;
      const ly = pt.cy + cand.dy;
      const bbox = bboxFor(lx, ly, cand.anchor, textW, textH);
      // プロット領域外に出すぎないか
      if (bbox.x1 < pad - 30 || bbox.x2 > W - 10 || bbox.y1 < pad - 25 || bbox.y2 > pad + plotH + 25) continue;
      const collides = placedBoxes.some(b => intersects(b, bbox));
      if (!collides) {
        chosen = { ...cand, lx, ly, bbox };
        break;
      }
    }
    if (!chosen) {
      // どこも空いてなければ既定位置に重ねて配置
      chosen = {
        dx: 0, dy: -(pt.r + pad2), anchor: 'middle', leader: false,
        lx: pt.cx, ly: pt.cy - pt.r - pad2,
        bbox: bboxFor(pt.cx, pt.cy - pt.r - pad2, 'middle', textW, textH),
      };
    }
    placedBoxes.push(chosen.bbox);
    labels.push({ pt, label: chosen });
  });

  // SVG構築
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  // プロット背景
  svg += `<rect x="${pad}" y="${pad}" width="${plotW}" height="${plotH}" fill="#f8fafc" stroke="#e2e8f0"/>`;
  // 4象限の境界線
  svg += `<line x1="${pad + plotW / 2}" y1="${pad}" x2="${pad + plotW / 2}" y2="${pad + plotH}" stroke="#cbd5e1" stroke-dasharray="4,4"/>`;
  svg += `<line x1="${pad}" y1="${pad + plotH / 2}" x2="${pad + plotW}" y2="${pad + plotH / 2}" stroke="#cbd5e1" stroke-dasharray="4,4"/>`;
  // 軸名
  svg += `<text x="${pad + plotW / 2}" y="${pad + plotH + 35}" text-anchor="middle" font-size="13" fill="#334155" font-weight="600">${escapeHtml(xAxisName)}</text>`;
  svg += `<text x="20" y="${pad + plotH / 2}" text-anchor="middle" font-size="13" fill="#334155" font-weight="600" transform="rotate(-90,20,${pad + plotH / 2})">${escapeHtml(yAxisName)}</text>`;
  // 目盛り
  for (let i = 0; i <= 10; i += 2) {
    const x = pad + (i / 10) * plotW;
    const y = pad + plotH - (i / 10) * plotH;
    svg += `<text x="${x}" y="${pad + plotH + 15}" text-anchor="middle" font-size="10" fill="#94a3b8">${i}</text>`;
    svg += `<text x="${pad - 8}" y="${y + 3}" text-anchor="end" font-size="10" fill="#94a3b8">${i}</text>`;
  }

  // リーダー線（ラベルがオフセットされた場合）→ 円より先に描画
  labels.forEach(({ pt, label }) => {
    if (label.leader) {
      svg += `<line x1="${pt.cx}" y1="${pt.cy}" x2="${label.lx}" y2="${label.ly + 2}" stroke="${pt.color}" stroke-width="1" stroke-opacity="0.5" stroke-dasharray="2,2"/>`;
    }
  });

  // 円とラベル
  points.forEach(pt => {
    svg += `<circle cx="${pt.cx}" cy="${pt.cy}" r="${pt.r}" fill="${pt.color}" fill-opacity="0.75" stroke="${pt.comp.id === 'self' ? '#000' : pt.color}" stroke-width="${pt.comp.id === 'self' ? 2 : 1}"/>`;
  });
  labels.forEach(({ pt, label }) => {
    const fontWeight = pt.comp.id === 'self' ? '700' : '500';
    // ラベルの背景白パディング（重なっても読めるように）
    const textW = pt.name.length * charWJ;
    let bgX = label.lx, bgY = label.ly - fontSize;
    if (label.anchor === 'middle') bgX = label.lx - textW / 2;
    else if (label.anchor === 'end') bgX = label.lx - textW;
    svg += `<rect x="${bgX - 2}" y="${bgY}" width="${textW + 4}" height="${fontSize + 4}" fill="#ffffff" fill-opacity="0.85" rx="2"/>`;
    svg += `<text x="${label.lx}" y="${label.ly}" text-anchor="${label.anchor}" font-size="${fontSize}" fill="${pt.color}" font-weight="${fontWeight}">${escapeHtml(pt.name)}</text>`;
  });

  // 凡例（チャート下部）
  const legendY = pad + plotH + 55;
  const legendItemH = 18;
  const charW = 7;
  const iconW = 18;
  const itemGap = 16;
  const maxLegendW = W - pad * 2;
  const legendRows = [];
  let row = [];
  let curX = 0;
  points.forEach(pt => {
    const itemW = iconW + pt.name.length * charW + (pt.comp.id === 'self' ? 16 : 0);
    if (curX > 0 && curX + itemGap + itemW > maxLegendW) {
      legendRows.push(row);
      row = [];
      curX = 0;
    }
    row.push({ pt, offsetX: curX });
    curX += itemW + itemGap;
  });
  if (row.length > 0) legendRows.push(row);
  legendRows.forEach((items, ri) => {
    items.forEach(({ pt, offsetX }) => {
      const lx = pad + offsetX;
      const ly = legendY + ri * legendItemH;
      svg += `<circle cx="${lx + 6}" cy="${ly + 4}" r="6" fill="${pt.color}" fill-opacity="0.75" stroke="${pt.comp.id === 'self' ? '#000' : pt.color}" stroke-width="${pt.comp.id === 'self' ? 2 : 1}"/>`;
      svg += `<text x="${lx + 18}" y="${ly + 8}" font-size="11" fill="#334155" font-weight="${pt.comp.id === 'self' ? '700' : '400'}">${escapeHtml(pt.name)}${pt.comp.id === 'self' ? ' ⭐' : ''}</text>`;
    });
  });

  svg += '</svg>';
  return svg;
}
