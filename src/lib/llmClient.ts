export type Parsed = {
  intent: 'acquisition'|'lease'|'refinance'|'title'|null;
  asset_type: string | null; // allow ANY (e.g., self-storage, medical office)
  market: { city: string|null; state: string|null; metro: string|null; country?: string|null };
  size_range_sf: { min: number|null; max: number|null } | null;
  units_range: { min: number|null; max: number|null } | null;
  price_cap_band: {
    psf_min: number|null; psf_max: number|null;
    cap_min: number|null; cap_max: number|null;
    per_door_max: number|null;
    budget_min: number|null; budget_max: number|null
  } | null;
  build_year: { after: number|null; before: number|null } | null;
  owner_age_min?: number|null;
  owner_age_max?: number|null;
  ownership_years_min?: number|null;
  timing: { months_to_event: number|null } | null;
  flags: { loan_maturing: boolean; owner_age_65_plus: boolean; off_market: boolean };
  _confidence?: Record<string, number>; // optional
};

const PARSER_API = 'https://mandate-parser-brenertomer.replit.app/parseBuyBox';

export async function parseWithLLM(text: string): Promise<Parsed> {
  const r = await fetch(PARSER_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!r.ok) throw new Error('LLM ' + r.status);
  return await r.json();
}