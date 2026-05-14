/**
 * Diagnostic RGPD Officine — Syrela Digital
 *
 * Pour utiliser ce script :
 *  1. Ouvrez https://script.google.com et créez un nouveau projet.
 *  2. Collez l'intégralité de ce fichier dans l'éditeur.
 *  3. Cliquez sur "Exécuter" (▶) → autorisez les permissions demandées.
 *  4. L'URL du formulaire est affichée dans les journaux
 *     (Affichage → Journaux d'exécution).
 */

function creerFormulaireDiagnosticRGPD() {
  const form = FormApp.create("Diagnostic RGPD Officine — Syrela Digital");

  form.setDescription(
    "Complétez ce formulaire en 1 minute. Je vous recontacte sous 24h pour " +
    "fixer ensemble la date et le format qui vous convient."
  );
  form.setCollectEmail(false);
  form.setShowLinkToRespondAgain(false);

  // Question 1 — Prénom et nom
  form.addTextItem()
    .setTitle("Votre prénom et nom")
    .setRequired(true);

  // Question 2 — Officine et ville
  form.addTextItem()
    .setTitle("Nom de votre officine et ville")
    .setRequired(true);

  // Question 3 — Format du rendez-vous
  form.addMultipleChoiceItem()
    .setTitle("Vous préférez :")
    .setChoiceValues([
      "Un rendez-vous dans votre officine (région PACA)",
      "Un échange à distance par téléphone ou visio (toute la France)"
    ])
    .setRequired(true);

  // Question 4 — Numéro de téléphone
  form.addTextItem()
    .setTitle("Votre numéro de téléphone")
    .setRequired(true);

  // Question 5 — Créneau horaire
  form.addMultipleChoiceItem()
    .setTitle("Quel moment vous convient le mieux ?")
    .setChoiceValues([
      "Matin (avant 12h)",
      "Après-midi (12h-17h)",
      "Fin de journée (après 17h)"
    ])
    .setRequired(true);

  // Journaliser les URLs
  const url     = form.getPublishedUrl();
  const editUrl = form.getEditUrl();

  Logger.log("✅ Formulaire créé avec succès !");
  Logger.log("🔗 URL de partage (répondants) : " + url);
  Logger.log("✏️  URL d'édition (propriétaire) : " + editUrl);

  return { publishedUrl: url, editUrl: editUrl };
}
