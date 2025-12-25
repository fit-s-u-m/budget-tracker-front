import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            console.log('Authorization check for URL:', nextUrl.pathname, auth);
            const isLoggedIn =
                !!auth?.user?.telegram_id &&
                !!auth?.user?.account_id;

            const isOnLogin = nextUrl.pathname.startsWith('/login');

            if (isOnLogin) {
                if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
                return true;
            }

            // Protect all other routes
            return isLoggedIn;
        },
        async jwt({ token, user }) {
            if (user) {
                token.telegram_id = (user as any).telegram_id;
                token.account_id = (user as any).account_id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.telegram_id = token.telegram_id as string;
                session.user.account_id = token.account_id as string;
            }
            return session;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
