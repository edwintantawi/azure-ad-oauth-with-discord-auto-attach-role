import { redirect } from 'next/navigation';
import { discordAPI } from '~/lib/discord';

export async function GET(request: Request) {
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
    // TODO: add the user to guild rather than show error?
    return redirect(`/?error=NotJoinedGuild`);
  }

  await discordAPI.attachRoleToUser(
    userProfile.id,
    process.env.DISCORD_ROLE_ID!
  );

  redirect('/');
}
