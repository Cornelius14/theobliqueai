
import React from 'react';
import { Building2, Target } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-8 w-8">
        {/* Building silhouette */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 size={16} className="text-primary" />
        </div>
        {/* Target rings overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Target size={20} className="text-primary opacity-70" />
        </div>
      </div>
      <span className="text-xl font-medium text-foreground">Oblique AI</span>
    </div>
  );
};

export default Logo;
