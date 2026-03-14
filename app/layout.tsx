import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Life Dashboard',
  description: 'Your personal life management sanctuary',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '0.875rem',
              borderRadius: '14px',
              background: '#fdf8f5',
              color: '#5c4336',
              border: '1px solid #e2d8c8',
              boxShadow: '0 4px 20px rgba(142,90,69,0.12)',
              padding: '10px 14px',
            },
            success: { iconTheme: { primary: '#c67b5c', secondary: '#fdf8f5' } },
            error:   { iconTheme: { primary: '#a84040', secondary: '#fdf8f5' } },
          }}
        />
      </body>
    </html>
  )
}
