import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/lib/db"
import {
  user,
  session,
  account,
  verification,
} from "@/lib/db/schema/auth"
import { resend } from "@/lib/resend"
import { buildVerificationEmail } from "@/lib/email/verification-template"
import { buildResetPasswordEmail } from "@/lib/email/reset-password-template"

const FROM = "ArticleIt <noreply@m0nis.com>"

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
    // Point Better Auth at our existing tables — no auto-generation
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user: u, url }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("\n[auth:dev] Password reset URL (use this if email doesn't arrive):\n", url, "\n")
      }
      const { subject, html } = buildResetPasswordEmail({ name: u.name, url })
      const { error } = await resend.emails.send({ from: FROM, to: u.email, subject, html })
      if (error) console.error("[auth] Failed to send reset password email:", error)
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    callbackURL: "/onboarding",
    sendVerificationEmail: async ({ user: u, url }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("\n[auth:dev] Email verification URL (use this if email doesn't arrive):\n", url, "\n")
      }
      const { subject, html } = buildVerificationEmail({ name: u.name, url })
      const { error } = await resend.emails.send({ from: FROM, to: u.email, subject, html })
      if (error) console.error("[auth] Failed to send verification email:", error)
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // cache session in cookie for 5 minutes — avoids DB hit on every page load
    },
  },

  // Tell Better Auth about the extra `plan` field we added to the user table
  user: {
    additionalFields: {
      plan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false, // users can't set this themselves
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
