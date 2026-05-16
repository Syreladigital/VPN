-- =============================================================================
-- SyrelaTrust RGPD — Schéma PostgreSQL consolidé (27 tables)
-- Compatible Better Auth (tables user/session/account/verification gérées par Better Auth)
--
-- Adaptations clés :
--   - auth.uid()        → current_user_id() (lit app.user_id)
--   - auth.users(id)    → "user"(id) (table Better Auth, TEXT primary key)
--   - handle_new_user() SUPPRIMÉ (Better Auth gère la création d'utilisateurs)
--   - handle_new_user_role() ADAPTÉ pour se déclencher sur "user"
--   - Trigger handle_new_user_profile() AJOUTÉ pour créer le profil automatiquement
--   - country / legal_framework CONSERVÉS (champs des migrations)
--   - client_access CONSERVÉ (rôle 'client' dans app_role)
--   - auth.role() = 'service_role' → current_setting('app.is_service_role', true)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- HELPER : current_user_id() — lit la variable de session app.user_id
-- Remplace auth.uid() de Supabase
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '');
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------------
-- FONCTION : update_updated_at_column()
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ---------------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------------

CREATE TYPE public.sector_type AS ENUM (
  'sante_reglementee_pharmacien',
  'sante_reglementee_medecin',
  'sante_non_reglementee_bien_etre',
  'assurance_vie',
  'assurance_non_vie',
  'transport_logistique'
);

CREATE TYPE public.organisation_size_type AS ENUM (
  'independant',
  'tpe',
  'pme',
  'groupe'
);

CREATE TYPE public.dpo_role_type AS ENUM (
  'interne',
  'externe',
  'consultant'
);

CREATE TYPE public.conformity_status_type AS ENUM (
  'conforme',
  'partiellement_conforme',
  'non_conforme'
);

CREATE TYPE public.risk_level_type AS ENUM (
  'faible',
  'moyen',
  'eleve'
);

-- app_role : admin / user / super_admin / client
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'super_admin', 'client');

CREATE TYPE public.country_type AS ENUM ('france', 'eu_other', 'tunisie');

CREATE TYPE public.legal_framework_type AS ENUM ('rgpd_eu', 'loi_tunisie_2025');

-- ---------------------------------------------------------------------------
-- TABLE 1 : profiles
-- user_id TEXT → référence "user"(id) Better Auth
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  job_title TEXT DEFAULT 'DPO',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (current_user_id() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (current_user_id() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (current_user_id() = user_id);

-- Note: has_role / is_super_admin ne sont pas encore définis ici → politiques admin ajoutées après
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- TABLE 2 : user_roles
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- FONCTIONS HELPERS pour RLS (créées avant les politiques qui les utilisent)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.has_role(_user_id TEXT, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id TEXT)
RETURNS app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_client(_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'client'
  )
$$;

-- Politiques RLS pour user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (current_user_id() = user_id);

CREATE POLICY "Super admins and admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (
    public.has_role(current_user_id(), 'admin'::app_role) OR
    public.is_super_admin(current_user_id())
  );

CREATE POLICY "Super admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.is_super_admin(current_user_id()));

CREATE POLICY "Super admins and admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (
    public.is_super_admin(current_user_id())
    OR (
      public.has_role(current_user_id(), 'admin'::app_role)
      AND role <> 'super_admin'::app_role
      AND user_id <> current_user_id()
    )
  )
  WITH CHECK (
    public.is_super_admin(current_user_id())
    OR (
      public.has_role(current_user_id(), 'admin'::app_role)
      AND role <> 'super_admin'::app_role
      AND role <> 'admin'::app_role
      AND user_id <> current_user_id()
    )
  );

CREATE POLICY "Super admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.is_super_admin(current_user_id()));

-- Politiques admin différées pour profiles (has_role est maintenant disponible)
CREATE POLICY "Admins and super admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    public.has_role(current_user_id(), 'admin'::app_role) OR
    public.is_super_admin(current_user_id())
  );

CREATE POLICY "Super admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_super_admin(current_user_id()));

-- Triggers Better Auth → assigner rôle et créer profil à la création de compte
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_assign_role
  AFTER INSERT ON "user"
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (NEW.id, NEW.name, NULL)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_create_profile
  AFTER INSERT ON "user"
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- ---------------------------------------------------------------------------
-- TABLE 3 : organisations
-- ---------------------------------------------------------------------------
CREATE TABLE public.organisations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sector sector_type NOT NULL,
  size organisation_size_type NOT NULL,
  dpo_role dpo_role_type NOT NULL,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  country public.country_type NOT NULL DEFAULT 'france',
  legal_framework public.legal_framework_type NOT NULL DEFAULT 'rgpd_eu',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own organisations"
  ON public.organisations FOR SELECT
  USING (current_user_id() = user_id);

CREATE POLICY "Users can insert their own organisations"
  ON public.organisations FOR INSERT
  WITH CHECK (current_user_id() = user_id);

CREATE POLICY "Users can update their own organisations"
  ON public.organisations FOR UPDATE
  USING (current_user_id() = user_id);

CREATE POLICY "Users can delete their own organisations"
  ON public.organisations FOR DELETE
  USING (current_user_id() = user_id);

CREATE POLICY "Admins can view all organisations"
  ON public.organisations FOR SELECT
  USING (
    public.has_role(current_user_id(), 'admin'::app_role) OR
    public.is_super_admin(current_user_id())
  );

-- Politique client (has_client_access défini plus bas — voir note ordering)
-- Ajoutée après la table client_access

CREATE TRIGGER update_organisations_updated_at
  BEFORE UPDATE ON public.organisations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- TABLE 4 : audits (historique de conformité globale)
-- ---------------------------------------------------------------------------
CREATE TABLE public.audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  conformity_score INTEGER NOT NULL DEFAULT 0,
  total_actions INTEGER NOT NULL DEFAULT 0,
  completed_actions INTEGER NOT NULL DEFAULT 0,
  high_risk_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'en_cours',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audits"
  ON public.audits FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = audits.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own audits"
  ON public.audits FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = audits.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own audits"
  ON public.audits FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = audits.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Admins can view all audits"
  ON public.audits FOR SELECT
  USING (
    public.has_role(current_user_id(), 'admin'::app_role) OR
    public.is_super_admin(current_user_id())
  );

CREATE POLICY "Admins can update all audits"
  ON public.audits FOR UPDATE
  USING (
    public.has_role(current_user_id(), 'admin'::app_role) OR
    public.is_super_admin(current_user_id())
  );

CREATE TRIGGER update_audits_updated_at
  BEFORE UPDATE ON public.audits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- TABLE 5 : audit_modules
-- ---------------------------------------------------------------------------
CREATE TABLE public.audit_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status conformity_status_type NOT NULL DEFAULT 'non_conforme',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(audit_id, module_key)
);

ALTER TABLE public.audit_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit_modules"
  ON public.audit_modules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.audits
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audits.id = audit_modules.audit_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own audit_modules"
  ON public.audit_modules FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.audits
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audits.id = audit_modules.audit_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own audit_modules"
  ON public.audit_modules FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.audits
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audits.id = audit_modules.audit_id
    AND organisations.user_id = current_user_id()
  ));

CREATE TRIGGER update_audit_modules_updated_at
  BEFORE UPDATE ON public.audit_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- TABLE 6 : audit_items
-- ---------------------------------------------------------------------------
CREATE TABLE public.audit_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.audit_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status conformity_status_type NOT NULL DEFAULT 'non_conforme',
  risk_level risk_level_type NOT NULL DEFAULT 'moyen',
  risk_justification TEXT,
  dpo_comments TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit_items"
  ON public.audit_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.audit_modules
    JOIN public.audits ON audits.id = audit_modules.audit_id
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audit_modules.id = audit_items.module_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own audit_items"
  ON public.audit_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.audit_modules
    JOIN public.audits ON audits.id = audit_modules.audit_id
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audit_modules.id = audit_items.module_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own audit_items"
  ON public.audit_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.audit_modules
    JOIN public.audits ON audits.id = audit_modules.audit_id
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audit_modules.id = audit_items.module_id
    AND organisations.user_id = current_user_id()
  ));

CREATE TRIGGER update_audit_items_updated_at
  BEFORE UPDATE ON public.audit_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- TABLE 7 : audit_actions (actions correctives legacy)
-- ---------------------------------------------------------------------------
CREATE TABLE public.audit_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.audit_items(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority >= 1 AND priority <= 3),
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit_actions"
  ON public.audit_actions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.audit_items
    JOIN public.audit_modules ON audit_modules.id = audit_items.module_id
    JOIN public.audits ON audits.id = audit_modules.audit_id
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audit_items.id = audit_actions.item_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own audit_actions"
  ON public.audit_actions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.audit_items
    JOIN public.audit_modules ON audit_modules.id = audit_items.module_id
    JOIN public.audits ON audits.id = audit_modules.audit_id
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audit_items.id = audit_actions.item_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own audit_actions"
  ON public.audit_actions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.audit_items
    JOIN public.audit_modules ON audit_modules.id = audit_items.module_id
    JOIN public.audits ON audits.id = audit_modules.audit_id
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audit_items.id = audit_actions.item_id
    AND organisations.user_id = current_user_id()
  ));

CREATE TRIGGER update_audit_actions_updated_at
  BEFORE UPDATE ON public.audit_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- TABLE 8 : audit_history (snapshots de conformité)
-- ---------------------------------------------------------------------------
CREATE TABLE public.audit_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  conformity_score INTEGER NOT NULL,
  total_actions INTEGER NOT NULL,
  completed_actions INTEGER NOT NULL,
  high_risk_count INTEGER NOT NULL,
  snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

ALTER TABLE public.audit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit_history"
  ON public.audit_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.audits
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audits.id = audit_history.audit_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own audit_history"
  ON public.audit_history FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.audits
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audits.id = audit_history.audit_id
    AND organisations.user_id = current_user_id()
  ));

-- ---------------------------------------------------------------------------
-- TABLE 9 : processing_records (Registre traitements Art. 30 RGPD)
-- ---------------------------------------------------------------------------
CREATE TABLE public.processing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  purposes TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  data_categories JSONB DEFAULT '[]'::jsonb,
  data_subjects TEXT[] DEFAULT '{}',
  recipients TEXT[] DEFAULT '{}',
  transfers_outside_eu BOOLEAN DEFAULT false,
  transfer_safeguards TEXT,
  retention_period TEXT,
  security_measures TEXT,
  dpo_validation BOOLEAN DEFAULT false,
  dpo_validation_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.processing_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own processing_records"
  ON public.processing_records FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = processing_records.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own processing_records"
  ON public.processing_records FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = processing_records.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own processing_records"
  ON public.processing_records FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = processing_records.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can delete their own processing_records"
  ON public.processing_records FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = processing_records.organisation_id
    AND organisations.user_id = current_user_id()
  ));

-- Politique client ajoutée après has_client_access

CREATE TRIGGER update_processing_records_updated_at
  BEFORE UPDATE ON public.processing_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- TABLE 10 : data_breaches (Registre violations Art. 33 RGPD)
-- ---------------------------------------------------------------------------
CREATE TABLE public.data_breaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  breach_date TIMESTAMPTZ NOT NULL,
  discovery_date TIMESTAMPTZ NOT NULL,
  notification_deadline TIMESTAMPTZ,
  cnil_notified BOOLEAN DEFAULT false,
  cnil_notification_date TIMESTAMPTZ,
  nature TEXT NOT NULL,
  categories_affected TEXT[] DEFAULT '{}',
  estimated_count INTEGER,
  consequences TEXT,
  measures_taken TEXT,
  persons_informed BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.data_breaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data_breaches"
  ON public.data_breaches FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = data_breaches.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own data_breaches"
  ON public.data_breaches FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = data_breaches.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own data_breaches"
  ON public.data_breaches FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = data_breaches.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can delete their own data_breaches"
  ON public.data_breaches FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = data_breaches.organisation_id
    AND organisations.user_id = current_user_id()
  ));

-- Politique client ajoutée après has_client_access

CREATE TRIGGER update_data_breaches_updated_at
  BEFORE UPDATE ON public.data_breaches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- TABLE 11 : rights_requests (DSAR - Demandes droits)
-- ---------------------------------------------------------------------------
CREATE TABLE public.rights_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  request_date TIMESTAMPTZ NOT NULL,
  deadline TIMESTAMPTZ,
  requester_name TEXT NOT NULL,
  requester_email TEXT,
  identity_verified BOOLEAN DEFAULT false,
  right_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  response_date TIMESTAMPTZ,
  response_content TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rights_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rights_requests"
  ON public.rights_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = rights_requests.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own rights_requests"
  ON public.rights_requests FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = rights_requests.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own rights_requests"
  ON public.rights_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = rights_requests.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can delete their own rights_requests"
  ON public.rights_requests FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = rights_requests.organisation_id
    AND organisations.user_id = current_user_id()
  ));

-- Politique client ajoutée après has_client_access

CREATE TRIGGER update_rights_requests_updated_at
  BEFORE UPDATE ON public.rights_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- TABLE 12 : subprocessors (Registre sous-traitants Art. 28 RGPD)
-- ---------------------------------------------------------------------------
CREATE TABLE public.subprocessors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  activity TEXT NOT NULL,
  data_processed JSONB DEFAULT '[]'::jsonb,
  contract_signed BOOLEAN DEFAULT false,
  contract_date DATE,
  hds_certified BOOLEAN DEFAULT false,
  location TEXT,
  eu_based BOOLEAN DEFAULT true,
  transfer_mechanism TEXT,
  review_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subprocessors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subprocessors"
  ON public.subprocessors FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = subprocessors.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own subprocessors"
  ON public.subprocessors FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = subprocessors.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own subprocessors"
  ON public.subprocessors FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = subprocessors.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can delete their own subprocessors"
  ON public.subprocessors FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = subprocessors.organisation_id
    AND organisations.user_id = current_user_id()
  ));

-- Politique client ajoutée après has_client_access

CREATE TRIGGER update_subprocessors_updated_at
  BEFORE UPDATE ON public.subprocessors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- TABLE 13 : notifications
-- ---------------------------------------------------------------------------
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = notifications.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = notifications.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = notifications.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = notifications.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- TABLE 14 : email_notification_settings
-- (liée à organisation, pas à user directement)
-- ---------------------------------------------------------------------------
CREATE TABLE public.email_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  email_recipients TEXT[] DEFAULT '{}',
  notify_breaches BOOLEAN DEFAULT true,
  notify_rights_requests BOOLEAN DEFAULT true,
  notify_subprocessors BOOLEAN DEFAULT true,
  breach_reminder_hours INTEGER DEFAULT 48,
  rights_reminder_days INTEGER DEFAULT 7,
  subprocessor_reminder_days INTEGER DEFAULT 30,
  enabled BOOLEAN DEFAULT true,
  sender_name TEXT DEFAULT 'Syrela Trust',
  reply_to_email TEXT,
  notify_requester_on_status_change BOOLEAN DEFAULT true,
  rights_email_subject_template TEXT DEFAULT '{{STATUS_EMOJI}} Votre demande de droits a été {{STATUS_TEXT}}',
  rights_email_body_template TEXT DEFAULT E'Bonjour {{REQUESTER_NAME}},\n\n{{STATUS_MESSAGE}}\n\n{{RESPONSE_CONTENT}}\n\nCordialement,\nL''équipe {{ORGANISATION_NAME}}',
  rights_email_completed_message TEXT DEFAULT E'Nous avons le plaisir de vous informer que votre demande d''exercice de votre {{RIGHT_TYPE}} a été traitée avec succès.',
  rights_email_rejected_message TEXT DEFAULT E'Suite à votre demande d''exercice de votre {{RIGHT_TYPE}}, nous vous informons que celle-ci n''a pas pu être satisfaite.',
  rights_email_in_progress_message TEXT DEFAULT E'Nous vous informons que votre demande d''exercice de votre {{RIGHT_TYPE}} est en cours de traitement.',
  breach_email_subject_template TEXT DEFAULT '{{SEVERITY_EMOJI}} Alerte violation de données - {{BREACH_NATURE}}',
  breach_email_body_template TEXT DEFAULT E'Bonjour,\n\nUne violation de données a été détectée et nécessite votre attention.\n\nNature : {{BREACH_NATURE}}\nDate de la violation : {{BREACH_DATE}}\nDate de découverte : {{DISCOVERY_DATE}}\nÉchéance notification CNIL : {{NOTIFICATION_DEADLINE}}\n\n{{ADDITIONAL_INFO}}\n\nCordialement,\nL''équipe {{ORGANISATION_NAME}}',
  subprocessor_email_subject_template TEXT DEFAULT '📋 Rappel : Révision sous-traitant - {{SUBPROCESSOR_NAME}}',
  subprocessor_email_body_template TEXT DEFAULT E'Bonjour,\n\nUn rappel de révision pour un sous-traitant est prévu.\n\nSous-traitant : {{SUBPROCESSOR_NAME}}\nActivité : {{SUBPROCESSOR_ACTIVITY}}\nDate de révision prévue : {{REVIEW_DATE}}\nLocalisation : {{SUBPROCESSOR_LOCATION}}\n\n{{ADDITIONAL_INFO}}\n\nCordialement,\nL''équipe {{ORGANISATION_NAME}}',
  notify_corrective_actions BOOLEAN DEFAULT true,
  corrective_actions_reminder_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organisation_id)
);

ALTER TABLE public.email_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email_notification_settings"
  ON public.email_notification_settings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = email_notification_settings.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own email_notification_settings"
  ON public.email_notification_settings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = email_notification_settings.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own email_notification_settings"
  ON public.email_notification_settings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = email_notification_settings.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can delete their own email_notification_settings"
  ON public.email_notification_settings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = email_notification_settings.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE TRIGGER update_email_notification_settings_updated_at
  BEFORE UPDATE ON public.email_notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- TABLE 15 : email_logs
-- ---------------------------------------------------------------------------
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES public.notifications(id) ON DELETE SET NULL,
  recipients TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email_logs"
  ON public.email_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = email_logs.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own email_logs"
  ON public.email_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = email_logs.organisation_id
    AND organisations.user_id = current_user_id()
  ));

-- ---------------------------------------------------------------------------
-- TABLE 16 : questionnaire_responses
-- ---------------------------------------------------------------------------
CREATE TABLE public.questionnaire_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  sector TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  notes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_questionnaire_responses_org ON public.questionnaire_responses(organisation_id);
CREATE UNIQUE INDEX idx_questionnaire_responses_unique ON public.questionnaire_responses(organisation_id);

ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own questionnaire_responses"
  ON public.questionnaire_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = questionnaire_responses.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own questionnaire_responses"
  ON public.questionnaire_responses FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = questionnaire_responses.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own questionnaire_responses"
  ON public.questionnaire_responses FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = questionnaire_responses.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can delete their own questionnaire_responses"
  ON public.questionnaire_responses FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = questionnaire_responses.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE TRIGGER update_questionnaire_responses_updated_at
  BEFORE UPDATE ON public.questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- TABLE 17 : conformity_scores
-- ---------------------------------------------------------------------------
CREATE TABLE public.conformity_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL DEFAULT 0,
  overall_max_score INTEGER NOT NULL DEFAULT 0,
  overall_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  conformity_level TEXT NOT NULL DEFAULT 'non_evalue',
  section_scores JSONB DEFAULT '[]',
  total_questions INTEGER NOT NULL DEFAULT 0,
  answered_questions INTEGER NOT NULL DEFAULT 0,
  critical_questions_total INTEGER NOT NULL DEFAULT 0,
  critical_questions_passed INTEGER NOT NULL DEFAULT 0,
  high_risk_count INTEGER NOT NULL DEFAULT 0,
  medium_risk_count INTEGER NOT NULL DEFAULT 0,
  low_risk_count INTEGER NOT NULL DEFAULT 0,
  priority_recommendations JSONB DEFAULT '[]',
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_conformity_scores_org ON public.conformity_scores(organisation_id);
CREATE UNIQUE INDEX idx_conformity_scores_unique ON public.conformity_scores(organisation_id);
CREATE INDEX idx_conformity_scores_level ON public.conformity_scores(conformity_level);

ALTER TABLE public.conformity_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conformity_scores"
  ON public.conformity_scores FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = conformity_scores.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own conformity_scores"
  ON public.conformity_scores FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = conformity_scores.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own conformity_scores"
  ON public.conformity_scores FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = conformity_scores.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can delete their own conformity_scores"
  ON public.conformity_scores FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = conformity_scores.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Admins can view all conformity_scores"
  ON public.conformity_scores FOR SELECT
  USING (
    public.has_role(current_user_id(), 'admin'::app_role) OR
    public.is_super_admin(current_user_id())
  );

CREATE TRIGGER update_conformity_scores_updated_at
  BEFORE UPDATE ON public.conformity_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- TABLE 18 : audit_attempts
-- ---------------------------------------------------------------------------
CREATE TABLE public.audit_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  score_percent INTEGER NOT NULL DEFAULT 0,
  earned NUMERIC NOT NULL DEFAULT 0,
  possible NUMERIC NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  answered_questions INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.audit_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit_attempts"
  ON public.audit_attempts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = audit_attempts.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own audit_attempts"
  ON public.audit_attempts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = audit_attempts.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own audit_attempts"
  ON public.audit_attempts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = audit_attempts.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can delete their own audit_attempts"
  ON public.audit_attempts FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = audit_attempts.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Admins can view all audit_attempts"
  ON public.audit_attempts FOR SELECT
  USING (
    public.has_role(current_user_id(), 'admin'::app_role) OR
    public.is_super_admin(current_user_id())
  );

CREATE INDEX idx_audit_attempts_organisation ON public.audit_attempts(organisation_id);
CREATE INDEX idx_audit_attempts_status ON public.audit_attempts(status);
CREATE INDEX idx_audit_attempts_completed ON public.audit_attempts(organisation_id, status, completed_at DESC);

-- ---------------------------------------------------------------------------
-- TABLE 19 : audit_attempt_answers
-- ---------------------------------------------------------------------------
CREATE TABLE public.audit_attempt_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.audit_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_value TEXT,
  score NUMERIC NOT NULL DEFAULT 0,
  max_score NUMERIC NOT NULL DEFAULT 0,
  risk_level TEXT,
  section_id TEXT NOT NULL,
  is_critical BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(attempt_id, question_id)
);

ALTER TABLE public.audit_attempt_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit_attempt_answers"
  ON public.audit_attempt_answers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM audit_attempts
    JOIN organisations ON organisations.id = audit_attempts.organisation_id
    WHERE audit_attempts.id = audit_attempt_answers.attempt_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own audit_attempt_answers"
  ON public.audit_attempt_answers FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM audit_attempts
    JOIN organisations ON organisations.id = audit_attempts.organisation_id
    WHERE audit_attempts.id = audit_attempt_answers.attempt_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own audit_attempt_answers"
  ON public.audit_attempt_answers FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM audit_attempts
    JOIN organisations ON organisations.id = audit_attempts.organisation_id
    WHERE audit_attempts.id = audit_attempt_answers.attempt_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can delete their own audit_attempt_answers"
  ON public.audit_attempt_answers FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM audit_attempts
    JOIN organisations ON organisations.id = audit_attempts.organisation_id
    WHERE audit_attempts.id = audit_attempt_answers.attempt_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Admins can view all audit_attempt_answers"
  ON public.audit_attempt_answers FOR SELECT
  USING (
    public.has_role(current_user_id(), 'admin'::app_role) OR
    public.is_super_admin(current_user_id())
  );

CREATE INDEX idx_audit_attempt_answers_attempt ON public.audit_attempt_answers(attempt_id);

-- ---------------------------------------------------------------------------
-- TABLE 20 : audit_attempt_sections
-- ---------------------------------------------------------------------------
CREATE TABLE public.audit_attempt_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.audit_attempts(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  section_title TEXT NOT NULL,
  earned NUMERIC NOT NULL DEFAULT 0,
  possible NUMERIC NOT NULL DEFAULT 0,
  percent INTEGER NOT NULL DEFAULT 0,
  conform_status TEXT NOT NULL DEFAULT 'non_conforme' CHECK (conform_status IN ('conforme', 'partiel', 'non_conforme')),
  conforme_count INTEGER NOT NULL DEFAULT 0,
  partiel_count INTEGER NOT NULL DEFAULT 0,
  non_conforme_count INTEGER NOT NULL DEFAULT 0,
  high_risk_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(attempt_id, section_id)
);

ALTER TABLE public.audit_attempt_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit_attempt_sections"
  ON public.audit_attempt_sections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM audit_attempts
    JOIN organisations ON organisations.id = audit_attempts.organisation_id
    WHERE audit_attempts.id = audit_attempt_sections.attempt_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own audit_attempt_sections"
  ON public.audit_attempt_sections FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM audit_attempts
    JOIN organisations ON organisations.id = audit_attempts.organisation_id
    WHERE audit_attempts.id = audit_attempt_sections.attempt_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own audit_attempt_sections"
  ON public.audit_attempt_sections FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM audit_attempts
    JOIN organisations ON organisations.id = audit_attempts.organisation_id
    WHERE audit_attempts.id = audit_attempt_sections.attempt_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can delete their own audit_attempt_sections"
  ON public.audit_attempt_sections FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM audit_attempts
    JOIN organisations ON organisations.id = audit_attempts.organisation_id
    WHERE audit_attempts.id = audit_attempt_sections.attempt_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Admins can view all audit_attempt_sections"
  ON public.audit_attempt_sections FOR SELECT
  USING (
    public.has_role(current_user_id(), 'admin'::app_role) OR
    public.is_super_admin(current_user_id())
  );

CREATE INDEX idx_audit_attempt_sections_attempt ON public.audit_attempt_sections(attempt_id);

-- ---------------------------------------------------------------------------
-- TABLE 21 : audit_results (source unique de vérité pour scores finaux)
-- ---------------------------------------------------------------------------
CREATE TABLE public.audit_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES public.audit_attempts(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL,
  compliance_score INTEGER NOT NULL DEFAULT 0,
  earned NUMERIC NOT NULL DEFAULT 0,
  possible NUMERIC NOT NULL DEFAULT 0,
  conforme_count INTEGER NOT NULL DEFAULT 0,
  partiel_count INTEGER NOT NULL DEFAULT 0,
  non_conforme_count INTEGER NOT NULL DEFAULT 0,
  risks_high INTEGER NOT NULL DEFAULT 0,
  risks_medium INTEGER NOT NULL DEFAULT 0,
  risks_low INTEGER NOT NULL DEFAULT 0,
  actions_total INTEGER NOT NULL DEFAULT 0,
  actions_completed INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  answered_questions INTEGER NOT NULL DEFAULT 0,
  is_latest BOOLEAN NOT NULL DEFAULT true,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organisation_id, attempt_id)
);

CREATE INDEX idx_audit_results_org_latest ON public.audit_results(organisation_id, is_latest) WHERE is_latest = true;
CREATE INDEX idx_audit_results_org_type ON public.audit_results(organisation_id, audit_type);

ALTER TABLE public.audit_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit_results"
  ON public.audit_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = audit_results.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own audit_results"
  ON public.audit_results FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = audit_results.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own audit_results"
  ON public.audit_results FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = audit_results.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can delete their own audit_results"
  ON public.audit_results FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = audit_results.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Admins can view all audit_results"
  ON public.audit_results FOR SELECT
  USING (
    public.has_role(current_user_id(), 'admin'::app_role) OR
    public.is_super_admin(current_user_id())
  );

-- Politique client ajoutée après has_client_access

CREATE TRIGGER update_audit_results_updated_at
  BEFORE UPDATE ON public.audit_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_audit_results_latest()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.audit_results
  SET is_latest = false
  WHERE organisation_id = NEW.organisation_id
    AND id != NEW.id
    AND is_latest = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER audit_results_set_latest
  AFTER INSERT ON public.audit_results
  FOR EACH ROW EXECUTE FUNCTION public.update_audit_results_latest();

-- ---------------------------------------------------------------------------
-- TABLE 22 : corrective_actions
-- ---------------------------------------------------------------------------
CREATE TABLE public.corrective_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES public.audit_attempts(id) ON DELETE SET NULL,
  question_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  impact_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.corrective_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own corrective_actions"
  ON public.corrective_actions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = corrective_actions.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own corrective_actions"
  ON public.corrective_actions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = corrective_actions.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own corrective_actions"
  ON public.corrective_actions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = corrective_actions.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can delete their own corrective_actions"
  ON public.corrective_actions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = corrective_actions.organisation_id
    AND organisations.user_id = current_user_id()
  ));

-- Politique client ajoutée après has_client_access

CREATE TRIGGER update_corrective_actions_updated_at
  BEFORE UPDATE ON public.corrective_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_corrective_actions_organisation ON public.corrective_actions(organisation_id);
CREATE INDEX idx_corrective_actions_status ON public.corrective_actions(status);

-- ---------------------------------------------------------------------------
-- TABLE 23 : client_access (liaison clients ↔ organisations)
-- ---------------------------------------------------------------------------
CREATE TABLE public.client_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id TEXT NOT NULL,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_user_id, organisation_id)
);

ALTER TABLE public.client_access ENABLE ROW LEVEL SECURITY;

-- Fonction has_client_access (utilisée dans les politiques ci-dessous et dans les tables précédentes)
CREATE OR REPLACE FUNCTION public.has_client_access(_user_id TEXT, _organisation_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.client_access
    WHERE client_user_id = _user_id
      AND organisation_id = _organisation_id
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Politiques client_access
CREATE POLICY "Clients can view their own access"
  ON public.client_access FOR SELECT
  USING (client_user_id = current_user_id());

CREATE POLICY "Admins can manage client access"
  ON public.client_access FOR ALL
  USING (
    public.has_role(current_user_id(), 'admin'::app_role) OR
    public.is_super_admin(current_user_id())
  );

CREATE POLICY "Organisation owners can view client access"
  ON public.client_access FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = client_access.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Organisation owners can insert client access"
  ON public.client_access FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = client_access.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Organisation owners can update client access"
  ON public.client_access FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = client_access.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Organisation owners can delete client access"
  ON public.client_access FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = client_access.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE TRIGGER update_client_access_updated_at
  BEFORE UPDATE ON public.client_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Politiques clients ajoutées ici (has_client_access est maintenant disponible)
-- ---------------------------------------------------------------------------

CREATE POLICY "Clients can view their linked organisations"
  ON public.organisations FOR SELECT
  USING (public.has_client_access(current_user_id(), id));

CREATE POLICY "Clients can view processing_records for their organisations"
  ON public.processing_records FOR SELECT
  USING (public.has_client_access(current_user_id(), organisation_id));

CREATE POLICY "Clients can view data_breaches for their organisations"
  ON public.data_breaches FOR SELECT
  USING (public.has_client_access(current_user_id(), organisation_id));

CREATE POLICY "Clients can view rights_requests for their organisations"
  ON public.rights_requests FOR SELECT
  USING (public.has_client_access(current_user_id(), organisation_id));

CREATE POLICY "Clients can view subprocessors for their organisations"
  ON public.subprocessors FOR SELECT
  USING (public.has_client_access(current_user_id(), organisation_id));

CREATE POLICY "Clients can view audit_results for their organisations"
  ON public.audit_results FOR SELECT
  USING (public.has_client_access(current_user_id(), organisation_id));

CREATE POLICY "Clients can view audit_attempt_sections for their organisations"
  ON public.audit_attempt_sections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.audit_attempts aa
    JOIN public.client_access ca ON ca.organisation_id = aa.organisation_id
    WHERE aa.id = audit_attempt_sections.attempt_id
    AND ca.client_user_id = current_user_id()
    AND (ca.expires_at IS NULL OR ca.expires_at > now())
  ));

CREATE POLICY "Clients can view corrective_actions for their organisations"
  ON public.corrective_actions FOR SELECT
  USING (public.has_client_access(current_user_id(), organisation_id));

-- ---------------------------------------------------------------------------
-- TABLE 24 : messages (messagerie interne)
-- ---------------------------------------------------------------------------
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_from_consultant BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for their organisations"
  ON public.messages FOR SELECT
  USING (
    organisation_id IN (
      SELECT id FROM public.organisations WHERE user_id = current_user_id()
    )
    OR sender_id = current_user_id()
    OR public.has_role(current_user_id(), 'admin'::app_role)
    OR public.is_super_admin(current_user_id())
  );

CREATE POLICY "Authenticated users can create messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    current_user_id() IS NOT NULL
    AND (
      organisation_id IN (SELECT id FROM public.organisations WHERE user_id = current_user_id())
      OR public.has_role(current_user_id(), 'admin'::app_role)
      OR public.is_super_admin(current_user_id())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (
    organisation_id IN (SELECT id FROM public.organisations WHERE user_id = current_user_id())
    OR sender_id = current_user_id()
    OR public.has_role(current_user_id(), 'admin'::app_role)
    OR public.is_super_admin(current_user_id())
  );

CREATE POLICY "Clients can view messages for their organisations"
  ON public.messages FOR SELECT
  USING (public.has_client_access(current_user_id(), organisation_id));

CREATE POLICY "Clients can insert messages for their organisations"
  ON public.messages FOR INSERT
  WITH CHECK (
    current_user_id() IS NOT NULL
    AND public.has_client_access(current_user_id(), organisation_id)
    AND sender_id = current_user_id()
  );

CREATE POLICY "Clients can update messages for their organisations"
  ON public.messages FOR UPDATE
  USING (public.has_client_access(current_user_id(), organisation_id));

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- TABLE 25 : admin_activity_logs
-- ---------------------------------------------------------------------------
CREATE TABLE public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity logs"
  ON public.admin_activity_logs FOR SELECT
  USING (
    public.has_role(current_user_id(), 'admin'::app_role) OR
    public.is_super_admin(current_user_id())
  );

CREATE POLICY "Admins can insert activity logs"
  ON public.admin_activity_logs FOR INSERT
  WITH CHECK (
    public.has_role(current_user_id(), 'admin'::app_role) OR
    public.is_super_admin(current_user_id())
  );

CREATE INDEX idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);
CREATE INDEX idx_admin_activity_logs_actor_id ON public.admin_activity_logs(actor_id);

-- ---------------------------------------------------------------------------
-- TABLE 26 : audit_logs (journal d'audit générique)
-- ---------------------------------------------------------------------------
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  organisation_id UUID,
  old_data JSONB,
  new_data JSONB
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_organisation_id ON public.audit_logs(organisation_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_record_id ON public.audit_logs(record_id);

CREATE POLICY "Admins can view all audit_logs"
  ON public.audit_logs FOR SELECT
  USING (
    public.has_role(current_user_id(), 'admin'::app_role) OR
    public.is_super_admin(current_user_id())
  );

CREATE POLICY "Users can view audit_logs for their organisations"
  ON public.audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = audit_logs.organisation_id
    AND organisations.user_id = current_user_id()
  ));

-- Fonction de logging générique (adaptée de la migration, sans auth.uid())
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id TEXT;
  v_org_id UUID;
  v_record_id UUID;
  v_action TEXT;
  v_new JSONB;
  v_old JSONB;
BEGIN
  v_user_id := current_user_id();

  v_new := CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END;
  v_old := CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END;

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
    v_user_id, v_action, TG_TABLE_NAME, v_record_id, v_org_id, v_old, v_new
  );

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Triggers d'audit sur les tables sensibles
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

-- ---------------------------------------------------------------------------
-- TABLE 27 : flash_audit_results
-- ---------------------------------------------------------------------------
CREATE TABLE public.flash_audit_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL DEFAULT 'pharmacy',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  critical_count INTEGER NOT NULL DEFAULT 0,
  sensitive_count INTEGER NOT NULL DEFAULT 0,
  acceptable_count INTEGER NOT NULL DEFAULT 0,
  total_alerts INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  flow_map JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.flash_audit_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own flash_audit_results"
  ON public.flash_audit_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = flash_audit_results.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can insert their own flash_audit_results"
  ON public.flash_audit_results FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = flash_audit_results.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can update their own flash_audit_results"
  ON public.flash_audit_results FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = flash_audit_results.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Users can delete their own flash_audit_results"
  ON public.flash_audit_results FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM organisations
    WHERE organisations.id = flash_audit_results.organisation_id
    AND organisations.user_id = current_user_id()
  ));

CREATE POLICY "Admins can view all flash_audit_results"
  ON public.flash_audit_results FOR SELECT
  USING (
    public.has_role(current_user_id(), 'admin'::app_role) OR
    public.is_super_admin(current_user_id())
  );

CREATE POLICY "Clients can view flash_audit_results for their organisations"
  ON public.flash_audit_results FOR SELECT
  USING (public.has_client_access(current_user_id(), organisation_id));

CREATE INDEX idx_flash_audit_results_organisation ON public.flash_audit_results(organisation_id);
CREATE INDEX idx_flash_audit_results_completed_at ON public.flash_audit_results(completed_at DESC);

CREATE TRIGGER update_flash_audit_results_updated_at
  BEFORE UPDATE ON public.flash_audit_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- TABLE BONUS : subscriptions (Stripe billing)
-- ---------------------------------------------------------------------------
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  price_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (current_user_id() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    public.has_role(current_user_id(), 'admin'::app_role) OR
    public.is_super_admin(current_user_id())
  );

-- Le backend insère les subscriptions via Stripe webhook sans contexte utilisateur RLS
-- Utiliser un rôle PostgreSQL dédié ou désactiver RLS pour les inserts depuis le backend
CREATE POLICY "Service role manages subscriptions"
  ON public.subscriptions FOR ALL
  USING (current_setting('app.is_service_role', true) = 'true')
  WITH CHECK (current_setting('app.is_service_role', true) = 'true');

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- FONCTIONS ANALYTICS / ADMIN
-- ---------------------------------------------------------------------------

-- get_users_with_emails : joint sur "user" (Better Auth) au lieu de auth.users
CREATE OR REPLACE FUNCTION public.get_users_with_emails()
RETURNS TABLE(user_id TEXT, email TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT u.id AS user_id, u.email::TEXT
  FROM "user" u
  WHERE public.has_role(current_user_id(), 'admin'::app_role) OR public.is_super_admin(current_user_id())
$$;

-- delete_user_by_super_admin : supprime via "user" (CASCADE supprime le reste)
CREATE OR REPLACE FUNCTION public.delete_user_by_super_admin(_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_super_admin(current_user_id()) THEN
    RAISE EXCEPTION 'Only super admins can delete users';
  END IF;

  IF _user_id = current_user_id() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;

  DELETE FROM "user" WHERE id = _user_id;
  RETURN true;
END;
$$;

-- has_active_subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(
  user_uuid TEXT,
  check_env TEXT DEFAULT 'live'
)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
      AND environment = check_env
      AND (
        (status IN ('active', 'trialing') AND (current_period_end IS NULL OR current_period_end > now()))
        OR (status = 'canceled' AND current_period_end > now())
      )
  );
$$;

-- get_anonymized_statistics : statistiques anonymisées pour admins
CREATE OR REPLACE FUNCTION public.get_anonymized_statistics()
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT (has_role(current_user_id(), 'admin'::app_role) OR is_super_admin(current_user_id())) THEN
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
    ),
    'monthly_organisations', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') as month, COUNT(*) as count
        FROM organisations
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY date_trunc('month', created_at)
        ORDER BY date_trunc('month', created_at)
      ) t
    ),
    'monthly_audits', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') as month,
               COUNT(*) as count, ROUND(AVG(conformity_score)) as avg_score
        FROM audits
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY date_trunc('month', created_at)
        ORDER BY date_trunc('month', created_at)
      ) t
    ),
    'monthly_breaches', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') as month, COUNT(*) as count
        FROM data_breaches
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY date_trunc('month', created_at)
        ORDER BY date_trunc('month', created_at)
      ) t
    ),
    'monthly_rights_requests', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') as month, COUNT(*) as count
        FROM rights_requests
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY date_trunc('month', created_at)
        ORDER BY date_trunc('month', created_at)
      ) t
    ),
    'sector_conformity_scores', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT o.sector::text,
               COUNT(DISTINCT a.id) as audit_count,
               COALESCE(ROUND(AVG(a.conformity_score)), 0) as avg_score,
               COALESCE(MIN(a.conformity_score), 0) as min_score,
               COALESCE(MAX(a.conformity_score), 0) as max_score
        FROM organisations o
        LEFT JOIN audits a ON a.organisation_id = o.id
        GROUP BY o.sector ORDER BY avg_score DESC
      ) t
    ),
    'sector_breach_rates', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT o.sector::text,
               COUNT(DISTINCT o.id) as org_count,
               COUNT(db.id) as breach_count,
               ROUND(COUNT(db.id)::numeric / NULLIF(COUNT(DISTINCT o.id), 0), 2) as breach_rate
        FROM organisations o
        LEFT JOIN data_breaches db ON db.organisation_id = o.id
        GROUP BY o.sector ORDER BY breach_rate DESC
      ) t
    ),
    'sector_subprocessor_usage', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT o.sector::text,
               COUNT(DISTINCT o.id) as org_count,
               COUNT(s.id) as subprocessor_count,
               ROUND(COUNT(s.id)::numeric / NULLIF(COUNT(DISTINCT o.id), 0), 1) as avg_subprocessors
        FROM organisations o
        LEFT JOIN subprocessors s ON s.organisation_id = o.id
        GROUP BY o.sector ORDER BY avg_subprocessors DESC
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;
