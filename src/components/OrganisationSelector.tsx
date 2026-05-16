import { useState } from 'react';
import { Organisation, SECTOR_LABELS, SIZE_LABELS, DPO_ROLE_LABELS } from '@/types/rgpd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Building2, Plus, Trash2, ChevronRight, Clock } from 'lucide-react';

interface OrganisationSelectorProps {
  organisations: Organisation[];
  loading: boolean;
  onSelect: (org: Organisation) => void;
  onCreateNew: () => void;
  onDelete: (id: string) => void;
}

export function OrganisationSelector({
  organisations,
  loading,
  onSelect,
  onCreateNew,
  onDelete
}: OrganisationSelectorProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Organismes enregistrés</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organismes enregistrés
              </CardTitle>
              <CardDescription>
                {organisations.length > 0 
                  ? `${organisations.length} organisme${organisations.length > 1 ? 's' : ''} trouvé${organisations.length > 1 ? 's' : ''}`
                  : 'Aucun organisme enregistré'
                }
              </CardDescription>
            </div>
            <Button onClick={onCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel organisme
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {organisations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">
                Commencez par créer votre premier organisme
              </p>
              <Button onClick={onCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un organisme
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {organisations.map((org) => (
                  <div
                    key={org.id}
                    className="group relative rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                    onClick={() => onSelect(org)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {org.name}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {SECTOR_LABELS[org.sector]}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {SIZE_LABELS[org.size]}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            DPO {DPO_ROLE_LABELS[org.dpoRole]}
                          </Badge>
                        </div>
                        {org.createdAt && (
                          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Créé le {format(org.createdAt, 'PP', { locale: fr })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(org.id!);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet organisme ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les audits et l'historique associés seront également supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
