
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

const Header = () => {
  const [activePage, setActivePage] = useState('product');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  useEffect(() => {
    // Apply theme immediately on load without flash
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = savedTheme === 'dark' || (!savedTheme);
    
    setIsDarkMode(prefersDark);
    
    // Apply theme class immediately
    requestAnimationFrame(() => {
      if (prefersDark) {
        document.documentElement.classList.remove('light-mode');
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode'); 
        document.documentElement.classList.add('light-mode');
      }
    });
  }, []);
  
  useEffect(() => {
    // Update theme when state changes
    requestAnimationFrame(() => {
      if (isDarkMode) {
        document.documentElement.classList.remove('light-mode');
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark-mode');
        document.documentElement.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
      }
    });
  }, [isDarkMode]);
  
  const handleNavClick = (page: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActivePage(page);
    
    // Handle special routes
    if (page === 'features') {
      window.location.href = '/features';
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
          <div className="nav-pill px-1 py-1 shadow-lg">
            <div className="flex items-center">
              <button 
                onClick={handleNavClick('product')}
                className={cn(
                  "nav-pill-item",
                  activePage === 'product' && 'active'
                )}
              >
                Product
              </button>
              <button 
                onClick={handleNavClick('how')}
                className={cn(
                  "nav-pill-item",
                  activePage === 'how' && 'active'
                )}
              >
                How it Works
              </button>
              <button 
                onClick={handleNavClick('features')}
                className={cn(
                  "nav-pill-item",
                  activePage === 'features' && 'active'
                )}
              >
                Features
              </button>
              <button 
                onClick={handleNavClick('cases')}
                className={cn(
                  "nav-pill-item",
                  activePage === 'cases' && 'active'
                )}
              >
                Case studies
              </button>
              <button 
                onClick={handleNavClick('pricing')}
                className={cn(
                  "nav-pill-item",
                  activePage === 'pricing' && 'active'
                )}
              >
                Pricing
              </button>
            </div>
          </div>
        </nav>
        
        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-4 right-4 bg-background/95 backdrop-blur-md py-4 px-6 border border-border rounded-2xl shadow-lg z-50">
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleNavClick('product')}
                className={`px-3 py-2 text-sm rounded-md transition-colors text-left ${
                  activePage === 'product' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Product
              </button>
              <button 
                onClick={handleNavClick('how')}
                className={`px-3 py-2 text-sm rounded-md transition-colors text-left ${
                  activePage === 'how' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                How it Works
              </button>
              <button 
                onClick={handleNavClick('features')}
                className={`px-3 py-2 text-sm rounded-md transition-colors text-left ${
                  activePage === 'features' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Features
              </button>
              <button 
                onClick={handleNavClick('cases')}
                className={`px-3 py-2 text-sm rounded-md transition-colors text-left ${
                  activePage === 'cases' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Case studies
              </button>
              <button 
                onClick={handleNavClick('pricing')}
                className={`px-3 py-2 text-sm rounded-md transition-colors text-left ${
                  activePage === 'pricing' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Pricing
              </button>
              
              {/* Theme toggle for mobile */}
              <div className="flex items-center justify-between px-3 py-2 border-t border-border mt-4 pt-4">
                <span className="text-sm text-muted-foreground">Theme</span>
                <div className="flex items-center gap-2">
                  <Moon size={16} className={`${isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
                  <Switch 
                    role="switch"
                    aria-checked={!isDarkMode}
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
              role="switch"
              aria-checked={!isDarkMode}
              checked={!isDarkMode} 
              onCheckedChange={toggleTheme} 
              className="data-[state=checked]:bg-primary"
            />
            <Sun size={18} className={`${!isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div className="rounded-2xl">
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90" 
              onClick={() => window.location.href = '/book'}
            >
              Get a 30-minute demo
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
