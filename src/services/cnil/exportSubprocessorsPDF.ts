import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Organisation } from '@/types/rgpd';
import { Subprocessor, SUBPROCESSOR_STATUS_LABELS } from '@/types/documentation';

const COLORS = {
  primary: [26, 54, 93] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  green: [34, 197, 94] as [number, number, number],
  orange: [249, 115, 22] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

function addHeader(
  doc: jsPDF,
  title: string,
  organisation: Organisation
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const articleRef = 'Article 28 du RGPD';

  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Conforme ${articleRef} - Contrats sous-traitance (DPA)`, margin, 32);
  
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

export async function exportSubprocessorsPDF(
  organisation: Organisation,
  subprocessors: Subprocessor[]
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = addHeader(doc, 'LISTE DES SOUS-TRAITANTS ET DPA', organisation);

  // Statistiques
  const activeCount = subprocessors.filter(s => s.status === 'active').length;
  const withContractCount = subprocessors.filter(s => s.contract_signed).length;
  const hdsCount = subprocessors.filter(s => s.hds_certified).length;
  const nonEuCount = subprocessors.filter(s => !s.eu_based).length;
  
  // Synthèse
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'F');
  
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Synthèse', margin + 5, yPosition + 10);
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total sous-traitants : ${subprocessors.length}`, margin + 5, yPosition + 18);
  doc.text(`Actifs : ${activeCount}`, margin + 65, yPosition + 18);
  doc.text(`DPA signés : ${withContractCount}`, margin + 100, yPosition + 18);
  doc.text(`Certifiés HDS : ${hdsCount}`, margin + 140, yPosition + 18);
  
  yPosition += 35;

  if (subprocessors.length === 0) {
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(12);
    doc.text('Aucun sous-traitant enregistré pour cet organisme.', margin, yPosition + 10);
    addFooter(doc);
    doc.save(`Sous_Traitants_DPA_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    return;
  }

  // Alertes si sous-traitants sans contrat
  const withoutContract = subprocessors.filter(s => !s.contract_signed && s.status === 'active');
  if (withoutContract.length > 0) {
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 15, 3, 3, 'F');
    doc.setTextColor(...COLORS.orange);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`⚠️ ${withoutContract.length} sous-traitant(s) actif(s) sans DPA signé : ${withoutContract.map(s => s.name).join(', ')}`, margin + 5, yPosition + 10);
    yPosition += 20;
  }

  // Tableau des sous-traitants
  const tableData = subprocessors.map((sub, index) => [
    (index + 1).toString(),
    sub.name,
    sub.activity,
    Array.isArray(sub.data_processed) ? sub.data_processed.join(', ') : 'Non renseigné',
    sub.contract_signed ? '✓ Signé' : '○ Non signé',
    sub.contract_date ? format(new Date(sub.contract_date), 'dd/MM/yyyy') : '-',
    sub.location || 'Non renseigné',
    sub.eu_based ? 'UE' : 'Hors UE',
    sub.hds_certified ? '✓' : '-',
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Nom', 'Activité', 'Données traitées', 'DPA', 'Date DPA', 'Localisation', 'Zone', 'HDS']],
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
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 35 },
      4: { cellWidth: 18 },
      5: { cellWidth: 18 },
      6: { cellWidth: 22 },
      7: { cellWidth: 12, halign: 'center' },
      8: { cellWidth: 10, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Section transferts hors UE si applicable
  const nonEuSubprocessors = subprocessors.filter(s => !s.eu_based);
  if (nonEuSubprocessors.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSFERTS HORS UNION EUROPÉENNE', margin, yPosition);
    yPosition += 10;

    const transferTableData = nonEuSubprocessors.map(sub => [
      sub.name,
      sub.location || 'Non renseigné',
      sub.transfer_mechanism || 'Non renseigné',
      sub.contract_signed ? 'Oui' : 'Non',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Sous-traitant', 'Pays', 'Mécanisme de transfert', 'DPA en place']],
      body: transferTableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.orange,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Section révisions à venir
  const upcomingReviews = subprocessors.filter(s => {
    if (!s.review_date) return false;
    const reviewDate = new Date(s.review_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return reviewDate <= thirtyDaysFromNow && reviewDate >= new Date();
  });

  if (upcomingReviews.length > 0 && yPosition < 230) {
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉVISIONS À VENIR (30 jours)', margin, yPosition);
    yPosition += 10;

    const reviewTableData = upcomingReviews.map(sub => [
      sub.name,
      sub.activity,
      format(new Date(sub.review_date!), 'dd/MM/yyyy', { locale: fr }),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Sous-traitant', 'Activité', 'Date de révision']],
      body: reviewTableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
    });
  }

  addFooter(doc);
  
  doc.save(`Sous_Traitants_DPA_RGPD_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
