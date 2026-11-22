-- Auth wiring, helper functions, protected fields and row level security.
--
-- Principles
-- - Every table has RLS on. The service role (our server code: Stripe webhook, cron, AI)
--   bypasses RLS, so anything privileged moves there.
-- - Policies mirror how the current frontend uses each table, minus the holes:
--   users can no longer grant themselves promotion, subscriptions, verification or admin.
-- - Rows are still linked by email (as in Base44); created_by_id is filled in as well so we
--   can move to id-based links later without another data migration.
-- Places marked "TEMP" keep a frontend flow working until it moves to a server function.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.auth_email() returns text
language sql stable as $$ select lower(coalesce(auth.jwt() ->> 'email', '')) $$;

create or replace function public.is_service_role() returns boolean
language sql stable as $$ select coalesce(auth.jwt() ->> 'role', '') = 'service_role' or current_user in ('postgres', 'supabase_admin') $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

-- Dealers the current user runs (owner email, or the dealer_id on their profile).
create or replace function public.my_dealer_ids() returns setof text
language sql stable security definer set search_path = public as $$
  select d.id from public.dealers d where lower(d.owner_email) = public.auth_email()
  union
  select p.dealer_id from public.profiles p where p.id = auth.uid() and p.dealer_id is not null
$$;

-- Does the current user own this listing (any vehicle table)?
create or replace function public.owns_listing(p_table text, p_id text) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare r record;
begin
  if p_table not in ('cars','motorcycles','trucks','buses','boats','special_equipment','trailers','motorhomes') then
    return false;
  end if;
  execute format('select created_by_id, created_by, seller_id, %s as dealer_id from public.%I where id = $1',
                 case when p_table = 'cars' then 'dealer_id' else 'null::text' end, p_table)
    into r using p_id;
  if r is null then return false; end if;
  return r.created_by_id = auth.uid()
      or lower(coalesce(r.created_by, '')) = public.auth_email()
      or lower(coalesce(r.seller_id, '')) = public.auth_email()
      or (r.dealer_id is not null and r.dealer_id in (select public.my_dealer_ids()));
end $$;

create or replace function public.owns_car(p_id text) returns boolean
language sql stable as $$ select public.owns_listing('cars', p_id) $$;

-- Fill created_by / created_by_id from the session on insert (Base44 did this automatically).
create or replace function public.set_created_by() returns trigger
language plpgsql as $$
begin
  if auth.uid() is not null and not public.is_service_role() then
    new.created_by_id := auth.uid();
    new.created_by := public.auth_email();
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Profiles: one per auth user, created automatically on sign-up
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, legacy_id)
  values (new.id, lower(new.email),
          coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
          new.raw_user_meta_data ->> 'legacy_id')
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users may edit their own profile but not role, email or dealer link.
create or replace function public.protect_profile() returns trigger
language plpgsql as $$
begin
  if public.is_service_role() or public.is_admin() then return new; end if;
  new.id := old.id; new.email := old.email; new.role := old.role;
  new.legacy_id := old.legacy_id; new.dealer_id := old.dealer_id; new.user_type := old.user_type;
  return new;
end $$;
create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_profile();

-- Public card of a user (seller name/avatar on listings, chat partner) without private fields.
create view public.public_profiles with (security_invoker = false) as
  select id, full_name, avatar, city, country, user_type, dealer_id, preferred_language from public.profiles;
grant select on public.public_profiles to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Listings: short ids, protected promotion fields, view counter
-- ---------------------------------------------------------------------------

-- 9-digit short id for share links (/cardetails/:shortId); was generated in the browser.
create or replace function public.assign_short_id() returns trigger
language plpgsql as $$
declare candidate integer;
begin
  if new.short_id is null then
    loop
      candidate := 100000000 + floor(random() * 900000000)::integer;
      exit when not exists (select 1 from public.cars where short_id = candidate);
    end loop;
    new.short_id := candidate;
  end if;
  return new;
end $$;
create trigger cars_short_id before insert on public.cars
  for each row execute function public.assign_short_id();

-- Only payments (service role) and admins may change promotion, counters and activation.
create or replace function public.protect_listing() returns trigger
language plpgsql as $$
declare
  locked text[] := array['is_premium','is_auto_premium','promotion_until','views_count','short_id','seller_type','dealer_id'];
  keep jsonb := '{}';
  col text;
begin
  if public.is_service_role() or public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.is_premium := false;
    new.views_count := 0;
    keep := jsonb_build_object('promotion_until', null, 'is_auto_premium', false);
    -- A listing can only be attached to a dealer the user actually runs.
    if to_jsonb(new) ? 'dealer_id' and (to_jsonb(new) ->> 'dealer_id') is not null
       and (to_jsonb(new) ->> 'dealer_id') not in (select public.my_dealer_ids()) then
      keep := keep || jsonb_build_object('dealer_id', null, 'seller_type', 'private');
    end if;
    -- TEMP: listing creation still decides active/pending in the browser (free vs paid).
    -- Moves to a server function together with checkout.
  else
    foreach col in array locked loop
      if to_jsonb(old) ? col then keep := keep || jsonb_build_object(col, to_jsonb(old) -> col); end if;
    end loop;
    -- pending/rejected -> active only through payment or renewal on the server.
    if new.status = 'active' and old.status is distinct from 'active' and old.status <> 'sold' then
      keep := keep || jsonb_build_object('status', old.status);
    end if;
  end if;
  return jsonb_populate_record(new, keep);
end $$;

-- Anyone (even anonymous) may count a view; the counter itself is locked above.
create or replace function public.increment_listing_views(p_table text, p_id text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_table not in ('cars','motorcycles','trucks','buses','boats','special_equipment','trailers','motorhomes') then
    raise exception 'unknown listing table %', p_table;
  end if;
  execute format('update public.%I set views_count = coalesce(views_count, 0) + 1 where id = $1', p_table) using p_id;
end $$;
grant execute on function public.increment_listing_views(text, text) to anon, authenticated;

-- One vote on a model page; replaces the browser-side rating update.
create or replace function public.rate_model(p_table text, p_id text, p_rating double precision) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_table not in ('car_model_info', 'motorcycle_model_info') then raise exception 'unknown table %', p_table; end if;
  if auth.uid() is null then raise exception 'sign in required'; end if;
  if p_rating < 1 or p_rating > 5 then raise exception 'rating must be 1..5'; end if;
  execute format($f$update public.%I set
      user_rating = round(((coalesce(user_rating, 0) * coalesce(rating_votes, 0) + $2) / (coalesce(rating_votes, 0) + 1))::numeric, 1),
      rating_votes = coalesce(rating_votes, 0) + 1
    where id = $1$f$, p_table) using p_id, p_rating;
end $$;
grant execute on function public.rate_model(text, text, double precision) to authenticated;

-- Dealers: owners edit their page, but not plan, verification, rating or pricing.
create or replace function public.protect_dealer() returns trigger
language plpgsql as $$
begin
  if public.is_service_role() or public.is_admin() then return new; end if;
  new.owner_email := old.owner_email; new.subscription_type := old.subscription_type;
  new.subscription_until := old.subscription_until; new.is_verified := old.is_verified;
  new.rating := old.rating; new.reviews_count := old.reviews_count; new.custom_pricing := old.custom_pricing;
  return new;
end $$;
create trigger dealers_protect before update on public.dealers
  for each row execute function public.protect_dealer();

-- ---------------------------------------------------------------------------
-- created_by triggers + RLS on every table
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array[
    'ad_configurations','articles','boats','buses','cars','car_generations','car_model_info','dealers',
    'dealer_applications','dealer_leads','dealer_purchase_criteria','favorites','import_requests','lead_tasks',
    'listing_promotions','listing_renewals','luxury_brands','luxury_cars','messages','meta_ads_orders',
    'motorcycles','motorcycle_model_info','motorhomes','notifications','payment_purchases','price_offers',
    'referrals','rental_cars','reports','reviews','sale_feedback','saved_searches','service_records',
    'special_equipment','trade_in_offers','trailers','trucks','view_history']
  loop
    execute format('create trigger %1$s_created_by before insert on public.%1$I for each row execute function public.set_created_by()', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
  alter table public.profiles enable row level security;
  create policy admin_all on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
end $$;

-- Profiles
create policy own_select on public.profiles for select to authenticated using (id = auth.uid());
create policy own_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Vehicle listings (8 tables): public sees active and sold, owners see and manage their own.
do $$
declare t text; owner_expr text;
begin
  foreach t in array array['cars','motorcycles','trucks','buses','boats','special_equipment','trailers','motorhomes'] loop
    -- Inline ownership check (same rule as owns_listing) so catalog queries stay index-friendly.
    owner_expr := $e$(created_by_id = (select auth.uid()) or lower(coalesce(seller_id, '')) = (select public.auth_email())$e$
      || case when t = 'cars' then $e$ or dealer_id in (select public.my_dealer_ids())$e$ else '' end || ')';
    execute format('create trigger %1$s_protect before insert or update on public.%1$I for each row execute function public.protect_listing()', t);
    execute format($p$create policy public_select on public.%I for select to anon, authenticated
                     using (status in ('active', 'sold') or %s)$p$, t, owner_expr);
    execute format($p$create policy owner_insert on public.%I for insert to authenticated
                     with check (created_by_id = (select auth.uid()))$p$, t);
    execute format($p$create policy owner_update on public.%I for update to authenticated
                     using %s with check %s$p$, t, owner_expr, owner_expr);
    execute format($p$create policy owner_delete on public.%I for delete to authenticated using %s$p$, t, owner_expr);
  end loop;
end $$;

-- Public content managed by admins only (admin_all above).
create policy public_select on public.articles for select to anon, authenticated using (is_published = true);
create policy public_select on public.car_generations for select to anon, authenticated using (true);
create policy public_select on public.car_model_info for select to anon, authenticated using (coalesce(is_published, true));
create policy public_select on public.motorcycle_model_info for select to anon, authenticated using (coalesce(is_published, true));
create policy public_select on public.luxury_brands for select to anon, authenticated using (coalesce(is_published, true));
create policy public_select on public.luxury_cars for select to anon, authenticated using (coalesce(is_published, true));
create policy public_select on public.ad_configurations for select to anon, authenticated using (coalesce(enabled, true));
create policy public_select on public.rental_cars for select to anon, authenticated using (true);

-- Dealers: public directory; owners update their own (protected fields above); only admins create.
create policy public_select on public.dealers for select to anon, authenticated using (true);
create policy owner_update on public.dealers for update to authenticated
  using (id in (select public.my_dealer_ids())) with check (id in (select public.my_dealer_ids()));

-- Dealer applications: applicant reads own; submit/review go through the server (as in Base44).
create policy own_select on public.dealer_applications for select to authenticated
  using (lower(applicant_email) = public.auth_email());

-- Reviews: public; authors write their own.
create policy public_select on public.reviews for select to anon, authenticated using (true);
create policy author_insert on public.reviews for insert to authenticated with check (lower(author_email) = public.auth_email());
create policy author_modify on public.reviews for update to authenticated using (lower(author_email) = public.auth_email());
create policy author_delete on public.reviews for delete to authenticated using (lower(author_email) = public.auth_email());

-- Service book: public (shown on the listing), car owner edits.
create policy public_select on public.service_records for select to anon, authenticated using (true);
create policy owner_insert on public.service_records for insert to authenticated with check (public.owns_car(car_id));
create policy owner_update on public.service_records for update to authenticated using (public.owns_car(car_id));
create policy owner_delete on public.service_records for delete to authenticated using (public.owns_car(car_id));

-- Favorites and view history: the user's own; the listing owner reads them (dealer AI leads).
create policy own_or_owner_select on public.favorites for select to authenticated
  using (lower(user_email) = public.auth_email() or public.owns_car(car_id));
create policy own_insert on public.favorites for insert to authenticated with check (lower(user_email) = public.auth_email());
create policy own_delete on public.favorites for delete to authenticated using (lower(user_email) = public.auth_email());

create policy own_or_owner_select on public.view_history for select to authenticated
  using (lower(user_email) = public.auth_email() or public.owns_car(car_id));
create policy own_insert on public.view_history for insert to authenticated with check (lower(user_email) = public.auth_email());
create policy own_or_owner_delete on public.view_history for delete to authenticated
  using (lower(user_email) = public.auth_email() or public.owns_car(car_id));

-- Saved searches: strictly own.
create policy own_all on public.saved_searches for all to authenticated
  using (lower(user_email) = public.auth_email()) with check (lower(user_email) = public.auth_email());

-- Messages: both participants read; sender writes; participants mark as read.
create policy participant_select on public.messages for select to authenticated
  using (public.auth_email() in (lower(sender_email), lower(receiver_email)));
create policy sender_insert on public.messages for insert to authenticated with check (lower(sender_email) = public.auth_email());
create policy participant_update on public.messages for update to authenticated
  using (public.auth_email() in (lower(sender_email), lower(receiver_email)));

-- Price offers: buyer and seller.
create policy party_select on public.price_offers for select to authenticated
  using (public.auth_email() in (lower(buyer_email), lower(seller_email)) or public.owns_car(car_id));
create policy buyer_insert on public.price_offers for insert to authenticated with check (lower(buyer_email) = public.auth_email());
create policy party_update on public.price_offers for update to authenticated
  using (public.auth_email() in (lower(buyer_email), lower(seller_email)));

-- Notifications: own. TEMP: the browser still creates some notifications for other users
-- (fast-sale offers, referrals); insert stays open to signed-in users until that moves server-side.
create policy own_select on public.notifications for select to authenticated using (lower(user_email) = public.auth_email());
create policy own_update on public.notifications for update to authenticated using (lower(user_email) = public.auth_email());
create policy own_delete on public.notifications for delete to authenticated using (lower(user_email) = public.auth_email());
create policy temp_any_insert on public.notifications for insert to authenticated with check (true);

-- Reports: anyone signed in can file; only admins read.
create policy own_insert on public.reports for insert to authenticated with check (lower(reporter_email) = public.auth_email());

-- Sale feedback: as defined in Base44 (creator reads own, admins manage).
create policy own_insert on public.sale_feedback for insert to authenticated with check (created_by_id = auth.uid());
create policy own_select on public.sale_feedback for select to authenticated using (created_by_id = auth.uid());

-- Referrals: TEMP, the referral flow still runs in the browser for both sides.
create policy party_select on public.referrals for select to authenticated
  using (public.auth_email() in (lower(inviter_email), lower(invited_email)));
create policy party_insert on public.referrals for insert to authenticated
  with check (public.auth_email() in (lower(inviter_email), lower(invited_email)));
create policy party_update on public.referrals for update to authenticated
  using (public.auth_email() in (lower(inviter_email), lower(invited_email)));

-- Trade-in / fast-sale offers: the dealer who made it and the private seller.
create policy party_select on public.trade_in_offers for select to authenticated
  using (lower(seller_email) = public.auth_email() or dealer_id in (select public.my_dealer_ids()));
create policy dealer_insert on public.trade_in_offers for insert to authenticated
  with check (dealer_id in (select public.my_dealer_ids()));
create policy party_update on public.trade_in_offers for update to authenticated
  using (lower(seller_email) = public.auth_email() or dealer_id in (select public.my_dealer_ids()));

-- Dealer workspace tables: the dealer's team only.
create policy dealer_all on public.dealer_leads for all to authenticated
  using (dealer_id in (select public.my_dealer_ids())) with check (dealer_id in (select public.my_dealer_ids()));
create policy dealer_all on public.lead_tasks for all to authenticated
  using (dealer_id in (select public.my_dealer_ids())) with check (dealer_id in (select public.my_dealer_ids()));
create policy dealer_all on public.dealer_purchase_criteria for all to authenticated
  using (dealer_id in (select public.my_dealer_ids())) with check (dealer_id in (select public.my_dealer_ids()));
create policy dealer_select on public.import_requests for select to authenticated
  using (dealer_id in (select public.my_dealer_ids()));
create policy dealer_insert on public.import_requests for insert to authenticated
  with check (dealer_id in (select public.my_dealer_ids()));

-- Money records: read your own; written only by the server (webhook) and admins.
create policy own_select on public.payment_purchases for select to authenticated using (lower(buyer_email) = public.auth_email());
create policy own_select on public.listing_promotions for select to authenticated
  using (lower(seller_email) = public.auth_email() or dealer_id in (select public.my_dealer_ids()));
create policy own_select on public.listing_renewals for select to authenticated
  using (lower(seller_email) = public.auth_email() or public.owns_car(car_id));
create policy own_select on public.meta_ads_orders for select to authenticated
  using (lower(seller_email) = public.auth_email() or dealer_id in (select public.my_dealer_ids()));
