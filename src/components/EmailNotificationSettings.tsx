import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useEmailNotificationSettings } from '@/hooks/useEmailNotificationSettings';
import { Mail, Plus, X, Send, Settings, Bell, Shield, Users, FileText, Loader2, AlertTriangle, Building, ListChecks } from 'lucide-react';
import EmailLogsPanel from './EmailLogsPanel';
import EmailTemplateEditor from './EmailTemplateEditor';
import GenericEmailTemplateEditor from './GenericEmailTemplateEditor';
interface EmailNotificationSettingsProps {
  organisationId?: string;
}

const EmailNotificationSettings = ({ organisationId }: EmailNotificationSettingsProps) => {
  const { settings, loading, saving, saveSettings, sendTestEmail } = useEmailNotificationSettings(organisationId);
  
  const [enabled, setEnabled] = useState(true);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [notifyBreaches, setNotifyBreaches] = useState(true);
  const [notifyRightsRequests, setNotifyRightsRequests] = useState(true);
  const [notifySubprocessors, setNotifySubprocessors] = useState(true);
  const [notifyCorrectiveActions, setNotifyCorrectiveActions] = useState(true);
  const [notifyRequesterOnStatusChange, setNotifyRequesterOnStatusChange] = useState(true);
  const [breachReminderHours, setBreachReminderHours] = useState(48);
  const [rightsReminderDays, setRightsReminderDays] = useState(7);
  const [subprocessorReminderDays, setSubprocessorReminderDays] = useState(30);
  const [correctiveActionsReminderDays, setCorrectiveActionsReminderDays] = useState(7);
  const [senderName, setSenderName] = useState('Syrela Trust');
  const [replyToEmail, setReplyToEmail] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  
  // Rights request email template states
  const [subjectTemplate, setSubjectTemplate] = useState('{{STATUS_EMOJI}} Votre demande de droits a été {{STATUS_TEXT}}');
  const [bodyTemplate, setBodyTemplate] = useState(`Bonjour {{REQUESTER_NAME}},

{{STATUS_MESSAGE}}

{{RESPONSE_CONTENT}}

Cordialement,
L'équipe {{ORGANISATION_NAME}}`);
  const [completedMessage, setCompletedMessage] = useState("Nous avons le plaisir de vous informer que votre demande d'exercice de votre {{RIGHT_TYPE}} a été traitée avec succès.");
  const [rejectedMessage, setRejectedMessage] = useState("Suite à votre demande d'exercice de votre {{RIGHT_TYPE}}, nous vous informons que celle-ci n'a pas pu être satisfaite.");
  const [inProgressMessage, setInProgressMessage] = useState("Nous vous informons que votre demande d'exercice de votre {{RIGHT_TYPE}} est en cours de traitement.");

  // Data breach email template states
  const [breachSubjectTemplate, setBreachSubjectTemplate] = useState('{{SEVERITY_EMOJI}} Alerte violation de données - {{BREACH_NATURE}}');
  const [breachBodyTemplate, setBreachBodyTemplate] = useState(`Bonjour,

Une violation de données a été détectée et nécessite votre attention.

Nature : {{BREACH_NATURE}}
Date de la violation : {{BREACH_DATE}}
Date de découverte : {{DISCOVERY_DATE}}
Échéance notification CNIL : {{NOTIFICATION_DEADLINE}}

{{ADDITIONAL_INFO}}

Cordialement,
L'équipe {{ORGANISATION_NAME}}`);

  // Subprocessor email template states
  const [subprocessorSubjectTemplate, setSubprocessorSubjectTemplate] = useState('📋 Rappel : Révision sous-traitant - {{SUBPROCESSOR_NAME}}');
  const [subprocessorBodyTemplate, setSubprocessorBodyTemplate] = useState(`Bonjour,

Un rappel de révision pour un sous-traitant est prévu.

Sous-traitant : {{SUBPROCESSOR_NAME}}
Activité : {{SUBPROCESSOR_ACTIVITY}}
Date de révision prévue : {{REVIEW_DATE}}
Localisation : {{SUBPROCESSOR_LOCATION}}

{{ADDITIONAL_INFO}}

Cordialement,
L'équipe {{ORGANISATION_NAME}}`);

  useEffect(() => {
    if (settings) {
      setEnabled(settings.enabled);
      setRecipients(settings.email_recipients || []);
      setNotifyBreaches(settings.notify_breaches);
      setNotifyRightsRequests(settings.notify_rights_requests);
      setNotifySubprocessors(settings.notify_subprocessors);
      setNotifyCorrectiveActions((settings as any).notify_corrective_actions ?? true);
      setNotifyRequesterOnStatusChange(settings.notify_requester_on_status_change ?? true);
      setBreachReminderHours(settings.breach_reminder_hours);
      setRightsReminderDays(settings.rights_reminder_days);
      setSubprocessorReminderDays(settings.subprocessor_reminder_days);
      setSenderName(settings.sender_name || 'Syrela Trust');
      setReplyToEmail(settings.reply_to_email || '');
      // Load rights request email templates
      if (settings.rights_email_subject_template) setSubjectTemplate(settings.rights_email_subject_template);
      if (settings.rights_email_body_template) setBodyTemplate(settings.rights_email_body_template);
      if (settings.rights_email_completed_message) setCompletedMessage(settings.rights_email_completed_message);
      if (settings.rights_email_rejected_message) setRejectedMessage(settings.rights_email_rejected_message);
      if (settings.rights_email_in_progress_message) setInProgressMessage(settings.rights_email_in_progress_message);
      // Load breach email templates
      if (settings.breach_email_subject_template) setBreachSubjectTemplate(settings.breach_email_subject_template);
      if (settings.breach_email_body_template) setBreachBodyTemplate(settings.breach_email_body_template);
      // Load subprocessor email templates
      if (settings.subprocessor_email_subject_template) setSubprocessorSubjectTemplate(settings.subprocessor_email_subject_template);
      if (settings.subprocessor_email_body_template) setSubprocessorBodyTemplate(settings.subprocessor_email_body_template);
    }
  }, [settings]);

  const handleAddEmail = () => {
    if (newEmail && !recipients.includes(newEmail) && newEmail.includes('@')) {
      setRecipients([...recipients, newEmail]);
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleSave = async () => {
    await saveSettings({
      enabled,
      email_recipients: recipients,
      notify_breaches: notifyBreaches,
      notify_rights_requests: notifyRightsRequests,
      notify_subprocessors: notifySubprocessors,
      notify_corrective_actions: notifyCorrectiveActions,
      notify_requester_on_status_change: notifyRequesterOnStatusChange,
      breach_reminder_hours: breachReminderHours,
      rights_reminder_days: rightsReminderDays,
      subprocessor_reminder_days: subprocessorReminderDays,
      sender_name: senderName,
      reply_to_email: replyToEmail || null,
      // Rights request email templates
      rights_email_subject_template: subjectTemplate,
      rights_email_body_template: bodyTemplate,
      rights_email_completed_message: completedMessage,
      rights_email_rejected_message: rejectedMessage,
      rights_email_in_progress_message: inProgressMessage,
      // Breach email templates
      breach_email_subject_template: breachSubjectTemplate,
      breach_email_body_template: breachBodyTemplate,
      // Subprocessor email templates
      subprocessor_email_subject_template: subprocessorSubjectTemplate,
      subprocessor_email_body_template: subprocessorBodyTemplate,
    });
  };

  const handleSendTest = async () => {
    if (!testEmail) return;
    setSendingTest(true);
    await sendTestEmail(testEmail);
    setSendingTest(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Notifications par email</CardTitle>
                <CardDescription>
                  Configurez les alertes email pour les échéances RGPD critiques
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="enabled" className="text-sm">Activé</Label>
              <Switch
                id="enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Recipients */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Destinataires
            </Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@exemple.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
              />
              <Button variant="outline" onClick={handleAddEmail}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recipients.map((email) => (
                <Badge key={email} variant="secondary" className="pl-3 pr-1 py-1">
                  {email}
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="ml-2 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {recipients.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun destinataire configuré</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Sender Settings */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Paramètres d'expédition
            </Label>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="senderName" className="text-sm text-muted-foreground">
                  Nom de l'expéditeur
                </Label>
                <Input
                  id="senderName"
                  placeholder="Syrela Trust"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="replyToEmail" className="text-sm text-muted-foreground">
                  Adresse de réponse (Reply-To)
                </Label>
                <Input
                  id="replyToEmail"
                  type="email"
                  placeholder="contact@exemple.com"
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Types */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Types de notifications
            </Label>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium">Violations de données</p>
                    <p className="text-sm text-muted-foreground">
                      Rappel {breachReminderHours}h avant la limite de 72h
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    className="w-20"
                    value={breachReminderHours}
                    onChange={(e) => setBreachReminderHours(parseInt(e.target.value) || 48)}
                    min={1}
                    max={72}
                  />
                  <span className="text-sm text-muted-foreground">heures</span>
                  <Switch
                    checked={notifyBreaches}
                    onCheckedChange={setNotifyBreaches}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium">Demandes de droits</p>
                    <p className="text-sm text-muted-foreground">
                      Rappel {rightsReminderDays} jours avant l'échéance
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    className="w-20"
                    value={rightsReminderDays}
                    onChange={(e) => setRightsReminderDays(parseInt(e.target.value) || 7)}
                    min={1}
                    max={30}
                  />
                  <span className="text-sm text-muted-foreground">jours</span>
                  <Switch
                    checked={notifyRightsRequests}
                    onCheckedChange={setNotifyRightsRequests}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Révision sous-traitants</p>
                    <p className="text-sm text-muted-foreground">
                      Rappel {subprocessorReminderDays} jours avant révision
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    className="w-20"
                    value={subprocessorReminderDays}
                    onChange={(e) => setSubprocessorReminderDays(parseInt(e.target.value) || 30)}
                    min={1}
                    max={90}
                  />
                  <span className="text-sm text-muted-foreground">jours</span>
                  <Switch
                    checked={notifySubprocessors}
                    onCheckedChange={setNotifySubprocessors}
                  />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <ListChecks className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Actions correctives</p>
                    <p className="text-sm text-muted-foreground">
                      Rappel {correctiveActionsReminderDays} jours avant l'échéance
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    className="w-20"
                    value={correctiveActionsReminderDays}
                    onChange={(e) => setCorrectiveActionsReminderDays(parseInt(e.target.value) || 7)}
                    min={1}
                    max={30}
                  />
                  <span className="text-sm text-muted-foreground">jours</span>
                  <Switch
                    checked={notifyCorrectiveActions}
                    onCheckedChange={setNotifyCorrectiveActions}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Notification au demandeur</p>
                    <p className="text-sm text-muted-foreground">
                      Envoyer un email au demandeur lors du traitement de sa demande de droits
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifyRequesterOnStatusChange}
                  onCheckedChange={setNotifyRequesterOnStatusChange}
                />
              </div>
            </div>
          </div>
          </div>

          <Separator />

          {/* Rights Request Email Template Editor */}
          <EmailTemplateEditor
            subjectTemplate={subjectTemplate}
            bodyTemplate={bodyTemplate}
            completedMessage={completedMessage}
            rejectedMessage={rejectedMessage}
            inProgressMessage={inProgressMessage}
            onSubjectChange={setSubjectTemplate}
            onBodyChange={setBodyTemplate}
            onCompletedMessageChange={setCompletedMessage}
            onRejectedMessageChange={setRejectedMessage}
            onInProgressMessageChange={setInProgressMessage}
          />

          {/* Data Breach Email Template Editor */}
          <GenericEmailTemplateEditor
            title="Modèle - Violations de données"
            description="Personnalisez les emails d'alerte pour les violations de données"
            icon={AlertTriangle}
            iconColor="text-destructive"
            subjectTemplate={breachSubjectTemplate}
            bodyTemplate={breachBodyTemplate}
            variables={[
              { name: '{{SEVERITY_EMOJI}}', description: 'Emoji de sévérité', sampleValue: '🚨' },
              { name: '{{BREACH_NATURE}}', description: 'Nature de la violation', sampleValue: 'Accès non autorisé aux données' },
              { name: '{{BREACH_DATE}}', description: 'Date de la violation', sampleValue: '15/01/2024' },
              { name: '{{DISCOVERY_DATE}}', description: 'Date de découverte', sampleValue: '16/01/2024' },
              { name: '{{NOTIFICATION_DEADLINE}}', description: 'Échéance notification CNIL', sampleValue: '18/01/2024' },
              { name: '{{ADDITIONAL_INFO}}', description: 'Informations supplémentaires', sampleValue: 'Veuillez prendre les mesures nécessaires.' },
              { name: '{{ORGANISATION_NAME}}', description: "Nom de l'organisation", sampleValue: 'Mon Organisation' },
            ]}
            defaultSubject="{{SEVERITY_EMOJI}} Alerte violation de données - {{BREACH_NATURE}}"
            defaultBody={`Bonjour,

Une violation de données a été détectée et nécessite votre attention.

Nature : {{BREACH_NATURE}}
Date de la violation : {{BREACH_DATE}}
Date de découverte : {{DISCOVERY_DATE}}
Échéance notification CNIL : {{NOTIFICATION_DEADLINE}}

{{ADDITIONAL_INFO}}

Cordialement,
L'équipe {{ORGANISATION_NAME}}`}
            onSubjectChange={setBreachSubjectTemplate}
            onBodyChange={setBreachBodyTemplate}
          />

          {/* Subprocessor Email Template Editor */}
          <GenericEmailTemplateEditor
            title="Modèle - Rappels sous-traitants"
            description="Personnalisez les emails de rappel pour la révision des sous-traitants"
            icon={Building}
            iconColor="text-blue-500"
            subjectTemplate={subprocessorSubjectTemplate}
            bodyTemplate={subprocessorBodyTemplate}
            variables={[
              { name: '{{SUBPROCESSOR_NAME}}', description: 'Nom du sous-traitant', sampleValue: 'AWS' },
              { name: '{{SUBPROCESSOR_ACTIVITY}}', description: 'Activité du sous-traitant', sampleValue: 'Hébergement cloud' },
              { name: '{{REVIEW_DATE}}', description: 'Date de révision prévue', sampleValue: '15/02/2024' },
              { name: '{{SUBPROCESSOR_LOCATION}}', description: 'Localisation', sampleValue: 'Irlande (UE)' },
              { name: '{{ADDITIONAL_INFO}}', description: 'Informations supplémentaires', sampleValue: 'Le contrat expire dans 30 jours.' },
              { name: '{{ORGANISATION_NAME}}', description: "Nom de l'organisation", sampleValue: 'Mon Organisation' },
            ]}
            defaultSubject="📋 Rappel : Révision sous-traitant - {{SUBPROCESSOR_NAME}}"
            defaultBody={`Bonjour,

Un rappel de révision pour un sous-traitant est prévu.

Sous-traitant : {{SUBPROCESSOR_NAME}}
Activité : {{SUBPROCESSOR_ACTIVITY}}
Date de révision prévue : {{REVIEW_DATE}}
Localisation : {{SUBPROCESSOR_LOCATION}}

{{ADDITIONAL_INFO}}

Cordialement,
L'équipe {{ORGANISATION_NAME}}`}
            onSubjectChange={setSubprocessorSubjectTemplate}
            onBodyChange={setSubprocessorBodyTemplate}
          />

          <Separator />

          {/* Test Email */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Envoyer un email de notification au demandeur
            </Label>
            <p className="text-sm text-muted-foreground">
              Envoyer un email réel au client pour l'informer du traitement de sa demande de droits
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Adresse email du client"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <Button 
                variant="outline" 
                onClick={handleSendTest}
                disabled={!testEmail || sendingTest}
              >
                {sendingTest ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Sauvegarder les paramètres
            </Button>
          </div>
        </CardContent>
      </Card>

      <EmailLogsPanel organisationId={organisationId} />
    </div>
  );
};

export default EmailNotificationSettings;
