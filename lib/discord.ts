import { DiscordUserProfilePayload } from '~/types/discord-api';

class DiscordAPI {
  private BASE_URL = 'https://discord.com/api/v10';
  private GUILD_ID = process.env.DISCORD_GUILD_ID!;
  private CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
  private CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
  private BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
  private REDIRECT_URL = `${process.env.BASE_URL}/api/connects/discord`;

  private buildEndpoint(
    path: string,
    searchParams: Record<string, string> = {}
  ) {
    const url = new URL(`${this.BASE_URL}/${path}`);
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url;
  }

  getOAuthAuthorizeUrl() {
    return this.buildEndpoint('/oauth2/authorize', {
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URL,
      response_type: 'code',
      scope: ['identify', 'guilds.join'].join(' '),
    });
  }

  async getAccessToken(code: string): Promise<string> {
    const endpoint = this.buildEndpoint('/oauth2/token');

    const urlencoded = new URLSearchParams();
    urlencoded.append('client_id', this.CLIENT_ID);
    urlencoded.append('client_secret', this.CLIENT_SECRET);
    urlencoded.append('grant_type', 'authorization_code');
    urlencoded.append('code', code);
    urlencoded.append('redirect_uri', this.REDIRECT_URL);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: urlencoded,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get discord access token');
    }

    const responseJson = await response.json();
    return responseJson.access_token;
  }

  async attachRoleToUser(userId: string, role: string) {
    const endpoint = this.buildEndpoint(
      `/guilds/${this.GUILD_ID}/members/${userId}/roles/${role}`
    );

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${this.BOT_TOKEN}`,
      },
    });

    if (response.status !== 204) {
      throw new Error('Failed to attach role to user');
    }
  }

  async getUserProfile(
    accessToken: string
  ): Promise<DiscordUserProfilePayload> {
    const endpoint = this.buildEndpoint('/users/@me');

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }

    return response.json();
  }

  async getGuildMemberByUserId(
    userId: string
  ): Promise<DiscordUserProfilePayload | null> {
    const endpoint = this.buildEndpoint(
      `/guilds/${this.GUILD_ID}/members/${userId}`
    );

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bot ${this.BOT_TOKEN}`,
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }

    const responseJson = await response.json();
    return responseJson.user;
  }

  async addUserToGuild({
    userId,
    accessToken,
    nickname,
    roles = [],
  }: {
    userId: string;
    accessToken: string;
    nickname?: string;
    roles: string[];
  }) {
    const endpoint = this.buildEndpoint(
      `/guilds/${this.GUILD_ID}/members/${userId}`
    );

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${this.BOT_TOKEN}`,
      },
      body: JSON.stringify({
        access_token: accessToken,
        roles: roles,
        nick: nickname,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add user to guild');
    }
  }
}

export const discordAPI = new DiscordAPI();
