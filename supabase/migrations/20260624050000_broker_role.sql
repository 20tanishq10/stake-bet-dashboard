-- Add is_broker and is_interested columns to profiles
ALTER TABLE public.profiles
ADD COLUMN is_broker BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN is_interested BOOLEAN NOT NULL DEFAULT false;

-- Add a comment explaining the columns
COMMENT ON COLUMN public.profiles.is_broker IS 'If true, the user is a broker who can create open bets and place bets for others.';
COMMENT ON COLUMN public.profiles.is_interested IS 'If true, brokers can place bets on this user''s behalf without explicit permission.';
