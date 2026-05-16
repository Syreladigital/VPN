
-- Drop the existing UPDATE policy
DROP POLICY "Super admins and admins can update roles" ON public.user_roles;

-- Recreate with proper WITH CHECK:
-- Super admins: can update any role to any value
-- Admins: can only update OTHER users' roles (not their own), and can only set role to 'user' or 'client' (not 'admin' or 'super_admin')
CREATE POLICY "Super admins and admins can update roles"
ON public.user_roles
FOR UPDATE
USING (
  is_super_admin(auth.uid())
  OR (
    has_role(auth.uid(), 'admin'::app_role)
    AND role <> 'super_admin'::app_role
    AND user_id <> auth.uid()
  )
)
WITH CHECK (
  is_super_admin(auth.uid())
  OR (
    has_role(auth.uid(), 'admin'::app_role)
    AND role <> 'super_admin'::app_role
    AND role <> 'admin'::app_role
    AND user_id <> auth.uid()
  )
);
