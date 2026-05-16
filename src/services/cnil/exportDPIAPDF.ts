import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Organisation, LegalFramework } from '@/types/rgpd';
import { ProcessingRecord } from '@/types/documentation';
import { supabase } from '@/integrations/supabase/client';
import { getLegalFrameworkShortName, getDataProtectionAuthority } from '@/lib/legalReferences';

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
    ? 'Article 48 du Projet de loi 2025/95' 
    : 'Article 35 du RGPD';

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

interface DPIACheckResult {
  isRequired: boolean;
  reasons: string[];
  highRiskTreatments: ProcessingRecord[];
  auditHighRisks: number;
}

async function checkDPIARequired(
  organisationId: string,
  processingRecords: ProcessingRecord[]
): Promise<DPIACheckResult> {
  const reasons: string[] = [];
  const highRiskTreatments: ProcessingRecord[] = [];
  
  // Vérifier les traitements à risque
  processingRecords.forEach(record => {
    const dataCategories = Array.isArray(record.data_categories) ? record.data_categories : [];
    const hasHealthData = dataCategories.some(c => 
      c.toLowerCase().includes('santé') || 
      c.toLowerCase().includes('medical') ||
      c.toLowerCase().includes('health')
    );
    const hasBiometric = dataCategories.some(c => 
      c.toLowerCase().includes('biométri') ||
      c.toLowerCase().includes('biometric')
    );
    const hasLargeScale = record.purposes?.toLowerCase().includes('grande échelle');
    const hasTransfers = record.transfers_outside_eu;
    
    if (hasHealthData || hasBiometric || hasLargeScale) {
      highRiskTreatments.push(record);
      if (hasHealthData) reasons.push(`Traitement "${record.name}" : données de santé`);
      if (hasBiometric) reasons.push(`Traitement "${record.name}" : données biométriques`);
      if (hasLargeScale) reasons.push(`Traitement "${record.name}" : traitement à grande échelle`);
    }
    if (hasTransfers) {
      reasons.push(`Traitement "${record.name}" : transferts hors UE`);
    }
  });

  // Vérifier les résultats d'audit
  const { data: auditResults } = await supabase
    .from('audit_results')
    .select('risks_high')
    .eq('organisation_id', organisationId)
    .eq('is_latest', true)
    .maybeSingle();

  const auditHighRisks = auditResults?.risks_high || 0;
  if (auditHighRisks > 0) {
    reasons.push(`${auditHighRisks} point(s) à risque élevé identifié(s) lors de l'audit`);
  }

  return {
    isRequired: reasons.length > 0,
    reasons,
    highRiskTreatments,
    auditHighRisks,
  };
}

export async function exportDPIAPDF(
  organisation: Organisation,
  processingRecords: ProcessingRecord[]
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const legalFramework: LegalFramework = organisation.legalFramework || 'rgpd_eu';
  const authority = getDataProtectionAuthority(legalFramework);
  
  const dpiaCheck = await checkDPIARequired(organisation.id, processingRecords);
  
  let yPosition = addHeader(
    doc, 
    "ANALYSE D'IMPACT (DPIA)", 
    organisation, 
    legalFramework
  );

  if (!dpiaCheck.isRequired) {
    // Document attestant que la DPIA n'est pas requise
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 80, 3, 3, 'F');
    
    doc.setTextColor(...COLORS.green);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DPIA NON REQUISE À CE STADE', margin + 10, yPosition + 20);
    
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`À la date du ${format(new Date(), 'PPP', { locale: fr })}, l'analyse des traitements`, margin + 10, yPosition + 35);
    doc.text(`de l'organisme ${organisation.name} n'a pas identifié de traitement`, margin + 10, yPosition + 45);
    doc.text('susceptible d\'engendrer un risque élevé pour les droits et libertés', margin + 10, yPosition + 55);
    doc.text('des personnes concernées.', margin + 10, yPosition + 65);
    
    yPosition += 95;
    
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Critères vérifiés :', margin, yPosition);
    yPosition += 8;
    
    const criteria = [
      '✓ Pas de traitement de données sensibles à grande échelle',
      '✓ Pas de surveillance systématique à grande échelle',
      '✓ Pas d\'évaluation/notation systématique et extensive',
      '✓ Pas de traitement innovant utilisant de nouvelles technologies',
      '✓ Pas de croisement ou combinaison de données à grande échelle',
    ];
    
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    criteria.forEach(c => {
      doc.text(c, margin + 5, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Cette évaluation doit être révisée en cas de nouveau traitement ou de modification`, margin, yPosition);
    doc.text(`significative des traitements existants.`, margin, yPosition + 5);
    
    addFooter(doc);
    doc.save(`DPIA_Non_Requise_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    return;
  }

  // DPIA requise - Document structuré
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'F');
  doc.setTextColor(...COLORS.orange);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠️ ANALYSE D\'IMPACT REQUISE', margin + 10, yPosition + 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dpiaCheck.reasons.length} facteur(s) de risque identifié(s)`, margin + 10, yPosition + 20);
  
  yPosition += 35;

  // Section 1 : Facteurs déclencheurs
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. FACTEURS DÉCLENCHEURS', margin, yPosition);
  yPosition += 10;

  dpiaCheck.reasons.forEach(reason => {
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`• ${reason}`, margin + 5, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;

  // Section 2 : Traitements concernés
  if (dpiaCheck.highRiskTreatments.length > 0) {
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. TRAITEMENTS À RISQUE ÉLEVÉ', margin, yPosition);
    yPosition += 8;

    const treatmentData = dpiaCheck.highRiskTreatments.map(t => [
      t.name,
      t.purposes,
      Array.isArray(t.data_categories) ? t.data_categories.join(', ') : 'Non renseigné',
      t.transfers_outside_eu ? 'Oui' : 'Non',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Traitement', 'Finalités', 'Catégories de données', 'Transferts']],
      body: treatmentData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.orange,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Section 3 : Cadre de l'analyse
  doc.addPage();
  yPosition = 30;
  
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. CADRE MÉTHODOLOGIQUE DE L\'ANALYSE', margin, yPosition);
  yPosition += 10;

  const sections = [
    {
      title: '3.1 Description du traitement',
      items: [
        'Nature, portée, contexte et finalités du traitement',
        'Données traitées et personnes concernées',
        'Durées de conservation',
        'Destinataires des données',
      ],
    },
    {
      title: '3.2 Évaluation de la nécessité et proportionnalité',
      items: [
        'Justification du traitement par rapport aux finalités',
        'Minimisation des données',
        'Base légale du traitement',
        'Information des personnes concernées',
      ],
    },
    {
      title: '3.3 Identification et évaluation des risques',
      items: [
        'Risques pour les droits et libertés',
        'Sources de risques',
        'Impacts potentiels',
        'Vraisemblance des menaces',
      ],
    },
    {
      title: '3.4 Mesures pour traiter les risques',
      items: [
        'Mesures de sécurité techniques',
        'Mesures organisationnelles',
        'Garanties et mécanismes de contrôle',
        'Plan d\'action si nécessaire',
      ],
    },
  ];

  sections.forEach(section => {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, margin, yPosition);
    yPosition += 7;
    
    section.items.forEach(item => {
      doc.setTextColor(...COLORS.gray);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`□ ${item}`, margin + 5, yPosition);
      yPosition += 5;
    });
    
    yPosition += 8;
  });

  // Section 4 : Consultation préalable
  yPosition += 5;
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`4. CONSULTATION PRÉALABLE ${authority}`, margin, yPosition);
  yPosition += 10;
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Si les risques résiduels demeurent élevés après mise en œuvre des mesures,`, margin, yPosition);
  yPosition += 5;
  doc.text(`une consultation préalable de ${authority} est obligatoire avant mise en œuvre du traitement.`, margin, yPosition);

  addFooter(doc);
  
  const frameworkSuffix = legalFramework === 'loi_tunisie_2025' ? 'Tunisie' : 'RGPD';
  doc.save(`DPIA_${frameworkSuffix}_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
