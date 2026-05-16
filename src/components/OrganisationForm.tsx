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
  Country,
  SECTOR_LABELS, 
  SIZE_LABELS, 
  DPO_ROLE_LABELS,
  COUNTRY_LABELS,
  LEGAL_FRAMEWORK_LABELS,
  getLegalFrameworkFromCountry
} from '@/types/rgpd';
import { Building2, ArrowRight, ArrowLeft, Globe, Scale, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organisationFormSchema, getFirstError } from '@/lib/validationSchemas';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

export interface OrganisationFormData extends Omit<Organisation, 'id' | 'createdAt'> {
  clientEmail?: string;
}

interface OrganisationFormProps {
  onSubmit: (organisation: OrganisationFormData) => Promise<void>;
  onCancel?: () => void;
}

export function OrganisationForm({ onSubmit, onCancel }: OrganisationFormProps) {
  const [name, setName] = useState('');
  const [sector, setSector] = useState<Sector | ''>('');
  const [size, setSize] = useState<OrganisationSize | ''>('');
  const [dpoRole, setDpoRole] = useState<DPORole | ''>('');
  const [country, setCountry] = useState<Country | ''>('');
  const [clientEmail, setClientEmail] = useState('');
  const [sendClientAccess, setSendClientAccess] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const legalFramework = country ? getLegalFrameworkFromCountry(country) : null;
  
  // Basic email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields are present and non-empty
    if (!name?.trim()) {
      toast({
        title: 'Erreur de validation',
        description: 'Le nom de l\'organisme est requis',
        variant: 'destructive',
      });
      return;
    }

    if (!country) {
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez sélectionner un pays',
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
      country,
    });
    
    if (validationError) {
      toast({
        title: 'Erreur de validation',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    // Validate client email if provided
    if (sendClientAccess && clientEmail && !isValidEmail(clientEmail)) {
      toast({
        title: 'Erreur de validation',
        description: 'L\'adresse email du client n\'est pas valide',
        variant: 'destructive',
      });
      return;
    }

    const derivedLegalFramework = getLegalFrameworkFromCountry(country);

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        sector: sector as Sector,
        size: size as OrganisationSize,
        dpoRole: dpoRole as DPORole,
        country: country as Country,
        legalFramework: derivedLegalFramework,
        clientEmail: sendClientAccess && clientEmail ? clientEmail : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = name && sector && size && dpoRole && country;

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

          {/* Country selection - determines legal framework */}
          <div className="space-y-2">
            <Label htmlFor="country" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Pays *
            </Label>
            <Select value={country} onValueChange={(v) => setCountry(v as Country)}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Sélectionner le pays" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COUNTRY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Legal framework info - automatically derived from country */}
          {legalFramework && (
            <Alert className={legalFramework === 'loi_tunisie_2025' ? 'border-amber-500 bg-amber-50' : 'border-blue-500 bg-blue-50'}>
              <Scale className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <strong>Cadre juridique applicable :</strong>{' '}
                {LEGAL_FRAMEWORK_LABELS[legalFramework]}
          {legalFramework === 'loi_tunisie_2025' && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    L'audit sera basé sur le Projet de loi organique n° 2025/95 relative à la protection des données personnelles et les exigences de l'INPDP.
                  </p>
                )}
                {legalFramework === 'rgpd_eu' && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    L'audit sera basé sur le Règlement (UE) 2016/679 (RGPD) et les référentiels CNIL.
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

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

          {/* Client Email Section */}
          <div className="space-y-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendClientAccess"
                checked={sendClientAccess}
                onCheckedChange={(checked) => setSendClientAccess(checked === true)}
                disabled={isSubmitting}
              />
              <Label 
                htmlFor="sendClientAccess" 
                className="flex items-center gap-2 cursor-pointer text-sm font-medium"
              >
                <Mail className="h-4 w-4 text-primary" />
                Créer un accès client et envoyer les identifiants par email
              </Label>
            </div>
            
            {sendClientAccess && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="clientEmail">Email du client</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Un compte client sera créé automatiquement et un email avec les identifiants de connexion sera envoyé.
                </p>
              </div>
            )}
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
