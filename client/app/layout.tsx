import type { Metadata } from 'next'
import { Inter, Instrument_Serif, Caveat } from 'next/font/google'
import { AppProvider } from '../providers/app-provider'
import './globals.css'
import { AuthProvider } from '@/providers/auth-provider'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin']
})

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['italic', 'normal'],
  variable: '--font-instrument-serif',
  subsets: ['latin']
})

const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'cloudspacego',
  description: 'A Cloud Storage Website.'
}

export default function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className={`${inter.variable} ${instrumentSerif.variable} ${caveat.variable} dark h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('cloudspacego_theme');
                  var theme = (saved === 'light' || saved === 'dark') ? saved : 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className='min-h-full flex flex-col selection:bg-[#6E60EE]/25 selection:text-foreground bg-background text-foreground transition-colors duration-200'>
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
