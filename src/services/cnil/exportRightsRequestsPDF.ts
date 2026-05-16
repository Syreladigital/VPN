import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Organisation, LegalFramework } from '@/types/rgpd';
import { RightsRequest, RIGHT_TYPE_LABELS, REQUEST_STATUS_LABELS } from '@/types/documentation';
import { getLegalFrameworkShortName } from '@/lib/legalReferences';

const COLORS = {
  primary: [26, 54, 93] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  green: [34, 197, 94] as [number, number, number],
  orange: [249, 115, 22] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

function addHeader(
  doc: jsPDF, 
  title: string, 
  organisation: Organisation, 
  legalFramework: LegalFramework
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const articleRef = legalFramework === 'loi_tunisie_2025' 
    ? 'Articles 26-35 du Projet de loi 2025/95' 
    : 'Articles 15 à 22 du RGPD';

  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Conforme ${articleRef}`, margin, 32);
  
  doc.setFontSize(9);
  doc.text(`${organisation.name}`, pageWidth - margin - 80, 22);
  doc.text(`Généré le ${format(new Date(), 'PPP à HH:mm', { locale: fr })}`, pageWidth - margin - 80, 32);
  
  return 50;
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLORS.gray);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Document interne – usage conformité RGPD', margin, pageHeight - 10);
    doc.text(`Page ${i}/${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
  }
}

export async function exportRightsRequestsPDF(
  organisation: Organisation,
  requests: RightsRequest[]
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const legalFramework: LegalFramework = organisation.legalFramework || 'rgpd_eu';
  
  let yPosition = addHeader(
    doc, 
    'REGISTRE DES DEMANDES DE DROITS', 
    organisation, 
    legalFramework
  );

  // Statistiques par type de droit
  const statsByType: Record<string, number> = {};
  requests.forEach(r => {
    statsByType[r.right_type] = (statsByType[r.right_type] || 0) + 1;
  });
  
  const pendingCount = requests.filter(r => r.status === 'pending' || r.status === 'in_progress').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  
  // Calcul du taux de traitement dans les délais (1 mois = 30 jours)
  const processedRequests = requests.filter(r => r.status === 'completed' && r.response_date);
  const onTimeCount = processedRequests.filter(r => {
    const requestDate = new Date(r.request_date);
    const responseDate = new Date(r.response_date!);
    return differenceInDays(responseDate, requestDate) <= 30;
  }).length;
  const onTimeRate = processedRequests.length > 0 
    ? Math.round((onTimeCount / processedRequests.length) * 100) 
    : 100;

  // Synthèse
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 3, 3, 'F');
  
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Synthèse', margin + 5, yPosition + 10);
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total demandes : ${requests.length}`, margin + 5, yPosition + 18);
  doc.text(`En attente : ${pendingCount}`, margin + 60, yPosition + 18);
  doc.text(`Traitées : ${completedCount}`, margin + 105, yPosition + 18);
  doc.text(`Rejetées : ${rejectedCount}`, margin + 145, yPosition + 18);
  
  doc.text(`Taux dans les délais : ${onTimeRate}%`, margin + 5, yPosition + 28);
  
  // Types de droits exercés
  const typesSummary = Object.entries(statsByType)
    .map(([type, count]) => `${RIGHT_TYPE_LABELS[type as RightsRequest['right_type']] || type}: ${count}`)
    .join(' | ');
  if (typesSummary) {
    doc.text(typesSummary, margin + 80, yPosition + 28);
  }
  
  yPosition += 45;

  if (requests.length === 0) {
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(12);
    doc.text('Aucune demande d\'exercice de droits enregistrée.', margin, yPosition + 10);
    addFooter(doc);
    doc.save(`Registre_Droits_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    return;
  }

  // Tableau des demandes
  const tableData = requests.map((request, index) => {
    const requestDate = new Date(request.request_date);
    const deadlineDate = request.deadline ? new Date(request.deadline) : null;
    const isOverdue = deadlineDate && new Date() > deadlineDate && request.status !== 'completed';
    
    return [
      (index + 1).toString(),
      format(requestDate, 'dd/MM/yyyy'),
      request.requester_name,
      RIGHT_TYPE_LABELS[request.right_type as RightsRequest['right_type']] || request.right_type,
      request.identity_verified ? '✓' : '○',
      REQUEST_STATUS_LABELS[request.status as RightsRequest['status']] || request.status,
      deadlineDate ? format(deadlineDate, 'dd/MM/yyyy') : '-',
      request.response_date ? format(new Date(request.response_date), 'dd/MM/yyyy') : (isOverdue ? '⚠️' : '-'),
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Date', 'Demandeur', 'Type de droit', 'ID vérifié', 'Statut', 'Échéance', 'Réponse']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [60, 60, 60],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30 },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 22 },
      6: { cellWidth: 22 },
      7: { cellWidth: 20 },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Détail des demandes avec réponses
  const requestsWithResponse = requests.filter(r => r.response_content);
  if (requestsWithResponse.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAIL DES RÉPONSES', margin, yPosition);
    yPosition += 10;

    requestsWithResponse.forEach((request, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }

      doc.setTextColor(...COLORS.primary);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${request.requester_name} - ${RIGHT_TYPE_LABELS[request.right_type as RightsRequest['right_type']]}`, margin, yPosition);
      yPosition += 5;
      
      doc.setTextColor(...COLORS.gray);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const lines = doc.splitTextToSize(request.response_content!, pageWidth - 2 * margin - 5);
      doc.text(lines, margin + 5, yPosition);
      yPosition += lines.length * 4 + 8;
    });
  }

  addFooter(doc);
  
  const frameworkSuffix = legalFramework === 'loi_tunisie_2025' ? 'Tunisie' : 'RGPD';
  doc.save(`Registre_Droits_${frameworkSuffix}_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
