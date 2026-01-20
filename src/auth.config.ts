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
        !!auth?.user?.user_id

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
        token.user_id = (user as any).user_id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.user_id = token.user_id as string;
      }
      return session;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
