import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Organisation, SECTOR_LABELS, SIZE_LABELS } from '@/types/rgpd';
import { CorrectiveAction } from '@/hooks/useCorrectiveActions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Priority labels
const PRIORITY_LABELS: Record<number, string> = {
  1: 'Critique',
  2: 'Important',
  3: 'Normal',
};

// Status labels
const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  in_progress: 'En cours',
  completed: 'Complétée',
};

interface ActionPlanStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  potentialImpact: number;
}

export function exportActionPlanPDF(
  organisation: Organisation,
  actions: CorrectiveAction[],
  stats: ActionPlanStats,
  currentScore: number = 0
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 20;

  // Colors
  const primaryColor: [number, number, number] = [26, 54, 93];
  const grayColor: [number, number, number] = [107, 114, 128];
  const greenColor: [number, number, number] = [34, 197, 94];
  const orangeColor: [number, number, number] = [249, 115, 22];
  const redColor: [number, number, number] = [239, 68, 68];
  const blueColor: [number, number, number] = [59, 130, 246];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text("PLAN D'ACTION RGPD", margin, 25);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Actions correctives et amélioration continue', margin, 35);

  doc.setFontSize(10);
  doc.text(`Généré le ${format(new Date(), 'PPP à HH:mm', { locale: fr })}`, pageWidth - margin - 60, 35);

  yPosition = 55;

  // Organisation info
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 30, 3, 3, 'F');

  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ORGANISME', margin + 5, yPosition + 12);

  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom : ${organisation.name}`, margin + 5, yPosition + 22);
  doc.text(`Secteur : ${SECTOR_LABELS[organisation.sector]}`, pageWidth / 2, yPosition + 12);
  doc.text(`Taille : ${SIZE_LABELS[organisation.size]}`, pageWidth / 2, yPosition + 22);

  yPosition += 40;

  // Stats overview
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SYNTHÈSE DU PLAN D\'ACTION', margin, yPosition);
  yPosition += 10;

  const statsBoxWidth = (pageWidth - 2 * margin - 15) / 4;
  const statsData = [
    { label: 'Total', value: stats.total.toString(), color: primaryColor },
    { label: 'En attente', value: stats.pending.toString(), color: orangeColor },
    { label: 'En cours', value: stats.inProgress.toString(), color: blueColor },
    { label: 'Complétées', value: stats.completed.toString(), color: greenColor },
  ];

  statsData.forEach((stat, index) => {
    const x = margin + (statsBoxWidth + 5) * index;
    doc.setFillColor(...stat.color);
    doc.roundedRect(x, yPosition, statsBoxWidth, 25, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.value, x + statsBoxWidth / 2, yPosition + 12, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(stat.label, x + statsBoxWidth / 2, yPosition + 20, { align: 'center' });
  });

  yPosition += 35;

  // Progress indicator
  const progressPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const potentialScore = Math.min(currentScore + stats.potentialImpact, 100);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'F');

  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Progression : ${progressPercent}%`, margin + 5, yPosition + 10);
  doc.text(`Score actuel : ${currentScore}%`, margin + 70, yPosition + 10);
  doc.text(`Score potentiel : ${potentialScore}%`, margin + 130, yPosition + 10);

  // Progress bar
  const barWidth = pageWidth - 2 * margin - 10;
  const barX = margin + 5;
  const barY = yPosition + 15;
  doc.setFillColor(229, 231, 235);
  doc.roundedRect(barX, barY, barWidth, 5, 2, 2, 'F');
  doc.setFillColor(...greenColor);
  doc.roundedRect(barX, barY, barWidth * (progressPercent / 100), 5, 2, 2, 'F');

  yPosition += 35;

  // Group actions by priority
  const criticalActions = actions.filter(a => a.priority === 1 && a.status !== 'completed');
  const importantActions = actions.filter(a => a.priority === 2 && a.status !== 'completed');
  const normalActions = actions.filter(a => a.priority === 3 && a.status !== 'completed');
  const completedActions = actions.filter(a => a.status === 'completed');

  // Critical actions section
  if (criticalActions.length > 0) {
    doc.setTextColor(...redColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`🔴 ACTIONS CRITIQUES (${criticalActions.length})`, margin, yPosition);
    yPosition += 8;

    const criticalData = criticalActions.map(action => [
      action.title,
      STATUS_LABELS[action.status],
      action.due_date ? format(new Date(action.due_date), 'dd/MM/yyyy') : '-',
      `+${action.impact_score} pts`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Action', 'Statut', 'Échéance', 'Impact']],
      body: criticalData,
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
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25, halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Important actions section
  if (importantActions.length > 0) {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setTextColor(...orangeColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`🟠 ACTIONS IMPORTANTES (${importantActions.length})`, margin, yPosition);
    yPosition += 8;

    const importantData = importantActions.map(action => [
      action.title,
      STATUS_LABELS[action.status],
      action.due_date ? format(new Date(action.due_date), 'dd/MM/yyyy') : '-',
      `+${action.impact_score} pts`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Action', 'Statut', 'Échéance', 'Impact']],
      body: importantData,
      theme: 'striped',
      headStyles: {
        fillColor: orangeColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [60, 60, 60],
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25, halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Normal actions section
  if (normalActions.length > 0) {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setTextColor(...blueColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`🔵 ACTIONS NORMALES (${normalActions.length})`, margin, yPosition);
    yPosition += 8;

    const normalData = normalActions.map(action => [
      action.title,
      STATUS_LABELS[action.status],
      action.due_date ? format(new Date(action.due_date), 'dd/MM/yyyy') : '-',
      `+${action.impact_score} pts`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Action', 'Statut', 'Échéance', 'Impact']],
      body: normalData,
      theme: 'striped',
      headStyles: {
        fillColor: blueColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [60, 60, 60],
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25, halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Completed actions section
  if (completedActions.length > 0) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setTextColor(...greenColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`✅ ACTIONS COMPLÉTÉES (${completedActions.length})`, margin, yPosition);
    yPosition += 8;

    const completedData = completedActions.map(action => [
      action.title,
      PRIORITY_LABELS[action.priority] || 'Normal',
      action.completed_at ? format(new Date(action.completed_at), 'dd/MM/yyyy') : '-',
      `+${action.impact_score} pts`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Action', 'Priorité', 'Complétée le', 'Impact']],
      body: completedData,
      theme: 'striped',
      headStyles: {
        fillColor: greenColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [60, 60, 60],
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25, halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Detailed actions page
  if (actions.length > 0) {
    doc.addPage();
    yPosition = 20;

    doc.setTextColor(...primaryColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAIL DES ACTIONS', margin, yPosition);
    yPosition += 15;

    actions.forEach((action, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Action header
      const priorityColor = action.priority === 1 ? redColor : action.priority === 2 ? orangeColor : blueColor;
      doc.setFillColor(...priorityColor);
      doc.rect(margin, yPosition, 3, 20, 'F');

      doc.setTextColor(...primaryColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${action.title}`, margin + 8, yPosition + 6);

      doc.setTextColor(...grayColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Priorité: ${PRIORITY_LABELS[action.priority]} | Statut: ${STATUS_LABELS[action.status]} | Impact: +${action.impact_score} pts`, margin + 8, yPosition + 14);

      if (action.description) {
        yPosition += 20;
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(8);
        const descLines = doc.splitTextToSize(action.description, pageWidth - 2 * margin - 8);
        doc.text(descLines, margin + 8, yPosition);
        yPosition += descLines.length * 4;
      } else {
        yPosition += 18;
      }

      yPosition += 8;
    });
  }

  // No actions message
  if (actions.length === 0) {
    doc.setTextColor(...grayColor);
    doc.setFontSize(12);
    doc.text("Aucune action corrective n'a été créée.", margin, yPosition + 20);
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
      "Plan d'action généré automatiquement - Suivi et validation par le DPO recommandés.",
      margin,
      pageHeight - 10
    );
    doc.text(`Page ${i}/${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
  }

  // Save
  const fileName = `Plan_Action_RGPD_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
