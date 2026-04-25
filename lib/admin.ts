export function isAdmin(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL
  return !!adminEmail && email.toLowerCase() === adminEmail.toLowerCase()
}
