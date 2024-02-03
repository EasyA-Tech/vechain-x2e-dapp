import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';
import type { NextAuthOptions } from 'next-auth'
import { User, Account, Profile } from 'next-auth';

const TWITTER_ID = process.env.TWITTER_ID;
const TWITTER_SECRET = process.env.TWITTER_SECRET;

if (!TWITTER_ID || !TWITTER_SECRET) {
    throw new Error('Missing required environment variables TWITTER_ID and TWITTER_SECRET');
}

export const authOptions: NextAuthOptions = {
    providers: [
        TwitterProvider({
            clientId: TWITTER_ID,
            clientSecret: TWITTER_SECRET,
        }),
    ],
    callbacks: {
        async jwt({ token, account, user }: { token: any, account: any, user: any }) {

            if (account) {
                token.accessToken = account.oauth_token;
                token.refreshToken = account.oauth_token_secret;
            } else if (user) {
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
            }

            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken;

            return session;
        },

        async signIn(message: { user: User; account: Account | null; profile?: Profile | undefined; isNewUser?: boolean | undefined; error?: any }) {
            if (message.error) {
                console.log(`Failed to sign in: ${message.error}`);
                return false; // deny sign in
            } else {
                console.log(`Successfully signed in: ${JSON.stringify(message)}`);
                return true; // allow sign in
            }
        },
    },
};

export default NextAuth(authOptions)
