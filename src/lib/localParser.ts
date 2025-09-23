// Local deterministic parser for buy-box criteria

export type Parsed = {
  intent: "acquisition" | "lease" | "refinance" | "title" | null,
  asset_type: "industrial" | "warehouse" | "multifamily" | "retail" | "land" | "data center" | "single-family" | null,
  market: { city: string|null, state: string|null, metro: string|null },
  size_range_sf: { min?: number|null, max?: number|null } | null,
  units_range: { min?: number|null, max?: number|null } | null,
  price_cap_band: { psf_min?: number|null, psf_max?: number|null, cap_min?: number|null, cap_max?: number|null, per_door_max?: number|null, budget_min?: number|null, budget_max?: number|null } | null,
  build_year: { after?: number|null, before?: number|null } | null,
  owner_age_min?: number|null,
  timing: { months_to_event?: number|null } | null,
  flags: { loan_maturing?: boolean, owner_age_65_plus?: boolean, off_market?: boolean },
  coverage?: number
}

export function parseBuyBoxLocal(text: string): Parsed {
  const lower = text.toLowerCase();

  // Synonyms
  const synonyms = {
    asset_type: {
      industrial: ['industrial', 'warehouse', 'logistics', 'plant'],
      warehouse: ['warehouse', 'industrial', 'logistics', 'plant'],
      multifamily: ['multifamily', 'apartments', 'units'],
      retail: ['retail', 'storefront', 'shop'],
      'single-family': ['single-family', 'sfh', 'single family', 'house', 'houses'],
      'data center': ['data center', 'datacenter'],
      land: ['land']
    },
    intent: {
      acquisition: ['acquire', 'buy', 'purchase', 'looking to buy'],
      lease: ['lease', 'for lease', 'rent'],
      refinance: ['refi', 'refinance'],
      title: ['title', 'escrow', 'deed', 'closing']
    }
  };

  // Intent detection
  let intent: Parsed["intent"] = null;
  for (const [key, values] of Object.entries(synonyms.intent)) {
    if (values.some(v => lower.includes(v))) {
      intent = key as Parsed["intent"];
      break;
    }
  }

  // Asset type detection
  let asset_type: Parsed["asset_type"] = null;
  for (const [key, values] of Object.entries(synonyms.asset_type)) {
    if (values.some(v => lower.includes(v))) {
      asset_type = key as Parsed["asset_type"];
      break;
    }
  }

  // Location extraction
  const market: Parsed["market"] = { city: null, state: null, metro: null };
  
  // City, State patterns
  const cityStatePattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*([A-Z]{2})\b/;
  const cityStateMatch = text.match(cityStatePattern);
  
  if (cityStateMatch) {
    market.city = cityStateMatch[1];
    market.state = cityStateMatch[2];
  } else {
    // Metro detection
    const metros = {
      'atlanta': { city: 'Atlanta', state: 'GA', metro: 'Atlanta' },
      'dallas': { city: 'Dallas', state: 'TX', metro: 'Dallas' },
      'miami': { city: 'Miami', state: 'FL', metro: 'Miami' },
      'miami beach': { city: 'Miami Beach', state: 'FL', metro: 'Miami' },
      'nashville': { city: 'Nashville', state: 'TN', metro: 'Nashville' },
      'charlotte': { city: 'Charlotte', state: 'NC', metro: 'Charlotte' },
      'nyc': { city: 'New York', state: 'NY', metro: 'NYC' },
      'new york': { city: 'New York', state: 'NY', metro: 'NYC' },
      'sf': { city: 'San Francisco', state: 'CA', metro: 'SF Bay Area' },
      'san francisco': { city: 'San Francisco', state: 'CA', metro: 'SF Bay Area' },
      'sf bay area': { city: 'San Francisco', state: 'CA', metro: 'SF Bay Area' },
      'bay area': { city: 'San Francisco', state: 'CA', metro: 'SF Bay Area' },
      'sf area': { city: 'San Francisco', state: 'CA', metro: 'SF Bay Area' }
    };
    
    for (const [metro, data] of Object.entries(metros)) {
      if (lower.includes(metro)) {
        market.city = data.city;
        market.state = data.state;
        market.metro = data.metro;
        break;
      }
    }
  }

  // Size/units extraction with k normalization
  let size_range_sf: Parsed["size_range_sf"] = null;
  let units_range: Parsed["units_range"] = null;

  const normalize = (str: string): number => {
    const cleaned = str.replace(/,/g, '');
    if (cleaned.endsWith('k')) {
      return parseInt(cleaned.slice(0, -1)) * 1000;
    }
    return parseInt(cleaned);
  };

  // SF patterns
  const sfRangePattern = /(\d{1,3}(?:,\d{3})*|\d+k?)\s*[-–—]\s*(\d{1,3}(?:,\d{3})*|\d+k?)\s*(?:sf|sq\.?\s*ft|square\s*feet)/i;
  const sfSinglePattern = /(\d{1,3}(?:,\d{3})*|\d+k?)\s*(?:sf|sq\.?\s*ft|square\s*feet)/i;
  
  const sfRangeMatch = text.match(sfRangePattern);
  const sfSingleMatch = text.match(sfSinglePattern);
  
  if (sfRangeMatch) {
    size_range_sf = {
      min: normalize(sfRangeMatch[1]),
      max: normalize(sfRangeMatch[2])
    };
  } else if (sfSingleMatch && !sfRangeMatch) {
    const size = normalize(sfSingleMatch[1]);
    size_range_sf = { min: size, max: size };
  }

  // Units patterns
  const unitsRangePattern = /(\d{1,3})\s*[-–—]\s*(\d{1,3})\s*units/i;
  const unitsMatch = text.match(unitsRangePattern);
  
  if (unitsMatch) {
    units_range = {
      min: parseInt(unitsMatch[1]),
      max: parseInt(unitsMatch[2])
    };
  }

  // Price/cap/budget extraction
  let price_cap_band: Parsed["price_cap_band"] = null;

  // PSF patterns
  const psfRangePattern = /\$?(\d+)\s*[-–—]\s*\$?(\d+)\s*(?:psf|per\s*sf)/i;
  const psfMatch = text.match(psfRangePattern);

  // CAP patterns
  const capPattern = /cap\s*[≥>=]\s*(\d+(?:\.\d+)?)%/i;
  const capRangePattern = /cap\s*(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)%/i;
  const capMatch = text.match(capPattern);
  const capRangeMatch = text.match(capRangePattern);

  // Per door patterns
  const perDoorPattern = /[≤<=]?\s*\$?(\d{2,4})k\/door/i;
  const perDoorMatch = text.match(perDoorPattern);

  // Budget patterns
  const budgetPattern = /between\s*(\d+)\s*[-–—]\s*(\d+)\s*million/i;
  const budgetMatch = text.match(budgetPattern);

  if (psfMatch || capMatch || capRangeMatch || perDoorMatch || budgetMatch) {
    price_cap_band = {
      psf_min: null,
      psf_max: null,
      cap_min: null,
      cap_max: null,
      per_door_max: null,
      budget_min: null,
      budget_max: null
    };
    
    if (psfMatch) {
      price_cap_band.psf_min = parseInt(psfMatch[1]);
      price_cap_band.psf_max = parseInt(psfMatch[2]);
    }
    
    if (capMatch) {
      price_cap_band.cap_min = parseFloat(capMatch[1]);
    }
    
    if (capRangeMatch) {
      price_cap_band.cap_min = parseFloat(capRangeMatch[1]);
      price_cap_band.cap_max = parseFloat(capRangeMatch[2]);
    }
    
    if (perDoorMatch) {
      price_cap_band.per_door_max = parseInt(perDoorMatch[1]) * 1000;
    }
    
    if (budgetMatch) {
      price_cap_band.budget_min = parseInt(budgetMatch[1]) * 1000000;
      price_cap_band.budget_max = parseInt(budgetMatch[2]) * 1000000;
    }
  }

  // Build year extraction
  let build_year: Parsed["build_year"] = null;
  const buildRangePattern = /(?:built\s*)?(\d{4})\s*[-–—]\s*(\d{4})/i;
  const buildAfterPattern = /(?:built\s*|after\s*)(\d{4})/i;
  
  const buildRangeMatch = text.match(buildRangePattern);
  const buildAfterMatch = text.match(buildAfterPattern);
  
  if (buildRangeMatch) {
    build_year = {
      after: parseInt(buildRangeMatch[1]),
      before: parseInt(buildRangeMatch[2])
    };
  } else if (buildAfterMatch) {
    build_year = { 
      after: parseInt(buildAfterMatch[1]),
      before: null
    };
  }

  // Owner age extraction
  let owner_age_min: number | null = null;
  const ownerAgePattern = /owners?\s*(?:above|over|\+)\s*(\d+)/i;
  const ownerAgeMatch = text.match(ownerAgePattern);
  if (ownerAgeMatch) {
    owner_age_min = parseInt(ownerAgeMatch[1]);
  }

  // Timing extraction
  let timing: Parsed["timing"] = null;
  const timingPattern = /(?:maturing|closing|need)\s*in\s*(\d+)(?:\s*[-–—]\s*(\d+))?\s*months?/i;
  const timingMatch = text.match(timingPattern);
  if (timingMatch) {
    timing = { months_to_event: parseInt(timingMatch[1]) };
  }

  // Flags detection
  const flags: Parsed["flags"] = {
    loan_maturing: /loan[s]?\s*(?:matur|due)/i.test(text),
    owner_age_65_plus: owner_age_min ? owner_age_min >= 65 : /owner[s]?\s*(?:above|over|\+)\s*65|65\+?\s*owner/i.test(text),
    off_market: /off[-\s]?market/i.test(text)
  };

  return {
    intent,
    asset_type,
    market,
    size_range_sf,
    units_range,
    price_cap_band,
    build_year,
    owner_age_min,
    timing,
    flags
  };
}

export function coverageScore(parsed: Parsed): number {
  let coverage = 0;
  
  if (parsed.intent) coverage += 20;
  if (parsed.asset_type) coverage += 20;
  if (parsed.market.city || parsed.market.metro) coverage += 25;
  if (parsed.size_range_sf || parsed.units_range) coverage += 25;
  if (parsed.price_cap_band) coverage += 10;
  
  return Math.min(100, coverage);
}

// Validate LLM response against expected schema
export function validateLLMResponse(data: any): data is Parsed {
  if (!data || typeof data !== 'object') return false;
  
  // Check required structure
  const hasValidMarket = data.market && typeof data.market === 'object';
  const hasValidFlags = data.flags && typeof data.flags === 'object';
  
  return hasValidMarket && hasValidFlags;
}