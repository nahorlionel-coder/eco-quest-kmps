
-- Allow admin CRUD on missions
CREATE POLICY "Authenticated can insert missions" ON public.missions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update missions" ON public.missions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete missions" ON public.missions FOR DELETE TO authenticated USING (true);

-- Allow admin CRUD on department_challenges
CREATE POLICY "Authenticated can insert challenges" ON public.department_challenges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update challenges" ON public.department_challenges FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete challenges" ON public.department_challenges FOR DELETE TO authenticated USING (true);

-- Allow admin CRUD on rewards
CREATE POLICY "Authenticated can insert rewards" ON public.rewards FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update rewards" ON public.rewards FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete rewards" ON public.rewards FOR DELETE TO authenticated USING (true);
