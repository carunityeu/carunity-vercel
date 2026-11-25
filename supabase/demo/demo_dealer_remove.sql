-- Removes the demo dealer, its listings and the dealer link on the demo profile.
-- The demo user itself is deleted in Authentication -> Users.
delete from public.cars where id like 'demo\_%';
delete from public.dealers where id = 'demo_dealer_carunity';
update public.profiles set user_type = 'private', dealer_id = null where dealer_id = 'demo_dealer_carunity';
