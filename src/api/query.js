// Translates Base44 (Mongo-style) queries into PostgREST filter expressions.
// Every returned expression is passed to supabase-js `.or(expr)`; separate calls are ANDed,
// so `or(a)` alone is just `a`. Only the operators the site uses are supported.

const RESERVED = /[,.:()"\\\s]/;
const quote = (v) => {
  const s = String(v);
  return RESERVED.test(s) || s === '' ? `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : s;
};
const list = (values) => `(${values.map(quote).join(',')})`;
const arrayLiteral = (values) => `{${values.map((v) => `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',')}}`;
// The site only builds regexes from escaped user text (a substring search); undo the escaping.
const unescapeRegex = (s) => String(s).replace(/\\(.)/g, '$1');
const likePattern = (s) => `*${unescapeRegex(s).replace(/[*%]/g, '')}*`;

const isArrayColumn = (columns, field) => columns?.[field] === 'text[]';
const isOperatorObject = (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).some((k) => k.startsWith('$'));

function fieldExprs(field, value, columns) {
  if (value === null || value === undefined) return [`${field}.is.null`];
  if (Array.isArray(value)) return [`${field}.cs.${arrayLiteral(value)}`];
  if (!isOperatorObject(value)) {
    if (isArrayColumn(columns, field)) return [`${field}.cs.${arrayLiteral([value])}`];
    return [`${field}.eq.${quote(value)}`];
  }
  const out = [];
  for (const [op, arg] of Object.entries(value)) {
    switch (op) {
      case '$eq': out.push(...fieldExprs(field, arg, columns)); break;
      case '$in':
        if (!arg.length) out.push('id.is.null'); // id is the primary key: matches nothing
        else out.push(isArrayColumn(columns, field) ? `${field}.ov.${arrayLiteral(arg)}` : `${field}.in.${list(arg)}`);
        break;
      case '$nin': if (arg.length) out.push(`or(${field}.is.null,${field}.not.in.${list(arg)})`); break;
      case '$ne':
        out.push(arg === null ? `${field}.not.is.null` : `or(${field}.is.null,${field}.neq.${quote(arg)})`);
        break;
      case '$gt': case '$gte': case '$lt': case '$lte':
        out.push(`${field}.${op.slice(1)}.${quote(arg)}`); break;
      case '$exists': out.push(arg ? `${field}.not.is.null` : `${field}.is.null`); break;
      case '$all': if (arg.length) out.push(`${field}.cs.${arrayLiteral(arg)}`); break;
      case '$regex':
        out.push(isArrayColumn(columns, field)
          ? `${field}.cs.${arrayLiteral([unescapeRegex(arg)])}`
          : `${field}.${value.$options?.includes('i') ? 'ilike' : 'like'}.${quote(likePattern(arg))}`);
        break;
      case '$options': break;
      default: throw new Error(`Unsupported query operator ${op} on ${field}`);
    }
  }
  return out;
}

// One AND-group as a single expression usable inside or(...)/and(...).
function groupExpr(query, columns) {
  const parts = toFilters(query, columns);
  return parts.length === 1 ? parts[0] : `and(${parts.join(',')})`;
}

export function toFilters(query, columns) {
  const out = [];
  for (const [key, value] of Object.entries(query || {})) {
    if (value === undefined) continue;
    if (key === '$and') { for (const sub of value) out.push(...toFilters(sub, columns)); continue; }
    if (key === '$or') { out.push(`or(${value.map((sub) => groupExpr(sub, columns)).join(',')})`); continue; }
    out.push(...fieldExprs(key, value, columns));
  }
  // supabase-js `.or(x)` wraps x in or=(...): unwrap a top-level or(...) so it is not nested twice.
  return out.map((e) => (/^or\(.*\)$/.test(e) && balanced(e.slice(3, -1)) ? e.slice(3, -1) : e));
}

const balanced = (s) => {
  let depth = 0, inQuote = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\') { i++; continue; }
    if (c === '"') inQuote = !inQuote;
    else if (!inQuote && c === '(') depth++;
    else if (!inQuote && c === ')' && --depth < 0) return false;
  }
  return depth === 0;
};

export function parseSort(sort) {
  if (!sort) return [];
  return String(sort).split(',').map((s) => s.trim()).filter(Boolean)
    .map((s) => (s.startsWith('-') ? { column: s.slice(1), ascending: false } : { column: s.replace(/^\+/, ''), ascending: true }));
}
