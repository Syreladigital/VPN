import { Button } from '@/components/ui/button';
import { ShieldCheck, Sparkles } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Conforme aux recommandations CNIL
        </div>
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          La plateforme RGPD pensée pour les <span className="text-primary">DPO et consultants</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Audits sectoriels guidés, registres CNIL Article 30, gestion des violations sous 72h, assistant IA et rapports prêts à transmettre — le tout depuis une seule interface sécurisée.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <a href="#pricing">Voir les tarifs</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#features">Découvrir la solution</a>
          </Button>
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Sans engagement · Données hébergées en Europe · Validation humaine garantie
        </p>
      </div>
    </section>
  );
}
