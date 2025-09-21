import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, Database, Bot, Calendar } from 'lucide-react';

const How = () => {
  const steps = [
    {
      icon: Search,
      title: "Tell Us What You're Looking For",
      description: "Share the exact type of lead you need.",
      detail: "Specify your criteria including location, property type, size, price range, and any other requirements. Our AI understands complex real estate parameters."
    },
    {
      icon: Database,
      title: "Unlock Thousands of Prospects",
      description: "Our system instantly sources a large pool of potential leads tailored to your criteria.",
      detail: "We tap into comprehensive databases, public records, and proprietary data sources to identify properties and owners that match your exact specifications."
    },
    {
      icon: Bot,
      title: "Let AI Do the Outreach",
      description: "Oblique AI's agent calls, texts, leaves voicemails and emails every lead on your behalf, qualifying them in real time.",
      detail: "Our AI conducts intelligent conversations, asks qualifying questions, and identifies genuinely interested prospects while filtering out unqualified leads."
    },
    {
      icon: Calendar,
      title: "Watch Your Calendar Fill Up",
      description: "Sit back while we schedule meetings only with genuinely interested prospects—no wasted time.",
      detail: "Qualified prospects are automatically scheduled into your calendar with all relevant information and context from their conversations with our AI."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="w-full py-20 px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-medium tracking-tighter text-foreground">
              How Oblique AI Works
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              From criteria to qualified meetings in four simple steps
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="w-full py-20 px-6 md:px-12 bg-card">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-16">
              {steps.map((step, index) => (
                <div key={index} className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Visual */}
                  <div className="flex-1 flex justify-center">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <step.icon size={48} className="text-primary" />
                      </div>
                      {/* Step number */}
                      <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-lg">{index + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4 text-center lg:text-left">
                    <h3 className="text-2xl md:text-3xl font-medium text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-lg text-primary font-medium">
                      {step.description}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center mt-20 space-y-6">
              <h3 className="text-2xl md:text-3xl font-medium text-foreground">
                Ready to get started?
              </h3>
              <a 
                href="/book"
                className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                Get a 30-minute demo
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default How;