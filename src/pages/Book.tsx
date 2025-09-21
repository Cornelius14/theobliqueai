import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Book = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: "Error", 
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    if (!validatePhone(formData.phone)) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success!",
        description: "Thank you for booking a demo. We'll be in touch soon.",
      });
      
      // Reset form
      setFormData({ email: '', name: '', phone: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 pt-16">
        <section className="w-full py-20 px-6 md:px-12">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-6 mb-12">
              <h1 className="text-4xl md:text-5xl font-medium tracking-tighter text-foreground">
                Get a 30-minute demo
              </h1>
              <p className="text-lg text-muted-foreground">
                See how Oblique AI can transform your real estate prospecting. We'll show you the platform and answer all your questions.
              </p>
            </div>

            {/* Form */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="h-12"
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-12"
                    placeholder="your.email@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="h-12"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? 'Booking Demo...' : 'Book Demo'}
                </Button>
              </form>

              <div className="mt-8 pt-8 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Teams & Enterprise only — pricing discussed on a call
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <h3 className="font-medium text-foreground">30 Minutes</h3>
                <p className="text-sm text-muted-foreground">Comprehensive platform walkthrough</p>
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-medium text-foreground">Personalized</h3>
                <p className="text-sm text-muted-foreground">Tailored to your specific use case</p>
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-medium text-foreground">No Commitment</h3>
                <p className="text-sm text-muted-foreground">Just see if it's a good fit</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Book;