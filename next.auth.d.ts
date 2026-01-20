import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      user_id: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    user_id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user_id: string;
  }
}
