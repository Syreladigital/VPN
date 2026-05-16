import { useState } from 'react';
import { Organisation } from '@/types/rgpd';
import { ProcessingRecord } from '@/types/documentation';
import { DataBreach } from '@/types/documentation';
import { RightsRequest } from '@/types/documentation';
import { Subprocessor } from '@/types/documentation';
import { useProcessingRecords } from '@/hooks/useProcessingRecords';
import { useDataBreaches } from '@/hooks/useDataBreaches';
import { useRightsRequests } from '@/hooks/useRightsRequests';
import { useSubprocessors } from '@/hooks/useSubprocessors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, FileText, AlertTriangle, CheckCircle, XCircle, Scale, Shield, Users, Factory, Lock, FileWarning, ScrollText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  exportProcessingRecordsPDF,
  exportDataBreachesPDF,
  exportRightsRequestsPDF,
  exportSubprocessorsPDF,
  exportSecurityMeasuresPDF,
  exportDPIAPDF,
  exportPrivacyPolicyPDF,
} from '@/services/cnil';

interface CNILDocumentsPanelProps {
  organisation: Organisation | undefined;
}

type DocumentStatus = 'available' | 'missing_data' | 'not_applicable';

interface DocumentInfo {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  getStatus: () => { status: DocumentStatus; details?: string[] };
  exportFn: () => Promise<void>;
}

export function CNILDocumentsPanel({ organisation }: CNILDocumentsPanelProps) {
  const { toast } = useToast();
  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);
  
  const { records: processingRecords, loading: recordsLoading } = useProcessingRecords(organisation?.id);
  const { breaches, loading: breachesLoading } = useDataBreaches(organisation?.id);
  const { requests, loading: requestsLoading } = useRightsRequests(organisation?.id);
  const { subprocessors, loading: subprocessorsLoading } = useSubprocessors(organisation?.id);

  const isLoading = recordsLoading || breachesLoading || requestsLoading || subprocessorsLoading;

  if (!organisation) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Sélectionnez une organisation</p>
        </CardContent>
      </Card>
    );
  }

  const handleExport = async (doc: DocumentInfo) => {
    setLoadingDoc(doc.id);
    try {
      await doc.exportFn();
      toast({
        title: 'Document généré',
        description: `${doc.title} téléchargé avec succès`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le document',
        variant: 'destructive',
      });
    } finally {
      setLoadingDoc(null);
    }
  };

  const documents: DocumentInfo[] = [
    {
      id: 'processing-records',
      title: 'Registre des traitements',
      description: 'Article 30 - Liste complète des traitements de données',
      icon: ScrollText,
      getStatus: () => ({
        status: 'available',
        details: processingRecords.length === 0 ? ['Aucun traitement enregistré'] : undefined,
      }),
      exportFn: () => exportProcessingRecordsPDF(organisation, processingRecords),
    },
    {
      id: 'data-breaches',
      title: 'Registre des violations',
      description: 'Article 33 - Historique des violations de données',
      icon: AlertTriangle,
      getStatus: () => ({
        status: 'available',
        details: breaches.length === 0 ? ['Attestation "aucune violation"'] : undefined,
      }),
      exportFn: () => exportDataBreachesPDF(organisation, breaches),
    },
    {
      id: 'rights-requests',
      title: 'Registre des demandes de droits',
      description: 'Articles 15-22 - Suivi des demandes d\'exercice de droits',
      icon: Users,
      getStatus: () => ({
        status: 'available',
        details: requests.length === 0 ? ['Aucune demande enregistrée'] : undefined,
      }),
      exportFn: () => exportRightsRequestsPDF(organisation, requests),
    },
    {
      id: 'subprocessors',
      title: 'Liste des sous-traitants et DPA',
      description: 'Article 28 - Sous-traitants et contrats de traitement',
      icon: Factory,
      getStatus: () => {
        const withoutContract = subprocessors.filter(s => !s.contract_signed && s.status === 'active');
        return {
          status: 'available',
          details: withoutContract.length > 0 
            ? [`${withoutContract.length} sous-traitant(s) sans DPA`] 
            : undefined,
        };
      },
      exportFn: () => exportSubprocessorsPDF(organisation, subprocessors),
    },
    {
      id: 'security-measures',
      title: 'Mesures de sécurité',
      description: 'Article 32 - Mesures techniques et organisationnelles',
      icon: Lock,
      getStatus: () => {
        const hasMeasures = processingRecords.some(r => r.security_measures);
        return {
          status: hasMeasures ? 'available' : 'missing_data',
          details: !hasMeasures ? ['Documenter les mesures dans les traitements'] : undefined,
        };
      },
      exportFn: () => exportSecurityMeasuresPDF(organisation, processingRecords),
    },
    {
      id: 'dpia',
      title: 'Analyse d\'impact (DPIA)',
      description: 'Article 35 - Évaluation des risques pour les droits',
      icon: FileWarning,
      getStatus: () => ({
        status: 'available',
      }),
      exportFn: () => exportDPIAPDF(organisation, processingRecords),
    },
    {
      id: 'privacy-policy',
      title: 'Politique de confidentialité',
      description: 'Articles 13-14 - Information des personnes concernées',
      icon: Shield,
      getStatus: () => ({
        status: 'available',
        details: processingRecords.length === 0 ? ['À compléter avec les traitements'] : undefined,
      }),
      exportFn: () => exportPrivacyPolicyPDF(organisation, processingRecords),
    },
  ];

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" /> Disponible</Badge>;
      case 'missing_data':
        return <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" /> Données manquantes</Badge>;
      case 'not_applicable':
        return <Badge variant="outline" className="gap-1">Non applicable</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Documents RGPD – Contrôle CNIL
          </CardTitle>
          <CardDescription>
            Documents exigibles lors d'un contrôle. Générés à partir des données enregistrées pour {organisation.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {documents.map((doc) => {
                const { status, details } = doc.getStatus();
                const Icon = doc.icon;
                const isExporting = loadingDoc === doc.id;
                
                return (
                  <Card key={doc.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-sm font-medium">{doc.title}</CardTitle>
                        </div>
                        {getStatusBadge(status)}
                      </div>
                      <CardDescription className="text-xs">{doc.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      {details && details.length > 0 && (
                        <div className="mb-3 text-xs text-muted-foreground">
                          {details.map((d, i) => (
                            <p key={i} className="flex items-center gap-1">
                              <span className="text-warning">•</span> {d}
                            </p>
                          ))}
                        </div>
                      )}
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleExport(doc)}
                        disabled={isExporting || status === 'not_applicable'}
                      >
                        {isExporting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-4 w-4" />
                        )}
                        Télécharger PDF
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
