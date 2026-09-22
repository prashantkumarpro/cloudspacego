import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppProvider } from '../providers/app-provider'
import './globals.css'
import { AuthProvider } from '@/providers/auth-provider'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'CloudE Cloud Storage',
  description: 'A Cloud Storage Website.'
}

export default function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className={`${inter.variable} h-full antialiased`}>
      <body className='min-h-full flex flex-col selection:bg-[#e22718] selection:text-white'>
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
