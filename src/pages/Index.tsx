
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Product from '@/components/Product';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <Product />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
