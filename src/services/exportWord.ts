import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, ShadingType, Header, Footer, PageNumber } from 'docx';
import { saveAs } from 'file-saver';
import { Organisation, SECTOR_LABELS, SIZE_LABELS, DPO_ROLE_LABELS } from '@/types/rgpd';
import { AuditResultsData } from '@/hooks/useAuditResults';
import { AuditAttemptAnswer } from '@/hooks/useAuditAttempts';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Status labels for display
const STATUS_LABELS: Record<string, string> = {
  conforme: 'Conforme',
  partiel: 'Partiel',
  non_conforme: 'Non conforme',
};

// Answer value labels
const ANSWER_LABELS: Record<string, string> = {
  'true': 'Oui',
  'false': 'Non',
  'yes': 'Oui',
  'no': 'Non',
  'partial': 'Partiel',
  'na': 'N/A',
};

// Risk labels
const RISK_LABELS: Record<string, string> = {
  faible: 'Faible',
  moyen: 'Moyen',
  eleve: 'Élevé',
};

const primaryColor = '1A365D';

// Load answers for an attempt
async function loadAnswers(attemptId: string): Promise<AuditAttemptAnswer[]> {
  const { data, error } = await supabase
    .from('audit_attempt_answers')
    .select('*')
    .eq('attempt_id', attemptId);

  if (error) {
    console.error('Error loading answers for export:', error);
    return [];
  }

  return (data || []).map(d => ({
    id: d.id,
    attemptId: d.attempt_id,
    questionId: d.question_id,
    sectionId: d.section_id,
    selectedValue: d.selected_value,
    score: Number(d.score),
    maxScore: Number(d.max_score),
    riskLevel: d.risk_level as 'faible' | 'moyen' | 'eleve' | null,
    isCritical: d.is_critical || false,
    notes: d.notes,
  }));
}

function createTableCell(text: string, options: { bold?: boolean; shading?: string; width?: number } = {}): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: options.bold,
            size: 20,
            color: options.shading === primaryColor ? 'FFFFFF' : undefined,
          }),
        ],
      }),
    ],
    width: options.width ? { size: options.width, type: WidthType.PERCENTAGE } : undefined,
    shading: options.shading ? { fill: options.shading, type: ShadingType.CLEAR } : undefined,
    margins: { top: 50, bottom: 50, left: 100, right: 100 },
  });
}

export async function exportToWord(
  organisation: Organisation,
  auditResults: AuditResultsData
): Promise<void> {
  const conformityScore = auditResults.complianceScore;
  const sections = auditResults.sections;
  const answeredQuestions = auditResults.answeredQuestions;
  const totalQuestions = auditResults.totalQuestions;
  const highRiskCount = auditResults.risksHigh;
  const countsGlobal = {
    conforme: auditResults.conformeCount,
    partiel: auditResults.partielCount,
    non_conforme: auditResults.nonConformeCount,
  };

  // Load answers for detailed report
  const answers = await loadAnswers(auditResults.attemptId);

  const auditDate = auditResults.completedAt 
    ? format(auditResults.completedAt, 'PPP à HH:mm', { locale: fr })
    : format(new Date(), 'PPP à HH:mm', { locale: fr });

  const documentSections: Paragraph[] = [];

  // Title
  documentSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'RAPPORT D\'AUDIT RGPD',
          bold: true,
          size: 48,
          color: primaryColor,
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  documentSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Conforme aux recommandations CNIL',
          size: 24,
          color: '6B7280',
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Date
  documentSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Généré le ${auditDate}`,
          size: 20,
          color: '6B7280',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    })
  );

  // Organisation info
  documentSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '1. ORGANISME AUDITÉ',
          bold: true,
          size: 28,
          color: primaryColor,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  const orgInfoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createTableCell('Nom de l\'organisme', { bold: true, shading: 'F1F5F9', width: 30 }),
          createTableCell(organisation.name, { width: 70 }),
        ],
      }),
      new TableRow({
        children: [
          createTableCell('Secteur d\'activité', { bold: true, shading: 'F1F5F9', width: 30 }),
          createTableCell(SECTOR_LABELS[organisation.sector], { width: 70 }),
        ],
      }),
      new TableRow({
        children: [
          createTableCell('Taille de la structure', { bold: true, shading: 'F1F5F9', width: 30 }),
          createTableCell(SIZE_LABELS[organisation.size], { width: 70 }),
        ],
      }),
      new TableRow({
        children: [
          createTableCell('Rôle du DPO', { bold: true, shading: 'F1F5F9', width: 30 }),
          createTableCell(DPO_ROLE_LABELS[organisation.dpoRole], { width: 70 }),
        ],
      }),
    ],
  });

  // Synthesis
  documentSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '2. SYNTHÈSE DE CONFORMITÉ',
          bold: true,
          size: 28,
          color: primaryColor,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    })
  );

  documentSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Score de conformité global : `,
          size: 24,
        }),
        new TextRun({
          text: `${conformityScore}%`,
          bold: true,
          size: 32,
          color: conformityScore >= 70 ? '22C55E' : conformityScore >= 40 ? 'F97316' : 'EF4444',
        }),
      ],
      spacing: { after: 200 },
    })
  );

  const statsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createTableCell('Indicateur', { bold: true, shading: primaryColor }),
          createTableCell('Valeur', { bold: true, shading: primaryColor }),
        ],
      }),
      new TableRow({
        children: [
          createTableCell('Questions répondues', { shading: 'F1F5F9' }),
          createTableCell(`${answeredQuestions} / ${totalQuestions}`),
        ],
      }),
      new TableRow({
        children: [
          createTableCell('Risques élevés identifiés', { shading: 'F1F5F9' }),
          createTableCell(highRiskCount.toString()),
        ],
      }),
      new TableRow({
        children: [
          createTableCell('Sections analysées', { shading: 'F1F5F9' }),
          createTableCell(sections.length.toString()),
        ],
      }),
    ],
  });

  // Global conformity
  documentSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '3. RÉPARTITION GLOBALE',
          bold: true,
          size: 28,
          color: primaryColor,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    })
  );

  const conformityTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createTableCell('Statut', { bold: true, shading: primaryColor }),
          createTableCell('Nombre', { bold: true, shading: primaryColor }),
        ],
      }),
      new TableRow({
        children: [
          createTableCell('Conforme', { shading: 'DCFCE7' }),
          createTableCell(countsGlobal.conforme.toString()),
        ],
      }),
      new TableRow({
        children: [
          createTableCell('Partiellement conforme', { shading: 'FEF3C7' }),
          createTableCell(countsGlobal.partiel.toString()),
        ],
      }),
      new TableRow({
        children: [
          createTableCell('Non conforme', { shading: 'FEE2E2' }),
          createTableCell(countsGlobal.non_conforme.toString()),
        ],
      }),
    ],
  });

  // Sections results
  documentSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '4. RÉSULTATS PAR SECTION',
          bold: true,
          size: 28,
          color: primaryColor,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    })
  );

  const sectionRows = [
    new TableRow({
      children: [
        createTableCell('Section', { bold: true, shading: primaryColor }),
        createTableCell('Score', { bold: true, shading: primaryColor }),
        createTableCell('Statut', { bold: true, shading: primaryColor }),
        createTableCell('C / P / NC', { bold: true, shading: primaryColor }),
      ],
    }),
    ...sections.map((section, index) => {
      return new TableRow({
        children: [
          createTableCell(section.sectionTitle, { shading: index % 2 === 0 ? 'F1F5F9' : undefined }),
          createTableCell(`${section.percent}%`, { shading: index % 2 === 0 ? 'F1F5F9' : undefined }),
          createTableCell(STATUS_LABELS[section.conformStatus] || section.conformStatus, { shading: index % 2 === 0 ? 'F1F5F9' : undefined }),
          createTableCell(`${section.conformeCount} / ${section.partielCount} / ${section.nonConformeCount}`, { shading: index % 2 === 0 ? 'F1F5F9' : undefined }),
        ],
      });
    }),
  ];

  const sectionsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: sectionRows,
  });

  // Detailed analysis
  documentSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '5. ANALYSE DÉTAILLÉE',
          bold: true,
          size: 28,
          color: primaryColor,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    })
  );

  const detailParagraphs: Paragraph[] = [];

  sections.forEach(section => {
    const scoreColor = section.percent >= 70 ? '22C55E' : section.percent >= 40 ? 'F97316' : 'EF4444';
    
    detailParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: section.sectionTitle,
            bold: true,
            size: 24,
            color: '3B82F6',
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 100 },
      })
    );

    detailParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Score: ', size: 20 }),
          new TextRun({ text: `${section.percent}%`, bold: true, size: 20, color: scoreColor }),
          new TextRun({ text: ` | Points: ${section.earned}/${section.possible}`, size: 20, color: '6B7280' }),
          new TextRun({ text: ` | Risques élevés: ${section.highRiskCount}`, size: 20, color: section.highRiskCount > 0 ? 'EF4444' : '6B7280' }),
        ],
        spacing: { after: 200 },
      })
    );
  });

  // Detailed answers by section
  documentSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '6. RÉPONSES DÉTAILLÉES PAR SECTION',
          bold: true,
          size: 28,
          color: primaryColor,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    })
  );

  const answersParagraphs: (Paragraph | Table)[] = [];

  // Group answers by section
  const answersBySection = new Map<string, AuditAttemptAnswer[]>();
  answers.forEach(answer => {
    const existing = answersBySection.get(answer.sectionId) || [];
    existing.push(answer);
    answersBySection.set(answer.sectionId, existing);
  });

  // Create answer tables for each section
  sections.forEach(section => {
    const sectionAnswers = answersBySection.get(section.sectionId) || [];
    if (sectionAnswers.length === 0) return;

    answersParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${section.sectionTitle} (${section.percent}%)`,
            bold: true,
            size: 22,
            color: '3B82F6',
          }),
        ],
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 300, after: 100 },
      })
    );

    const answerRows = [
      new TableRow({
        children: [
          createTableCell('Question', { bold: true, shading: 'E0E7FF' }),
          createTableCell('Réponse', { bold: true, shading: 'E0E7FF' }),
          createTableCell('Score', { bold: true, shading: 'E0E7FF' }),
          createTableCell('Risque', { bold: true, shading: 'E0E7FF' }),
        ],
      }),
      ...sectionAnswers.map((answer, index) => {
        const displayValue = answer.selectedValue 
          ? (ANSWER_LABELS[answer.selectedValue.toLowerCase()] || answer.selectedValue)
          : 'Non répondu';
        const riskDisplay = answer.riskLevel ? RISK_LABELS[answer.riskLevel] || answer.riskLevel : '-';
        const criticalMark = answer.isCritical ? '⚠️ ' : '';
        
        return new TableRow({
          children: [
            createTableCell(criticalMark + formatQuestionId(answer.questionId), { shading: index % 2 === 0 ? 'F8FAFC' : undefined }),
            createTableCell(displayValue, { shading: index % 2 === 0 ? 'F8FAFC' : undefined }),
            createTableCell(`${answer.score}/${answer.maxScore}`, { shading: index % 2 === 0 ? 'F8FAFC' : undefined }),
            createTableCell(riskDisplay, { shading: index % 2 === 0 ? 'F8FAFC' : undefined }),
          ],
        });
      }),
    ];

    answersParagraphs.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: answerRows,
      })
    );
  });

  // Priority sections
  documentSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '7. SECTIONS PRIORITAIRES',
          bold: true,
          size: 28,
          color: primaryColor,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    })
  );

  const prioritySections = sections
    .filter(s => s.percent < 50 || s.highRiskCount > 0)
    .sort((a, b) => a.percent - b.percent);

  const priorityParagraphs: (Paragraph | Table)[] = [];

  if (prioritySections.length > 0) {
    const priorityRows = [
      new TableRow({
        children: [
          createTableCell('Section', { bold: true, shading: 'FEE2E2' }),
          createTableCell('Score', { bold: true, shading: 'FEE2E2' }),
          createTableCell('Risques', { bold: true, shading: 'FEE2E2' }),
          createTableCell('Priorité', { bold: true, shading: 'FEE2E2' }),
        ],
      }),
      ...prioritySections.map((section) => {
        const priority = section.percent < 30 ? 'Critique' : section.percent < 50 ? 'Haute' : 'Moyenne';
        return new TableRow({
          children: [
            createTableCell(section.sectionTitle),
            createTableCell(`${section.percent}%`),
            createTableCell(section.highRiskCount.toString()),
            createTableCell(priority),
          ],
        });
      }),
    ];

    priorityParagraphs.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: priorityRows,
      })
    );
  } else {
    priorityParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Aucune section prioritaire identifiée. Félicitations !',
            size: 22,
            color: '22C55E',
            italics: true,
          }),
        ],
        spacing: { before: 200 },
      })
    );
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Rapport d'audit RGPD - ${organisation.name}`,
                    size: 18,
                    color: '6B7280',
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Ce document est généré automatiquement. La conformité finale repose sur la validation humaine du DPO. | Page ',
                    size: 16,
                    color: '6B7280',
                    italics: true,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: '6B7280',
                  }),
                  new TextRun({
                    text: ' / ',
                    size: 16,
                    color: '6B7280',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: '6B7280',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: [
          ...documentSections,
          orgInfoTable,
          statsTable,
          conformityTable,
          sectionsTable,
          ...detailParagraphs,
          ...answersParagraphs,
          ...priorityParagraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Audit_RGPD_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.docx`);
}

// Helper function to format question ID into readable text
function formatQuestionId(questionId: string): string {
  return questionId
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .substring(0, 40) + (questionId.length > 40 ? '...' : '');
}
