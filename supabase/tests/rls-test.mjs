#!/usr/bin/env node
// Applies all migrations to an in-memory Postgres (PGlite) and checks the access rules.
// Run: node supabase/tests/rls-test.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

const dir = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(dir, '../migrations');
const db = new PGlite();

await db.exec(fs.readFileSync(path.join(dir, 'supabase-stub.sql'), 'utf8'));
for (const f of fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()) {
  try {
    await db.exec(fs.readFileSync(path.join(migrationsDir, f), 'utf8'));
    console.log(`applied ${f}`);
  } catch (e) {
    console.error(`FAILED ${f}: ${e.message}`);
    process.exit(1);
  }
}

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : ` ${detail}`}`);
  if (!ok) failed++;
};

// Run a query as a given user (null = anonymous visitor, 'service' = server code).
async function as(user, sql, params = []) {
  await db.exec('reset role');
  if (user === 'service') {
    await db.query(`select set_config('request.jwt.claims', '{"role":"service_role"}', false)`);
    await db.exec('set role service_role');
  } else if (user) {
    await db.query(`select set_config('request.jwt.claims', $1, false)`,
      [JSON.stringify({ sub: user.id, email: user.email, role: 'authenticated' })]);
    await db.exec('set role authenticated');
  } else {
    await db.query(`select set_config('request.jwt.claims', '{"role":"anon"}', false)`);
    await db.exec('set role anon');
  }
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec('reset role');
  }
}
const fails = async (fn) => { try { await fn(); return false; } catch { return true; } };

async function signUp(email) {
  const { rows } = await db.query(`insert into auth.users (email, raw_user_meta_data) values ($1, '{"full_name":"Test"}') returning id`, [email]);
  return { id: rows[0].id, email };
}

const alice = await signUp('alice@example.com');
const bob = await signUp('bob@example.com');
const admin = await signUp('admin@example.com');
await db.query(`update public.profiles set role = 'admin' where id = $1`, [admin.id]);

check('profile is created on sign-up',
  (await db.query(`select count(*)::int as n from public.profiles`)).rows[0].n === 3);

// Listings
const ins = await as(alice, `insert into public.cars (title, brand, model, year, price, status, is_premium, promotion_until, seller_id)
  values ('BMW X5', 'BMW', 'X5', 2020, 30000, 'active', true, now() + interval '30 days', 'alice@example.com')
  returning id, is_premium, promotion_until, short_id, created_by_id, created_by`);
const car = ins.rows[0];
check('user cannot grant herself premium on create', car.is_premium === false && car.promotion_until === null);
check('short id is generated on the server', car.short_id >= 100000000 && car.short_id <= 999999999);
check('created_by is taken from the session', car.created_by_id === alice.id && car.created_by === 'alice@example.com');

await as(alice, `update public.cars set price = 28000, is_premium = true, views_count = 9999 where id = $1`, [car.id]);
let row = (await db.query(`select price, is_premium, views_count from public.cars where id = $1`, [car.id])).rows[0];
check('owner can edit the price', row.price === 28000);
check('owner cannot set premium or views', row.is_premium === false && row.views_count === 0);

await as(bob, `update public.cars set price = 1 where id = $1`, [car.id]);
row = (await db.query(`select price from public.cars where id = $1`, [car.id])).rows[0];
check("another user cannot edit someone's listing", row.price === 28000);
await as(bob, `delete from public.cars where id = $1`, [car.id]);
check("another user cannot delete someone's listing",
  (await db.query(`select count(*)::int as n from public.cars where id = $1`, [car.id])).rows[0].n === 1);

check('anonymous visitors see active listings',
  (await as(null, `select id from public.cars where id = $1`, [car.id])).rows.length === 1);

const pending = (await as(alice, `insert into public.cars (title, brand, model, year, price, status) values ('Audi', 'Audi', 'A4', 2019, 15000, 'pending') returning id`)).rows[0];
check('pending listings are hidden from others',
  (await as(bob, `select id from public.cars where id = $1`, [pending.id])).rows.length === 0);
check('owner sees her pending listing',
  (await as(alice, `select id from public.cars where id = $1`, [pending.id])).rows.length === 1);
await as(alice, `update public.cars set status = 'active' where id = $1`, [pending.id]);
check('owner cannot activate an unpaid listing',
  (await db.query(`select status from public.cars where id = $1`, [pending.id])).rows[0].status === 'pending');
await as('service', `update public.cars set status = 'active', is_premium = true where id = $1`, [pending.id]);
row = (await db.query(`select status, is_premium from public.cars where id = $1`, [pending.id])).rows[0];
check('server (payment webhook) can activate and promote', row.status === 'active' && row.is_premium === true);

await as(null, `select public.increment_listing_views('cars', $1)`, [car.id]);
check('anyone can count a view',
  (await db.query(`select views_count from public.cars where id = $1`, [car.id])).rows[0].views_count === 1);

// Dealers
const dealer = (await as(admin, `insert into public.dealers (name, owner_email, subscription_type) values ('Salon', 'bob@example.com', 'starter') returning id`)).rows[0];
check('only admins can create dealers',
  await fails(() => as(alice, `insert into public.dealers (name, owner_email) values ('Fake', 'alice@example.com')`)));
await as(bob, `update public.dealers set description = 'Hello', subscription_until = now() + interval '10 years', is_verified = true where id = $1`, [dealer.id]);
row = (await db.query(`select description, subscription_until, is_verified from public.dealers where id = $1`, [dealer.id])).rows[0];
check('dealer owner edits the page', row.description === 'Hello');
check('dealer owner cannot extend plan or verify himself', row.subscription_until === null && row.is_verified !== true);
await as(alice, `update public.dealers set subscription_until = now() + interval '1 year' where id = $1`, [dealer.id]);
check("a stranger cannot touch someone's dealer (referral hole)",
  (await db.query(`select subscription_until from public.dealers where id = $1`, [dealer.id])).rows[0].subscription_until === null);

const injected = (await as(alice, `insert into public.cars (title, brand, model, year, price, status, dealer_id, seller_type) values ('Fake', 'VW', 'Golf', 2018, 9000, 'active', $1, 'dealer') returning dealer_id, seller_type`, [dealer.id])).rows[0];
check("cannot post a listing into someone else's dealer", injected.dealer_id === null && injected.seller_type === 'private');
const own = (await as(bob, `insert into public.cars (title, brand, model, year, price, status, dealer_id, seller_type) values ('Skoda', 'Skoda', 'Octavia', 2021, 18000, 'active', $1, 'dealer') returning id, dealer_id`, [dealer.id])).rows[0];
check('dealer posts into his own dealer', own.dealer_id === dealer.id);

// Profiles
await as(alice, `update public.profiles set role = 'admin', phone = '+371' where id = $1`, [alice.id]);
row = (await db.query(`select role, phone from public.profiles where id = $1`, [alice.id])).rows[0];
check('user edits her profile but cannot become admin', row.phone === '+371' && row.role === 'user');
check("users cannot read other users' private profiles",
  (await as(bob, `select email from public.profiles where id = $1`, [alice.id])).rows.length === 0);
check('public profile card is readable',
  (await as(null, `select full_name from public.public_profiles where id = $1`, [alice.id])).rows.length === 1);

// Messages
await as(alice, `insert into public.messages (chat_id, sender_email, receiver_email, content) values ('c1', 'alice@example.com', 'admin@example.com', 'hi')`);
check('participants read the chat',
  (await as(admin, `select id from public.messages where chat_id = 'c1'`)).rows.length === 1);
check('outsiders cannot read the chat',
  (await as(bob, `select id from public.messages where chat_id = 'c1'`)).rows.length === 0);
check('cannot send a message as someone else',
  await fails(() => as(bob, `insert into public.messages (chat_id, sender_email, receiver_email, content) values ('c2', 'alice@example.com', 'bob@example.com', 'x')`)));

// Favorites / views feed dealer leads
await as(alice, `insert into public.favorites (user_email, car_id) values ('alice@example.com', $1)`, [own.id]);
check('listing owner sees who saved his car (AI leads)',
  (await as(bob, `select id from public.favorites where car_id = $1`, [own.id])).rows.length === 1);
const carol = await signUp('carol@example.com');
check("strangers do not see others' favorites",
  (await as(carol, `select id from public.favorites where car_id = $1`, [own.id])).rows.length === 0);

// Money
await as('service', `insert into public.payment_purchases (session_id, buyer_email, amount) values ('cs_1', 'alice@example.com', 499)`);
check('buyer sees her payment', (await as(alice, `select id from public.payment_purchases`)).rows.length === 1);
check('others do not see it', (await as(bob, `select id from public.payment_purchases`)).rows.length === 0);
check('users cannot fake a payment',
  await fails(() => as(alice, `insert into public.payment_purchases (session_id, buyer_email, amount) values ('cs_2', 'alice@example.com', 1)`)));

// Ratings
const model = (await as(admin, `insert into public.car_model_info (title, brand, model, is_published) values ('X5', 'BMW', 'X5', true) returning id`)).rows[0];
await as(alice, `select public.rate_model('car_model_info', $1, 4)`, [model.id]);
await as(bob, `select public.rate_model('car_model_info', $1, 5)`, [model.id]);
row = (await db.query(`select user_rating, rating_votes from public.car_model_info where id = $1`, [model.id])).rows[0];
check('model rating averages votes', row.rating_votes === 2 && row.user_rating === 4.5);

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
