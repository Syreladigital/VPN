-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  action text NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  organisation_id uuid,
  old_data jsonb,
  new_data jsonb
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_organisation_id ON public.audit_logs(organisation_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_record_id ON public.audit_logs(record_id);

-- RLS Policies
CREATE POLICY "Admins can view all audit_logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can view audit_logs for their organisations"
ON public.audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = audit_logs.organisation_id
    AND organisations.user_id = auth.uid()
  )
);

-- Generic audit logging function
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
  v_record_id uuid;
  v_action text;
BEGIN
  v_user_id := auth.uid();
  
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    v_action := 'CREATE';
    v_record_id := NEW.id;
    -- Try to get organisation_id from different possible column names
    v_org_id := CASE 
      WHEN TG_TABLE_NAME = 'organisations' THEN NEW.id
      ELSE COALESCE(
        (NEW::jsonb)->>'organisation_id',
        NULL
      )::uuid
    END;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'UPDATE';
    v_record_id := NEW.id;
    v_org_id := CASE 
      WHEN TG_TABLE_NAME = 'organisations' THEN NEW.id
      ELSE COALESCE(
        (NEW::jsonb)->>'organisation_id',
        (OLD::jsonb)->>'organisation_id',
        NULL
      )::uuid
    END;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'DELETE';
    v_record_id := OLD.id;
    v_org_id := CASE 
      WHEN TG_TABLE_NAME = 'organisations' THEN OLD.id
      ELSE COALESCE(
        (OLD::jsonb)->>'organisation_id',
        NULL
      )::uuid
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
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for sensitive tables
CREATE TRIGGER audit_organisations
AFTER INSERT OR UPDATE OR DELETE ON public.organisations
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_processing_records
AFTER INSERT OR UPDATE OR DELETE ON public.processing_records
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_data_breaches
AFTER INSERT OR UPDATE OR DELETE ON public.data_breaches
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_rights_requests
AFTER INSERT OR UPDATE OR DELETE ON public.rights_requests
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_subprocessors
AFTER INSERT OR UPDATE OR DELETE ON public.subprocessors
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_audit_results
AFTER INSERT OR UPDATE OR DELETE ON public.audit_results
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_corrective_actions
AFTER INSERT OR UPDATE OR DELETE ON public.corrective_actions
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_client_access
AFTER INSERT OR UPDATE OR DELETE ON public.client_access
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();