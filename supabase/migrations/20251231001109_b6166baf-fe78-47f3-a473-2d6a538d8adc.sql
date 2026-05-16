-- Fix audit logging trigger function: avoid invalid casts (NEW::jsonb)
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
  v_record_id uuid;
  v_action text;
  v_new jsonb;
  v_old jsonb;
BEGIN
  v_user_id := auth.uid();

  v_new := CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END;
  v_old := CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END;

  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    v_action := 'CREATE';
    v_record_id := NEW.id;
    v_org_id := CASE
      WHEN TG_TABLE_NAME = 'organisations' THEN NEW.id
      ELSE (v_new->>'organisation_id')::uuid
    END;

  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'UPDATE';
    v_record_id := NEW.id;
    v_org_id := CASE
      WHEN TG_TABLE_NAME = 'organisations' THEN NEW.id
      ELSE COALESCE(
        (v_new->>'organisation_id')::uuid,
        (v_old->>'organisation_id')::uuid
      )
    END;

  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'DELETE';
    v_record_id := OLD.id;
    v_org_id := CASE
      WHEN TG_TABLE_NAME = 'organisations' THEN OLD.id
      ELSE (v_old->>'organisation_id')::uuid
    END;
  END IF;

  INSERT INTO public.audit_logs (
    user_id, action, table_name, record_id, organisation_id, old_data, new_data
  ) VALUES (
    v_user_id,
    v_action,
    TG_TABLE_NAME,
    v_record_id,
    v_org_id,
    v_old,
    v_new
  );

  RETURN COALESCE(NEW, OLD);
END;
$function$;
