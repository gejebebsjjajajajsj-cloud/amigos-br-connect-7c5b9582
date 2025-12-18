-- Add button_color and deliverable_link to club_profile
ALTER TABLE public.club_profile 
ADD COLUMN IF NOT EXISTS button_color text DEFAULT '#f97316',
ADD COLUMN IF NOT EXISTS deliverable_link text DEFAULT NULL;