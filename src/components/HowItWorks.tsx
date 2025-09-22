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
          <div className="space-y-8">
            {/* Step Progress Visual */}
            <div className="space-y-4">
              <div className="relative">
                {/* Step 1 */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-foreground">Tell Us What You're Looking For</h3>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div style={{
                      width: '100%'
                    }} className="bg-primary h-2 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center my-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M12 5v14m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-accent">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-foreground">Unlock Thousands of Prospects</h3>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-accent h-2 rounded-full" style={{
                      width: '75%'
                    }}></div>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center my-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M12 5v14m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-secondary">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-foreground">Let AI Do the Outreach</h3>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-secondary h-2 rounded-full" style={{
                      width: '50%'
                    }}></div>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center my-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M12 5v14m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Step 4 */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">4</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-foreground">Watch Your Calendar Fill Up</h3>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-primary h-2 rounded-full" style={{
                      width: '25%'
                    }}></div>
                    </div>
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