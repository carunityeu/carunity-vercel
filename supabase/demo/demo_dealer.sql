-- Demo dealer for testing the dealer panel (run in the Supabase SQL Editor).
-- 1) First create the user: Authentication -> Users -> Add user -> Create new user,
--    e-mail below, your own password, "Auto Confirm User" on.
-- 2) Then run this. Safe to re-run. Undo: supabase/demo/demo_dealer_remove.sql
do $$
declare
  v_email  text := 'dealer-test@carunity.eu';   -- the e-mail of the user you created
  v_dealer text := 'demo_dealer_carunity';
  v_uid    uuid;
begin
  select id into v_uid from auth.users where lower(email) = lower(v_email);
  if v_uid is null then
    raise exception 'No user %: create it first in Authentication -> Users', v_email;
  end if;

  -- The salon: a copy of the richest test dealer (logo, cover, hours, staff), owned by the demo account
  insert into public.dealers
  select (jsonb_populate_record(null::public.dealers, to_jsonb(d) || jsonb_build_object(
    'id', v_dealer, 'name', 'CarUnity Demo Motors', 'owner_email', v_email, 'email', v_email,
    'subscription_type', 'premium', 'subscription_until', (now() + interval '1 year')::date,
    'is_verified', true, 'rating', 4.7, 'reviews_count', 18,
    'created_by', v_email, 'created_by_id', v_uid, 'created_date', now(), 'updated_date', now()))).*
  from public.dealers d
  order by (d.id = '69f84d6613badf111498a9d8') desc, d.created_date
  limit 1
  on conflict (id) do update set owner_email = excluded.owner_email, email = excluded.email;

  update public.profiles
     set user_type = 'dealer', dealer_id = v_dealer, full_name = coalesce(nullif(full_name, ''), 'Demo Dealer')
   where id = v_uid;

  -- Six listings copied from the newest ones with photos, in every status the panel shows.
  -- Active and sold copies are public, so their trim says "DEMO".
  insert into public.cars
  select (jsonb_populate_record(null::public.cars, to_jsonb(c) || jsonb_build_object(
    'id', 'demo_' || c.id, 'short_id', null, 'dealer_id', v_dealer, 'seller_type', 'dealer',
    'seller_id', v_email, 'created_by', v_email, 'created_by_id', v_uid,
    'is_premium', false, 'exclusive_listing', c.rn = 1,
    'views_count', (40 + c.rn * 37) % 260,
    'status', (array['active','active','pending','pending','sold','rejected'])[c.rn],
    'trim_level', case when c.rn in (1, 2, 5) then trim('DEMO · ' || coalesce(c.trim_level, '')) else c.trim_level end,
    'created_date', now() - make_interval(days => c.rn::int), 'updated_date', now()))).*
  from (
    select x.*, row_number() over (order by x.created_date desc) as rn
    from public.cars x
    where x.status = 'active' and x.id not like 'demo\_%' and coalesce(array_length(x.images, 1), 0) > 0
    limit 6
  ) c
  on conflict (id) do nothing;
end $$;
