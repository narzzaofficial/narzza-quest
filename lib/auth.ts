import { betterAuth } from "better-auth";
import { mcp, magicLink } from "better-auth/plugins";
import { Pool } from "pg";

// Hand-off for the activate route: sendMagicLink stashes the token here
// instead of emailing it, since the "email" step never sends real mail —
// the token is shown directly to the already-logged-in user in Settings.
export const pendingMagicLinkTokens = new Map<string, string>();

export const auth = betterAuth({
    database: new Pool({ connectionString: process.env.DATABASE_URL }),
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    emailAndPassword: {
        enabled: true,
        disableSignUp: true,
    },
    plugins: [
        mcp({ loginPage: "/mcp/login" }),
        magicLink({
            expiresIn: 600,
            disableSignUp: false,
            sendMagicLink: async ({ email, token }) => {
                pendingMagicLinkTokens.set(email, token);
            },
        }),
    ],
});
