import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Product = () => {
  return (
    <section id="product" className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Prospects → Qualified Targets → Meetings Booked</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
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
                    <span className="text-sm">Multifamily acquisition targets</span>
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
    </section>
  );
};
export default Product;