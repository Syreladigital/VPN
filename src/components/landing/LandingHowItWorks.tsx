const steps = [
  { n: '01', title: 'Créez vos organisations', desc: 'Importez ou créez les structures clientes en quelques secondes, avec leur cadre légal applicable.' },
  { n: '02', title: 'Réalisez les audits guidés', desc: 'Suivez le questionnaire conditionnel adapté au secteur. L\'IA vous propose des analyses, vous validez.' },
  { n: '03', title: 'Pilotez la conformité', desc: 'Plan d\'action, registres, alertes et rapports : tout est centralisé et exportable.' },
];

export function LandingHowItWorks() {
  return (
    <section className="border-b py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Comment ça fonctionne</h2>
          <p className="mt-4 text-muted-foreground">Un flux simple, pensé pour les consultants RGPD au quotidien.</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-lg border bg-card p-6">
              <div className="text-4xl font-bold text-primary/30">{s.n}</div>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
