import React from 'react';

const Product = () => {
  return (
    <section id="product" className="w-full py-20 px-6 md:px-12 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tighter text-foreground">
          Prospects → Qualified Targets → Meetings Booked
        </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Pipeline Chart */}
          <div className="space-y-8">
            {/* Pipeline Visual */}
            <div className="space-y-4">
              <div className="relative">
                {/* Row 1: Prospects */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-primary"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-foreground">Prospects</h3>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">487</span>
                    <p className="text-sm text-muted-foreground">targets reached</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center my-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M12 5v14m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Row 2: Qualified Targets */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-accent"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-foreground">Qualified Targets</h3>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">76</span>
                    <p className="text-sm text-muted-foreground">buy-box fit</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center my-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M12 5v14m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Row 3: Meetings Booked */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-secondary"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-foreground">Meetings Booked</h3>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">23</span>
                    <p className="text-sm text-muted-foreground">meetings</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground text-center">
              Move deals through Prospects → Qualified Targets → Meetings Booked with coordinated email, SMS, voicemail, and live calls.
            </p>
          </div>

          {/* Right column placeholder */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-medium text-foreground mb-4">Pipeline Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Real-time dashboard showing conversion rates, response times, and meeting quality metrics.
              </p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  TODO: Wire real dashboard data later
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Product;
