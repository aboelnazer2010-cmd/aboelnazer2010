'use client';

import dynamic from 'next/dynamic';

const NexusApp = dynamic(() => import('@/components/NexusApp'), {
  ssr: false,
});

export default function ChatPage() {
  return <NexusApp />;
}
