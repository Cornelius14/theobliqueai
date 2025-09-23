import { Parsed } from './llmClient';

const STATES: Record<string, string> = { 
  idaho: 'ID', texas: 'TX', georgia: 'GA', florida: 'FL', california: 'CA', 'new york': 'NY', 
  washington: 'WA', arizona: 'AZ', colorado: 'CO', oregon: 'OR', nevada: 'NV', utah: 'UT', 
  illinois: 'IL', ohio: 'OH', michigan: 'MI', 'north carolina': 'NC', 'south carolina': 'SC', 
  tennessee: 'TN', pennsylvania: 'PA', massachusetts: 'MA', virginia: 'VA', 'new jersey': 'NJ', 
  connecticut: 'CT', wisconsin: 'WI', minnesota: 'MN', indiana: 'IN', missouri: 'MO', 
  alabama: 'AL', kentucky: 'KY', oklahoma: 'OK', iowa: 'IA', kansas: 'KS', arkansas: 'AR', 
  louisiana: 'LA', mississippi: 'MS', 'new mexico': 'NM', nebraska: 'NE', 'north dakota': 'ND', 
  'south dakota': 'SD', wyoming: 'WY', montana: 'MT', id: 'ID' 
};

function pickState(text: string) { 
  const s = text.toLowerCase(); 
  for (const k of Object.keys(STATES)) if (s.includes(k)) return STATES[k]; 
  return null; 
}

function pickCity(text: string) { 
  const m = text.match(/\bin\s+([A-Za-z][A-Za-z\s'-]{2,})/i); 
  if (m) return m[1].trim().split(/\s+/)[0]; 
  const m2 = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/); 
  return m2 ? m2[1] : null; 
}

function num(text: string, re: RegExp) { 
  const m = re.exec(text); 
  if (!m) return null; 
  const raw = m[1].replace(/,/g, '').toLowerCase(); 
  if (raw.endsWith('k')) return Math.round(parseFloat(raw) * 1000); 
  if (raw.includes('million')) return Math.round(parseFloat(raw) * 1_000_000); 
  const n = Number(raw.replace(/[^\d.]/g, '')); 
  return isFinite(n) ? n : null; 
}

export function quickExtract(text: string): Parsed {
  const t = text.trim(), lower = t.toLowerCase();
  let asset: null | string = null;
  if (/\bfactor(y|ies)|plant(s)?\b/.test(lower)) asset = 'industrial';
  else if (/\bwarehouse(s)?\b/.test(lower)) asset = 'industrial';
  else if (/\bmultifamily|apartment(s)?\b/.test(lower)) asset = 'multifamily';
  else if (/\bretail\b/.test(lower)) asset = 'retail';
  else if (/\boffice\b/.test(lower)) asset = 'office';
  else if (/\bland\b/.test(lower)) asset = 'land';
  else if (/\b(single[-\s]?family|sfr)\b/.test(lower)) asset = 'single-family';
  
  const state = pickState(lower);
  const city = pickCity(t);
  const budgetMax = num(lower, /\bunder\s*([\d.,]+(?:\s*million|k)?)\b/i) ?? num(lower, /\b<=\s*([\d.,]+(?:\s*million|k)?)\b/i);
  const capMin = num(lower, /\bcap\s*(?:rate)?\s*(?:>=|≥|\+)?\s*([\d.]+)\s*%/i);
  const ageMin = num(lower, /\bowner(s)?\s*(?:is|are)?\s*(?:above|over|>=|≥)\s*([\d]+)\b/i);
  const tenureMin = num(lower, /\bowned\s*(?:for)?\s*(?:at\s*least|>=|≥)?\s*([\d]+)\s*year/i);
  
  return {
    intent: null,
    asset_type: asset,
    market: { city: city, state: state, metro: null, country: null },
    size_range_sf: null,
    units_range: null,
    price_cap_band: { 
      psf_min: null, psf_max: null, cap_min: capMin, cap_max: null, 
      per_door_max: null, budget_min: null, budget_max: budgetMax 
    },
    build_year: null,
    owner_age_min: ageMin, 
    owner_age_max: null,
    ownership_years_min: tenureMin ?? null,
    timing: { months_to_event: null },
    flags: { 
      loan_maturing: false, 
      owner_age_65_plus: !!(ageMin && ageMin >= 65), 
      off_market: false 
    },
    _confidence: {}
  };
}