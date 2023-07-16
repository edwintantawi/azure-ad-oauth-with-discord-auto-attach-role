import { getServerSession } from 'next-auth';
import { SignInWithAzureAd } from '~/app/sign-in-with-azure-ad';
import { ConnectWithDiscord } from '~/app/connect-with-discord';
import { SignOut } from '~/app/sign-out';
import { authOptions } from '~/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="h-screen grid place-content-center">
      <div className="p-4">
        {session === null && <SignInWithAzureAd />}
        {session !== null && (
          <div>
            <ConnectWithDiscord />
            <SignOut />
          </div>
        )}

        <pre>
          <code className="font-mono">{JSON.stringify(session, null, 2)}</code>
        </pre>
      </div>
    </main>
  );
}
