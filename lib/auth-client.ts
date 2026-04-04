import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [emailOTPClient()],
})

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  requestPasswordReset,
  resetPassword,
} = authClient

export async function signInWithGoogle() {
  return signIn.social({ provider: "google", callbackURL: "/dashboard" })
}

export async function signInWithGitHub() {
  return signIn.social({ provider: "github", callbackURL: "/dashboard" })
}
