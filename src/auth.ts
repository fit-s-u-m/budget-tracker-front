import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { verifyOTP } from "./lib/api"
import { authConfig } from "./auth.config"

interface VerifyOTPResponse {
  telegram_id: number;
  account_id: number;
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "OTP",
      credentials: {
        otp: { label: "OTP", type: "text" },
      },

      async authorize(credentials) {
        const parsed = z
          .object({
            otp: z.string().length(6),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const { otp } = parsed.data;
        console.log("Received OTP for authorization:", otp);
        try {
          const res:VerifyOTPResponse = await verifyOTP(otp)
          console.log("OTP verification response:", res);
          console.log("telegram_id:", res.telegram_id, "account_id:", res.account_id);
          if(res.telegram_id && res.account_id) {
              return {
                id: String(res.telegram_id),
                telegram_id: String(res.telegram_id),
                account_id: String(res.account_id),
              };
           }
          return null;
        } catch (error) {
          console.error("OTP verification failed:", error);
          return null;
        }
      },
    }),
  ],
});
