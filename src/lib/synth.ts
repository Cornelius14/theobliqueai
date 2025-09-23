// Deterministic, market-agnostic prospect synthesis. No hardcoded city lists.
// We derive consistent but fake companies/addresses/emails from the input using a seeded RNG.

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i=0;i<s.length;i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed: number) { return () => (seed = (seed*1664525+1013904223) >>> 0) / 0x100000000; }
const FIRST = ['Alex','Jordan','Taylor','Riley','Morgan','Casey','Avery','Quinn','Hayden','Reese','Drew','Parker','Jamie','Logan','Rowan','Skyler'];
const LAST  = ['Williams','Brown','Davis','Miller','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Clark','Lewis','Walker','Young'];
const SUFFIX = ['Partners','Realty','Capital','Holdings','Investments','Properties','Group','Advisors','Equity','Ventures'];
const LOC_SUFFIX = ['Heights','Park','District','Commons','Logistics Center','Industrial Park','Hub','Center','Yards','Point','Ridge','Creek','Crossing'];

export type Prospect = {
  id: string; // Added id field for demo compatibility
  title: string;
  city: string|null; state: string|null; country: string|null;
  size_sf?: number|null; units?: number|null;
  built_year?: number|null;
  price_estimate?: string|null; // e.g. "$2.5M", "$185/PSF"
  badges: string[];
  matchReason: string; // NEW: short reason line
  contact: { name: string; email: string; phone: string };
  outreach: { email:'green'|'red'|'gray', sms:'green'|'red'|'gray', call:'green'|'red'|'gray', vm:'green'|'red'|'gray' };
};

function pick<T>(r:()=>number, arr:T[]) { return arr[Math.floor(r()*arr.length)]; }
function clamp(n:number, lo:number, hi:number) { return Math.max(lo, Math.min(hi, n)); }

function titleAssetEmoji(asset:string|null){
  if (!asset) return '🏷️';
  const s = asset.toLowerCase();
  if (s.includes('industrial')||s.includes('warehouse')) return '🏭';
  if (s.includes('multifamily')||s.includes('apartment')) return '🏢';
  if (s.includes('retail')) return '🛍️';
  if (s.includes('single')) return '🏡';
  if (s.includes('land')) return '🌳';
  if (s.includes('data')) return '🖥️';
  if (s.includes('office')) return '🏬';
  if (s.includes('storage')) return '📦';
  return '🏷️';
}

export function synthProspects(parsed: any, count=10): Prospect[] {
  // Seed with the parsed content so same query -> same cards
  const seedBase = JSON.stringify({
    asset: parsed.asset_type,
    market: parsed.market,
    size: parsed.size_range_sf,
    units: parsed.units_range,
    year: parsed.build_year,
    price: parsed.price_cap_band,
    flags: parsed.flags
  });
  const baseSeed = hashString(seedBase);
  const rand = rng(baseSeed);

  const asset = parsed.asset_type ? String(parsed.asset_type) : 'asset';
  const emoji = titleAssetEmoji(asset);

  // Location tokens (no hardcoded city lists). Use provided city/metro/state/country; invent sub-areas deterministically.
  const locPrimary = parsed.market?.city || parsed.market?.metro || parsed.market?.state || parsed.market?.country || 'Market';
  const locState = parsed.market?.state || null;
  const locCountry = parsed.market?.country || null;

  function randomNeighborhood(i:number){
    const r = rng(baseSeed + 1000 + i);
    const base = locPrimary.split(/[ ,\-]/).filter(Boolean);
    const token = base.length ? pick(r, base) : locPrimary;
    return `${token} ${pick(r, LOC_SUFFIX)}`;
  }

  // Numeric helpers
  const minSF = parsed.size_range_sf?.min ?? null;
  const maxSF = parsed.size_range_sf?.max ?? null;
  const minUnits = parsed.units_range?.min ?? null;
  const maxUnits = parsed.units_range?.max ?? null;
  const builtAfter = parsed.build_year?.after ?? null;
  const builtBefore = parsed.build_year?.before ?? null;
  const capMin = parsed.price_cap_band?.cap_min ?? null;
  const psfMin = parsed.price_cap_band?.psf_min ?? null;
  const psfMax = parsed.price_cap_band?.psf_max ?? null;
  const budgetMin = parsed.price_cap_band?.budget_min ?? null;
  const budgetMax = parsed.price_cap_band?.budget_max ?? null;

  function within(n:number|null, lo:number|null, hi:number|null){
    if (n==null) return true;
    if (lo!=null && n<lo) return false;
    if (hi!=null && n>hi) return false;
    return true;
  }

  const res: Prospect[] = [];
  for (let i=0;i<count;i++){
    const r = rng(baseSeed + i);

    // Size/Units variability inside constraints (or plausible defaults if missing)
    let size: number|null = null;
    if (minSF!=null || maxSF!=null){
      const lo = minSF ?? Math.round((maxSF!*0.6));
      const hi = maxSF ?? Math.round((minSF!*1.4));
      size = clamp(Math.round(lo + r()*(hi-lo || 1)), Math.min(lo,hi), Math.max(lo,hi));
    }

    let units: number|null = null;
    if (minUnits!=null || maxUnits!=null){
      const loU = minUnits ?? Math.round((maxUnits!*0.6));
      const hiU = maxUnits ?? Math.round((minUnits!*1.4));
      units = clamp(Math.round(loU + r()*(hiU-loU || 1)), Math.min(loU,hiU), Math.max(loU,hiU));
    }

    // Year variation inside bounds
    let yr: number|null = null;
    if (builtAfter!=null || builtBefore!=null){
      const loY = builtAfter ?? 1960;
      const hiY = builtBefore ?? new Date().getFullYear();
      yr = clamp(Math.round(loY + r()*(hiY-loY || 1)), Math.min(loY,hiY), Math.max(loY,hiY));
    } else {
      // plausible build year if none given
      yr = 1975 + Math.floor(r()*45);
    }

    // Price/PSF derivation (very rough & fake but consistent)
    let priceStr: string|null = null;
    if (budgetMin!=null || budgetMax!=null){
      const loB = budgetMin ?? Math.round((budgetMax!*0.7));
      const hiB = budgetMax ?? Math.round((budgetMin!*1.3));
      const v = clamp(Math.round(loB + r()*(hiB-loB || 1)), Math.min(loB,hiB), Math.max(loB,hiB));
      priceStr = `$${v.toLocaleString()}`;
    } else if (psfMin!=null || psfMax!=null){
      const loP = psfMin ?? Math.round((psfMax!*0.7));
      const hiP = psfMax ?? Math.round((psfMin!*1.3));
      const v = clamp(Math.round(loP + r()*(hiP-loP || 1)), Math.min(loP,hiP), Math.max(loP,hiP));
      priceStr = `$${v}/PSF`;
    } else if (size!=null){
      const v = Math.round((60 + r()*140) * size / 1000) * 1000; // fake valuation
      priceStr = `$${v.toLocaleString()}`;
    }

    const nbhood = randomNeighborhood(i);
    const cityName = parsed.market?.city || nbhood; // prefer exact city; else invented sub-area label
    const stateName = locState;
    const countryName = locCountry;

    // Outreach mix
    const mix = () => (r()<0.55 ? 'green' : (r()<0.85 ? 'red' : 'gray')) as any;

    // Contact
    const fn = pick(r, FIRST);
    const ln = pick(r, LAST);
    const co = `${ln} ${pick(r, SUFFIX)}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@${co.replace(/\s+/g,'').toLowerCase()}.com`;
    const phone = `(${Math.floor(r()*800)+200}) ${Math.floor(r()*900)+100}-${Math.floor(r()*9000)+1000}`;

    // Badges
    const badges: string[] = [];
    if (builtAfter!=null) badges.push(`Built ≥ ${builtAfter}`);
    if (builtBefore!=null) badges.push(`Built ≤ ${builtBefore}`);
    if (parsed.flags?.loan_maturing) badges.push('Loan maturing');
    if (parsed.flags?.off_market) badges.push('Off-market');
    if (parsed.owner_age_min) badges.push(`Owner ≥ ${parsed.owner_age_min}`);
    if (parsed.owner_age_max) badges.push(`Owner ≤ ${parsed.owner_age_max}`);
    if (parsed.ownership_years_min) badges.push(`Tenure ≥ ${parsed.ownership_years_min}y`);
    if (capMin!=null) badges.push(`Cap ≥ ${capMin}%`);

    // Title & reason
    const sizeLabel = units!=null ? `${units} units` : (size!=null ? `${size.toLocaleString()} SF` : 'size n/a');
    const title = `${emoji} ${asset[0].toUpperCase()+asset.slice(1)} — ${sizeLabel} (${cityName}${stateName?`, ${stateName}`:''})`;

    const reasonParts: string[] = [];
    if (size!=null) reasonParts.push(`${size.toLocaleString()} SF`);
    if (units!=null) reasonParts.push(`${units} units`);
    if (yr!=null) reasonParts.push(`built ${yr}`);
    if (capMin!=null) reasonParts.push(`cap ≥ ${capMin}%`);
    reasonParts.push(parsed.market?.city || parsed.market?.metro || parsed.market?.state || parsed.market?.country || 'target area');
    const matchReason = reasonParts.join(' • ');

    res.push({
      id: `prospect-${baseSeed + i}`, // Unique id for demo compatibility
      title,
      city: parsed.market?.city || cityName,
      state: stateName,
      country: countryName,
      size_sf: size,
      units,
      built_year: yr,
      price_estimate: priceStr,
      badges,
      matchReason,
      contact: { name: `${fn} ${ln}`, email, phone },
      outreach: { email: mix(), sms: mix(), call: mix(), vm: mix() }
    });
  }

  // Enforce size/units bands if provided
  return res.filter(p => {
    const sizeOK = within(p.size_sf ?? null, minSF, maxSF);
    const unitOK = within(p.units ?? null, minUnits, maxUnits);
    return sizeOK && unitOK;
  });
}