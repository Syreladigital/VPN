-- Create a function to get user emails for admins
CREATE OR REPLACE FUNCTION public.get_users_with_emails()
RETURNS TABLE (
  user_id uuid,
  email text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.id as user_id, au.email::text
  FROM auth.users au
  WHERE public.has_role(auth.uid(), 'admin'::app_role) OR public.is_super_admin(auth.uid())
$$;