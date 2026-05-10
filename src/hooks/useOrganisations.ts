import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organisation, Sector, OrganisationSize, DPORole, Country, LegalFramework } from '@/types/rgpd';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DbOrganisation = Database['public']['Tables']['organisations']['Row'];
type DbSector = Database['public']['Enums']['sector_type'];
type DbSize = Database['public']['Enums']['organisation_size_type'];
type DbDpoRole = Database['public']['Enums']['dpo_role_type'];
type DbCountry = Database['public']['Enums']['country_type'];
type DbLegalFramework = Database['public']['Enums']['legal_framework_type'];

function mapDbToOrganisation(db: DbOrganisation): Organisation {
  return {
    id: db.id,
    name: db.name,
    sector: db.sector as Sector,
    size: db.size as OrganisationSize,
    dpoRole: db.dpo_role as DPORole,
    country: db.country as Country,
    legalFramework: db.legal_framework as LegalFramework,
    createdAt: new Date(db.created_at)
  };
}

export function useOrganisations() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrganisations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setOrganisations([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('organisations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setOrganisations((data || []).map(mapDbToOrganisation));
    } catch (error) {
      console.error('Error fetching organisations:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les organismes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createOrganisation = useCallback(async (
    org: Omit<Organisation, 'id' | 'createdAt'> & { clientEmail?: string }
  ): Promise<Organisation | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Erreur',
          description: 'Vous devez être connecté',
          variant: 'destructive'
        });
        return null;
      }

      const { clientEmail, ...orgData } = org;

      if (!orgData.name?.trim() || !orgData.sector || !orgData.size || !orgData.dpoRole || !orgData.country || !orgData.legalFramework) {
        toast({
          title: 'Erreur',
          description: 'Tous les champs obligatoires doivent être remplis correctement',
          variant: 'destructive'
        });
        return null;
      }

      const { data, error } = await supabase
        .from('organisations')
        .insert({
          name: orgData.name.trim(),
          sector: orgData.sector as DbSector,
          size: orgData.size as DbSize,
          dpo_role: orgData.dpoRole as DbDpoRole,
          country: orgData.country as DbCountry,
          legal_framework: orgData.legalFramework as DbLegalFramework,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newOrg = mapDbToOrganisation(data);
      setOrganisations(prev => [newOrg, ...prev]);

      if (clientEmail) {
        try {
          const createUserResponse = await supabase.functions.invoke('create-user', {
            body: {
              email: clientEmail,
              name: orgData.name,
              role: 'client'
            }
          });

          if (createUserResponse.error) {
            console.error('Error creating client user:', createUserResponse.error);
            toast({
              title: 'Avertissement',
              description: `Organisation créée, mais erreur lors de la création du compte client: ${createUserResponse.error.message}`,
              variant: 'destructive'
            });
          } else {
            const userId = createUserResponse.data?.userId || createUserResponse.data?.user?.id;
            const resetLink = createUserResponse.data?.resetLink;

            if (userId) {
              const { error: accessError } = await supabase.from('client_access').insert({
                client_user_id: userId,
                organisation_id: newOrg.id,
                granted_by: user.id
              });

              if (accessError) {
                console.error('Error granting client access:', accessError);
                toast({
                  title: 'Avertissement',
                  description: 'Organisation créée, mais l\'accès client n\'a pas pu être attribué. Veuillez contacter le support.',
                  variant: 'destructive',
                });
              }
            } else {
              console.error('No userId returned from create-user function');
            }

            if (resetLink) {
              const emailResponse = await supabase.functions.invoke('send-client-welcome-email', {
                body: {
                  recipientEmail: clientEmail,
                  recipientName: orgData.name,
                  organisationName: orgData.name,
                  resetLink,
                }
              });

              if (emailResponse.error) {
                console.error('Error sending welcome email:', emailResponse.error);
                toast({
                  title: 'Avertissement',
                  description: `Compte client créé, mais l'email n'a pas pu être envoyé.`,
                });
              } else {
                toast({
                  title: 'Succès',
                  description: `Organisme créé et email de bienvenue envoyé à ${clientEmail}`,
                });
              }
            } else {
              toast({
                title: 'Succès',
                description: `Organisme et compte client créés. Le client recevra un email pour définir son mot de passe.`,
              });
            }
          }
        } catch (clientError) {
          console.error('Error in client creation flow:', clientError);
          toast({
            title: 'Avertissement',
            description: 'Organisation créée, mais erreur lors de la création du compte client',
            variant: 'destructive'
          });
        }
      } else {
        toast({
          title: 'Organisme créé',
          description: `${orgData.name} a été ajouté`
        });
      }

      return newOrg;
    } catch (error) {
      console.error('Error creating organisation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'organisme',
        variant: 'destructive'
      });
      return null;
    }
  }, [toast]);

  const generateSecurePassword = (): string => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }
    return password;
  };

  const deleteOrganisation = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('organisations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOrganisations(prev => prev.filter(o => o.id !== id));

      toast({
        title: 'Supprimé',
        description: 'L\'organisme a été supprimé'
      });
    } catch (error) {
      console.error('Error deleting organisation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'organisme',
        variant: 'destructive'
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchOrganisations();
  }, [fetchOrganisations]);

  return {
    organisations,
    loading,
    createOrganisation,
    deleteOrganisation,
    refresh: fetchOrganisations
  };
}
