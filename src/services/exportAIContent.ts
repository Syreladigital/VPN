import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ExportContext {
  organisationName?: string;
  sector?: string;
  documentType: string;
}

const SECTOR_LABELS: Record<string, string> = {
  'sante_reglementee_pharmacien': 'Santé réglementée - Pharmacien',
  'sante_reglementee_medecin': 'Santé réglementée - Médecin',
  'sante_non_reglementee_bien_etre': 'Santé non réglementée - Bien-être',
  'assurance_vie': 'Assurance vie',
  'assurance_non_vie': 'Assurance non-vie',
  'transport_logistique': 'Transport & Logistique',
};

function cleanMarkdown(text: string): string {
  // Remove common markdown formatting for plain text export
  return text
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/^[-*+]\s/gm, '• ') // Convert list markers
    .replace(/^\d+\.\s/gm, '') // Remove numbered list markers
    .trim();
}

function parseMarkdownSections(text: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const lines = text.split('\n');
  let currentTitle = '';
  let currentContent: string[] = [];

  lines.forEach(line => {
    const headerMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headerMatch) {
      if (currentTitle || currentContent.length > 0) {
        sections.push({
          title: currentTitle,
          content: currentContent.join('\n').trim()
        });
      }
      currentTitle = headerMatch[1];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  });

  // Push last section
  if (currentTitle || currentContent.length > 0) {
    sections.push({
      title: currentTitle,
      content: currentContent.join('\n').trim()
    });
  }

  return sections;
}

export async function exportAIContentToPDF(
  content: string,
  context: ExportContext
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = 20;

  // Colors
  const primaryColor: [number, number, number] = [26, 54, 93];
  const accentColor: [number, number, number] = [59, 130, 246];
  const grayColor: [number, number, number] = [107, 114, 128];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(context.documentType.toUpperCase(), margin, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Généré par SyrelaTrust IA', margin, 32);
  doc.text(format(new Date(), 'PPP à HH:mm', { locale: fr }), pageWidth - margin - 55, 32);

  yPosition = 50;

  // Organisation info
  if (context.organisationName) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 20, 3, 3, 'F');
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Organisme : ${context.organisationName}`, margin + 5, yPosition + 8);
    
    if (context.sector) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Secteur : ${SECTOR_LABELS[context.sector] || context.sector}`, margin + 5, yPosition + 15);
    }
    
    yPosition += 28;
  }

  // Parse and render content
  const sections = parseMarkdownSections(content);
  const cleanedContent = cleanMarkdown(content);
  const maxWidth = pageWidth - 2 * margin;

  if (sections.length > 1) {
    // Render with sections
    sections.forEach(section => {
      // Check for new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      if (section.title) {
        doc.setTextColor(...primaryColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, margin, yPosition);
        yPosition += 8;
      }

      if (section.content) {
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        const cleanContent = cleanMarkdown(section.content);
        const lines = doc.splitTextToSize(cleanContent, maxWidth);
        
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 25) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Check for bullet points
          if (line.trim().startsWith('•') || line.trim().startsWith('🔴') || line.trim().startsWith('🟠') || line.trim().startsWith('🟡')) {
            doc.text(line, margin + 5, yPosition);
          } else {
            doc.text(line, margin, yPosition);
          }
          yPosition += 5;
        });
        
        yPosition += 5;
      }
    });
  } else {
    // Render as plain text
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const lines = doc.splitTextToSize(cleanedContent, maxWidth);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 25) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(...grayColor);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    doc.setTextColor(...grayColor);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Document généré par SyrelaTrust IA. La conformité finale repose sur la validation humaine du DPO.',
      margin,
      pageHeight - 10
    );
    doc.text(`Page ${i}/${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
  }

  // Save
  const fileName = `${context.documentType.replace(/\s+/g, '_')}_${context.organisationName?.replace(/\s+/g, '_') || 'Export'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}

export async function exportAIContentToWord(
  content: string,
  context: ExportContext
): Promise<void> {
  const sections = parseMarkdownSections(content);
  
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: context.documentType.toUpperCase(),
          bold: true,
          size: 36,
          color: '1a365d',
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Subtitle
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Généré par SyrelaTrust IA - ${format(new Date(), 'PPP à HH:mm', { locale: fr })}`,
          size: 20,
          color: '6b7280',
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Organisation info
  if (context.organisationName) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'ORGANISME : ',
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: context.organisationName,
            size: 22,
          }),
        ],
        spacing: { after: 100 },
        border: {
          bottom: { color: 'e5e7eb', size: 1, style: BorderStyle.SINGLE },
        },
      })
    );

    if (context.sector) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'SECTEUR : ',
              bold: true,
              size: 22,
            }),
            new TextRun({
              text: SECTOR_LABELS[context.sector] || context.sector,
              size: 22,
            }),
          ],
          spacing: { after: 400 },
        })
      );
    }
  }

  // Content sections
  if (sections.length > 1) {
    sections.forEach(section => {
      if (section.title) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.title,
                bold: true,
                size: 26,
                color: '1a365d',
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          })
        );
      }

      if (section.content) {
        const lines = section.content.split('\n').filter(l => l.trim());
        lines.forEach(line => {
          const cleanLine = cleanMarkdown(line);
          if (!cleanLine) return;

          const isBullet = line.trim().startsWith('-') || 
                          line.trim().startsWith('*') || 
                          line.trim().startsWith('•') ||
                          line.trim().startsWith('🔴') ||
                          line.trim().startsWith('🟠') ||
                          line.trim().startsWith('🟡') ||
                          line.trim().startsWith('✔');

          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: cleanLine,
                  size: 22,
                }),
              ],
              bullet: isBullet ? { level: 0 } : undefined,
              spacing: { after: 100 },
            })
          );
        });
      }
    });
  } else {
    // Plain text content
    const lines = cleanMarkdown(content).split('\n').filter(l => l.trim());
    lines.forEach(line => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 22,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    });
  }

  // Disclaimer
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '\n\nDocument généré par SyrelaTrust IA. La conformité finale repose sur la validation humaine du DPO.',
          size: 18,
          color: '6b7280',
          italics: true,
        }),
      ],
      spacing: { before: 400 },
      alignment: AlignmentType.CENTER,
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${context.documentType.replace(/\s+/g, '_')}_${context.organisationName?.replace(/\s+/g, '_') || 'Export'}_${format(new Date(), 'yyyy-MM-dd')}.docx`;
  saveAs(blob, fileName);
}
