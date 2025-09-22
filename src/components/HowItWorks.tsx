import React from 'react';
const HowItWorks = () => {
  return <section id="how" className="w-full py-20 lg:py-24 px-6 md:px-12 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tighter text-foreground">
            How it Works — Step by Step
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start py-[20px] px-[26px] mx-[133px]">
          

          {/* Right column with details */}
          <div className="space-y-6 md:space-y-8">
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-medium text-foreground mb-4">Share the exact type of lead you need.</h3>
              <p className="text-sm text-muted-foreground">
                Specify your criteria using natural language — location, property type, price range, or any other requirements.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-medium text-foreground mb-4">Our system instantly sources a large pool of potential leads tailored to your criteria.</h3>
              <p className="text-sm text-muted-foreground">
                We identify thousands of prospects from multiple data sources and filter them to match your exact specifications.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-medium text-foreground mb-4">Oblique AI's agent calls, texts, leaves voicemails and emails every lead on your behalf, qualifying them in real time.</h3>
              <p className="text-sm text-muted-foreground">Our AI handles all outreach across multiple channels, qualifying prospects against your criteria requirements automatically.</p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-medium text-foreground mb-4">Sit back while we schedule meetings only with genuinely interested prospects—no wasted time.</h3>
              <p className="text-sm text-muted-foreground">
                Only qualified, interested prospects make it to your calendar. No tire-kickers, just real opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HowItWorks;