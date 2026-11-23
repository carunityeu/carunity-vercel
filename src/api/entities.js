// Supabase-backed replacement for base44.entities.X, with the same call shapes the pages
// already use, so a page moves off Base44 by changing its import only:
//   filter(query, '-created_date', limit, skip)          -> rows
//   filter(query, { sort, limit, cursor })               -> { items, has_more, next_cursor }
//   list(sort, limit, skip), get(id), count(query), aggregate({ query, groupBy }),
//   create(data), update(id, data), delete(id), subscribe(cb)
// Queries use the Base44 (Mongo-style) syntax: { brand: { $in: [...] }, price: { $gte: 1 }, $or: [...] }.
import { supabase } from './supabaseClient';
import schema from '../../supabase/schema-columns.json';
import { toFilters, parseSort } from './query';

const MAX_ROWS = 1000; // PostgREST default page cap

function makeEntity(name) {
  const def = schema[name];
  if (!def) throw new Error(`Unknown entity ${name}`);
  const { table, columns } = def;

  const select = (query, opts) => {
    let q = supabase.from(table).select('*', opts);
    for (const expr of toFilters(query || {}, columns)) q = q.or(expr);
    return q;
  };
  const ordered = (q, sort) => {
    for (const { column, ascending } of parseSort(sort)) q = q.order(column, { ascending, nullsFirst: false });
    return q.order('id', { ascending: true }); // stable pages
  };
  const run = async (q) => {
    const { data, error } = await q;
    if (error) throw Object.assign(new Error(error.message), { status: error.code === 'PGRST116' ? 404 : 400, details: error });
    return data;
  };

  return {
    async filter(query, sortOrOptions, limit, skip = 0) {
      if (sortOrOptions && typeof sortOrOptions === 'object') {
        const { sort, limit: size = 50, cursor } = sortOrOptions;
        const offset = Number(cursor) || 0;
        const rows = await run(ordered(select(query), sort).range(offset, offset + size));
        const has_more = rows.length > size;
        return { items: rows.slice(0, size), has_more, next_cursor: has_more ? String(offset + size) : null };
      }
      const size = Math.min(limit || MAX_ROWS, MAX_ROWS);
      return run(ordered(select(query), sortOrOptions).range(skip, skip + size - 1));
    },
    list(sort, limit, skip) {
      return this.filter({}, sort, limit, skip);
    },
    async get(id) {
      const row = await run(supabase.from(table).select('*').eq('id', id).maybeSingle());
      if (!row) throw Object.assign(new Error(`${name} ${id} not found`), { status: 404 });
      return row;
    },
    async count(query) {
      const { count, error } = await select(query, { count: 'exact', head: true });
      if (error) throw new Error(error.message);
      return count || 0;
    },
    // Counts rows per value of one column, e.g. listings per model for the brand filter.
    async aggregate({ query, groupBy }) {
      const counts = new Map();
      for (let offset = 0; ; offset += MAX_ROWS) {
        let q = supabase.from(table).select(groupBy);
        for (const expr of toFilters(query || {}, columns)) q = q.or(expr);
        const rows = await run(q.order('id').range(offset, offset + MAX_ROWS - 1));
        for (const r of rows) counts.set(r[groupBy], (counts.get(r[groupBy]) || 0) + 1);
        if (rows.length < MAX_ROWS) break;
      }
      return { rows: [...counts].map(([value, count]) => ({ [groupBy]: value, count })) };
    },
    create(data) {
      return run(supabase.from(table).insert(data).select().single());
    },
    update(id, data) {
      return run(supabase.from(table).update(data).eq('id', id).select().maybeSingle());
    },
    async delete(id) {
      await run(supabase.from(table).delete().eq('id', id));
    },
    bulkCreate(records) {
      return run(supabase.from(table).insert(records).select());
    },
    // updateMany(query, { $set: {...} }) — the only update operator the site uses.
    async updateMany(query, change) {
      const values = change?.$set || change;
      let q = supabase.from(table).update(values);
      const filters = toFilters(query || {}, columns);
      if (!filters.length) throw new Error('updateMany without a filter');
      for (const expr of filters) q = q.or(expr);
      await run(q);
    },
    async deleteMany(query) {
      let q = supabase.from(table).delete();
      const filters = toFilters(query || {}, columns);
      if (!filters.length) throw new Error('deleteMany without a filter');
      for (const expr of filters) q = q.or(expr);
      await run(q);
    },
    // Live changes, in Base44's event shape: { type: 'create' | 'update' | 'delete', id, data }.
    // Rows arrive only for tables in the supabase_realtime publication, filtered by RLS.
    subscribe(callback) {
      const channel = supabase
        .channel(`${table}-${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          const type = { INSERT: 'create', UPDATE: 'update', DELETE: 'delete' }[payload.eventType];
          const data = payload.eventType === 'DELETE' ? payload.old : payload.new;
          callback({ type, id: data?.id, data });
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    },
    table,
  };
}

// Counts a listing view on the server (owners cannot set views_count themselves).
export const countView = (entityName, id) =>
  supabase.rpc('increment_listing_views', { p_table: schema[entityName]?.table, p_id: id }).then(() => {}, () => {});

const cache = {};
export const entities = new Proxy({}, {
  get: (_, name) => (typeof name === 'string' ? (cache[name] ||= makeEntity(name)) : undefined),
});

export const db = { entities, supabase };
