
import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Layers, Grid3x3, ListCheck, BookOpen, Star, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Features = () => {
  const [openFeature, setOpenFeature] = useState<number | null>(null);
  
  const features = [
    {
      title: "Qualification Logic",
      description: "Screen owners by price band, timeline, condition, motivation, and off-market intent.",
      expandedDescription: "Advanced filtering system that automatically screens property owners based on your specific buy-box criteria. Set parameters for price ranges, seller motivation levels, property conditions, and timing preferences. Our AI analyzes owner behavior patterns to identify the most qualified prospects.",
      icon: (
        <Layers size={24} className="text-cosmic-accent" />
      )
    },
    {
      title: "Outreach Autopilot",
      description: "Omnichannel sequences (email, SMS, voicemail, voice) that sound human and persist until you get a yes or no.",
      expandedDescription: "Automated multi-channel outreach campaigns that coordinate across email, SMS, voicemail, and live calls. AI-powered messaging that adapts based on responses and maintains consistent follow-up until you receive a definitive answer from each prospect.",
      icon: (
        <Grid3x3 size={24} className="text-cosmic-accent" />
      )
    },
    {
      title: "Live Handoff",
      description: "Meetings booked, notes and transcripts synced to your CRM automatically.",
      expandedDescription: "Seamless transition from automated outreach to live conversations. Qualified prospects are automatically booked into your calendar with full conversation history, transcripts, and qualification notes synced directly to your CRM system.",
      icon: (
        <LayoutDashboard size={24} className="text-cosmic-accent" />
      )
    },
    {
      title: "Due Diligence Red Flags",
      description: "Auto-surfaced deal killers like liens, zoning restrictions, and regulatory non-compliance.",
      expandedDescription: "Comprehensive property analysis that automatically flags potential issues including liens, debt loads, code violations, flood zones, rent control status, pending litigation, and regulatory compliance problems before you invest time in deals.",
      icon: (
        <ListCheck size={24} className="text-cosmic-accent" />
      )
    },
    {
      title: "Speed & Cost Reduction",
      description: "Get conversations the same day instead of weeks later with fewer wasted hours.",
      expandedDescription: "Dramatically reduce time-to-connect from weeks to hours. Eliminate manual dialing, uncoordinated campaigns, and wasted effort on unqualified prospects. Focus your time only on property owners who are ready to transact.",
      icon: (
        <Star size={24} className="text-cosmic-accent" />
      )
    },
    {
      title: "Analytics Dashboard",
      description: "Track contactability %, response reasons, qualification rate, speed-to-connect, and cost per acquisition.",
      expandedDescription: "Comprehensive metrics tracking including contact rates, response patterns, qualification success rates, average time to connect, and detailed cost analysis per acquisition. Make data-driven decisions to optimize your acquisition process.",
      icon: (
        <BookOpen size={24} className="text-cosmic-accent" />
      )
    }
  ];
  
  const toggleFeature = (index: number) => {
    setOpenFeature(openFeature === index ? null : index);
  };
  
  return (
    <section id="features" className="w-full py-12 md:py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter">
            How Oblique AI works
          </h2>
          <p className="text-cosmic-muted text-lg">
            From buy-box to qualified conversations—automated real estate deal finder at scale
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Collapsible
              key={index}
              open={openFeature === index}
              onOpenChange={() => toggleFeature(index)}
              className={`rounded-xl border ${openFeature === index ? 'border-cosmic-light/40' : 'border-cosmic-light/20'} cosmic-gradient transition-all duration-300`}
            >
              <CollapsibleTrigger className="w-full text-left p-6 flex flex-col">
                <div className="flex justify-between items-start">
                  <div className="h-16 w-16 rounded-full bg-cosmic-light/10 flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-cosmic-muted transition-transform duration-200 ${
                      openFeature === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <h3 className="text-xl font-medium tracking-tighter mb-3">{feature.title}</h3>
                <p className="text-cosmic-muted">{feature.description}</p>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 pb-6 pt-2">
                <div className="pt-3 border-t border-cosmic-light/10">
                  <p className="text-cosmic-muted">{feature.expandedDescription}</p>
                  <div className="mt-4 flex justify-end">
                    <button className="text-cosmic-accent hover:text-cosmic-accent/80 text-sm font-medium">
                      Learn more →
                    </button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
        
        {/* Pipeline Section at bottom */}
        <div className="pt-16 mt-16 border-t border-cosmic-light/20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Prospects → Qualified Targets → Meetings Booked</h2>
            <p className="text-lg text-cosmic-muted max-w-3xl mx-auto">
              Move deals through Prospects → Qualified Targets → Meetings Booked with coordinated email, SMS, voicemail, and live calls.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Pipeline Chart */}
            <div className="space-y-8">
              <div className="bg-card rounded-lg p-6 border">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Prospects</span>
                    <span className="text-2xl font-bold text-primary">2,847</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div className="bg-primary h-3 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-6 border">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Qualified Targets</span>
                    <span className="text-2xl font-bold text-primary">421</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div className="bg-primary h-3 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-6 border">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Meetings Booked</span>
                    <span className="text-2xl font-bold text-primary">73</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div className="bg-primary h-3 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Properties Table */}
            <div className="bg-card rounded-lg border">
              <div className="p-6">
                <h3 className="font-semibold mb-4">Deal Pipeline</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground">
                    <span>Prospects</span>
                    <span>Qualified Targets</span>
                    <span>Meetings Booked</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
                      <span className="text-sm">Industrial property deal flow</span>
                      <span className="text-sm text-primary font-medium">247 qualified</span>
                      <span className="text-sm text-green-600 font-medium">18 booked</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
                      <span className="text-sm">Multifamily deal targets</span>
                      <span className="text-sm text-primary font-medium">132 qualified</span>
                      <span className="text-sm text-green-600 font-medium">31 booked</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 py-3">
                      <span className="text-sm">Retail lease opportunities</span>
                      <span className="text-sm text-primary font-medium">89 qualified</span>
                      <span className="text-sm text-green-600 font-medium">24 booked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
