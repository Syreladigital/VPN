const sectors = [
  'Pharmacies', 'Cabinets médicaux', 'Établissements de santé', 'Notariat',
  'Cabinets d\'avocats', 'Cabinets d\'expertise comptable', 'Assurance',
  'Ressources humaines', 'Collectivités', 'PME / ETI',
];

export function LandingSectors() {
  return (
    <section id="sectors" className="border-b bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Conçu pour vos secteurs</h2>
          <p className="mt-4 text-muted-foreground">
            Des questionnaires et obligations spécifiques à chaque métier, mis à jour selon les recommandations CNIL et les législations locales (FR, TN, UE).
          </p>
        </div>
        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
          {sectors.map((s) => (
            <span key={s} className="rounded-full border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm">
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
