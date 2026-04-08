-- Add frequency column to missions table
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS frequency text NOT NULL DEFAULT 'daily';

-- Add week_start to mission_completions to track weekly completions
ALTER TABLE public.mission_completions
  ADD COLUMN IF NOT EXISTS week_start date;

-- Backfill week_start for existing completions
UPDATE public.mission_completions
SET week_start = date_trunc('week', completion_date::timestamp)::date
WHERE week_start IS NULL;
