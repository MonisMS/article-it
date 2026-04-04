type TopicSummary = {
  name: string
  icon: string
  newArticles: number
}

export function buildReengageEmail(opts: {
  userName: string
  topics: TopicSummary[]
  totalNew: number
  daysSinceRead: number | null
  dashboardUrl: string
  settingsUrl: string
}): { subject: string; html: string } {
  const { userName, topics, totalNew, daysSinceRead, dashboardUrl, settingsUrl } = opts

  const firstName = userName.split(" ")[0]
  const daysText = daysSinceRead ? `${daysSinceRead} days` : "a while"
  const subject = `${firstName}, you've missed ${totalNew} articles`

  const topicRows = topics
    .slice(0, 5)
    .map(
      (t) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;">
          <table cellpadding="0" cellspacing="0" width="100%"><tr>
            <td style="font-size:14px;color:#09090b;">
              <span style="margin-right:8px;">${t.icon}</span>${t.name}
            </td>
            <td align="right" style="font-size:13px;font-weight:600;color:#d97706;white-space:nowrap;">
              ${t.newArticles} new article${t.newArticles === 1 ? "" : "s"}
            </td>
          </tr></table>
        </td>
      </tr>`
    )
    .join("")

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background:#fafaf9;padding:40px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e7e5e4;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1c1917 0%,#292524 100%);padding:32px 32px 28px;">
            <table cellpadding="0" cellspacing="0" width="100%"><tr>
              <td>
                <div style="display:inline-flex;align-items:center;gap:8px;">
                  <span style="display:inline-block;width:28px;height:28px;background:#d97706;border-radius:6px;text-align:center;line-height:28px;font-size:14px;">📖</span>
                  <span style="font-size:15px;font-weight:600;color:#fafaf9;">ArticleIt</span>
                </div>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;line-height:1.3;">
              Hey ${firstName}, it&apos;s been ${daysText} 👋
            </h1>
            <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">
              While you were away, <strong style="color:#09090b;">${totalNew} new articles</strong> arrived across your topics. Here&apos;s what&apos;s waiting for you:
            </p>

            <!-- Topics table -->
            <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
              ${topicRows}
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" width="100%"><tr>
              <td align="center">
                <a href="${dashboardUrl}"
                   style="display:inline-block;background:#d97706;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:50px;">
                  Catch up now →
                </a>
              </td>
            </tr></table>

            <p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;line-height:1.6;text-align:center;">
              You&apos;re receiving this because you haven&apos;t visited in a while.<br>
              <a href="${settingsUrl}" style="color:#a1a1aa;">Manage email preferences</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f4f4f5;text-align:center;">
            <p style="margin:0;font-size:11px;color:#d4d4d4;">ArticleIt · The internet&apos;s best articles, delivered to you</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject, html }
}
