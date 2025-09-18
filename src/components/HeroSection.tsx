import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import TaskBoard from './TaskBoard';
import { Loader } from 'lucide-react';
const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  return <section className="relative w-full py-12 md:py-20 px-6 md:px-12 flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Cosmic particle effect (background dots) */}
      <div className="absolute inset-0 cosmic-grid opacity-30"></div>
      
      {/* Gradient glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full">
        <div className="w-full h-full opacity-10 bg-primary blur-[120px]"></div>
      </div>
      
      <div className={`relative z-10 max-w-4xl text-center space-y-6 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-muted text-primary">
            <span className="flex h-2 w-2 rounded-full bg-primary"></span>
            Workflows that take weeks → ~60 minutes
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tighter text-balance text-foreground">
          Find, qualify, and engage <span className="text-foreground">real-estate sellers</span>—fast.
        </h1>
        
        {/* Typewriter Demo Card */}
        <div className="mt-6 rounded-2xl border shadow-sm bg-card/70 backdrop-blur p-4 md:p-6">
          <h3 className="text-lg font-semibold text-foreground">Deal Finder (visual)</h3>
          <p className="text-sm text-muted-foreground mt-1">Demo only – no functionality.</p>

          {/* Typewriter viewport */}
          <div className="mt-4 font-mono text-sm text-foreground relative min-h-[3rem]">
            {/* Line 1 */}
            <span className="tw-line tw-l1 border-r-2 border-foreground pr-[2px]">
              find sellers of warehouses willing to sell between 2–3mm within 1 hour away of Charlotte, look at owners above the age of 65. size should be between 10,000sq to 100,000sq
            </span>
            {/* Line 2 */}
            <span className="tw-line tw-l2 border-r-2 border-foreground pr-[2px]">
              find distressed warehouse owners priced 1–2.5mm within 45 minutes of Charlotte; target owners aged 60+; size 15,000–75,000 sq ft
            </span>
          </div>

          <style>{`
            /* Base "typewriter" styles (CSS-only) */
            .tw-line{
              position:absolute; left:0; top:0;
              white-space:nowrap; overflow:hidden;
              width:0ch; /* animated */
            }
            @keyframes caret-blink { 50% { border-color: transparent; } }

            /* Total cycle = 18s. L1 runs first (type → hold → erase), then L2. */
            .tw-l1{
              --w:170; /* characters in line 1 (approx) */
              animation:
                l1-typing 18s steps(var(--w)) infinite,
                caret-blink 1s steps(1) infinite;
            }
            @keyframes l1-typing{
              0%   { width:0ch;   opacity:1; }
              40%  { width:170ch; opacity:1; }   /* type */
              55%  { width:170ch; opacity:1; }   /* hold */
              70%  { width:0ch;   opacity:1; }      /* erase */
              71%  { opacity:0; }                    /* hide until next loop */
              100% { width:0ch;   opacity:0; }
            }

            .tw-l2{
              --w:128; /* characters in line 2 (approx) */
              animation:
                l2-typing 18s steps(var(--w)) infinite,
                caret-blink 1s steps(1) infinite;
            }
            @keyframes l2-typing{
              0%   { opacity:0; width:0ch; }
              69%  { opacity:0; width:0ch; }        /* wait while L1 runs */
              70%  { opacity:1; width:0ch; }        /* show & start typing */
              85%  { width:128ch; }              /* type */
              95%  { width:128ch; }              /* hold */
              100% { width:0ch; }                   /* erase, loop restarts */
            }

            /* Accessibility: respect reduced motion */
            @media (prefers-reduced-motion: reduce){
              .tw-line{ animation:none; width:auto; border-right:0; opacity:1; }
            }
          `}</style>

          {/* Static "Run query" button purely for look */}
          <div className="mt-3">
            <button type="button" disabled aria-disabled="true"
              className="rounded-xl px-4 py-2 font-medium border shadow-sm disabled:opacity-50 text-foreground">
              Run query
            </button>
          </div>
        </div>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          Type your buy-box. AssetRadar finds the right owners, reaches them on every channel, and delivers only the ones ready to deal.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 items-center">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground text-base h-12 px-8 transition-all duration-200 min-h-[48px]">
            Get a 15-minute demo
          </Button>
          <Button variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground text-base h-12 px-8 transition-all duration-200 min-h-[48px]">
            See a live run
          </Button>
        </div>
        
        <div className="pt-6 text-sm text-muted-foreground">
          Teams & Enterprise only — pricing discussed on a call
        </div>
      </div>
      
      {/* Task Manager UI integrated in hero section with glassmorphic effect */}
      <div className={`w-full max-w-7xl mt-12 z-10 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <div className="cosmic-glow relative rounded-xl overflow-hidden border border-border backdrop-blur-sm bg-card shadow-lg">
          {/* Dashboard Header */}
          <div className="bg-card backdrop-blur-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                  <div className="h-3 w-3 rounded-sm bg-foreground"></div>
                </div>
                <span className="text-foreground font-medium">Real Estate Acquisition Pipeline</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full bg-muted border-2 border-card"></div>
                  <div className="h-8 w-8 rounded-full bg-muted/80 border-2 border-card"></div>
                  <div className="h-8 w-8 rounded-full bg-muted/60 border-2 border-card"></div>
                  <div className="h-8 w-8 rounded-full bg-muted/40 border-2 border-card flex items-center justify-center text-xs text-foreground">+3</div>
                </div>
                
                <div className="h-8 px-3 rounded-md bg-muted flex items-center justify-center text-foreground text-sm">
                  Share
                </div>
              </div>
            </div>
            
            {/* Dashboard Content */}
            <div className="flex h-[600px] overflow-hidden">
              {/* Sidebar */}
              <div className="w-64 border-r border-border p-4 space-y-4 hidden md:block bg-card">
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground uppercase">Navigation</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted text-foreground">
                      <div className="h-3 w-3 rounded-sm bg-foreground"></div>
                      <span>Outreach</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted/50">
                      <div className="h-3 w-3 rounded-sm bg-muted-foreground/30"></div>
                      <span>Qualification</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted/50">
                      <div className="h-3 w-3 rounded-sm bg-muted-foreground/30"></div>
                      <span>Due Diligence</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted/50">
                      <div className="h-3 w-3 rounded-sm bg-muted-foreground/30"></div>
                      <span>Analytics</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <div className="text-xs text-muted-foreground uppercase">Departments</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted/50">
                      <div className="h-3 w-3 rounded-full bg-muted-foreground/60"></div>
                      <span>Multifamily</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted/50">
                      <div className="h-3 w-3 rounded-full bg-muted-foreground/50"></div>
                      <span>Industrial</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted/50">
                      <div className="h-3 w-3 rounded-full bg-muted-foreground/40"></div>
                      <span>Land</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 p-4 bg-background overflow-hidden">
                {/* Board Header */}
                <div className="flex items-center justify-between mb-6 min-w-0">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <h3 className="font-medium text-foreground">Properties</h3>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">487</span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M12 9L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 9L17 17H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M17 17L7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="h-8 px-3 rounded-md bg-foreground text-background flex items-center justify-center text-sm font-medium whitespace-nowrap">
                      Add Property
                    </div>
                  </div>
                </div>
                
                {/* Kanban Board */}
                <div className="overflow-hidden">
                  <TaskBoard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;