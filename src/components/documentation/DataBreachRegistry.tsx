import { useState, useMemo } from 'react';
import { useDataBreaches } from '@/hooks/useDataBreaches';
import { DataBreach, BREACH_STATUS_LABELS } from '@/types/documentation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Loader2, Edit, Trash2, AlertTriangle, Clock, ArrowUpDown } from 'lucide-react';
import { format, differenceInHours, isPast, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { dataBreachFormSchema, getFirstError } from '@/lib/validationSchemas';
import { AuditScoreBadge } from './AuditScoreBadge';
import { CompletenessIndicator } from './CompletenessIndicator';

// Fonction pour calculer la complétude d'une violation
function calculateBreachCompleteness(breach: DataBreach) {
  const missingFields: string[] = [];
  let filledFields = 0;
  const totalFields = 8;

  if (breach.nature?.trim()) filledFields += 1; else missingFields.push('Nature de la violation');
  if (breach.breach_date) filledFields += 1; else missingFields.push('Date de violation');
  if (breach.discovery_date) filledFields += 1; else missingFields.push('Date de découverte');
  if (breach.categories_affected?.length > 0) filledFields += 1; else missingFields.push('Catégories affectées');
  if (breach.consequences?.trim()) filledFields += 1; else missingFields.push('Conséquences');
  if (breach.measures_taken?.trim()) filledFields += 1; else missingFields.push('Mesures prises');
  
  if (breach.cnil_notified || breach.status === 'closed') {
    filledFields += 1;
  } else if (breach.notification_deadline && isBefore(new Date(), new Date(breach.notification_deadline))) {
    filledFields += 0.5;
  } else {
    missingFields.push('Notification CNIL');
  }
  
  if (breach.persons_informed !== undefined && breach.persons_informed !== null) filledFields += 1; else missingFields.push('Personnes informées');

  return {
    percentage: Math.round((filledFields / totalFields) * 100),
    missingFields,
  };
}

interface DataBreachRegistryProps {
  organisationId: string;
}

export function DataBreachRegistry({ organisationId }: DataBreachRegistryProps) {
  const { breaches, loading, createBreach, updateBreach, deleteBreach } = useDataBreaches(organisationId);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBreach, setEditingBreach] = useState<DataBreach | null>(null);
  const [sortByCompleteness, setSortByCompleteness] = useState(false);
  const [formData, setFormData] = useState({
    breach_date: '',
    discovery_date: '',
    nature: '',
    categories_affected: '',
    estimated_count: '',
    consequences: '',
    measures_taken: '',
    persons_informed: false,
    cnil_notified: false,
    status: 'open' as DataBreach['status'],
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      breach_date: '',
      discovery_date: '',
      nature: '',
      categories_affected: '',
      estimated_count: '',
      consequences: '',
      measures_taken: '',
      persons_informed: false,
      cnil_notified: false,
      status: 'open',
      notes: '',
    });
    setEditingBreach(null);
  };

  const handleOpenDialog = (breach?: DataBreach) => {
    if (breach) {
      setEditingBreach(breach);
      setFormData({
        breach_date: format(breach.breach_date, "yyyy-MM-dd'T'HH:mm"),
        discovery_date: format(breach.discovery_date, "yyyy-MM-dd'T'HH:mm"),
        nature: breach.nature,
        categories_affected: breach.categories_affected.join(', '),
        estimated_count: breach.estimated_count?.toString() || '',
        consequences: breach.consequences || '',
        measures_taken: breach.measures_taken || '',
        persons_informed: breach.persons_informed,
        cnil_notified: breach.cnil_notified,
        status: breach.status,
        notes: breach.notes || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    // Validate form data
    const validationError = getFirstError(dataBreachFormSchema, formData);
    if (validationError) {
      toast({
        title: 'Erreur de validation',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    const breachData = {
      organisation_id: organisationId,
      breach_date: new Date(formData.breach_date),
      discovery_date: new Date(formData.discovery_date),
      nature: formData.nature.trim(),
      categories_affected: formData.categories_affected.split(',').map(s => s.trim()).filter(Boolean),
      estimated_count: formData.estimated_count ? parseInt(formData.estimated_count) : undefined,
      consequences: formData.consequences?.trim() || undefined,
      measures_taken: formData.measures_taken?.trim() || undefined,
      persons_informed: formData.persons_informed,
      cnil_notified: formData.cnil_notified,
      cnil_notification_date: formData.cnil_notified ? new Date() : undefined,
      status: formData.status,
      notes: formData.notes?.trim() || undefined,
    };

    if (editingBreach) {
      await updateBreach(editingBreach.id, breachData);
    } else {
      await createBreach(breachData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const getDeadlineStatus = (breach: DataBreach) => {
    if (!breach.notification_deadline) return null;
    
    const now = new Date();
    const deadline = new Date(breach.notification_deadline);
    const hoursRemaining = differenceInHours(deadline, now);
    
    if (breach.cnil_notified) {
      return { status: 'notified', label: 'Notifié', variant: 'default' as const };
    }
    
    if (isPast(deadline)) {
      return { status: 'overdue', label: 'Dépassé', variant: 'destructive' as const };
    }
    
    if (hoursRemaining <= 24) {
      return { status: 'urgent', label: `${hoursRemaining}h restantes`, variant: 'destructive' as const };
    }
    
    if (hoursRemaining <= 48) {
      return { status: 'warning', label: `${hoursRemaining}h restantes`, variant: 'secondary' as const };
    }
    
    return { status: 'ok', label: `${hoursRemaining}h restantes`, variant: 'outline' as const };
  };

  // Calcul et tri par complétude
  const sortedBreaches = useMemo(() => {
    const breachesWithCompleteness = breaches.map(breach => ({
      ...breach,
      completeness: calculateBreachCompleteness(breach),
    }));

    if (sortByCompleteness) {
      return breachesWithCompleteness.sort((a, b) => a.completeness.percentage - b.completeness.percentage);
    }
    return breachesWithCompleteness;
  }, [breaches, sortByCompleteness]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Registre des Violations de Données (Article 33)
                <AuditScoreBadge organisationId={organisationId} compact />
              </CardTitle>
              <CardDescription>
                Suivi des incidents de sécurité et notifications CNIL (délai 72h)
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} variant="destructive">
                  <Plus className="mr-2 h-4 w-4" />
                  Déclarer un incident
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingBreach ? 'Modifier la déclaration' : 'Déclarer une violation de données'}
                  </DialogTitle>
                  <DialogDescription>
                    Attention : vous disposez de 72h après la découverte pour notifier la CNIL
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="breach_date">Date de la violation *</Label>
                      <Input
                        id="breach_date"
                        type="datetime-local"
                        value={formData.breach_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, breach_date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discovery_date">Date de découverte *</Label>
                      <Input
                        id="discovery_date"
                        type="datetime-local"
                        value={formData.discovery_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, discovery_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nature">Nature de la violation *</Label>
                    <Textarea
                      id="nature"
                      value={formData.nature}
                      onChange={(e) => setFormData(prev => ({ ...prev, nature: e.target.value }))}
                      placeholder="Ex: Accès non autorisé, Perte de données, Divulgation..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categories_affected">Catégories de données affectées (séparées par virgules)</Label>
                    <Input
                      id="categories_affected"
                      value={formData.categories_affected}
                      onChange={(e) => setFormData(prev => ({ ...prev, categories_affected: e.target.value }))}
                      placeholder="Ex: Données d'identification, Données de santé, Données bancaires"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimated_count">Nombre estimé de personnes concernées</Label>
                    <Input
                      id="estimated_count"
                      type="number"
                      value={formData.estimated_count}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimated_count: e.target.value }))}
                      placeholder="Ex: 150"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consequences">Conséquences probables</Label>
                    <Textarea
                      id="consequences"
                      value={formData.consequences}
                      onChange={(e) => setFormData(prev => ({ ...prev, consequences: e.target.value }))}
                      placeholder="Décrivez les conséquences potentielles pour les personnes concernées..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="measures_taken">Mesures prises ou envisagées</Label>
                    <Textarea
                      id="measures_taken"
                      value={formData.measures_taken}
                      onChange={(e) => setFormData(prev => ({ ...prev, measures_taken: e.target.value }))}
                      placeholder="Décrivez les mesures correctives mises en place..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as DataBreach['status'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">En cours</SelectItem>
                        <SelectItem value="notified">Notifié CNIL</SelectItem>
                        <SelectItem value="closed">Clôturé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="cnil_notified"
                        checked={formData.cnil_notified}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, cnil_notified: checked }))}
                      />
                      <Label htmlFor="cnil_notified">Notification CNIL effectuée</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="persons_informed"
                        checked={formData.persons_informed}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, persons_informed: checked }))}
                      />
                      <Label htmlFor="persons_informed">Personnes concernées informées</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes internes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Notes complémentaires..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSubmit} disabled={!formData.breach_date || !formData.discovery_date || !formData.nature}>
                    {editingBreach ? 'Mettre à jour' : 'Déclarer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sortedBreaches.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune violation de données enregistrée</p>
              <p className="text-sm mt-2">C'est une bonne nouvelle ! Cliquez sur "Déclarer un incident" si nécessaire</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nature</TableHead>
                  <TableHead>Date violation</TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 font-medium hover:bg-transparent"
                      onClick={() => setSortByCompleteness(!sortByCompleteness)}
                    >
                      Complétude
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Délai CNIL</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBreaches.map((breach) => {
                  const deadlineStatus = getDeadlineStatus(breach);
                  return (
                    <TableRow key={breach.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium line-clamp-1">{breach.nature}</div>
                          {breach.categories_affected.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {breach.categories_affected.slice(0, 2).join(', ')}
                              {breach.categories_affected.length > 2 && ` +${breach.categories_affected.length - 2}`}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(breach.breach_date, 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <CompletenessIndicator 
                          percentage={breach.completeness.percentage} 
                          missingFields={breach.completeness.missingFields} 
                        />
                      </TableCell>
                      <TableCell>
                        {deadlineStatus && (
                          <Badge variant={deadlineStatus.variant} className="gap-1">
                            <Clock className="h-3 w-3" />
                            {deadlineStatus.label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={breach.status === 'open' ? 'destructive' : breach.status === 'notified' ? 'default' : 'secondary'}>
                          {BREACH_STATUS_LABELS[breach.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(breach)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer cette déclaration ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. Attention : la suppression d'un incident peut poser des problèmes de traçabilité.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteBreach(breach.id)}>
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
