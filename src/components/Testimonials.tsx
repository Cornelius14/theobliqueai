
import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      title: "🏡 The Solaire Collection",
      metric: "Same-day qualified calls booked",
      quote: "Identified luxury homeowners in legal STR markets. Outreach confirmed interest and pricing. Using Oblique, the company scaled from 0 to 70 properties in just 2 months—becoming the fastest-growing STR property manager in the US.",
      author: "The Solaire Collection",
      position: "STR Portfolio Manager",
      avatar: "bg-muted"
    },
    {
      title: "🏭 Southeast Industrial",
      metric: "612 warehouses → 6 at target price in ~58 minutes",
      quote: "612 warehouses identified in Nashville; 487 contactable; 121 live connects; 6 at target price. First live call in ~58 minutes.",
      author: "Southeast Industrial",
      position: "Industrial Acquisition Team",
      avatar: "bg-muted"
    },
    {
      title: "🏢 Hudson Walk-Ups", 
      metric: "1,940 units → 9 under diligence in 14 days",
      quote: "1,940 small multifamily units; 76 qualified sellers; 9 under diligence within 14 days.",
      author: "Hudson Walk-Ups Group",
      position: "Acquisition Manager", 
      avatar: "bg-muted"
    }
  ];
  
  return (
    <section id="cases" className="w-full py-20 px-6 md:px-12 bg-card relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 cosmic-grid opacity-20"></div>
      
      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter text-foreground">
            Field-proven results across use cases
          </h2>
          <p className="text-muted-foreground text-lg">
            See how Oblique AI transforms real estate acquisition workflows
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="p-6 rounded-xl border border-border bg-background/80 backdrop-blur-sm hover:border-border/60 transition-all duration-300"
            >
              <div className="mb-4">
                <h3 className="text-lg/7 font-semibold text-strong">{testimonial.title}</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-lg font-bold text-primary">{testimonial.metric}</p>
              </div>
              
              <p className="text-foreground/90 mb-6 text-sm leading-relaxed">"{testimonial.quote}"</p>
              
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full ${testimonial.avatar} bg-muted flex-shrink-0`}></div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">{testimonial.author}</h4>
                  <p className="text-xs text-muted-foreground">{testimonial.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
