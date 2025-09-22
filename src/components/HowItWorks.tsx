import React from 'react';
const HowItWorks = () => {
  return <section id="how" className="w-full py-20 lg:py-24 px-6 md:px-12 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tighter text-foreground">
            How it Works — Step by Step
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <ol className="relative grid gap-10 before:absolute before:left-5 before:top-0 before:bottom-0 before:w-px before:bg-white/10 light-mode:before:bg-black/10">
            <li className="relative pl-14">
              <span className="absolute left-0 top-0 h-10 w-10 rounded-full bg-white/8 ring-1 ring-white/15 light-mode:bg-black/8 light-mode:ring-black/15 flex items-center justify-center">
                <svg className="h-5 w-5 text-slate-200 light-mode:text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <h3 className="text-base font-medium how-title">Tell Us What You're Looking For</h3>
            </li>
            <li className="relative pl-14">
              <span className="absolute left-0 top-0 h-10 w-10 rounded-full bg-white/8 ring-1 ring-white/15 light-mode:bg-black/8 light-mode:ring-black/15 flex items-center justify-center">
                <svg className="h-5 w-5 text-slate-200 light-mode:text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </span>
              <h3 className="text-base font-medium how-title">AI Sources Prospects</h3>
            </li>
            <li className="relative pl-14">
              <span className="absolute left-0 top-0 h-10 w-10 rounded-full bg-white/8 ring-1 ring-white/15 light-mode:bg-black/8 light-mode:ring-black/15 flex items-center justify-center">
                <svg className="h-5 w-5 text-slate-200 light-mode:text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </span>
              <h3 className="text-base font-medium how-title">Multi-Channel Outreach</h3>
            </li>
            <li className="relative pl-14">
              <span className="absolute left-0 top-0 h-10 w-10 rounded-full bg-white/8 ring-1 ring-white/15 light-mode:bg-black/8 light-mode:ring-black/15 flex items-center justify-center">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="h-5 w-5 text-slate-200 light-mode:text-slate-800">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h3 className="text-base font-medium how-title">Qualified Meetings Booked</h3>
            </li>
          </ol>

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