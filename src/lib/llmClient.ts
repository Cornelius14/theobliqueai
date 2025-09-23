import { type Parsed } from './localParser';

export async function parseWithLLM(text: string): Promise<Parsed> {
  const endpoint = 'https://mandate-parser-brenertomer.replit.app/parseBuyBox';
  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!r.ok) throw new Error(`LLM ${r.status}`);
  const json = await r.json();
  return json;
}

export function normalizeParsed(p: any): Parsed {
  // Ensure all fields exist with proper types
  const normalized: Parsed = {
    intent: p?.intent || null,
    asset_type: p?.asset_type === 'warehouse' ? 'industrial' : p?.asset_type || null,
    market: {
      city: typeof p?.market?.city === 'string' ? p.market.city : null,
      state: typeof p?.market?.state === 'string' ? p.market.state : null,
      metro: typeof p?.market?.metro === 'string' ? p.market.metro : null,
    },
    size_range_sf: p?.size_range_sf ? {
      min: typeof p.size_range_sf.min === 'number' && p.size_range_sf.min >= 0 ? p.size_range_sf.min : null,
      max: typeof p.size_range_sf.max === 'number' && p.size_range_sf.max >= 0 ? p.size_range_sf.max : null,
    } : null,
    units_range: p?.units_range ? {
      min: typeof p.units_range.min === 'number' && p.units_range.min >= 0 ? p.units_range.min : null,
      max: typeof p.units_range.max === 'number' && p.units_range.max >= 0 ? p.units_range.max : null,
    } : null,
    price_cap_band: p?.price_cap_band ? {
      psf_min: typeof p.price_cap_band.psf_min === 'number' && p.price_cap_band.psf_min >= 0 ? p.price_cap_band.psf_min : null,
      psf_max: typeof p.price_cap_band.psf_max === 'number' && p.price_cap_band.psf_max >= 0 ? p.price_cap_band.psf_max : null,
      cap_min: typeof p.price_cap_band.cap_min === 'number' && p.price_cap_band.cap_min >= 0 ? p.price_cap_band.cap_min : null,
      cap_max: typeof p.price_cap_band.cap_max === 'number' && p.price_cap_band.cap_max >= 0 ? p.price_cap_band.cap_max : null,
      per_door_max: typeof p.price_cap_band.per_door_max === 'number' && p.price_cap_band.per_door_max >= 0 ? p.price_cap_band.per_door_max : null,
      budget_min: typeof p.price_cap_band.budget_min === 'number' && p.price_cap_band.budget_min >= 0 ? p.price_cap_band.budget_min : null,
      budget_max: typeof p.price_cap_band.budget_max === 'number' && p.price_cap_band.budget_max >= 0 ? p.price_cap_band.budget_max : null,
    } : null,
    build_year: p?.build_year ? {
      after: typeof p.build_year.after === 'number' ? p.build_year.after : null,
      before: typeof p.build_year.before === 'number' ? p.build_year.before : null,
    } : null,
    owner_age_min: typeof p?.owner_age_min === 'number' && p.owner_age_min >= 0 ? p.owner_age_min : null,
    timing: p?.timing ? {
      months_to_event: typeof p.timing.months_to_event === 'number' ? p.timing.months_to_event : null,
    } : null,
    flags: {
      loan_maturing: Boolean(p?.flags?.loan_maturing),
      owner_age_65_plus: Boolean(p?.flags?.owner_age_65_plus),
      off_market: Boolean(p?.flags?.off_market),
    }
  };

  return normalized;
}