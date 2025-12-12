export interface Section {
  key: string
  title: string
  description: string
  to: string
  requiresAuth: boolean
}

export const sections: Section[] = [
  {
    key: 'marketplace',
    title: 'Marketplace',
    description: 'Browse and post items',
    to: '/marketplace',
    requiresAuth: true,
  },
  // Future sections can be added here
]