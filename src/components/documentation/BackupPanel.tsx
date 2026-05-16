import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Download, 
  HardDrive, 
  Shield, 
  Clock, 
  FileJson, 
  CheckCircle2,
  Loader2,
  Database,
  Info,
  AlertTriangle,
  Upload,
  FileUp,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  exportOrganisationBackup, 
  downloadBackupAsJSON, 
  getBackupStats, 
  OrganisationBackup,
  validateBackupFile,
  restoreOrganisationBackup,
  RestoreResult
} from '@/services/exportOrganisationBackup';

interface BackupPanelProps {
  organisationId: string;
  organisationName: string;
}

export function BackupPanel({ organisationId, organisationName }: BackupPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupStats, setBackupStats] = useState<{ totalRecords: number; details: { label: string; count: number }[] } | null>(null);
  const [pendingBackup, setPendingBackup] = useState<OrganisationBackup | null>(null);
  const [pendingBackupStats, setPendingBackupStats] = useState<{ totalRecords: number; details: { label: string; count: number }[] } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExport = async () => {
    if (!organisationId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une organisation',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      const backup = await exportOrganisationBackup(organisationId);
      setBackupStats(getBackupStats(backup));
      downloadBackupAsJSON(backup, organisationName);
      
      toast({
        title: 'Sauvegarde réussie',
        description: 'Le fichier de sauvegarde a été téléchargé',
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast({
        title: 'Format invalide',
        description: 'Veuillez sélectionner un fichier JSON',
        variant: 'destructive',
      });
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const validation = validateBackupFile(data);
      if (!validation.valid) {
        toast({
          title: 'Fichier invalide',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      const backup = data as OrganisationBackup;
      setPendingBackup(backup);
      setPendingBackupStats(getBackupStats(backup));
      setShowConfirmDialog(true);
    } catch (error) {
      toast({
        title: 'Erreur de lecture',
        description: 'Impossible de lire le fichier JSON',
        variant: 'destructive',
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRestore = async () => {
    if (!pendingBackup || !organisationId) return;

    setIsRestoring(true);
    setShowConfirmDialog(false);

    try {
      const result = await restoreOrganisationBackup(pendingBackup, organisationId);
      setRestoreResult(result);
      setShowResultDialog(true);

      if (result.success) {
        toast({
          title: 'Restauration réussie',
          description: 'Les données ont été importées avec succès',
        });
      } else {
        toast({
          title: 'Restauration partielle',
          description: `${result.errors.length} erreur(s) rencontrée(s)`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de la restauration',
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(false);
      setPendingBackup(null);
      setPendingBackupStats(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Sauvegarde des données
          </h2>
          <p className="text-muted-foreground">
            Exportez et restaurez les données de votre organisation
          </p>
        </div>
      </div>

      {/* Cartes export et import côte à côte */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Carte export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Export des données
            </CardTitle>
            <CardDescription>
              Téléchargez toutes les données de "{organisationName}"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Données sécurisées</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileJson className="h-4 w-4 text-orange-500" />
                <span>Format JSON</span>
              </div>
            </div>

            <Button 
              onClick={handleExport} 
              disabled={isExporting || !organisationId}
              className="w-full"
              size="lg"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Export en cours...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger la sauvegarde
                </>
              )}
            </Button>

            {backupStats && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Dernier export</span>
                  <Badge variant="secondary" className="ml-auto">{backupStats.totalRecords} enr.</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Carte import/restauration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Restauration des données
            </CardTitle>
            <CardDescription>
              Importez les données depuis un fichier de sauvegarde
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                La restauration ajoute les données du fichier sans supprimer les données existantes.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={triggerFileInput} 
              disabled={isRestoring || !organisationId}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isRestoring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restauration en cours...
                </>
              ) : (
                <>
                  <FileUp className="mr-2 h-4 w-4" />
                  Importer un fichier JSON
                </>
              )}
            </Button>

            <div className="text-xs text-muted-foreground text-center">
              Formats acceptés : .json
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Données incluses */}
      <Card>
        <CardHeader>
          <CardTitle>Données incluses</CardTitle>
          <CardDescription>
            Liste des données exportées et restaurables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Audits', desc: 'Scores et statuts' },
              { label: 'Modules', desc: 'Structure audit' },
              { label: 'Éléments', desc: 'Points de contrôle' },
              { label: 'Actions', desc: 'Plans d\'action' },
              { label: 'Traitements', desc: 'Registre Art. 30' },
              { label: 'Violations', desc: 'Incidents données' },
              { label: 'Droits', desc: 'Demandes RGPD' },
              { label: 'Sous-traitants', desc: 'Registre ST' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg border">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{item.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentation sauvegarde externe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Sauvegarde sur disque externe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Badge className="shrink-0 mt-0.5">1</Badge>
              <span>Téléchargez la sauvegarde JSON</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge className="shrink-0 mt-0.5">2</Badge>
              <span>Copiez le fichier sur votre disque externe</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge className="shrink-0 mt-0.5">3</Badge>
              <span>Conservez le disque dans un lieu sécurisé</span>
            </li>
          </ol>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Sécurité</AlertTitle>
            <AlertDescription className="text-sm">
              Chiffrez votre disque externe et effectuez une sauvegarde mensuelle minimum.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Fréquence recommandée */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Fréquence recommandée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg border text-center">
              <div className="text-xl font-bold text-primary">Hebdomadaire</div>
              <p className="text-xs text-muted-foreground mt-1">Activité régulière</p>
            </div>
            <div className="p-4 rounded-lg border text-center bg-primary/5">
              <div className="text-xl font-bold text-primary">Mensuelle</div>
              <p className="text-xs text-muted-foreground mt-1">Minimum recommandé</p>
              <Badge className="mt-2">Recommandé</Badge>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <div className="text-xl font-bold text-primary">Trimestrielle</div>
              <p className="text-xs text-muted-foreground mt-1">Faible volume</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmation */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Confirmer la restauration
            </DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d'importer des données dans "{organisationName}"
            </DialogDescription>
          </DialogHeader>

          {pendingBackupStats && (
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Fichier de sauvegarde</span>
                  <Badge>{pendingBackupStats.totalRecords} enregistrements</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Date d'export : {pendingBackup?.exportDate ? new Date(pendingBackup.exportDate).toLocaleString('fr-FR') : 'N/A'}
                </div>
              </div>

              <div className="grid gap-2 grid-cols-2">
                {pendingBackupStats.details.filter(d => d.count > 0).map((detail) => (
                  <div key={detail.label} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground">{detail.label}</span>
                    <Badge variant="outline">{detail.count}</Badge>
                  </div>
                ))}
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Les données seront ajoutées à l'organisation actuelle. Les données existantes ne seront pas supprimées.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleRestore}>
              <Upload className="mr-2 h-4 w-4" />
              Restaurer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de résultat */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {restoreResult?.success ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Restauration réussie
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Restauration partielle
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {restoreResult && (
            <div className="space-y-4">
              <div className="grid gap-2 grid-cols-2">
                {[
                  { label: 'Audits', count: restoreResult.imported.audits },
                  { label: 'Modules', count: restoreResult.imported.auditModules },
                  { label: 'Éléments', count: restoreResult.imported.auditItems },
                  { label: 'Actions', count: restoreResult.imported.auditActions },
                  { label: 'Traitements', count: restoreResult.imported.processingRecords },
                  { label: 'Violations', count: restoreResult.imported.dataBreaches },
                  { label: 'Demandes', count: restoreResult.imported.rightsRequests },
                  { label: 'Sous-traitants', count: restoreResult.imported.subprocessors },
                ].filter(item => item.count > 0).map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm p-2 bg-green-50 dark:bg-green-950/20 rounded">
                    <span>{item.label}</span>
                    <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30">
                      +{item.count}
                    </Badge>
                  </div>
                ))}
              </div>

              {restoreResult.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-destructive">
                    Erreurs ({restoreResult.errors.length})
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {restoreResult.errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-destructive">
                        <XCircle className="h-3 w-3 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    ))}
                    {restoreResult.errors.length > 5 && (
                      <div className="text-xs text-muted-foreground">
                        ... et {restoreResult.errors.length - 5} autres erreurs
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
