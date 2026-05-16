import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Shield, Clock, FileText, AlertTriangle, Lock, Eye, Database, Users, Download } from 'lucide-react';
import { exportLoggingPolicyToPDF } from '@/services/exportLoggingPolicyPDF';
import { useToast } from '@/hooks/use-toast';

export const LoggingPolicyDocumentation: React.FC = () => {
  const { toast } = useToast();

  const handleExportPDF = async () => {
    try {
      await exportLoggingPolicyToPDF();
      toast({
        title: 'Export réussi',
        description: 'La documentation a été exportée en PDF',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter le document',
        variant: 'destructive',
      });
    }
  };
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Politique de journalisation des connexions</CardTitle>
                <CardDescription>SyrelaTrust - Documentation RGPD</CardDescription>
              </div>
            </div>
            <Button onClick={handleExportPDF} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Finalités */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            1. Finalités de la journalisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Les logs de connexion ont pour finalité exclusive :
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">✓</Badge>
              La sécurité de l'application
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">✓</Badge>
              La détection d'accès non autorisés
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">✓</Badge>
              La traçabilité minimale en cas d'incident
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">✓</Badge>
              La preuve d'accès en cas de contrôle ou de litige
            </li>
          </ul>
          
          <Separator />
          
          <div>
            <p className="text-sm font-medium text-destructive mb-2">Interdictions :</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">✗</Badge>
                Surveillance des comportements
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">✗</Badge>
                Profilage des utilisateurs
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">✗</Badge>
                Analyse de la productivité
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Structure du log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            2. Structure des logs (modèle RGPD)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`{
  "event_type": "login_success | login_failure | logout | password_reset",
  "user_id": "identifiant_interne",
  "timestamp": "YYYY-MM-DD HH:MM:SS",
  "ip_address": "pseudonymisée",
  "user_agent": "navigateur_simplifié",
  "commentaire": "optionnel"
}`}</pre>
          </div>
          
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Événements journalisés :</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Connexions (succès/échec)</li>
                <li>• Déconnexions</li>
                <li>• Tentatives multiples échouées</li>
                <li>• Changements de mot de passe</li>
                <li>• Réinitialisations de mot de passe</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">Données interdites :</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Contenu saisi dans l'application</li>
                <li>• Données clients</li>
                <li>• Géolocalisation précise</li>
                <li>• Mots de passe (même chiffrés)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Durée de conservation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            3. Durée de conservation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="font-medium text-sm">Logs de connexion</p>
              <p className="text-2xl font-bold text-primary mt-1">6 à 12 mois</p>
              <p className="text-xs text-muted-foreground mt-1">maximum</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium text-sm">Logs liés à un incident</p>
              <p className="text-sm font-medium text-primary mt-1">Jusqu'à clôture</p>
              <p className="text-xs text-muted-foreground mt-1">+ durée légale de preuve</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Au-delà : suppression automatique ou anonymisation irréversible.
          </p>
        </CardContent>
      </Card>

      {/* Information utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            4. Information des utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              Dans le cadre de la sécurité de l'application SyrelaTrust, des journaux de connexion 
              sont enregistrés (date, heure, identifiant utilisateur, résultat de la connexion).
              Ces journaux sont utilisés exclusivement à des fins de sécurité et de traçabilité 
              et sont conservés pour une durée limitée.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Registre RGPD */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            5. Inscription au registre RGPD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-2 py-2 border-b">
              <span className="font-medium">Nom du traitement</span>
              <span className="col-span-2">Journalisation des accès à l'application SyrelaTrust</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b">
              <span className="font-medium">Finalité</span>
              <span className="col-span-2">Sécurité, détection d'accès non autorisés, traçabilité</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b">
              <span className="font-medium">Base légale</span>
              <span className="col-span-2">Intérêt légitime (art. 6.1.f RGPD)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b">
              <span className="font-medium">Personnes concernées</span>
              <span className="col-span-2">Utilisateurs habilités de l'application</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b">
              <span className="font-medium">Données traitées</span>
              <span className="col-span-2">Données d'authentification indirectes</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b">
              <span className="font-medium">Durée de conservation</span>
              <span className="col-span-2">6 à 12 mois</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2">
              <span className="font-medium">Mesures de sécurité</span>
              <span className="col-span-2">Accès restreint, chiffrement, suppression automatique</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analyse de risques */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5" />
            6. Analyse de risques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div>
                <p className="font-medium text-sm">Risque : accès non autorisé aux logs</p>
                <p className="text-xs text-muted-foreground">Gravité : faible à moyenne</p>
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300">Moyen</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Mesures de mitigation :</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Accès réservé à l'administrateur</li>
                <li>• Chiffrement des données</li>
                <li>• Pas de logs excessifs</li>
                <li>• Suppression automatique après expiration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avertissement */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Validation requise</AlertTitle>
        <AlertDescription className="text-amber-700 text-sm">
          La journalisation des connexions doit être configurée et validée par le responsable de traitement ou le DPO.
          Les paramètres peuvent être ajustés pour respecter les principes de minimisation et de proportionnalité.
        </AlertDescription>
      </Alert>

      {/* Conclusion */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <p className="text-center text-sm font-medium">
            ✅ Journalisation des connexions documentée pour SyrelaTrust.
          </p>
          <p className="text-center text-xs text-muted-foreground mt-1">
            Configuration à activer uniquement après validation DPO.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
