import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Menu, X, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseBuyBoxLocal, coverageScore, type Parsed } from '@/lib/localParser';
import { parseWithLLM, normalizeParsed } from '@/lib/llmClient';
import { seedProspects } from '@/lib/seedCRM';

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

const Demo = () => {
  const [criteria, setCriteria] = useState('');
  const [parsedBuyBox, setParsedBuyBox] = useState<Parsed | null>(null);
  const [crmProspects, setCrmProspects] = useState<Prospect[]>([]);
  const [qualifiedTargets, setQualifiedTargets] = useState<Prospect[]>([]);
  const [meetingsBooked, setMeetingsBooked] = useState<Prospect[]>([]);
  const [statusChip, setStatusChip] = useState<'idle' | 'llm' | 'fallback' | 'error'>('idle');
  const [showVerificationBar, setShowVerificationBar] = useState(false);
  const { toast } = useToast();

  const handleParse = async () => {
    if (!criteria.trim()) return;

    setStatusChip('llm');
    setShowVerificationBar(false);

    try {
      const llmResult = await parseWithLLM(criteria);
      const parsed = normalizeParsed(llmResult);
      setParsedBuyBox(parsed);
      setStatusChip('idle');
      setShowVerificationBar(true);
    } catch (error) {
      console.log('LLM parsing failed, using local parser:', error);
      setStatusChip('fallback');
      const localResult = parseBuyBoxLocal(criteria);
      const parsed = normalizeParsed(localResult);
      setParsedBuyBox(parsed);
      setShowVerificationBar(true);
      
      // Clear fallback status after 3 seconds
      setTimeout(() => setStatusChip('idle'), 3000);
    }
  };

  const handleProceed = () => {
    if (!parsedBuyBox) return;

    const newProspects = seedProspects(parsedBuyBox);
    setCrmProspects(newProspects);
    setShowVerificationBar(false);
    
    toast({
      title: "Prospects added to CRM",
      description: `${newProspects.length} new prospects matching your criteria.`,
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
    setShowVerificationBar(false);
    // Focus the textarea
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  };

  const generateBuyBoxSummary = (parsed: Parsed): string => {
    const parts: string[] = [];
    
    if (parsed.asset_type) {
      parts.push(parsed.asset_type.charAt(0).toUpperCase() + parsed.asset_type.slice(1));
    }
    
    if (parsed.size_range_sf) {
      const min = parsed.size_range_sf.min ? `${(parsed.size_range_sf.min / 1000).toFixed(0)}k` : '';
      const max = parsed.size_range_sf.max ? `${(parsed.size_range_sf.max / 1000).toFixed(0)}k` : '';
      if (min && max) {
        parts.push(`${min}–${max} SF`);
      } else if (min) {
        parts.push(`≥${min} SF`);
      } else if (max) {
        parts.push(`≤${max} SF`);
      }
    }
    
    if (parsed.units_range) {
      const min = parsed.units_range.min || '';
      const max = parsed.units_range.max || '';
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
    
    if (parsed.price_cap_band?.cap_min) {
      parts.push(`cap ≥ ${parsed.price_cap_band.cap_min}%`);
    }
    
    if (parsed.build_year?.after) {
      parts.push(`built after ${parsed.build_year.after}`);
    }
    
    return parts.join(', ') || 'Property search criteria';
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

  const handleNavClick = (anchor: string) => {
    window.location.href = `/#${anchor}`;
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return 'bg-green-600/10 text-green-600';
    if (coverage >= 60) return 'bg-amber-600/10 text-amber-600';
    return 'bg-red-600/10 text-red-600';
  };

  // Render prospect cards with consistent design and emojis
  const renderProspectCard = (prospect: Prospect, onQualify?: () => void, onBook?: () => void, onRemove?: () => void) => {
    return (
      <Card key={prospect.id} className="rounded-xl ring-1 ring-border/50 p-4 space-y-2 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
        {/* Title with emoji */}
        <h4 className="font-medium text-sm leading-tight">
          {prospect.title}
        </h4>
        
        {/* Meta row */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{prospect.price}</span>
          {prospect.buildYear && <span>Built {prospect.buildYear}</span>}
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
        
        {/* Contact */}
        <div className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
          {prospect.contact}
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
            <Textarea
              placeholder="Describe your buy-box criteria in natural language..."
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 items-center">
              <Button onClick={handleParse} disabled={!criteria.trim()}>
                Parse
              </Button>
              {statusChip !== 'idle' && (
                <Badge variant={statusChip === 'llm' ? 'default' : statusChip === 'fallback' ? 'secondary' : 'destructive'}>
                  {statusChip === 'llm' && 'Parsing with LLM…'}
                  {statusChip === 'fallback' && 'LLM unavailable → local parser'}
                  {statusChip === 'error' && 'Parse error'}
                </Badge>
              )}
              <Button variant="outline" onClick={() => { setCriteria(''); setParsedBuyBox(null); setShowVerificationBar(false); setCrmProspects([]); setQualifiedTargets([]); setMeetingsBooked([]); }}>
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Bar */}
        {showVerificationBar && parsedBuyBox && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-sm mb-1">Did we understand this correctly?</h3>
                  <p className="text-sm text-muted-foreground">{generateBuyBoxSummary(parsedBuyBox)}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button onClick={handleProceed} size="sm">
                    Looks right → Proceed
                  </Button>
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
              <Badge className={getCoverageColor(coverageScore(parsedBuyBox))}>
                Coverage: {coverageScore(parsedBuyBox)}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Intent:</span> {parsedBuyBox.intent || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Asset Type:</span> {parsedBuyBox.asset_type || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Market:</span> {parsedBuyBox.market?.city ? `${parsedBuyBox.market.city}, ${parsedBuyBox.market.state}` : parsedBuyBox.market?.metro || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Size (SF):</span> {parsedBuyBox.size_range_sf ? `${parsedBuyBox.size_range_sf.min?.toLocaleString()}–${parsedBuyBox.size_range_sf.max?.toLocaleString()} SF` : 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Units:</span> {parsedBuyBox.units_range ? `${parsedBuyBox.units_range.min}–${parsedBuyBox.units_range.max}` : 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Price/Cap:</span> {
                    parsedBuyBox.price_cap_band ? 
                      [
                        parsedBuyBox.price_cap_band.psf_min && parsedBuyBox.price_cap_band.psf_max ? `$${parsedBuyBox.price_cap_band.psf_min}–$${parsedBuyBox.price_cap_band.psf_max} PSF` : null,
                        parsedBuyBox.price_cap_band.cap_min ? `${parsedBuyBox.price_cap_band.cap_min}%+ Cap` : null,
                        parsedBuyBox.price_cap_band.per_door_max ? `≤$${(parsedBuyBox.price_cap_band.per_door_max / 1000).toFixed(0)}k/door` : null,
                        parsedBuyBox.price_cap_band.budget_min && parsedBuyBox.price_cap_band.budget_max ? `$${(parsedBuyBox.price_cap_band.budget_min / 1000000).toFixed(1)}–$${(parsedBuyBox.price_cap_band.budget_max / 1000000).toFixed(1)}M` : null
                      ].filter(Boolean).join(', ') || 'Various criteria'
                    : 'Not specified'
                  }
                </div>
              </div>
              
              {coverageScore(parsedBuyBox) < 60 && (
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