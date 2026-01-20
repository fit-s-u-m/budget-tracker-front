import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { verifyOTP } from "./lib/api"
import { authConfig } from "./auth.config"

interface VerifyOTPResponse {
  user_id: number;
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "OTP",
      credentials: {
        otp: { label: "OTP", type: "text" },
        username: { label: "Username", type: "text" },
      },


      async authorize(credentials) {
        console.log("RAW credentials:", credentials)
        const parsed = z
          .object({
            otp: z.string().length(6),
            username: z.string()
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const { otp, username } = parsed.data;
        console.log("Received OTP for authorization:", otp);
        try {
          const res: VerifyOTPResponse = await verifyOTP(username, otp)
          console.log("OTP verification response:", res);
          console.log("user_id: ", res.user_id);
          if (res.user_id) {
            return {
              id: String(res.user_id),
              user_id: String(res.user_id),
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
