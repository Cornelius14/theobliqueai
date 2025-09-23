import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Menu, X, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseBuyBoxLocal, coverageScore, validateLLMResponse, type Parsed } from '@/lib/localParser';
import { getApiBase, setApiBase } from '@/lib/runtimeConfig';

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
  per_door?: number;
  budget?: number;
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

interface ParsedWithCoverage extends Parsed {
  coverage: number;
}

const Demo = () => {
  const [criteria, setCriteria] = useState('');
  const [parsedData, setParsedData] = useState<ParsedWithCoverage | null>(null);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [qualified, setQualified] = useState<Prospect[]>([]);
  const [meetings, setMeetings] = useState<Prospect[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const { toast } = useToast();

  // Asset type emojis for visual consistency  
  const getAssetEmoji = (assetType: string) => {
    const emojis: Record<string, string> = {
      'industrial': '🏭',
      'warehouse': '🏭', 
      'multifamily': '🏘️',
      'retail': '🏢',
      'single-family': '🏠',
      'land': '🏞️',
      'data center': '🏢'
    };
    return emojis[assetType] || '🏢';
  };

  // Generate contact information
  const generateContact = () => {
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Blake', 'Avery', 'Cameron', 'Drew'];
    const lastNames = ['Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
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

  // Generate prospects that STRICTLY match parsed criteria
  const generateMockProspects = (): Prospect[] => {
    if (!parsedData) return [];
    
    const prospects: Prospect[] = [];
    
    // Market mapping
    const getMarketOptions = () => {
      if (parsedData.market.city && parsedData.market.state) {
        return [{ city: parsedData.market.city, state: parsedData.market.state }];
      }
      
      // Metro suburbs mapping
      const metroSuburbs: { [key: string]: Array<{city: string, state: string}> } = {
        'Atlanta': [
          { city: 'Atlanta', state: 'GA' },
          { city: 'Marietta', state: 'GA' },
          { city: 'Sandy Springs', state: 'GA' }
        ],
        'Dallas': [
          { city: 'Dallas', state: 'TX' },
          { city: 'Plano', state: 'TX' },
          { city: 'Irving', state: 'TX' }
        ],
        'Miami': [
          { city: 'Miami', state: 'FL' },
          { city: 'Miami Beach', state: 'FL' },
          { city: 'Aventura', state: 'FL' }
        ],
        'Charlotte': [
          { city: 'Charlotte', state: 'NC' },
          { city: 'Gastonia', state: 'NC' },
          { city: 'Concord', state: 'NC' }
        ],
        'San Francisco': [
          { city: 'San Francisco', state: 'CA' },
          { city: 'Oakland', state: 'CA' },
          { city: 'Palo Alto', state: 'CA' }
        ]
      };
      
      if (parsedData.market.metro && metroSuburbs[parsedData.market.city || '']) {
        return metroSuburbs[parsedData.market.city || ''];
      }
      
      return [{ city: 'Atlanta', state: 'GA' }];
    };

    const marketOptions = getMarketOptions();
    
    for (let i = 0; i < 10; i++) {
      const contact = generateContact();
      const market = marketOptions[Math.floor(Math.random() * marketOptions.length)];
      
      let size_sf: number | undefined;
      let units: number | undefined;
      let name = '';
      
        // Generate size/units within STRICT constraints
        if (parsedData.size_range_sf) {
          const min = parsedData.size_range_sf.min || 10000;
          const max = parsedData.size_range_sf.max || min;
          size_sf = Math.floor(Math.random() * (max - min + 1)) + min;
          
          const assetLabel = parsedData.asset_type === 'warehouse' ? 'Industrial' : 
                            parsedData.asset_type?.charAt(0).toUpperCase() + parsedData.asset_type?.slice(1);
          const emoji = getAssetEmoji(parsedData.asset_type || 'industrial');
          name = `${emoji} ${assetLabel} — ${(size_sf / 1000).toFixed(0)}k SF`;
        } else if (parsedData.units_range) {
          const min = parsedData.units_range.min || 20;
          const max = parsedData.units_range.max || min;
          units = Math.floor(Math.random() * (max - min + 1)) + min;
          const emoji = getAssetEmoji('multifamily');
          name = `${emoji} Multifamily — ${units} units`;
        } else {
          // Default fallback
          size_sf = 50000;
          const emoji = getAssetEmoji(parsedData.asset_type || 'industrial');
          name = `${emoji} ${parsedData.asset_type || 'Industrial'} — 50k SF`;
        }
      
      // Generate pricing within constraints
      let price_psf: number | undefined;
      let cap_rate: number | undefined;
      let per_door: number | undefined;
      let budget: number | undefined;
      
      if (parsedData.price_cap_band) {
        if (parsedData.price_cap_band.psf_min && parsedData.price_cap_band.psf_max) {
          price_psf = Math.floor(Math.random() * (parsedData.price_cap_band.psf_max - parsedData.price_cap_band.psf_min + 1)) + parsedData.price_cap_band.psf_min;
        } else if (parsedData.price_cap_band.cap_min) {
          const capMin = parsedData.price_cap_band.cap_min;
          const capMax = parsedData.price_cap_band.cap_max || capMin + 2;
          cap_rate = capMin + Math.random() * (capMax - capMin);
        } else if (parsedData.price_cap_band.per_door_max && units) {
          per_door = Math.floor(Math.random() * parsedData.price_cap_band.per_door_max * 0.8) + parsedData.price_cap_band.per_door_max * 0.2;
        } else if (parsedData.price_cap_band.budget_min && parsedData.price_cap_band.budget_max) {
          budget = Math.floor(Math.random() * (parsedData.price_cap_band.budget_max - parsedData.price_cap_band.budget_min)) + parsedData.price_cap_band.budget_min;
        }
      }
      
      // Generate build year within constraints
      let build_year: number | undefined;
      if (parsedData.build_year) {
        const afterYear = parsedData.build_year.after || 1980;
        const beforeYear = parsedData.build_year.before || 2024;
        build_year = Math.floor(Math.random() * (beforeYear - afterYear + 1)) + afterYear;
      }
      
      // Generate flags
      const flags: string[] = [];
      if (parsedData.flags.loan_maturing) flags.push('Loan maturing');
      if (parsedData.flags.owner_age_65_plus || (parsedData.owner_age_min && parsedData.owner_age_min >= 65)) {
        flags.push(`Owner ≥ ${parsedData.owner_age_min || 65}`);
      } else if (parsedData.owner_age_min) {
        flags.push(`Owner ≥ ${parsedData.owner_age_min}`);
      }
      if (parsedData.flags.off_market) flags.push('Off-market');
      
      // Generate outreach status
      const outreachOptions: ("reached" | "no-answer")[] = ['reached', 'no-answer'];
      const vmOptions: ("left" | "none")[] = ['left', 'none'];
      
      prospects.push({
        id: String(i + 1),
        name,
        asset_type: parsedData.asset_type || 'industrial',
        market_city: market.city,
        market_state: market.state,
        size_sf,
        units,
        price_psf,
        cap_rate,
        per_door,
        budget,
        build_year,
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

  const handleParse = async () => {
    if (!criteria.trim()) return;

    // Inline LLM function using runtime config
    async function tryLLM(text: string) {
      const base = getApiBase().replace(/\/$/, '');
      const r = await fetch(`${base}/parseBuyBox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    }

    try {
      // Try LLM endpoint first
      const llmResult = await tryLLM(criteria);
      
      // Validate LLM response structure
      if (validateLLMResponse(llmResult)) {
        const coverage = coverageScore(llmResult);
        setParsedData({ ...llmResult, coverage });
        return;
      }
    } catch (error) {
      console.log('LLM endpoint unavailable, using local parser');
    }

    // Fallback to local parser
    const parsed = parseBuyBoxLocal(criteria);
    const coverage = coverageScore(parsed);
    setParsedData({ ...parsed, coverage });
  };

  const handleSendToCRM = () => {
    if (!parsedData) return;
    
    if (parsedData.coverage && parsedData.coverage < 60) {
      toast({
        title: "Missing criteria",
        description: "Add market + size (or units) for accurate matches.",
        variant: "destructive",
      });
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
    if (isSimulating || prospects.length === 0) return;
    
    setIsSimulating(true);
    
    const interval = setInterval(() => {
      setProspects(prev => {
        if (prev.length >= 2) {
          const toMove = prev.slice(0, 2);
          setQualified(curr => [...curr, ...toMove]);
          return prev.slice(2);
        }
        return prev;
      });
      
      setQualified(prev => {
        if (prev.length >= 1) {
          const toMove = prev[0];
          setMeetings(curr => [...curr, toMove]);
          return prev.slice(1);
        }
        return prev;
      });
    }, 3000);

    setTimeout(() => {
      clearInterval(interval);
      setIsSimulating(false);
    }, 10000);
  };

  const handleNavClick = (anchor: string) => {
    window.location.href = `/#${anchor}`;
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return 'bg-green-600/10 text-green-600';
    if (coverage >= 60) return 'bg-amber-600/10 text-amber-600';
    return 'bg-red-600/10 text-red-600';
  };

  const qualRate = prospects.length > 0 ? Math.round((qualified.length / (prospects.length + qualified.length + meetings.length)) * 100) : 0;
  const bookRate = qualified.length > 0 ? Math.round((meetings.length / (qualified.length + meetings.length)) * 100) : 0;

  // Asset type emojis
  const getAssetTypeEmoji = (assetType: string) => {
    switch (assetType) {
      case 'industrial':
      case 'warehouse':
        return '🏭';
      case 'multifamily':
        return '🏘️';
      case 'retail':
        return '🏬';
      case 'single-family':
        return '🏠';
      case 'data center':
        return '🏢';
      case 'land':
        return '🏞️';
      default:
        return '🏢';
    }
  };

  // Render prospect cards with consistent design and emojis
  const renderProspectCard = (prospect: Prospect, onQualify?: () => void, onBook?: () => void, onRemove?: () => void) => {
    const emoji = getAssetTypeEmoji(prospect.asset_type);
    const assetLabel = prospect.asset_type === 'warehouse' ? 'Industrial' : 
                      prospect.asset_type.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ');
    
    return (
      <Card key={prospect.id} className="rounded-xl ring-1 ring-border/50 p-4 space-y-2 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
        {/* Title with emoji */}
        <h4 className="font-medium text-sm leading-tight">
          {emoji} {assetLabel} — {prospect.size_sf ? `${(prospect.size_sf / 1000).toFixed(0)}k SF` : `${prospect.units} units`} ({prospect.market_city}, {prospect.market_state})
        </h4>
        
        {/* Outreach chips */}
        <div className="flex gap-1">
          <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${prospect.outreach.email === 'reached' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            email
          </span>
          <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${prospect.outreach.sms === 'reached' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            sms
          </span>
          <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${prospect.outreach.call === 'reached' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            call
          </span>
          <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${prospect.outreach.vm === 'left' ? 'bg-muted/50 text-muted-foreground' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            vm
          </span>
        </div>
        
        {/* Meta row */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {prospect.price_psf && <span>${prospect.price_psf} PSF</span>}
          {prospect.cap_rate && <span>{prospect.cap_rate.toFixed(1)}% Cap</span>}
          {prospect.per_door && <span>${(prospect.per_door / 1000).toFixed(0)}k/door</span>}
          {prospect.budget && <span>${(prospect.budget / 1000000).toFixed(1)}M</span>}
          {prospect.build_year && <span>Built {prospect.build_year}</span>}
        </div>
        
        {/* Flags */}
        {prospect.flags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {prospect.flags.map((flag, index) => (
              <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                {flag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Contact */}
        <div className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
          {prospect.contact.email} · {prospect.contact.phone}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {onQualify && (
            <Button size="sm" variant="outline" onClick={onQualify} className="text-xs">
              Qualify
            </Button>
          )}
          {onBook && (
            <Button size="sm" variant="outline" onClick={onBook} className="text-xs">
              Book
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onRemove} className="text-xs">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleNavClick('')}
              className="mr-6 flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-6">
              <h1 className="text-lg font-semibold">Deal Finder Demo</h1>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto py-6 space-y-8">
        {/* Deal Finder Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Deal Finder</CardTitle>
              <button
                onClick={() => {
                  const url = prompt('Paste API base URL (e.g. https://mandate-parser-brenertomer.replit.app)');
                  if (url) { 
                    setApiBase(url); 
                    location.reload(); 
                  }
                }}
                className="text-xs text-muted-foreground hover:text-primary underline"
              >
                Set API URL
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe your buy-box criteria in natural language..."
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleParse} disabled={!criteria.trim()}>
                Parse Criteria
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
            
            {/* Examples */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Try these examples:</p>
              <div className="space-y-1">
                <button
                  onClick={() => setCriteria("Find industrial warehouses, 60k–120k SF, Atlanta, cap ≥ 6%, built after 1980")}
                  className="block text-left text-sm text-primary hover:underline"
                >
                  • Find industrial warehouses, 60k–120k SF, Atlanta, cap ≥ 6%, built after 1980
                </button>
                <button
                  onClick={() => setCriteria("18–22k SF retail for lease in Miami Beach, $180–$220 PSF")}
                  className="block text-left text-sm text-primary hover:underline"
                >
                  • 18–22k SF retail for lease in Miami Beach, $180–$220 PSF
                </button>
                <button
                  onClick={() => setCriteria("Dallas multifamily owners with loans maturing in 3–6 months, 50–150 units for refinance")}
                  className="block text-left text-sm text-primary hover:underline"
                >
                  • Dallas multifamily owners with loans maturing in 3–6 months, 50–150 units for refinance
                </button>
                <button
                  onClick={() => setCriteria("single family homes in SF area, between 2–3 million, owners above 54")}
                  className="block text-left text-sm text-primary hover:underline"
                >
                  • single family homes in SF area, between 2–3 million, owners above 54
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parsed Results */}
        {parsedData && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Parsed Buy-Box</CardTitle>
              <Badge className={getCoverageColor(parsedData.coverage || 0)}>
                Coverage: {parsedData.coverage || 0}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Intent:</span> {parsedData.intent || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Asset Type:</span> {parsedData.asset_type || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Market:</span> {parsedData.market.city ? `${parsedData.market.city}, ${parsedData.market.state}` : parsedData.market.metro || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Size (SF):</span> {parsedData.size_range_sf ? `${parsedData.size_range_sf.min?.toLocaleString()}–${parsedData.size_range_sf.max?.toLocaleString()} SF` : 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Units:</span> {parsedData.units_range ? `${parsedData.units_range.min}–${parsedData.units_range.max}` : 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Price/Cap:</span> {
                    parsedData.price_cap_band ? 
                      [
                        parsedData.price_cap_band.psf_min && parsedData.price_cap_band.psf_max ? `$${parsedData.price_cap_band.psf_min}–$${parsedData.price_cap_band.psf_max} PSF` : null,
                        parsedData.price_cap_band.cap_min ? `${parsedData.price_cap_band.cap_min}%+ Cap` : null,
                        parsedData.price_cap_band.per_door_max ? `≤$${(parsedData.price_cap_band.per_door_max / 1000).toFixed(0)}k/door` : null,
                        parsedData.price_cap_band.budget_min && parsedData.price_cap_band.budget_max ? `$${(parsedData.price_cap_band.budget_min / 1000000).toFixed(1)}–$${(parsedData.price_cap_band.budget_max / 1000000).toFixed(1)}M` : null
                      ].filter(Boolean).join(', ') || 'Various criteria'
                    : 'Not specified'
                  }
                </div>
              </div>
              
              {parsedData.coverage && parsedData.coverage < 60 && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Add market + size (or units) for accurate matches.
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={handleSendToCRM}
                  disabled={parsedData.coverage ? parsedData.coverage < 60 : false}
                >
                  Send to CRM
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CRM Pipeline */}
        {(prospects.length > 0 || qualified.length > 0 || meetings.length > 0) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>CRM Pipeline</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">Qual rate: {qualRate}%</Badge>
                <Badge variant="outline">Book rate: {bookRate}%</Badge>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSimulate}
                  disabled={isSimulating || prospects.length === 0}
                >
                  {isSimulating ? 'Simulating...' : 'Simulate'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Prospects */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Prospects ({prospects.length})</h3>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {prospects.map((prospect) => 
                      renderProspectCard(
                        prospect,
                        () => moveProspect(prospect.id, prospects, qualified, setProspects, setQualified),
                        undefined,
                        () => removeProspect(prospect.id, prospects, setProspects)
                      )
                    )}
                  </div>
                </div>

                {/* Qualified Targets */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Qualified Targets ({qualified.length})</h3>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {qualified.map((prospect) => 
                      renderProspectCard(
                        prospect,
                        undefined,
                        () => moveProspect(prospect.id, qualified, meetings, setQualified, setMeetings),
                        () => removeProspect(prospect.id, qualified, setQualified)
                      )
                    )}
                  </div>
                </div>

                {/* Meetings Booked */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Meetings Booked ({meetings.length})</h3>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {meetings.map((prospect) => 
                      renderProspectCard(
                        prospect,
                        undefined,
                        undefined,
                        () => removeProspect(prospect.id, meetings, setMeetings)
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Demo;