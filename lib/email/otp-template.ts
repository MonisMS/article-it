export function buildOtpEmail(opts: {
  otp: string
}): { subject: string; html: string } {
  const subject = "Your ArticleIt verification code"

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
          <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#09090b;">Your verification code</h1>
          <p style="margin:0;font-size:14px;color:#71717a;line-height:1.6;">
            Enter this code in the app to verify your email address. It expires in 10 minutes.
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:24px 32px 32px;">
          <div style="display:inline-block;background:#f4f4f5;border-radius:10px;padding:16px 32px;">
            <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#09090b;font-variant-numeric:tabular-nums;">
              ${opts.otp}
            </span>
          </div>
        </td>
      </tr>

      <tr>
        <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f4f4f5;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
            If you didn't create an ArticleIt account, you can safely ignore this email.
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
