import { mapIntentFromText, type UniversalIntent } from './intentTaxonomy';

export type { UniversalIntent };
import { toNumber } from './normalize';

export interface UniversalMandate {
  intent: UniversalIntent;
  role?: string;
  instrument?: string;
  asset_type?: string;
  market?: {
    city?: string;
    state?: string;
    metro?: string;
    country?: string;
  };
  size_sf?: {
    min?: number;
    max?: number;
  };
  units?: {
    min?: number;
    max?: number;
  };
  budget?: {
    min?: number;
    max?: number;
  };
  cap_rate?: {
    min?: number;
    max?: number;
  };
  psf?: {
    min?: number;
    max?: number;
  };
  build_year?: {
    after?: number;
    before?: number;
  };
  timing?: {
    months_to_event?: number;
  };
  distress?: {
    default?: boolean;
    maturity?: boolean;
    foreclosure?: boolean;
  };
  keywords?: string[];
}

function extractRole(text: string): string | undefined {
  const t = text.toLowerCase();
  if (t.includes('borrower') || t.includes('buyer')) return 'buy_side';
  if (t.includes('lender') || t.includes('seller')) return 'sell_side';
  if (t.includes('tenant')) return 'tenant';
  if (t.includes('landlord')) return 'landlord';
  if (t.includes('sponsor')) return 'sponsor';
  return undefined;
}

function extractTiming(text: string): { months_to_event?: number } | undefined {
  const t = text.toLowerCase();
  
  // Match patterns like "6 months", "3-6 months", "matur in 6 months"
  const monthsMatch = t.match(/(\d+)(?:\s*-\s*\d+)?\s*months?/);
  if (monthsMatch) {
    return { months_to_event: parseInt(monthsMatch[1]) };
  }
  
  // Match "45 days" and convert to months
  const daysMatch = t.match(/(\d+)\s*days?/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    return { months_to_event: Math.round(days / 30 * 10) / 10 }; // Convert to months, round to 1 decimal
  }
  
  return undefined;
}

function extractDistress(text: string): { default?: boolean; maturity?: boolean; foreclosure?: boolean } | undefined {
  const t = text.toLowerCase();
  const distress: any = {};
  
  if (t.includes('default') || t.includes('workout')) distress.default = true;
  if (t.includes('matur') || t.includes('refinanc')) distress.maturity = true;
  if (t.includes('foreclos') || t.includes('distress')) distress.foreclosure = true;
  
  return Object.keys(distress).length > 0 ? distress : undefined;
}

function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  const t = text.toLowerCase();
  
  // Common real estate keywords
  const patterns = [
    'cap rate', 'noi', 'dscr', 'ltv', 'irr', 'cash flow',
    'triple net', 'nnn', 'gross lease', 'cam', 'ti allowance',
    'work letter', 'percentage rent', 'escalation',
    'construction', 'development', 'ground lease',
    'refinance', 'cash out', 'mezzanine', 'preferred equity',
    '1031', 'tax credit', 'lihtc', 'historic',
    'distressed', 'workout', 'foreclosure', 'bankruptcy'
  ];
  
  patterns.forEach(pattern => {
    if (t.includes(pattern)) keywords.push(pattern);
  });
  
  return keywords;
}

export function normalizeUniversal(parsed: any, originalText: string): UniversalMandate {
  const result: UniversalMandate = {
    intent: parsed?.intent ? mapIntentFromText(parsed.intent) : mapIntentFromText(originalText),
    keywords: extractKeywords(originalText)
  };
  
  // Extract role
  result.role = parsed?.role || extractRole(originalText);
  
  // Extract timing
  result.timing = parsed?.timing || extractTiming(originalText);
  
  // Extract distress indicators
  result.distress = parsed?.distress || extractDistress(originalText);
  
  // Map existing fields with fallbacks
  result.asset_type = parsed?.asset_type || null;
  
  // Market
  if (parsed?.market || originalText) {
    const market = parsed?.market || {};
    result.market = {
      city: market.city || null,
      state: market.state || null,
      metro: market.metro || null,
      country: market.country || null
    };
  }
  
  // Size ranges
  if (parsed?.size_range_sf) {
    result.size_sf = {
      min: toNumber(parsed.size_range_sf.min),
      max: toNumber(parsed.size_range_sf.max)
    };
  }
  
  if (parsed?.units_range) {
    result.units = {
      min: toNumber(parsed.units_range.min),
      max: toNumber(parsed.units_range.max)
    };
  }
  
  // Financial ranges
  if (parsed?.price_cap_band) {
    const pcb = parsed.price_cap_band;
    
    if (pcb.budget_min || pcb.budget_max) {
      result.budget = {
        min: toNumber(pcb.budget_min),
        max: toNumber(pcb.budget_max)
      };
    }
    
    if (pcb.cap_min || pcb.cap_max) {
      result.cap_rate = {
        min: toNumber(pcb.cap_min),
        max: toNumber(pcb.cap_max)
      };
    }
    
    if (pcb.psf_min || pcb.psf_max) {
      result.psf = {
        min: toNumber(pcb.psf_min),
        max: toNumber(pcb.psf_max)
      };
    }
  }
  
  // Build year
  if (parsed?.build_year) {
    result.build_year = {
      after: toNumber(parsed.build_year.after),
      before: toNumber(parsed.build_year.before)
    };
  }
  
  return result;
}

export function computeCoverage(mandate: UniversalMandate): number {
  let score = 0;
  
  if (mandate.intent && mandate.intent !== 'other') score += 20;
  if (mandate.asset_type) score += 15;
  if (mandate.market && (mandate.market.city || mandate.market.metro || mandate.market.state)) score += 20;
  if (mandate.size_sf?.min || mandate.size_sf?.max || mandate.units?.min || mandate.units?.max) score += 15;
  if (mandate.budget?.min || mandate.budget?.max || mandate.cap_rate?.min || mandate.psf?.min) score += 15;
  if (mandate.timing?.months_to_event) score += 10;
  if (mandate.role) score += 5;
  
  return Math.min(100, score);
}