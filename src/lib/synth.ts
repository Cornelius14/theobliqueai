export type Prospect = {
  id: string;
  title: string;
  city: string|null; state: string|null; country: string|null;
  size_sf?: number|null; units?: number|null;
  built_year?: number|null;
  price_estimate?: string|null;
  badges: string[];
  matchReason: string; // concise "why this matched"
  contact: { name: string; email: string; phone: string };
  outreach: { email:'green'|'red'|'gray', sms:'green'|'red'|'gray', call:'green'|'red'|'gray', vm:'green'|'red'|'gray' };
};

function hashString(s: string) { 
  let h = 2166136261 >>> 0; 
  for (let i = 0; i < s.length; i++) { 
    h ^= s.charCodeAt(i); 
    h = Math.imul(h, 16777619); 
  } 
  return h >>> 0; 
}

function rng(seed: number) { 
  return () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 0x100000000; 
}

const FIRST = ['Alex','Jordan','Taylor','Riley','Morgan','Casey','Avery','Quinn','Hayden','Reese','Drew','Parker','Jamie','Logan','Rowan','Skyler'];
const LAST = ['Williams','Brown','Davis','Miller','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Clark','Lewis','Walker','Young'];
const SUFFIX = ['Partners','Realty','Capital','Holdings','Investments','Properties','Group','Advisors','Equity','Ventures'];
const LOC_SUFFIX = ['Park','District','Logistics Center','Industrial Park','Hub','Center','Yards','Point','Ridge','Creek','Crossing','Commons'];

function pick<T>(r: () => number, arr: T[]) { 
  return arr[Math.floor(r() * arr.length)]; 
}

function clamp(n: number, lo: number, hi: number) { 
  return Math.max(lo, Math.min(hi, n)); 
}

function emoji(asset: string | null) { 
  if (!asset) return '🏷️'; 
  const s = asset.toLowerCase(); 
  if (s.includes('industrial') || s.includes('warehouse')) return '🏭'; 
  if (s.includes('multifamily') || s.includes('apartment')) return '🏢'; 
  if (s.includes('retail')) return '🛍️'; 
  if (s.includes('single')) return '🏡'; 
  if (s.includes('land')) return '🌳'; 
  if (s.includes('data')) return '🖥️'; 
  if (s.includes('office')) return '🏬'; 
  if (s.includes('storage')) return '📦'; 
  return '🏷️'; 
}

export function synthProspects(parsed: any, count = 10): Prospect[] {
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
  const baseRand = rng(baseSeed);
  const asset = parsed.asset_type ? String(parsed.asset_type) : 'asset';
  const ico = emoji(asset);
  const locPrimary = parsed.market?.city || parsed.market?.metro || parsed.market?.state || parsed.market?.country || 'Market';
  const locState = parsed.market?.state || null;
  const locCountry = parsed.market?.country || null;
  
  function subArea(i: number) { 
    const r = rng(baseSeed + 1000 + i); 
    const token = (locPrimary || 'Area').split(/[ ,\-]/).filter(Boolean); 
    return `${pick(r, token.length ? token : ['Area'])} ${pick(r, LOC_SUFFIX)}`; 
  }
  
  const minSF = parsed.size_range_sf?.min ?? null, maxSF = parsed.size_range_sf?.max ?? null;
  const minU = parsed.units_range?.min ?? null, maxU = parsed.units_range?.max ?? null;
  const yAfter = parsed.build_year?.after ?? null, yBefore = parsed.build_year?.before ?? null;
  const capMin = parsed.price_cap_band?.cap_min ?? null;
  const psfMin = parsed.price_cap_band?.psf_min ?? null, psfMax = parsed.price_cap_band?.psf_max ?? null;
  const budMin = parsed.price_cap_band?.budget_min ?? null, budMax = parsed.price_cap_band?.budget_max ?? null;
  
  function within(n: number | null, lo: number | null, hi: number | null) { 
    if (n == null) return true; 
    if (lo != null && n < lo) return false; 
    if (hi != null && n > hi) return false; 
    return true; 
  }
  
  const out: Prospect[] = [];
  for (let i = 0; i < count; i++) {
    const r = rng(baseSeed + i);
    let size: number | null = null; 
    if (minSF != null || maxSF != null) { 
      const lo = minSF ?? Math.round(maxSF! * 0.6); 
      const hi = maxSF ?? Math.round(minSF! * 1.4); 
      size = clamp(Math.round(lo + r() * ((hi - lo) || 1)), Math.min(lo, hi), Math.max(lo, hi)); 
    }
    
    let units: number | null = null; 
    if (minU != null || maxU != null) { 
      const lo = minU ?? Math.round(maxU! * 0.6); 
      const hi = maxU ?? Math.round(minU! * 1.4); 
      units = clamp(Math.round(lo + r() * ((hi - lo) || 1)), Math.min(lo, hi), Math.max(lo, hi)); 
    }
    
    let yr: number | null = null; 
    if (yAfter != null || yBefore != null) { 
      const lo = yAfter ?? 1960, hi = yBefore ?? new Date().getFullYear(); 
      yr = clamp(Math.round(lo + r() * ((hi - lo) || 1)), Math.min(lo, hi), Math.max(lo, hi)); 
    } else { 
      yr = 1975 + Math.floor(r() * 45); 
    }
    
    let priceStr: string | null = null;
    if (budMin != null || budMax != null) { 
      const lo = budMin ?? Math.round(budMax! * 0.7); 
      const hi = budMax ?? Math.round(budMin! * 1.3); 
      const v = clamp(Math.round(lo + r() * ((hi - lo) || 1)), Math.min(lo, hi), Math.max(lo, hi)); 
      priceStr = `$${v.toLocaleString()}`; 
    }
    else if (psfMin != null || psfMax != null) { 
      const lo = psfMin ?? Math.round(psfMax! * 0.7); 
      const hi = psfMax ?? Math.round(psfMin! * 1.3); 
      const v = clamp(Math.round(lo + r() * ((hi - lo) || 1)), Math.min(lo, hi), Math.max(lo, hi)); 
      priceStr = `$${v}/PSF`; 
    }
    else if (size != null) { 
      const v = Math.round((60 + r() * 140) * size / 1000) * 1000; 
      priceStr = `$${v.toLocaleString()}`; 
    }
    
    const nb = subArea(i);
    const city = parsed.market?.city || nb;
    const mix = () => (r() < 0.55 ? 'green' : (r() < 0.85 ? 'red' : 'gray')) as any;
    const fn = pick(r, FIRST), ln = pick(r, LAST), co = `${ln} ${pick(r, SUFFIX)}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@${co.replace(/\s+/g, '').toLowerCase()}.com`;
    const phone = `(${Math.floor(r() * 800) + 200}) ${Math.floor(r() * 900) + 100}-${Math.floor(r() * 9000) + 1000}`;
    
    const badges: string[] = []; 
    if (yAfter != null) badges.push(`Built ≥ ${yAfter}`); 
    if (yBefore != null) badges.push(`Built ≤ ${yBefore}`); 
    if (parsed.flags?.loan_maturing) badges.push('Loan maturing'); 
    if (parsed.flags?.off_market) badges.push('Off-market'); 
    if (parsed.owner_age_min) badges.push(`Owner ≥ ${parsed.owner_age_min}`); 
    if (parsed.owner_age_max) badges.push(`Owner ≤ ${parsed.owner_age_max}`); 
    if (parsed.ownership_years_min) badges.push(`Tenure ≥ ${parsed.ownership_years_min}y`); 
    if (capMin != null) badges.push(`Cap ≥ ${capMin}%`);
    
    const sizeLabel = units != null ? `${units} units` : (size != null ? `${size.toLocaleString()} SF` : 'size n/a');
    const title = `${ico} ${asset[0].toUpperCase() + asset.slice(1)} — ${sizeLabel} (${city}${locState ? `, ${locState}` : ''})`;
    
    const reasonParts: string[] = []; 
    if (size != null) reasonParts.push(`${size.toLocaleString()} SF`); 
    if (units != null) reasonParts.push(`${units} units`); 
    if (yr != null) reasonParts.push(`built ${yr}`); 
    if (capMin != null) reasonParts.push(`cap ≥ ${capMin}%`); 
    reasonParts.push(parsed.market?.city || parsed.market?.metro || parsed.market?.state || parsed.market?.country || 'target area');
    
    out.push({ 
      id: `prospect-${baseSeed + i}`,
      title, 
      city: parsed.market?.city || city, 
      state: locState, 
      country: locCountry, 
      size_sf: size, 
      units, 
      built_year: yr, 
      price_estimate: priceStr, 
      badges, 
      matchReason: reasonParts.join(' • '), 
      contact: { name: `${fn} ${ln}`, email, phone }, 
      outreach: { email: mix(), sms: mix(), call: mix(), vm: mix() }
    });
  }
  
  return out.filter(p => { 
    const sizeOK = (minSF == null && maxSF == null) ? true : ((p.size_sf ?? null) === null ? false : p.size_sf! >= (minSF ?? -Infinity) && p.size_sf! <= (maxSF ?? Infinity)); 
    const unitOK = (minU == null && maxU == null) ? true : ((p.units ?? null) === null ? false : p.units! >= (minU ?? -Infinity) && p.units! <= (maxU ?? Infinity)); 
    return sizeOK && unitOK; 
  });
}