import React from 'react'
import { SidebarSection } from '../../types'
import { Home, Folder, Users, Clock, Star, Trash2 } from 'lucide-react'

export interface NavItem {
  name: SidebarSection
  label: string
  icon: React.ReactNode
}

export const getNavItems = (): NavItem[] => [
  {
    name: 'Dashboard',
    label: 'Home',
    icon: <Home className="w-5 h-5" />,
  },
  {
    name: 'My Files',
    label: 'My Files',
    icon: <Folder className="w-5 h-5" />,
  },
  {
    name: 'Shared',
    label: 'Shared with me',
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: 'Recent',
    label: 'Recent',
    icon: <Clock className="w-5 h-5" />,
  },
  {
    name: 'Starred',
    label: 'Starred',
    icon: <Star className="w-5 h-5" />,
  },
  {
    name: 'Trash',
    label: 'Trash',
    icon: <Trash2 className="w-5 h-5" />,
  },
]

