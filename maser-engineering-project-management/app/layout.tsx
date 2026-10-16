import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, Inter } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppShell } from '@/components/shell/app-shell'
import { StoreProvider } from '@/lib/store'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-plex-mono' })

export const metadata: Metadata = {
  title: {
    default: 'Maser Engineering — Project Management',
    template: '%s · Maser Engineering',
  },
  description:
    'Project management workspace for Maser Engineering: projects, tasks, QA tests, Gantt timelines, notes, amendments, meetings and a dedicated client space.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1e2a44',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <body className="antialiased">
        <StoreProvider>
          <TooltipProvider>
            <AppShell>{children}</AppShell>
          </TooltipProvider>
        </StoreProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
