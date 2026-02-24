import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lux Network Status',
  description: 'Real-time status of the Lux blockchain network, subnets, and services.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace', background: '#0a0a0a', color: '#e5e5e5' }}>
        {children}
      </body>
    </html>
  )
}
