import { VALUE_CHAIN_CATEGORIES } from '../data/defaultData';

export function exportToHtmlReport(project) {
  const { settings, step0, step1, step2, step3, aiComments } = project;

  const allSegs = [];
  for (const [axisId, segList] of Object.entries(step1.segments || {})) {
    const axis = step1.selectedAxes.find(a => a.id === axisId);
    for (const seg of segList) {
      if (seg.name) allSegs.push({ ...seg, axisName: axis?.name || '' });
    }
  }

  const companies = step3.skipped ? [] : [{ id: 'self', name: settings.companyName || '自社' }, ...step3.competitors];

  // Build strategy canvas SVG
  const canvasSvg = step3.skipped ? '' : buildCanvasSvg(step3, companies);
  const posMapSvg = step3.skipped ? '' : buildPositionMapSvg(step3, companies);

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>STP分析レポート - ${settings.projectName || ''}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Sans JP', sans-serif; color: #1e293b; background: #fff; padding: 40px; line-height: 1.7; }
  h1 { font-size: 28px; border-bottom: 3px solid #2563eb; padding-bottom: 8px; margin: 40px 0 20px; color: #1e40af; }
  h2 { font-size: 20px; margin: 30px 0 15px; color: #334155; }
  h3 { font-size: 16px; margin: 20px 0 10px; color: #475569; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
  th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
  th { background: #f1f5f9; font-weight: 700; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; }
  .badge-main { background: #fecaca; color: #dc2626; }
  .badge-sub { background: #fef3c7; color: #d97706; }
  .comment-box { background: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }
  .title-page { text-align: center; padding: 80px 0; }
  .title-page h1 { border: none; font-size: 36px; }
  .svg-container { text-align: center; margin: 20px 0; }
  .svg-container svg { max-width: 100%; }
  @media print {
    body { padding: 20px; }
    .print-break { page-break-before: always; }
    @page { size: A4; margin: 15mm; }
    header, footer { display: block; }
    @page { @top-center { content: "${settings.projectName || 'STP分析レポート'}"; } @bottom-center { content: counter(page); } }
  }
</style>
</head>
<body>
<div class="title-page">
  <h1>STP分析レポート</h1>
  <p style="font-size: 24px; margin: 20px 0; font-weight: 700;">${settings.projectName || ''}</p>
  <p>自社名: ${settings.companyName || ''}</p>
  <p>市場タイプ: ${settings.marketType === 'btob' ? 'BtoB' : 'BtoC'}</p>
  <p>作成日: ${new Date().toLocaleDateString('ja-JP')}</p>
</div>

<div class="print-break"></div>
<h1>1. 自社の強み</h1>
${(step0.top5 || []).length > 0 ? `
<h2>Top5 強み</h2>
<table>
<tr><th>順位</th><th>区分</th><th>項目名</th><th>強み内容</th><th>重要理由</th></tr>
${step0.top5.map((item, idx) => `<tr><td>${idx + 1}</td><td>${item.categoryName || ''}</td><td>${item.name}</td><td>${item.strength || ''}</td><td>${item.reason || ''}</td></tr>`).join('')}
</table>
` : '<p>（Step 0 はスキップされました）</p>'}
${aiComments.strengthSummary ? `<div class="comment-box"><h3>分析コメント</h3><p>${escapeHtml(aiComments.strengthSummary)}</p></div>` : ''}

<div class="print-break"></div>
<h1>2. セグメンテーション</h1>
${step1.selectedAxes.length > 0 ? `
<table>
<tr><th>切り口</th><th>優先度</th><th>セグメント名</th><th>特性メモ</th></tr>
${step1.selectedAxes.map(axis => {
  const segs = step1.segments[axis.id] || [];
  return segs.map(seg => `<tr><td>${axis.name}</td><td>${axis.priority}</td><td>${seg.name}</td><td>${seg.memo || ''}</td></tr>`).join('');
}).join('')}
</table>
` : '<p>（未設定）</p>'}

<div class="print-break"></div>
<h1>3. ターゲティング</h1>
${buildTargetingTable(allSegs, step2)}
${aiComments.targetingRationale ? `<div class="comment-box"><h3>ターゲティング選定根拠</h3><p>${escapeHtml(aiComments.targetingRationale)}</p></div>` : ''}

<div class="print-break"></div>
<h1>4. ポジショニング</h1>
${step3.skipped ? `
<p style="color:#92400e;background:#fffbeb;border:1px solid #fde68a;padding:15px;border-radius:8px;">ポジショニング分析はスキップされました（下請け企業等で競合設定が難しい場合）。</p>
` : `
<h2>スコアマトリクス</h2>
${buildScoreTable(step3, companies)}

<h2>ストラテジーキャンバス</h2>
<div class="svg-container">${canvasSvg}</div>

<h2>ポジショニングマップ</h2>
<div class="svg-container">${posMapSvg}</div>

${aiComments.positioningComment ? `<div class="comment-box"><h3>ポジショニングコメント</h3><p>${escapeHtml(aiComments.positioningComment)}</p></div>` : ''}
`}

${aiComments.overallStrategy ? `
<div class="print-break"></div>
<h1>5. 総合戦略コメント</h1>
<div class="comment-box"><p>${escapeHtml(aiComments.overallStrategy)}</p></div>
` : ''}

<div style="margin-top:60px;text-align:center;color:#94a3b8;font-size:12px">
  STP分析支援アプリにて作成 | ${new Date().toLocaleDateString('ja-JP')}
</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

function buildTargetingTable(allSegs, step2) {
  if (allSegs.length === 0) return '';
  const headerCells = step2.axes.map(a => {
    const mult = a.weight === 'high' ? 3 : a.weight === 'medium' ? 2 : 1;
    return '<th>' + a.name + '<br><span style="font-size:10px">(\u00d7' + mult + ')</span></th>';
  }).join('');
  const rows = allSegs.map(seg => {
    let total = 0;
    const cells = step2.axes.map(axis => {
      const raw = step2.scores[seg.id + '_' + axis.id] || 0;
      const mult = axis.weight === 'high' ? 3 : axis.weight === 'medium' ? 2 : 1;
      total += raw * mult;
      return '<td style="text-align:center">' + raw + '</td>';
    }).join('');
    const t = step2.targets[seg.id] || {};
    const labelHtml = t.label === 'main' ? '<span class="badge badge-main">\u30e1\u30a4\u30f3</span>' : t.label === 'sub' ? '<span class="badge badge-sub">\u30b5\u30d6</span>' : '\u5bfe\u8c61\u5916';
    return '<tr><td>' + seg.name + '</td>' + cells + '<td style="text-align:center;font-weight:bold">' + total + '</td><td>' + labelHtml + '</td></tr>';
  }).join('');
  return '<table><tr><th>\u30bb\u30b0\u30e1\u30f3\u30c8</th>' + headerCells + '<th>\u5408\u8a08</th><th>\u533a\u5206</th></tr>' + rows + '</table>';
}

function buildScoreTable(step3, companies) {
  if (step3.axes.length === 0) return '';
  const headerCells = step3.axes.map(a => '<th>' + a.name + '</th>').join('');
  const rows = companies.map(comp => {
    const cells = step3.axes.map(axis => {
      const score = step3.scores[comp.id + '_' + axis.id] || 0;
      return '<td style="text-align:center">' + score + '</td>';
    }).join('');
    const label = (comp.name || '(未入力)') + (comp.id === 'self' ? ' ⭐' : '');
    return '<tr><td>' + label + '</td>' + cells + '</tr>';
  }).join('');
  return '<table><tr><th>企業</th>' + headerCells + '</tr>' + rows + '</table>';
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

const COLORS = ['#2563eb', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

function buildCanvasSvg(step3, companies) {
  const W = 700, padL = 50, padR = 30, padT = 30, padB = 50;
  const axes = step3.axes;
  if (axes.length < 2) return '<p>（評価軸が不足しています）</p>';

  const chartH = 350;
  const plotW = W - padL - padR;
  const plotH = chartH - padT - padB;
  const stepX = plotW / (axes.length - 1);

  // Calculate legend layout with auto-wrap
  const charW = 7; // approximate width per character at font-size 10
  const iconW = 18; // color rect(12) + gap(6)
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
  // Grid
  for (let i = 0; i <= 10; i += 2) {
    const y = padT + plotH - (i / 10) * plotH;
    svg += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3,3"/>`;
    svg += `<text x="${padL - 5}" y="${y + 4}" text-anchor="end" font-size="10" fill="#94a3b8">${i}</text>`;
  }
  // Axis labels
  axes.forEach((axis, i) => {
    const x = padL + i * stepX;
    svg += `<text x="${x}" y="${chartH - 10}" text-anchor="middle" font-size="10" fill="#64748b">${axis.name}</text>`;
  });
  // Lines
  companies.forEach((comp, ci) => {
    const color = COLORS[ci % COLORS.length];
    const sw = comp.id === 'self' ? 3 : 1.5;
    const points = axes.map((axis, i) => {
      const val = step3.scores[`${comp.id}_${axis.id}`] || 0;
      const x = padL + i * stepX;
      const y = padT + plotH - (val / 10) * plotH;
      return `${x},${y}`;
    }).join(' ');
    svg += `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    axes.forEach((axis, i) => {
      const val = step3.scores[`${comp.id}_${axis.id}`] || 0;
      const x = padL + i * stepX;
      const y = padT + plotH - (val / 10) * plotH;
      const r = comp.id === 'self' ? 5 : 3;
      svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
    });
  });
  // Legend (below chart, auto-wrapped)
  legendRows.forEach((rowItems, ri) => {
    rowItems.forEach(item => {
      const lx = padL + item.offsetX;
      const ly = chartH + ri * legendLineH + 5;
      svg += `<rect x="${lx}" y="${ly}" width="12" height="12" fill="${item.color}" rx="2"/>`;
      svg += `<text x="${lx + 16}" y="${ly + 10}" font-size="10" fill="#334155">${item.name}</text>`;
    });
  });
  svg += '</svg>';
  return svg;
}

function buildPositionMapSvg(step3, companies) {
  const map = step3.maps[0];
  if (!map || !map.xAxis || !map.yAxis) return '<p>（軸が未設定です）</p>';

  const W = 500, H = 500, pad = 60;
  const plotW = W - pad * 2;
  const plotH = H - pad * 2;

  const xAxisName = step3.axes.find(a => a.id === map.xAxis)?.name || '';
  const yAxisName = step3.axes.find(a => a.id === map.yAxis)?.name || '';

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  // Grid
  svg += `<rect x="${pad}" y="${pad}" width="${plotW}" height="${plotH}" fill="#f8fafc" stroke="#e2e8f0"/>`;
  svg += `<line x1="${pad + plotW / 2}" y1="${pad}" x2="${pad + plotW / 2}" y2="${pad + plotH}" stroke="#cbd5e1" stroke-dasharray="4,4"/>`;
  svg += `<line x1="${pad}" y1="${pad + plotH / 2}" x2="${pad + plotW}" y2="${pad + plotH / 2}" stroke="#cbd5e1" stroke-dasharray="4,4"/>`;
  // Axis labels
  svg += `<text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="12" fill="#334155">${xAxisName}</text>`;
  svg += `<text x="15" y="${H / 2}" text-anchor="middle" font-size="12" fill="#334155" transform="rotate(-90,15,${H / 2})">${yAxisName}</text>`;
  // Scale
  for (let i = 0; i <= 10; i += 2) {
    const x = pad + (i / 10) * plotW;
    const y = pad + plotH - (i / 10) * plotH;
    svg += `<text x="${x}" y="${pad + plotH + 15}" text-anchor="middle" font-size="9" fill="#94a3b8">${i}</text>`;
    svg += `<text x="${pad - 8}" y="${y + 3}" text-anchor="end" font-size="9" fill="#94a3b8">${i}</text>`;
  }
  // Points
  companies.forEach((comp, ci) => {
    const xVal = step3.scores[`${comp.id}_${map.xAxis}`] || 0;
    const yVal = step3.scores[`${comp.id}_${map.yAxis}`] || 0;
    const cx = pad + (xVal / 10) * plotW;
    const cy = pad + plotH - (yVal / 10) * plotH;
    const color = COLORS[ci % COLORS.length];
    const r = comp.id === 'self' ? 12 : 8;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" fill-opacity="0.7" stroke="${comp.id === 'self' ? '#000' : color}" stroke-width="${comp.id === 'self' ? 2 : 1}"/>`;
    svg += `<text x="${cx}" y="${cy - r - 4}" text-anchor="middle" font-size="10" fill="#334155">${comp.name || ''}</text>`;
  });
  svg += '</svg>';
  return svg;
}
