
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import { Menu, X, CircleDot, LayoutDashboard, DollarSign, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';

const Header = () => {
  const [activePage, setActivePage] = useState('features');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  
  useEffect(() => {
    // Load preference from localStorage on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
    } else {
      // Default to dark mode
      setIsDarkMode(true);
    }
    
    // Apply the theme to the document when it changes
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  
  const handleNavClick = (page: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActivePage(page);
    
    // Handle special routes
    if (page === 'how') {
      window.location.href = '/how';
      return;
    }
    if (page === 'features') {
      window.location.href = '/features';
      return;
    }
    if (page === 'book') {
      window.location.href = '/book';
      return;
    }
    
    // Handle anchor links
    const element = document.getElementById(page);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="sticky top-0 z-50 pt-8 px-4">
      <header className="w-full max-w-7xl mx-auto py-3 px-6 md:px-8 flex items-center justify-between">
        <div className="p-3">
          <Logo />
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-3 rounded-2xl text-muted-foreground hover:text-foreground"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2" style={{ marginLeft: '-1cm' }}>
          <div className="rounded-full px-1 py-1 backdrop-blur-md bg-background/80 border border-border shadow-lg">
            <ToggleGroup type="single" value={activePage} onValueChange={(value) => value && setActivePage(value)}>
              <ToggleGroupItem 
                value="product"
                className={cn(
                  "px-4 py-2 rounded-full transition-colors relative",
                  activePage === 'product' ? 'text-accent-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                onClick={handleNavClick('product')}
              >
                Product
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="how" 
                className={cn(
                  "px-4 py-2 rounded-full transition-colors relative",
                  activePage === 'how' ? 'text-accent-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                onClick={handleNavClick('how')}
              >
                How it Works
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="features" 
                className={cn(
                  "px-4 py-2 rounded-full transition-colors relative",
                  activePage === 'features' ? 'text-accent-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                onClick={handleNavClick('features')}
              >
                Features
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="cases" 
                className={cn(
                  "px-4 py-2 rounded-full transition-colors relative",
                  activePage === 'cases' ? 'text-accent-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                onClick={handleNavClick('cases')}
              >
                Case studies
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="pricing" 
                className={cn(
                  "px-4 py-2 rounded-full transition-colors relative",
                  activePage === 'pricing' ? 'text-accent-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                onClick={handleNavClick('pricing')}
              >
                Pricing
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="book" 
                className={cn(
                  "px-4 py-2 rounded-full transition-colors relative",
                  activePage === 'book' ? 'text-accent-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                onClick={handleNavClick('book')}
              >
                Book demo
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </nav>
        
        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-4 right-4 bg-background/95 backdrop-blur-md py-4 px-6 border border-border rounded-2xl shadow-lg z-50">
            <div className="flex flex-col gap-4">
              <a 
                href="#product" 
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  activePage === 'product' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={handleNavClick('product')}
              >
                Product
              </a>
              <a 
                href="/how" 
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  activePage === 'how' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={handleNavClick('how')}
              >
                How it Works
              </a>
              <a 
                href="/features" 
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  activePage === 'features' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={handleNavClick('features')}
              >
                Features
              </a>
              <a 
                href="#cases" 
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  activePage === 'cases' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={handleNavClick('cases')}
              >
                Case studies
              </a>
              <a 
                href="#pricing" 
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  activePage === 'pricing' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={handleNavClick('pricing')}
              >
                Pricing
              </a>
              <a 
                href="/book" 
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  activePage === 'book' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={handleNavClick('book')}
              >
                Book demo
              </a>
              
              {/* Add theme toggle for mobile */}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <div className="flex items-center gap-2">
                  <Moon size={16} className={`${isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
                  <Switch 
                    checked={!isDarkMode} 
                    onCheckedChange={toggleTheme} 
                    className="data-[state=checked]:bg-primary"
                  />
                  <Sun size={16} className={`${!isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="hidden md:flex items-center gap-4">
          {/* Theme toggle for desktop */}
          <div className="flex items-center gap-2 rounded-full px-3 py-2">
            <Moon size={18} className={`${isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
            <Switch 
              checked={!isDarkMode} 
              onCheckedChange={toggleTheme} 
              className="data-[state=checked]:bg-primary"
            />
            <Sun size={18} className={`${!isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div className="rounded-2xl">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleNavClick('book')}>Get a 30-minute demo</Button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
