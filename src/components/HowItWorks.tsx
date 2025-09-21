import React from 'react';
import { Search, Database, Bot, Calendar } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Tell Us What You're Looking For",
      description: "Share the exact type of lead you need."
    },
    {
      icon: Database,
      title: "Unlock Thousands of Prospects",
      description: "Our system instantly sources a large pool of potential leads tailored to your criteria."
    },
    {
      icon: Bot,
      title: "Let AI Do the Outreach",
      description: "Oblique AI's agent calls, texts, leaves voicemails and emails every lead on your behalf, qualifying them in real time."
    },
    {
      icon: Calendar,
      title: "Watch Your Calendar Fill Up",
      description: "Sit back while we schedule meetings only with genuinely interested prospects—no wasted time."
    }
  ];

  return (
    <section id="how" className="w-full py-20 px-6 md:px-12 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter text-foreground">
            How it Works — Step by Step
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="relative mx-auto w-fit">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <step.icon size={32} className="text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">{index + 1}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;