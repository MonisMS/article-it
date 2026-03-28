import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ArticleIt — Personalized Article Digests",
  description:
    "Pick your topics, get the best articles from the web delivered to your inbox on your schedule. A personalized reading digest built for curious people.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://articleit.com"),
  openGraph: {
    title: "ArticleIt — Personalized Article Digests",
    description: "Pick your topics, get the best articles from the web delivered to your inbox on your schedule.",
    type: "website",
    siteName: "ArticleIt",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArticleIt — Personalized Article Digests",
    description: "Pick your topics, get the best articles from the web delivered to your inbox on your schedule.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* No-flash: apply dark class before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if((s||p)==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
