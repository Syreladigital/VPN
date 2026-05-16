import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileQuestion, Plus, Loader2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { AuditItem, Sector, SECTOR_LABELS } from '@/types/rgpd';
import { getQuestionnaireTemplates, QuestionnaireTemplate } from '@/data/questionnaireTemplates';
import { cn } from '@/lib/utils';

interface QuestionnaireTemplatesDialogProps {
  sector: Sector;
  moduleId: string;
  onAddItems: (items: AuditItem[]) => void;
  disabled?: boolean;
}

export function QuestionnaireTemplatesDialog({ 
  sector, 
  moduleId, 
  onAddItems, 
  disabled 
}: QuestionnaireTemplatesDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  const templates = getQuestionnaireTemplates(sector, moduleId);
  const templatesByCategory = templates.reduce((acc, template) => {
    const category = template.category || 'Général';
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {} as Record<string, QuestionnaireTemplate[]>);

  const categories = Object.keys(templatesByCategory);

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleAdd = async () => {
    if (selectedTemplates.length === 0) return;

    setAdding(true);
    try {
      const itemsToAdd = templates
        .filter(t => selectedTemplates.includes(t.id))
        .map(t => t.item);
      
      onAddItems(itemsToAdd);
      setSelectedTemplates([]);
      setOpen(false);
    } finally {
      setAdding(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'conforme':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'partiellement_conforme':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'non_conforme':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getRiskBadge = (level: string) => {
    const colors = {
      faible: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      moyen: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      eleve: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    const labels = { faible: 'Faible', moyen: 'Moyen', eleve: 'Élevé' };
    return (
      <Badge className={cn('text-xs', colors[level as keyof typeof colors])}>
        {labels[level as keyof typeof labels]}
      </Badge>
    );
  };

  if (templates.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <FileQuestion className="mr-1 h-4 w-4" />
          Modèles sectoriels
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5" />
            Questionnaires d'audit - {SECTOR_LABELS[sector]}
          </DialogTitle>
          <DialogDescription>
            Sélectionnez les questionnaires pré-remplis adaptés à votre spécialité
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={categories[0]} className="flex-1">
          {categories.length > 1 && (
            <TabsList className="mb-4">
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          {categories.map(category => (
            <TabsContent key={category} value={category} className="m-0">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {templatesByCategory[category].map(template => (
                    <Card 
                      key={template.id}
                      className={cn(
                        "cursor-pointer transition-all hover:border-primary/50",
                        selectedTemplates.includes(template.id) && "border-primary bg-primary/5"
                      )}
                      onClick={() => toggleTemplate(template.id)}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-5 w-5 rounded border flex items-center justify-center",
                              selectedTemplates.includes(template.id) 
                                ? "bg-primary border-primary text-primary-foreground" 
                                : "border-muted-foreground/30"
                            )}>
                              {selectedTemplates.includes(template.id) && (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </div>
                            <CardTitle className="text-sm font-medium">
                              {template.item.title}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(template.item.status)}
                            {getRiskBadge(template.item.riskLevel)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <CardDescription className="text-xs mb-2">
                          {template.item.description}
                        </CardDescription>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {template.item.actions.length} action{template.item.actions.length > 1 ? 's' : ''}
                          </Badge>
                          {template.tags?.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedTemplates.length} questionnaire{selectedTemplates.length > 1 ? 's' : ''} sélectionné{selectedTemplates.length > 1 ? 's' : ''}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAdd} 
              disabled={selectedTemplates.length === 0 || adding}
            >
              {adding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter ({selectedTemplates.length})
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
