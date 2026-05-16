import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  History, 
  Calendar, 
  Eye, 
  GitCompare,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuditAttempts, AuditAttempt, AuditAttemptSection } from '@/hooks/useAuditAttempts';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AuditAttemptsHistoryProps {
  organisationId: string;
  auditType: string;
  onSelectAttempt?: (attempt: AuditAttempt) => void;
}

export function AuditAttemptsHistory({ 
  organisationId, 
  auditType,
  onSelectAttempt 
}: AuditAttemptsHistoryProps) {
  const { 
    isLoading, 
    getAttemptHistory, 
    getAttemptSections,
    deleteAttempt 
  } = useAuditAttempts();
  
  const [attempts, setAttempts] = useState<AuditAttempt[]>([]);
  const [sectionsMap, setSectionsMap] = useState<Record<string, AuditAttemptSection[]>>({});
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);
  const [loadingSections, setLoadingSections] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load attempts on mount
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const history = await getAttemptHistory(organisationId, auditType);
      setAttempts(history);
      setLoading(false);
    };
    loadHistory();
  }, [organisationId, auditType, getAttemptHistory]);

  // Load sections when expanding an attempt
  const handleExpandAttempt = async (attemptId: string) => {
    if (expandedAttempt === attemptId) {
      setExpandedAttempt(null);
      return;
    }
    
    setExpandedAttempt(attemptId);
    
    if (!sectionsMap[attemptId]) {
      setLoadingSections(attemptId);
      const sections = await getAttemptSections(attemptId);
      setSectionsMap(prev => ({ ...prev, [attemptId]: sections }));
      setLoadingSections(null);
    }
  };

  // Toggle selection for comparison
  const toggleCompareSelection = (attemptId: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(attemptId)) {
        return prev.filter(id => id !== attemptId);
      }
      if (prev.length >= 2) {
        return [prev[1], attemptId];
      }
      return [...prev, attemptId];
    });
  };

  // Handle delete
  const handleDelete = async (attemptId: string) => {
    const success = await deleteAttempt(attemptId);
    if (success) {
      setAttempts(prev => prev.filter(a => a.id !== attemptId));
      setSelectedForCompare(prev => prev.filter(id => id !== attemptId));
    }
  };

  // Get comparison data
  const comparisonData = useMemo(() => {
    if (selectedForCompare.length !== 2) return null;
    
    const [attempt1, attempt2] = selectedForCompare.map(id => 
      attempts.find(a => a.id === id)
    ).filter(Boolean) as AuditAttempt[];
    
    if (!attempt1 || !attempt2) return null;

    // Sort by date (older first)
    const sorted = [attempt1, attempt2].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    
    const older = sorted[0];
    const newer = sorted[1];
    
    const scoreDiff = newer.scorePercent - older.scorePercent;
    
    return {
      older,
      newer,
      scoreDiff,
      sections1: sectionsMap[older.id] || [],
      sections2: sectionsMap[newer.id] || [],
    };
  }, [selectedForCompare, attempts, sectionsMap]);

  // Get trend icon
  const getTrendIcon = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    if (current > previous) return <TrendingUp className="h-4 w-4 text-status-conforme" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-status-non-conforme" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Historique des tentatives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Chargement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (attempts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Historique des tentatives
          </CardTitle>
          <CardDescription>
            Suivi de l'évolution de la conformité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mb-3 opacity-50" />
            <p>Aucune tentative d'audit</p>
            <p className="text-sm">Complétez le questionnaire pour créer une tentative</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main history panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                Historique des tentatives
              </CardTitle>
              <CardDescription>
                {attempts.length} tentative{attempts.length > 1 ? 's' : ''} d'audit
                {selectedForCompare.length > 0 && (
                  <span className="ml-2">
                    • {selectedForCompare.length}/2 sélectionnées pour comparaison
                  </span>
                )}
              </CardDescription>
            </div>
            {selectedForCompare.length === 2 && (
              <Badge className="bg-primary text-primary-foreground">
                <GitCompare className="h-3 w-3 mr-1" />
                Comparaison active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[450px] pr-4">
            <div className="space-y-3">
              {attempts.map((attempt, index) => {
                const previousAttempt = attempts[index + 1];
                const isExpanded = expandedAttempt === attempt.id;
                const isSelected = selectedForCompare.includes(attempt.id);
                const sections = sectionsMap[attempt.id] || [];

                return (
                  <Collapsible 
                    key={attempt.id} 
                    open={isExpanded}
                    onOpenChange={() => handleExpandAttempt(attempt.id)}
                  >
                    <div
                      className={cn(
                        "rounded-lg border transition-all",
                        isSelected && "ring-2 ring-primary border-primary",
                        "hover:bg-muted/30"
                      )}
                    >
                      {/* Header */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleCompareSelection(attempt.id)}
                              className="mt-1"
                            />
                            <div>
                              <p className="text-sm font-medium">
                                {format(attempt.completedAt || attempt.createdAt, 'PPP à HH:mm', { locale: fr })}
                              </p>
                              <div className="flex gap-2 mt-1">
                                {index === 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    Dernière tentative
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="flex items-center gap-1 justify-end">
                                <span className="text-2xl font-bold">{attempt.scorePercent}%</span>
                                {getTrendIcon(attempt.scorePercent, previousAttempt?.scorePercent)}
                              </div>
                              <p className="text-xs text-muted-foreground">conformité</p>
                            </div>
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{attempt.answeredQuestions} questions</span>
                            <span>•</span>
                            <span>Score: {attempt.earned}/{attempt.possible}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {onSelectAttempt && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectAttempt(attempt);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Voir
                              </Button>
                            )}
                            
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer cette tentative ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action est irréversible. Les réponses et scores associés seront définitivement supprimés.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(attempt.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <Progress value={attempt.scorePercent} className="h-2 mt-3" />
                      </div>

                      {/* Expanded content - Sections */}
                      <CollapsibleContent>
                        <div className="border-t px-4 py-3 bg-muted/30">
                          {loadingSections === attempt.id ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span className="text-sm text-muted-foreground">Chargement des sections...</span>
                            </div>
                          ) : sections.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Score par section
                              </p>
                              {sections.map(section => (
                                <div key={section.id} className="flex items-center justify-between text-sm">
                                  <span className="truncate flex-1 mr-2">{section.sectionTitle}</span>
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant="outline"
                                      className={cn(
                                        section.conformStatus === 'conforme' && 'border-status-conforme text-status-conforme',
                                        section.conformStatus === 'partiel' && 'border-status-partiel text-status-partiel',
                                        section.conformStatus === 'non_conforme' && 'border-status-non-conforme text-status-non-conforme',
                                      )}
                                    >
                                      {section.percent}%
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              Aucun détail disponible
                            </p>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Comparison panel */}
      {comparisonData && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-primary" />
              Comparaison des tentatives
            </CardTitle>
            <CardDescription>
              Évolution entre {format(comparisonData.older.completedAt || comparisonData.older.createdAt, 'PP', { locale: fr })} et {format(comparisonData.newer.completedAt || comparisonData.newer.createdAt, 'PP', { locale: fr })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Score comparison */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Ancienne</p>
                <p className="text-3xl font-bold">{comparisonData.older.scorePercent}%</p>
                <p className="text-xs text-muted-foreground">
                  {format(comparisonData.older.completedAt || comparisonData.older.createdAt, 'PP', { locale: fr })}
                </p>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <div className={cn(
                  "flex items-center gap-1 text-2xl font-bold",
                  comparisonData.scoreDiff > 0 && "text-status-conforme",
                  comparisonData.scoreDiff < 0 && "text-status-non-conforme",
                  comparisonData.scoreDiff === 0 && "text-muted-foreground"
                )}>
                  {comparisonData.scoreDiff > 0 ? (
                    <>
                      <TrendingUp className="h-6 w-6" />
                      +{comparisonData.scoreDiff}%
                    </>
                  ) : comparisonData.scoreDiff < 0 ? (
                    <>
                      <TrendingDown className="h-6 w-6" />
                      {comparisonData.scoreDiff}%
                    </>
                  ) : (
                    <>
                      <Minus className="h-6 w-6" />
                      0%
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Évolution</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Nouvelle</p>
                <p className="text-3xl font-bold">{comparisonData.newer.scorePercent}%</p>
                <p className="text-xs text-muted-foreground">
                  {format(comparisonData.newer.completedAt || comparisonData.newer.createdAt, 'PP', { locale: fr })}
                </p>
              </div>
            </div>

            {/* Section comparison */}
            {comparisonData.sections1.length > 0 && comparisonData.sections2.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Évolution par section</p>
                {comparisonData.sections2.map(newSection => {
                  const oldSection = comparisonData.sections1.find(
                    s => s.sectionId === newSection.sectionId
                  );
                  const diff = oldSection ? newSection.percent - oldSection.percent : null;
                  
                  return (
                    <div key={newSection.id} className="flex items-center justify-between text-sm">
                      <span className="truncate flex-1 mr-2">{newSection.sectionTitle}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          {oldSection?.percent ?? '—'}%
                        </span>
                        <span>→</span>
                        <span className="font-medium">{newSection.percent}%</span>
                        {diff !== null && (
                          <Badge 
                            variant="outline"
                            className={cn(
                              "min-w-[50px] justify-center",
                              diff > 0 && "border-status-conforme text-status-conforme",
                              diff < 0 && "border-status-non-conforme text-status-non-conforme",
                              diff === 0 && "border-muted-foreground text-muted-foreground"
                            )}
                          >
                            {diff > 0 ? `+${diff}` : diff}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setSelectedForCompare([])}
            >
              Réinitialiser la comparaison
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
