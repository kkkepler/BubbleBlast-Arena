'use client';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const Game = dynamic(() => import('@/components/game/Game'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-16 h-16 animate-spin text-primary" />
    </div>
  ),
});

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    console.log('Page mounted, setting isClient to true');
    setIsClient(true);
  }, []);

  if (!isClient) {
    console.log('Rendering loading state...');
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  console.log('Rendering Game component...');
  return (
    <main className="h-full w-full">
      <Game />
    </main>
  );
}