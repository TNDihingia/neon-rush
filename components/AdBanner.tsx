'use client';

import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slotId = '1234567890',
  format = 'auto',
  className = '',
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (clientId && typeof window !== 'undefined') {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        // Safe catch for adblockers
      }
    }
  }, [clientId]);

  if (!clientId) {
    // Development / Setup placeholder preview
    return (
      <div
        className={`w-full max-w-lg mx-auto py-2 px-3 rounded-xl border border-dashed border-white/10 bg-black/40 text-center flex flex-col items-center justify-center select-none ${className}`}
      >
        <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-gray-500 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
          ADSENSE AD PLACEMENT
        </div>
        <p className="text-[9px] text-gray-600 font-mono mt-0.5">
          Add NEXT_PUBLIC_ADSENSE_CLIENT_ID to activate live ads
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full flex justify-center overflow-hidden my-2 ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '50px' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};
