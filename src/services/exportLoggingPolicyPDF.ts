import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function exportLoggingPolicyToPDF(): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 20;

  // Colors
  const primaryColor: [number, number, number] = [26, 54, 93];
  const accentColor: [number, number, number] = [59, 130, 246];
  const grayColor: [number, number, number] = [107, 114, 128];
  const greenColor: [number, number, number] = [34, 197, 94];
  const redColor: [number, number, number] = [239, 68, 68];
  const amberColor: [number, number, number] = [245, 158, 11];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('POLITIQUE DE JOURNALISATION', margin, 22);
  doc.text('DES CONNEXIONS', margin, 32);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('SyrelaTrust - Documentation RGPD', margin, 40);
  doc.text(`Généré le ${format(new Date(), 'PPP', { locale: fr })}`, pageWidth - margin - 50, 40);

  yPosition = 55;

  // Section 1: Finalités
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Finalités de la journalisation', margin, yPosition);
  yPosition += 10;

  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Les logs de connexion ont pour finalité exclusive :', margin, yPosition);
  yPosition += 8;

  const finalites = [
    '✓ La sécurité de l\'application',
    '✓ La détection d\'accès non autorisés',
    '✓ La traçabilité minimale en cas d\'incident',
    '✓ La preuve d\'accès en cas de contrôle ou de litige',
  ];

  doc.setTextColor(...greenColor);
  finalites.forEach(item => {
    doc.text(item, margin + 5, yPosition);
    yPosition += 6;
  });

  yPosition += 5;
  doc.setTextColor(...redColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Interdictions :', margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');

  const interdictions = [
    '✗ Surveillance des comportements',
    '✗ Profilage des utilisateurs',
    '✗ Analyse de la productivité',
  ];

  interdictions.forEach(item => {
    doc.text(item, margin + 5, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Section 2: Structure des logs
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Structure des logs (modèle RGPD)', margin, yPosition);
  yPosition += 10;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 45, 3, 3, 'F');
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.setFont('courier', 'normal');
  const logStructure = [
    '{',
    '  "event_type": "login_success | login_failure | logout | password_reset",',
    '  "user_id": "identifiant_interne",',
    '  "timestamp": "YYYY-MM-DD HH:MM:SS",',
    '  "ip_address": "pseudonymisée",',
    '  "user_agent": "navigateur_simplifié"',
    '}',
  ];
  
  let codeY = yPosition + 6;
  logStructure.forEach(line => {
    doc.text(line, margin + 5, codeY);
    codeY += 5;
  });

  yPosition += 55;

  // Événements journalisés et données interdites
  autoTable(doc, {
    startY: yPosition,
    head: [['Événements journalisés', 'Données interdites']],
    body: [
      ['• Connexions (succès/échec)', '• Contenu saisi dans l\'application'],
      ['• Déconnexions', '• Données clients'],
      ['• Tentatives multiples échouées', '• Géolocalisation précise'],
      ['• Changements de mot de passe', '• Mots de passe (même chiffrés)'],
      ['• Réinitialisations de mot de passe', ''],
    ],
    theme: 'grid',
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
    columnStyles: {
      0: { cellWidth: (pageWidth - 2 * margin) / 2 },
      1: { cellWidth: (pageWidth - 2 * margin) / 2 },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Section 3: Durée de conservation
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Durée de conservation', margin, yPosition);
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [['Type de log', 'Durée', 'Action']],
    body: [
      ['Logs de connexion', '6 à 12 mois maximum', 'Suppression automatique'],
      ['Logs liés à un incident', 'Jusqu\'à clôture + durée légale', 'Suppression après prescription'],
    ],
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
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Au-delà : suppression automatique ou anonymisation irréversible.', margin, yPosition);

  // New page
  doc.addPage();
  yPosition = 20;

  // Section 4: Information des utilisateurs
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Information des utilisateurs', margin, yPosition);
  yPosition += 10;

  doc.setFillColor(219, 234, 254);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 30, 3, 3, 'F');
  
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const infoText = 'Dans le cadre de la sécurité de l\'application SyrelaTrust, des journaux de connexion sont enregistrés (date, heure, identifiant utilisateur, résultat de la connexion). Ces journaux sont utilisés exclusivement à des fins de sécurité et de traçabilité et sont conservés pour une durée limitée.';
  
  const splitText = doc.splitTextToSize(infoText, pageWidth - 2 * margin - 10);
  doc.text(splitText, margin + 5, yPosition + 8);

  yPosition += 40;

  // Section 5: Registre RGPD
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Inscription au registre RGPD', margin, yPosition);
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    body: [
      ['Nom du traitement', 'Journalisation des accès à l\'application SyrelaTrust'],
      ['Finalité', 'Sécurité, détection d\'accès non autorisés, traçabilité'],
      ['Base légale', 'Intérêt légitime (art. 6.1.f RGPD)'],
      ['Personnes concernées', 'Utilisateurs habilités de l\'application'],
      ['Données traitées', 'Données d\'authentification indirectes'],
      ['Durée de conservation', '6 à 12 mois'],
      ['Mesures de sécurité', 'Accès restreint, chiffrement, suppression automatique'],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [60, 60, 60],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: pageWidth - 2 * margin - 55 },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Section 6: Analyse de risques
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('6. Analyse de risques', margin, yPosition);
  yPosition += 10;

  doc.setFillColor(254, 243, 199);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 15, 3, 3, 'F');
  
  doc.setTextColor(...amberColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Risque : accès non autorisé aux logs', margin + 5, yPosition + 7);
  doc.setFont('helvetica', 'normal');
  doc.text('Gravité : faible à moyenne', margin + 5, yPosition + 12);

  yPosition += 22;

  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Mesures de mitigation :', margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');

  const mesures = [
    '• Accès réservé à l\'administrateur',
    '• Chiffrement des données',
    '• Pas de logs excessifs',
    '• Suppression automatique après expiration',
  ];

  mesures.forEach(item => {
    doc.text(item, margin + 5, yPosition);
    yPosition += 5;
  });

  yPosition += 10;

  // Warning box
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'F');
  
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠️ Validation requise', margin + 5, yPosition + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  const warningText = 'La journalisation des connexions doit être configurée et validée par le responsable de traitement ou le DPO. Les paramètres peuvent être ajustés pour respecter les principes de minimisation et de proportionnalité.';
  const splitWarning = doc.splitTextToSize(warningText, pageWidth - 2 * margin - 10);
  doc.text(splitWarning, margin + 5, yPosition + 15);

  yPosition += 35;

  // Conclusion
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 20, 3, 3, 'F');
  
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('✅ Journalisation des connexions documentée pour SyrelaTrust.', margin + 5, yPosition + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Configuration à activer uniquement après validation DPO.', margin + 5, yPosition + 15);

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
      'SyrelaTrust - Politique de journalisation RGPD',
      margin,
      pageHeight - 10
    );
    doc.text(`Page ${i}/${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
  }

  // Save
  const fileName = `Politique_Journalisation_SyrelaTrust_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
