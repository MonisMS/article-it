import { ImageResponse } from "next/og"

export const alt = "ArticleIt - Personalized Article Digests"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(135deg, #0D1117 0%, #161C26 60%, #1F2937 100%)",
          color: "#F0EDE6",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            fontSize: 28,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#E8A838",
          }}
        >
          <span>ArticleIt</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "900px" }}>
          <h1 style={{ margin: 0, fontSize: 66, lineHeight: 1.1 }}>Personalized article digests for your interests</h1>
          <p style={{ margin: 0, fontSize: 30, lineHeight: 1.35, color: "#C8C4BC" }}>
            Follow topics, read your ranked feed, and get digest emails on your schedule.
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
