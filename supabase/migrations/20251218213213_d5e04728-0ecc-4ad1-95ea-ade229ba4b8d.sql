-- Create profiles table for DPO information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  job_title TEXT DEFAULT 'DPO',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for profile updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add user_id column to organisations table
ALTER TABLE public.organisations ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing public policies on organisations
DROP POLICY IF EXISTS "Allow public read access to organisations" ON public.organisations;
DROP POLICY IF EXISTS "Allow public insert access to organisations" ON public.organisations;
DROP POLICY IF EXISTS "Allow public update access to organisations" ON public.organisations;

-- Create user-specific policies for organisations
CREATE POLICY "Users can view their own organisations" 
ON public.organisations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own organisations" 
ON public.organisations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own organisations" 
ON public.organisations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own organisations" 
ON public.organisations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Drop existing public policies on audits
DROP POLICY IF EXISTS "Allow public read access to audits" ON public.audits;
DROP POLICY IF EXISTS "Allow public insert access to audits" ON public.audits;
DROP POLICY IF EXISTS "Allow public update access to audits" ON public.audits;

-- Create user-specific policies for audits (via organisation)
CREATE POLICY "Users can view their own audits" 
ON public.audits 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.organisations 
    WHERE organisations.id = audits.organisation_id 
    AND organisations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own audits" 
ON public.audits 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organisations 
    WHERE organisations.id = audits.organisation_id 
    AND organisations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own audits" 
ON public.audits 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.organisations 
    WHERE organisations.id = audits.organisation_id 
    AND organisations.user_id = auth.uid()
  )
);

-- Drop existing public policies on audit_modules
DROP POLICY IF EXISTS "Allow public read access to audit_modules" ON public.audit_modules;
DROP POLICY IF EXISTS "Allow public insert access to audit_modules" ON public.audit_modules;
DROP POLICY IF EXISTS "Allow public update access to audit_modules" ON public.audit_modules;

-- Create user-specific policies for audit_modules (via audit -> organisation)
CREATE POLICY "Users can view their own audit_modules" 
ON public.audit_modules 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.audits 
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audits.id = audit_modules.audit_id 
    AND organisations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own audit_modules" 
ON public.audit_modules 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.audits 
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audits.id = audit_modules.audit_id 
    AND organisations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own audit_modules" 
ON public.audit_modules 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.audits 
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audits.id = audit_modules.audit_id 
    AND organisations.user_id = auth.uid()
  )
);

-- Drop existing public policies on audit_items
DROP POLICY IF EXISTS "Allow public read access to audit_items" ON public.audit_items;
DROP POLICY IF EXISTS "Allow public insert access to audit_items" ON public.audit_items;
DROP POLICY IF EXISTS "Allow public update access to audit_items" ON public.audit_items;

-- Create user-specific policies for audit_items (via module -> audit -> organisation)
CREATE POLICY "Users can view their own audit_items" 
ON public.audit_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.audit_modules
    JOIN public.audits ON audits.id = audit_modules.audit_id
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audit_modules.id = audit_items.module_id 
    AND organisations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own audit_items" 
ON public.audit_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.audit_modules
    JOIN public.audits ON audits.id = audit_modules.audit_id
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audit_modules.id = audit_items.module_id 
    AND organisations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own audit_items" 
ON public.audit_items 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.audit_modules
    JOIN public.audits ON audits.id = audit_modules.audit_id
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audit_modules.id = audit_items.module_id 
    AND organisations.user_id = auth.uid()
  )
);

-- Drop existing public policies on audit_actions
DROP POLICY IF EXISTS "Allow public read access to audit_actions" ON public.audit_actions;
DROP POLICY IF EXISTS "Allow public insert access to audit_actions" ON public.audit_actions;
DROP POLICY IF EXISTS "Allow public update access to audit_actions" ON public.audit_actions;

-- Create user-specific policies for audit_actions (via item -> module -> audit -> organisation)
CREATE POLICY "Users can view their own audit_actions" 
ON public.audit_actions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.audit_items
    JOIN public.audit_modules ON audit_modules.id = audit_items.module_id
    JOIN public.audits ON audits.id = audit_modules.audit_id
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audit_items.id = audit_actions.item_id 
    AND organisations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own audit_actions" 
ON public.audit_actions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.audit_items
    JOIN public.audit_modules ON audit_modules.id = audit_items.module_id
    JOIN public.audits ON audits.id = audit_modules.audit_id
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audit_items.id = audit_actions.item_id 
    AND organisations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own audit_actions" 
ON public.audit_actions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.audit_items
    JOIN public.audit_modules ON audit_modules.id = audit_items.module_id
    JOIN public.audits ON audits.id = audit_modules.audit_id
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audit_items.id = audit_actions.item_id 
    AND organisations.user_id = auth.uid()
  )
);

-- Drop existing public policies on audit_history
DROP POLICY IF EXISTS "Allow public read access to audit_history" ON public.audit_history;
DROP POLICY IF EXISTS "Allow public insert access to audit_history" ON public.audit_history;

-- Create user-specific policies for audit_history (via audit -> organisation)
CREATE POLICY "Users can view their own audit_history" 
ON public.audit_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.audits 
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audits.id = audit_history.audit_id 
    AND organisations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own audit_history" 
ON public.audit_history 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.audits 
    JOIN public.organisations ON organisations.id = audits.organisation_id
    WHERE audits.id = audit_history.audit_id 
    AND organisations.user_id = auth.uid()
  )
);