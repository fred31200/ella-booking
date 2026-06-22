import { config } from '@/config'

export const metadata = {
  title:       `Réserver — ${config.business.name}`,
  description: `Réservez votre séance de massage en ligne. ${config.business.tagline}. ${config.business.location}.`,
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Italiana&family=Instrument+Sans:wght@400;600&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
      </head>
      <body style={{ margin: 0, padding: 0, WebkitFontSmoothing: 'antialiased' }}>
        {children}
      </body>
    </html>
  )
}
