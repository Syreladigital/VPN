import { useState } from 'react';
import { Organisation } from '@/types/rgpd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Copy, Check, Scale } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentTemplatesPanelProps {
  organisation: Organisation | undefined;
}

interface DocumentTemplate {
  title: string;
  description: string;
  content: string;
}

const getRGPDTemplates = (orgName: string): Record<string, DocumentTemplate> => ({
  privacy_policy: {
    title: 'Politique de Confidentialité',
    description: 'Modèle de politique de confidentialité conforme RGPD',
    content: `POLITIQUE DE CONFIDENTIALITÉ

Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}

1. IDENTITÉ DU RESPONSABLE DE TRAITEMENT

${orgName}
[Adresse]
[Email de contact]

2. DONNÉES COLLECTÉES

Nous collectons les données suivantes :
- Données d'identification (nom, prénom, email)
- [Ajouter les catégories pertinentes]

3. FINALITÉS DU TRAITEMENT

Vos données sont traitées pour les finalités suivantes :
- [Finalité 1]
- [Finalité 2]

4. BASE LÉGALE

Le traitement de vos données est fondé sur :
- Votre consentement
- L'exécution d'un contrat
- [Autre base légale]

5. DESTINATAIRES DES DONNÉES

Vos données peuvent être transmises à :
- Nos sous-traitants (hébergeurs, prestataires techniques)
- [Autres destinataires]

6. DURÉE DE CONSERVATION

Vos données sont conservées pendant :
- [Durée] pour [type de données]

7. VOS DROITS

Conformément au RGPD (Règlement UE 2016/679), vous disposez des droits suivants :
- Droit d'accès (art. 15)
- Droit de rectification (art. 16)
- Droit à l'effacement (art. 17)
- Droit à la portabilité (art. 20)
- Droit d'opposition (art. 21)
- Droit à la limitation (art. 18)

Pour exercer vos droits, contactez-nous à : [email DPO]

8. RÉCLAMATION

Vous pouvez introduire une réclamation auprès de la CNIL :
www.cnil.fr`,
  },
  legal_mentions: {
    title: 'Mentions Légales',
    description: 'Modèle de mentions légales pour site web (RGPD)',
    content: `MENTIONS LÉGALES

1. ÉDITEUR DU SITE

${orgName}
[Forme juridique]
[Capital social]
[Adresse du siège]
[Numéro SIRET/SIREN]
[RCS]

Directeur de la publication : [Nom]
Contact : [Email]

2. HÉBERGEUR

[Nom de l'hébergeur]
[Adresse]
[Téléphone]

3. PROPRIÉTÉ INTELLECTUELLE

L'ensemble des contenus présents sur ce site sont protégés par les lois relatives à la propriété intellectuelle.

4. PROTECTION DES DONNÉES PERSONNELLES

Pour toute information relative à la protection de vos données personnelles, veuillez consulter notre Politique de Confidentialité.

Délégué à la Protection des Données (DPO) :
[Nom du DPO]
[Email du DPO]

Conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679), vous disposez de droits sur vos données personnelles.`,
  },
  breach_procedure: {
    title: 'Procédure Violations',
    description: 'Procédure de gestion des violations de données (RGPD)',
    content: `PROCÉDURE DE GESTION DES VIOLATIONS DE DONNÉES

${orgName}
Version 1.0 - ${new Date().toLocaleDateString('fr-FR')}

1. OBJET

Cette procédure définit les étapes à suivre en cas de violation de données personnelles conformément à l'article 33 du RGPD.

2. DÉFINITION

Une violation de données personnelles est une violation de la sécurité entraînant, de manière accidentelle ou illicite, la destruction, la perte, l'altération, la divulgation non autorisée de données personnelles.

3. DÉTECTION ET SIGNALEMENT

Toute personne ayant connaissance d'un incident doit :
- Signaler immédiatement l'incident au DPO
- Ne pas tenter de résoudre seul le problème
- Documenter les faits observés

4. ÉVALUATION (dans les 24h)

Le DPO doit :
- Évaluer la nature de la violation
- Identifier les données et personnes concernées
- Évaluer les risques pour les personnes
- Déterminer si une notification CNIL est nécessaire

5. NOTIFICATION CNIL (dans les 72h)

Si la violation présente un risque pour les droits des personnes :
- Notifier la CNIL via le téléservice
- Documenter la violation dans le registre interne

6. INFORMATION DES PERSONNES

Si le risque est élevé :
- Informer les personnes concernées sans délai
- Leur indiquer les mesures prises et recommandations

7. ACTIONS CORRECTIVES

- Mettre en place les mesures pour stopper la violation
- Prévenir les récidives
- Documenter les actions entreprises

8. CONTACTS

DPO : [Email DPO]
Responsable sécurité : [Email]
Téléservice CNIL : https://notifications.cnil.fr`,
  },
  rights_procedure: {
    title: 'Procédure Droits',
    description: 'Procédure de traitement des demandes de droits (RGPD)',
    content: `PROCÉDURE DE TRAITEMENT DES DEMANDES DE DROITS

${orgName}
Version 1.0 - ${new Date().toLocaleDateString('fr-FR')}

1. RÉCEPTION DE LA DEMANDE

À réception d'une demande d'exercice de droits :
- Enregistrer la demande dans le registre
- Noter la date de réception (début du délai d'1 mois)
- Accuser réception au demandeur

2. VÉRIFICATION D'IDENTITÉ

Avant tout traitement :
- Vérifier l'identité du demandeur
- En cas de doute, demander une pièce justificative
- Le délai est suspendu jusqu'à réception des justificatifs

3. ANALYSE DE LA DEMANDE

Identifier le(s) droit(s) exercé(s) conformément au RGPD :
- Droit d'accès (art. 15)
- Droit de rectification (art. 16)
- Droit à l'effacement (art. 17)
- Droit à la limitation (art. 18)
- Droit à la portabilité (art. 20)
- Droit d'opposition (art. 21)

4. TRAITEMENT

Selon le droit exercé :
- Collecter les données concernées
- Préparer la réponse
- Mettre en œuvre les actions demandées

5. DÉLAIS

- Délai de réponse : 1 mois
- Prolongation possible de 2 mois (demande complexe)
- Informer le demandeur de la prolongation

6. RÉPONSE

- Répondre de manière claire et accessible
- Fournir les données dans un format lisible
- Documenter la réponse dans le registre

7. REFUS

En cas de refus motivé :
- Expliquer les raisons
- Informer du droit de recours auprès de la CNIL

Contact DPO : [Email DPO]`,
  },
  subprocessor_clause: {
    title: 'Clause Sous-traitant',
    description: 'Clause contractuelle type pour sous-traitants (Art. 28 RGPD)',
    content: `CLAUSE DE PROTECTION DES DONNÉES PERSONNELLES
(Article 28 du RGPD)

Entre :
${orgName}, ci-après "le Responsable de traitement"
Et
[Nom du sous-traitant], ci-après "le Sous-traitant"

ARTICLE 1 - OBJET

Le Sous-traitant s'engage à traiter les données personnelles pour le compte du Responsable de traitement conformément au RGPD.

ARTICLE 2 - DESCRIPTION DU TRAITEMENT

- Nature du traitement : [Décrire]
- Finalité : [Décrire]
- Catégories de données : [Lister]
- Catégories de personnes : [Lister]
- Durée : [Durée du contrat]

ARTICLE 3 - OBLIGATIONS DU SOUS-TRAITANT

Le Sous-traitant s'engage à :

a) Traiter les données uniquement sur instruction documentée
b) Assurer la confidentialité des données
c) Prendre les mesures de sécurité appropriées
d) Ne pas recourir à un autre sous-traitant sans autorisation
e) Aider le Responsable à répondre aux demandes de droits
f) Aider le Responsable en matière de sécurité et de notification
g) Supprimer ou restituer les données en fin de contrat
h) Mettre à disposition les informations pour démontrer la conformité

ARTICLE 4 - SOUS-TRAITANCE ULTÉRIEURE

Toute sous-traitance ultérieure requiert l'autorisation préalable écrite du Responsable de traitement.

ARTICLE 5 - TRANSFERTS HORS UE

[Si applicable : décrire les garanties]

ARTICLE 6 - AUDITS

Le Responsable de traitement peut effectuer des audits pour vérifier la conformité.

ARTICLE 7 - NOTIFICATION DES VIOLATIONS

Le Sous-traitant notifie toute violation de données dans les 72 heures conformément à l'article 33 du RGPD.

Fait à [Lieu], le [Date]

Pour le Responsable de traitement    Pour le Sous-traitant
[Signature]                          [Signature]`,
  },
});


export function DocumentTemplatesPanel({ organisation }: DocumentTemplatesPanelProps) {
  const { toast } = useToast();
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const orgName = organisation?.name || '[NOM DE L\'ORGANISATION]';
  const templates = getRGPDTemplates(orgName);

  const handleCopy = async (templateKey: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedTemplate(templateKey);
      toast({
        title: 'Copié !',
        description: 'Le modèle a été copié dans le presse-papiers',
      });
      setTimeout(() => setCopiedTemplate(null), 2000);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le texte',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (title: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Téléchargé !',
      description: 'Le document a été téléchargé',
    });
  };

  const templateEntries = Object.entries(templates);
  const defaultTab = templateEntries[0]?.[0] || '';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Modèles de Documents
            <Badge variant="default" className="ml-2">
              <Scale className="h-3 w-3 mr-1" />
              RGPD
            </Badge>
          </CardTitle>
          <CardDescription>
            Modèles de documents RGPD adaptables à votre organisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="space-y-4">
            <TabsList className="flex-wrap h-auto gap-2">
              {templateEntries.map(([key, template]) => (
                <TabsTrigger key={key} value={key} className="whitespace-nowrap">
                  {template.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {templateEntries.map(([key, template]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{template.title}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(key, template.content)}
                    >
                      {copiedTemplate === key ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copié
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copier
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(template.title, template.content)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={template.content}
                  readOnly
                  className="min-h-[500px] font-mono text-sm"
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
