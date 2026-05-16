import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Organisation, SECTOR_LABELS, SIZE_LABELS, DPO_ROLE_LABELS, LegalFramework } from '@/types/rgpd';
import { AuditResultsData } from '@/hooks/useAuditResults';
import { AuditAttemptAnswer } from '@/hooks/useAuditAttempts';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  adaptLegalReference, 
  getDataProtectionAuthority, 
  getLegalFrameworkShortName,
} from '@/lib/legalReferences';

// Status labels for display
const STATUS_LABELS: Record<string, string> = {
  conforme: 'Conforme',
  partiel: 'Partiel',
  non_conforme: 'Non conforme',
};

// Risk labels for display
const RISK_LABELS: Record<string, string> = {
  faible: 'Faible',
  moyen: 'Moyen',
  eleve: 'Élevé',
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

export async function exportToPDF(
  organisation: Organisation,
  auditResults: AuditResultsData
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 20;
  
  // Déterminer le cadre juridique
  const legalFramework: LegalFramework = organisation.legalFramework || 'rgpd_eu';
  const frameworkName = getLegalFrameworkShortName(legalFramework);
  const authorityName = getDataProtectionAuthority(legalFramework);

  // Colors
  const primaryColor: [number, number, number] = [26, 54, 93]; // Marine blue
  const grayColor: [number, number, number] = [107, 114, 128];
  const greenColor: [number, number, number] = [34, 197, 94];
  const orangeColor: [number, number, number] = [249, 115, 22];
  const redColor: [number, number, number] = [239, 68, 68];

  // Get data from persisted results
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

  // Header with logo area
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`RAPPORT D'AUDIT ${frameworkName}`, margin, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(adaptLegalReference(`Conforme aux recommandations ${authorityName}`, legalFramework), margin, 35);
  
  doc.setFontSize(10);
  const auditDate = auditResults.completedAt 
    ? format(auditResults.completedAt, 'PPP à HH:mm', { locale: fr })
    : format(new Date(), 'PPP à HH:mm', { locale: fr });
  doc.text(`Généré le ${auditDate}`, pageWidth - margin - 60, 35);

  yPosition = 55;

  // Organisation info box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 40, 3, 3, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ORGANISME AUDITÉ', margin + 5, yPosition + 12);
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom : ${organisation.name}`, margin + 5, yPosition + 22);
  doc.text(`Secteur : ${SECTOR_LABELS[organisation.sector]}`, margin + 5, yPosition + 30);
  doc.text(`Taille : ${SIZE_LABELS[organisation.size]}`, pageWidth / 2, yPosition + 22);
  doc.text(`DPO : ${DPO_ROLE_LABELS[organisation.dpoRole]}`, pageWidth / 2, yPosition + 30);

  yPosition += 50;

  // Conformity score
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SYNTHÈSE DE CONFORMITÉ', margin, yPosition);
  yPosition += 10;

  // Score box
  const scoreBoxWidth = 60;
  doc.setFillColor(...(conformityScore >= 70 ? greenColor : conformityScore >= 40 ? orangeColor : redColor));
  doc.roundedRect(margin, yPosition, scoreBoxWidth, 25, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`${conformityScore}%`, margin + scoreBoxWidth / 2 - 12, yPosition + 17);

  // Stats boxes
  const statsStartX = margin + scoreBoxWidth + 10;
  const statBoxWidth = (pageWidth - statsStartX - margin - 15) / 3;
  
  const statsData = [
    { label: 'Questions répondues', value: `${answeredQuestions}/${totalQuestions}` },
    { label: 'Risques élevés', value: highRiskCount.toString() },
    { label: 'Sections analysées', value: sections.length.toString() },
  ];

  statsData.forEach((stat, index) => {
    const x = statsStartX + (statBoxWidth + 5) * index;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, yPosition, statBoxWidth, 25, 3, 3, 'F');
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.value, x + 5, yPosition + 12);
    
    doc.setTextColor(...grayColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(stat.label, x + 5, yPosition + 20);
  });

  yPosition += 35;

  // Global conformity counts
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉPARTITION GLOBALE', margin, yPosition);
  yPosition += 8;

  autoTable(doc, {
    startY: yPosition,
    head: [['Statut', 'Nombre de réponses']],
    body: [
      ['Conforme', countsGlobal.conforme.toString()],
      ['Partiellement conforme', countsGlobal.partiel.toString()],
      ['Non conforme', countsGlobal.non_conforme.toString()],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [60, 60, 60],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 50, halign: 'center' },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Sections table
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSULTATS PAR SECTION', margin, yPosition);
  yPosition += 8;

  const sectionTableData = sections.map(section => [
    section.sectionTitle,
    STATUS_LABELS[section.conformStatus] || section.conformStatus,
    `${section.percent}%`,
    `${section.conformeCount} / ${section.partielCount} / ${section.nonConformeCount}`,
    section.highRiskCount.toString(),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Section', 'Statut', 'Score', 'C / P / NC', 'Risques']],
    body: sectionTableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [60, 60, 60],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 35 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 35, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
    },
  });

  // New page for detailed section analysis
  doc.addPage();
  yPosition = 20;

  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ANALYSE DÉTAILLÉE PAR SECTION', margin, yPosition);
  yPosition += 15;

  // Detailed sections
  sections.forEach((section) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Section header
    doc.setFillColor(...primaryColor);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(section.sectionTitle, margin + 3, yPosition + 6);
    yPosition += 12;

    // Section stats
    doc.setTextColor(...grayColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const scoreColor = section.percent >= 70 ? greenColor : section.percent >= 40 ? orangeColor : redColor;
    doc.setTextColor(...scoreColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`Score: ${section.percent}%`, margin, yPosition + 5);
    
    doc.setTextColor(...grayColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`| Points: ${section.earned}/${section.possible}`, margin + 35, yPosition + 5);
    doc.text(`| Conformes: ${section.conformeCount}`, margin + 80, yPosition + 5);
    doc.text(`| Partiels: ${section.partielCount}`, margin + 115, yPosition + 5);
    doc.text(`| Non conformes: ${section.nonConformeCount}`, margin + 145, yPosition + 5);

    yPosition += 15;
  });

  // New page for detailed answers by section
  doc.addPage();
  yPosition = 20;

  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉPONSES DÉTAILLÉES PAR SECTION', margin, yPosition);
  yPosition += 15;

  // Group answers by section
  const answersBySection = new Map<string, AuditAttemptAnswer[]>();
  answers.forEach(answer => {
    const existing = answersBySection.get(answer.sectionId) || [];
    existing.push(answer);
    answersBySection.set(answer.sectionId, existing);
  });

  // Display answers for each section
  sections.forEach((section) => {
    const sectionAnswers = answersBySection.get(section.sectionId) || [];
    if (sectionAnswers.length === 0) return;

    // Check if we need a new page
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    // Section header
    doc.setFillColor(...primaryColor);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${section.sectionTitle} (${section.percent}%)`, margin + 3, yPosition + 6);
    yPosition += 12;

    // Prepare answers table data
    const answersData = sectionAnswers.map(answer => {
      const displayValue = answer.selectedValue 
        ? (ANSWER_LABELS[answer.selectedValue.toLowerCase()] || answer.selectedValue)
        : 'Non répondu';
      const riskDisplay = answer.riskLevel ? RISK_LABELS[answer.riskLevel] || answer.riskLevel : '-';
      const scoreDisplay = `${answer.score}/${answer.maxScore}`;
      const criticalMark = answer.isCritical ? '⚠️ ' : '';
      
      return [
        criticalMark + formatQuestionId(answer.questionId),
        displayValue,
        scoreDisplay,
        riskDisplay,
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Question', 'Réponse', 'Score', 'Risque']],
      body: answersData,
      theme: 'grid',
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: primaryColor,
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  });

  // Priority recommendations page
  doc.addPage();
  yPosition = 20;

  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTIONS PRIORITAIRES', margin, yPosition);
  yPosition += 15;

  // Get sections with low conformity or high risk
  const prioritySections = sections
    .filter(s => s.percent < 50 || s.highRiskCount > 0)
    .sort((a, b) => a.percent - b.percent);

  if (prioritySections.length > 0) {
    const priorityData = prioritySections.map(section => [
      section.sectionTitle,
      `${section.percent}%`,
      STATUS_LABELS[section.conformStatus] || section.conformStatus,
      section.highRiskCount.toString(),
      section.percent < 30 ? 'Critique' : section.percent < 50 ? 'Haute' : 'Moyenne',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Section', 'Score', 'Statut', 'Risques élevés', 'Priorité']],
      body: priorityData,
      theme: 'striped',
      headStyles: {
        fillColor: redColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
    });
  } else {
    doc.setTextColor(...grayColor);
    doc.setFontSize(10);
    doc.text('Aucune section prioritaire identifiée. Félicitations !', margin, yPosition + 10);
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.setDrawColor(...grayColor);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    doc.setTextColor(...grayColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Ce document est généré automatiquement. La conformité finale repose sur la validation humaine du DPO.',
      margin,
      pageHeight - 10
    );
    doc.text(`Page ${i}/${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
  }

  // Save with adapted filename
  const frameworkSuffix = legalFramework === 'loi_tunisie_2025' ? 'Tunisie_2025' : 'RGPD';
  const fileName = `Audit_${frameworkSuffix}_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}

// Helper function to format question ID into readable text
function formatQuestionId(questionId: string): string {
  return questionId
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .substring(0, 50) + (questionId.length > 50 ? '...' : '');
}
