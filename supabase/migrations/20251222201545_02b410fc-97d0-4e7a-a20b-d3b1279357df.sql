-- Create enum for supported countries
CREATE TYPE public.country_type AS ENUM ('france', 'eu_other', 'tunisie');

-- Create enum for legal frameworks
CREATE TYPE public.legal_framework_type AS ENUM ('rgpd_eu', 'loi_tunisie_2025');

-- Add country column to organisations table
ALTER TABLE public.organisations 
ADD COLUMN country public.country_type NOT NULL DEFAULT 'france';

-- Add legal_framework column (derived from country but stored for clarity)
ALTER TABLE public.organisations 
ADD COLUMN legal_framework public.legal_framework_type NOT NULL DEFAULT 'rgpd_eu';

-- Remove the default after adding the column (so it becomes truly required for new inserts)
ALTER TABLE public.organisations ALTER COLUMN country DROP DEFAULT;
ALTER TABLE public.organisations ALTER COLUMN legal_framework DROP DEFAULT;