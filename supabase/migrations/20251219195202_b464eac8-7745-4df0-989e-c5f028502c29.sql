-- Create function to check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- Create function to delete a user (only super_admin can call this)
CREATE OR REPLACE FUNCTION public.delete_user_by_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is super_admin
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can delete users';
  END IF;
  
  -- Prevent deleting yourself
  IF _user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;
  
  -- Delete user's organisations (cascades to related data)
  DELETE FROM public.organisations WHERE user_id = _user_id;
  
  -- Delete user's profile
  DELETE FROM public.profiles WHERE user_id = _user_id;
  
  -- Delete user's roles
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Delete the auth user
  DELETE FROM auth.users WHERE id = _user_id;
  
  RETURN true;
END;
$$;

-- Update RLS policies for user_roles to allow super_admin extended permissions

-- Drop existing policies first
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Recreate with super_admin support
CREATE POLICY "Super admins and admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.is_super_admin(auth.uid())
);

CREATE POLICY "Super admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  public.is_super_admin(auth.uid())
);

CREATE POLICY "Super admins and admins can update roles"
ON public.user_roles
FOR UPDATE
USING (
  -- Super admins can update any role
  public.is_super_admin(auth.uid()) OR
  -- Admins can only update non-super_admin roles
  (public.has_role(auth.uid(), 'admin') AND role != 'super_admin')
);

CREATE POLICY "Super admins can delete roles"
ON public.user_roles
FOR DELETE
USING (
  public.is_super_admin(auth.uid())
);

-- Add policy for profiles - super admins can view all
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins and super admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id OR
  public.has_role(auth.uid(), 'admin') OR 
  public.is_super_admin(auth.uid())
);

-- Super admins can delete profiles
CREATE POLICY "Super admins can delete profiles"
ON public.profiles
FOR DELETE
USING (
  public.is_super_admin(auth.uid())
);

-- Add policies for organisations - super admins have full access
DROP POLICY IF EXISTS "Admins can view all organisations" ON public.organisations;
CREATE POLICY "Admins and super admins can view all organisations"
ON public.organisations
FOR SELECT
USING (
  auth.uid() = user_id OR
  public.has_role(auth.uid(), 'admin') OR 
  public.is_super_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can update all organisations" ON public.organisations;
CREATE POLICY "Admins and super admins can update all organisations"
ON public.organisations
FOR UPDATE
USING (
  auth.uid() = user_id OR
  public.has_role(auth.uid(), 'admin') OR 
  public.is_super_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can delete all organisations" ON public.organisations;
CREATE POLICY "Admins and super admins can delete all organisations"
ON public.organisations
FOR DELETE
USING (
  auth.uid() = user_id OR
  public.has_role(auth.uid(), 'admin') OR 
  public.is_super_admin(auth.uid())
);