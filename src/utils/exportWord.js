import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { VALUE_CHAIN_CATEGORIES } from '../data/defaultData';

function createBorderedCell(text, opts = {}) {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: text || '', size: 20, ...(opts.bold ? { bold: true } : {}) })], alignment: opts.align || AlignmentType.LEFT })],
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
    },
  });
}

export async function exportToWord(project) {
  const { settings, step0, step1, step2, step3, aiComments } = project;

  const sections = [];

  // Title page
  sections.push(
    new Paragraph({ text: 'STP分析レポート', heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
    new Paragraph({ children: [new TextRun({ text: settings.projectName || '', size: 32, bold: true })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: `自社名: ${settings.companyName || ''}`, size: 24 })], alignment: AlignmentType.CENTER }),
    new Paragraph({ children: [new TextRun({ text: `市場タイプ: ${settings.marketType === 'btob' ? 'BtoB' : 'BtoC'}`, size: 24 })], alignment: AlignmentType.CENTER }),
    new Paragraph({ children: [new TextRun({ text: `作成日: ${new Date().toLocaleDateString('ja-JP')}`, size: 24 })], alignment: AlignmentType.CENTER, spacing: { after: 600 } }),
    new Paragraph({ text: '' }),
  );

  // Section 1: 強み
  sections.push(
    new Paragraph({ text: '1. 自社の強み', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
  );

  if ((step0.top5 || []).length > 0) {
    sections.push(new Paragraph({ text: 'Top5 強み', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
    const top5Rows = [
      new TableRow({ children: [createBorderedCell('順位', { bold: true }), createBorderedCell('区分', { bold: true }), createBorderedCell('強み', { bold: true }), createBorderedCell('重要理由', { bold: true })] }),
    ];
    step0.top5.forEach((item, idx) => {
      top5Rows.push(new TableRow({ children: [
        createBorderedCell(`${idx + 1}`), createBorderedCell(item.categoryName || ''), createBorderedCell(item.name), createBorderedCell(item.reason || ''),
      ] }));
    });
    sections.push(new Table({ rows: top5Rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
  }

  if (aiComments.strengthSummary) {
    sections.push(
      new Paragraph({ text: 'AIコメント', heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } }),
      new Paragraph({ text: aiComments.strengthSummary, spacing: { after: 200 } }),
    );
  }

  // Section 2: セグメンテーション
  sections.push(
    new Paragraph({ text: '2. セグメンテーション', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
  );
  if (step1.selectedAxes.length > 0) {
    const segRows = [
      new TableRow({ children: [createBorderedCell('切り口', { bold: true }), createBorderedCell('優先度', { bold: true }), createBorderedCell('セグメント', { bold: true }), createBorderedCell('特性メモ', { bold: true })] }),
    ];
    step1.selectedAxes.forEach(axis => {
      const segs = step1.segments[axis.id] || [];
      segs.forEach(seg => {
        segRows.push(new TableRow({ children: [
          createBorderedCell(axis.name), createBorderedCell(axis.priority), createBorderedCell(seg.name), createBorderedCell(seg.memo || ''),
        ] }));
      });
    });
    sections.push(new Table({ rows: segRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
  }

  // Section 3: ターゲティング
  sections.push(
    new Paragraph({ text: '3. ターゲティング', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
  );

  const allSegs = [];
  for (const [axisId, segList] of Object.entries(step1.segments || {})) {
    for (const seg of segList) {
      if (seg.name) allSegs.push(seg);
    }
  }

  if (allSegs.length > 0 && step2.axes.length > 0) {
    const header = [createBorderedCell('セグメント', { bold: true }), ...step2.axes.map(a => createBorderedCell(a.name, { bold: true })), createBorderedCell('合計', { bold: true }), createBorderedCell('区分', { bold: true })];
    const tRows = [new TableRow({ children: header })];
    allSegs.forEach(seg => {
      let total = 0;
      const cells = [createBorderedCell(seg.name)];
      step2.axes.forEach(axis => {
        const raw = step2.scores[`${seg.id}_${axis.id}`] || 0;
        const mult = axis.weight === 'high' ? 3 : axis.weight === 'medium' ? 2 : 1;
        total += raw * mult;
        cells.push(createBorderedCell(`${raw}`));
      });
      const t = step2.targets[seg.id] || {};
      cells.push(createBorderedCell(`${total}`));
      cells.push(createBorderedCell(t.label === 'main' ? 'メイン' : t.label === 'sub' ? 'サブ' : '対象外'));
      tRows.push(new TableRow({ children: cells }));
    });
    sections.push(new Table({ rows: tRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
  }

  if (aiComments.targetingRationale) {
    sections.push(
      new Paragraph({ text: 'AIコメント', heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } }),
      new Paragraph({ text: aiComments.targetingRationale, spacing: { after: 200 } }),
    );
  }

  // Section 4: ポジショニング
  if (step3.skipped) {
    sections.push(
      new Paragraph({ text: '4. ポジショニング', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
      new Paragraph({ text: 'ポジショニング分析はスキップされました（下請け企業等で競合設定が難しい場合）。', spacing: { after: 200 } }),
    );
  } else {
    sections.push(
      new Paragraph({ text: '4. ポジショニング', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
      new Paragraph({ text: '※ グラフ（ストラテジーキャンバス・ポジショニングマップ）はHTMLレポートをご参照ください。', spacing: { after: 200 } }),
    );

    const companies = [{ id: 'self', name: settings.companyName || '自社' }, ...step3.competitors];
    if (step3.axes.length > 0) {
      const posHeader = [createBorderedCell('企業', { bold: true }), ...step3.axes.map(a => createBorderedCell(a.name, { bold: true }))];
      const pRows = [new TableRow({ children: posHeader })];
      companies.forEach(comp => {
        const cells = [createBorderedCell(comp.name || '(未入力)')];
        step3.axes.forEach(axis => {
          cells.push(createBorderedCell(`${step3.scores[`${comp.id}_${axis.id}`] || 0}`));
        });
        pRows.push(new TableRow({ children: cells }));
      });
      sections.push(new Table({ rows: pRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    }

    if (aiComments.positioningComment) {
      sections.push(
        new Paragraph({ text: 'AIコメント', heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } }),
        new Paragraph({ text: aiComments.positioningComment, spacing: { after: 200 } }),
      );
    }
  }

  if (aiComments.overallStrategy) {
    sections.push(
      new Paragraph({ text: '5. 総合戦略コメント', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
      new Paragraph({ text: aiComments.overallStrategy, spacing: { after: 200 } }),
    );
  }

  const doc = new Document({
    sections: [{ properties: {}, children: sections }],
  });

  const buffer = await Packer.toBlob(doc);
  const fileName = `${settings.projectName || 'STP分析'}_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '')}.docx`;
  saveAs(buffer, fileName);
}
