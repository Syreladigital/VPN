import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const testimonials = [
  { quote: 'SyrelaTrust nous a fait gagner un temps précieux sur l\'audit annuel de nos pharmacies clientes.', author: 'Claire D.', role: 'DPO externe' },
  { quote: 'Les registres CNIL générés sont impeccables, nous les présentons tels quels lors des contrôles.', author: 'Marc L.', role: 'Consultant RGPD' },
  { quote: 'L\'assistant IA est un vrai plus pour qualifier rapidement les violations de données.', author: 'Sophie R.', role: 'Responsable conformité' },
];

export function LandingTestimonials() {
  return (
    <section className="border-b bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ce que disent nos utilisateurs</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.author}>
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-primary/40" />
                <p className="mt-4 text-sm text-foreground">"{t.quote}"</p>
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm font-semibold">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
