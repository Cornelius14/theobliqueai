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

interface ParsedBuyBox {
  intent: string;
  asset_type: string;
  market: string;
  size_range: string;
  price_cap: string;
  timing: string;
  flags: string[];
  summary: string[];
}

interface Prospect {
  id: string;
  name: string;
  market: string;
  size: string;
  price: string;
  owner: string;
  badges: string[];
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

  const parseCriteria = (text: string): ParsedBuyBox => {
    // Simple regex-based parsing
    const intent = text.toLowerCase().includes('lease') ? 'Lease' : 'Purchase';
    
    let asset_type = 'Mixed';
    if (text.toLowerCase().includes('multifamily')) asset_type = 'Multifamily';
    if (text.toLowerCase().includes('retail')) asset_type = 'Retail';
    if (text.toLowerCase().includes('industrial')) asset_type = 'Industrial';
    
    const marketMatch = text.match(/in\s+([A-Za-z\s,]+?)(?:,|\s|$)/);
    const market = marketMatch ? marketMatch[1].trim() : 'Various Markets';
    
    const sizeMatch = text.match(/(\d+[–-]\d+\s*(?:units|SF|k SF))/i);
    const size_range = sizeMatch ? sizeMatch[1] : 'Various Sizes';
    
    const priceMatch = text.match(/(\$\d+[–-]\d+\s*PSF|cap\s*≥?\s*\d+\.?\d*%|≤?\s*\$\d+k\/door)/i);
    const price_cap = priceMatch ? priceMatch[1] : 'Market Rate';
    
    const timing = text.toLowerCase().includes('month') ? 'Near Term (3-6 months)' : 'Flexible Timeline';
    
    const flags = [];
    if (text.toLowerCase().includes('loan')) flags.push('Refinance Opportunity');
    if (text.toLowerCase().includes('deed')) flags.push('Title Insurance Lead');
    if (text.toLowerCase().includes('value-add')) flags.push('Value-Add Opportunity');
    
    const summary = [
      `Target ${asset_type.toLowerCase()} properties in ${market}`,
      `Size range: ${size_range}`,
      `Pricing: ${price_cap}`,
      flags.length > 0 ? `Special focus: ${flags.join(', ')}` : 'Standard acquisition criteria'
    ];

    return {
      intent,
      asset_type,
      market,
      size_range,
      price_cap,
      timing,
      flags,
      summary
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

  const generateMockProspects = (): Prospect[] => {
    const mockData = [
      { name: "Industrial – 62k SF", market: "Atlanta", size: "62,000 SF", price: "$185/SF", owner: "Blackstone", badges: ["Lease Expiring"] },
      { name: "Multifamily – 28 Units", market: "Charlotte", size: "28 units", price: "6.8% cap", owner: "Private Owner", badges: ["Value-Add"] },
      { name: "Retail Strip – 15k SF", market: "Miami Beach", size: "15,000 SF", price: "$195/SF", owner: "REIT", badges: ["Frontage 65ft"] },
      { name: "Apartment Complex – 45 Units", market: "Dallas", size: "45 units", price: "LTV 68%", owner: "Family Trust", badges: ["Loan maturing"] },
      { name: "Mixed Use – 35k SF", market: "Austin", size: "35,000 SF", price: "$220/SF", owner: "Investment Group", badges: ["Recent Filing"] },
      { name: "Office Building – 28k SF", market: "Houston", size: "28,000 SF", price: "7.2% cap", owner: "Private Equity", badges: ["Distressed"] },
      { name: "Warehouse – 85k SF", market: "Phoenix", size: "85,000 SF", price: "$165/SF", owner: "Pension Fund", badges: ["Sale Leaseback"] },
      { name: "Retail Center – 42k SF", market: "Tampa", size: "42,000 SF", price: "$175/SF", owner: "Local Developer", badges: ["High Traffic"] },
      { name: "Apartments – 72 Units", market: "Orlando", size: "72 units", price: "6.5% cap", owner: "Insurance Co.", badges: ["Stabilized"] },
      { name: "Industrial Park – 125k SF", market: "Jacksonville", size: "125,000 SF", price: "$145/SF", owner: "Sovereign Fund", badges: ["Port Access"] }
    ];

    return mockData.map((item, index) => ({
      ...item,
      id: `prospect-${index}`
    }));
  };

  const handleSendToCRM = () => {
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

              {parsedData && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSendToCRM}>
                    Send to CRM
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                </div>
              )}
            </div>
            
            {/* Right: Parsed Results */}
            <div>
              {parsedData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Parsed Buy-Box</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Intent:</span>
                        <div className="font-medium">{parsedData.intent}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Asset Type:</span>
                        <div className="font-medium">{parsedData.asset_type}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Market:</span>
                        <div className="font-medium">{parsedData.market}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Size Range:</span>
                        <div className="font-medium">{parsedData.size_range}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Price/Cap:</span>
                        <div className="font-medium">{parsedData.price_cap}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Timing:</span>
                        <div className="font-medium">{parsedData.timing}</div>
                      </div>
                    </div>
                    
                    {parsedData.flags.length > 0 && (
                      <div>
                        <span className="text-muted-foreground text-sm">Flags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {parsedData.flags.map((flag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-muted-foreground text-sm">Summary:</span>
                      <ul className="mt-1 space-y-1">
                        {parsedData.summary.map((item, index) => (
                          <li key={index} className="text-sm">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
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
              <div className="space-y-3">
                {prospects.map((prospect) => (
                  <Card key={prospect.id} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm">{prospect.name}</h4>
                        <p className="text-xs text-muted-foreground">{prospect.market} • {prospect.size}</p>
                        <p className="text-xs text-muted-foreground">{prospect.price} • {prospect.owner}</p>
                      </div>
                      
                      {prospect.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {prospect.badges.map((badge, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          className="text-xs h-7 flex-1"
                          onClick={() => moveProspect(prospect.id, prospects, qualified, setProspects, setQualified)}
                        >
                          Qualify
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs h-7 px-2"
                          onClick={() => removeProspect(prospect.id, prospects, setProspects)}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Qualified Targets Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-medium">Qualified Targets</h3>
                <Badge variant="secondary">{qualified.length}</Badge>
              </div>
              <div className="space-y-3">
                {qualified.map((prospect) => (
                  <Card key={prospect.id} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm">{prospect.name}</h4>
                        <p className="text-xs text-muted-foreground">{prospect.market} • {prospect.size}</p>
                        <p className="text-xs text-muted-foreground">{prospect.price} • {prospect.owner}</p>
                      </div>
                      
                      {prospect.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {prospect.badges.map((badge, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          className="text-xs h-7 flex-1"
                          onClick={() => moveProspect(prospect.id, qualified, meetings, setQualified, setMeetings)}
                        >
                          Book
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs h-7 px-2"
                          onClick={() => removeProspect(prospect.id, qualified, setQualified)}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Meetings Booked Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-medium">Meetings Booked</h3>
                <Badge variant="secondary">{meetings.length}</Badge>
              </div>
              <div className="space-y-3">
                {meetings.map((prospect) => (
                  <Card key={prospect.id} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm">{prospect.name}</h4>
                        <p className="text-xs text-muted-foreground">{prospect.market} • {prospect.size}</p>
                        <p className="text-xs text-muted-foreground">{prospect.price} • {prospect.owner}</p>
                      </div>
                      
                      {prospect.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {prospect.badges.map((badge, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs h-7 px-2 ml-auto"
                          onClick={() => removeProspect(prospect.id, meetings, setMeetings)}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Demo;