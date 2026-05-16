import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Organisation } from '@/types/rgpd';
import { ProcessingRecord } from '@/types/documentation';
import { supabase } from '@/integrations/supabase/client';

const COLORS = {
  primary: [26, 54, 93] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  green: [34, 197, 94] as [number, number, number],
  orange: [249, 115, 22] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

// Catégories de mesures de sécurité
const SECURITY_CATEGORIES = {
  technical: {
    title: 'Mesures techniques',
    keywords: ['chiffrement', 'cryptage', 'firewall', 'pare-feu', 'antivirus', 'backup', 'sauvegarde', 
               'authentification', 'mot de passe', 'mfa', '2fa', 'ssl', 'https', 'vpn', 'log', 
               'journalisation', 'patch', 'mise à jour', 'anonymisation', 'pseudonymisation'],
  },
  organizational: {
    title: 'Mesures organisationnelles',
    keywords: ['formation', 'sensibilisation', 'procédure', 'politique', 'charte', 'clause', 
               'contrat', 'habilitation', 'accès', 'droit', 'audit', 'contrôle', 'revue',
               'gestion', 'incident', 'plan', 'continuité', 'dpo', 'rgpd'],
  },
  physical: {
    title: 'Mesures physiques',
    keywords: ['badge', 'accès physique', 'local', 'sécurisé', 'armoire', 'clé', 'caméra',
               'vidéosurveillance', 'alarme', 'détection', 'incendie', 'climatisation'],
  },
};

function addHeader(
  doc: jsPDF,
  title: string,
  organisation: Organisation
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const articleRef = 'Article 32 du RGPD';

  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Conforme ${articleRef} - Sécurité des traitements`, margin, 32);
  
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

function categorizeMeasure(text: string): string[] {
  const categories: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const [key, cat] of Object.entries(SECURITY_CATEGORIES)) {
    if (cat.keywords.some(kw => lowerText.includes(kw))) {
      categories.push(key);
    }
  }
  
  return categories.length > 0 ? categories : ['organizational']; // Par défaut
}

export async function exportSecurityMeasuresPDF(
  organisation: Organisation,
  processingRecords: ProcessingRecord[]
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = addHeader(doc, 'MESURES DE SÉCURITÉ', organisation);

  // Récupérer les résultats d'audit pour la section sécurité
  const { data: auditResults } = await supabase
    .from('audit_results')
    .select('*')
    .eq('organisation_id', organisation.id)
    .eq('is_latest', true)
    .maybeSingle();

  const { data: auditAnswers } = await supabase
    .from('audit_attempt_answers')
    .select('*')
    .eq('attempt_id', auditResults?.attempt_id || '')
    .ilike('section_id', '%securite%');

  // Collecter les mesures depuis les traitements
  const allMeasures: { source: string; measure: string; categories: string[] }[] = [];
  
  processingRecords.forEach(record => {
    if (record.security_measures) {
      allMeasures.push({
        source: record.name,
        measure: record.security_measures,
        categories: categorizeMeasure(record.security_measures),
      });
    }
  });

  // Synthèse
  const hasAuditData = auditResults && auditAnswers && auditAnswers.length > 0;
  const hasMeasures = allMeasures.length > 0;
  
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 30, 3, 3, 'F');
  
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Synthèse des sources de données', margin + 5, yPosition + 10);
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Traitements avec mesures documentées : ${allMeasures.length}`, margin + 5, yPosition + 18);
  doc.text(`Audit sécurité complété : ${hasAuditData ? 'Oui' : 'Non'}`, margin + 5, yPosition + 25);
  
  if (hasAuditData) {
    const securityScore = auditAnswers.reduce((sum, a) => sum + Number(a.score), 0);
    const securityMax = auditAnswers.reduce((sum, a) => sum + Number(a.max_score), 0);
    const securityPercent = securityMax > 0 ? Math.round((securityScore / securityMax) * 100) : 0;
    doc.text(`Score sécurité audit : ${securityPercent}%`, margin + 100, yPosition + 18);
  }
  
  yPosition += 40;

  if (!hasMeasures && !hasAuditData) {
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 30, 3, 3, 'F');
    doc.setTextColor(...COLORS.orange);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DONNÉES INSUFFISANTES', margin + 10, yPosition + 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Aucune mesure de sécurité documentée dans les traitements.', margin + 10, yPosition + 22);
    
    addFooter(doc);
    doc.save(`Mesures_Securite_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    return;
  }

  // Section 1 : Mesures par catégorie
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. MESURES PAR CATÉGORIE', margin, yPosition);
  yPosition += 10;

  for (const [catKey, category] of Object.entries(SECURITY_CATEGORIES)) {
    const categoryMeasures = allMeasures.filter(m => m.categories.includes(catKey));
    
    if (categoryMeasures.length === 0) continue;
    
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFillColor(...COLORS.primary);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(category.title, margin + 3, yPosition + 5);
    yPosition += 10;

    categoryMeasures.forEach(measure => {
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.setTextColor(...COLORS.primary);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${measure.source}`, margin + 3, yPosition);
      yPosition += 4;
      
      doc.setTextColor(...COLORS.gray);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(measure.measure, pageWidth - 2 * margin - 10);
      doc.text(lines, margin + 8, yPosition);
      yPosition += lines.length * 4 + 5;
    });
    
    yPosition += 5;
  }

  // Section 2 : Résultats d'audit sécurité si disponibles
  if (hasAuditData && auditAnswers) {
    doc.addPage();
    yPosition = 30;
    
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. ÉVALUATION AUDIT SÉCURITÉ', margin, yPosition);
    yPosition += 10;

    const conformeCount = auditAnswers.filter(a => a.selected_value === 'true' || a.selected_value === 'yes').length;
    const nonConformeCount = auditAnswers.filter(a => a.selected_value === 'false' || a.selected_value === 'no').length;
    const partielCount = auditAnswers.filter(a => a.selected_value === 'partial').length;

    const auditSummary = [
      ['Points conformes', conformeCount.toString()],
      ['Points partiellement conformes', partielCount.toString()],
      ['Points non conformes', nonConformeCount.toString()],
      ['Total évalué', auditAnswers.length.toString()],
    ];

    autoTable(doc, {
      startY: yPosition,
      body: auditSummary,
      theme: 'grid',
      bodyStyles: {
        fontSize: 9,
        textColor: [60, 60, 60],
      },
      columnStyles: {
        0: { cellWidth: 80, fontStyle: 'bold' },
        1: { cellWidth: 30, halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Points à risque élevé
    const highRiskAnswers = auditAnswers.filter(a => a.risk_level === 'eleve');
    if (highRiskAnswers.length > 0) {
      doc.setTextColor(...COLORS.red);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Points à risque élevé', margin, yPosition);
      yPosition += 8;

      highRiskAnswers.forEach(answer => {
        if (yPosition > 260) {
          doc.addPage();
          yPosition = 30;
        }
        doc.setTextColor(...COLORS.gray);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${answer.question_id.replace(/-/g, ' ').replace(/_/g, ' ')}`, margin + 3, yPosition);
        yPosition += 5;
      });
    }
  }

  // Section 3 : Recommandations
  doc.addPage();
  yPosition = 30;
  
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. RECOMMANDATIONS', margin, yPosition);
  yPosition += 10;

  const recommendations = [
    'Maintenir à jour les mesures techniques (patches, antivirus, chiffrement)',
    'Former régulièrement les collaborateurs aux bonnes pratiques',
    'Réaliser des audits de sécurité périodiques',
    'Documenter tous les incidents et leur traitement',
    'Réviser annuellement les habilitations et droits d\'accès',
    'Tester régulièrement les procédures de sauvegarde et restauration',
  ];

  recommendations.forEach((rec, i) => {
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(9);
    doc.text(`${i + 1}. ${rec}`, margin + 3, yPosition);
    yPosition += 7;
  });

  addFooter(doc);
  
  doc.save(`Mesures_Securite_RGPD_${organisation.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
