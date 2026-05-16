import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Minus, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditAttempt {
  id: string;
  completed_at: string;
  score_percent: number;
  earned: number;
  possible: number;
  answered_questions: number;
  total_questions: number;
}

interface AuditComparisonWidgetProps {
  organisationId: string;
  auditType: string;
  currentAttemptId?: string;
}

export function AuditComparisonWidget({
  organisationId,
  auditType,
  currentAttemptId,
}: AuditComparisonWidgetProps) {
  const [attempts, setAttempts] = useState<AuditAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [compareId, setCompareId] = useState<string>('');

  useEffect(() => {
    const loadAttempts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('audit_attempts')
          .select('id, completed_at, score_percent, earned, possible, answered_questions, total_questions')
          .eq('organisation_id', organisationId)
          .eq('audit_type', auditType)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setAttempts(data || []);
        
        // Auto-select second attempt for comparison if available
        if (data && data.length > 1 && !compareId) {
          setCompareId(data[1].id);
        }
      } catch (error) {
        console.error('Error loading attempts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttempts();
  }, [organisationId, auditType]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (attempts.length < 2) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Comparaison d'audits</CardTitle>
          <CardDescription>
            Comparez vos résultats entre différentes tentatives d'audit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Complétez au moins 2 audits pour comparer les résultats
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentAttempt = attempts.find(a => a.id === currentAttemptId) || attempts[0];
  const compareAttempt = attempts.find(a => a.id === compareId);
  
  const scoreDiff = compareAttempt ? currentAttempt.score_percent - compareAttempt.score_percent : 0;

  const getTrendIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (diff < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendBadge = (diff: number) => {
    if (diff > 0) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">+{diff}%</Badge>;
    if (diff < 0) return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">{diff}%</Badge>;
    return <Badge variant="secondary">=</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Comparaison d'audits</CardTitle>
            <CardDescription>
              Évolution de votre score de conformité
            </CardDescription>
          </div>
          <Select value={compareId} onValueChange={setCompareId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Comparer avec..." />
            </SelectTrigger>
            <SelectContent>
              {attempts.slice(1).map((attempt) => (
                <SelectItem key={attempt.id} value={attempt.id}>
                  {format(new Date(attempt.completed_at), 'dd MMM yyyy', { locale: fr })} - {attempt.score_percent}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {compareAttempt && (
          <div className="space-y-6">
            {/* Score Comparison */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {format(new Date(compareAttempt.completed_at), 'dd/MM/yyyy', { locale: fr })}
                </p>
                <p className={cn("text-2xl font-bold", getScoreColor(compareAttempt.score_percent))}>
                  {compareAttempt.score_percent}%
                </p>
                <Progress value={compareAttempt.score_percent} className="h-2 mt-2" />
              </div>
              
              <div className="flex flex-col items-center justify-center">
                {getTrendIcon(scoreDiff)}
                {getTrendBadge(scoreDiff)}
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {format(new Date(currentAttempt.completed_at), 'dd/MM/yyyy', { locale: fr })}
                </p>
                <p className={cn("text-2xl font-bold", getScoreColor(currentAttempt.score_percent))}>
                  {currentAttempt.score_percent}%
                </p>
                <Progress value={currentAttempt.score_percent} className="h-2 mt-2" />
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-muted-foreground mb-2">Avant</p>
                <div className="space-y-1">
                  <p>Score : <strong>{compareAttempt.earned}/{compareAttempt.possible} pts</strong></p>
                  <p>Questions : <strong>{compareAttempt.answered_questions}/{compareAttempt.total_questions}</strong></p>
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-muted-foreground mb-2">Après</p>
                <div className="space-y-1">
                  <p>Score : <strong>{currentAttempt.earned}/{currentAttempt.possible} pts</strong></p>
                  <p>Questions : <strong>{currentAttempt.answered_questions}/{currentAttempt.total_questions}</strong></p>
                </div>
              </div>
            </div>

            {scoreDiff > 0 && (
              <p className="text-center text-sm text-green-600 font-medium">
                Bravo ! Votre conformité s'est améliorée de {scoreDiff} points.
              </p>
            )}
            {scoreDiff < 0 && (
              <p className="text-center text-sm text-amber-600 font-medium">
                Attention : votre score a diminué. Consultez le plan d'action.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
