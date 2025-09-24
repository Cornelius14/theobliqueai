import React from 'react';
import HubSpokesDiagram from './HubSpokesDiagram';

const HowItWorks = () => {
  return (
    <section id="how" className="w-full py-20 lg:py-24 px-6 md:px-12 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tighter text-foreground">
            How it Works — Step by Step  
          </h2>
        </div>
        <HubSpokesDiagram />
      </div>
    </section>
  );
};
export default HowItWorks;