import { useState, useMemo } from 'react';
import { useRightsRequests } from '@/hooks/useRightsRequests';
import { RightsRequest, RIGHT_TYPE_LABELS, REQUEST_STATUS_LABELS } from '@/types/documentation';
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
import { Plus, Loader2, Edit, Trash2, UserCheck, Clock, CheckCircle, XCircle, ArrowUpDown } from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { rightsRequestFormSchema, getFirstError } from '@/lib/validationSchemas';
import { AuditScoreBadge } from './AuditScoreBadge';
import { CompletenessIndicator } from './CompletenessIndicator';

// Fonction pour calculer la complétude d'une demande
function calculateRequestCompleteness(request: RightsRequest) {
  const missingFields: string[] = [];
  let filledFields = 0;
  const totalFields = 6;

  if (request.requester_name?.trim()) filledFields += 1; else missingFields.push('Nom du demandeur');
  if (request.requester_email?.trim()) filledFields += 1; else missingFields.push('Email');
  if (request.right_type) filledFields += 1; else missingFields.push('Type de droit');
  if (request.identity_verified) filledFields += 1; else missingFields.push('Identité vérifiée');
  
  if (request.status === 'completed' || request.status === 'rejected') {
    if (request.response_content?.trim()) filledFields += 1; else missingFields.push('Contenu de réponse');
    if (request.response_date) filledFields += 1; else missingFields.push('Date de réponse');
  } else {
    filledFields += 2;
  }

  return {
    percentage: Math.round((filledFields / totalFields) * 100),
    missingFields,
  };
}

interface RightsRequestsRegistryProps {
  organisationId: string;
}

export function RightsRequestsRegistry({ organisationId }: RightsRequestsRegistryProps) {
  const { requests, loading, createRequest, updateRequest, deleteRequest } = useRightsRequests(organisationId);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<RightsRequest | null>(null);
  const [sortByCompleteness, setSortByCompleteness] = useState(false);
  const [formData, setFormData] = useState({
    request_date: '',
    requester_name: '',
    requester_email: '',
    identity_verified: false,
    right_type: '' as RightsRequest['right_type'] | '',
    status: 'pending' as RightsRequest['status'],
    response_content: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      request_date: '',
      requester_name: '',
      requester_email: '',
      identity_verified: false,
      right_type: '',
      status: 'pending',
      response_content: '',
      notes: '',
    });
    setEditingRequest(null);
  };

  const handleOpenDialog = (request?: RightsRequest) => {
    if (request) {
      setEditingRequest(request);
      setFormData({
        request_date: format(request.request_date, "yyyy-MM-dd"),
        requester_name: request.requester_name,
        requester_email: request.requester_email || '',
        identity_verified: request.identity_verified,
        right_type: request.right_type,
        status: request.status,
        response_content: request.response_content || '',
        notes: request.notes || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    // Validate form data
    const validationError = getFirstError(rightsRequestFormSchema, formData);
    if (validationError) {
      toast({
        title: 'Erreur de validation',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    const requestData = {
      organisation_id: organisationId,
      request_date: new Date(formData.request_date),
      requester_name: formData.requester_name.trim(),
      requester_email: formData.requester_email?.trim() || undefined,
      identity_verified: formData.identity_verified,
      right_type: formData.right_type as RightsRequest['right_type'],
      status: formData.status,
      response_date: formData.status === 'completed' ? new Date() : undefined,
      response_content: formData.response_content?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
    };

    if (editingRequest) {
      await updateRequest(editingRequest.id, requestData);
    } else {
      await createRequest(requestData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const getDeadlineStatus = (request: RightsRequest) => {
    if (!request.deadline) return null;
    
    if (request.status === 'completed' || request.status === 'rejected') {
      return null;
    }

    const now = new Date();
    const deadline = new Date(request.deadline);
    const daysRemaining = differenceInDays(deadline, now);
    
    if (isPast(deadline)) {
      return { status: 'overdue', label: 'Dépassé', variant: 'destructive' as const };
    }
    
    if (daysRemaining <= 7) {
      return { status: 'urgent', label: `${daysRemaining}j restants`, variant: 'destructive' as const };
    }
    
    if (daysRemaining <= 14) {
      return { status: 'warning', label: `${daysRemaining}j restants`, variant: 'secondary' as const };
    }
    
    return { status: 'ok', label: `${daysRemaining}j restants`, variant: 'outline' as const };
  };

  const getStatusVariant = (status: RightsRequest['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  // Calcul et tri par complétude
  const sortedRequests = useMemo(() => {
    const requestsWithCompleteness = requests.map(request => ({
      ...request,
      completeness: calculateRequestCompleteness(request),
    }));

    if (sortByCompleteness) {
      return requestsWithCompleteness.sort((a, b) => a.completeness.percentage - b.completeness.percentage);
    }
    return requestsWithCompleteness;
  }, [requests, sortByCompleteness]);

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
                <UserCheck className="h-5 w-5" />
                Registre des Demandes de Droits (DSAR)
                <AuditScoreBadge organisationId={organisationId} compact />
              </CardTitle>
              <CardDescription>
                Suivi des demandes d'exercice des droits des personnes concernées (délai 1 mois)
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle demande
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRequest ? 'Modifier la demande' : 'Enregistrer une demande de droits'}
                  </DialogTitle>
                  <DialogDescription>
                    Vous disposez d'un mois pour répondre à la demande
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="request_date">Date de réception *</Label>
                    <Input
                      id="request_date"
                      type="date"
                      value={formData.request_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, request_date: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="requester_name">Nom du demandeur *</Label>
                      <Input
                        id="requester_name"
                        value={formData.requester_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, requester_name: e.target.value }))}
                        placeholder="Nom complet"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requester_email">Email</Label>
                      <Input
                        id="requester_email"
                        type="email"
                        value={formData.requester_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, requester_email: e.target.value }))}
                        placeholder="email@exemple.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="right_type">Type de droit exercé *</Label>
                    <Select
                      value={formData.right_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, right_type: value as RightsRequest['right_type'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le droit" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(RIGHT_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="identity_verified"
                      checked={formData.identity_verified}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, identity_verified: checked }))}
                    />
                    <Label htmlFor="identity_verified">Identité vérifiée</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as RightsRequest['status'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.status === 'completed' || formData.status === 'rejected') && (
                    <div className="space-y-2">
                      <Label htmlFor="response_content">Contenu de la réponse</Label>
                      <Textarea
                        id="response_content"
                        value={formData.response_content}
                        onChange={(e) => setFormData(prev => ({ ...prev, response_content: e.target.value }))}
                        placeholder="Décrivez la réponse apportée..."
                      />
                    </div>
                  )}

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
                  <Button onClick={handleSubmit} disabled={!formData.request_date || !formData.requester_name || !formData.right_type}>
                    {editingRequest ? 'Mettre à jour' : 'Enregistrer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sortedRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune demande de droits enregistrée</p>
              <p className="text-sm mt-2">Cliquez sur "Nouvelle demande" pour enregistrer une demande</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Demandeur</TableHead>
                  <TableHead>Type de droit</TableHead>
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
                  <TableHead>Délai</TableHead>
                  <TableHead>Identité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRequests.map((request) => {
                  const deadlineStatus = getDeadlineStatus(request);
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.requester_name}</div>
                          {request.requester_email && (
                            <div className="text-sm text-muted-foreground">{request.requester_email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{RIGHT_TYPE_LABELS[request.right_type]}</Badge>
                      </TableCell>
                      <TableCell>
                        <CompletenessIndicator 
                          percentage={request.completeness.percentage} 
                          missingFields={request.completeness.missingFields} 
                        />
                      </TableCell>
                      <TableCell>
                        {deadlineStatus ? (
                          <Badge variant={deadlineStatus.variant} className="gap-1">
                            <Clock className="h-3 w-3" />
                            {deadlineStatus.label}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {request.identity_verified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(request.status)}>
                          {REQUEST_STATUS_LABELS[request.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(request)}>
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
                                <AlertDialogTitle>Supprimer cette demande ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. Attention : la suppression peut poser des problèmes de traçabilité.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteRequest(request.id)}>
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
