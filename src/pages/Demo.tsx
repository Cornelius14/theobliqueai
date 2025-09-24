import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Menu, X, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { normalizeUniversal, computeCoverage, type UniversalParsed } from '@/lib/normalizeUniversal';
import { buildRefinePlan, type RefinePlan } from '@/lib/buildRefinePlan';
import RefineBanner from '@/components/RefineBanner';

// Global constant for parser URL
const PARSER_URL = "https://mandate-parser-brenertomer.replit.app"; // HTTPS, no trailing slash

// Strict shape the UI expects from the server
type Parsed = {
  intent: string | null,
  market: { city: string|null, state: string|null } | null,
  asset: string | null,
  units: { min: number|null, max: number|null } | null,
  size_sf: { min: number|null, max: number|null } | null,
  budget: { max: number|null, currency: "USD" } | null,
  cap_rate: { min:number|null, max:number|null } | null,
  timing: string | null,
  role: string | null,
  missing: string[],           // e.g., ["market","budget"]
  notes: string | null,
  version: string              // e.g., "v1"
};

const Demo = () => {
  const [criteria, setCriteria] = useState('');
  const [parsedBuyBox, setParsedBuyBox] = useState<UniversalParsed | null>(null);
  const [crmProspects, setCrmProspects] = useState<any[]>([]);
  const [qualifiedTargets, setQualifiedTargets] = useState<any[]>([]);
  const [meetingsBooked, setMeetingsBooked] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'working' | 'error'>('idle');
  const [coverage, setCoverage] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [verified, setVerified] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [refinePlan, setRefinePlan] = useState<RefinePlan | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  let inflightController: AbortController | null = null;

  // Health check on component mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${PARSER_URL}/health`, { method: 'GET' });
        if (res.ok) {
          const health = await res.json();
          setIsConnected(health.ok === true);
        }
      } catch (error) {
        setIsConnected(false);
      }
    };
    checkHealth();
  }, []);

  async function parseWithLLM(text: string): Promise<Parsed> {
    if (inflightController) inflightController.abort();
    inflightController = new AbortController();

    console.log('[DealFinder] POST URL:', `${PARSER_URL}/parseBuyBox`);
    
    const res = await fetch(`${PARSER_URL}/parseBuyBox`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: inflightController.signal,
    });

    // Normalize error classes so the UI can branch:
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 503) throw new Error("LLM_UNAVAILABLE");
    if (!res.ok) throw new Error(`HTTP_${res.status}`);

    // MUST be JSON of the strict shape documented below
    const data = await res.json();
    console.log('[DealFinder] LLM JSON:', data);
    return data;
  }

  function normalizeForDisplay(p: Parsed): Parsed {
    // Display-only normalization; DO NOT mutate model's meaning.
    const norm = { ...p };
    if (norm.intent) {
      const i = norm.intent.toLowerCase();
      if (["refi", "refinance"].includes(i)) norm.intent = "refinance";
      if (["mezz", "mezzanine"].includes(i)) norm.intent = "mezz";
      if (["slb", "sale-leaseback", "sale_leaseback"].includes(i)) norm.intent = "sale_leaseback";
    }
    if (norm.asset) {
      const a = norm.asset.toLowerCase();
      if (["mf","mfh"].includes(a)) norm.asset = "multifamily";
      if (["wh","warehouse"].includes(a)) norm.asset = "industrial"; // canonical
    }
    return norm;
  }

  function showRefineBanner(missing: string[], parsed: Parsed) {
    // This will be handled by existing RefineBanner component
    const plan = buildRefinePlan(normalizeUniversal(parsed as any, criteria));
    setRefinePlan(plan.items.length ? plan : null);
  }

  function clearRefineBanner() { 
    setRefinePlan(null);
  }

  function generateProspects(parsed: Parsed, raw: string, N: number): any[] {
    const prospects: any[] = [];
    const seed = hashString(raw + (parsed.intent || '') + (parsed.asset || ''));
    const rnd = createRandom(seed);

    for (let i = 0; i < N; i++) {
      const prospect = {
        id: `prospect-${i + 1}`,
        title: generateTitle(parsed, rnd),
        matchReason: generateMatchReason(parsed, rnd),
        city: parsed.market?.city || 'TBD',
        state: parsed.market?.state || '',
        badges: generateBadges(parsed, rnd),
        outreach: {
          email: rnd() > 0.3 ? 'green' : 'red',
          sms: rnd() > 0.5 ? 'green' : 'red',
          call: rnd() > 0.6 ? 'green' : 'red',
          vm: rnd() > 0.7 ? 'green' : 'red',
        },
        contact: {
          email: `owner${i + 1}@property.com`,
          phone: `(555) ${String(Math.floor(rnd() * 900) + 100)}-${String(Math.floor(rnd() * 9000) + 1000)}`
        },
        price_estimate: generatePriceEstimate(parsed, rnd),
        built_year: Math.floor(1980 + rnd() * 40)
      };

      prospects.push(prospect);
    }

    return prospects;
  }

  function generateTitle(parsed: Parsed, rnd: () => number): string {
    const asset = parsed.asset || 'Property';
    const location = parsed.market?.city ? `${parsed.market.city}${parsed.market.state ? `, ${parsed.market.state}` : ''}` : 'Market TBD';
    
    const intentPrefix = getIntentPrefix(parsed.intent);
    return `${intentPrefix}${asset.charAt(0).toUpperCase() + asset.slice(1)} — ${location}`;
  }

  function getIntentPrefix(intent: string | null): string {
    switch (intent) {
      case 'refinance': return 'Refi Target — ';
      case 'acquisition': return 'Acquisition — ';
      case 'lease': return 'Lease — ';
      default: return '';
    }
  }

  function generateMatchReason(parsed: Parsed, rnd: () => number): string {
    const reasons = [
      'Matches size and market criteria',
      'Owner may be motivated to sell',
      'Good cash flow opportunity',
      'Value-add potential identified'
    ];
    return reasons[Math.floor(rnd() * reasons.length)];
  }

  function generateBadges(parsed: Parsed, rnd: () => number): string[] {
    const badges: string[] = [];
    
    if (parsed.units) {
      const min = parsed.units.min || 0;
      const max = parsed.units.max || min + 10;
      badges.push(`${min}–${max} units`);
    }
    
    if (parsed.size_sf) {
      const min = parsed.size_sf.min ? `${Math.round(parsed.size_sf.min / 1000)}k` : '';
      const max = parsed.size_sf.max ? `${Math.round(parsed.size_sf.max / 1000)}k` : '';
      if (min && max) {
        badges.push(`${min}–${max} SF`);
      } else if (max) {
        badges.push(`≤${max} SF`);
      }
    }
    
    if (parsed.budget?.max) {
      badges.push(`≤$${Math.round(parsed.budget.max / 1000000)}M`);
    }
    
    // Add market warning if missing
    if (!parsed.market?.city && !parsed.market?.state) {
      badges.push('⚠️ Add market to improve accuracy');
    }
    
    return badges;
  }

  function generatePriceEstimate(parsed: Parsed, rnd: () => number): string {
    const base = 5000000 + rnd() * 15000000;
    return `$${Math.round(base / 1000000)}M est.`;
  }

  // Utility functions
  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  function createRandom(seed: number) {
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  const handleParse = async () => {
    console.log('[DealFinder] Parse clicked');
    setStatus('working');
    setErrMsg(null);
    
    try {
      const raw = criteria.trim();
      if (!raw) { 
        setErrMsg("Enter your criteria."); 
        setStatus('idle'); 
        return; 
      }

      const parsed: Parsed = await parseWithLLM(raw);
      const display = normalizeForDisplay(parsed);

      // Convert to UniversalParsed for compatibility
      const universalParsed = normalizeUniversal(display as any, raw);
      setParsedBuyBox(universalParsed);
      setCoverage(computeCoverage(universalParsed));

      if (parsed.missing?.length) {
        showRefineBanner(parsed.missing, display);
      } else {
        clearRefineBanner();
      }

      // Generate CRM cards ONLY from parsed+raw (no heuristics).
      setProspects(generateProspects(display, raw, 12));
      setStatus('idle');
      
    } catch (err: any) {
      // Per product requirement: DO NOT fabricate fallback/generic results.
      if (err?.message === "LLM_UNAVAILABLE") {
        setErrMsg("LLM unavailable. Try again in a moment.");
      } else if (err?.message === "RATE_LIMIT") {
        setErrMsg("Parser busy. Please retry in a few seconds.");
      } else {
        setErrMsg("Couldn't reach the parser. Check your network or try again.");
      }
      setCrmProspects([]); // keep empty
      setStatus('error');
    }
  };

  function setProspects(prospects: any[]) {
    setCrmProspects(prospects);
  }

  const handleProceed = () => {
    if (!parsedBuyBox) return;

    // Prospects already generated during parse, just clear other columns
    setQualifiedTargets([]); // Clear qualified targets
    setMeetingsBooked([]); // Clear meetings
    setVerified(true);
    
    toast({
      title: "Prospects verified",
      description: `${crmProspects.length} prospects ready for outreach.`,
    });

    // Scroll to CRM section
    setTimeout(() => {
      const crmSection = document.getElementById('crm-section');
      if (crmSection) {
        crmSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleEdit = () => {
    setVerified(false);
    // Focus the textarea
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  };

  const generateBuyBoxSummary = (parsed: UniversalParsed): string => {
    const parts: string[] = [];
    
    if (parsed.asset_type) {
      parts.push(parsed.asset_type.charAt(0).toUpperCase() + parsed.asset_type.slice(1));
    }
    
    if (parsed.size_sf) {
      const min = parsed.size_sf.min ? `${(parsed.size_sf.min / 1000).toFixed(0)}k` : '';
      const max = parsed.size_sf.max ? `${(parsed.size_sf.max / 1000).toFixed(0)}k` : '';
      if (min && max) {
        parts.push(`${min}–${max} SF`);
      } else if (min) {
        parts.push(`≥${min} SF`);
      } else if (max) {
        parts.push(`≤${max} SF`);
      }
    }
    
    if (parsed.units) {
      const min = parsed.units.min || '';
      const max = parsed.units.max || '';
      if (min && max) {
        parts.push(`${min}–${max} units`);
      } else if (min) {
        parts.push(`≥${min} units`);
      } else if (max) {
        parts.push(`≤${max} units`);
      }
    }
    
    if (parsed.market?.city && parsed.market?.state) {
      parts.push(`${parsed.market.city}, ${parsed.market.state}`);
    } else if (parsed.market?.metro) {
      parts.push(`${parsed.market.metro} metro`);
    }
    
    if (parsed.cap_rate?.min) {
      parts.push(`cap ≥ ${parsed.cap_rate.min}%`);
    }
    
    if (parsed.build_year?.after) {
      parts.push(`built after ${parsed.build_year.after}`);
    }
    
    return parts.join(', ') || 'Property search criteria';
  };

  const moveProspect = (id: string, from: any[], to: any[], setFrom: (prospects: any[]) => void, setTo: (prospects: any[]) => void) => {
    const prospect = from.find(p => p.id === id);
    if (prospect) {
      setFrom(from.filter(p => p.id !== id));
      setTo([...to, prospect]);
    }
  };

  const removeProspect = (id: string, from: any[], setFrom: (prospects: any[]) => void) => {
    setFrom(from.filter(p => p.id !== id));
  };

  const handleNavClick = (anchor: string) => {
    window.location.href = `/#${anchor}`;
  };

  const handleInsert = (snippet: string) => {
    setCriteria((prev) => (prev?.trim() ? `${prev.trim()} ${snippet}` : snippet));
  };

  const isReadyForCRM = (p: any) => {
    if (!p) return false;
    const hasCore = p.intent && p.market && p.asset_type;
    const hasSize = !!p.units || !!p.size_sf;
    const hasMoney = !!p.budget || !!p.cap_rate;
    return hasCore && hasSize && hasMoney;
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return 'bg-green-600/10 text-green-600';
    if (coverage >= 60) return 'bg-amber-600/10 text-amber-600';
    return 'bg-red-600/10 text-red-600';
  };

  // Render prospect cards with consistent design and emojis
  const renderProspectCard = (prospect: any, onQualify?: () => void, onBook?: () => void, onRemove?: () => void) => {
    const location = `${prospect.city || 'Unknown'}${prospect.state ? `, ${prospect.state}` : ''}`;
    const sizeDisplay = prospect.size_sf ? `${(prospect.size_sf / 1000).toFixed(0)}k SF` : prospect.units ? `${prospect.units} units` : 'N/A';
    
    return (
      <Card key={prospect.id} className="rounded-xl ring-1 ring-border/50 p-4 space-y-2 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
        {/* Title with emoji */}
        <h4 className="font-medium text-sm leading-tight">
          {prospect.title}
        </h4>
        
        {/* Match reason */}
        <div className="text-sm text-muted-foreground line-clamp-2">
          {prospect.matchReason}
        </div>
        
        {/* Price and year info */}
        {(prospect.price_estimate || prospect.built_year) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {prospect.price_estimate && <span>{prospect.price_estimate}</span>}
            {prospect.built_year && <span>Built {prospect.built_year}</span>}
          </div>
        )}
        
        {/* Flags */}
        {prospect.badges && prospect.badges.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {prospect.badges.map((flag, index) => (
              <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                {flag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Outreach chips */}
        <div className="flex gap-1">
          <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${prospect.outreach?.email === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            email
          </span>
          <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${prospect.outreach?.sms === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            sms
          </span>
          <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${prospect.outreach?.call === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            call
          </span>
          <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${prospect.outreach?.vm === 'green' ? 'bg-muted/50 text-muted-foreground' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            vm
          </span>
        </div>
        
        {/* Contact */}
        <div className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
          {prospect.contact?.email} · {prospect.contact?.phone}
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
            <CardTitle>Deal Finder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={(e) => e.preventDefault()}>
              <Textarea
                placeholder="Describe your buy-box criteria in natural language..."
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2 items-center mt-4">
                <button 
                  type="button" 
                  id="df-parse-btn" 
                  onClick={handleParse} 
                  disabled={!criteria.trim() || status === 'working'}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  aria-label="Parse Criteria"
                >
                  {status === 'working' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Parse Criteria
                </button>
                {status === 'working' && <div className="text-xs opacity-70">Parsing…</div>}
                {status === 'error' && <div className="text-xs text-red-400">{errMsg}</div>}
                {isConnected && (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Connected
                  </div>
                )}
                <Button variant="outline" onClick={() => { 
                  setCriteria(''); 
                  setParsedBuyBox(null); 
                  setVerified(false); 
                  setCrmProspects([]); 
                  setQualifiedTargets([]); 
                  setMeetingsBooked([]); 
                  setBlocked(false);
                  setCoverage(0);
                  setErrMsg(null);
                  setStatus('idle');
                  setRefinePlan(null);
                }}>
                  Reset
                </Button>
              </div>
            </form>
            
            {/* Refine Banner */}
            <RefineBanner plan={refinePlan} onInsert={handleInsert} />
            
            {/* Helper text */}
            <p className="mt-2 text-xs text-muted-foreground">
              Try: <code className="bg-muted px-1 rounded">in Boston, MA</code>, <code className="bg-muted px-1 rounded">10–20 units</code>, <code className="bg-muted px-1 rounded">budget ≤ $15M</code>, <code className="bg-muted px-1 rounded">intent: refinance</code>.
            </p>
            
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Bar */}
        {parsedBuyBox && !verified && (
          <Card className={`border-2 ${blocked ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-sm mb-1">Did we understand this correctly?</h3>
                  <p className="text-sm text-muted-foreground mb-2">{generateBuyBoxSummary(parsedBuyBox as any)}</p>
                  {blocked && (
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      We parsed your mandate. Some fields look thin—confirm or tweak, then proceed.
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button onClick={handleProceed} size="sm" disabled={!isReadyForCRM(parsedBuyBox)} className={isReadyForCRM(parsedBuyBox) ? "" : "opacity-50"}>
                    {isReadyForCRM(parsedBuyBox) ? "Send to CRM" : "Send to CRM (missing fields)"}
                  </Button>
                  {!isReadyForCRM(parsedBuyBox) && (
                    <div className="text-xs text-amber-400 mt-1">Missing required fields for CRM integration.</div>
                  )}
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parsed Buy-Box Section */}
        {parsedBuyBox && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Parsed Buy-Box</CardTitle>
              <Badge className={getCoverageColor(coverage)}>
                Coverage: {coverage}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Intent:</span> {parsedBuyBox.intent || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Role:</span> {parsedBuyBox.role || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Asset Type:</span> {parsedBuyBox.asset_type || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Market:</span> {parsedBuyBox.market?.city ? `${parsedBuyBox.market.city}, ${parsedBuyBox.market.state}` : parsedBuyBox.market?.metro || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Size (SF):</span> {parsedBuyBox.size_sf ? `${parsedBuyBox.size_sf.min?.toLocaleString()}–${parsedBuyBox.size_sf.max?.toLocaleString()} SF` : 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Units:</span> {parsedBuyBox.units ? `${parsedBuyBox.units.min}–${parsedBuyBox.units.max}` : 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Budget/Cap:</span> {
                    [
                      parsedBuyBox.budget?.min && parsedBuyBox.budget?.max ? `$${(parsedBuyBox.budget.min / 1000000).toFixed(1)}–$${(parsedBuyBox.budget.max / 1000000).toFixed(1)}M` : null,
                      parsedBuyBox.cap_rate?.min ? `${parsedBuyBox.cap_rate.min}%+ Cap` : null,
                      parsedBuyBox.psf?.min && parsedBuyBox.psf?.max ? `$${parsedBuyBox.psf.min}–$${parsedBuyBox.psf.max} PSF` : null
                    ].filter(Boolean).join(', ') || 'Not specified'
                  }
                </div>
                {parsedBuyBox.timing?.months_to_event && (
                  <div>
                    <span className="font-medium">Timing:</span> {parsedBuyBox.timing.months_to_event} months
                  </div>
                )}
                {parsedBuyBox.keywords && parsedBuyBox.keywords.length > 0 && (
                  <div className="col-span-full">
                    <span className="font-medium">Keywords:</span> {parsedBuyBox.keywords.join(', ')}
                  </div>
                )}
              </div>
              
              {coverage < 60 && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Add market + size (or units) for accurate matches.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* CRM Dashboard */}
        <div id="crm-section" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Prospects */}
          <Card>
            <CardHeader>
              <CardTitle>Prospects ({crmProspects.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {crmProspects.map((prospect) => 
                  renderProspectCard(
                    prospect,
                    () => moveProspect(prospect.id, crmProspects, qualifiedTargets, setCrmProspects, setQualifiedTargets),
                    undefined,
                    () => removeProspect(prospect.id, crmProspects, setCrmProspects)
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Qualified Targets */}
          <Card>
            <CardHeader>
              <CardTitle>Qualified Targets ({qualifiedTargets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {qualifiedTargets.map((prospect) => 
                  renderProspectCard(
                    prospect,
                    undefined,
                    () => moveProspect(prospect.id, qualifiedTargets, meetingsBooked, setQualifiedTargets, setMeetingsBooked),
                    () => removeProspect(prospect.id, qualifiedTargets, setQualifiedTargets)
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Meetings Booked */}
          <Card>
            <CardHeader>
              <CardTitle>Meetings Booked ({meetingsBooked.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {meetingsBooked.map((prospect) => 
                  renderProspectCard(
                    prospect,
                    undefined,
                    undefined,
                    () => removeProspect(prospect.id, meetingsBooked, setMeetingsBooked)
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Demo;