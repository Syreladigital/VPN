import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Search,
  ExternalLink,
  Info,
  Calendar,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LGO_DATABASE,
  HEBERGEURS_HDS,
  HDS_STATUS_LABELS,
  DECRET_STATUS_LABELS,
  HDS_STATUS_COLORS,
  DECRET_STATUS_COLORS,
  type HdsStatus,
  type Decret2026Status,
} from '@/data/lgoDatabase';

const HDS_ICONS: Record<HdsStatus, React.ElementType> = {
  certifie: CheckCircle2,
  en_cours: AlertTriangle,
  non_certifie: XCircle,
  inconnu: HelpCircle,
};

const DECRET_ICONS: Record<Decret2026Status, React.ElementType> = {
  conforme: CheckCircle2,
  en_cours: AlertTriangle,
  non_conforme: XCircle,
  a_verifier: HelpCircle,
};

function HdsBadge({ status }: { status: HdsStatus }) {
  const Icon = HDS_ICONS[status];
  return (
    <Badge variant="outline" className={cn('flex items-center gap-1 text-xs', HDS_STATUS_COLORS[status])}>
      <Icon className="h-3 w-3" />
      {HDS_STATUS_LABELS[status]}
    </Badge>
  );
}

function DecretBadge({ status }: { status: Decret2026Status }) {
  const Icon = DECRET_ICONS[status];
  return (
    <Badge variant="outline" className={cn('flex items-center gap-1 text-xs', DECRET_STATUS_COLORS[status])}>
      <Icon className="h-3 w-3" />
      {DECRET_STATUS_LABELS[status]}
    </Badge>
  );
}

export function LGODatabasePanel() {
  const [search, setSearch] = useState('');

  const filteredLGO = LGO_DATABASE.filter(
    (lgo) =>
      lgo.nom.toLowerCase().includes(search.toLowerCase()) ||
      lgo.editeur.toLowerCase().includes(search.toLowerCase()) ||
      lgo.hebergeur.toLowerCase().includes(search.toLowerCase())
  );

  const filteredHebergeurs = HEBERGEURS_HDS.filter((h) =>
    h.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Base LGO & Hébergeurs HDS</CardTitle>
              <CardDescription>
                Statut de certification HDS au regard du décret n°2026-209 — deadline&nbsp;
                <span className="font-semibold text-red-600">26 septembre 2026</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-amber-300 bg-amber-50">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 text-sm">
              Ces informations sont données à titre indicatif et doivent être vérifiées directement auprès des éditeurs.
              Les statuts HDS peuvent évoluer. Dernière vérification&nbsp;: mai 2026.
            </AlertDescription>
          </Alert>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un LGO, éditeur ou hébergeur..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Tabs defaultValue="lgo">
            <TabsList className="mb-4">
              <TabsTrigger value="lgo">Logiciels officine ({filteredLGO.length})</TabsTrigger>
              <TabsTrigger value="hebergeurs">Hébergeurs HDS ({filteredHebergeurs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="lgo" className="space-y-3">
              {filteredLGO.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">Aucun résultat.</p>
              )}
              {filteredLGO.map((lgo) => (
                <div key={lgo.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{lgo.nom}</p>
                      <p className="text-xs text-muted-foreground">
                        Éditeur&nbsp;: {lgo.editeur}
                        {lgo.siteEditeur && (
                          <a href={lgo.siteEditeur} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-0.5 text-blue-600 hover:underline">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </p>
                    </div>
                    <DecretBadge status={lgo.decret2026Status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">LGO HDS</p>
                      <HdsBadge status={lgo.hdsStatus} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hébergeur</p>
                      <p className="text-xs font-medium">{lgo.hebergeur}</p>
                      <HdsBadge status={lgo.hebergeurHdsStatus} />
                    </div>
                    {lgo.certificationUrl && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Certification</p>
                        <a href={lgo.certificationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                          <ExternalLink className="h-3 w-3" />Voir le certificat
                        </a>
                      </div>
                    )}
                  </div>

                  {lgo.notes && <p className="text-xs text-muted-foreground border-t pt-2">{lgo.notes}</p>}

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Vérifié le {new Date(lgo.derniereVerification).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="hebergeurs" className="space-y-3">
              {filteredHebergeurs.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">Aucun résultat.</p>
              )}
              {filteredHebergeurs.map((h) => (
                <div key={h.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold text-sm">{h.nom}</p>
                    <HdsBadge status={h.hdsStatus} />
                  </div>

                  {h.categoriesHds.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Catégories HDS couvertes</p>
                      <div className="flex flex-wrap gap-1">
                        {h.categoriesHds.map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">Cat. {cat}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    {h.certificationUrl && (
                      <a href={h.certificationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                        <ExternalLink className="h-3 w-3" />Voir la certification
                      </a>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Vérifié le {new Date(h.derniereVerification).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
