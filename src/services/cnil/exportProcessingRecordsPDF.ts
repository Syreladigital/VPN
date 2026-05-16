import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Organisation } from '@/types/rgpd';
import { ProcessingRecord, LEGAL_BASIS_OPTIONS } from '@/types/documentation';

// Couleurs standardisées
const COLORS = {
  primary: [26, 54, 93] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  green: [34, 197, 94] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

function addHeader(
  doc: jsPDF,
  title: string,
  organisation: Organisation
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const articleRef = 'Article 30 du RGPD';

  // En-tête coloré
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Conforme ${articleRef}`, margin, 32);
  
  // Infos organisation et date
  doc.setFontSize(9);
  doc.text(`${organisation.name}`, pageWidth - margin - 80, 22);
  doc.text(`Généré le ${format(new Date(), 'PPP à HH:mm', { locale: fr })}`, pageWidth - margin - 80, 32);
  
  return 50; // Position Y après l'en-tête
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

function getLegalBasisLabel(value: string): string {
  const found = LEGAL_BASIS_OPTIONS.find(opt => opt.value === value);
  return found ? found.label : value;
}

export async function exportProcessingRecordsPDF(
  organisation: Organisation,
  records: ProcessingRecord[]
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  let yPosition = addHeader(doc, 'REGISTRE DES TRAITEMENTS', organisation);

  // Résumé
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'F');
  
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Synthèse', margin + 5, yPosition + 10);
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const validatedCount = records.filter(r => r.dpo_validation).length;
  const transfersCount = records.filter(r => r.transfers_outside_eu).length;
  doc.text(`Nombre de traitements : ${records.length}`, margin + 5, yPosition + 18);
  doc.text(`Validés DPO : ${validatedCount}`, margin + 80, yPosition + 18);
  doc.text(`Transferts hors UE : ${transfersCount}`, margin + 140, yPosition + 18);
  
  yPosition += 35;

  if (records.length === 0) {
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(12);
    doc.text('Aucun traitement enregistré pour cet organisme.', margin, yPosition + 10);
    doc.text('Le registre des traitements est une obligation légale.', margin, yPosition + 22);
    addFooter(doc);
    doc.save(`Registre_Traitements_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    return;
  }

  // Tableau des traitements
  const tableData = records.map((record, index) => [
    (index + 1).toString(),
    record.name,
    record.purposes,
    getLegalBasisLabel(record.legal_basis),
    Array.isArray(record.data_categories) ? record.data_categories.join(', ') : 'Non renseigné',
    record.recipients?.join(', ') || 'Non renseigné',
    record.transfers_outside_eu ? 'Oui' : 'Non',
    record.retention_period || 'Non renseigné',
    record.dpo_validation ? '✓' : '○',
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Traitement', 'Finalités', 'Base légale', 'Catégories', 'Destinataires', 'Transf.', 'Durée', 'DPO']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 7,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [60, 60, 60],
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 25 },
      2: { cellWidth: 30 },
      3: { cellWidth: 22 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 12, halign: 'center' },
      7: { cellWidth: 18 },
      8: { cellWidth: 10, halign: 'center' },
    },
    margin: { left: margin, right: margin },
    didDrawPage: () => {
      // Réajouter l'en-tête sur chaque nouvelle page
      if ((doc as any).lastAutoTable.pageCount > 1) {
        addHeader(doc, 'REGISTRE DES TRAITEMENTS (suite)', organisation);
      }
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Détail des mesures de sécurité si espace disponible
  const recordsWithSecurity = records.filter(r => r.security_measures);
  if (recordsWithSecurity.length > 0 && yPosition < 220) {
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Mesures de sécurité par traitement', margin, yPosition);
    yPosition += 8;

    recordsWithSecurity.forEach(record => {
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.setTextColor(...COLORS.primary);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${record.name}`, margin, yPosition);
      yPosition += 5;
      
      doc.setTextColor(...COLORS.gray);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const lines = doc.splitTextToSize(record.security_measures!, pageWidth - 2 * margin - 5);
      doc.text(lines, margin + 5, yPosition);
      yPosition += lines.length * 4 + 5;
    });
  }

  addFooter(doc);
  
  doc.save(`Registre_Traitements_RGPD_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
