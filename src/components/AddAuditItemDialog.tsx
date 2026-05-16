import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { AuditItem, ConformityStatus, RiskLevel, Priority, AuditAction } from '@/types/rgpd';

interface AddAuditItemDialogProps {
  moduleId: string;
  onAddItem: (item: AuditItem) => void;
  disabled?: boolean;
}

export function AddAuditItemDialog({ moduleId, onAddItem, disabled }: AddAuditItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ConformityStatus>('non_conforme');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('moyen');
  const [riskJustification, setRiskJustification] = useState('');
  const [actions, setActions] = useState<{ description: string; priority: Priority }[]>([
    { description: '', priority: 2 }
  ]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('non_conforme');
    setRiskLevel('moyen');
    setRiskJustification('');
    setActions([{ description: '', priority: 2 }]);
  };

  const addAction = () => {
    setActions([...actions, { description: '', priority: 2 }]);
  };

  const removeAction = (index: number) => {
    if (actions.length > 1) {
      setActions(actions.filter((_, i) => i !== index));
    }
  };

  const updateAction = (index: number, field: 'description' | 'priority', value: string | Priority) => {
    const newActions = [...actions];
    if (field === 'priority') {
      newActions[index].priority = value as Priority;
    } else {
      newActions[index].description = value as string;
    }
    setActions(newActions);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setSaving(true);
    try {
      const newItem: AuditItem = {
        id: `new-${Date.now()}`,
        moduleId,
        title: title.trim(),
        description: description.trim(),
        status,
        riskLevel,
        riskJustification: riskJustification.trim(),
        actions: actions
          .filter(a => a.description.trim())
          .map((a, index) => ({
            id: `action-${Date.now()}-${index}`,
            description: a.description.trim(),
            priority: a.priority,
            completed: false
          })),
        dpoComments: '',
        aiGenerated: false
      };

      onAddItem(newItem);
      resetForm();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Plus className="mr-1 h-4 w-4" />
          Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un élément d'audit</DialogTitle>
          <DialogDescription>
            Créez un nouvel élément d'audit personnalisé pour ce module
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre de l'élément *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Vérification des consentements patients"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez l'objectif et le périmètre de cet élément d'audit..."
              rows={3}
            />
          </div>

          {/* Statut et Risque */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Diagnostic initial</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ConformityStatus)}>
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
            <div className="space-y-2">
              <Label>Niveau de risque</Label>
              <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as RiskLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="faible">Faible</SelectItem>
                  <SelectItem value="moyen">Moyen</SelectItem>
                  <SelectItem value="eleve">Élevé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Justification du risque */}
          <div className="space-y-2">
            <Label htmlFor="riskJustification">Justification du niveau de risque</Label>
            <Textarea
              id="riskJustification"
              value={riskJustification}
              onChange={(e) => setRiskJustification(e.target.value)}
              placeholder="Expliquez pourquoi ce niveau de risque a été attribué..."
              rows={2}
            />
          </div>

          {/* Actions recommandées */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Actions recommandées</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addAction}>
                <Plus className="mr-1 h-4 w-4" />
                Ajouter une action
              </Button>
            </div>
            
            {actions.map((action, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    value={action.description}
                    onChange={(e) => updateAction(index, 'description', e.target.value)}
                    placeholder={`Action ${index + 1}...`}
                  />
                </div>
                <Select 
                  value={String(action.priority)} 
                  onValueChange={(v) => updateAction(index, 'priority', Number(v) as Priority)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">P1 - Immédiat</SelectItem>
                    <SelectItem value="2">P2 - Court terme</SelectItem>
                    <SelectItem value="3">P3 - Amélioration</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAction(index)}
                  disabled={actions.length === 1}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Créer l'élément
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
