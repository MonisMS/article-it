export function buildResetPasswordEmail(opts: {
  name: string
  url: string
}): { subject: string; html: string } {
  const firstName = opts.name.split(" ")[0]
  const subject = "Reset your ArticleIt password"

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;">

      <tr>
        <td style="padding:28px 32px;border-bottom:1px solid #f4f4f5;">
          <span style="font-size:22px;font-weight:700;color:#09090b;">ArticleIt</span>
        </td>
      </tr>

      <tr>
        <td style="padding:32px 32px 8px;">
          <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#09090b;">Reset your password, ${firstName}</h1>
          <p style="margin:0;font-size:14px;color:#71717a;line-height:1.6;">
            We received a request to reset your password. Click the button below to choose a new one.
            This link expires in 1 hour.
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:24px 32px 32px;">
          <a href="${opts.url}" style="display:inline-block;background:#09090b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">
            Reset password
          </a>
        </td>
      </tr>

      <tr>
        <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f4f4f5;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
            If you didn't request a password reset, you can safely ignore this email. Your password won't change.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`

  return { subject, html }
}
