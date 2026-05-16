-- Migration automatique des anciens audits vers audit_results
INSERT INTO public.audit_results (
  attempt_id,
  organisation_id,
  audit_type,
  compliance_score,
  earned,
  possible,
  total_questions,
  answered_questions,
  conforme_count,
  partiel_count,
  non_conforme_count,
  risks_high,
  risks_medium,
  risks_low,
  completed_at,
  is_latest
)
SELECT 
  aa.id as attempt_id,
  aa.organisation_id,
  aa.audit_type,
  aa.score_percent as compliance_score,
  aa.earned,
  aa.possible,
  aa.total_questions,
  aa.answered_questions,
  COALESCE(SUM(aas.conforme_count), 0)::integer as conforme_count,
  COALESCE(SUM(aas.partiel_count), 0)::integer as partiel_count,
  COALESCE(SUM(aas.non_conforme_count), 0)::integer as non_conforme_count,
  COALESCE(SUM(aas.high_risk_count), 0)::integer as risks_high,
  0 as risks_medium,
  0 as risks_low,
  COALESCE(aa.completed_at, aa.created_at) as completed_at,
  false as is_latest
FROM public.audit_attempts aa
LEFT JOIN public.audit_attempt_sections aas ON aas.attempt_id = aa.id
WHERE aa.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM public.audit_results ar WHERE ar.attempt_id = aa.id
  )
GROUP BY aa.id, aa.organisation_id, aa.audit_type, aa.score_percent, 
         aa.earned, aa.possible, aa.total_questions, aa.answered_questions,
         aa.completed_at, aa.created_at;

-- Mettre à jour is_latest pour le dernier audit de chaque organisation
WITH latest_audits AS (
  SELECT DISTINCT ON (organisation_id) 
    id
  FROM public.audit_results
  ORDER BY organisation_id, completed_at DESC
)
UPDATE public.audit_results ar
SET is_latest = (ar.id IN (SELECT id FROM latest_audits));