import React from 'react'

interface LandingContainerProps {
  children: React.ReactNode
  className?: string
  id?: string
  as?: React.ElementType
}

/**
 * Standardized global container for the CloudSpaceGo landing page.
 * Enforces uniform max-width and responsive horizontal padding across
 * Navbar, Hero, Feature Sections, CTA, and Footer.
 */
export function LandingContainer({
  children,
  className = '',
  id,
  as: Component = 'div'
}: LandingContainerProps) {
  return (
    <Component
      id={id}
      className={`mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </Component>
  )
}
