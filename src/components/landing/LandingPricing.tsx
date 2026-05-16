import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check } from 'lucide-react';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useAuth } from '@/hooks/useAuth';

const benefits = [
  'Audits sectoriels illimités',
  'Registres CNIL Article 30 complets',
  'Assistant IA Mistral inclus',
  'Alertes automatiques 72h & 1 mois',
  'Plans d\'action et rapports PDF',
  'Sauvegardes & portabilité (Article 20)',
  'Support par email sous 24h ouvrées',
  'Mises à jour réglementaires incluses',
];

const plans = [
  {
    id: 'syrelatrust_monthly',
    name: 'Mensuel',
    price: '99 €',
    period: 'HT / mois',
    badge: 'Sans engagement',
    cta: 'S\'abonner au mensuel',
    highlight: false,
  },
  {
    id: 'syrelatrust_annual',
    name: 'Annuel',
    price: '890 €',
    period: 'HT / an',
    badge: 'Économisez 298 €',
    cta: 'S\'abonner à l\'annuel',
    highlight: true,
  },
];

export function LandingPricing() {
  const { user } = useAuth();
  const { openCheckout, isOpen, closeCheckout, checkoutElement } = useStripeCheckout();
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const handleSubscribe = (priceId: string, planName: string) => {
    setSelectedPlan(planName);
    openCheckout({
      priceId,
      customerEmail: user?.email,
      userId: user?.id,
      returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    });
  };

  return (
    <section id="pricing" className="border-b py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Une offre simple, tout inclus</h2>
          <p className="mt-4 text-muted-foreground">
            Choisissez la formule qui vous convient. Toutes les fonctionnalités sont incluses dans les deux plans.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all ${
                plan.highlight ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Recommandé
                </div>
              )}
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-primary">{plan.badge}</p>

                <Button
                  className="mt-6 w-full"
                  size="lg"
                  variant={plan.highlight ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.id, plan.name)}
                >
                  {plan.cta}
                </Button>

                <ul className="mt-6 space-y-3">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs text-muted-foreground">
          Tarifs HT, TVA en sus selon votre pays. Votre compte sera activé sous 24h ouvrées après paiement
          afin de garantir un onboarding sécurisé conforme à notre politique de provisioning.
        </p>
      </div>

      <Dialog open={isOpen} onOpenChange={(o) => !o && closeCheckout()}>
        <DialogContent className="max-w-3xl p-0">
          <DialogHeader className="border-b p-6">
            <DialogTitle>Souscription — Plan {selectedPlan}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto p-2">{checkoutElement}</div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
