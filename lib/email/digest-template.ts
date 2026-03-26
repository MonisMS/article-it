type Article = {
  title: string
  url: string
  description: string | null
  sourceName: string
  publishedAt: Date | null
}

function timeAgo(date: Date | null): string {
  if (!date) return ""
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "today"
  if (days === 1) return "yesterday"
  return `${days} days ago`
}

function formatWeeklySummary(articlesRead: number, topicsRead: number): string {
  if (articlesRead === 0) return ""
  const articleText = articlesRead === 1 ? "1 article" : `${articlesRead} articles`
  const topicsText = topicsRead > 1 ? ` across ${topicsRead} topics` : ""
  return `You read ${articleText}${topicsText} this week.`
}

export function buildDigestEmail(opts: {
  userName: string
  topicName: string
  topicIcon: string
  articles: Article[]
  dashboardUrl: string
  unsubscribeUrl: string
  weeklyStats?: { articlesRead: number; topicsRead: number }
}): { subject: string; html: string } {
  const { userName, topicName, topicIcon, articles, dashboardUrl, unsubscribeUrl, weeklyStats } = opts

  const subject = `${topicIcon} Your ${topicName} digest — ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}`

  const articleRows = articles
    .map(
      (a) => `
    <tr>
      <td style="padding:20px 0;border-bottom:1px solid #f4f4f5;">
        <a href="${a.url}" style="font-size:15px;font-weight:600;color:#09090b;text-decoration:none;line-height:1.4;display:block;margin-bottom:6px;">${a.title}</a>
        ${a.description ? `<p style="margin:0 0 8px;font-size:13px;color:#71717a;line-height:1.5;">${a.description.slice(0, 160)}${a.description.length > 160 ? "…" : ""}</p>` : ""}
        <span style="font-size:12px;color:#a1a1aa;">${a.sourceName}${a.publishedAt ? ` · ${timeAgo(a.publishedAt)}` : ""}</span>
      </td>
    </tr>`
    )
    .join("")

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

      <!-- Header -->
      <tr>
        <td style="padding:28px 32px;border-bottom:1px solid #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <span style="font-size:22px;font-weight:700;color:#09090b;">ArticleIt</span>
              </td>
              <td align="right">
                <span style="font-size:13px;color:#71717a;">${topicIcon} ${topicName}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Greeting -->
      <tr>
        <td style="padding:28px 32px 4px;">
          <h1 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#09090b;">Hey ${userName.split(" ")[0]},</h1>
          <p style="margin:0;font-size:14px;color:#71717a;">Here are the best <strong style="color:#09090b;">${topicName}</strong> articles since your last digest.</p>
        </td>
      </tr>

      <!-- Articles -->
      <tr>
        <td style="padding:8px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${articleRows}
          </table>
        </td>
      </tr>

      <!-- Weekly reading summary — only shown when the user has read articles -->
      ${weeklyStats && weeklyStats.articlesRead > 0 ? `
      <tr>
        <td style="padding:0 32px 24px;">
          <p style="margin:0;font-size:13px;color:#a1a1aa;">${formatWeeklySummary(weeklyStats.articlesRead, weeklyStats.topicsRead)}</p>
        </td>
      </tr>` : ""}

      <!-- CTA -->
      <tr>
        <td style="padding:0 32px 28px;">
          <a href="${dashboardUrl}" style="display:inline-block;background:#09090b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">View all articles →</a>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f4f4f5;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
            You're receiving this because you set up a digest for <strong>${topicName}</strong> on ArticleIt.<br>
            <a href="${unsubscribeUrl}" style="color:#a1a1aa;">Unsubscribe from this digest</a>
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
