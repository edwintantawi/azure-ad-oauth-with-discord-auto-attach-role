'use client';

import { useRouter } from 'next/navigation';

export function ConnectWithDiscord() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/api/connects/discord');
  };

  return (
    <button onClick={handleClick} className="text-white bg-blue-600 py-3 px-4">
      Connect with Discord
    </button>
  );
}
