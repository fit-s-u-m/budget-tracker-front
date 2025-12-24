import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { z } from "zod"

async function getUser(username: string): Promise<any | undefined> {
    const adminUser = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    if (username === adminUser) {
        return {
            id: "1",
            name: "Admin",
            username: adminUser,
            password: adminPassword
        }
    }
    return undefined
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ username: z.string(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { username, password } = parsedCredentials.data;
                    const user = await getUser(username);
                    if (!user) return null;

                    if (password === user.password) {
                        return user;
                    }
                }
                return null;
            },
        }),
    ],
});
