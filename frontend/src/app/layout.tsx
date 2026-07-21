import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import SmoothScrollProvider from "../lib/smooth-scroll-provider"
import Navbar from "../components/ui/Navbar"
// @ts-ignore
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" })

export const metadata: Metadata = {
  title: "DualCore AI — Hybrid RAG with Agentic Intelligence",
  description: "Upload documents. Ask questions. Watch the AI think. Dual retrieval engines, self-reflecting agents, and full reasoning transparency.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-[#080B11] text-[#C8D0DC] antialiased min-h-screen font-[family-name:var(--font-inter)]">
        <SmoothScrollProvider>
          <Navbar />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  )
}