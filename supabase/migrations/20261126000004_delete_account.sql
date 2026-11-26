-- "Delete account" in the account settings.
-- The signed-in user deletes their own account: their listings, favourites, saved searches,
-- view history and notifications go with it, the profile is removed by the foreign key, and
-- other records keep no link to the person (created_by_id is set to null by the existing keys).
-- Dealership owners cannot delete themselves here (the salon, its listings and team would be
-- left without an owner): the function refuses and the site asks them to write to support.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
  mail text := public.auth_email();
begin
  if uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  if exists (select 1 from public.dealers d where lower(d.owner_email) = mail) then
    raise exception 'dealer_owner' using errcode = 'P0001';
  end if;

  delete from public.favorites      where created_by_id = uid or lower(user_email) = mail;
  delete from public.saved_searches where created_by_id = uid or lower(user_email) = mail;
  delete from public.view_history   where created_by_id = uid or lower(user_email) = mail;
  delete from public.notifications  where created_by_id = uid or lower(user_email) = mail;
  delete from public.cars           where (created_by_id = uid or lower(created_by) = mail) and dealer_id is null;

  delete from auth.users where id = uid; -- profile goes with it (on delete cascade)
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
