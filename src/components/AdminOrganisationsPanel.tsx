import { Loader2, Building2, Search, MapPin, Users2, Briefcase, Download, CheckSquare } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SECTOR_LABELS, SIZE_LABELS, DPO_ROLE_LABELS } from '@/types/rgpd';
import type { AdminOrganisation } from '@/hooks/useAdminOrganisations';
import { exportGlobalBackup, downloadGlobalBackupAsJSON } from '@/services/exportOrganisationBackup';
import { useToast } from '@/hooks/use-toast';

interface AdminOrganisationsPanelProps {
  organisations: AdminOrganisation[];
  loading: boolean;
}

export const AdminOrganisationsPanel = ({ organisations, loading }: AdminOrganisationsPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0, orgName: '' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const filteredOrganisations = organisations.filter(org => {
    const query = searchQuery.toLowerCase();
    return (
      org.name.toLowerCase().includes(query) ||
      org.ownerEmail.toLowerCase().includes(query) ||
      org.ownerName.toLowerCase().includes(query) ||
      SECTOR_LABELS[org.sector].toLowerCase().includes(query)
    );
  });

  // Stats by sector
  const sectorCounts = organisations.reduce((acc, org) => {
    acc[org.sector] = (acc[org.sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Stats by size
  const sizeCounts = organisations.reduce((acc, org) => {
    acc[org.size] = (acc[org.size] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Check if all filtered organisations are selected
  const allFilteredSelected = useMemo(() => {
    return filteredOrganisations.length > 0 && 
      filteredOrganisations.every(org => selectedIds.has(org.id));
  }, [filteredOrganisations, selectedIds]);

  const someFilteredSelected = useMemo(() => {
    return filteredOrganisations.some(org => selectedIds.has(org.id)) && !allFilteredSelected;
  }, [filteredOrganisations, selectedIds, allFilteredSelected]);

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      // Deselect all filtered
      const newSelected = new Set(selectedIds);
      filteredOrganisations.forEach(org => newSelected.delete(org.id));
      setSelectedIds(newSelected);
    } else {
      // Select all filtered
      const newSelected = new Set(selectedIds);
      filteredOrganisations.forEach(org => newSelected.add(org.id));
      setSelectedIds(newSelected);
    }
  };

  const toggleSelect = (orgId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(orgId)) {
      newSelected.delete(orgId);
    } else {
      newSelected.add(orgId);
    }
    setSelectedIds(newSelected);
  };

  const handleGlobalExport = async () => {
    const idsToExport = selectedIds.size > 0 
      ? Array.from(selectedIds) 
      : organisations.map(o => o.id);
    
    if (idsToExport.length === 0) return;
    
    setIsExporting(true);
    setExportProgress({ current: 0, total: idsToExport.length, orgName: '' });
    
    try {
      const backup = await exportGlobalBackup(idsToExport, (current, total, orgName) => {
        setExportProgress({ current, total, orgName: orgName || '' });
      });
      downloadGlobalBackupAsJSON(backup);
      
      toast({
        title: "Export réussi",
        description: `Sauvegarde de ${backup.totalOrganisations} organisation(s) téléchargée`,
      });
    } catch (error: any) {
      console.error('Error exporting global backup:', error);
      toast({
        title: "Erreur d'export",
        description: error.message || "Une erreur est survenue lors de l'export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportProgress({ current: 0, total: 0, orgName: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{organisations.length}</p>
              <p className="text-sm text-muted-foreground">Organisations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <MapPin className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Object.keys(sectorCounts).length}</p>
              <p className="text-sm text-muted-foreground">Secteurs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <Users2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {new Set(organisations.map(o => o.user_id)).size}
              </p>
              <p className="text-sm text-muted-foreground">Propriétaires</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
              <Briefcase className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sizeCounts['groupe'] || 0}</p>
              <p className="text-sm text-muted-foreground">Groupes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organisations Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Organisations inscrites</CardTitle>
                <CardDescription>
                  Liste de toutes les organisations sur la plateforme
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <CheckSquare className="h-3 w-3" />
                  {selectedIds.size} sélectionnée(s)
                </Badge>
              )}
              <Button
                onClick={handleGlobalExport}
                disabled={isExporting || organisations.length === 0}
                variant="outline"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Export en cours...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {selectedIds.size > 0 
                      ? `Exporter ${selectedIds.size} org.` 
                      : 'Sauvegarde globale'}
                  </>
                )}
              </Button>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          
          {/* Progress bar for export */}
          {isExporting && exportProgress.total > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Export: {exportProgress.current} / {exportProgress.total} organisations
                </span>
                <span className="font-medium">
                  {Math.round((exportProgress.current / exportProgress.total) * 100)}%
                </span>
              </div>
              <Progress 
                value={(exportProgress.current / exportProgress.total) * 100} 
                className="h-2"
              />
              {exportProgress.orgName && (
                <p className="text-xs text-muted-foreground truncate">
                  Traitement: {exportProgress.orgName}
                </p>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOrganisations.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                {searchQuery ? 'Aucune organisation trouvée' : 'Aucune organisation inscrite'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allFilteredSelected}
                        ref={(el) => {
                          if (el) {
                            (el as any).indeterminate = someFilteredSelected;
                          }
                        }}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Sélectionner tout"
                      />
                    </TableHead>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Secteur</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Rôle DPO</TableHead>
                    <TableHead>Propriétaire</TableHead>
                    <TableHead>Inscrit le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrganisations.map((org) => (
                    <TableRow 
                      key={org.id}
                      className={selectedIds.has(org.id) ? 'bg-muted/50' : ''}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(org.id)}
                          onCheckedChange={() => toggleSelect(org.id)}
                          aria-label={`Sélectionner ${org.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{org.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {SECTOR_LABELS[org.sector]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {SIZE_LABELS[org.size]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {DPO_ROLE_LABELS[org.dpoRole]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{org.ownerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {org.ownerEmail || 'Email non disponible'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {org.createdAt.toLocaleDateString('fr-FR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sector Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Répartition par secteur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(SECTOR_LABELS).map(([key, label]) => {
              const count = sectorCounts[key] || 0;
              const percentage = organisations.length > 0 
                ? Math.round((count / organisations.length) * 100) 
                : 0;
              
              return (
                <div 
                  key={key} 
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="text-sm">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{count}</span>
                    <span className="text-xs text-muted-foreground">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
