-- Create activity logs table for admin actions
CREATE TABLE public.admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action_type text NOT NULL,
  target_user_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins and super admins can view logs
CREATE POLICY "Admins can view activity logs"
ON public.admin_activity_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_super_admin(auth.uid()));

-- Only admins and super admins can insert logs
CREATE POLICY "Admins can insert activity logs"
ON public.admin_activity_logs
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_super_admin(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);
CREATE INDEX idx_admin_activity_logs_actor_id ON public.admin_activity_logs(actor_id);