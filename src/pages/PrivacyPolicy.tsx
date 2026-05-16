import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import syrelaLogo from "@/assets/syrela-trust-logo.png";
import syrelaTrustLogo from "@/assets/syrela-trust-logo-primary.png";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={syrelaLogo} alt="SyrelaTrust" className="h-8 w-auto" />
            <span className="font-semibold text-lg">SyrelaTrust</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-4">
              <img src={syrelaTrustLogo} alt="SyrelaTrust" className="h-16 w-auto" />
              <div>
                <CardTitle className="text-xl">Notice de confidentialité</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Application SyrelaTrust — Version en vigueur</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="p-6 space-y-6 text-sm leading-relaxed">
                {/* 0. Préambule court (même style) */}
                <section>
                  <p className="text-muted-foreground">
                    <strong>Application interne à usage strictement professionnel</strong> — accès réservé aux
                    collaborateurs et intervenants habilités de SYRELA DIGITAL SAS.{" "}
                    <strong>Aucun accès client n’est ouvert.</strong>
                  </p>
                </section>

                {/* 1. Objet */}
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">1. Objet de la notice</h2>
                  <p className="text-muted-foreground">
                    La présente notice de confidentialité a pour objet d&apos;informer les utilisateurs de
                    l&apos;application interne <strong>SyrelaTrust</strong> des conditions dans lesquelles leurs données
                    personnelles sont collectées, traitées et protégées, conformément au Règlement (UE) 2016/679 du 27
                    avril 2016 (Règlement Général sur la Protection des Données – RGPD) et à la loi n° 78-17 du 6
                    janvier 1978 modifiée relative à l&apos;informatique, aux fichiers et aux libertés.
                  </p>
                </section>

                {/* 2. Responsable de traitement */}
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">2. Responsable de traitement</h2>
                  <div className="text-muted-foreground space-y-2">
                    <p>Le responsable de traitement est :</p>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                      <p>
                        <strong>SYRELA DIGITAL SAS</strong>
                      </p>
                      <p>30 Boulevard de Sébastopol</p>
                      <p>75004 Paris</p>
                      <p>France</p>
                      <p className="pt-2">
                        Email de contact :{" "}
                        <a href="mailto:contact@syreladigital.fr" className="text-primary hover:underline">
                          contact@syreladigital.fr
                        </a>
                      </p>
                      <p>
                        Délégué à la Protection des Données (DPO) :{" "}
                        <a href="mailto:dpo@syreladigital.fr" className="text-primary hover:underline">
                          dpo@syreladigital.fr
                        </a>
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. Nature et rôle */}
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">3. Nature et rôle de SyrelaTrust</h2>
                  <p className="text-muted-foreground">
                    SyrelaTrust est un <strong>outil applicatif interne</strong> édité par SYRELA DIGITAL SAS. Il est
                    destiné exclusivement à un usage professionnel dans le cadre de missions de conformité RGPD,
                    d&apos;audits, de gestion des registres et de traçabilité.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    SyrelaTrust n&apos;est pas une entité juridique distincte de SYRELA DIGITAL SAS. Il ne constitue pas
                    un service commercial ouvert au grand public. L&apos;application est accessible{" "}
                    <strong>uniquement</strong> aux collaborateurs internes et intervenants professionnels dûment
                    habilités agissant pour le compte de SYRELA DIGITAL SAS.{" "}
                    <strong>Aucun accès n’est ouvert aux clients finaux ni à des utilisateurs externes.</strong>
                  </p>
                </section>

                {/* 4. Données traitées */}
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">4. Données personnelles traitées</h2>
                  <p className="text-muted-foreground mb-3">
                    Dans le cadre de l&apos;utilisation de l&apos;application, les catégories de données suivantes
                    peuvent être collectées :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                    <li>
                      <strong>Données d&apos;identification</strong> : nom, prénom, adresse email professionnelle,
                      fonction/rôle au sein de l&apos;organisation
                    </li>
                    <li>
                      <strong>Données de connexion</strong> : journaux d&apos;accès (logs), adresses IP, horodatage des
                      connexions et actions
                    </li>
                    <li>
                      <strong>Données professionnelles</strong> : informations liées aux missions de conformité, audits,
                      registres de traitements et documentations associées
                    </li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    <strong>Exclusion des données sensibles</strong> : L&apos;application n&apos;a pas vocation à
                    collecter de données sensibles au sens de l&apos;article 9 du RGPD (origine raciale, opinions
                    politiques, données de santé, etc.), sauf dans le cadre spécifique de missions documentées et
                    encadrées contractuellement.
                  </p>
                </section>

                {/* 5. Finalités */}
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">5. Finalités des traitements</h2>
                  <p className="text-muted-foreground mb-3">
                    Les données personnelles sont traitées pour les finalités suivantes :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                    <li>Gestion des comptes utilisateurs et authentification</li>
                    <li>Sécurisation de l&apos;accès à l&apos;application et traçabilité des actions</li>
                    <li>Exécution des missions de conformité RGPD (audits, registres, documentation)</li>
                    <li>Respect des obligations légales et réglementaires</li>
                    <li>Amélioration continue de l&apos;application et support technique</li>
                  </ul>
                </section>

                {/* 5 bis. Assistance IA */}
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">
                    5 bis. Assistance à la rédaction et outils d&apos;aide
                  </h2>
                  <p className="text-muted-foreground mb-3">
                    Dans le cadre de ses missions de conformité, SYRELA DIGITAL peut recourir à des outils
                    d&apos;assistance à la rédaction basés sur l&apos;intelligence artificielle, notamment à des fins de
                    rappel réglementaire, de structuration documentaire ou d&apos;aide à la rédaction.
                  </p>
                  <p className="text-muted-foreground mb-3">
                    Ces outils sont utilisés exclusivement à titre d&apos;assistance, sans prise de décision
                    automatisée, et sous contrôle humain systématique.
                  </p>
                  <p className="text-muted-foreground mb-3">
                    Aucune décision produisant des effets juridiques ou significatifs pour les personnes concernées
                    n&apos;est fondée sur ces outils.
                  </p>
                  <p className="text-muted-foreground">
                    Les données éventuellement traitées dans ce cadre sont limitées au strict nécessaire et ne sont pas
                    utilisées à des fins d&apos;entraînement des modèles par SYRELA DIGITAL.
                  </p>
                </section>

                {/* 6. Bases légales */}
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">6. Bases légales des traitements</h2>
                  <p className="text-muted-foreground mb-3">
                    Les traitements de données reposent sur les bases légales suivantes :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                    <li>
                      <strong>Exécution contractuelle</strong> : nécessaire à l&apos;exécution des missions
                      professionnelles confiées
                    </li>
                    <li>
                      <strong>Obligation légale</strong> : respect des obligations en matière de sécurité, traçabilité
                      et conformité réglementaire
                    </li>
                    <li>
                      <strong>Intérêt légitime</strong> : sécurisation de l&apos;application, prévention des accès non
                      autorisés, amélioration des services
                    </li>
                  </ul>
                </section>

                {/* 7. Destinataires */}
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">7. Destinataires des données</h2>
                  <p className="text-muted-foreground mb-3">
                    Les données personnelles sont accessibles aux destinataires suivants :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                    <li>Personnel habilité de SYRELA DIGITAL SAS, dans la limite de leurs attributions</li>
                    <li>
                      Prestataires techniques agissant en qualité de sous-traitants (hébergement, messagerie,
                      maintenance et développement), au sens de l&apos;article 28 du RGPD
                    </li>
                    <li>Autorités compétentes, en cas d&apos;obligation légale ou de réquisition judiciaire</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    <strong>Aucune cession commerciale</strong> : Les données personnelles ne font l&apos;objet
                    d&apos;aucune cession, location ou commercialisation à des tiers.
                  </p>
                </section>

                {/* 8. Hébergement & transferts (NOUVEAU COMPLET) */}
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">
                    8. Hébergement, sous-traitance et transferts de données
                  </h2>

                  <p className="text-muted-foreground mb-3">
                    Les données traitées dans le cadre de l&apos;utilisation de SyrelaTrust sont hébergées au sein de
                    l&apos;Union européenne, selon l&apos;architecture suivante :
                  </p>

                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                    <li>
                      <strong>Données applicatives</strong> (comptes utilisateurs, périmètres de mission, audits,
                      registres, journaux applicatifs) : hébergées par <strong>Supabase</strong>, agissant en qualité de
                      sous-traitant, sur une infrastructure <strong>Amazon Web Services (AWS)</strong> située dans
                      l&apos;Union européenne (<strong>région Paris</strong>).
                    </li>
                    <li>
                      <strong>Interface applicative (frontend)</strong> : hébergée en <strong>France</strong> par la
                      société <strong>o2switch</strong> (datacenter situé en France).
                    </li>
                    <li>
                      <strong>Messagerie professionnelle / échanges de support</strong> : hébergés et conservés en{" "}
                      <strong>France</strong> par <strong>o2switch</strong>.
                    </li>
                  </ul>

                  <p className="text-muted-foreground mt-3">
                    <strong>Gestion du code source</strong> : le code source de l&apos;application est hébergé et
                    versionné sur <strong>GitHub</strong> à des fins de développement et maintenance.{" "}
                    <strong>
                      Aucune donnée personnelle issue de l&apos;exploitation de l&apos;application (audits, registres,
                      données métiers, comptes applicatifs) n&apos;est stockée sur GitHub.
                    </strong>{" "}
                    L&apos;accès au dépôt est strictement limité aux personnes autorisées.
                  </p>

                  <p className="text-muted-foreground mt-3">
                    <strong>Transferts hors UE</strong> : par principe, aucun transfert de données applicatives liées à
                    l&apos;exploitation de SyrelaTrust n&apos;est effectué en dehors de l&apos;Union européenne. Pour
                    les outils de développement (notamment GitHub), des transferts de données techniques (comptes
                    développeurs et métadonnées) peuvent exister selon les conditions du prestataire ; les garanties
                    appropriées prévues par le RGPD sont mises en œuvre lorsque applicable.
                  </p>
                </section>

                {/* 9. Conservation */}
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">9. Durées de conservation</h2>
                  <p className="text-muted-foreground mb-3">
                    Les données personnelles sont conservées selon les durées suivantes :
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-muted-foreground border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-medium">Catégorie de données</th>
                          <th className="text-left py-2 font-medium">Durée de conservation</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr className="border-b border-muted/30">
                          <td className="py-2 pr-4">Comptes utilisateurs actifs</td>
                          <td className="py-2">Durée de la relation professionnelle</td>
                        </tr>
                        <tr className="border-b border-muted/30">
                          <td className="py-2 pr-4">Comptes inactifs / supprimés</td>
                          <td className="py-2">3 ans après la dernière activité ou suppression</td>
                        </tr>
                        <tr className="border-b border-muted/30">
                          <td className="py-2 pr-4">Journaux de connexion (logs)</td>
                          <td className="py-2">1 an (conformément aux recommandations CNIL)</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4">Données de mission / audits</td>
                          <td className="py-2">Durée légale applicable ou 5 ans après clôture</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 10. Sécurité */}
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">10. Mesures de sécurité</h2>
                  <p className="text-muted-foreground mb-3">
                    SYRELA DIGITAL SAS met en œuvre des mesures techniques et organisationnelles appropriées pour
                    garantir la sécurité et la confidentialité des données personnelles :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                    <li>Contrôle des accès par authentification sécurisée</li>
                    <li>Chiffrement des communications (HTTPS/TLS)</li>
                    <li>Journalisation des accès et des actions sensibles</li>
                    <li>Cloisonnement des données par organisation / périmètre de mission</li>
                    <li>Sauvegardes régulières et procédures de restauration</li>
                    <li>Sensibilisation du personnel aux bonnes pratiques de sécurité</li>
                  </ul>
                </section>

                {/* 11. Droits */}
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">11. Droits des utilisateurs</h2>
                  <p className="text-muted-foreground mb-3">
                    Conformément au RGPD, les utilisateurs disposent des droits suivants sur leurs données personnelles
                    :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                    <li>
                      <strong>Droit d&apos;accès</strong> : obtenir la confirmation du traitement et une copie des
                      données
                    </li>
                    <li>
                      <strong>Droit de rectification</strong> : faire corriger les données inexactes ou incomplètes
                    </li>
                    <li>
                      <strong>Droit à l&apos;effacement</strong> : demander la suppression des données, dans les limites
                      légales
                    </li>
                    <li>
                      <strong>Droit à la limitation</strong> : demander la suspension du traitement dans certains cas
                    </li>
                    <li>
                      <strong>Droit d&apos;opposition</strong> : s&apos;opposer au traitement pour des motifs légitimes
                    </li>
                    <li>
                      <strong>Droit à la portabilité</strong> : recevoir les données dans un format structuré et
                      réutilisable
                    </li>
                  </ul>

                  <div className="bg-muted/50 rounded-lg p-4 mt-4 space-y-2">
                    <p className="font-medium text-foreground">Modalités d&apos;exercice des droits</p>
                    <p className="text-muted-foreground">
                      Les demandes peuvent être adressées par email à :{" "}
                      <a href="mailto:dpo@syreladigital.fr" className="text-primary hover:underline">
                        dpo@syreladigital.fr
                      </a>
                    </p>
                    <p className="text-muted-foreground">
                      Une réponse sera apportée dans un délai d&apos;un mois à compter de la réception de la demande. Ce
                      délai peut être prolongé de deux mois en cas de demande complexe.
                    </p>
                    <p className="text-muted-foreground">
                      En cas de difficulté, vous disposez du droit d&apos;introduire une réclamation auprès de la
                      Commission Nationale de l&apos;Informatique et des Libertés (CNIL) :{" "}
                      <a
                        href="https://www.cnil.fr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        www.cnil.fr
                      </a>
                    </p>
                  </div>
                </section>

                {/* 12. Mise à jour */}
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">12. Mise à jour de la notice</h2>
                  <p className="text-muted-foreground">
                    La présente notice de confidentialité peut être modifiée à tout moment pour tenir compte des
                    évolutions légales, réglementaires ou techniques. La version applicable est celle affichée dans
                    l&apos;application à la date de consultation.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Les utilisateurs sont invités à consulter régulièrement cette notice.
                  </p>
                </section>

                {/* Footer */}
                <div className="border-t pt-6 mt-8">
                  <p className="text-xs text-muted-foreground text-center">Dernière mise à jour : 22 décembre 2025</p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
