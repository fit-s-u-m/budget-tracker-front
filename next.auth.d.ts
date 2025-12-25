import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      telegram_id: string;
      account_id: string;
    } & DefaultSession["user"];
  }

  interface User {
    telegram_id: string;
    account_id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    telegram_id: string;
    account_id: string;
  }
}
