import React from 'react';
import logoLight from '@/assets/oblique-logo-light.svg';
import logoDark from '@/assets/oblique-logo-dark.svg';

const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-8 w-8">
        {/* Light mode logo */}
        <img 
          src={logoLight} 
          alt="Oblique AI Logo" 
          className="h-8 w-8 dark:hidden block" 
        />
        {/* Dark mode logo */}
        <img 
          src={logoDark} 
          alt="Oblique AI Logo" 
          className="h-8 w-8 hidden dark:block" 
        />
      </div>
      <span className="text-xl font-medium text-foreground">Oblique AI</span>
    </div>
  );
};
export default Logo;