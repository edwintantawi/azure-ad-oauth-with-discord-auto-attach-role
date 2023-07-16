'use client';

import { signIn } from 'next-auth/react';

export function SignInWithAzureAd() {
  return (
    <button
      onClick={() => signIn('azure-ad')}
      className="text-white bg-blue-800 py-3 px-4"
    >
      Sign in with Azure AD
    </button>
  );
}
