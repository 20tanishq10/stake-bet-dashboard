-- Allow any authenticated user to insert a bet (as draft or open depending on their role, enforced by API)
CREATE POLICY "bets_insert_any"
  ON public.bets FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
