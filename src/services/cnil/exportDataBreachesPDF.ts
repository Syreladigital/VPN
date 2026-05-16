import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Organisation, LegalFramework } from '@/types/rgpd';
import { DataBreach, BREACH_STATUS_LABELS } from '@/types/documentation';
import { 
  getDataProtectionAuthority, 
  getLegalFrameworkShortName 
} from '@/lib/legalReferences';

const COLORS = {
  primary: [26, 54, 93] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  green: [34, 197, 94] as [number, number, number],
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
  const authority = getDataProtectionAuthority(legalFramework);
  const articleRef = legalFramework === 'loi_tunisie_2025' 
    ? 'Article 45 du Projet de loi 2025/95' 
    : 'Article 33 du RGPD';

  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Conforme ${articleRef} - Notification ${authority}`, margin, 32);
  
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

export async function exportDataBreachesPDF(
  organisation: Organisation,
  breaches: DataBreach[]
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const legalFramework: LegalFramework = organisation.legalFramework || 'rgpd_eu';
  const authority = getDataProtectionAuthority(legalFramework);
  
  let yPosition = addHeader(
    doc, 
    'REGISTRE DES VIOLATIONS DE DONNÉES', 
    organisation, 
    legalFramework
  );

  if (breaches.length === 0) {
    // Document attestant l'absence de violations
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 60, 3, 3, 'F');
    
    doc.setTextColor(...COLORS.green);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AUCUNE VIOLATION CONSTATÉE', margin + 10, yPosition + 20);
    
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`À la date du ${format(new Date(), 'PPP', { locale: fr })}, aucune violation de données`, margin + 10, yPosition + 35);
    doc.text(`personnelles n'a été enregistrée pour l'organisme ${organisation.name}.`, margin + 10, yPosition + 45);
    
    doc.setFontSize(9);
    doc.text(`Ce registre est tenu conformément aux obligations de notification à ${authority}.`, margin + 10, yPosition + 55);
    
    addFooter(doc);
    doc.save(`Registre_Violations_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    return;
  }

  // Synthèse
  const openCount = breaches.filter(b => b.status === 'open').length;
  const notifiedCount = breaches.filter(b => b.cnil_notified).length;
  const closedCount = breaches.filter(b => b.status === 'closed').length;
  
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'F');
  
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Synthèse', margin + 5, yPosition + 10);
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total violations : ${breaches.length}`, margin + 5, yPosition + 18);
  doc.text(`En cours : ${openCount}`, margin + 60, yPosition + 18);
  doc.text(`Notifiées ${authority} : ${notifiedCount}`, margin + 100, yPosition + 18);
  doc.text(`Clôturées : ${closedCount}`, margin + 160, yPosition + 18);
  
  yPosition += 35;

  // Tableau des violations
  const tableData = breaches.map((breach, index) => [
    (index + 1).toString(),
    format(new Date(breach.breach_date), 'dd/MM/yyyy', { locale: fr }),
    format(new Date(breach.discovery_date), 'dd/MM/yyyy', { locale: fr }),
    breach.nature,
    breach.estimated_count?.toString() || 'Non estimé',
    BREACH_STATUS_LABELS[breach.status],
    breach.cnil_notified ? '✓' : '○',
    breach.persons_informed ? '✓' : '○',
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Date violation', 'Découverte', 'Nature', 'Personnes', 'Statut', authority, 'Informées']],
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
      2: { cellWidth: 22 },
      3: { cellWidth: 40 },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 22 },
      6: { cellWidth: 15, halign: 'center' },
      7: { cellWidth: 18, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Détails par violation
  doc.addPage();
  yPosition = 30;
  
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAIL DES VIOLATIONS', margin, yPosition);
  yPosition += 15;

  breaches.forEach((breach, index) => {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFillColor(...(breach.status === 'open' ? COLORS.red : COLORS.primary));
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Violation #${index + 1} - ${breach.nature}`, margin + 3, yPosition + 6);
    yPosition += 12;

    const details = [
      ['Date de la violation', format(new Date(breach.breach_date), 'PPP', { locale: fr })],
      ['Date de découverte', format(new Date(breach.discovery_date), 'PPP', { locale: fr })],
      ['Échéance notification', breach.notification_deadline ? format(new Date(breach.notification_deadline), 'PPP', { locale: fr }) : 'Non définie'],
      ['Catégories affectées', breach.categories_affected?.join(', ') || 'Non renseigné'],
      ['Nombre estimé', breach.estimated_count?.toString() || 'Non estimé'],
      ['Conséquences', breach.consequences || 'Non renseigné'],
      ['Mesures prises', breach.measures_taken || 'Non renseigné'],
      [`Notification ${authority}`, breach.cnil_notified ? `Oui - ${breach.cnil_notification_date ? format(new Date(breach.cnil_notification_date), 'dd/MM/yyyy') : ''}` : 'Non'],
      ['Personnes informées', breach.persons_informed ? 'Oui' : 'Non'],
    ];

    autoTable(doc, {
      startY: yPosition,
      body: details,
      theme: 'plain',
      bodyStyles: {
        fontSize: 8,
        textColor: [60, 60, 60],
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', textColor: COLORS.primary },
        1: { cellWidth: 110 },
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  });

  addFooter(doc);
  
  const frameworkSuffix = legalFramework === 'loi_tunisie_2025' ? 'Tunisie' : 'RGPD';
  doc.save(`Registre_Violations_${frameworkSuffix}_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
