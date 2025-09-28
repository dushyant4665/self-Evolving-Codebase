import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Github } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Self-Evolving Codebase',
  description: 'AI-powered self-improving software system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
        
        {/* Fixed GitHub Icon */}
        <a
          href="https://github.com/dushyant4665/self-Evolving-Codebase"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed top-4 right-4 z-50 p-3 bg-background border border-border rounded-full shadow-lg hover:bg-accent transition-colors"
          aria-label="View on GitHub"
        >
          <Github className="h-6 w-6 text-foreground" />
        </a>
      </body>
    </html>
  )
}

