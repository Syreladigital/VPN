import { useState, useMemo } from 'react';
import { 
  flashAuditQuestions, 
  FlashAuditAnswer, 
  FlashAuditCategory,
  FLASH_AUDIT_CATEGORIES,
  generateFlashAuditReport,
  FlashAuditAlert
} from '@/data/auditFlashPharmacie';
import { useFlashAuditResults, FlashAuditResult } from '@/hooks/useFlashAuditResults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2,
  FileText,
  Download,
  RotateCcw,
  Zap,
  Shield,
  Eye,
  MapPin,
  Save,
  History,
  Trash2,
  Loader2,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';

interface AuditFlashPharmacieProps {
  organisationId?: string;
  organisationName?: string;
  onComplete?: (alerts: FlashAuditAlert[]) => void;
  onBack?: () => void;
}

type AnswerValue = 'yes' | 'no' | 'partial' | 'unknown';

export function AuditFlashPharmacie({ 
  organisationId,
  organisationName = "Officine",
  onComplete,
  onBack 
}: AuditFlashPharmacieProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, FlashAuditAnswer>>({});
  const [showReport, setShowReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'history'>('audit');
  const [viewingHistoryItem, setViewingHistoryItem] = useState<FlashAuditResult | null>(null);

  const { 
    results: historyResults, 
    isLoading: historyLoading, 
    saveFlashAudit, 
    deleteFlashAudit,
    isSaving,
    isDeleting
  } = useFlashAuditResults(organisationId || '');

  const categories = Object.keys(FLASH_AUDIT_CATEGORIES) as FlashAuditCategory[];
  const currentCategory = categories[currentCategoryIndex];
  
  const categoryQuestions = useMemo(() => 
    flashAuditQuestions.filter(q => q.category === currentCategory),
    [currentCategory]
  );

  const progress = useMemo(() => {
    const answered = Object.keys(answers).length;
    return (answered / flashAuditQuestions.length) * 100;
  }, [answers]);

  const categoryProgress = useMemo(() => {
    const categoryAnswers = categoryQuestions.filter(q => answers[q.id]);
    return (categoryAnswers.length / categoryQuestions.length) * 100;
  }, [categoryQuestions, answers]);

  const report = useMemo(() => {
    if (!showReport) return null;
    return generateFlashAuditReport(Object.values(answers));
  }, [showReport, answers]);

  const handleAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        answer: value,
        notes: prev[questionId]?.notes,
      }
    }));
  };

  const handleNotes = (questionId: string, notes: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        answer: prev[questionId]?.answer || 'unknown',
        notes,
      }
    }));
  };

  const handleNext = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
    }
  };

  const handleGenerateReport = async () => {
    const reportData = generateFlashAuditReport(Object.values(answers));
    setShowReport(true);
    
    // Save to database if we have an organisation
    if (organisationId) {
      await saveFlashAudit({
        organisationId,
        auditType: 'pharmacy',
        answers: Object.values(answers),
        alerts: reportData.alerts,
        flowMap: reportData.flowMap,
        summary: reportData.summary,
      });
    }
    
    if (onComplete) {
      onComplete(reportData.alerts);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setShowReport(false);
    setCurrentCategoryIndex(0);
    setViewingHistoryItem(null);
  };

  const exportToPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AUDIT FLASH PHARMACIE', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(organisationName, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, yPos, { align: 'center' });
    doc.setTextColor(0);
    yPos += 15;

    // Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SYNTHÈSE DES ALERTES', 14, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 53, 69);
    doc.text(`🔴 Critiques : ${report.summary.critical}`, 14, yPos);
    yPos += 6;
    doc.setTextColor(255, 152, 0);
    doc.text(`🟠 Sensibles : ${report.summary.sensitive}`, 14, yPos);
    yPos += 6;
    doc.setTextColor(76, 175, 80);
    doc.text(`🟢 Acceptables : ${report.summary.acceptable}`, 14, yPos);
    doc.setTextColor(0);
    yPos += 15;

    // Alerts
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAIL DES POINTS D\'ALERTE', 14, yPos);
    yPos += 10;

    for (const alert of report.alerts) {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      const severityIcon = alert.severity === 'critical' ? '🔴' : 
                          alert.severity === 'sensitive' ? '🟠' : '🟢';
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${severityIcon} ${alert.question.question}`, 14, yPos, { maxWidth: pageWidth - 28 });
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Risque : ${alert.question.controlScenario}`, 14, yPos, { maxWidth: pageWidth - 28 });
      yPos += 6;
      doc.text(`Exposition : ${alert.question.exposureLevel}`, 14, yPos, { maxWidth: pageWidth - 28 });
      doc.setTextColor(0);
      yPos += 10;
    }

    // Conclusion
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.text(
      '« Voici ce qui, aujourd\'hui, pourrait vous exposer sans que vous en ayez conscience. À vous de décider si cela mérite d\'aller plus loin. »',
      14, yPos, { maxWidth: pageWidth - 28 }
    );

    doc.save(`audit-flash-pharmacie-${organisationName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const getSeverityBadge = (severity: 'critical' | 'sensitive' | 'acceptable') => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Critique</Badge>;
      case 'sensitive':
        return <Badge className="gap-1 bg-orange-500 hover:bg-orange-600"><AlertTriangle className="h-3 w-3" />Sensible</Badge>;
      case 'acceptable':
        return <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" />Acceptable</Badge>;
    }
  };

  // Function to render report content (reusable for current and history view)
  const renderReportContent = (reportData: ReturnType<typeof generateFlashAuditReport>, historyDate?: string) => (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{reportData.summary.critical}</p>
                <p className="text-sm text-red-600 dark:text-red-500">Points critiques</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{reportData.summary.sensitive}</p>
                <p className="text-sm text-orange-600 dark:text-orange-500">Points sensibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{reportData.summary.acceptable}</p>
                <p className="text-sm text-green-600 dark:text-green-500">Points acceptables</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flow Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Cartographie des flux à risque
          </CardTitle>
          <CardDescription>
            Vue d'ensemble des zones d'exposition par domaine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(cat => {
              const catInfo = FLASH_AUDIT_CATEGORIES[cat];
              const flowData = reportData.flowMap[cat];
              const hasIssues = flowData?.issues > 0;
              
              return (
                <div 
                  key={cat}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-colors",
                    hasIssues 
                      ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950" 
                      : "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{catInfo.icon}</span>
                    <span className="font-medium text-sm">{catInfo.label}</span>
                  </div>
                  <p className={cn(
                    "text-2xl font-bold",
                    hasIssues ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                  )}>
                    {flowData?.issues || 0} alerte{(flowData?.issues || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Points d'alerte détaillés
          </CardTitle>
          <CardDescription>
            {reportData.alerts.length} point{reportData.alerts.length !== 1 ? 's' : ''} identifié{reportData.alerts.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4 pr-4">
              {reportData.alerts.map((alert, idx) => (
                <div key={alert.question.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-lg font-bold text-muted-foreground">
                        #{idx + 1}
                      </span>
                      <div className="space-y-1">
                        <p className="font-medium">{alert.question.question}</p>
                        <p className="text-sm text-muted-foreground">{alert.question.description}</p>
                      </div>
                    </div>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Scénario de contrôle</p>
                      <p>{alert.question.controlScenario}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Niveau d'exposition</p>
                      <p className={cn(
                        alert.severity === 'critical' && "text-red-600 dark:text-red-400 font-medium",
                        alert.severity === 'sensitive' && "text-orange-600 dark:text-orange-400"
                      )}>
                        {alert.question.exposureLevel}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {reportData.alerts.length === 0 && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Excellent !</AlertTitle>
                  <AlertDescription>
                    Aucune alerte majeure détectée. Vos pratiques semblent bien maîtrisées.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Conclusion */}
      <Alert className="bg-muted/50 border-primary/20">
        <Shield className="h-4 w-4" />
        <AlertTitle>Conclusion</AlertTitle>
        <AlertDescription className="italic">
          « Voici ce qui, aujourd'hui, pourrait vous exposer sans que vous en ayez conscience. 
          À vous de décider si cela mérite d'aller plus loin. »
        </AlertDescription>
      </Alert>
    </>
  );

  // View a history item
  if (viewingHistoryItem) {
    const historyReport = {
      alerts: viewingHistoryItem.alerts,
      summary: {
        critical: viewingHistoryItem.critical_count,
        sensitive: viewingHistoryItem.sensitive_count,
        acceptable: viewingHistoryItem.acceptable_count,
        total: viewingHistoryItem.total_alerts,
      },
      flowMap: viewingHistoryItem.flow_map,
    };

    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <History className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Historique Audit Flash</h1>
            </div>
            <p className="text-muted-foreground">
              {organisationName} - {format(new Date(viewingHistoryItem.completed_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setViewingHistoryItem(null)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour à l'historique
            </Button>
          </div>
        </div>
        {renderReportContent(historyReport as any)}
      </div>
    );
  }

  if (showReport && report) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-6 w-6 text-amber-500" />
              <h1 className="text-2xl font-bold">Audit Flash Pharmacie</h1>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <p className="text-muted-foreground">{organisationName} - Rapport d'audit</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Recommencer
            </Button>
            <Button onClick={exportToPDF}>
              <Download className="h-4 w-4 mr-2" />
              Exporter PDF
            </Button>
            {onBack && (
              <Button variant="ghost" onClick={onBack}>
                Retour
              </Button>
            )}
          </div>
        </div>
        
        {organisationId && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <Save className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-700 dark:text-green-400">Sauvegardé automatiquement</AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-500">
              Ce rapport a été enregistré dans l'historique de l'organisation.
            </AlertDescription>
          </Alert>
        )}

        {renderReportContent(report)}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold">Audit Flash Pharmacie</h1>
          </div>
          <p className="text-muted-foreground">
            Identifiez vos points de fuite et risques en quelques minutes
          </p>
        </div>
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            Retour
          </Button>
        )}
      </div>

      {/* Tabs for Audit vs History */}
      {organisationId && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'audit' | 'history')}>
          <TabsList>
            <TabsTrigger value="audit" className="gap-2">
              <Zap className="h-4 w-4" />
              Nouvel Audit
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Historique
              {historyResults.length > 0 && (
                <Badge variant="secondary" className="ml-1">{historyResults.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4">
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : historyResults.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Aucun audit flash enregistré</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Complétez un audit pour le voir apparaître ici
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {historyResults.map((result) => (
                  <Card key={result.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">
                              {format(new Date(result.completed_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="destructive" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {result.critical_count} critique{result.critical_count !== 1 ? 's' : ''}
                            </Badge>
                            <Badge className="gap-1 bg-orange-500">
                              <AlertTriangle className="h-3 w-3" />
                              {result.sensitive_count} sensible{result.sensitive_count !== 1 ? 's' : ''}
                            </Badge>
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {result.acceptable_count}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setViewingHistoryItem(result)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteFlashAudit(result.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="audit" className="mt-4 space-y-6">
            {/* Rest of audit UI rendered below */}
          </TabsContent>
        </Tabs>
      )}

      {/* Audit Content - shown when no tabs or in audit tab */}
      {(!organisationId || activeTab === 'audit') && (
        <>
          {/* Progress */}

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progression globale</span>
            <span className="text-sm text-muted-foreground">
              {Object.keys(answers).length} / {flashAuditQuestions.length} questions
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Category Navigation */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat, idx) => {
          const catInfo = FLASH_AUDIT_CATEGORIES[cat];
          const catQuestions = flashAuditQuestions.filter(q => q.category === cat);
          const catAnswered = catQuestions.filter(q => answers[q.id]).length;
          const isComplete = catAnswered === catQuestions.length;
          const isCurrent = idx === currentCategoryIndex;
          
          return (
            <Button
              key={cat}
              variant={isCurrent ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentCategoryIndex(idx)}
              className={cn(
                "gap-2",
                isComplete && !isCurrent && "border-green-500 text-green-600"
              )}
            >
              <span>{catInfo.icon}</span>
              <span className="hidden sm:inline">{catInfo.label}</span>
              {isComplete && <CheckCircle2 className="h-3 w-3" />}
            </Button>
          );
        })}
      </div>

      {/* Current Category */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{FLASH_AUDIT_CATEGORIES[currentCategory].icon}</span>
                {FLASH_AUDIT_CATEGORIES[currentCategory].label}
              </CardTitle>
              <CardDescription>
                {categoryQuestions.filter(q => answers[q.id]).length} / {categoryQuestions.length} questions répondues
              </CardDescription>
            </div>
            <Progress value={categoryProgress} className="w-24 h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-6 pr-4">
              {categoryQuestions.map((question, idx) => (
                <div key={question.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{question.question}</p>
                        {getSeverityBadge(question.riskLevel)}
                      </div>
                      <p className="text-sm text-muted-foreground">{question.description}</p>
                    </div>
                  </div>

                  <RadioGroup
                    value={answers[question.id]?.answer || ''}
                    onValueChange={(value) => handleAnswer(question.id, value as AnswerValue)}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                      <Label htmlFor={`${question.id}-yes`}>Oui</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id={`${question.id}-no`} />
                      <Label htmlFor={`${question.id}-no`}>Non</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="partial" id={`${question.id}-partial`} />
                      <Label htmlFor={`${question.id}-partial`}>Partiellement</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unknown" id={`${question.id}-unknown`} />
                      <Label htmlFor={`${question.id}-unknown`}>Je ne sais pas</Label>
                    </div>
                  </RadioGroup>

                  <Textarea
                    placeholder="Notes (optionnel)"
                    value={answers[question.id]?.notes || ''}
                    onChange={(e) => handleNotes(question.id, e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentCategoryIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>

        {currentCategoryIndex === categories.length - 1 ? (
          <Button onClick={handleGenerateReport} className="gap-2">
            <FileText className="h-4 w-4" />
            Générer le rapport
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Suivant
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
        </>
      )}
    </div>
  );
}
