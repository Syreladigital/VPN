import { AlertTriangle } from 'lucide-react';

export function AIDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-md border border-warning/30 bg-warning/10 p-4 text-sm">
      <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
      <p className="text-warning-foreground">
        <strong>Avertissement :</strong> Les éléments générés par l'IA constituent une aide à la saisie et à l'analyse. 
        Ils doivent être vérifiés, adaptés et validés par un DPO ou un responsable habilité avant toute utilisation.
      </p>
    </div>
  );
}
