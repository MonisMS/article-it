import { betterAuth } from "better-auth"
import { emailOTP } from "better-auth/plugins"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/lib/db"
import {
  user,
  session,
  account,
  verification,
} from "@/lib/db/schema/auth"
import { resend } from "@/lib/resend"
import { buildOtpEmail } from "@/lib/email/otp-template"
import { buildResetPasswordEmail } from "@/lib/email/reset-password-template"

const FROM = process.env.EMAIL_FROM_AUTH ?? "ArticleIt <noreply@m0nis.com>"

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

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    },
  },

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

  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      sendVerificationOTP: async ({ email, otp }: { email: string; otp: string }) => {
        if (process.env.NODE_ENV === "development") {
          console.log(`\n[auth:dev] Email OTP for ${email}: ${otp}\n`)
        }
        const { subject, html } = buildOtpEmail({ otp })
        const { error } = await resend.emails.send({ from: FROM, to: email, subject, html })
        if (error) console.error("[auth] Failed to send OTP email:", error)
      },
    }),
  ],

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // cache session in cookie for 5 minutes — avoids DB hit on every page load
    },
  },

  // Tell Better Auth about the extra fields we added to the user table
  user: {
    additionalFields: {
      plan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
      lastVisitAt: {
        type: "date",
        required: false,
        input: false,
      },
      lastReengagementAt: {
        type: "date",
        required: false,
        input: false,
      },
      username: {
        type: "string",
        required: false,
        input: false,
      },
      publicProfile: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
