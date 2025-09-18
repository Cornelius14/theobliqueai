
import React from 'react';
import { Building2, Crosshair } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center relative">
        <Building2 size={16} className="text-primary-foreground" />
        <Crosshair size={12} className="text-primary-foreground absolute top-0 right-0 opacity-80" />
      </div>
      <span className="text-xl font-medium text-foreground">AssetRadar</span>
    </div>
  );
};

export default Logo;
