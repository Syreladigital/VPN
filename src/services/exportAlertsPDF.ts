import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, differenceInHours, differenceInDays, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Notification } from '@/hooks/useNotifications';
import { DataBreach, RightsRequest, Subprocessor } from '@/types/documentation';

interface AlertsExportData {
  organisationName: string;
  notifications: Notification[];
  breaches: DataBreach[];
  requests: RightsRequest[];
  subprocessors: Subprocessor[];
}

export async function exportAlertsPDF(data: AlertsExportData): Promise<void> {
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

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('TABLEAU DE BORD DES ALERTES RGPD', margin, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.organisationName, margin, 35);
  
  doc.setFontSize(10);
  doc.text(`Généré le ${format(new Date(), 'PPP à HH:mm', { locale: fr })}`, pageWidth - margin - 60, 35);

  yPosition = 55;

  // Summary stats
  const now = new Date();
  const criticalCount = data.notifications.filter(n => n.severity === 'critical').length;
  const warningCount = data.notifications.filter(n => n.severity === 'warning').length;
  const infoCount = data.notifications.filter(n => n.severity === 'info').length;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 30, 3, 3, 'F');
  
  const statBoxWidth = (pageWidth - 2 * margin - 30) / 3;
  
  // Critical alerts
  doc.setFillColor(...redColor);
  doc.roundedRect(margin + 5, yPosition + 5, statBoxWidth, 20, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(criticalCount.toString(), margin + 15, yPosition + 18);
  doc.setFontSize(8);
  doc.text('Critiques', margin + 30, yPosition + 18);

  // Warning alerts
  doc.setFillColor(...orangeColor);
  doc.roundedRect(margin + 15 + statBoxWidth, yPosition + 5, statBoxWidth, 20, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(warningCount.toString(), margin + 25 + statBoxWidth, yPosition + 18);
  doc.setFontSize(8);
  doc.text('Avertissements', margin + 40 + statBoxWidth, yPosition + 18);

  // Info alerts
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(margin + 25 + 2 * statBoxWidth, yPosition + 5, statBoxWidth, 20, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(infoCount.toString(), margin + 35 + 2 * statBoxWidth, yPosition + 18);
  doc.setFontSize(8);
  doc.text('Informations', margin + 50 + 2 * statBoxWidth, yPosition + 18);

  yPosition += 45;

  // Section 1: Data Breaches (72h deadline)
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('VIOLATIONS DE DONNÉES - Délai 72h CNIL', margin, yPosition);
  yPosition += 8;

  const openBreaches = data.breaches.filter(b => b.status === 'open' && !b.cnil_notified);
  
  if (openBreaches.length > 0) {
    const breachesData = openBreaches.map(breach => {
      const deadline = new Date(new Date(breach.discovery_date).getTime() + 72 * 60 * 60 * 1000);
      const hoursRemaining = differenceInHours(deadline, now);
      const isOverdue = isPast(deadline);
      
      return [
        breach.nature.substring(0, 30),
        format(breach.discovery_date, 'dd/MM/yyyy HH:mm'),
        format(deadline, 'dd/MM/yyyy HH:mm'),
        isOverdue ? 'DÉPASSÉ' : `${hoursRemaining}h`,
        isOverdue ? 'Critique' : hoursRemaining <= 24 ? 'Urgent' : 'Normal',
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Nature', 'Découverte', 'Échéance', 'Restant', 'Urgence']],
      body: breachesData,
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
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setTextColor(...grayColor);
    doc.setFontSize(10);
    doc.text('Aucune violation en cours nécessitant notification CNIL.', margin, yPosition + 5);
    yPosition += 20;
  }

  // Section 2: Rights Requests (1 month deadline)
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DEMANDES DE DROITS - Délai 1 mois', margin, yPosition);
  yPosition += 8;

  const pendingRequests = data.requests.filter(r => r.status !== 'completed' && r.status !== 'rejected');
  
  if (pendingRequests.length > 0) {
    const requestsData = pendingRequests.map(request => {
      const deadline = request.deadline || new Date(new Date(request.request_date).getTime() + 30 * 24 * 60 * 60 * 1000);
      const daysRemaining = differenceInDays(deadline, now);
      const isOverdue = isPast(deadline);
      
      return [
        request.requester_name.substring(0, 20),
        request.right_type,
        format(request.request_date, 'dd/MM/yyyy'),
        format(deadline, 'dd/MM/yyyy'),
        isOverdue ? 'DÉPASSÉ' : `${daysRemaining}j`,
        isOverdue ? 'Critique' : daysRemaining <= 7 ? 'Urgent' : 'Normal',
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Demandeur', 'Type', 'Date demande', 'Échéance', 'Restant', 'Urgence']],
      body: requestsData,
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
      margin: { left: margin, right: margin },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setTextColor(...grayColor);
    doc.setFontSize(10);
    doc.text('Aucune demande de droits en attente.', margin, yPosition + 5);
    yPosition += 20;
  }

  // Section 3: Subprocessor Reviews
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('REVUES SOUS-TRAITANTS - Échéances contractuelles', margin, yPosition);
  yPosition += 8;

  const subsWithReview = data.subprocessors.filter(s => s.review_date && s.status === 'active');
  
  if (subsWithReview.length > 0) {
    const subsData = subsWithReview.map(sub => {
      const reviewDate = sub.review_date!;
      const daysUntil = differenceInDays(reviewDate, now);
      const isOverdue = isPast(reviewDate);
      
      return [
        sub.name.substring(0, 25),
        sub.activity.substring(0, 25),
        format(reviewDate, 'dd/MM/yyyy'),
        isOverdue ? 'EN RETARD' : `${daysUntil}j`,
        isOverdue ? 'En retard' : daysUntil <= 30 ? 'À planifier' : 'OK',
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Sous-traitant', 'Activité', 'Date revue', 'Restant', 'Statut']],
      body: subsData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
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
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setTextColor(...grayColor);
    doc.setFontSize(10);
    doc.text('Aucune revue de sous-traitant planifiée.', margin, yPosition + 5);
    yPosition += 20;
  }

  // Section 4: All Active Notifications
  if (yPosition > 180) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOUTES LES ALERTES ACTIVES', margin, yPosition);
  yPosition += 8;

  if (data.notifications.length > 0) {
    const notifData = data.notifications.map(notif => [
      notif.severity === 'critical' ? '🔴' : notif.severity === 'warning' ? '🟠' : '🔵',
      notif.title.substring(0, 35),
      notif.message.substring(0, 50) + (notif.message.length > 50 ? '...' : ''),
      notif.due_date ? format(notif.due_date, 'dd/MM/yyyy') : '-',
      notif.read ? 'Lu' : 'Non lu',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['', 'Titre', 'Message', 'Échéance', 'Statut']],
      body: notifData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 40 },
        2: { cellWidth: 70 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
      },
    });
  } else {
    doc.setTextColor(...greenColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('✓ Aucune alerte active - Tous les délais sont respectés.', margin, yPosition + 5);
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
      'Document généré automatiquement - Vérifiez les délais légaux auprès de la CNIL.',
      margin,
      pageHeight - 10
    );
    doc.text(`Page ${i}/${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
  }

  // Save
  const fileName = `Alertes_RGPD_${data.organisationName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
