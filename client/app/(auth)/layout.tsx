import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout ({ children }: AuthLayoutProps) {
  return <main className='min-h-screen'>{children}</main>
}

// Why are we doing this?

// Now everything inside (auth) automatically uses this layout:

// (auth)
// ├── layout.tsx
// ├── login/
// │   └── page.tsx
// └── register/
//     └── page.tsx

// And remember:

// /auth/login ❌

// The URL remains:

// /login ✅

// The (auth) folder is only for organization and shared layout, not part of the URL.
