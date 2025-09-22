import React from 'react';

const Logo = () => {
  return (
    <>
      <span className="h-9 w-9 rounded-md flex items-center justify-center ring-1 bg-white/10 ring-white/15 text-slate-100 light-mode:bg-black/10 light-mode:ring-black/15 light-mode:text-slate-900">
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          className="h-6 w-6"
        >
          {/* Building base */}
          <rect x="6" y="12" width="8" height="10" fill="currentColor"/>
          <rect x="8" y="14" width="1.5" height="1.5" fill="white" className="dark:fill-black" opacity="0.3"/>
          <rect x="10.5" y="14" width="1.5" height="1.5" fill="white" className="dark:fill-black" opacity="0.3"/>
          <rect x="8" y="16.5" width="1.5" height="1.5" fill="white" className="dark:fill-black" opacity="0.3"/>
          <rect x="10.5" y="16.5" width="1.5" height="1.5" fill="white" className="dark:fill-black" opacity="0.3"/>
          <rect x="8" y="19" width="1.5" height="3" fill="white" className="dark:fill-black" opacity="0.4"/>
          
          {/* Building top section */}
          <rect x="7" y="8" width="6" height="4" fill="currentColor"/>
          <rect x="8.5" y="9.5" width="1" height="1" fill="white" className="dark:fill-black" opacity="0.3"/>
          <rect x="10.5" y="9.5" width="1" height="1" fill="white" className="dark:fill-black" opacity="0.3"/>
          
          {/* Spear/antenna on top */}
          <line x1="10" y1="8" x2="10" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <polygon points="10,2 8.5,5 11.5,5" fill="currentColor"/>
        </svg>
      </span>
      <span className="text-slate-200 text-xl font-semibold tracking-tight light-mode:text-slate-900">Oblique AI</span>
    </>
  );
};
export default Logo;