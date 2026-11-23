-- Live updates (base44 Entity.subscribe): the header badges, chat, dealer application status
-- and listing status changes. Realtime delivers rows through the same RLS rules as reads.
alter publication supabase_realtime add table public.messages, public.notifications, public.cars, public.dealer_applications;
