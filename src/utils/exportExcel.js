import * as XLSX from 'xlsx';
import { VALUE_CHAIN_CATEGORIES } from '../data/defaultData';

export function exportToExcel(project) {
  const wb = XLSX.utils.book_new();
  const { step0, step1, step2, step3, settings } = project;

  // Sheet 1: 強み棚卸
  const strengthRows = [['区分', '種別', '項目名', '当社の強み', '顧客への伝達', '伝達状況', '強みフラグ']];
  step0.categories.forEach(cat => {
    const meta = VALUE_CHAIN_CATEGORIES.find(c => c.id === cat.id);
    cat.items.forEach(item => {
      if (item.strength || item.communication) {
        strengthRows.push([
          meta?.name || '', meta?.type || '', item.name,
          item.strength, item.communication,
          item.communicationStatus || '', item.isStrengthFlag ? '★' : '',
        ]);
      }
    });
  });
  strengthRows.push([]);
  strengthRows.push(['--- Top5 強み ---']);
  strengthRows.push(['順位', '項目名', '区分', '強み内容', '重要理由']);
  (step0.top5 || []).forEach((item, idx) => {
    strengthRows.push([idx + 1, item.name, item.categoryName || '', item.strength || '', item.reason || '']);
  });
  const ws1 = XLSX.utils.aoa_to_sheet(strengthRows);
  XLSX.utils.book_append_sheet(wb, ws1, '強み棚卸');

  // Sheet 2: セグメント一覧
  const segRows = [['切り口名', '優先度', 'セグメント名', '特性メモ']];
  step1.selectedAxes.forEach(axis => {
    const segs = step1.segments[axis.id] || [];
    segs.forEach(seg => {
      segRows.push([axis.name, axis.priority, seg.name, seg.memo || '']);
    });
  });
  const ws2 = XLSX.utils.aoa_to_sheet(segRows);
  XLSX.utils.book_append_sheet(wb, ws2, 'セグメント一覧');

  // Sheet 3: ターゲティング評価
  const axes = step2.axes;
  const headerRow = ['セグメント名', '切り口', ...axes.map(a => `${a.name}(×${a.weight === 'high' ? 3 : a.weight === 'medium' ? 2 : 1})`), '加重合計', 'ターゲット区分', '顧客像名', '選定理由'];
  const targetRows = [headerRow];
  const allSegs = [];
  for (const [axisId, segList] of Object.entries(step1.segments || {})) {
    const axis = step1.selectedAxes.find(a => a.id === axisId);
    for (const seg of segList) {
      if (seg.name) allSegs.push({ ...seg, axisName: axis?.name || '' });
    }
  }
  allSegs.forEach(seg => {
    let total = 0;
    const scores = axes.map(axis => {
      const raw = step2.scores[`${seg.id}_${axis.id}`] || 0;
      const mult = axis.weight === 'high' ? 3 : axis.weight === 'medium' ? 2 : 1;
      total += raw * mult;
      return raw;
    });
    const t = step2.targets[seg.id] || {};
    targetRows.push([seg.name, seg.axisName, ...scores, total, t.label || '', t.persona || '', t.reason || '']);
  });
  const ws3 = XLSX.utils.aoa_to_sheet(targetRows);
  XLSX.utils.book_append_sheet(wb, ws3, 'ターゲティング評価');

  // Sheet 4: ポジショニング評価
  if (step3.skipped) {
    const ws4 = XLSX.utils.aoa_to_sheet([['ポジショニング分析はスキップされました（下請け企業等で競合設定が難しい場合）']]);
    XLSX.utils.book_append_sheet(wb, ws4, 'ポジショニング評価');
  } else {
    const companies = [{ id: 'self', name: settings.companyName || '自社' }, ...step3.competitors];
    const posHeader = ['企業名', ...step3.axes.map(a => a.name)];
    const posRows = [posHeader];
    companies.forEach(comp => {
      const row = [comp.name || '(未入力)'];
      step3.axes.forEach(axis => {
        row.push(step3.scores[`${comp.id}_${axis.id}`] || 0);
      });
      posRows.push(row);
    });
    const ws4 = XLSX.utils.aoa_to_sheet(posRows);
    XLSX.utils.book_append_sheet(wb, ws4, 'ポジショニング評価');
  }

  const fileName = `${settings.projectName || 'STP分析'}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
