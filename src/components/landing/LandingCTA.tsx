import { Button } from '@/components/ui/button';

export function LandingCTA() {
  return (
    <section className="bg-primary py-16 text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Prêt à automatiser votre conformité RGPD ?</h2>
        <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
          Rejoignez les DPO et consultants qui ont choisi SyrelaTrust pour gagner du temps et sécuriser leurs audits.
        </p>
        <div className="mt-8">
          <Button size="lg" variant="secondary" asChild>
            <a href="#pricing">Choisir mon offre</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
