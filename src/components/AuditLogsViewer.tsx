import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuditLogs, AuditLog } from "@/hooks/useAuditLogs";
import { exportAuditLogsPDF } from "@/services/exportAuditLogsPDF";
import { AuditActivityDashboard } from "@/components/AuditActivityDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  RefreshCw, 
  Download, 
  CalendarIcon, 
  Eye,
  Plus,
  Pencil,
  Trash2,
  Filter,
  FileText,
  BarChart3,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const ACTION_CONFIG = {
  CREATE: { label: "Création", icon: Plus, variant: "default" as const, color: "bg-green-500/10 text-green-600 border-green-200" },
  UPDATE: { label: "Modification", icon: Pencil, variant: "secondary" as const, color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  DELETE: { label: "Suppression", icon: Trash2, variant: "destructive" as const, color: "bg-red-500/10 text-red-600 border-red-200" },
};

const AUDITED_TABLES = [
  "organisations",
  "processing_records",
  "data_breaches",
  "rights_requests",
  "subprocessors",
  "audit_results",
  "corrective_actions",
  "profiles",
  "user_roles",
  "client_access",
];

export const AuditLogsViewer = () => {
  const [filters, setFilters] = useState({
    tableName: "",
    action: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { logs, loading, refresh } = useAuditLogs();

  const handleFilter = () => {
    refresh({
      tableName: filters.tableName || undefined,
      action: filters.action || undefined,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
  };

  const handleReset = () => {
    setFilters({
      tableName: "",
      action: "",
      startDate: undefined,
      endDate: undefined,
    });
    refresh({});
  };

  const exportToCSV = () => {
    const headers = ["Date", "Utilisateur", "Action", "Table", "Organisation", "ID Enregistrement"];
    const rows = logs.map(log => [
      format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss"),
      log.user_name || log.user_id || "Système",
      ACTION_CONFIG[log.action].label,
      TABLE_LABELS[log.table_name] || log.table_name,
      log.organisation_name || "-",
      log.record_id,
    ]);

    const csvContent = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (logs.length === 0) {
      toast.error("Aucun log à exporter");
      return;
    }
    exportAuditLogsPDF(logs, {
      tableName: filters.tableName || undefined,
      action: filters.action || undefined,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
    toast.success("Export PDF généré avec succès");
  };

  const renderDiff = (log: AuditLog) => {
    if (log.action === "CREATE") {
      return (
        <div className="space-y-2">
          <h4 className="font-medium text-green-600">Nouvelles données</h4>
          <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80">
            {JSON.stringify(log.new_data, null, 2)}
          </pre>
        </div>
      );
    }

    if (log.action === "DELETE") {
      return (
        <div className="space-y-2">
          <h4 className="font-medium text-red-600">Données supprimées</h4>
          <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80">
            {JSON.stringify(log.old_data, null, 2)}
          </pre>
        </div>
      );
    }

    // UPDATE - show diff
    const oldData = log.old_data || {};
    const newData = log.new_data || {};
    const allKeys = [...new Set([...Object.keys(oldData), ...Object.keys(newData)])];
    const changes = allKeys.filter(key => 
      JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])
    );

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-blue-600">Modifications ({changes.length} champs)</h4>
        <div className="space-y-3">
          {changes.map(key => (
            <div key={key} className="border rounded-md p-3">
              <div className="font-medium text-sm mb-2">{key}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  <div className="text-red-600 font-medium mb-1">Avant</div>
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(oldData[key], null, 2) || "null"}
                  </pre>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                  <div className="text-green-600 font-medium mb-1">Après</div>
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(newData[key], null, 2) || "null"}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Journal d'audit
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refresh({})} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Actualiser
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={logs.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF} disabled={logs.length === 0}>
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="dashboard" className="space-y-4">
            <TabsList>
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Tableau de bord
              </TabsTrigger>
              <TabsTrigger value="logs" className="gap-2">
                <List className="h-4 w-4" />
                Liste des logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <AuditActivityDashboard logs={logs} />
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          <Select value={filters.tableName} onValueChange={(v) => setFilters(f => ({ ...f, tableName: v }))}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Toutes les tables" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les tables</SelectItem>
              {AUDITED_TABLES.map(table => (
                <SelectItem key={table} value={table}>
                  {TABLE_LABELS[table] || table}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.action} onValueChange={(v) => setFilters(f => ({ ...f, action: v }))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toutes les actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les actions</SelectItem>
              <SelectItem value="CREATE">Création</SelectItem>
              <SelectItem value="UPDATE">Modification</SelectItem>
              <SelectItem value="DELETE">Suppression</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate ? format(filters.startDate, "dd/MM/yyyy") : "Date début"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.startDate}
                onSelect={(d) => setFilters(f => ({ ...f, startDate: d }))}
                locale={fr}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.endDate ? format(filters.endDate, "dd/MM/yyyy") : "Date fin"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.endDate}
                onSelect={(d) => setFilters(f => ({ ...f, endDate: d }))}
                locale={fr}
              />
            </PopoverContent>
          </Popover>

          <Button onClick={handleFilter}>Filtrer</Button>
          <Button variant="ghost" onClick={handleReset}>Réinitialiser</Button>
        </div>

        {/* Table */}
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead className="text-right">Détails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {loading ? "Chargement..." : "Aucun log d'audit trouvé"}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const actionConfig = ACTION_CONFIG[log.action];
                  const ActionIcon = actionConfig.icon;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        {log.user_name || log.user_id?.slice(0, 8) || "Système"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("gap-1", actionConfig.color)}>
                          <ActionIcon className="h-3 w-3" />
                          {actionConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {TABLE_LABELS[log.table_name] || log.table_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.organisation_name || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Détails du log d'audit
                {selectedLog && (
                  <Badge variant="outline" className={ACTION_CONFIG[selectedLog.action].color}>
                    {ACTION_CONFIG[selectedLog.action].label}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    <span className="font-medium">
                      {format(new Date(selectedLog.timestamp), "dd MMMM yyyy à HH:mm:ss", { locale: fr })}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Utilisateur:</span>{" "}
                    <span className="font-medium">{selectedLog.user_name || selectedLog.user_id || "Système"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Table:</span>{" "}
                    <span className="font-medium">{TABLE_LABELS[selectedLog.table_name] || selectedLog.table_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ID Enregistrement:</span>{" "}
                    <span className="font-mono text-xs">{selectedLog.record_id}</span>
                  </div>
                  {selectedLog.organisation_name && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Organisation:</span>{" "}
                      <span className="font-medium">{selectedLog.organisation_name}</span>
                    </div>
                  )}
                </div>
                <div className="border-t pt-4">
                  {renderDiff(selectedLog)}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
