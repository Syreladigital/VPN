import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AuditLog } from "@/hooks/useAuditLogs";

const TABLE_LABELS: Record<string, string> = {
  organisations: "Organisations",
  processing_records: "Registre des traitements",
  data_breaches: "Violations de données",
  rights_requests: "Demandes de droits",
  subprocessors: "Sous-traitants",
  audit_results: "Résultats d'audit",
  corrective_actions: "Actions correctives",
  profiles: "Profils",
  user_roles: "Rôles utilisateurs",
  client_access: "Accès clients",
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
};

interface ExportFilters {
  tableName?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
}

export const exportAuditLogsPDF = (logs: AuditLog[], filters?: ExportFilters) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 35, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Journal d'Audit", 14, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Généré le ${format(new Date(), "dd MMMM yyyy à HH:mm", { locale: fr })}`, 14, 28);
  
  // Filters summary
  let yPos = 45;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Filtres appliqués", 14, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const activeFilters: string[] = [];
  if (filters?.tableName) {
    activeFilters.push(`Table: ${TABLE_LABELS[filters.tableName] || filters.tableName}`);
  }
  if (filters?.action) {
    activeFilters.push(`Action: ${ACTION_LABELS[filters.action] || filters.action}`);
  }
  if (filters?.startDate) {
    activeFilters.push(`Début: ${format(filters.startDate, "dd/MM/yyyy")}`);
  }
  if (filters?.endDate) {
    activeFilters.push(`Fin: ${format(filters.endDate, "dd/MM/yyyy")}`);
  }
  
  if (activeFilters.length === 0) {
    doc.setTextColor(100, 100, 100);
    doc.text("Aucun filtre appliqué", 14, yPos);
  } else {
    doc.text(activeFilters.join(" | "), 14, yPos);
  }
  
  // Statistics
  yPos += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Statistiques", 14, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const createCount = logs.filter(l => l.action === "CREATE").length;
  const updateCount = logs.filter(l => l.action === "UPDATE").length;
  const deleteCount = logs.filter(l => l.action === "DELETE").length;
  
  doc.text(`Total: ${logs.length} entrées | Créations: ${createCount} | Modifications: ${updateCount} | Suppressions: ${deleteCount}`, 14, yPos);
  
  // Table
  yPos += 10;
  
  const tableData = logs.map(log => [
    format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss"),
    log.user_name || log.user_id?.slice(0, 8) || "Système",
    ACTION_LABELS[log.action] || log.action,
    TABLE_LABELS[log.table_name] || log.table_name,
    log.organisation_name || "-",
    log.record_id.slice(0, 8) + "...",
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [["Date", "Utilisateur", "Action", "Table", "Organisation", "ID"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 30 },
      2: { cellWidth: 25 },
      3: { cellWidth: 40 },
      4: { cellWidth: 35 },
      5: { cellWidth: 25 },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer on each page
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${data.pageNumber} / ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
      doc.text(
        "Syrela Trust - Journal d'audit",
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    },
  });
  
  // Save
  const fileName = `audit_logs_${format(new Date(), "yyyy-MM-dd_HHmm")}.pdf`;
  doc.save(fileName);
};
