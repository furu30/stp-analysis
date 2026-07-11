import * as XLSX from 'xlsx';

/** 重み表記 */
function weightLabel(weight) {
  return weight === 'high' ? '高(×3)' : weight === 'medium' ? '中(×2)' : '低(×1)';
}

function weightMultiplier(weight) {
  return weight === 'high' ? 3 : weight === 'medium' ? 2 : 1;
}

function targetLabel(label) {
  return label === 'main' ? 'メイン' : label === 'sub' ? 'サブ' : '対象外';
}

/** 列幅を内容に合わせてざっくり設定 */
function setColWidths(ws, widths) {
  ws['!cols'] = widths.map(wch => ({ wch }));
}

/**
 * STP分析結果をExcel（5シート構成）で出力する
 * Sheet1: 強み棚卸 / Sheet2: セグメント一覧 / Sheet3: ターゲティング評価
 * Sheet4: ポジショニング評価 / Sheet5: アクションプラン
 */
export function exportToExcel(project) {
  const { settings, step0, step1, step2, step3, actionPlan } = project;
  const wb = XLSX.utils.book_new();

  // ===== Sheet 1: 強み棚卸 =====
  const s1 = [['カテゴリ', '項目', '当社の強み', '顧客への伝達', '伝達状況', '強み★']];
  (step0.categories || []).forEach(cat => {
    (cat.items || []).forEach(item => {
      if (!item.strength && !item.communication && !item.isStrengthFlag) return;
      s1.push([
        cat.categoryName || '',
        item.name || '',
        item.strength || '',
        item.communication || '',
        item.communicationStatus === 'communicated' ? '伝達できている'
          : item.communicationStatus === 'issue' ? '課題あり'
          : item.communicationStatus === 'none' ? '未対応' : '',
        item.isStrengthFlag ? '★' : '',
      ]);
    });
  });
  s1.push([]);
  s1.push(['【Top強み（最大7件）】']);
  s1.push(['順位', '強み', 'カテゴリ', '重要理由（模倣困難性・希少性・顧客価値）']);
  (step0.top5 || []).forEach((t, i) => {
    s1.push([i + 1, t.name || '', t.categoryName || '', t.reason || '']);
  });
  const ws1 = XLSX.utils.aoa_to_sheet(s1);
  setColWidths(ws1, [18, 18, 40, 30, 12, 6]);
  XLSX.utils.book_append_sheet(wb, ws1, '強み棚卸');

  // ===== Sheet 2: セグメント一覧 =====
  const s2 = [['切り口（軸）', '優先度', 'セグメント名', '特性メモ']];
  (step1.selectedAxes || []).forEach(axis => {
    const segs = (step1.segments?.[axis.id] || []).filter(s => s.name);
    if (segs.length === 0) {
      s2.push([axis.name, axis.priority || '', '', '']);
    } else {
      segs.forEach(seg => s2.push([axis.name, axis.priority || '', seg.name, seg.memo || '']));
    }
  });
  const ws2 = XLSX.utils.aoa_to_sheet(s2);
  setColWidths(ws2, [22, 8, 24, 50]);
  XLSX.utils.book_append_sheet(wb, ws2, 'セグメント一覧');

  // ===== Sheet 3: ターゲティング評価 =====
  const tAxes = step2.axes || [];
  const s3Header = ['候補', ...tAxes.map(a => `${a.name} ${weightLabel(a.weight)}`), '加重合計', '区分', '選定理由'];
  const s3 = [s3Header];
  const sorted = [...(step2.candidates || [])].map(c => {
    let total = 0;
    const raws = tAxes.map(axis => {
      const raw = step2.scores?.[`${c.id}_${axis.id}`] || 0;
      total += raw * weightMultiplier(axis.weight);
      return raw;
    });
    const target = step2.targets?.[c.id] || {};
    return { c, raws, total, target };
  }).sort((a, b) => b.total - a.total);
  sorted.forEach(({ c, raws, total, target }) => {
    s3.push([c.name || '(名称未設定)', ...raws, total, targetLabel(target.label), target.reason || '']);
  });
  const ws3 = XLSX.utils.aoa_to_sheet(s3);
  setColWidths(ws3, [26, ...tAxes.map(() => 14), 10, 8, 50]);
  XLSX.utils.book_append_sheet(wb, ws3, 'ターゲティング評価');

  // ===== Sheet 4: ポジショニング評価 =====
  const s4 = [];
  if (step3?.skipped) {
    s4.push(['ポジショニング分析はスキップされました']);
  } else {
    const pAxes = step3.axes || [];
    const companies = [{ id: 'self', name: settings.companyName || '自社' }, ...(step3.competitors || [])];
    s4.push(['企業', ...pAxes.map(a => a.name)]);
    companies.forEach(comp => {
      s4.push([
        comp.id === 'self' ? `${comp.name} ★` : (comp.name || '(未入力)'),
        ...pAxes.map(axis => step3.scores?.[`${comp.id}_${axis.id}`] || 0),
      ]);
    });
    if ((step3.kbf || []).length > 0) {
      s4.push([]);
      s4.push(['【購買決定要因（KBF）】']);
      s4.push(['要因', '重要度']);
      step3.kbf.filter(k => k.name).forEach(k => {
        s4.push([k.name, k.importance === 'high' ? '高' : k.importance === 'medium' ? '中' : '低']);
      });
    }
  }
  const ws4 = XLSX.utils.aoa_to_sheet(s4);
  setColWidths(ws4, [22, 14, 14, 14, 14, 14, 14]);
  XLSX.utils.book_append_sheet(wb, ws4, 'ポジショニング評価');

  // ===== Sheet 5: アクションプラン =====
  const apItems = (actionPlan?.items || []).filter(it => it.title || it.firstStep);
  const s5 = [['優先', '施策名', '狙い・対象ターゲット', '最初の一歩', '担当', '期限目安']];
  apItems.forEach((it, i) => {
    s5.push([i + 1, it.title || '', it.target || '', it.firstStep || '', it.owner || '', it.due || '']);
  });
  const ws5 = XLSX.utils.aoa_to_sheet(s5);
  setColWidths(ws5, [6, 32, 26, 40, 12, 12]);
  XLSX.utils.book_append_sheet(wb, ws5, 'アクションプラン');

  const date = new Date().toLocaleDateString('ja-JP').replace(/\//g, '');
  XLSX.writeFile(wb, `${settings.projectName || 'STP分析'}_${date}.xlsx`);
}
