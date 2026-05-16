import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'Comment mon compte est-il activé après paiement ?', a: 'Pour des raisons de sécurité, nos comptes sont provisionnés manuellement par notre équipe. Vous recevrez un lien d\'activation sécurisé par email sous 24h ouvrées après paiement.' },
  { q: 'Puis-je résilier à tout moment ?', a: 'Oui, le plan mensuel est sans engagement : vous pouvez résilier à tout moment depuis votre espace client. Le plan annuel court jusqu\'à son terme.' },
  { q: 'Les données sont-elles hébergées en Europe ?', a: 'Oui, l\'ensemble des données est hébergé dans l\'Union européenne, conformément aux exigences RGPD.' },
  { q: 'La TVA est-elle incluse ?', a: 'Les tarifs sont indiqués HT. La TVA est calculée et collectée automatiquement au moment du paiement selon votre pays et votre statut.' },
  { q: 'L\'assistant IA prend-il des décisions à ma place ?', a: 'Non. L\'IA propose des analyses et des recommandations, mais la validation finale est toujours humaine, conformément aux bonnes pratiques CNIL.' },
  { q: 'Puis-je gérer plusieurs organisations clientes ?', a: 'Oui, la plateforme est conçue pour les DPO et consultants qui pilotent plusieurs organisations en parallèle, avec une stricte ségrégation des données.' },
];

export function LandingFAQ() {
  return (
    <section id="faq" className="border-b bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Questions fréquentes</h2>
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
