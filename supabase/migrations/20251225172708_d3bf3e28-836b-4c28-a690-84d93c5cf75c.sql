-- Enable realtime for audit_results table
ALTER TABLE public.audit_results REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_results;