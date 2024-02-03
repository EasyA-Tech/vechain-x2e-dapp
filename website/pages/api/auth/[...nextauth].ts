import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

const TWITTER_ID = process.env.TWITTER_ID;
const TWITTER_SECRET = process.env.TWITTER_SECRET;

if (!TWITTER_ID || !TWITTER_SECRET) {
    throw new Error('Missing required environment variables TWITTER_ID and TWITTER_SECRET');
}

export const authOptions = {
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
    },
    events: {
        async signIn(message: { error: any; }) {
            if (message.error) {
                console.log(`Failed to sign in: ${message.error}`);
            } else {
                console.log(`Successfully signed in: ${JSON.stringify(message)}`);
            }
        },
    },
};

export default NextAuth(authOptions)
