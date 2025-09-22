import React from 'react';
import logoLight from '@/assets/oblique-logo-light.svg';
import logoDark from '@/assets/oblique-logo-dark.svg';

const Logo = () => {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-9 w-9 rounded-md bg-white/6 ring-1 ring-white/10 light-mode:bg-black/5 light-mode:ring-black/10 flex items-center justify-center text-slate-200 light-mode:text-slate-800">
        {/* Light mode logo */}
        <img 
          src={logoLight} 
          alt="Oblique AI Logo" 
          className="h-6 w-6 dark:hidden block" 
        />
        {/* Dark mode logo */}
        <img 
          src={logoDark} 
          alt="Oblique AI Logo" 
          className="h-6 w-6 hidden dark:block" 
        />
      </div>
      <span className="text-xl font-medium text-foreground">Oblique AI</span>
    </div>
  );
};
export default Logo;