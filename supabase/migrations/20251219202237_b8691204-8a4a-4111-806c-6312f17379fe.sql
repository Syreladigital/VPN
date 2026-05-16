-- Supprimer les politiques permettant aux admins d'accéder aux données des utilisateurs
DROP POLICY IF EXISTS "Admins and super admins can delete all organisations" ON public.organisations;
DROP POLICY IF EXISTS "Admins and super admins can update all organisations" ON public.organisations;
DROP POLICY IF EXISTS "Admins and super admins can view all organisations" ON public.organisations;

-- Créer une fonction pour obtenir des statistiques anonymisées (accessible aux admins)
CREATE OR REPLACE FUNCTION public.get_anonymized_statistics()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Vérifier que l'utilisateur est admin ou super_admin
  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  SELECT json_build_object(
    'total_organisations', (SELECT COUNT(*) FROM organisations),
    'organisations_by_sector', (
      SELECT json_object_agg(sector, count)
      FROM (SELECT sector::text, COUNT(*) as count FROM organisations GROUP BY sector) s
    ),
    'organisations_by_size', (
      SELECT json_object_agg(size, count)
      FROM (SELECT size::text, COUNT(*) as count FROM organisations GROUP BY size) s
    ),
    'total_audits', (SELECT COUNT(*) FROM audits),
    'average_conformity_score', (SELECT COALESCE(ROUND(AVG(conformity_score)), 0) FROM audits),
    'total_processing_records', (SELECT COUNT(*) FROM processing_records),
    'total_data_breaches', (SELECT COUNT(*) FROM data_breaches),
    'data_breaches_by_status', (
      SELECT json_object_agg(status, count)
      FROM (SELECT status, COUNT(*) as count FROM data_breaches GROUP BY status) s
    ),
    'total_rights_requests', (SELECT COUNT(*) FROM rights_requests),
    'rights_requests_by_status', (
      SELECT json_object_agg(status, count)
      FROM (SELECT status, COUNT(*) as count FROM rights_requests GROUP BY status) s
    ),
    'total_subprocessors', (SELECT COUNT(*) FROM subprocessors),
    'total_users', (SELECT COUNT(*) FROM profiles),
    'users_by_role', (
      SELECT json_object_agg(role, count)
      FROM (SELECT role::text, COUNT(*) as count FROM user_roles GROUP BY role) s
    )
  ) INTO result;

  RETURN result;
END;
$$;