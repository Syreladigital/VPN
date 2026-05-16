import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Organisation, SECTOR_LABELS } from '@/types/rgpd';
import { ProcessingRecord } from '@/types/documentation';

const COLORS = {
  primary: [26, 54, 93] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

function addHeader(
  doc: jsPDF,
  title: string,
  organisation: Organisation
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const frameworkName = 'RGPD';

  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Conforme ${frameworkName}`, margin, 32);
  
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

export async function exportPrivacyPolicyPDF(
  organisation: Organisation,
  processingRecords: ProcessingRecord[]
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const authority = 'CNIL';
  const frameworkFull = 'Règlement Général sur la Protection des Données (UE 2016/679)';

  let yPosition = addHeader(doc, 'POLITIQUE DE CONFIDENTIALITÉ', organisation);

  // Introduction
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. INTRODUCTION', margin, yPosition);
  yPosition += 8;
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const intro = `${organisation.name}, opérant dans le secteur ${SECTOR_LABELS[organisation.sector]}, s'engage à protéger la vie privée et les données personnelles de ses utilisateurs, clients et partenaires. Cette politique de confidentialité décrit comment nous collectons, utilisons, stockons et protégeons vos données personnelles conformément au ${frameworkFull}.`;
  
  const introLines = doc.splitTextToSize(intro, pageWidth - 2 * margin);
  doc.text(introLines, margin, yPosition);
  yPosition += introLines.length * 5 + 10;

  // Responsable du traitement
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. RESPONSABLE DU TRAITEMENT', margin, yPosition);
  yPosition += 8;
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Organisme : ${organisation.name}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Délégué à la Protection des Données (DPO) : Désigné`, margin, yPosition);
  yPosition += 5;
  doc.text(`Contact : [À compléter]`, margin, yPosition);
  yPosition += 15;

  // Données collectées
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. DONNÉES COLLECTÉES ET FINALITÉS', margin, yPosition);
  yPosition += 8;

  if (processingRecords.length === 0) {
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Aucun traitement documenté. Section à compléter.', margin, yPosition);
    yPosition += 15;
  } else {
    const treatmentData = processingRecords.slice(0, 10).map(record => [
      record.name,
      record.purposes,
      Array.isArray(record.data_categories) ? record.data_categories.join(', ') : 'Non précisé',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Traitement', 'Finalité', 'Données collectées']],
      body: treatmentData,
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
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 55 },
        2: { cellWidth: 70 },
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Bases légales
  doc.addPage();
  yPosition = 30;
  
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('4. BASES LÉGALES DU TRAITEMENT', margin, yPosition);
  yPosition += 10;
  
  const legalBases = [
    'Consentement : lorsque vous avez donné votre accord explicite',
    'Exécution d\'un contrat : pour la fourniture de nos services',
    'Obligation légale : pour respecter nos obligations réglementaires',
    'Intérêt légitime : pour améliorer nos services et notre relation client',
  ];
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  legalBases.forEach(base => {
    doc.text(`• ${base}`, margin, yPosition);
    yPosition += 6;
  });
  yPosition += 10;

  // Durées de conservation
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('5. DURÉES DE CONSERVATION', margin, yPosition);
  yPosition += 8;
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const recordsWithRetention = processingRecords.filter(r => r.retention_period);
  if (recordsWithRetention.length > 0) {
    recordsWithRetention.slice(0, 5).forEach(record => {
      doc.text(`• ${record.name} : ${record.retention_period}`, margin, yPosition);
      yPosition += 5;
    });
  } else {
    doc.text('Les durées de conservation sont définies pour chaque traitement conformément', margin, yPosition);
    yPosition += 5;
    doc.text('aux obligations légales et aux finalités poursuivies.', margin, yPosition);
  }
  yPosition += 15;

  // Droits des personnes
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('6. VOS DROITS', margin, yPosition);
  yPosition += 8;
  
  const rights = [
    'Droit d\'accès à vos données personnelles (Art. 15)',
    'Droit de rectification des données inexactes (Art. 16)',
    'Droit à l\'effacement / "droit à l\'oubli" (Art. 17)',
    'Droit à la limitation du traitement (Art. 18)',
    'Droit à la portabilité des données (Art. 20)',
    'Droit d\'opposition au traitement (Art. 21)',
  ];
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  rights.forEach(right => {
    doc.text(`• ${right}`, margin, yPosition);
    yPosition += 5;
  });
  yPosition += 10;
  
  doc.text(`Pour exercer vos droits, contactez notre DPO à l'adresse : [À compléter]`, margin, yPosition);
  yPosition += 15;

  // Transferts
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('7. TRANSFERTS DE DONNÉES', margin, yPosition);
  yPosition += 8;
  
  const hasTransfers = processingRecords.some(r => r.transfers_outside_eu);
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  if (hasTransfers) {
    doc.text('Certains de nos traitements impliquent des transferts de données en dehors de', margin, yPosition);
    yPosition += 5;
    doc.text(`l'Espace Économique Européen. Ces transferts sont encadrés par des garanties appropriées`, margin, yPosition);
    yPosition += 5;
    doc.text('(clauses contractuelles types, décision d\'adéquation, etc.).', margin, yPosition);
  } else {
    doc.text(`Vos données sont principalement traitées au sein de l'Espace Économique Européen.`, margin, yPosition);
  }
  yPosition += 15;

  // Sécurité
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('8. SÉCURITÉ DES DONNÉES', margin, yPosition);
  yPosition += 8;
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Nous mettons en œuvre des mesures techniques et organisationnelles appropriées', margin, yPosition);
  yPosition += 5;
  doc.text('pour protéger vos données contre tout accès non autorisé, perte ou altération.', margin, yPosition);
  yPosition += 15;

  // Réclamation
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('9. RÉCLAMATION', margin, yPosition);
  yPosition += 8;
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`En cas de difficulté, vous pouvez introduire une réclamation auprès de ${authority}.`, margin, yPosition);
  yPosition += 15;

  // Mise à jour
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('10. MISE À JOUR DE LA POLITIQUE', margin, yPosition);
  yPosition += 8;
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Cette politique peut être mise à jour. Date de dernière révision : ${format(new Date(), 'PPP', { locale: fr })}`, margin, yPosition);

  addFooter(doc);
  
  doc.save(`Politique_Confidentialite_RGPD_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
