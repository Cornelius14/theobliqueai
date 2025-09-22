import React from 'react';
const HowItWorks = () => {
  return <section id="how" className="w-full py-20 px-6 md:px-12 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tighter text-foreground">
            How it Works — Step by Step
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Visual Progress Chart */}
          <div className="space-y-6">
            {/* Step Cards */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-4 p-6 rounded-lg bg-card border border-border transition-all hover:shadow-md">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Tell Us What You're Looking For</h3>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full w-full"></div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-px h-6 bg-border"></div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4 p-6 rounded-lg bg-card border border-border transition-all hover:shadow-md">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">AI Sources Prospects</h3>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full w-full"></div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-px h-6 bg-border"></div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4 p-6 rounded-lg bg-card border border-border transition-all hover:shadow-md">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Multi-Channel Outreach</h3>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full w-full"></div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-px h-6 bg-border"></div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-4 p-6 rounded-lg bg-card border border-border transition-all hover:shadow-md">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Qualified Meetings Booked</h3>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column with details */}
          <div className="space-y-6">
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