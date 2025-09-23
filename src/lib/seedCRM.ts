import { type Parsed } from './localParser';

interface Prospect {
  id: string;
  title: string;
  size: string;
  location: string;
  price: string;
  buildYear?: number;
  contact: string;
  outreach: {
    email: 'reached' | 'no-answer';
    sms: 'reached' | 'no-answer';
    call: 'reached' | 'no-answer';
    vm: 'left' | 'none';
  };
  flags: string[];
  assetType: string;
}

const ASSET_EMOJIS: Record<string, string> = {
  'industrial': '🏭',
  'warehouse': '🏭',
  'multifamily': '🏘️',
  'retail': '🏬',
  'office': '🏢',
  'land': '🧱',
  'data center': '🏢',
  'single-family': '🏠'
};

const ATLANTA_SUBURBS = ['Marietta', 'Alpharetta', 'Roswell', 'Duluth', 'Lawrenceville', 'Kennesaw', 'Smyrna', 'Sandy Springs'];
const SAMPLE_COMPANIES = ['PropCo', 'RealtyGroup', 'InvestCorp', 'AssetFund', 'CapitalRE', 'PropertyTrust', 'RealtyLLC', 'InvestGroup'];
const SAMPLE_FIRST_NAMES = ['John', 'Sarah', 'Michael', 'Jessica', 'David', 'Ashley', 'Robert', 'Emily', 'James', 'Amanda'];
const SAMPLE_LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomInRange(min: number | null, max: number | null, defaultMin: number, defaultMax: number): number {
  const actualMin = min ?? defaultMin;
  const actualMax = max ?? defaultMax;
  return Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin;
}

function generateContact(): { contact: string; outreach: Prospect['outreach'] } {
  const firstName = getRandomElement(SAMPLE_FIRST_NAMES);
  const lastName = getRandomElement(SAMPLE_LAST_NAMES);
  const company = getRandomElement(SAMPLE_COMPANIES);
  const phone = `(404) 555-0${Math.floor(Math.random() * 900) + 100}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase()}.com`;
  
  const outreachStates: ('reached' | 'no-answer')[] = ['reached', 'no-answer'];
  const vmStates: ('left' | 'none')[] = ['left', 'none'];
  
  return {
    contact: `${email} · ${phone}`,
    outreach: {
      email: getRandomElement(outreachStates),
      sms: getRandomElement(outreachStates),
      call: getRandomElement(outreachStates),
      vm: getRandomElement(vmStates)
    }
  };
}

function generateMarket(parsed: Parsed): string {
  if (parsed.market?.city && parsed.market?.state) {
    return `${parsed.market.city}, ${parsed.market.state.toUpperCase()}`;
  }
  
  if (parsed.market?.metro) {
    // If only metro is provided, pick a plausible suburb
    if (parsed.market.metro.toLowerCase().includes('atlanta')) {
      const suburb = getRandomElement(ATLANTA_SUBURBS);
      return `${suburb}, GA`;
    }
    // For other metros, just use the metro name
    return parsed.market.metro;
  }
  
  // Default fallback
  return `${getRandomElement(ATLANTA_SUBURBS)}, GA`;
}

function generateSize(parsed: Parsed): { size: string; sizeValue: number } {
  let sizeValue: number;
  let unit: string;
  
  if (parsed.units_range && (parsed.asset_type === 'multifamily' || parsed.asset_type === 'single-family')) {
    // Generate units for multifamily/single-family
    sizeValue = generateRandomInRange(parsed.units_range.min, parsed.units_range.max, 50, 200);
    unit = 'units';
  } else if (parsed.size_range_sf) {
    // Generate square footage
    sizeValue = generateRandomInRange(parsed.size_range_sf.min, parsed.size_range_sf.max, 10000, 150000);
    unit = 'SF';
  } else {
    // Default size based on asset type
    switch (parsed.asset_type) {
      case 'industrial':
      case 'warehouse':
        sizeValue = generateRandomInRange(null, null, 60000, 120000);
        unit = 'SF';
        break;
      case 'multifamily':
        sizeValue = generateRandomInRange(null, null, 50, 200);
        unit = 'units';
        break;
      case 'retail':
        sizeValue = generateRandomInRange(null, null, 5000, 25000);
        unit = 'SF';
        break;
      default:
        sizeValue = generateRandomInRange(null, null, 10000, 50000);
        unit = 'SF';
    }
  }
  
  const formattedSize = sizeValue >= 1000 ? `${(sizeValue / 1000).toFixed(0)}k` : sizeValue.toString();
  return { size: `${formattedSize} ${unit}`, sizeValue };
}

function generatePrice(parsed: Parsed, sizeValue: number): string {
  const band = parsed.price_cap_band;
  if (!band) return '$2.5M';
  
  if (band.cap_min || band.cap_max) {
    const cap = generateRandomInRange(band.cap_min, band.cap_max, 6, 8);
    return `${cap}% cap`;
  }
  
  if (band.psf_min || band.psf_max) {
    const psf = generateRandomInRange(band.psf_min, band.psf_max, 80, 150);
    return `$${psf}/SF`;
  }
  
  if (band.per_door_max && (parsed.asset_type === 'multifamily' || parsed.asset_type === 'single-family')) {
    const perDoor = generateRandomInRange(null, band.per_door_max, 100000, band.per_door_max);
    return `$${(perDoor / 1000).toFixed(0)}k/door`;
  }
  
  if (band.budget_min || band.budget_max) {
    const budget = generateRandomInRange(band.budget_min, band.budget_max, 2000000, 10000000);
    return `$${(budget / 1000000).toFixed(1)}M`;
  }
  
  // Default pricing based on asset type
  switch (parsed.asset_type) {
    case 'industrial':
    case 'warehouse':
      return `$${Math.floor(Math.random() * 50) + 80}/SF`;
    case 'multifamily':
      return `$${Math.floor(Math.random() * 50) + 150}k/door`;
    case 'retail':
      return `$${Math.floor(Math.random() * 100) + 200}/SF`;
    default:
      return '$2.5M';
  }
}

function generateBuildYear(parsed: Parsed): number | undefined {
  if (!parsed.build_year) return undefined;
  
  const after = parsed.build_year.after || 1980;
  const before = parsed.build_year.before || 2020;
  
  return generateRandomInRange(after, before, after, before);
}

function generateFlags(parsed: Parsed): string[] {
  const flags: string[] = [];
  
  if (parsed.flags?.loan_maturing) {
    flags.push('Loan maturing');
  }
  
  if (parsed.flags?.owner_age_65_plus) {
    flags.push('Owner ≥ 65');
  }
  
  if (parsed.owner_age_min && parsed.owner_age_min !== 65) {
    flags.push(`Owner ≥ ${parsed.owner_age_min}`);
  }
  
  if (parsed.flags?.off_market) {
    flags.push('Off-market');
  }
  
  return flags;
}

export function seedProspects(parsed: Parsed): Prospect[] {
  const prospects: Prospect[] = [];
  const count = Math.floor(Math.random() * 5) + 8; // 8-12 prospects
  
  const assetType = parsed.asset_type || 'industrial';
  const emoji = ASSET_EMOJIS[assetType] || '🏢';
  
  for (let i = 0; i < count; i++) {
    const { size, sizeValue } = generateSize(parsed);
    const location = generateMarket(parsed);
    const price = generatePrice(parsed, sizeValue);
    const buildYear = generateBuildYear(parsed);
    const { contact, outreach } = generateContact();
    const flags = generateFlags(parsed);
    
    const title = `${emoji} ${assetType.charAt(0).toUpperCase() + assetType.slice(1)} — ${size} (${location})`;
    
    prospects.push({
      id: `prospect-${Date.now()}-${i}`,
      title,
      size,
      location,
      price,
      buildYear,
      contact,
      outreach,
      flags,
      assetType
    });
  }
  
  return prospects;
}