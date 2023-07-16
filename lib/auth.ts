import { AuthOptions } from 'next-auth';
import AzureADbProvider from 'next-auth/providers/azure-ad';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { database } from '~/lib/database';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(database),
  session: {
    strategy: 'jwt',
  },
  providers: [
    AzureADbProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const existingUser = await database.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!existingUser) {
        token.id = user.id;
        return token;
      }

      return {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        picture: existingUser.image,
      };
    },
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }

      return session;
    },
  },
};
