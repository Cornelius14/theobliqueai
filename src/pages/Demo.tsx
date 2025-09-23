import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Menu, X, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Data structures for parsing and CRM
interface ParsedBuyBox {
  intent: "acquisition" | "lease" | "refinance" | "title";
  asset_type: "industrial" | "warehouse" | "multifamily" | "retail" | "land" | "data center" | null;
  market: { city: string | null; state: string | null; metro: string | null };
  size_range_sf: { min?: number; max?: number } | null;
  units_range: { min?: number; max?: number } | null;
  price_cap_band: { psf_min?: number; psf_max?: number; cap_min?: number; cap_max?: number; per_door_max?: number } | null;
  build_year: { after?: number; before?: number } | null;
  timing: { months_to_event?: number } | null;
  flags: { loan_maturing?: boolean; owner_age_65_plus?: boolean; off_market?: boolean };
  coverage_score: number;
  missing_fields: string[];
}

interface Prospect {
  id: string;
  name: string;
  asset_type: string;
  market_city: string;
  market_state: string;
  size_sf?: number;
  units?: number;
  price_psf?: number;
  cap_rate?: number;
  build_year?: number;
  flags: string[];
  contact: {
    owner: string;
    email: string;
    phone: string;
  };
  outreach: {
    email: "reached" | "no-answer";
    sms: "reached" | "no-answer";
    vm: "left" | "none";
    call: "reached" | "no-answer";
  };
}

const Demo = () => {
  const [criteria, setCriteria] = useState('');
  const [parsedData, setParsedData] = useState<ParsedBuyBox | null>(null);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [qualified, setQualified] = useState<Prospect[]>([]);
  const [meetings, setMeetings] = useState<Prospect[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const examples = [
    "Find value-add multifamily, 20–40 units, in Charlotte, built 1980–2005, cap ≥ 6.5%, ≤ $180k/door.",
    "Find 18–22k SF retail for lease in Miami Beach, $180–$220 PSF, frontage ≥ 60 ft.",
    "Find Dallas multifamily owners with loans maturing in 3–6 months, 50–150 units, LTV ≥ 65% for refinance.",
    "Find Travis County, TX properties with recent deed filings likely to need title insurance in ≤45 days."
  ];

  // Synonym maps and patterns
  const synonyms = {
    intent: {
      acquisition: ["buy", "acquire", "purchase", "looking to buy"],
      lease: ["for lease", "lease", "rent"],
      refinance: ["refi", "refinance"],
      title: ["title", "escrow", "deed", "closing"]
    },
    asset_type: {
      industrial: ["industrial", "warehouse", "plant", "logistics"],
      multifamily: ["multifamily", "apartments", "units"],
      retail: ["retail", "shop", "storefront"],
      "data center": ["data center", "datacenter"]
    }
  };

  const metros = ["atlanta", "nashville", "miami", "dallas", "charlotte", "nyc", "new york", "houston", "austin", "denver", "phoenix"];

  // Enhanced parser function
  const normalize = (str: string) => str.replace(/,/g, '').replace(/k$/i, '000');
  
  const parseCriteria = (text: string): ParsedBuyBox => {
    const lower = text.toLowerCase();
    let coverage_score = 0;
    const missing_fields: string[] = [];
    
    // Intent detection
    let intent: ParsedBuyBox["intent"] = "acquisition";
    for (const [key, values] of Object.entries(synonyms.intent)) {
      if (values.some(v => lower.includes(v))) {
        intent = key as ParsedBuyBox["intent"];
        coverage_score += 15;
        break;
      }
    }
    
    // Asset type detection
    let asset_type: ParsedBuyBox["asset_type"] = null;
    for (const [key, values] of Object.entries(synonyms.asset_type)) {
      if (values.some(v => lower.includes(v))) {
        asset_type = key as ParsedBuyBox["asset_type"];
        coverage_score += 20;
        break;
      }
    }
    if (!asset_type) missing_fields.push("asset type");
    
    // Market detection - improved patterns
    const market: ParsedBuyBox["market"] = { city: null, state: null, metro: null };
    const cityStatePattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*([A-Z]{2})\b/g;
    const cityStateAbbr = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+([A-Z]{2})\b/g;
    
    const cityStateMatch = text.match(cityStatePattern) || text.match(cityStateAbbr);
    const metroMatch = metros.find(metro => lower.includes(metro));
    
    if (cityStateMatch) {
      const parts = cityStateMatch[0].replace(',', '').split(/\s+/);
      market.state = parts[parts.length - 1];
      market.city = parts.slice(0, -1).join(' ');
      coverage_score += 25;
    } else if (metroMatch) {
      market.metro = metroMatch;
      coverage_score += 15;
    } else {
      missing_fields.push("market/location");
    }
    
    // Size detection - improved patterns
    let size_range_sf: ParsedBuyBox["size_range_sf"] = null;
    let units_range: ParsedBuyBox["units_range"] = null;
    
    // SF patterns: "18–22k SF", "60k-120k sf", "100,000 sf"
    const sfPattern = /(\d{1,3}(?:,\d{3})*|\d+k?)\s*[-–—]\s*(\d{1,3}(?:,\d{3})*|\d+k?)\s*(?:sf|sq\.?\s*ft|square\s*feet)/i;
    const singleSfPattern = /(\d{1,3}(?:,\d{3})*|\d+k?)\s*(?:sf|sq\.?\s*ft|square\s*feet)/i;
    const unitsPattern = /(\d{1,3})\s*[-–—]\s*(\d{1,3})\s*units/i;
    
    const sfMatch = text.match(sfPattern);
    const singleSf = text.match(singleSfPattern);
    const unitsMatch = text.match(unitsPattern);
    
    if (sfMatch) {
      const min = parseInt(normalize(sfMatch[1]));
      const max = parseInt(normalize(sfMatch[2]));
      size_range_sf = { min, max };
      coverage_score += 25;
    } else if (singleSf && !sfMatch) {
      const size = parseInt(normalize(singleSf[1]));
      size_range_sf = { min: Math.floor(size * 0.8), max: Math.floor(size * 1.2) };
      coverage_score += 15;
    } else if (unitsMatch) {
      units_range = { min: parseInt(unitsMatch[1]), max: parseInt(unitsMatch[2]) };
      coverage_score += 25;
    } else {
      missing_fields.push("size range");
    }
    
    // Price detection - improved patterns
    let price_cap_band: ParsedBuyBox["price_cap_band"] = null;
    const psfPattern = /\$?(\d+)\s*[-–—]\s*\$?(\d+)\s*(?:psf|per\s*sf)/i;
    const capPattern = /cap\s*[≥>=]\s*(\d+(?:\.\d+)?)%/i;
    const doorPattern = /[≤<=]?\s*\$?(\d{2,4})k\/door/i;
    
    const psfMatch = text.match(psfPattern);
    const capMatch = text.match(capPattern);
    const doorMatch = text.match(doorPattern);
    
    if (psfMatch || capMatch || doorMatch) {
      price_cap_band = {};
      if (psfMatch) {
        price_cap_band.psf_min = parseInt(psfMatch[1]);
        price_cap_band.psf_max = parseInt(psfMatch[2]);
      }
      if (capMatch) {
        price_cap_band.cap_min = parseFloat(capMatch[1]);
      }
      if (doorMatch) {
        price_cap_band.per_door_max = parseInt(doorMatch[1]) * 1000;
      }
      coverage_score += 15;
    }
    
    // Build year detection - improved
    let build_year: ParsedBuyBox["build_year"] = null;
    const buildRangePattern = /(?:built\s*)?(\d{4})\s*[-–—]\s*(\d{4})/i;
    const buildAfterPattern = /(?:built\s*|after\s*)(\d{4})/i;
    
    const buildRangeMatch = text.match(buildRangePattern);
    const buildAfterMatch = text.match(buildAfterPattern);
    
    if (buildRangeMatch) {
      build_year = { after: parseInt(buildRangeMatch[1]), before: parseInt(buildRangeMatch[2]) };
      coverage_score += 10;
    } else if (buildAfterMatch) {
      build_year = { after: parseInt(buildAfterMatch[1]) };
      coverage_score += 10;
    }
    
    // Timing detection
    let timing: ParsedBuyBox["timing"] = null;
    const timingPattern = /(?:maturing|closing|need)\s*in\s*(\d+)[-–—]?(\d+)?\s*months?/i;
    
    const timingMatch = text.match(timingPattern);
    if (timingMatch) {
      timing = { months_to_event: parseInt(timingMatch[1]) };
      coverage_score += 10;
    }
    
    // Flags detection - improved
    const flags: ParsedBuyBox["flags"] = {
      loan_maturing: /loan[s]?\s*(?:matur|due)/i.test(text),
      owner_age_65_plus: /owner[s]?\s*(?:above|over|\+)\s*65|65\+?\s*owner/i.test(text),
      off_market: /off[-\s]?market/i.test(text)
    };
    
    // Final coverage calculation
    if (Object.values(flags).some(Boolean)) coverage_score += 5;
    if (timing) coverage_score += 5;
    
    return {
      intent,
      asset_type,
      market,
      size_range_sf,
      units_range,
      price_cap_band,
      build_year,
      timing,
      flags,
      coverage_score: Math.min(100, coverage_score),
      missing_fields
    };
  };

  const handleParse = () => {
    if (criteria.trim()) {
      const parsed = parseCriteria(criteria);
      setParsedData(parsed);
    }
  };

  const handleUseExample = (example: string) => {
    setCriteria(example);
  };

  // Generate names and contacts
  const generateContact = () => {
    const firstNames = ['John', 'Sarah', 'Michael', 'Lisa', 'David', 'Jennifer', 'Robert', 'Ashley', 'James', 'Maria'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Wilson'];
    const domains = ['propco.com', 'realestate.net', 'investments.com', 'holdings.org', 'capital.biz'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    return {
      owner: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
    };
  };

  // Generate mock prospects based on parsed criteria
  const generateMockProspects = (): Prospect[] => {
    if (!parsedData) return [];
    
    const prospects: Prospect[] = [];
    const cities = parsedData.market.city ? [parsedData.market.city] : 
                   parsedData.market.metro === 'charlotte' ? ['Charlotte', 'Gastonia', 'Concord'] :
                   parsedData.market.metro === 'dallas' ? ['Dallas', 'Plano', 'Irving'] :
                   parsedData.market.metro === 'miami' ? ['Miami', 'Miami Beach', 'Aventura'] :
                   ['Atlanta', 'Charlotte', 'Dallas'];
    
    const states = parsedData.market.state ? [parsedData.market.state] : ['NC', 'TX', 'FL', 'GA'];
    
    for (let i = 0; i < 10; i++) {
      const contact = generateContact();
      const city = cities[Math.floor(Math.random() * cities.length)];
      const state = states[Math.floor(Math.random() * states.length)];
      
      let size_sf, units, price_psf, cap_rate, name;
      
      // Generate size within constraints
      if (parsedData.size_range_sf) {
        const min = parsedData.size_range_sf.min || 10000;
        const max = parsedData.size_range_sf.max || min + 50000;
        size_sf = Math.floor(Math.random() * (max - min) + min);
        name = `${parsedData.asset_type || 'Property'} – ${(size_sf / 1000).toFixed(0)}k SF`;
      } else if (parsedData.units_range) {
        const min = parsedData.units_range.min || 20;
        const max = parsedData.units_range.max || min + 30;
        units = Math.floor(Math.random() * (max - min) + min);
        name = `${parsedData.asset_type || 'Multifamily'} – ${units} units`;
      } else {
        size_sf = 25000 + Math.floor(Math.random() * 50000);
        name = `${parsedData.asset_type || 'Property'} – ${(size_sf / 1000).toFixed(0)}k SF`;
      }
      
      // Generate pricing within constraints
      if (parsedData.price_cap_band?.psf_min && parsedData.price_cap_band?.psf_max) {
        price_psf = Math.floor(Math.random() * (parsedData.price_cap_band.psf_max - parsedData.price_cap_band.psf_min) + parsedData.price_cap_band.psf_min);
      } else if (parsedData.price_cap_band?.cap_min) {
        cap_rate = parsedData.price_cap_band.cap_min + Math.random() * 2;
      } else {
        price_psf = 80 + Math.floor(Math.random() * 120);
      }
      
      // Generate flags
      const flags: string[] = [];
      if (parsedData.flags.loan_maturing) flags.push('Loan maturing');
      if (parsedData.flags.owner_age_65_plus && Math.random() > 0.7) flags.push('Owner 65+');
      if (parsedData.flags.off_market && Math.random() > 0.8) flags.push('Off-market');
      
      // Generate outreach status
      const outreachOptions = ['reached', 'no-answer'] as const;
      const vmOptions = ['left', 'none'] as const;
      
      prospects.push({
        id: String(i + 1),
        name,
        asset_type: parsedData.asset_type || 'industrial',
        market_city: city,
        market_state: state,
        size_sf,
        units,
        price_psf,
        cap_rate,
        build_year: parsedData.build_year?.after ? parsedData.build_year.after + Math.floor(Math.random() * 20) : 1990 + Math.floor(Math.random() * 30),
        flags,
        contact,
        outreach: {
          email: outreachOptions[Math.floor(Math.random() * 2)],
          sms: outreachOptions[Math.floor(Math.random() * 2)],
          vm: vmOptions[Math.floor(Math.random() * 2)],
          call: outreachOptions[Math.floor(Math.random() * 2)]
        }
      });
    }
    
    return prospects;
  };

  const handleSendToCRM = () => {
    if (!parsedData) return;
    
    if (parsedData.coverage_score < 70) {
      alert("Add market + size to generate accurate prospects.");
      return;
    }
    
    const mockProspects = generateMockProspects();
    setProspects(mockProspects);
  };

  const handleReset = () => {
    setCriteria('');
    setParsedData(null);
    setProspects([]);
    setQualified([]);
    setMeetings([]);
  };

  const moveProspect = (id: string, from: Prospect[], to: Prospect[], setFrom: (prospects: Prospect[]) => void, setTo: (prospects: Prospect[]) => void) => {
    const prospect = from.find(p => p.id === id);
    if (prospect) {
      setFrom(from.filter(p => p.id !== id));
      setTo([...to, prospect]);
    }
  };

  const removeProspect = (id: string, from: Prospect[], setFrom: (prospects: Prospect[]) => void) => {
    setFrom(from.filter(p => p.id !== id));
  };

  const handleSimulate = () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    
    const interval = setInterval(() => {
      // Move 2 prospects to qualified
      setProspects(prev => {
        if (prev.length >= 2) {
          const toMove = prev.slice(0, 2);
          setQualified(curr => [...curr, ...toMove]);
          return prev.slice(2);
        }
        return prev;
      });
      
      // Move 1 qualified to meetings
      setQualified(prev => {
        if (prev.length >= 1) {
          const toMove = prev[0];
          setMeetings(curr => [...curr, toMove]);
          return prev.slice(1);
        }
        return prev;
      });
    }, 3000);

    // Stop simulation after 10 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsSimulating(false);
    }, 10000);
  };

  const handleClearDemo = () => {
    setProspects([]);
    setQualified([]);
    setMeetings([]);
    setIsSimulating(false);
  };

  const handleNavClick = (anchor: string) => {
    window.location.href = `/#${anchor}`;
  };

  // Render prospect cards
  const renderProspectList = (
    list: Prospect[], 
    onMove: (id: string) => void, 
    onRemove: (id: string) => void,
    moveLabel: string,
    moveIcon: string
  ) => (
    <div className="space-y-3">
      {list.map((prospect) => (
        <Card key={prospect.id} className="p-4 rounded-xl ring-1 ring-border">
          <div className="space-y-3">
            {/* Title */}
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-sm">
                {prospect.asset_type?.charAt(0).toUpperCase() + prospect.asset_type?.slice(1)} — {prospect.size_sf ? `${prospect.size_sf.toLocaleString()} SF` : `${prospect.units} units`} ({prospect.market_city}, {prospect.market_state})
              </h4>
            </div>
            
            {/* Outreach chips - right under title */}
            <div className="flex gap-1">
              <span className={`px-1.5 py-0.5 text-xs rounded ${prospect.outreach.email === 'reached' ? 'bg-green-600/10 text-green-600' : 'bg-red-600/10 text-red-600'}`}>
                email
              </span>
              <span className={`px-1.5 py-0.5 text-xs rounded ${prospect.outreach.sms === 'reached' ? 'bg-green-600/10 text-green-600' : 'bg-red-600/10 text-red-600'}`}>
                sms
              </span>
              <span className={`px-1.5 py-0.5 text-xs rounded ${prospect.outreach.call === 'reached' ? 'bg-green-600/10 text-green-600' : 'bg-red-600/10 text-red-600'}`}>
                call
              </span>
              <span className={`px-1.5 py-0.5 text-xs rounded ${prospect.outreach.vm === 'left' ? 'bg-muted text-muted-foreground' : 'bg-red-600/10 text-red-600'}`}>
                vm
              </span>
            </div>
            
            {/* Meta row */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {prospect.price_psf && <span>${prospect.price_psf} PSF</span>}
              {prospect.cap_rate && <span>{prospect.cap_rate.toFixed(1)}% Cap</span>}
              {prospect.build_year && <span>Built {prospect.build_year}</span>}
              {prospect.flags.length > 0 && (
                <div className="flex gap-1">
                  {prospect.flags.map((flag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0.5">
                      {flag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {/* Contact row */}
            <div className="text-xs text-muted-foreground font-mono">
              {prospect.contact.email} · {prospect.contact.phone}
            </div>
            
            {/* Footer actions */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="default" onClick={() => onMove(prospect.id)} className="text-xs">
                {moveLabel}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onRemove(prospect.id)} className="text-xs">
                Remove
              </Button>
            </div>
          </div>
        </Card>
      ))}
      
      {list.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No prospects yet
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Slim top bar */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => handleNavClick('product')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to site
          </button>
          <h1 className="text-xl font-medium">Live Demo</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        
        {/* Deal Finder Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-medium mb-2">Deal Finder</h2>
            <p className="text-muted-foreground">Parse investment criteria and extract key parameters</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Input */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Investment Criteria</label>
                <Textarea
                  value={criteria}
                  onChange={(e) => setCriteria(e.target.value)}
                  placeholder="Type your criteria…"
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleParse} disabled={!criteria.trim()}>
                  Parse
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Menu size={16} />
                      Use example
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-80">
                    {examples.map((example, index) => (
                      <DropdownMenuItem 
                        key={index}
                        onClick={() => handleUseExample(example)}
                        className="whitespace-normal p-3"
                      >
                        {example}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Right: Parsed Results */}
            <div>
              {parsedData ? (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      📋 Parsed Buy-Box
                      <span className={`px-2 py-1 text-xs rounded ${parsedData.coverage_score >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        Coverage: {parsedData.coverage_score}%
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {parsedData.coverage_score < 70 && (
                      <div className="text-sm text-yellow-700 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                        Add missing fields: {parsedData.missing_fields.join(', ')}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Intent:</span> {parsedData.intent}</div>
                      <div><span className="font-medium">Asset:</span> {parsedData.asset_type || 'Not specified'}</div>
                      <div><span className="font-medium">Market:</span> {
                        parsedData.market.city && parsedData.market.state ? `${parsedData.market.city}, ${parsedData.market.state}` :
                        parsedData.market.metro ? parsedData.market.metro : 'Not specified'
                      }</div>
                      <div><span className="font-medium">Size:</span> {
                        parsedData.size_range_sf ? `${parsedData.size_range_sf.min?.toLocaleString()}-${parsedData.size_range_sf.max?.toLocaleString()} SF` :
                        parsedData.units_range ? `${parsedData.units_range.min}-${parsedData.units_range.max} units` : 'Not specified'
                      }</div>
                      <div><span className="font-medium">Price/Cap:</span> {
                        parsedData.price_cap_band ? 
                          (parsedData.price_cap_band.psf_min && parsedData.price_cap_band.psf_max ? `$${parsedData.price_cap_band.psf_min}-$${parsedData.price_cap_band.psf_max} PSF` :
                           parsedData.price_cap_band.cap_min ? `Cap ≥ ${parsedData.price_cap_band.cap_min}%` :
                           parsedData.price_cap_band.per_door_max ? `≤$${parsedData.price_cap_band.per_door_max.toLocaleString()}/door` : 'Specified') : 'Not specified'
                      }</div>
                      <div><span className="font-medium">Timing:</span> {
                        parsedData.timing?.months_to_event ? `${parsedData.timing.months_to_event} months` : 'Not specified'
                      }</div>
                    </div>
                    
                    {(parsedData.flags.loan_maturing || parsedData.flags.owner_age_65_plus || parsedData.flags.off_market) && (
                      <div className="pt-2 border-t">
                        <span className="font-medium text-sm">Flags: </span>
                        <div className="flex gap-1 mt-1">
                          {parsedData.flags.loan_maturing && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs rounded">Loan maturing</span>}
                          {parsedData.flags.owner_age_65_plus && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs rounded">Owner 65+</span>}
                          {parsedData.flags.off_market && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs rounded">Off-market</span>}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t flex gap-2">
                      <Button onClick={handleSendToCRM} className="flex-1">
                        📤 Send to CRM
                      </Button>
                      <Button variant="outline" onClick={handleReset} className="flex-1">
                        🔄 Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center mt-6">
                  <CardContent className="text-center text-muted-foreground">
                    <p>Enter criteria above and click Parse to see extracted parameters</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* CRM Section */}
        <section>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-medium mb-2">CRM Pipeline</h2>
              <p className="text-muted-foreground">Manage prospects through qualification to booking</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSimulate} 
                disabled={isSimulating || (prospects.length === 0 && qualified.length === 0)}
                variant="outline"
              >
                {isSimulating ? 'Simulating...' : 'Simulate'}
              </Button>
              <Button 
                onClick={handleClearDemo}
                disabled={prospects.length === 0 && qualified.length === 0 && meetings.length === 0}
                variant="outline"
              >
                Clear demo
              </Button>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Prospects Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-medium">Prospects</h3>
                <Badge variant="secondary">{prospects.length}</Badge>
              </div>
              {renderProspectList(prospects, (id) => moveProspect(id, prospects, qualified, setProspects, setQualified), (id) => removeProspect(id, prospects, setProspects), "Qualify", "🎯")}
            </div>

            {/* Qualified Targets Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-medium">Qualified Targets</h3>
                <Badge variant="secondary">{qualified.length}</Badge>
              </div>
              {renderProspectList(qualified, (id) => moveProspect(id, qualified, meetings, setQualified, setMeetings), (id) => removeProspect(id, qualified, setQualified), "Book", "📅")}
            </div>

            {/* Meetings Booked Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-medium">Meetings Booked</h3>
                <Badge variant="secondary">{meetings.length}</Badge>
              </div>
              {renderProspectList(meetings, () => {}, (id) => removeProspect(id, meetings, setMeetings), "", "")}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Demo;