-- Mettre à jour la fonction pour inclure tendances mensuelles et comparaisons sectorielles
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
    -- Statistiques de base
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
    ),
    
    -- Tendances mensuelles (6 derniers mois)
    'monthly_organisations', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT 
          TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') as month,
          COUNT(*) as count
        FROM organisations
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY date_trunc('month', created_at)
        ORDER BY date_trunc('month', created_at)
      ) t
    ),
    'monthly_audits', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT 
          TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') as month,
          COUNT(*) as count,
          ROUND(AVG(conformity_score)) as avg_score
        FROM audits
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY date_trunc('month', created_at)
        ORDER BY date_trunc('month', created_at)
      ) t
    ),
    'monthly_breaches', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT 
          TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') as month,
          COUNT(*) as count
        FROM data_breaches
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY date_trunc('month', created_at)
        ORDER BY date_trunc('month', created_at)
      ) t
    ),
    'monthly_rights_requests', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT 
          TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') as month,
          COUNT(*) as count
        FROM rights_requests
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY date_trunc('month', created_at)
        ORDER BY date_trunc('month', created_at)
      ) t
    ),
    
    -- Comparaisons sectorielles
    'sector_conformity_scores', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT 
          o.sector::text,
          COUNT(DISTINCT a.id) as audit_count,
          COALESCE(ROUND(AVG(a.conformity_score)), 0) as avg_score,
          COALESCE(MIN(a.conformity_score), 0) as min_score,
          COALESCE(MAX(a.conformity_score), 0) as max_score
        FROM organisations o
        LEFT JOIN audits a ON a.organisation_id = o.id
        GROUP BY o.sector
        ORDER BY avg_score DESC
      ) t
    ),
    'sector_breach_rates', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT 
          o.sector::text,
          COUNT(DISTINCT o.id) as org_count,
          COUNT(db.id) as breach_count,
          ROUND(COUNT(db.id)::numeric / NULLIF(COUNT(DISTINCT o.id), 0), 2) as breach_rate
        FROM organisations o
        LEFT JOIN data_breaches db ON db.organisation_id = o.id
        GROUP BY o.sector
        ORDER BY breach_rate DESC
      ) t
    ),
    'sector_subprocessor_usage', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT 
          o.sector::text,
          COUNT(DISTINCT o.id) as org_count,
          COUNT(s.id) as subprocessor_count,
          ROUND(COUNT(s.id)::numeric / NULLIF(COUNT(DISTINCT o.id), 0), 1) as avg_subprocessors
        FROM organisations o
        LEFT JOIN subprocessors s ON s.organisation_id = o.id
        GROUP BY o.sector
        ORDER BY avg_subprocessors DESC
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;