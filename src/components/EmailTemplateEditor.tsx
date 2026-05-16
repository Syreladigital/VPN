import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileText, ChevronDown, ChevronUp, Eye, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface EmailTemplateEditorProps {
  subjectTemplate: string;
  bodyTemplate: string;
  completedMessage: string;
  rejectedMessage: string;
  inProgressMessage: string;
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onCompletedMessageChange: (value: string) => void;
  onRejectedMessageChange: (value: string) => void;
  onInProgressMessageChange: (value: string) => void;
}

const defaultValues = {
  subject: '{{STATUS_EMOJI}} Votre demande de droits a été {{STATUS_TEXT}}',
  body: `Bonjour {{REQUESTER_NAME}},

{{STATUS_MESSAGE}}

{{RESPONSE_CONTENT}}

Cordialement,
L'équipe {{ORGANISATION_NAME}}`,
  completed: "Nous avons le plaisir de vous informer que votre demande d'exercice de votre {{RIGHT_TYPE}} a été traitée avec succès.",
  rejected: "Suite à votre demande d'exercice de votre {{RIGHT_TYPE}}, nous vous informons que celle-ci n'a pas pu être satisfaite.",
  inProgress: "Nous vous informons que votre demande d'exercice de votre {{RIGHT_TYPE}} est en cours de traitement.",
};

const variables = [
  { name: '{{REQUESTER_NAME}}', description: 'Nom du demandeur' },
  { name: '{{RIGHT_TYPE}}', description: "Type de droit (accès, rectification, etc.)" },
  { name: '{{STATUS_TEXT}}', description: 'Statut en texte (traitée, rejetée, en cours)' },
  { name: '{{STATUS_EMOJI}}', description: 'Emoji du statut (✅, ❌, ⏳)' },
  { name: '{{STATUS_MESSAGE}}', description: 'Message selon le statut' },
  { name: '{{ORGANISATION_NAME}}', description: "Nom de l'organisation" },
  { name: '{{RESPONSE_CONTENT}}', description: 'Contenu de la réponse (si disponible)' },
];

const EmailTemplateEditor = ({
  subjectTemplate,
  bodyTemplate,
  completedMessage,
  rejectedMessage,
  inProgressMessage,
  onSubjectChange,
  onBodyChange,
  onCompletedMessageChange,
  onRejectedMessageChange,
  onInProgressMessageChange,
}: EmailTemplateEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const generatePreview = () => {
    const sampleData = {
      '{{REQUESTER_NAME}}': 'Jean Dupont',
      '{{RIGHT_TYPE}}': "droit d'accès",
      '{{STATUS_TEXT}}': 'traitée',
      '{{STATUS_EMOJI}}': '✅',
      '{{STATUS_MESSAGE}}': completedMessage.replace('{{RIGHT_TYPE}}', "droit d'accès"),
      '{{ORGANISATION_NAME}}': 'Mon Organisation',
      '{{RESPONSE_CONTENT}}': 'Votre demande a été traitée. Vous trouverez ci-joint les informations demandées.',
    };

    let preview = bodyTemplate;
    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    return preview;
  };

  const handleReset = () => {
    onSubjectChange(defaultValues.subject);
    onBodyChange(defaultValues.body);
    onCompletedMessageChange(defaultValues.completed);
    onRejectedMessageChange(defaultValues.rejected);
    onInProgressMessageChange(defaultValues.inProgress);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Modèle d'email personnalisable</CardTitle>
                  <CardDescription>
                    Personnalisez le contenu des emails envoyés aux demandeurs
                  </CardDescription>
                </div>
              </div>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Variables disponibles */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Variables disponibles</Label>
              <div className="flex flex-wrap gap-2">
                {variables.map((v) => (
                  <Badge key={v.name} variant="outline" className="text-xs cursor-help" title={v.description}>
                    {v.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sujet */}
            <div className="space-y-2">
              <Label htmlFor="subject-template">Objet de l'email</Label>
              <Input
                id="subject-template"
                value={subjectTemplate}
                onChange={(e) => onSubjectChange(e.target.value)}
                placeholder="Objet de l'email..."
              />
            </div>

            {/* Messages par statut */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="completed-msg" className="flex items-center gap-2">
                  <span className="text-green-500">✅</span> Message - Demande traitée
                </Label>
                <Textarea
                  id="completed-msg"
                  value={completedMessage}
                  onChange={(e) => onCompletedMessageChange(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejected-msg" className="flex items-center gap-2">
                  <span className="text-red-500">❌</span> Message - Demande rejetée
                </Label>
                <Textarea
                  id="rejected-msg"
                  value={rejectedMessage}
                  onChange={(e) => onRejectedMessageChange(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress-msg" className="flex items-center gap-2">
                  <span className="text-amber-500">⏳</span> Message - En cours de traitement
                </Label>
                <Textarea
                  id="progress-msg"
                  value={inProgressMessage}
                  onChange={(e) => onInProgressMessageChange(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Corps de l'email */}
            <div className="space-y-2">
              <Label htmlFor="body-template">Corps de l'email</Label>
              <Textarea
                id="body-template"
                value={bodyTemplate}
                onChange={(e) => onBodyChange(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Aperçu
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Aperçu de l'email</DialogTitle>
                    <DialogDescription>
                      Voici à quoi ressemblera l'email avec des données d'exemple
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold mb-2">
                      Objet : {subjectTemplate
                        .replace('{{STATUS_EMOJI}}', '✅')
                        .replace('{{STATUS_TEXT}}', 'traitée')}
                    </p>
                    <div className="bg-background p-4 rounded border whitespace-pre-wrap text-sm">
                      {generatePreview()}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default EmailTemplateEditor;
