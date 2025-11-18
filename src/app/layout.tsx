import type { Metadata, Viewport } from 'next'
import '@/app/globals.css'
import { ServiceWorkerRegistration } from '@/app/sw-register'
import { GlobalInvitationHandler } from '@/components/layout/GlobalInvitationHandler'

export const metadata: Metadata = {
  title: 'BattleWeb - Jeu de bataille navale multi-joueurs',
  description: 'Jeu de stratégie naval en ligne avec mécaniques innovantes de bombes de détection',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BattleWeb',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="antialiased">
        <ServiceWorkerRegistration />
        {children}
        <GlobalInvitationHandler />
      </body>
    </html>
  )
}
