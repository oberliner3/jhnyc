import React from 'react';
import Image from 'next/image';

interface PaymentMethodProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

function PaymentMethod({ src, alt, width = 38, height = 24 }: PaymentMethodProps) {
  return (
    <div className="flex items-center justify-center bg-white rounded border border-gray-200 p-1">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-contain"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}

export function PaymentMethods() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Credit Cards */}
      <PaymentMethod 
        src="/payment-logos/cards/visa.svg" 
        alt="Visa" 
      />
      <PaymentMethod 
        src="/payment-logos/cards/mastercard.svg" 
        alt="Mastercard" 
      />
      <PaymentMethod 
        src="/payment-logos/cards/american-express.svg" 
        alt="American Express" 
      />
      <PaymentMethod 
        src="/payment-logos/cards/discover.svg" 
        alt="Discover" 
      />
      <PaymentMethod 
        src="/payment-logos/cards/jcb.svg" 
        alt="JCB" 
      />
      
      {/* Digital Wallets */}
      <PaymentMethod 
        src="/payment-logos/wallets/apple-pay.svg" 
        alt="Apple Pay" 
      />
      <PaymentMethod 
        src="/payment-logos/wallets/google-pay.svg" 
        alt="Google Pay" 
      />
      <PaymentMethod 
        src="/payment-logos/apm/paypal.svg" 
        alt="PayPal" 
      />
    </div>
  );
}