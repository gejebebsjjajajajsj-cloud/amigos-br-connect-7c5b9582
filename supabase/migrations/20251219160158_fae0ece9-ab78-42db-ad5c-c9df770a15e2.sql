-- Add button_icon field for custom emoji
ALTER TABLE public.club_profile 
ADD COLUMN button_icon TEXT DEFAULT '🔥';

-- Update existing row with default
UPDATE public.club_profile SET button_icon = '🔥' WHERE button_icon IS NULL;