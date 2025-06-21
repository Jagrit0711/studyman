
-- Add the enable_mom_mode column to the user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS enable_mom_mode boolean DEFAULT false;
