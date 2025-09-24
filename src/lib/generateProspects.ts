import { type UniversalMandate, type UniversalIntent } from './normalizeUniversal';

interface ProspectCard {
  id: string;
  title: string;
  matchReason: string;
  city?: string;
  state?: string;
  size_sf?: number;
  units?: number;
  price_estimate?: string;
  built_year?: number;
  badges?: string[];
  contact?: {
    email: string;
    phone: string;
  };
  outreach?: {
    email: 'green' | 'red';
    sms: 'green' | 'red';
    call: 'green' | 'red';
    vm: 'green' | 'red';
  };
  [key: string]: any; // For intent-specific fields
}

// Seeded random number generator for deterministic results
class SeededRandom {
  private seed: number;
  
  constructor(seed: string) {
    this.seed = this.hashString(seed);
  }
  
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

const CITIES = [
  { city: 'Atlanta', state: 'GA' },
  { city: 'Austin', state: 'TX' },
  { city: 'Charlotte', state: 'NC' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Dallas', state: 'TX' },
  { city: 'Denver', state: 'CO' },
  { city: 'Houston', state: 'TX' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'Miami', state: 'FL' },
  { city: 'Nashville', state: 'TN' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'San Diego', state: 'CA' },
];

const FIRST_NAMES = ['Alex', 'Jordan', 'Morgan', 'Casey', 'Taylor', 'Blake', 'Cameron', 'Riley', 'Avery', 'Quinn'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const DOMAINS = ['realty.com', 'properties.net', 'capital.org', 'investments.co', 'holdings.biz', 'group.com'];

function generateBaseProspect(rng: SeededRandom, mandate: UniversalMandate): Partial<ProspectCard> {
  const location = mandate.market?.city ? 
    { city: mandate.market.city, state: mandate.market.state } :
    rng.choice(CITIES);
  
  const firstName = rng.choice(FIRST_NAMES);
  const lastName = rng.choice(LAST_NAMES);
  const domain = rng.choice(DOMAINS);
  
  const size_sf = mandate.size_sf?.min ? 
    rng.nextInt(mandate.size_sf.min, mandate.size_sf.max || mandate.size_sf.min * 2) :
    rng.nextInt(10000, 200000);
    
  const units = mandate.units?.min ?
    rng.nextInt(mandate.units.min, mandate.units.max || mandate.units.min * 2) :
    rng.nextInt(20, 300);
  
  return {
    ...location,
    size_sf,
    units,
    built_year: rng.nextInt(1980, 2020),
    contact: {
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      phone: `(${rng.nextInt(200, 999)}) ${rng.nextInt(200, 999)}-${rng.nextInt(1000, 9999)}`
    },
    outreach: {
      email: rng.next() > 0.3 ? 'green' : 'red',
      sms: rng.next() > 0.4 ? 'green' : 'red',
      call: rng.next() > 0.5 ? 'green' : 'red', 
      vm: rng.next() > 0.7 ? 'green' : 'red'
    }
  };
}

function generateIntentSpecificFields(intent: UniversalIntent, rng: SeededRandom, mandate: UniversalMandate): Partial<ProspectCard> {
  const fields: Partial<ProspectCard> = {};
  
  switch (intent) {
    case 'refinance':
    case 'cash_out_refinance':
      fields.title = `Maturing loan in ${mandate.timing?.months_to_event || rng.nextInt(3, 12)} months`;
      fields.lender = rng.choice(['Wells Fargo', 'JPMorgan Chase', 'Bank of America', 'MockBank Capital']);
      fields.current_rate = `${rng.nextInt(350, 750) / 100}%`;
      fields.balance = `$${rng.nextInt(2, 50)}M`;
      fields.dscr = `${rng.nextInt(115, 180) / 100}x`;
      fields.matchReason = `Current ${fields.current_rate} loan with ${fields.lender} maturing soon. DSCR: ${fields.dscr}`;
      break;
      
    case 'mortgage_origination':
      fields.title = 'Debt quote target';
      fields.ltv_target = `${rng.nextInt(65, 80)}%`;
      fields.rate_target = `${rng.nextInt(450, 650) / 100}%`;
      fields.term_years = rng.nextInt(5, 30);
      fields.matchReason = `Seeking ${fields.ltv_target} LTV at ${fields.rate_target} for ${fields.term_years}-year term`;
      break;
      
    case 'mezz_loan':
      fields.title = 'Mezz capital';
      fields.tranche_size = `$${rng.nextInt(2, 15)}M`;
      fields.blended_cost = `${rng.nextInt(800, 1400) / 100}%`;
      fields.matchReason = `Mezz tranche ${fields.tranche_size} at ${fields.blended_cost} blended cost`;
      break;
      
    case 'preferred_equity':
    case 'preferred_equity_conversion':
      fields.title = intent === 'preferred_equity_conversion' ? 'Pref equity conversion' : 'Pref equity';
      fields.coupon = `${rng.nextInt(800, 1200) / 100}%`;
      fields.position = `$${rng.nextInt(3, 20)}M`;
      if (intent === 'preferred_equity_conversion') {
        fields.convert_terms = `Convert to ${rng.nextInt(15, 35)}% common equity`;
        fields.matchReason = `${fields.position} pref position seeking conversion: ${fields.convert_terms}`;
      } else {
        fields.matchReason = `${fields.position} preferred equity at ${fields.coupon} coupon`;
      }
      break;
      
    case 'equity_raise':
    case 'syndication':
    case 'joint_venture':
      fields.title = intent === 'joint_venture' ? 'JV partnership' : 'Equity/Syndication';
      fields.check_size = `$${rng.nextInt(1, 10)}M`;
      fields.ownership_target = `${rng.nextInt(10, 40)}%`;
      fields.matchReason = `Seeking ${fields.check_size} equity for ${fields.ownership_target} ownership`;
      break;
      
    case 'ground_lease':
      fields.title = 'Long-term land lease';
      fields.term_years = rng.nextInt(50, 99);
      fields.rent_step = `${rng.nextInt(15, 35)}yr`;
      fields.acres = `${rng.nextInt(2, 50)} acres`;
      fields.zoning = rng.choice(['C-2', 'M-1', 'PUD', 'R-3', 'MU-1']);
      fields.matchReason = `${fields.acres} ground lease, ${fields.term_years}yr term, steps every ${fields.rent_step}`;
      break;
      
    case 'lease_agreement':
      fields.title = 'Tenant requirement';
      fields.sf_range = `${rng.nextInt(5, 50)}k SF`;
      fields.psf_target = `$${rng.nextInt(15, 65)}`;
      fields.term_years = rng.nextInt(3, 15);
      fields.matchReason = `${fields.sf_range} tenant seeking ${fields.term_years}-year lease at ${fields.psf_target}/SF`;
      break;
      
    case 'lease_renewal':
    case 'lease_termination':
    case 'sublease':
    case 'lease_surrender':
      const action = intent.replace('lease_', '');
      fields.title = `Lease ${action}`;
      fields.remaining_term = `${rng.nextInt(1, 8)} years`;
      fields.penalties = intent === 'lease_termination' ? `$${rng.nextInt(50, 500)}k` : 'None';
      fields.matchReason = `${action} with ${fields.remaining_term} remaining${fields.penalties !== 'None' ? `, penalty: ${fields.penalties}` : ''}`;
      break;
      
    case 'ti_work_letter':
      fields.title = 'TI/Work Letter';
      fields.allowance_psf = `$${rng.nextInt(25, 85)}/SF`;
      fields.scope_summary = rng.choice(['Standard buildout', 'Heavy electrical', 'Lab conversion', 'Open office', 'Medical suites']);
      fields.matchReason = `TI allowance ${fields.allowance_psf} for ${fields.scope_summary.toLowerCase()}`;
      break;
      
    case 'management_contract':
    case 'service_contract':
      fields.title = intent === 'management_contract' ? 'Property management' : 'Service contract';
      fields.scope = intent === 'management_contract' ? 'Full service PM' : rng.choice(['Janitorial', 'Security', 'Landscaping', 'HVAC']);
      fields.monthly_fee = `$${rng.nextInt(5, 50)}k/mo`;
      fields.matchReason = `${fields.scope} contract, ${fields.monthly_fee}`;
      break;
      
    case 'cam_reconciliation':
      fields.title = 'CAM pass-through';
      fields.last_year_recoveries = `$${rng.nextInt(100, 800)}k`;
      fields.true_up_due = rng.choice(['Q1 2024', 'Q2 2024', 'Q3 2024', 'Overdue']);
      fields.matchReason = `CAM reconciliation ${fields.last_year_recoveries} recovered, ${fields.true_up_due} true-up`;
      break;
      
    case 'construction_contract':
    case 'subcontract':
    case 'sitework_subcontract':
      const contractType = intent === 'construction_contract' ? 'GC' : 'Subcontract';
      fields.title = `${contractType} agreement`;
      fields.scope = rng.choice(['Core & shell', 'TI buildout', 'Site prep', 'MEP', 'Structural']);
      fields.contract_value = `$${rng.nextInt(500, 15000)}k`;
      fields.retainage = `${rng.nextInt(5, 10)}%`;
      fields.matchReason = `${fields.scope} ${contractType.toLowerCase()}, ${fields.contract_value} value, ${fields.retainage} retainage`;
      break;
      
    case 'change_order':
      fields.title = 'Change Order';
      fields.add_scope = rng.choice(['HVAC upgrade', 'Additional electrical', 'Finish upgrade', 'Site modification']);
      fields.delta_cost = `+$${rng.nextInt(50, 500)}k`;
      fields.schedule_days = `+${rng.nextInt(5, 45)} days`;
      fields.matchReason = `${fields.add_scope}: ${fields.delta_cost}, ${fields.schedule_days}`;
      break;
      
    case 'construction_draw':
    case 'disbursement_requisition':
      fields.title = intent === 'construction_draw' ? 'Draw request' : 'Disbursement requisition';
      fields.period = `Month ${rng.nextInt(1, 18)}`;
      fields.inspector = rng.choice(['3rd party', 'Lender', 'Internal', 'Architect']);
      fields.approved_pct = `${rng.nextInt(85, 100)}%`;
      fields.matchReason = `${fields.period} ${intent.replace('_', ' ')}, ${fields.approved_pct} approved by ${fields.inspector.toLowerCase()}`;
      break;
      
    case '1031_exchange':
      fields.title = '1031 timeline';
      fields.id_days = mandate.timing?.months_to_event ? Math.round(mandate.timing.months_to_event * 30) : rng.nextInt(20, 45);
      fields.exchange_deadline = `${Math.round(fields.id_days * 4)} days`;
      fields.matchReason = `1031 exchange: ${fields.id_days} days to identify, ${fields.exchange_deadline} total deadline`;
      break;
      
    case 'tax_credit_equity':
      fields.title = 'Tax credit equity';
      fields.program = rng.choice(['LIHTC', 'Historic', 'New Markets', 'Opportunity Zone']);
      fields.equity_pricing = `$${rng.nextInt(85, 115)}/credit`;
      fields.matchReason = `${fields.program} tax credit equity at ${fields.equity_pricing}`;
      break;
      
    case 'rofr':
    case 'option_agreement':
      fields.title = intent === 'rofr' ? 'ROFR' : 'Option agreement';
      fields.window_days = rng.nextInt(30, 180);
      fields.strike_terms = `$${rng.nextInt(50, 500)}/SF`;
      fields.matchReason = `${fields.window_days}-day ${intent.replace('_', ' ')} at ${fields.strike_terms}`;
      break;
      
    case 'foreclosure':
    case 'workout_modification':
    case 'deed_in_lieu':
      fields.title = intent === 'foreclosure' ? 'Foreclosure sale' : 
                   intent === 'workout_modification' ? 'Workout modification' : 'Deed in lieu';
      if (intent === 'workout_modification') {
        fields.new_rate = `${rng.nextInt(400, 800) / 100}%`;
        fields.forbear_months = rng.nextInt(6, 24);
        fields.matchReason = `Workout: ${fields.new_rate} rate, ${fields.forbear_months}mo forbearance`;
      } else {
        fields.deficiency_waiver = rng.next() > 0.5;
        fields.matchReason = `Distressed transfer${fields.deficiency_waiver ? ' with deficiency waiver' : ''}`;
      }
      fields.badges = ['Distressed'];
      break;
      
    default:
      fields.title = 'Property opportunity';
      fields.matchReason = 'Matches your criteria based on market and asset type';
  }
  
  return fields;
}

export function generateProspects(mandate: UniversalMandate, originalText: string, count: number = 12): ProspectCard[] {
  const seedString = `${mandate.intent}-${originalText}-${mandate.asset_type || 'generic'}`;
  const rng = new SeededRandom(seedString);
  const prospects: ProspectCard[] = [];
  
  for (let i = 0; i < count; i++) {
    const base = generateBaseProspect(rng, mandate);
    const intentFields = generateIntentSpecificFields(mandate.intent, rng, mandate);
    
    const prospect: ProspectCard = {
      id: `prospect-${i + 1}`,
      title: 'Property opportunity',
      matchReason: 'Matches your criteria',
      ...base,
      ...intentFields,
      badges: intentFields.badges || (rng.next() > 0.7 ? [rng.choice(['Urgent', 'Premium', 'Exclusive'])] : [])
    };
    
    prospects.push(prospect);
  }
  
  return prospects;
}