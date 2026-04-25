import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { resend } from "@/lib/resend"

const schema = z.object({
  feature: z.string().min(1).max(80),
  issue: z.string().min(1).max(120),
  details: z.string().max(2000).optional().default(""),
  path: z.string().max(200).optional().default(""),
})

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) {
      return NextResponse.json({ data: null, error: "Missing ADMIN_EMAIL" }, { status: 500 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ data: null, error: "Missing RESEND_API_KEY" }, { status: 500 })
    }

    const { feature, issue, details, path } = parsed.data

    const subject = `[Curio Beta] ${feature}: ${issue}`
    const text = [
      "Curio beta issue report",
      "",
      `User: ${session.user.name} <${session.user.email}>`,
      path ? `Path: ${path}` : null,
      `Feature: ${feature}`,
      `Issue: ${issue}`,
      "",
      details ? `Details:\n${details}` : "Details: (none)",
    ]
      .filter(Boolean)
      .join("\n")

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM_AUTH ?? "Curio Beta <noreply@m0nis.com>",
      to: adminEmail,
      subject,
      text,
    })

    if (error) {
      console.error("[beta-feedback] Failed to send email:", error)
      return NextResponse.json({ data: null, error: "Failed to send" }, { status: 500 })
    }

    return NextResponse.json({ data: { ok: true }, error: null })
  } catch (e) {
    console.error("[beta-feedback] Error:", e)
    return NextResponse.json({ data: null, error: "Server error" }, { status: 500 })
  }
}
