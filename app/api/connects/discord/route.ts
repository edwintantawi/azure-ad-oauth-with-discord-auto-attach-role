import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '~/lib/auth';
import { discordAPI } from '~/lib/discord';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (session === null) return new Response('Unauthorized', { status: 401 });

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return redirect(discordAPI.getOAuthAuthorizeUrl().toString());
  }

  const accessToken = await discordAPI.getAccessToken(code);
  const userProfile = await discordAPI.getUserProfile(accessToken);
  const isAlreadyJoinGuild = await discordAPI
    .getGuildMemberByUserId(userProfile.id)
    .then(Boolean);

  if (!isAlreadyJoinGuild) {
    await discordAPI.addUserToGuild({
      accessToken,
      userId: userProfile.id,
      roles: [process.env.DISCORD_ROLE_ID!],
    });
    return redirect('/');
  }

  await discordAPI.attachRoleToUser(
    userProfile.id,
    process.env.DISCORD_ROLE_ID!
  );

  redirect('/');
}
