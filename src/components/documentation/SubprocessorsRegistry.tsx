import { useState, useMemo } from 'react';
import { useSubprocessors } from '@/hooks/useSubprocessors';
import { Subprocessor, SUBPROCESSOR_STATUS_LABELS } from '@/types/documentation';
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
import { Plus, Loader2, Edit, Trash2, Factory, CheckCircle, XCircle, Calendar, Shield, ArrowUpDown } from 'lucide-react';
import { format, differenceInDays, isPast, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { subprocessorFormSchema, getFirstError } from '@/lib/validationSchemas';
import { AuditScoreBadge } from './AuditScoreBadge';
import { CompletenessIndicator } from './CompletenessIndicator';

// Fonction pour calculer la complétude d'un sous-traitant
function calculateSubCompleteness(sub: Subprocessor) {
  const missingFields: string[] = [];
  let filledFields = 0;
  const totalFields = 8;

  if (sub.name?.trim()) filledFields += 1; else missingFields.push('Nom');
  if (sub.activity?.trim()) filledFields += 1; else missingFields.push('Activité');
  if (sub.data_processed?.length > 0) filledFields += 1; else missingFields.push('Données traitées');
  if (sub.contract_signed) filledFields += 1; else missingFields.push('Contrat signé');
  if (sub.location?.trim()) filledFields += 1; else missingFields.push('Localisation');
  if (sub.review_date) filledFields += 1; else missingFields.push('Date de révision');
  if (sub.eu_based || (!sub.eu_based && sub.transfer_mechanism?.trim())) {
    filledFields += 1;
  } else {
    missingFields.push('Mécanisme de transfert');
  }
  if (sub.hds_certified) filledFields += 1; else missingFields.push('Certification HDS');

  return {
    percentage: Math.round((filledFields / totalFields) * 100),
    missingFields,
  };
}

interface SubprocessorsRegistryProps {
  organisationId: string;
}

export function SubprocessorsRegistry({ organisationId }: SubprocessorsRegistryProps) {
  const { subprocessors, loading, createSubprocessor, updateSubprocessor, deleteSubprocessor } = useSubprocessors(organisationId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubprocessor, setEditingSubprocessor] = useState<Subprocessor | null>(null);
  const [sortByCompleteness, setSortByCompleteness] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    activity: '',
    data_processed: '',
    contract_signed: false,
    contract_date: '',
    hds_certified: false,
    location: '',
    eu_based: true,
    transfer_mechanism: '',
    review_date: '',
    status: 'active' as Subprocessor['status'],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      activity: '',
      data_processed: '',
      contract_signed: false,
      contract_date: '',
      hds_certified: false,
      location: '',
      eu_based: true,
      transfer_mechanism: '',
      review_date: '',
      status: 'active',
    });
    setEditingSubprocessor(null);
  };

  const handleOpenDialog = (sub?: Subprocessor) => {
    if (sub) {
      setEditingSubprocessor(sub);
      setFormData({
        name: sub.name,
        activity: sub.activity,
        data_processed: sub.data_processed.join(', '),
        contract_signed: sub.contract_signed,
        contract_date: sub.contract_date ? format(sub.contract_date, 'yyyy-MM-dd') : '',
        hds_certified: sub.hds_certified,
        location: sub.location || '',
        eu_based: sub.eu_based,
        transfer_mechanism: sub.transfer_mechanism || '',
        review_date: sub.review_date ? format(sub.review_date, 'yyyy-MM-dd') : '',
        status: sub.status,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const validationError = getFirstError(subprocessorFormSchema, formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const subData = {
      organisation_id: organisationId,
      name: formData.name.trim(),
      activity: formData.activity.trim(),
      data_processed: formData.data_processed.split(',').map(s => s.trim()).filter(Boolean),
      contract_signed: formData.contract_signed,
      contract_date: formData.contract_date ? new Date(formData.contract_date) : undefined,
      hds_certified: formData.hds_certified,
      location: formData.location || undefined,
      eu_based: formData.eu_based,
      transfer_mechanism: formData.transfer_mechanism || undefined,
      review_date: formData.review_date ? new Date(formData.review_date) : undefined,
      status: formData.status,
    };

    if (editingSubprocessor) {
      await updateSubprocessor(editingSubprocessor.id, subData);
    } else {
      await createSubprocessor(subData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const getReviewStatus = (sub: Subprocessor) => {
    if (!sub.review_date) return null;
    
    const now = new Date();
    const reviewDate = new Date(sub.review_date);
    const daysUntilReview = differenceInDays(reviewDate, now);
    
    if (isPast(reviewDate)) {
      return { status: 'overdue', label: 'À revoir', variant: 'destructive' as const };
    }
    
    if (daysUntilReview <= 30) {
      return { status: 'soon', label: `${daysUntilReview}j`, variant: 'secondary' as const };
    }
    
    return { status: 'ok', label: format(reviewDate, 'dd/MM/yyyy', { locale: fr }), variant: 'outline' as const };
  };

  // Calcul et tri par complétude
  const sortedSubprocessors = useMemo(() => {
    const subsWithCompleteness = subprocessors.map(sub => ({
      ...sub,
      completeness: calculateSubCompleteness(sub),
    }));

    if (sortByCompleteness) {
      return subsWithCompleteness.sort((a, b) => a.completeness.percentage - b.completeness.percentage);
    }
    return subsWithCompleteness;
  }, [subprocessors, sortByCompleteness]);

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
                <Factory className="h-5 w-5" />
                Registre des Sous-traitants (Article 28)
                <AuditScoreBadge organisationId={organisationId} compact />
              </CardTitle>
              <CardDescription>
                Documentation des sous-traitants et de leurs engagements contractuels
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un sous-traitant
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingSubprocessor ? 'Modifier le sous-traitant' : 'Ajouter un sous-traitant'}
                  </DialogTitle>
                  <DialogDescription>
                    Documentez vos sous-traitants et leurs engagements RGPD
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom du sous-traitant *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: AWS, OVH, Doctolib..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Localisation</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Ex: France, États-Unis..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity">Activité / Service fourni *</Label>
                    <Textarea
                      id="activity"
                      value={formData.activity}
                      onChange={(e) => setFormData(prev => ({ ...prev, activity: e.target.value }))}
                      placeholder="Ex: Hébergement cloud, Envoi d'emails, Paiement en ligne..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_processed">Données traitées (séparées par virgules)</Label>
                    <Input
                      id="data_processed"
                      value={formData.data_processed}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_processed: e.target.value }))}
                      placeholder="Ex: Emails, Données de santé, Coordonnées bancaires"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Statut</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Subprocessor['status'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SUBPROCESSOR_STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="review_date">Date de révision</Label>
                      <Input
                        id="review_date"
                        type="date"
                        value={formData.review_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, review_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="contract_signed"
                        checked={formData.contract_signed}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contract_signed: checked }))}
                      />
                      <Label htmlFor="contract_signed">Contrat / DPA signé</Label>
                    </div>

                    {formData.contract_signed && (
                      <div className="space-y-2 pl-6">
                        <Label htmlFor="contract_date">Date de signature</Label>
                        <Input
                          id="contract_date"
                          type="date"
                          value={formData.contract_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, contract_date: e.target.value }))}
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hds_certified"
                        checked={formData.hds_certified}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hds_certified: checked }))}
                      />
                      <Label htmlFor="hds_certified">Certifié HDS (Hébergeur de Données de Santé)</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="eu_based"
                        checked={formData.eu_based}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, eu_based: checked }))}
                      />
                      <Label htmlFor="eu_based">Basé dans l'UE/EEE</Label>
                    </div>

                    {!formData.eu_based && (
                      <div className="space-y-2 pl-6">
                        <Label htmlFor="transfer_mechanism">Mécanisme de transfert</Label>
                        <Input
                          id="transfer_mechanism"
                          value={formData.transfer_mechanism}
                          onChange={(e) => setFormData(prev => ({ ...prev, transfer_mechanism: e.target.value }))}
                          placeholder="Ex: Clauses contractuelles types, Décision d'adéquation..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSubmit} disabled={!formData.name || !formData.activity}>
                    {editingSubprocessor ? 'Mettre à jour' : 'Ajouter'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sortedSubprocessors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Factory className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun sous-traitant enregistré</p>
              <p className="text-sm mt-2">Cliquez sur "Ajouter un sous-traitant" pour documenter vos prestataires</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sous-traitant</TableHead>
                  <TableHead>Activité</TableHead>
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
                  <TableHead>Contrat</TableHead>
                  <TableHead>HDS</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSubprocessors.map((sub) => {
                  const reviewStatus = getReviewStatus(sub);
                  return (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="font-medium">{sub.name}</div>
                        <div className="text-xs text-muted-foreground">{sub.location || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs line-clamp-2 text-sm">{sub.activity}</div>
                      </TableCell>
                      <TableCell>
                        <CompletenessIndicator 
                          percentage={sub.completeness.percentage} 
                          missingFields={sub.completeness.missingFields} 
                        />
                      </TableCell>
                      <TableCell>
                        {sub.contract_signed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell>
                        {sub.hds_certified ? (
                          <Badge variant="default" className="gap-1">
                            <Shield className="h-3 w-3" />
                            HDS
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {reviewStatus ? (
                          <Badge variant={reviewStatus.variant} className="gap-1">
                            <Calendar className="h-3 w-3" />
                            {reviewStatus.label}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sub.status === 'active' ? 'default' : sub.status === 'inactive' ? 'secondary' : 'outline'}>
                          {SUBPROCESSOR_STATUS_LABELS[sub.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(sub)}>
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
                                <AlertDialogTitle>Supprimer ce sous-traitant ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. Le sous-traitant "{sub.name}" sera supprimé du registre.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteSubprocessor(sub.id)}>
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
