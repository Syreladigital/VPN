import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Eye, RotateCcw } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Variable {
  name: string;
  description: string;
  sampleValue: string;
}

interface GenericEmailTemplateEditorProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  subjectTemplate: string;
  bodyTemplate: string;
  variables: Variable[];
  defaultSubject: string;
  defaultBody: string;
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
}

const GenericEmailTemplateEditor = ({
  title,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  subjectTemplate,
  bodyTemplate,
  variables,
  defaultSubject,
  defaultBody,
  onSubjectChange,
  onBodyChange,
}: GenericEmailTemplateEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const generatePreview = (template: string) => {
    let preview = template;
    variables.forEach((v) => {
      preview = preview.replace(new RegExp(v.name.replace(/[{}]/g, '\\$&'), 'g'), v.sampleValue);
    });
    return preview;
  };

  const handleReset = () => {
    onSubjectChange(defaultSubject);
    onBodyChange(defaultBody);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
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
              <Label htmlFor={`subject-${title}`}>Objet de l'email</Label>
              <Input
                id={`subject-${title}`}
                value={subjectTemplate}
                onChange={(e) => onSubjectChange(e.target.value)}
                placeholder="Objet de l'email..."
              />
            </div>

            {/* Corps de l'email */}
            <div className="space-y-2">
              <Label htmlFor={`body-${title}`}>Corps de l'email</Label>
              <Textarea
                id={`body-${title}`}
                value={bodyTemplate}
                onChange={(e) => onBodyChange(e.target.value)}
                rows={10}
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
                      Objet : {generatePreview(subjectTemplate)}
                    </p>
                    <div className="bg-background p-4 rounded border whitespace-pre-wrap text-sm">
                      {generatePreview(bodyTemplate)}
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

export default GenericEmailTemplateEditor;
