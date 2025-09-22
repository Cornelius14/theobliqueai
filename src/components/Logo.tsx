import React, { useState } from 'react';
import obliqueLogoNew from '@/assets/oblique-logo-new.png';

const Logo = () => {
  const [imageError, setImageError] = useState(false);
  
  if (imageError) {
    return (
      <>
        <span className="h-9 w-9 rounded-md flex items-center justify-center ring-1 bg-muted ring-border text-foreground">
          <span className="text-sm font-bold">OA</span>
        </span>
        <span className="text-foreground text-xl font-semibold tracking-tight">Oblique AI</span>
      </>
    );
  }

  return (
    <>
      <span className="h-9 w-9 rounded-md flex items-center justify-center ring-1 bg-muted ring-border">
        <img 
          src={obliqueLogoNew}
          alt="Oblique AI" 
          className="h-6 w-6 brightness-0 invert dark-mode:invert light-mode:brightness-0 light-mode:invert-0" 
          onError={() => setImageError(true)}
        />
      </span>
      <span className="text-foreground text-xl font-semibold tracking-tight">Oblique AI</span>
    </>
  );
};
export default Logo;