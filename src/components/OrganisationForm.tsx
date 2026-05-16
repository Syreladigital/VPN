import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Organisation,
  Sector,
  OrganisationSize,
  DPORole,
  SECTOR_LABELS,
  SIZE_LABELS,
  DPO_ROLE_LABELS,
} from '@/types/rgpd';
import { Building2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organisationFormSchema, getFirstError } from '@/lib/validationSchemas';

export interface OrganisationFormData extends Omit<Organisation, 'id' | 'createdAt'> {}

interface OrganisationFormProps {
  onSubmit: (organisation: OrganisationFormData) => Promise<void>;
  onCancel?: () => void;
}

export function OrganisationForm({ onSubmit, onCancel }: OrganisationFormProps) {
  const [name, setName] = useState('');
  const [sector, setSector] = useState<Sector | ''>('');
  const [size, setSize] = useState<OrganisationSize | ''>('');
  const [dpoRole, setDpoRole] = useState<DPORole | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name?.trim()) {
      toast({
        title: 'Erreur de validation',
        description: 'Le nom de l\'organisme est requis',
        variant: 'destructive',
      });
      return;
    }

    if (!sector) {
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez sélectionner un secteur d\'activité',
        variant: 'destructive',
      });
      return;
    }

    if (!size) {
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez sélectionner la taille de la structure',
        variant: 'destructive',
      });
      return;
    }

    if (!dpoRole) {
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez sélectionner le rôle du DPO',
        variant: 'destructive',
      });
      return;
    }

    const validationError = getFirstError(organisationFormSchema, {
      name: name.trim(),
      sector,
      size,
      dpoRole,
    });

    if (validationError) {
      toast({
        title: 'Erreur de validation',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        sector: sector as Sector,
        size: size as OrganisationSize,
        dpoRole: dpoRole as DPORole,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = name && sector && size && dpoRole;

  return (
    <Card className="w-full max-w-2xl animate-fade-in">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-2xl">Identification de l'organisme</CardTitle>
        <CardDescription>
          Renseignez les informations de l'organisme pour démarrer l'audit de conformité
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'organisme *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pharmacie du Centre"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector">Secteur d'activité *</Label>
            <Select value={sector} onValueChange={(v) => setSector(v as Sector)}>
              <SelectTrigger id="sector">
                <SelectValue placeholder="Sélectionner un secteur" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SECTOR_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="size">Taille de la structure *</Label>
              <Select value={size} onValueChange={(v) => setSize(v as OrganisationSize)}>
                <SelectTrigger id="size">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SIZE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dpoRole">Rôle du DPO *</Label>
              <Select value={dpoRole} onValueChange={(v) => setDpoRole(v as DPORole)}>
                <SelectTrigger id="dpoRole">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DPO_ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isSubmitting}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            )}
            <Button type="submit" className="flex-1" size="lg" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  Démarrer l'audit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
