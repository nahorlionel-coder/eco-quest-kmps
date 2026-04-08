-- Add bonus mission support
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS is_bonus boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS unlock_level integer NOT NULL DEFAULT 1;
