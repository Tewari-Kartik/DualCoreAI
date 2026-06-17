import type { Metadata } from "next"
import { Inter } from "next/font/google"
// @ts-ignore
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hybrid RAG",
  description: "Traditional + Vectorless RAG with ReAct agents",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  )
}