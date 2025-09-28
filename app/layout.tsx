import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Github } from 'lucide-react'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Self-Evolving Codebase',
  description: 'AI-powered self-improving software system',
  keywords: ['AI', 'code evolution', 'GitHub', 'automation', 'code improvement'],
  authors: [{ name: 'Dushyant' }],
  openGraph: {
    title: 'Self-Evolving Codebase',
    description: 'AI-powered self-improving software system',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
        
        {/* Fixed GitHub Icon */}
        <a
          href="https://github.com/dushyant4665/self-Evolving-Codebase"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed top-14 right-10 z-40 p-2 bg-background border border-border rounded-full shadow-lg hover:bg-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="View on GitHub"
        >
          <Github className="h-10 w-10 text-foreground" />
        </a>
      </body>
    </html>
  )
}

