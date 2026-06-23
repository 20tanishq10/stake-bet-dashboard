-- Bootstrap the first host user
-- Usage: replace '<EMAIL>' with the host's email and run in Supabase SQL editor.

-- 1) Find the user id from auth.users
-- SELECT id, email FROM auth.users WHERE email = '<EMAIL>' LIMIT 1;

-- If the user does not exist, create them using the Supabase Auth dashboard
-- or the Admin API. After creation, run the select above to get the id.

-- 2) Ensure a profiles row exists for that user (create if missing)
INSERT INTO public.profiles (id, display_name, role, wallet_balance, created_at)
SELECT u.id, '<DISPLAY_NAME>' as display_name, 'host'::text as role, 0::numeric as wallet_balance, now()
FROM auth.users u
WHERE u.email = '<EMAIL>'
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name
RETURNING id;

-- 3) Promote the profile to host explicitly (id can be passed instead of email)
UPDATE public.profiles
SET role = 'host'
WHERE id = (
  SELECT id FROM auth.users WHERE email = '<EMAIL>' LIMIT 1
);

-- 4) Verify
SELECT id, display_name, role, wallet_balance, created_at FROM public.profiles
WHERE id = (SELECT id FROM auth.users WHERE email = '<EMAIL>' LIMIT 1);
