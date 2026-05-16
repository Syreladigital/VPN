import { useState, useCallback, useEffect } from 'react';
import { AuditModule, Organisation, AuditItem, ConformityStatus, RiskLevel, Priority, Sector } from '@/types/rgpd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge, RiskBadge } from './StatusBadge';
import { AIDisclaimer } from './AIDisclaimer';
import { AuditHeader } from './AuditHeader';
import { AddAuditItemDialog } from './AddAuditItemDialog';
import { QuestionnaireTemplatesDialog } from './QuestionnaireTemplatesDialog';
import { ArrowLeft, Plus, Sparkles, Save, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAuditItemsForModule } from '@/data/sectorAuditItems';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface AuditModuleDetailProps {
  module: AuditModule;
  organisation: Organisation;
  onBack: () => void;
  onSaveItem?: (moduleKey: string, moduleName: string, item: AuditItem) => Promise<void>;
  loadModuleItems?: (moduleKey: string, sector: string) => Promise<AuditItem[]>;
}

export function AuditModuleDetail({ module, organisation, onBack, onSaveItem, loadModuleItems }: AuditModuleDetailProps) {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<AuditItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const { toast } = useToast();

  // Load items on mount
  useEffect(() => {
    const loadItems = async () => {
      setLoadingItems(true);
      try {
        let loadedItems: AuditItem[];
        if (loadModuleItems) {
          loadedItems = await loadModuleItems(module.id, organisation.sector);
        } else {
          loadedItems = getAuditItemsForModule(module.id, organisation.sector);
          if (loadedItems.length === 0) {
            loadedItems = [{
              id: '1',
              moduleId: module.id,
              title: 'Élément d\'audit à compléter',
              description: 'Cliquez pour ajouter les détails de cet élément',
              status: 'non_conforme',
              riskLevel: 'moyen',
              riskJustification: 'À évaluer selon le contexte de l\'organisme',
              actions: [
                { id: 'a1', description: 'Analyser le traitement concerné', priority: 2, completed: false },
              ],
              dpoComments: '',
              aiGenerated: false,
            }];
          }
        }
        setItems(loadedItems);
        setSelectedItem(loadedItems[0] || null);
      } catch (error) {
        console.error('Error loading items:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les éléments d\'audit',
          variant: 'destructive',
        });
      } finally {
        setLoadingItems(false);
      }
    };
    loadItems();
  }, [module.id, organisation.sector, loadModuleItems, toast]);

  const updateItem = (updatedItem: AuditItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
    setSelectedItem(updatedItem);
  };

  const toggleAction = (itemId: string, actionId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const updatedActions = item.actions.map(a => 
      a.id === actionId ? { ...a, completed: !a.completed } : a
    );
    updateItem({ ...item, actions: updatedActions });
  };

  const handleAddItem = (newItem: AuditItem) => {
    setItems([...items, newItem]);
    setSelectedItem(newItem);
    toast({
      title: 'Élément ajouté',
      description: 'N\'oubliez pas d\'enregistrer pour sauvegarder en base de données',
    });
  };

  const handleAddTemplateItems = (newItems: AuditItem[]) => {
    // Generate unique IDs for the items
    const itemsWithIds = newItems.map(item => ({
      ...item,
      id: `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      actions: item.actions.map(a => ({
        ...a,
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
    }));
    setItems([...items, ...itemsWithIds]);
    if (itemsWithIds.length > 0) {
      setSelectedItem(itemsWithIds[0]);
    }
    toast({
      title: `${itemsWithIds.length} élément${itemsWithIds.length > 1 ? 's' : ''} ajouté${itemsWithIds.length > 1 ? 's' : ''}`,
      description: 'N\'oubliez pas d\'enregistrer pour sauvegarder en base de données',
    });
  };

  const addNewAction = () => {
    if (!selectedItem) return;
    const newAction = {
      id: `action-${Date.now()}`,
      description: '',
      priority: 2 as Priority,
      completed: false
    };
    updateItem({
      ...selectedItem,
      actions: [...selectedItem.actions, newAction]
    });
  };

  const removeAction = (actionId: string) => {
    if (!selectedItem || selectedItem.actions.length <= 1) return;
    updateItem({
      ...selectedItem,
      actions: selectedItem.actions.filter(a => a.id !== actionId)
    });
  };

  const updateActionDescription = (actionId: string, description: string) => {
    if (!selectedItem) return;
    updateItem({
      ...selectedItem,
      actions: selectedItem.actions.map(a => 
        a.id === actionId ? { ...a, description } : a
      )
    });
  };

  const updateActionPriority = (actionId: string, priority: Priority) => {
    if (!selectedItem) return;
    updateItem({
      ...selectedItem,
      actions: selectedItem.actions.map(a => 
        a.id === actionId ? { ...a, priority } : a
      )
    });
  };

  const handleSaveItem = useCallback(async () => {
    if (!selectedItem || !onSaveItem) return;
    
    setSaving(true);
    try {
      await onSaveItem(module.id, module.name, selectedItem);
      toast({
        title: 'Sauvegardé',
        description: 'Les modifications ont été enregistrées',
      });
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les modifications',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }, [selectedItem, onSaveItem, module.id, module.name, toast]);

  return (
    <div className="min-h-screen bg-background">
      <AuditHeader organisation={organisation} />

      <main className="container mx-auto px-6 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux modules
        </Button>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{module.name}</h2>
              <p className="text-muted-foreground">{module.description}</p>
            </div>
            <StatusBadge status={module.status} />
          </div>
        </div>

        <AIDisclaimer />

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Liste des éléments */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Éléments d'audit</h3>
              <div className="flex gap-2">
                <QuestionnaireTemplatesDialog
                  sector={organisation.sector as Sector}
                  moduleId={module.id}
                  onAddItems={handleAddTemplateItems}
                  disabled={loadingItems}
                />
                <AddAuditItemDialog
                  moduleId={module.id}
                  onAddItem={handleAddItem}
                  disabled={loadingItems}
                />
              </div>
            </div>
            {loadingItems ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardHeader className="p-4 pb-2">
                      <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Skeleton className="h-5 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <Card
                    key={item.id}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50",
                      selectedItem?.id === item.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                        {item.aiGenerated && (
                          <Sparkles className="h-4 w-4 shrink-0 text-accent" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex gap-2">
                        <StatusBadge status={item.status} className="text-xs" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Détail de l'élément sélectionné */}
          {selectedItem && (
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {selectedItem.title}
                        {selectedItem.aiGenerated && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
                            <Sparkles className="h-3 w-3" />
                            Généré par IA
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>{selectedItem.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Diagnostic */}
                  <div className="space-y-2">
                    <Label>Diagnostic</Label>
                    <Select
                      value={selectedItem.status}
                      onValueChange={(v) => updateItem({ ...selectedItem, status: v as ConformityStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conforme">Conforme</SelectItem>
                        <SelectItem value="partiellement_conforme">Partiellement conforme</SelectItem>
                        <SelectItem value="non_conforme">Non conforme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Risque */}
                  <div className="space-y-2">
                    <Label>Niveau de risque</Label>
                    <div className="flex items-center gap-4">
                      <Select
                        value={selectedItem.riskLevel}
                        onValueChange={(v) => updateItem({ ...selectedItem, riskLevel: v as RiskLevel })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="faible">Faible</SelectItem>
                          <SelectItem value="moyen">Moyen</SelectItem>
                          <SelectItem value="eleve">Élevé</SelectItem>
                        </SelectContent>
                      </Select>
                      <RiskBadge level={selectedItem.riskLevel} />
                    </div>
                    <Textarea
                      value={selectedItem.riskJustification}
                      onChange={(e) => updateItem({ ...selectedItem, riskJustification: e.target.value })}
                      placeholder="Justification du niveau de risque..."
                      className="mt-2"
                    />
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Actions recommandées</Label>
                      <Button variant="ghost" size="sm" onClick={addNewAction}>
                        <Plus className="mr-1 h-4 w-4" />
                        Ajouter
                      </Button>
                    </div>
                    {selectedItem.actions.map(action => (
                      <div
                        key={action.id}
                        className={cn(
                          "flex items-start gap-3 rounded-md p-3",
                          action.priority === 1 && "priority-1",
                          action.priority === 2 && "priority-2",
                          action.priority === 3 && "priority-3"
                        )}
                      >
                        <Checkbox
                          checked={action.completed}
                          onCheckedChange={() => toggleAction(selectedItem.id, action.id)}
                          className="mt-2"
                        />
                        <div className="flex-1 space-y-2">
                          <Input
                            value={action.description}
                            onChange={(e) => updateActionDescription(action.id, e.target.value)}
                            placeholder="Description de l'action..."
                            className={cn(action.completed && "line-through opacity-60")}
                          />
                          <div className="flex items-center gap-2">
                            <Select
                              value={String(action.priority)}
                              onValueChange={(v) => updateActionPriority(action.id, Number(v) as Priority)}
                            >
                              <SelectTrigger className="w-36 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">P1 - Immédiat</SelectItem>
                                <SelectItem value="2">P2 - Court terme</SelectItem>
                                <SelectItem value="3">P3 - Amélioration</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeAction(action.id)}
                              disabled={selectedItem.actions.length <= 1}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Commentaires DPO */}
                  <div className="space-y-2">
                    <Label>Commentaires DPO</Label>
                    <Textarea
                      value={selectedItem.dpoComments}
                      onChange={(e) => updateItem({ ...selectedItem, dpoComments: e.target.value })}
                      placeholder="Notes et observations du DPO..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ce champ est exclusivement réservé à la saisie humaine
                    </p>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handleSaveItem} disabled={saving || !onSaveItem}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Enregistrer les modifications
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
