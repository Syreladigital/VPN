-- Allow admins to view all organisations
CREATE POLICY "Admins can view all organisations" 
ON public.organisations 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

-- Allow admins to view all profiles for organisation owners
CREATE POLICY "Admins can view all profiles for organisations" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));