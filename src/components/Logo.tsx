import React, { useState } from 'react';
import obliqueLogoNew from '@/assets/oblique-logo-new.png';

const Logo = () => {
  const [imageError, setImageError] = useState(false);
  
  if (imageError) {
    return (
      <>
        <span className="h-9 w-9 rounded-md flex items-center justify-center ring-1 bg-white/10 ring-white/15 text-slate-100 light-mode:bg-black/10 light-mode:ring-black/15 light-mode:text-slate-900">
          <span className="text-sm font-bold">OA</span>
        </span>
        <span className="text-slate-200 text-xl font-semibold tracking-tight light-mode:text-slate-900">Oblique AI</span>
      </>
    );
  }

  return (
    <>
      <span className="h-9 w-9 rounded-md flex items-center justify-center ring-1 bg-white/10 ring-white/15 text-slate-100 light-mode:bg-black/10 light-mode:ring-black/15 light-mode:text-slate-900">
        <img 
          src={obliqueLogoNew}
          alt="Oblique AI" 
          className="h-6 w-6 brightness-0 invert light-mode:brightness-75 light-mode:invert-0 light-mode:contrast-150" 
          onError={() => setImageError(true)}
        />
      </span>
      <span className="text-slate-200 text-xl font-semibold tracking-tight light-mode:text-slate-900">Oblique AI</span>
    </>
  );
};
export default Logo;