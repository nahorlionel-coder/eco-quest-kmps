-- Table to store assigned missions per user per period
CREATE TABLE IF NOT EXISTS public.user_mission_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.missions(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  is_bonus BOOLEAN NOT NULL DEFAULT false,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id, period_start)
);

ALTER TABLE public.user_mission_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assignments"
  ON public.user_mission_assignments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assignments"
  ON public.user_mission_assignments FOR INSERT WITH CHECK (auth.uid() = user_id);
