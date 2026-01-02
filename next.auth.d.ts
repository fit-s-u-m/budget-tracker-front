import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      telegram_id: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    telegram_id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    telegram_id: string;
  }
}
