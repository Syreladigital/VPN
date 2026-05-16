import { useState } from 'react';
import { Organisation, LegalFramework } from '@/types/rgpd';
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

const getTunisianTemplates = (orgName: string): Record<string, DocumentTemplate> => ({
  privacy_policy_tn: {
    title: 'Politique de Confidentialité',
    description: 'Modèle conforme au Projet de loi organique n° 2025/95',
    content: `POLITIQUE DE PROTECTION DES DONNÉES PERSONNELLES

Conformément au Projet de loi organique n° 2025/95 relative à la protection des données personnelles

Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}

1. IDENTITÉ DU RESPONSABLE DE TRAITEMENT

${orgName}
[Adresse en Tunisie]
[Email de contact]
[Matricule fiscal]

2. AUTORITÉ DE CONTRÔLE

Instance Nationale de Protection des Données Personnelles (INPDP)
Site : www.inpdp.tn

3. DONNÉES COLLECTÉES (Article 4)

Nous collectons les catégories de données suivantes :
- Données d'identification (nom, prénom, CIN, email)
- [Ajouter les catégories pertinentes]

4. FINALITÉS DU TRAITEMENT (Article 6)

Conformément à l'article 6 du Projet de loi 2025/95, vos données sont traitées pour des finalités déterminées, explicites et légitimes :
- [Finalité 1]
- [Finalité 2]

5. BASE LÉGALE (Articles 15-16)

Le traitement de vos données est fondé sur :
- Votre consentement libre, spécifique et éclairé
- L'exécution d'un contrat
- Une obligation légale
- L'intérêt public

6. DESTINATAIRES DES DONNÉES

Vos données peuvent être transmises à :
- Nos sous-traitants autorisés
- [Autres destinataires]

7. DURÉE DE CONSERVATION (Article 10)

Vos données sont conservées pour une durée limitée aux finalités du traitement.

8. VOS DROITS (Titre III - Articles 12 à 34)

Conformément au Projet de loi organique n° 2025/95, vous disposez des droits suivants :
- Droit à l'information (art. 12-13)
- Droit d'accès dans un délai de 15 jours (art. 21-22)
- Droit de rectification
- Droit d'opposition (art. 29)
- Droit à la portabilité (art. 32)
- Droit à l'oubli (art. 34)

Pour exercer vos droits : [email contact]

9. RÉCLAMATION

Vous pouvez introduire une réclamation auprès de l'INPDP :
Instance Nationale de Protection des Données Personnelles
www.inpdp.tn`,
  },
  legal_mentions_tn: {
    title: 'Mentions Légales',
    description: 'Modèle de mentions légales (Projet de loi tunisienne 2025/95)',
    content: `MENTIONS LÉGALES

1. ÉDITEUR DU SITE

${orgName}
[Forme juridique]
[Capital social en Dinars Tunisiens]
[Adresse du siège en Tunisie]
[Matricule fiscal]
[Registre du Commerce]

Directeur de la publication : [Nom]
Contact : [Email]

2. HÉBERGEUR

[Nom de l'hébergeur]
[Adresse]
[Téléphone]

3. PROPRIÉTÉ INTELLECTUELLE

L'ensemble des contenus présents sur ce site sont protégés par les lois tunisiennes relatives à la propriété intellectuelle.

4. PROTECTION DES DONNÉES PERSONNELLES

Conformément au Projet de loi organique n° 2025/95 relative à la protection des données personnelles, nous garantissons la protection de vos données.

Chargé de la Protection des Données :
[Nom]
[Email]

Autorité de contrôle :
Instance Nationale de Protection des Données Personnelles (INPDP)
www.inpdp.tn

5. DISPOSITIONS LÉGALES APPLICABLES

Le présent site est soumis au droit tunisien. Tout litige sera soumis aux juridictions tunisiennes compétentes.`,
  },
  inpdp_authorization: {
    title: 'Demande Autorisation INPDP',
    description: 'Formulaire de demande d\'autorisation préalable (Art. 41)',
    content: `DEMANDE D'AUTORISATION PRÉALABLE DE TRAITEMENT
À l'attention de l'Instance Nationale de Protection des Données Personnelles (INPDP)

Conformément à l'article 41 du Projet de loi organique n° 2025/95

Date : ${new Date().toLocaleDateString('fr-FR')}

1. IDENTIFICATION DU RESPONSABLE DE TRAITEMENT

Raison sociale : ${orgName}
Forme juridique : [Forme juridique]
Matricule fiscal : [Numéro]
Adresse du siège : [Adresse complète]
Téléphone : [Numéro]
Email : [Email]

Représentant légal :
Nom et prénom : [Nom]
Qualité : [Fonction]

2. CHARGÉ DE LA PROTECTION DES DONNÉES (si désigné)

Nom et prénom : [Nom]
Email : [Email]
Téléphone : [Numéro]

3. DESCRIPTION DU TRAITEMENT

3.1 Dénomination du traitement :
[Nom du traitement]

3.2 Finalité(s) du traitement (Article 6) :
[Décrire les finalités précises]

3.3 Base légale du traitement (Articles 15-16) :
☐ Consentement de la personne concernée
☐ Exécution d'un contrat
☐ Obligation légale
☐ Intérêt public
☐ Intérêts vitaux de la personne

4. CATÉGORIES DE DONNÉES TRAITÉES

4.1 Données d'identification :
☐ Nom, prénom
☐ CIN / Passeport
☐ Adresse
☐ Email, téléphone
☐ Autres : [Préciser]

4.2 Données sensibles (Article 40) - Justification requise :
☐ Données de santé
☐ Données biométriques
☐ Opinions politiques
☐ Convictions religieuses
☐ Origine ethnique
☐ Vie sexuelle
☐ Données génétiques

Justification du traitement des données sensibles :
[Expliquer la nécessité et les garanties]

5. CATÉGORIES DE PERSONNES CONCERNÉES

☐ Clients
☐ Employés
☐ Fournisseurs
☐ Patients (si secteur santé)
☐ Autres : [Préciser]

Nombre estimé de personnes : [Nombre]

6. DESTINATAIRES DES DONNÉES

6.1 Destinataires internes :
[Lister les services]

6.2 Sous-traitants (le cas échéant) :
[Nom et activité de chaque sous-traitant]

6.3 Transferts hors Tunisie :
☐ Oui → Pays de destination : [Pays]
         Garanties : [Décrire les garanties]
☐ Non

7. DURÉE DE CONSERVATION

[Préciser la durée pour chaque catégorie de données]

8. MESURES DE SÉCURITÉ

8.1 Mesures techniques :
☐ Chiffrement des données
☐ Contrôle d'accès
☐ Journalisation des accès
☐ Sauvegarde régulière
☐ Autres : [Préciser]

8.2 Mesures organisationnelles :
☐ Formation du personnel
☐ Politique de confidentialité
☐ Procédure de gestion des incidents
☐ Autres : [Préciser]

9. DROITS DES PERSONNES CONCERNÉES

Modalités d'exercice des droits (Articles 12 à 34) :
- Point de contact : [Email/Adresse]
- Délai de réponse : 15 jours (droit d'accès)

10. PIÈCES JOINTES

☐ Copie du registre du commerce
☐ Copie du matricule fiscal
☐ Politique de confidentialité
☐ Contrats avec les sous-traitants (si applicable)
☐ Analyse d'impact (si données sensibles)

11. ENGAGEMENT

Je soussigné(e), [Nom], en qualité de [Fonction], certifie l'exactitude des informations fournies et m'engage à respecter les dispositions du Projet de loi organique n° 2025/95 relative à la protection des données personnelles.

Fait à [Ville], le [Date]

Signature et cachet :


________________________________

À envoyer à :
Instance Nationale de Protection des Données Personnelles (INPDP)
[Adresse INPDP]
www.inpdp.tn`,
  },
  breach_procedure_tn: {
    title: 'Procédure Violations',
    description: 'Procédure de gestion des violations (Projet de loi 2025/95)',
    content: `PROCÉDURE DE GESTION DES VIOLATIONS DE DONNÉES PERSONNELLES

${orgName}
Conformément au Projet de loi organique n° 2025/95
Version 1.0 - ${new Date().toLocaleDateString('fr-FR')}

1. OBJET

Cette procédure définit les étapes à suivre en cas de violation de données personnelles conformément au Projet de loi organique n° 2025/95.

2. DÉFINITION

Une violation de données personnelles est une violation de la sécurité entraînant, de manière accidentelle ou illicite, la destruction, la perte, l'altération, la divulgation non autorisée de données personnelles.

3. DÉTECTION ET SIGNALEMENT INTERNE

Toute personne ayant connaissance d'un incident doit :
- Signaler immédiatement l'incident au Chargé de la Protection des Données
- Documenter les faits observés (date, heure, circonstances)
- Ne pas tenter de résoudre seul le problème

4. ÉVALUATION INITIALE (dans les 24h)

Le Chargé de la Protection des Données doit :
- Évaluer la nature et la gravité de la violation
- Identifier les catégories de données concernées
- Estimer le nombre de personnes affectées
- Évaluer les conséquences potentielles
- Déterminer si des données sensibles (Art. 40) sont concernées

5. NOTIFICATION À L'INPDP

Si la violation présente un risque pour les droits des personnes :
- Notifier l'Instance Nationale de Protection des Données Personnelles (INPDP)
- Délai : dans les meilleurs délais
- Contenu de la notification :
  • Nature de la violation
  • Catégories et nombre de personnes concernées
  • Catégories et volume de données concernées
  • Conséquences probables
  • Mesures prises ou envisagées

Contact INPDP : www.inpdp.tn

6. INFORMATION DES PERSONNES CONCERNÉES

Si le risque est élevé pour les droits et libertés :
- Informer les personnes concernées sans délai
- Communication claire et accessible
- Contenu :
  • Nature de la violation
  • Coordonnées du Chargé de la Protection des Données
  • Conséquences probables
  • Mesures prises et recommandations

7. MESURES CORRECTIVES

- Stopper immédiatement la violation si possible
- Sécuriser les systèmes affectés
- Préserver les preuves
- Mettre en place les correctifs nécessaires

8. DOCUMENTATION

Tenir un registre des violations contenant :
- Date et heure de découverte
- Nature de la violation
- Données et personnes concernées
- Évaluation des risques
- Mesures prises
- Notification INPDP (si applicable)
- Information des personnes (si applicable)

9. SANCTIONS (Articles 125-128)

Rappel : Les violations peuvent entraîner :
- Amendes de 2 000 à 100 000 Dinars Tunisiens
- Peines d'emprisonnement jusqu'à 5 ans pour violations graves
- Amendes jusqu'à 200 000 Dinars pour cas graves

10. CONTACTS

Chargé de la Protection des Données : [Email]
Responsable sécurité : [Email]
INPDP : www.inpdp.tn`,
  },
  rights_procedure_tn: {
    title: 'Procédure Droits',
    description: 'Procédure de traitement des demandes (Projet de loi 2025/95)',
    content: `PROCÉDURE DE TRAITEMENT DES DEMANDES DE DROITS

${orgName}
Conformément au Titre III du Projet de loi organique n° 2025/95
Version 1.0 - ${new Date().toLocaleDateString('fr-FR')}

1. RÉCEPTION DE LA DEMANDE

À réception d'une demande d'exercice de droits :
- Enregistrer la demande dans le registre
- Noter la date de réception (début du délai légal)
- Accuser réception au demandeur

2. VÉRIFICATION D'IDENTITÉ

Avant tout traitement :
- Vérifier l'identité du demandeur (CIN, passeport)
- En cas de doute, demander une pièce justificative
- Le délai est suspendu jusqu'à réception des justificatifs

3. ANALYSE DE LA DEMANDE

Identifier le(s) droit(s) exercé(s) selon le Projet de loi 2025/95 :

Section 1 - Droit à l'information (Art. 12-13) :
- Information sur les données traitées
- Source des données (si non collectées directement)

Section 2 - Droit au consentement (Art. 15-17) :
- Retrait du consentement

Section 3 - Droit d'accès (Art. 21-22) :
- Accès aux données personnelles
- DÉLAI : 15 JOURS

Section 4 - Droit d'opposition (Art. 29) :
- Opposition au traitement pour motifs légitimes

Section 5 - Droit à la portabilité (Art. 32) :
- Réception des données dans un format structuré
- Transmission à un autre responsable

Section 6 - Droit à l'oubli (Art. 34) :
- Effacement des données

4. TRAITEMENT

Selon le droit exercé :
- Collecter les données concernées auprès des systèmes
- Préparer la réponse appropriée
- Mettre en œuvre les actions demandées

5. DÉLAIS LÉGAUX

- Droit d'accès : 15 jours (Article 22)
- Autres droits : délai raisonnable
- En cas de complexité, informer le demandeur

6. RÉPONSE

- Répondre de manière claire et accessible
- Fournir les données dans un format lisible (portabilité)
- Documenter la réponse dans le registre

7. MOTIFS DE REFUS (si applicable)

Le refus peut être motivé par :
- Impossibilité d'identifier le demandeur
- Demande manifestement infondée ou excessive
- Droits d'autrui
- Obligation légale de conservation
- Intérêt public

En cas de refus :
- Expliquer les raisons
- Informer du droit de recours auprès de l'INPDP

8. REGISTRE DES DEMANDES

Documenter pour chaque demande :
- Date de réception
- Identité du demandeur
- Type de droit exercé
- Actions effectuées
- Date de réponse
- Éventuels motifs de refus

9. CONTACTS

Chargé de la Protection des Données : [Email]
INPDP : www.inpdp.tn`,
  },
  subprocessor_clause_tn: {
    title: 'Clause Sous-traitant',
    description: 'Clause contractuelle pour sous-traitants (Projet de loi 2025/95)',
    content: `CLAUSE DE PROTECTION DES DONNÉES PERSONNELLES
Conformément au Projet de loi organique n° 2025/95 relative à la protection des données personnelles

Entre :
${orgName}, ci-après "le Responsable de traitement"
[Adresse]
[Matricule fiscal]

Et
[Nom du sous-traitant], ci-après "le Sous-traitant"
[Adresse]
[Matricule fiscal]

ARTICLE 1 - OBJET

Le Sous-traitant s'engage à traiter les données personnelles pour le compte du Responsable de traitement conformément au Projet de loi organique n° 2025/95.

ARTICLE 2 - DÉFINITIONS (Article 4 de la Loi)

- Responsable du traitement : Personne déterminant les finalités et moyens du traitement
- Sous-traitant : Personne traitant les données pour le compte du responsable
- Données personnelles : Toute information permettant d'identifier une personne physique

ARTICLE 3 - DESCRIPTION DU TRAITEMENT

- Nature du traitement : [Décrire]
- Finalité (art. 6) : [Décrire les finalités explicites et légitimes]
- Catégories de données : [Lister]
- Catégories de personnes concernées : [Lister]
- Durée : [Durée du contrat]

ARTICLE 4 - OBLIGATIONS DU SOUS-TRAITANT

Le Sous-traitant s'engage à :

a) Traiter les données uniquement sur instruction documentée du Responsable
b) Garantir la confidentialité des données traitées
c) Veiller à ce que les personnes autorisées à traiter les données soient soumises à une obligation de confidentialité
d) Prendre toutes les mesures de sécurité appropriées
e) Ne pas recourir à un autre sous-traitant sans autorisation préalable écrite
f) Aider le Responsable à répondre aux demandes d'exercice des droits (art. 12 à 34)
g) Aider le Responsable en matière de sécurité et de notification des violations
h) Supprimer ou restituer les données en fin de contrat, au choix du Responsable
i) Mettre à disposition les informations nécessaires pour démontrer le respect de la Loi

ARTICLE 5 - DONNÉES SENSIBLES (Article 40)

Si le traitement concerne des données sensibles :
- Le Sous-traitant s'engage à respecter les exigences spécifiques de l'article 40
- Une autorisation préalable de l'INPDP peut être requise (art. 41)

ARTICLE 6 - SOUS-TRAITANCE ULTÉRIEURE

Toute sous-traitance ultérieure requiert l'autorisation préalable écrite du Responsable.
Le Sous-traitant impose au sous-traitant ultérieur les mêmes obligations.

ARTICLE 7 - TRANSFERTS HORS TUNISIE

Tout transfert de données hors de Tunisie est soumis à autorisation préalable du Responsable et doit respecter les exigences du Projet de loi 2025/95.
[Si applicable : décrire les garanties et le pays de destination]

ARTICLE 8 - DROITS DES PERSONNES CONCERNÉES

Le Sous-traitant aide le Responsable à répondre aux demandes d'exercice des droits :
- Droit d'accès (15 jours - art. 22)
- Droit d'opposition (art. 29)
- Droit à la portabilité (art. 32)
- Droit à l'oubli (art. 34)

ARTICLE 9 - SÉCURITÉ DES DONNÉES

Le Sous-traitant met en œuvre les mesures techniques et organisationnelles appropriées :
- [Lister les mesures de sécurité]

ARTICLE 10 - NOTIFICATION DES VIOLATIONS

Le Sous-traitant notifie toute violation de données au Responsable dans les plus brefs délais.
La notification comprend : nature, données concernées, conséquences, mesures prises.

ARTICLE 11 - AUDITS

Le Responsable de traitement peut effectuer des audits pour vérifier le respect de la Loi et du présent contrat.

ARTICLE 12 - SANCTIONS

Rappel : Le non-respect du Projet de loi 2025/95 peut entraîner :
- Amendes de 2 000 à 100 000 Dinars Tunisiens (art. 125)
- Peines d'emprisonnement et amendes jusqu'à 200 000 Dinars pour cas graves (art. 128)

ARTICLE 13 - DURÉE

Le présent contrat prend effet à compter de [Date] et prend fin [conditions de fin].

ARTICLE 14 - DROIT APPLICABLE

Le présent contrat est régi par le droit tunisien, notamment le Projet de loi organique n° 2025/95.

Fait à [Ville], le [Date]
En deux exemplaires originaux

Pour le Responsable de traitement    Pour le Sous-traitant
${orgName}                           [Nom du sous-traitant]

[Signature et cachet]                [Signature et cachet]

_______________________              _______________________`,
  },
  health_authorization_tn: {
    title: 'Autorisation Données Santé',
    description: 'Demande d\'autorisation pour données de santé (Art. 70-73)',
    content: `DEMANDE D'AUTORISATION DE TRAITEMENT DE DONNÉES DE SANTÉ
À l'attention de l'Instance Nationale de Protection des Données Personnelles (INPDP)

Conformément aux articles 70 à 73 du Projet de loi organique n° 2025/95

Date : ${new Date().toLocaleDateString('fr-FR')}

1. IDENTIFICATION DU RESPONSABLE DE TRAITEMENT

Raison sociale : ${orgName}
Secteur : Santé
Matricule fiscal : [Numéro]
Adresse : [Adresse complète]
Téléphone : [Numéro]
Email : [Email]

2. QUALIFICATION PROFESSIONNELLE (Article 73)

Conformément à l'article 73, seuls les professionnels de santé ou personnes soumises au secret professionnel peuvent traiter ces données.

☐ Médecin inscrit à l'Ordre des Médecins
☐ Pharmacien inscrit à l'Ordre des Pharmaciens
☐ Établissement de santé agréé
☐ Personnel soumis au secret professionnel

Numéro d'inscription à l'Ordre : [Si applicable]
Agrément sanitaire : [Si applicable]

3. DESCRIPTION DU TRAITEMENT DE DONNÉES DE SANTÉ

3.1 Dénomination du traitement :
[Nom du traitement]

3.2 Finalité(s) spécifique(s) :
☐ Prise en charge médicale du patient
☐ Gestion du dossier médical
☐ Suivi thérapeutique
☐ Télémédecine
☐ Recherche médicale (avec consentement)
☐ Pharmacovigilance
☐ Autres : [Préciser]

4. CATÉGORIES DE DONNÉES DE SANTÉ TRAITÉES

☐ Antécédents médicaux
☐ Diagnostics
☐ Prescriptions et ordonnances
☐ Résultats d'analyses et examens
☐ Données génétiques
☐ Données biométriques
☐ Dossier médical électronique
☐ Autres : [Préciser]

5. PERSONNES CONCERNÉES

☐ Patients
☐ Personnels soignants (médecine du travail)
☐ Autres : [Préciser]

Nombre estimé : [Nombre]

6. ACCÈS AUX DONNÉES (Article 73)

Personnes autorisées à accéder aux données :
- [Fonction - Justification]
- [Fonction - Justification]

Mesures de contrôle d'accès :
[Décrire les mesures]

7. MESURES DE SÉCURITÉ RENFORCÉES

7.1 Mesures techniques :
☐ Chiffrement des données de santé
☐ Authentification forte
☐ Traçabilité des accès
☐ Hébergement certifié santé (si applicable)
☐ Pseudonymisation/Anonymisation
☐ Cloisonnement des données

7.2 Mesures organisationnelles :
☐ Politique de sécurité spécifique
☐ Formation au secret médical
☐ Procédure de gestion des incidents
☐ Audit régulier

8. DURÉE DE CONSERVATION

Conformément à la réglementation sanitaire :
- Dossier médical : [Durée]
- Ordonnances : [Durée]
- Résultats d'analyses : [Durée]

9. SOUS-TRAITANTS (hébergeurs, éditeurs de logiciels)

[Nom] - [Activité] - [Garanties de sécurité]

10. DROITS DES PATIENTS

Modalités d'exercice des droits :
- Point de contact : [Email/Adresse]
- Délai d'accès : 15 jours (art. 22)

11. PIÈCES JOINTES

☐ Copie de l'inscription à l'Ordre professionnel
☐ Agrément sanitaire (établissements)
☐ Politique de sécurité des données de santé
☐ Contrats avec hébergeurs/sous-traitants
☐ Modèle de formulaire de consentement

12. ENGAGEMENT

Je soussigné(e), [Nom], en qualité de [Fonction], certifie être habilité(e) au traitement de données de santé conformément à l'article 73 de la Loi organique n° 2025/95 et m'engage à respecter le secret professionnel.

Fait à [Ville], le [Date]

Signature et cachet :


________________________________

À envoyer à :
Instance Nationale de Protection des Données Personnelles (INPDP)
www.inpdp.tn`,
  },
});

export function DocumentTemplatesPanel({ organisation }: DocumentTemplatesPanelProps) {
  const { toast } = useToast();
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const orgName = organisation?.name || '[NOM DE L\'ORGANISATION]';
  const legalFramework = organisation?.legalFramework || 'rgpd_eu';
  const isTunisian = legalFramework === 'loi_tunisie_2025';

  const templates = isTunisian 
    ? getTunisianTemplates(orgName)
    : getRGPDTemplates(orgName);

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
            <Badge variant={isTunisian ? "secondary" : "default"} className="ml-2">
              <Scale className="h-3 w-3 mr-1" />
              {isTunisian ? 'Projet de loi 2025/95' : 'RGPD'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {isTunisian 
              ? 'Modèles de documents conformes au Projet de loi organique n° 2025/95 et adaptés aux exigences de l\'INPDP'
              : 'Modèles de documents RGPD adaptables à votre organisation'
            }
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
