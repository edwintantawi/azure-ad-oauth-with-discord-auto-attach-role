'use client';

import { signOut } from 'next-auth/react';

export function SignOut() {
  return (
    <button
      onClick={() => signOut()}
      className="text-white bg-red-700 py-3 px-4"
    >
      Sign Out
    </button>
  );
}
