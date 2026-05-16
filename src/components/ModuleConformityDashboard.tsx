import { useMemo } from 'react';
import { Organisation, AuditModule, SECTOR_LABELS } from '@/types/rgpd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  AlertTriangle, 
  Users, 
  Building, 
  Cookie, 
  ShieldAlert, 
  BarChart3, 
  FileSearch,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Target,
  ClipboardList,
  Loader2,
  RefreshCw,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuditResultsData } from '@/hooks/useAuditResults';

interface ModuleConformityDashboardProps {
  organisation: Organisation;
  modules: AuditModule[];
  onModuleClick?: (module: AuditModule) => void;
  auditResults?: AuditResultsData;
  isLoading?: boolean;
  onStartAudit?: () => void;
  onRestartAudit?: () => void;
  onSendToClient?: () => void;
}

const moduleIcons: Record<string, React.ReactNode> = {
  'ropa': <FileText className="h-5 w-5" />,
  'violations': <AlertTriangle className="h-5 w-5" />,
  'droits': <Users className="h-5 w-5" />,
  'soustraitants': <Building className="h-5 w-5" />,
  'cookies': <Cookie className="h-5 w-5" />,
  'securite': <ShieldAlert className="h-5 w-5" />,
  'risques': <BarChart3 className="h-5 w-5" />,
  'aipd': <FileSearch className="h-5 w-5" />,
};

const sectionIcons: Record<string, React.ReactNode> = {
  'gouvernance': <ShieldAlert className="h-5 w-5" />,
  'documentation': <FileText className="h-5 w-5" />,
  'droits': <Users className="h-5 w-5" />,
  'securite': <ShieldAlert className="h-5 w-5" />,
  'donnees': <BarChart3 className="h-5 w-5" />,
  'sante': <FileSearch className="h-5 w-5" />,
  'pharmacie': <Building className="h-5 w-5" />,
};

export function ModuleConformityDashboard({ 
  organisation, 
  modules, 
  onModuleClick,
  auditResults,
  isLoading = false,
  onStartAudit,
  onRestartAudit,
  onSendToClient
}: ModuleConformityDashboardProps) {
  
  // Use persisted audit results - NEVER recalculate
  const hasData = auditResults?.hasCompletedAudit ?? false;
  const sections = auditResults?.sections || [];

  const getConformityColor = (percent: number) => {
    if (percent >= 75) return 'text-green-600 dark:text-green-400';
    if (percent >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 75) return 'bg-green-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'conforme':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Conforme</Badge>;
      case 'partiel':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Partiel</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Non conforme</Badge>;
    }
  };

  // Sort sections by percentage (lowest first for priority)
  const sortedSections = [...sections].sort((a, b) => a.percent - b.percent);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Chargement des données...</span>
      </div>
    );
  }

  // No audit completed state
  if (!hasData) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun audit terminé</h3>
          <p className="text-muted-foreground text-center mb-4 max-w-md">
            Complétez le questionnaire de conformité pour voir votre score et les recommandations
          </p>
          {onStartAudit && (
            <Button onClick={onStartAudit}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Démarrer le questionnaire
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex justify-end gap-2">
        {onSendToClient && (
          <Button variant="outline" onClick={onSendToClient}>
            <Mail className="h-4 w-4 mr-2" />
            Envoyer au client
          </Button>
        )}
        {onRestartAudit && (
          <Button variant="outline" onClick={onRestartAudit}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refaire l'audit
          </Button>
        )}
      </div>

      {/* En-tête avec score global */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Score de conformité global
          </CardTitle>
          <CardDescription>
            {SECTOR_LABELS[organisation.sector]} - {organisation.name}
            {auditResults?.completedAt && (
              <span className="ml-2 text-xs">
                • Dernière évaluation : {new Date(auditResults.completedAt).toLocaleDateString('fr-FR')}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            {/* Score global */}
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-background/50">
              <div className={cn(
                "text-5xl font-bold",
                getConformityColor(auditResults?.complianceScore || 0)
              )}>
                {auditResults?.complianceScore || 0}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">Conformité RGPD</p>
            </div>

            {/* Répartition des statuts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Conformes</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {auditResults?.conformeCount || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Partiels</span>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  {auditResults?.partielCount || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Non conformes</span>
                </div>
                <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  {auditResults?.nonConformeCount || 0}
                </Badge>
              </div>
            </div>

            {/* Questions répondues */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Questions répondues</span>
              </div>
              <div className="text-3xl font-bold">
                {auditResults?.answeredQuestions || 0}/{auditResults?.totalQuestions || 0}
              </div>
              <Progress 
                value={auditResults?.totalQuestions ? (auditResults.answeredQuestions / auditResults.totalQuestions) * 100 : 0} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {auditResults?.totalQuestions ? Math.round((auditResults.answeredQuestions / auditResults.totalQuestions) * 100) : 0}% complétées
              </p>
            </div>

            {/* Risques */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Risques élevés</span>
              </div>
              <div className={cn(
                "text-3xl font-bold",
                (auditResults?.risksHigh || 0) > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
              )}>
                {auditResults?.risksHigh || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {(auditResults?.risksHigh || 0) > 0 
                  ? "Éléments à traiter en priorité" 
                  : "Aucun risque élevé identifié"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conformité par section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Conformité par section
          </CardTitle>
          <CardDescription>
            Détail des scores par domaine d'audit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedSections.map((section) => (
              <div 
                key={section.sectionId}
                className="p-4 rounded-lg border transition-all hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "p-2 rounded-lg",
                      section.percent >= 75 ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
                      section.percent >= 50 ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" :
                      "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {sectionIcons[section.sectionId.toLowerCase()] || <FileText className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium truncate">{section.sectionTitle}</h4>
                      <p className="text-xs text-muted-foreground">
                        {section.conformeCount} conformes • {section.partielCount} partiels • {section.nonConformeCount} non conformes
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    {/* Barre de progression */}
                    <div className="w-24 hidden md:block">
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={cn("h-full transition-all", getProgressColor(section.percent))}
                          style={{ width: `${section.percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Score */}
                    <div className={cn(
                      "text-lg font-bold w-14 text-right",
                      getConformityColor(section.percent)
                    )}>
                      {section.percent}%
                    </div>

                    {/* Badge risque */}
                    {section.highRiskCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {section.highRiskCount} risque{section.highRiskCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Barre de progression mobile */}
                <div className="mt-3 md:hidden">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={cn("h-full transition-all", getProgressColor(section.percent))}
                      style={{ width: `${section.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sections prioritaires */}
      {sortedSections.filter(s => s.percent < 50).length > 0 && (
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Sections prioritaires
            </CardTitle>
            <CardDescription>
              Ces sections nécessitent une attention immédiate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sortedSections.filter(s => s.percent < 50).map((section) => (
                <div
                  key={section.sectionId}
                  className="p-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {sectionIcons[section.sectionId.toLowerCase()] || <FileText className="h-4 w-4" />}
                      <span className="font-medium text-sm">{section.sectionTitle}</span>
                    </div>
                    <span className="text-red-600 dark:text-red-400 font-bold">
                      {section.percent}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {section.nonConformeCount} élément{section.nonConformeCount > 1 ? 's' : ''} non conforme{section.nonConformeCount > 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
