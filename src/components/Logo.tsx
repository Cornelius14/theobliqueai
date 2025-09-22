import React from 'react';
import logoLight from '@/assets/oblique-logo-light.svg';
import logoDark from '@/assets/oblique-logo-dark.svg';

const Logo = () => {
  return (
    <>
      <span className="h-9 w-9 rounded-md flex items-center justify-center ring-1 bg-white/10 ring-white/15 text-slate-100 light-mode:bg-black/10 light-mode:ring-black/15 light-mode:text-slate-900">
        <img 
          src={logoLight} 
          alt="Oblique AI" 
          className="h-6 w-6" 
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
          }}
        />
        <span className="text-sm font-bold hidden">OA</span>
      </span>
      <span className="text-slate-200 text-xl font-semibold tracking-tight light-mode:text-slate-900">Oblique AI</span>
    </>
  );
};
export default Logo;