// Deterministic, market-agnostic prospect synthesis. No hardcoded city lists.
// We derive consistent but fake companies/addresses/emails from the input using a seeded RNG.

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i=0;i<s.length;i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed: number) { return () => (seed = (seed*1664525+1013904223) >>> 0) / 0x100000000; }
const FIRST = ['Alex','Jordan','Taylor','Riley','Morgan','Casey','Avery','Quinn','Hayden','Reese','Drew','Parker'];
const LAST  = ['Williams','Brown','Davis','Miller','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris'];
const SUFFIX = ['Partners','Realty','Capital','Holdings','Investments','Properties','Group','Advisors'];

export type Prospect = {
  id: string; // Added id field for demo compatibility
  title: string; // "🏭 Industrial — 82k SF (City, ST)" or for units/lease variants
  city: string|null; state: string|null; country: string|null;
  size_sf?: number|null; units?: number|null;
  badges: string[]; // e.g., ["Loan maturing","Owner ≥65","Built ≥1980"]
  contact: { name: string; email: string; phone: string };
  outreach: { email:'green'|'red'|'gray', sms:'green'|'red'|'gray', call:'green'|'red'|'gray', vm:'green'|'red'|'gray' };
};

function pick<T>(r:()=>number, arr:T[]) { return arr[Math.floor(r()*arr.length)]; }

export function synthProspects(parsed: any, count=10): Prospect[] {
  const seedBase = JSON.stringify(parsed);
  let seed = hashString(seedBase);
  const rand = rng(seed);

  const city   = parsed.market?.city || parsed.market?.metro || 'Unknown';
  const state  = parsed.market?.state || '';
  const country= parsed.market?.country || '';

  // Decide asset label
  const asset = parsed.asset_type ? String(parsed.asset_type) : 'asset';
  const isUnits = !!(parsed.units_range?.min || parsed.units_range?.max);

  // derive numeric fields
  const minSF = parsed.size_range_sf?.min ?? null;
  const maxSF = parsed.size_range_sf?.max ?? null;
  const minUnits = parsed.units_range?.min ?? null;
  const maxUnits = parsed.units_range?.max ?? null;

  const builtAfter = parsed.build_year?.after ?? null;

  const res: Prospect[] = [];
  for (let i=0;i<count;i++) {
    const r = rng(seed + i);
    const fn = pick(r, FIRST);
    const ln = pick(r, LAST);
    const comp = `${ln} ${pick(r, SUFFIX)}`;

    const size = (minSF || maxSF) ? Math.round((minSF??(maxSF!*0.7)) + r() * ((maxSF??(minSF!*1.4)) - (minSF??(maxSF!*0.7)))) : null;
    const units = (minUnits || maxUnits) ? Math.round((minUnits??(maxUnits!*0.7)) + r() * ((maxUnits??(minUnits!*1.4)) - (minUnits??(maxUnits!*0.7)))) : null;

    const titleSize = isUnits
      ? (units ? `${units} units` : '')
      : (size ? `${size.toLocaleString()} SF` : '');

    const title = `🏷️ ${asset[0].toUpperCase()+asset.slice(1)} — ${titleSize || 'size n/a'} (${city}${state?`, ${state}`:''})`;

    const badges:string[] = [];
    if (builtAfter) badges.push(`Built ≥ ${builtAfter}`);
    if (parsed.flags?.loan_maturing) badges.push('Loan maturing');
    if (parsed.flags?.off_market) badges.push('Off-market');
    if (parsed.owner_age_min) badges.push(`Owner ≥ ${parsed.owner_age_min}`);
    if (parsed.owner_age_max) badges.push(`Owner ≤ ${parsed.owner_age_max}`);
    if (parsed.ownership_years_min) badges.push(`Tenure ≥ ${parsed.ownership_years_min}y`);

    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@${comp.replace(/\s+/g,'').toLowerCase()}.com`;
    const phone = `(${Math.floor(r()*800)+200}) ${Math.floor(r()*900)+100}-${Math.floor(r()*9000)+1000}`;

    // outreach colors
    const hit = () => r() < 0.55 ? 'green' : (r() < 0.80 ? 'red' : 'gray') as any;

    res.push({
      id: `prospect-${seed + i}`, // Unique id for demo compatibility
      title,
      city: parsed.market?.city || null,
      state: state || null,
      country: country || null,
      size_sf: size,
      units,
      badges,
      contact: { name: `${fn} ${ln}`, email, phone },
      outreach: { email: hit(), sms: hit(), call: hit(), vm: hit() }
    });
  }
  return res;
}