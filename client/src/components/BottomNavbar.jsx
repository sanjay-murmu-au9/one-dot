import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Home, Palette, User } from 'lucide-react'

const navItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'generate', label: 'Create', icon: Palette, path: '/generate' },
  { id: 'profile', label: 'Profile', icon: User, path: '/settings', requiresAuth: true },
]

export default function BottomNavbar() {
  const { currentUser } = useAuth()
  const location = useLocation()

  // Don't show on these pages
  const hiddenPaths = ['/onboarding', '/login', '/signup', '/settings']
  if (hiddenPaths.includes(location.pathname)) return null

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          // Handle auth-required items
          const linkPath = item.requiresAuth && !currentUser ? '/login' : item.path
          const label = item.requiresAuth && !currentUser ? 'Log In' : item.label

          return (
            <Link
              key={item.id}
              to={linkPath}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  active ? 'bg-[#ff5f45] text-white' : 'text-[#6e6e73]'
                }`}
              >
                <Icon size={22} strokeWidth={1.5} />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  active ? 'text-[#ff5f45]' : 'text-[#6e6e73]'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
