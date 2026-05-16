import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, FileText, Bell, Bot, Target, FileDown } from 'lucide-react';

const features = [
  { icon: ClipboardList, title: 'Audits sectoriels', desc: 'Questionnaires adaptés à chaque secteur (santé, pharmacie, notariat, RH…) avec scoring automatique.' },
  { icon: FileText, title: 'Registres CNIL Article 30', desc: 'Registre des traitements, sous-traitants, DPIA et politiques générés et tenus à jour automatiquement.' },
  { icon: Bell, title: 'Alertes 72h & 1 mois', desc: 'Suivi des violations de données et demandes d\'exercice des droits avec rappels d\'échéances réglementaires.' },
  { icon: Bot, title: 'Assistant IA Mistral', desc: 'Aide à la qualification des risques et à la rédaction des analyses, toujours sous validation humaine.' },
  { icon: Target, title: 'Plans d\'action', desc: 'Recommandations priorisées par criticité et suivi de l\'avancement de la mise en conformité.' },
  { icon: FileDown, title: 'Rapports & exports', desc: 'PDF, Word, sauvegardes JSON pour la portabilité — prêts à présenter à vos clients ou à la CNIL.' },
];

export function LandingFeatures() {
  return (
    <section id="features" className="border-b py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tout ce dont un DPO a besoin</h2>
          <p className="mt-4 text-muted-foreground">
            Une suite complète pour piloter la conformité RGPD de plusieurs organisations en parallèle.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
