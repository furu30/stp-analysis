import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType,
  Footer, PageNumber, PageBreak,
} from 'docx';
import { saveAs } from 'file-saver';

const COLORS = {
  strengthBg: 'DBEAFE',
  weaknessBg: 'FECACA',
  opportunityBg: 'D1FAE5',
  threatBg: 'FED7AA',
  headerBg: 'F3F4F6',
  mainBg: 'FEE2E2',
  subBg: 'FEF3C7',
  noneBg: 'F3F4F6',
};

function cell(text, opts = {}) {
  const lines = Array.isArray(text) ? text : [text];
  return new TableCell({
    children: lines.map(line => new Paragraph({
      children: [new TextRun({
        text: line || '',
        size: opts.size || 20,
        ...(opts.bold ? { bold: true } : {}),
        ...(opts.color ? { color: opts.color } : {}),
      })],
      alignment: opts.align || AlignmentType.LEFT,
    })),
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' },
    },
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({
      text: text || '',
      size: opts.size || 22,
      ...(opts.bold ? { bold: true } : {}),
      ...(opts.color ? { color: opts.color } : {}),
    })],
    spacing: opts.spacing || { after: 100 },
    alignment: opts.align || AlignmentType.LEFT,
  });
}

function multiLine(text) {
  if (!text) return [new Paragraph({ text: '' })];
  return text.split('\n').map(line => new Paragraph({
    children: [new TextRun({ text: line, size: 22 })],
    spacing: { after: 80 },
  }));
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text: text,
    heading: level,
    spacing: { before: 400, after: 200 },
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function targetLabel(label) {
  return label === 'main' ? 'メイン' : label === 'sub' ? 'サブ' : '対象外';
}

function targetColor(label) {
  return label === 'main' ? COLORS.mainBg : label === 'sub' ? COLORS.subBg : COLORS.noneBg;
}

function weightMultiplier(weight) {
  return weight === 'high' ? 3 : weight === 'medium' ? 2 : 1;
}

function weightLabel(weight) {
  return weight === 'high' ? '高(×3)' : weight === 'medium' ? '中(×2)' : '低(×1)';
}

export async function exportToWord(project) {
  const { settings, step0, step1, step2, step3, swot, aiComments, actionPlan } = project;
  const sections = [];

  // ===== タイトルページ =====
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'STP分析レポート', size: 56, bold: true, color: '1E40AF' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: settings.projectName || '', size: 36, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    new Paragraph({
      children: [new TextRun({ text: settings.companyName || '', size: 32 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `市場タイプ: ${settings.marketType === 'btob' ? 'BtoB' : 'BtoC'}`, size: 24, color: '6B7280' })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: `作成日: ${new Date().toLocaleDateString('ja-JP')}`, size: 24, color: '6B7280' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    pageBreak(),
  );

  // ===== 経営概要 =====
  if (settings.productService || settings.businessDescription) {
    sections.push(heading('経営概要'));
    if (settings.productService) {
      sections.push(
        para('主要事業・商材', { bold: true, size: 24 }),
        ...multiLine(settings.productService),
      );
    }
    if (settings.businessDescription) {
      sections.push(
        para('事業内容', { bold: true, size: 24, spacing: { before: 200, after: 100 } }),
        ...multiLine(settings.businessDescription),
      );
    }
    sections.push(pageBreak());
  }

  // ===== 1. 自社の強み =====
  sections.push(heading('1. 自社の強み（バリューチェーン分析）'));

  if ((step0.top5 || []).length > 0) {
    sections.push(heading('1.1 Top強み', HeadingLevel.HEADING_2));

    step0.top5.forEach((item, idx) => {
      sections.push(new Paragraph({
        children: [
          new TextRun({ text: `${idx + 1}. ${item.name || ''}`, size: 28, bold: true, color: '1E40AF' }),
          new TextRun({ text: `  〔${item.categoryName || ''}〕`, size: 20, color: '6B7280' }),
        ],
        spacing: { before: 300, after: 100 },
      }));
      if (item.strength) {
        sections.push(
          para('■ 強みの内容', { bold: true, color: '374151', size: 22 }),
          ...multiLine(item.strength),
        );
      }
      if (item.reason) {
        sections.push(
          para('■ 重要理由（模倣困難性・希少性・顧客価値）', { bold: true, color: '374151', size: 22, spacing: { before: 100, after: 60 } }),
          ...multiLine(item.reason),
        );
      }
      if (item.communication) {
        sections.push(
          para('■ 顧客への伝達状況', { bold: true, color: '374151', size: 22, spacing: { before: 100, after: 60 } }),
          ...multiLine(item.communication),
        );
      }
    });
  }

  if (aiComments?.strengthSummary) {
    sections.push(
      heading('1.2 強み総評（AIコメント）', HeadingLevel.HEADING_2),
      ...multiLine(aiComments.strengthSummary),
    );
  }
  sections.push(pageBreak());

  // ===== 2. セグメンテーション =====
  sections.push(heading('2. セグメンテーション'));

  if ((step1.selectedAxes || []).length > 0) {
    sections.push(para('市場を分類する切り口（軸）と、各軸の中の具体的なセグメント。', { color: '6B7280', spacing: { after: 200 } }));
    step1.selectedAxes.forEach(axis => {
      const segs = (step1.segments?.[axis.id] || []).filter(s => s.name);
      if (segs.length === 0) return;
      sections.push(new Paragraph({
        children: [
          new TextRun({ text: axis.name, size: 26, bold: true }),
          new TextRun({ text: `  優先度: ${axis.priority || '-'}`, size: 18, color: '6B7280' }),
        ],
        spacing: { before: 200, after: 80 },
      }));
      const segRows = [
        new TableRow({ children: [cell('セグメント名', { bold: true, shading: COLORS.headerBg, width: 30 }), cell('特性メモ', { bold: true, shading: COLORS.headerBg, width: 70 })] }),
        ...segs.map(seg => new TableRow({ children: [cell(seg.name), cell(seg.memo || '')] })),
      ];
      sections.push(new Table({ rows: segRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    });
  }
  sections.push(pageBreak());

  // ===== 3. ターゲティング =====
  sections.push(heading('3. ターゲティング'));

  const candidates = step2.candidates || [];
  const tAxes = step2.axes || [];

  // 3.1 候補一覧と構成
  if (candidates.length > 0) {
    sections.push(heading('3.1 ターゲット候補と構成', HeadingLevel.HEADING_2));
    const compRows = [
      new TableRow({ children: [cell('候補名', { bold: true, shading: COLORS.headerBg, width: 35 }), cell('構成セグメント', { bold: true, shading: COLORS.headerBg, width: 65 })] }),
    ];
    candidates.forEach(c => {
      const segs = (c.segments || []).map(s => `${s.axisName}: ${s.segName}`);
      compRows.push(new TableRow({ children: [cell(c.name || '(名称未設定)'), cell(segs.length > 0 ? segs : '(未設定)')] }));
    });
    sections.push(new Table({ rows: compRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
  }

  // 3.2 6R評価
  if (candidates.length > 0 && tAxes.length > 0) {
    sections.push(heading('3.2 6R評価スコア', HeadingLevel.HEADING_2));
    const scoreHeader = [
      cell('候補', { bold: true, shading: COLORS.headerBg }),
      ...tAxes.map(a => cell([a.name, weightLabel(a.weight)], { bold: true, shading: COLORS.headerBg, align: AlignmentType.CENTER, size: 16 })),
      cell('加重合計', { bold: true, shading: COLORS.headerBg, align: AlignmentType.CENTER }),
      cell('区分', { bold: true, shading: COLORS.headerBg, align: AlignmentType.CENTER }),
    ];
    const scoreRows = [new TableRow({ children: scoreHeader })];

    // 加重合計でソートして表示
    const sorted = [...candidates].map(c => {
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
      scoreRows.push(new TableRow({
        children: [
          cell(c.name || '(名称未設定)'),
          ...raws.map(r => cell(`${r}`, { align: AlignmentType.CENTER })),
          cell(`${total}`, { bold: true, align: AlignmentType.CENTER }),
          cell(targetLabel(target.label), { bold: true, align: AlignmentType.CENTER, shading: targetColor(target.label) }),
        ],
      }));
    });
    sections.push(new Table({ rows: scoreRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
  }

  // 3.3 メイン/サブの選定理由
  const selectedTargets = candidates
    .map(c => ({ c, target: step2.targets?.[c.id] || {} }))
    .filter(({ target }) => target.label === 'main' || target.label === 'sub');

  if (selectedTargets.length > 0) {
    sections.push(heading('3.3 選定したターゲットと理由', HeadingLevel.HEADING_2));
    selectedTargets.forEach(({ c, target }) => {
      sections.push(new Paragraph({
        children: [
          new TextRun({ text: `【${targetLabel(target.label)}】 `, size: 24, bold: true, color: target.label === 'main' ? 'DC2626' : 'D97706' }),
          new TextRun({ text: c.name || '(名称未設定)', size: 24, bold: true }),
        ],
        spacing: { before: 200, after: 100 },
      }));
      if (target.reason) {
        sections.push(...multiLine(target.reason));
      }
    });
  }

  if (aiComments?.targetingRationale) {
    sections.push(
      heading('3.4 ターゲティング戦略コメント（AI生成）', HeadingLevel.HEADING_2),
      ...multiLine(aiComments.targetingRationale),
    );
  }
  sections.push(pageBreak());

  // ===== 4. ポジショニング =====
  sections.push(heading('4. ポジショニング'));

  if (step3?.skipped) {
    sections.push(para('ポジショニング分析はスキップされました（下請け企業等で競合設定が難しい場合）。'));
  } else if (step3) {
    // 4.1 KBF
    if ((step3.kbf || []).length > 0) {
      sections.push(heading('4.1 購買決定要因（KBF）', HeadingLevel.HEADING_2));
      const kbfRows = [
        new TableRow({ children: [cell('要因', { bold: true, shading: COLORS.headerBg, width: 60 }), cell('重要度', { bold: true, shading: COLORS.headerBg, align: AlignmentType.CENTER, width: 40 })] }),
        ...step3.kbf.filter(k => k.name).map(k => new TableRow({
          children: [
            cell(k.name),
            cell(k.importance === 'high' ? '高' : k.importance === 'medium' ? '中' : '低', { align: AlignmentType.CENTER }),
          ],
        })),
      ];
      sections.push(new Table({ rows: kbfRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    }

    // 4.2 競合スコア
    if ((step3.axes || []).length > 0) {
      sections.push(heading('4.2 ストラテジーキャンバス（自社×競合のスコア）', HeadingLevel.HEADING_2));
      const companies = [{ id: 'self', name: settings.companyName || '自社' }, ...(step3.competitors || [])];
      const posHeader = [
        cell('企業', { bold: true, shading: COLORS.headerBg }),
        ...step3.axes.map(a => cell(a.name, { bold: true, shading: COLORS.headerBg, align: AlignmentType.CENTER, size: 16 })),
      ];
      const pRows = [new TableRow({ children: posHeader })];
      companies.forEach(comp => {
        const isSelf = comp.id === 'self';
        const rowCells = [
          cell(comp.name || '(未入力)', { bold: isSelf, shading: isSelf ? COLORS.headerBg : undefined }),
          ...step3.axes.map(axis => cell(`${step3.scores?.[`${comp.id}_${axis.id}`] || 0}`, { align: AlignmentType.CENTER, bold: isSelf })),
        ];
        pRows.push(new TableRow({ children: rowCells }));
      });
      sections.push(new Table({ rows: pRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      sections.push(para('※ ポジショニングマップ等のグラフはHTMLレポートまたはアプリ画面をご参照ください。', { color: '6B7280', size: 18, spacing: { before: 100, after: 200 } }));
    }

    if (aiComments?.positioningComment) {
      sections.push(
        heading('4.3 ポジショニング分析コメント（AI生成）', HeadingLevel.HEADING_2),
        ...multiLine(aiComments.positioningComment),
      );
    }
  }
  sections.push(pageBreak());

  // ===== 5. SWOT分析 =====
  sections.push(heading('5. SWOT分析'));

  if (swot && !swot.skipped) {
    const effectiveStrengths = (swot.strengths || []).filter(Boolean).length > 0
      ? swot.strengths.filter(Boolean)
      : (step0.top5 || []).map(t => t.name).filter(Boolean);
    const weaknesses = (swot.weaknesses || []).filter(Boolean);
    const opportunities = (swot.opportunities || []).filter(Boolean);
    const threats = (swot.threats || []).filter(Boolean);

    // 5.1 SWOT 2x2 grid
    if (effectiveStrengths.length + weaknesses.length + opportunities.length + threats.length > 0) {
      sections.push(heading('5.1 SWOT 4象限', HeadingLevel.HEADING_2));
      const swotRows = [
        // 内部要因ヘッダー
        new TableRow({
          children: [
            cell('内部要因', { bold: true, shading: COLORS.headerBg, align: AlignmentType.CENTER, width: 50 }),
            cell('外部要因', { bold: true, shading: COLORS.headerBg, align: AlignmentType.CENTER, width: 50 }),
          ],
        }),
        // S / O ヘッダー＋内容
        new TableRow({
          children: [
            cell('💪 強み (Strengths)', { bold: true, shading: COLORS.strengthBg, color: '1E40AF' }),
            cell('🌱 機会 (Opportunities)', { bold: true, shading: COLORS.opportunityBg, color: '065F46' }),
          ],
        }),
        new TableRow({
          children: [
            cell(effectiveStrengths.length > 0 ? effectiveStrengths.map(s => `• ${s}`) : ['（未入力）']),
            cell(opportunities.length > 0 ? opportunities.map(o => `• ${o}`) : ['（未入力）']),
          ],
        }),
        // W / T ヘッダー＋内容
        new TableRow({
          children: [
            cell('⚡ 弱み (Weaknesses)', { bold: true, shading: COLORS.weaknessBg, color: '991B1B' }),
            cell('⚠️ 脅威 (Threats)', { bold: true, shading: COLORS.threatBg, color: '92400E' }),
          ],
        }),
        new TableRow({
          children: [
            cell(weaknesses.length > 0 ? weaknesses.map(w => `• ${w}`) : ['（未入力）']),
            cell(threats.length > 0 ? threats.map(t => `• ${t}`) : ['（未入力）']),
          ],
        }),
      ];
      sections.push(new Table({ rows: swotRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    }

    // 5.2 戦略オプション（クロスSWOTの4視点から導出・評価）
    const options = (swot.strategyOptions || []).filter(o => (o.text || '').trim());
    if (options.length > 0) {
      sections.push(heading('5.2 戦略オプション（クロスSWOT）', HeadingLevel.HEADING_2));
      sections.push(para('4つの組み合わせ視点（S×O・S×T・W×O・W×T）から導き出した戦略オプションと評価。'));
      const typeMeta = {
        so: { label: '積極戦略（S×O）', color: '1E40AF' },
        st: { label: '差別化戦略（S×T）', color: '7C3AED' },
        wo: { label: '改善戦略（W×O）', color: '065F46' },
        wt: { label: '防衛戦略（W×T）', color: '991B1B' },
      };
      options.forEach((opt, idx) => {
        const meta = typeMeta[opt.type];
        const evalParts = [];
        if (opt.effect) evalParts.push(`効果:${opt.effect}`);
        if (opt.feasibility) evalParts.push(`実現性:${opt.feasibility}`);
        sections.push(new Paragraph({
          children: [
            new TextRun({ text: `戦略オプション${idx + 1}`, size: 26, bold: true, color: meta?.color || '374151' }),
            ...(meta ? [new TextRun({ text: `  〔${meta.label}〕`, size: 18, color: '6B7280' })] : []),
            ...(evalParts.length > 0 ? [new TextRun({ text: `  ［${evalParts.join('・')}］`, size: 18, color: '6B7280' })] : []),
          ],
          spacing: { before: 240, after: 80 },
        }));
        sections.push(...multiLine(opt.text));
      });
    }

    if (aiComments?.swotComment) {
      sections.push(
        heading('5.3 SWOT総評（AIコメント）', HeadingLevel.HEADING_2),
        ...multiLine(aiComments.swotComment),
      );
    }
  } else {
    sections.push(para('SWOT分析はスキップされました。'));
  }
  sections.push(pageBreak());

  // ===== 6. 総合戦略 =====
  let secNo = 6;
  if (aiComments?.overallStrategy) {
    sections.push(
      heading(`${secNo}. 総合戦略サマリー`),
      ...multiLine(aiComments.overallStrategy),
    );
    secNo++;
  }

  // ===== 7. アクションプラン（実行計画） =====
  const apItems = (actionPlan?.items || []).filter(it => it.title || it.firstStep);
  if (apItems.length > 0) {
    sections.push(heading(`${secNo}. アクションプラン（実行計画）`));
    sections.push(para('分析結果を実行に落とし込むための優先施策。優先度の高い順に記載。', { color: '6B7280', spacing: { after: 200 } }));
    const apRows = [
      new TableRow({
        children: [
          cell('優先', { bold: true, shading: COLORS.headerBg, align: AlignmentType.CENTER, width: 6 }),
          cell('施策名', { bold: true, shading: COLORS.headerBg, width: 24 }),
          cell('狙い・対象ターゲット', { bold: true, shading: COLORS.headerBg, width: 22 }),
          cell('最初の一歩', { bold: true, shading: COLORS.headerBg, width: 28 }),
          cell('担当', { bold: true, shading: COLORS.headerBg, width: 10 }),
          cell('期限目安', { bold: true, shading: COLORS.headerBg, width: 10 }),
        ],
      }),
      ...apItems.map((it, idx) => new TableRow({
        children: [
          cell(`${idx + 1}`, { bold: true, align: AlignmentType.CENTER }),
          cell(it.title || '', { bold: true }),
          cell(it.target || ''),
          cell(it.firstStep || ''),
          cell(it.owner || ''),
          cell(it.due || ''),
        ],
      })),
    ];
    sections.push(new Table({ rows: apRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
  }

  const doc = new Document({
    creator: '戦略コンパス',
    title: settings.projectName || 'STP分析レポート',
    description: `${settings.companyName || ''} STP分析レポート`,
    sections: [{
      properties: {},
      children: sections,
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `${settings.projectName || 'STP分析'} — `, size: 16, color: '999999' }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '999999' }),
                new TextRun({ text: ' / ', size: 16, color: '999999' }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: '999999' }),
              ],
            }),
          ],
        }),
      },
    }],
  });

  const buffer = await Packer.toBlob(doc);
  const fileName = `${settings.projectName || 'STP分析'}_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '')}.docx`;
  saveAs(buffer, fileName);
}
