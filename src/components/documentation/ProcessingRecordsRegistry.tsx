import { useState, useMemo } from 'react';
import { useProcessingRecords } from '@/hooks/useProcessingRecords';
import { ProcessingRecord, LEGAL_BASIS_OPTIONS } from '@/types/documentation';
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
import { Plus, Loader2, Edit, Trash2, CheckCircle, XCircle, FileText, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { processingRecordFormSchema, getFirstError } from '@/lib/validationSchemas';
import { AuditScoreBadge } from './AuditScoreBadge';
import { CompletenessIndicator } from './CompletenessIndicator';

// Fonction pour calculer la complétude d'un traitement
function calculateRecordCompleteness(record: ProcessingRecord) {
  const missingFields: string[] = [];
  let filledFields = 0;
  const totalFields = 10;

  if (record.name?.trim()) filledFields += 1; else missingFields.push('Nom du traitement');
  if (record.purposes?.trim()) filledFields += 1; else missingFields.push('Finalités');
  if (record.legal_basis?.trim()) filledFields += 1; else missingFields.push('Base légale');
  if (record.data_categories?.length > 0) filledFields += 1; else missingFields.push('Catégories de données');
  if (record.data_subjects?.length > 0) filledFields += 1; else missingFields.push('Personnes concernées');
  if (record.recipients?.length > 0) filledFields += 1; else missingFields.push('Destinataires');
  if (record.retention_period?.trim()) filledFields += 1; else missingFields.push('Durée de conservation');
  if (record.security_measures?.trim()) filledFields += 1; else missingFields.push('Mesures de sécurité');
  if (record.dpo_validation) filledFields += 1; else missingFields.push('Validation DPO');
  if (!record.transfers_outside_eu || (record.transfers_outside_eu && record.transfer_safeguards?.trim())) {
    filledFields += 1;
  } else {
    missingFields.push('Garanties transfert hors UE');
  }

  return {
    percentage: Math.round((filledFields / totalFields) * 100),
    missingFields,
  };
}

interface ProcessingRecordsRegistryProps {
  organisationId: string;
}

export function ProcessingRecordsRegistry({ organisationId }: ProcessingRecordsRegistryProps) {
  const { records, loading, createRecord, updateRecord, deleteRecord } = useProcessingRecords(organisationId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProcessingRecord | null>(null);
  const [sortByCompleteness, setSortByCompleteness] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    purposes: '',
    legal_basis: '',
    data_categories: '',
    data_subjects: '',
    recipients: '',
    transfers_outside_eu: false,
    transfer_safeguards: '',
    retention_period: '',
    security_measures: '',
    dpo_validation: false,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      purposes: '',
      legal_basis: '',
      data_categories: '',
      data_subjects: '',
      recipients: '',
      transfers_outside_eu: false,
      transfer_safeguards: '',
      retention_period: '',
      security_measures: '',
      dpo_validation: false,
    });
    setEditingRecord(null);
  };

  const handleOpenDialog = (record?: ProcessingRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        name: record.name,
        purposes: record.purposes,
        legal_basis: record.legal_basis,
        data_categories: record.data_categories.join(', '),
        data_subjects: record.data_subjects.join(', '),
        recipients: record.recipients.join(', '),
        transfers_outside_eu: record.transfers_outside_eu,
        transfer_safeguards: record.transfer_safeguards || '',
        retention_period: record.retention_period || '',
        security_measures: record.security_measures || '',
        dpo_validation: record.dpo_validation,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const validationError = getFirstError(processingRecordFormSchema, formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const recordData = {
      organisation_id: organisationId,
      name: formData.name.trim(),
      purposes: formData.purposes.trim(),
      legal_basis: formData.legal_basis,
      data_categories: formData.data_categories.split(',').map(s => s.trim()).filter(Boolean),
      data_subjects: formData.data_subjects.split(',').map(s => s.trim()).filter(Boolean),
      recipients: formData.recipients.split(',').map(s => s.trim()).filter(Boolean),
      transfers_outside_eu: formData.transfers_outside_eu,
      transfer_safeguards: formData.transfer_safeguards || undefined,
      retention_period: formData.retention_period || undefined,
      security_measures: formData.security_measures || undefined,
      dpo_validation: formData.dpo_validation,
      dpo_validation_date: formData.dpo_validation ? new Date() : undefined,
    };

    if (editingRecord) {
      await updateRecord(editingRecord.id, recordData);
    } else {
      await createRecord(recordData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const getLegalBasisLabel = (value: string) => {
    return LEGAL_BASIS_OPTIONS.find(o => o.value === value)?.label || value;
  };

  // Calcul et tri par complétude
  const sortedRecords = useMemo(() => {
    const recordsWithCompleteness = records.map(record => ({
      ...record,
      completeness: calculateRecordCompleteness(record),
    }));

    if (sortByCompleteness) {
      return recordsWithCompleteness.sort((a, b) => a.completeness.percentage - b.completeness.percentage);
    }
    return recordsWithCompleteness;
  }, [records, sortByCompleteness]);

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
                <FileText className="h-5 w-5" />
                Registre des Traitements (Article 30)
                <AuditScoreBadge organisationId={organisationId} compact />
              </CardTitle>
              <CardDescription>
                Documentation obligatoire des activités de traitement de données personnelles
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle fiche
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRecord ? 'Modifier la fiche de traitement' : 'Nouvelle fiche de traitement'}
                  </DialogTitle>
                  <DialogDescription>
                    Documentez une activité de traitement de données personnelles
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du traitement *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Gestion des dossiers patients"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purposes">Finalités du traitement *</Label>
                    <Textarea
                      id="purposes"
                      value={formData.purposes}
                      onChange={(e) => setFormData(prev => ({ ...prev, purposes: e.target.value }))}
                      placeholder="Décrivez les finalités du traitement..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legal_basis">Base légale *</Label>
                    <Select
                      value={formData.legal_basis}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, legal_basis: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez la base légale" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEGAL_BASIS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_categories">Catégories de données (séparées par des virgules)</Label>
                    <Input
                      id="data_categories"
                      value={formData.data_categories}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_categories: e.target.value }))}
                      placeholder="Ex: Nom, Prénom, Email, Données de santé"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_subjects">Personnes concernées (séparées par des virgules)</Label>
                    <Input
                      id="data_subjects"
                      value={formData.data_subjects}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_subjects: e.target.value }))}
                      placeholder="Ex: Patients, Employés, Fournisseurs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipients">Destinataires (séparés par des virgules)</Label>
                    <Input
                      id="recipients"
                      value={formData.recipients}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
                      placeholder="Ex: Service RH, Sous-traitant X, Administration"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retention_period">Durée de conservation</Label>
                    <Input
                      id="retention_period"
                      value={formData.retention_period}
                      onChange={(e) => setFormData(prev => ({ ...prev, retention_period: e.target.value }))}
                      placeholder="Ex: 5 ans après la fin de la relation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="security_measures">Mesures de sécurité</Label>
                    <Textarea
                      id="security_measures"
                      value={formData.security_measures}
                      onChange={(e) => setFormData(prev => ({ ...prev, security_measures: e.target.value }))}
                      placeholder="Décrivez les mesures de sécurité mises en place..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="transfers_outside_eu"
                      checked={formData.transfers_outside_eu}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, transfers_outside_eu: checked }))}
                    />
                    <Label htmlFor="transfers_outside_eu">Transfert hors UE</Label>
                  </div>

                  {formData.transfers_outside_eu && (
                    <div className="space-y-2">
                      <Label htmlFor="transfer_safeguards">Garanties appropriées</Label>
                      <Textarea
                        id="transfer_safeguards"
                        value={formData.transfer_safeguards}
                        onChange={(e) => setFormData(prev => ({ ...prev, transfer_safeguards: e.target.value }))}
                        placeholder="Ex: Clauses contractuelles types, Décision d'adéquation..."
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-4 border-t">
                    <Switch
                      id="dpo_validation"
                      checked={formData.dpo_validation}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, dpo_validation: checked }))}
                    />
                    <Label htmlFor="dpo_validation">Validé par le DPO</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSubmit} disabled={!formData.name || !formData.purposes || !formData.legal_basis}>
                    {editingRecord ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sortedRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune fiche de traitement enregistrée</p>
              <p className="text-sm mt-2">Cliquez sur "Nouvelle fiche" pour documenter vos traitements</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Traitement</TableHead>
                  <TableHead>Base légale</TableHead>
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
                  <TableHead>Validation DPO</TableHead>
                  <TableHead>Transfert hors UE</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{record.purposes}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getLegalBasisLabel(record.legal_basis)}</Badge>
                    </TableCell>
                    <TableCell>
                      <CompletenessIndicator 
                        percentage={record.completeness.percentage} 
                        missingFields={record.completeness.missingFields} 
                      />
                    </TableCell>
                    <TableCell>
                      {record.dpo_validation ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      {record.transfers_outside_eu ? (
                        <Badge variant="secondary">Oui</Badge>
                      ) : (
                        <span className="text-muted-foreground">Non</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(record)}>
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
                              <AlertDialogTitle>Supprimer cette fiche ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. La fiche de traitement "{record.name}" sera définitivement supprimée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteRecord(record.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
