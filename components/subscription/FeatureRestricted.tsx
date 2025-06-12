'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface FeatureRestrictedProps {
  title?: string;
  message?: string;
  featureName?: string;
}

export default function FeatureRestricted({
  title = "Feature Requires Upgrade",
  message = "Unlock this feature by upgrading to our Basic, Premium, or Enterprise plans. Get valuable insights into your business performance.",
  featureName = "this feature"
}: FeatureRestrictedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center max-w-md mx-auto">
      <div className="bg-yellow-50 rounded-full p-8 mb-6">
        <Image 
          src="/icons/lock.svg" 
          alt="Feature Locked" 
          width={64} 
          height={64}
          className="h-16 w-16 text-yellow-500"
          onError={(e) => {
            // Fallback if image doesn't exist
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.style.display = 'none';
          }}
        />
      </div>
      
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      
      <p className="text-gray-600 mb-8">
        {message}
      </p>
      
      <Button asChild className="px-8 py-6 h-auto text-lg">
        <Link href="/dashboard/subscription">
          Upgrade Your Plan
        </Link>
      </Button>
    </div>
  );
} 