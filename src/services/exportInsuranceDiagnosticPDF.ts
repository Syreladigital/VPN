import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Organisation, SECTOR_LABELS, SIZE_LABELS, DPO_ROLE_LABELS } from '@/types/rgpd';
import { AuditResultsData } from '@/hooks/useAuditResults';
import { AuditAttemptAnswer } from '@/hooks/useAuditAttempts';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getQuestionnaireSections } from '@/data/conditionalQuestions';
import { ConditionalQuestion } from '@/types/conditionalQuestionnaire';

// Status labels for display
const STATUS_LABELS: Record<string, string> = {
  conforme: 'Conforme',
  partiel: 'Partiel',
  non_conforme: 'Non conforme',
};

// Module descriptions for the 8 insurance diagnostic modules
const MODULE_DESCRIPTIONS: Record<string, string> = {
  'assur-diag-organisation': 'Vérifie si l\'entreprise a clairement défini qui est responsable des données personnelles et comment elles sont gérées au quotidien.',
  'assur-diag-clients': 'Concerne les données utilisées pour la relation commerciale : collecte, information des clients et prospection.',
  'assur-diag-sensibles': 'Porte sur les données à risque (santé, infractions, données bancaires) et sur le respect des durées de conservation.',
  'assur-diag-decisions': 'Analyse l\'usage d\'outils automatisés ou de scoring et les garanties offertes aux personnes concernées.',
  'assur-diag-distribution': 'Vérifie comment les données sont partagées avec les partenaires, courtiers ou intermédiaires.',
  'assur-diag-sinistres': 'Concerne les données traitées lors des sinistres et les échanges avec les experts ou prestataires externes.',
  'assur-diag-rh': 'Porte sur la gestion des données des salariés et des candidats, de la collecte à la conservation.',
  'assur-diag-securite': 'Concerne la sécurité physique et informatique : caméras, accès aux locaux, hébergement et cybersécurité.',
};

function getConformityLevel(percent: number): { label: string; color: [number, number, number] } {
  if (percent >= 80) return { label: 'Élevé', color: [34, 197, 94] };
  if (percent >= 60) return { label: 'Satisfaisant', color: [132, 204, 22] };
  if (percent >= 40) return { label: 'Partiel', color: [249, 115, 22] };
  return { label: 'Insuffisant', color: [239, 68, 68] };
}

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

export async function exportInsuranceDiagnosticPDF(
  organisation: Organisation,
  auditResults: AuditResultsData
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = 20;

  // Colors
  const primaryColor: [number, number, number] = [30, 64, 175]; // Indigo blue
  const secondaryColor: [number, number, number] = [79, 70, 229]; // Purple accent
  const grayColor: [number, number, number] = [107, 114, 128];
  const greenColor: [number, number, number] = [34, 197, 94];
  const orangeColor: [number, number, number] = [249, 115, 22];
  const redColor: [number, number, number] = [239, 68, 68];
  const lightGray: [number, number, number] = [248, 250, 252];

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
  const conformityLevel = getConformityLevel(conformityScore);

  // Load answers for detailed report
  const answers = await loadAnswers(auditResults.attemptId);

  // Get the questionnaire sections for recommendations
  const questionnaireSections = getQuestionnaireSections(organisation.sector);

  // ========== PAGE 1: COVER PAGE ==========
  // Header banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  // Accent line
  doc.setFillColor(...secondaryColor);
  doc.rect(0, 55, pageWidth, 5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNOSTIC GLOBAL RGPD', margin, 28);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Secteur Assurance', margin, 42);
  
  doc.setFontSize(10);
  const auditDate = auditResults.completedAt 
    ? format(auditResults.completedAt, 'PPP à HH:mm', { locale: fr })
    : format(new Date(), 'PPP à HH:mm', { locale: fr });
  doc.text(`Généré le ${auditDate}`, pageWidth - margin - 60, 42);

  yPosition = 75;

  // Organisation card
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 45, 3, 3, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ORGANISME AUDITÉ', margin + 5, yPosition + 12);
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom : ${organisation.name}`, margin + 5, yPosition + 24);
  doc.text(`Secteur : ${SECTOR_LABELS[organisation.sector]}`, margin + 5, yPosition + 34);
  doc.text(`Taille : ${SIZE_LABELS[organisation.size]}`, pageWidth / 2, yPosition + 24);
  doc.text(`Rôle DPO : ${DPO_ROLE_LABELS[organisation.dpoRole]}`, pageWidth / 2, yPosition + 34);

  yPosition += 55;

  // Score summary box
  doc.setFillColor(...conformityLevel.color);
  doc.roundedRect(margin, yPosition, 70, 50, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(`${conformityScore}%`, margin + 12, yPosition + 30);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Score global', margin + 15, yPosition + 42);

  // Conformity level indicator
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin + 80, yPosition, pageWidth - 2 * margin - 80, 50, 3, 3, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Niveau de maturité RGPD : ${conformityLevel.label}`, margin + 90, yPosition + 15);
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Questions répondues : ${answeredQuestions} / ${totalQuestions}`, margin + 90, yPosition + 28);
  doc.text(`Modules analysés : ${sections.length}`, margin + 90, yPosition + 38);
  doc.text(`Points de vigilance : ${highRiskCount}`, margin + 90, yPosition + 48);

  yPosition += 60;

  // Global distribution
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉPARTITION GLOBALE DES RÉPONSES', margin, yPosition);
  yPosition += 8;

  autoTable(doc, {
    startY: yPosition,
    head: [['Statut', 'Nombre', 'Pourcentage']],
    body: [
      ['✓ Conforme', countsGlobal.conforme.toString(), `${Math.round(countsGlobal.conforme / (countsGlobal.conforme + countsGlobal.partiel + countsGlobal.non_conforme || 1) * 100)}%`],
      ['◐ Partiellement conforme', countsGlobal.partiel.toString(), `${Math.round(countsGlobal.partiel / (countsGlobal.conforme + countsGlobal.partiel + countsGlobal.non_conforme || 1) * 100)}%`],
      ['✗ Non conforme', countsGlobal.non_conforme.toString(), `${Math.round(countsGlobal.non_conforme / (countsGlobal.conforme + countsGlobal.partiel + countsGlobal.non_conforme || 1) * 100)}%`],
    ],
    theme: 'grid',
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
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  // ========== PAGE 2: RESULTS BY MODULE ==========
  doc.addPage();
  yPosition = 20;

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSULTATS PAR MODULE', margin, 20);
  
  yPosition = 40;

  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Ce diagnostic est structuré en 8 modules couvrant l\'ensemble des zones de traitement des données personnelles.', margin, yPosition);
  yPosition += 12;

  // Modules table
  const moduleTableData = sections.map((section, index) => {
    const statusColor = section.percent >= 80 ? '✓' : section.percent >= 50 ? '◐' : '✗';
    return [
      `${index + 1}. ${section.sectionTitle}`,
      `${section.percent}%`,
      statusColor,
      `${section.conformeCount}`,
      `${section.partielCount}`,
      `${section.nonConformeCount}`,
      section.highRiskCount > 0 ? `⚠ ${section.highRiskCount}` : '-',
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Module', 'Score', 'État', 'C', 'P', 'NC', 'Risques']],
    body: moduleTableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [60, 60, 60],
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 20, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Legend
  doc.setTextColor(...grayColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Légende : C = Conforme | P = Partiel | NC = Non conforme | ✓ ≥80% | ◐ 50-79% | ✗ <50%', margin, yPosition);

  yPosition += 15;

  // Module details
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION DES MODULES', margin, yPosition);
  yPosition += 8;

  sections.forEach((section, index) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    const description = MODULE_DESCRIPTIONS[section.sectionId] || section.sectionTitle;
    
    // Module header
    doc.setFillColor(...(section.percent >= 80 ? greenColor : section.percent >= 50 ? orangeColor : redColor));
    doc.rect(margin, yPosition, 4, 18, 'F');
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Module ${index + 1} : ${section.sectionTitle}`, margin + 8, yPosition + 6);
    
    doc.setTextColor(...grayColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(description, pageWidth - 2 * margin - 50);
    doc.text(descLines, margin + 8, yPosition + 14);
    
    // Score badge
    doc.setTextColor(...(section.percent >= 80 ? greenColor : section.percent >= 50 ? orangeColor : redColor));
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${section.percent}%`, pageWidth - margin - 15, yPosition + 10);

    yPosition += 25;
  });

  // ========== PAGE 3: PRIORITY RECOMMENDATIONS ==========
  doc.addPage();
  yPosition = 20;

  // Header
  doc.setFillColor(...redColor);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RECOMMANDATIONS PRIORITAIRES', margin, 20);
  
  yPosition = 45;

  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Points d\'attention identifiés nécessitant une action corrective. Classés par ordre de priorité.', margin, yPosition);
  yPosition += 15;

  // Find non-conforming and partial answers with their recommendations
  const priorityItems: { 
    priority: number; 
    module: string; 
    question: string; 
    status: string;
    actions: string[];
  }[] = [];

  // Get answers that are not fully conforming
  answers.forEach(answer => {
    if (answer.riskLevel === 'eleve' || answer.isCritical) {
      const section = sections.find(s => s.sectionId === answer.sectionId);
      
      // Find the question from questionnaire sections
      let foundQuestion: ConditionalQuestion | undefined;
      questionnaireSections.forEach(qs => {
        const q = qs.questions.find(q => q.id === answer.questionId);
        if (q) foundQuestion = q;
      });

      if (section && foundQuestion) {
        const priority = answer.riskLevel === 'eleve' && answer.isCritical ? 1 : 
                         answer.riskLevel === 'eleve' ? 2 : 3;
        
        priorityItems.push({
          priority,
          module: section.sectionTitle,
          question: foundQuestion.question,
          status: answer.selectedValue || 'Non répondu',
          actions: foundQuestion.guidance?.actions || ['Mettre en conformité ce point'],
        });
      }
    }
  });

  // Also add sections with low scores
  sections.forEach(section => {
    if (section.percent < 50) {
      const priority = section.highRiskCount > 2 ? 1 : 2;
      
      priorityItems.push({
        priority,
        module: section.sectionTitle,
        question: `Module à faible score (${section.percent}%)`,
        status: STATUS_LABELS[section.conformStatus] || 'Non conforme',
        actions: [
          'Revoir l\'ensemble des pratiques de ce module',
          'Identifier les écarts majeurs',
          'Établir un plan d\'action prioritaire',
          'Former les équipes concernées'
        ],
      });
    }
  });

  // Sort by priority
  priorityItems.sort((a, b) => a.priority - b.priority);

  if (priorityItems.length === 0) {
    doc.setTextColor(...greenColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('✓ Félicitations ! Aucun point critique identifié.', margin, yPosition);
    yPosition += 15;
    
    doc.setTextColor(...grayColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Votre niveau de conformité RGPD est satisfaisant.', margin, yPosition);
    doc.text('Continuez à maintenir vos bonnes pratiques et effectuez des revues régulières.', margin, yPosition + 10);
  } else {
    // Group by priority
    const critical = priorityItems.filter(item => item.priority === 1);
    const high = priorityItems.filter(item => item.priority === 2);
    const medium = priorityItems.filter(item => item.priority === 3);

    const renderPrioritySection = (items: typeof priorityItems, title: string, color: [number, number, number]) => {
      if (items.length === 0) return;

      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(...color);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${title} (${items.length})`, margin + 3, yPosition + 6);
      yPosition += 12;

      items.slice(0, 5).forEach((item) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }

        // Module and question
        doc.setTextColor(...primaryColor);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        const questionText = doc.splitTextToSize(`• ${item.module}`, pageWidth - 2 * margin);
        doc.text(questionText, margin, yPosition);
        yPosition += questionText.length * 4 + 2;

        doc.setTextColor(...grayColor);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const detailText = doc.splitTextToSize(item.question, pageWidth - 2 * margin - 10);
        doc.text(detailText, margin + 5, yPosition);
        yPosition += detailText.length * 3.5;

        // Actions
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(7);
        item.actions.slice(0, 2).forEach(action => {
          const actionText = doc.splitTextToSize(`→ ${action}`, pageWidth - 2 * margin - 15);
          doc.text(actionText, margin + 10, yPosition);
          yPosition += actionText.length * 3;
        });

        yPosition += 5;
      });

      if (items.length > 5) {
        doc.setTextColor(...grayColor);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`... et ${items.length - 5} autre(s) point(s) dans cette catégorie`, margin, yPosition);
        yPosition += 10;
      }

      yPosition += 5;
    };

    renderPrioritySection(critical, '⚠ PRIORITÉ CRITIQUE', redColor);
    renderPrioritySection(high, '⚡ PRIORITÉ HAUTE', orangeColor);
    renderPrioritySection(medium, '📋 PRIORITÉ MOYENNE', [59, 130, 246]);
  }

  // ========== LAST PAGE: SUMMARY & NEXT STEPS ==========
  doc.addPage();
  yPosition = 20;

  // Header
  doc.setFillColor(...secondaryColor);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SYNTHÈSE ET PROCHAINES ÉTAPES', margin, 20);

  yPosition = 45;

  // Summary box
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 60, 3, 3, 'F');

  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSUMÉ DE L\'ÉVALUATION', margin + 5, yPosition + 15);

  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const summaryText = conformityScore >= 80 
    ? 'Votre organisme présente un niveau de maturité RGPD élevé. Maintenez vos bonnes pratiques.'
    : conformityScore >= 60
    ? 'Votre niveau de conformité est satisfaisant mais nécessite des améliorations ciblées.'
    : conformityScore >= 40
    ? 'Des efforts significatifs sont nécessaires pour atteindre un niveau de conformité acceptable.'
    : 'Une mise en conformité urgente est requise. Priorisez les actions correctives identifiées.';

  doc.text(summaryText, margin + 5, yPosition + 30);
  doc.text(`Score de conformité : ${conformityScore}% - Niveau ${conformityLevel.label}`, margin + 5, yPosition + 45);

  yPosition += 75;

  // Next steps
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PROCHAINES ÉTAPES RECOMMANDÉES', margin, yPosition);
  yPosition += 12;

  const nextSteps = [
    '1. Traiter les points critiques identifiés dans les 30 jours',
    '2. Établir un plan d\'action avec des responsables et des délais',
    '3. Sensibiliser les équipes aux enjeux RGPD du secteur assurance',
    '4. Documenter les mesures de mise en conformité',
    '5. Planifier un nouvel audit dans 6 mois pour mesurer les progrès',
  ];

  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  nextSteps.forEach(step => {
    doc.text(step, margin, yPosition);
    yPosition += 10;
  });

  yPosition += 15;

  // Disclaimer
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 3, 3, 'F');
  
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('AVERTISSEMENT', margin + 5, yPosition + 12);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const disclaimerText = 'Ce diagnostic est un outil d\'auto-évaluation. Il ne constitue pas un audit de conformité officiel et ne peut se substituer à l\'avis d\'un juriste ou d\'un DPO qualifié. Les résultats sont basés sur les réponses fournies.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 2 * margin - 10);
  doc.text(disclaimerLines, margin + 5, yPosition + 22);

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(...grayColor);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    doc.setTextColor(...grayColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Diagnostic RGPD Assurance - ${organisation.name} - Généré le ${format(new Date(), 'dd/MM/yyyy')}`,
      margin,
      pageHeight - 10
    );
    doc.text(`Page ${i}/${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
  }

  // Save
  const fileName = `Diagnostic_RGPD_Assurance_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
