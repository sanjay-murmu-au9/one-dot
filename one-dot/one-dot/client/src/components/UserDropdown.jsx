import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import AccountModal from './AccountModal'
import {
  User,
  KeyRound,
  Smartphone,
  RefreshCw,
  Bell,
  LifeBuoy,
  LogOut
} from 'lucide-react'

export default function UserDropdown() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const dropdownRef = useRef(null)

  // Get user's display initial
  const getUserInitial = () => {
    const storedName = localStorage.getItem('one_dot_name')
    if (storedName) return storedName.charAt(0).toUpperCase()
    if (currentUser?.displayName) return currentUser.displayName.charAt(0).toUpperCase()
    if (currentUser?.email) return currentUser.email.charAt(0).toUpperCase()
    return 'U'
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  async function handleSignOut() {
    try {
      await logout()
      setIsOpen(false)
      navigate('/login')
    } catch (error) {
      console.error('Failed to sign out', error)
    }
  }

  const menuItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: KeyRound, label: 'API Tokens', path: '/api-tokens' },
    { icon: Smartphone, label: 'Setup Guide', path: '/setup-guide' },
    { icon: RefreshCw, label: 'Integrations', path: '/integrations' },
    { icon: Bell, label: "What's New", path: '/whats-new' },
    { icon: LifeBuoy, label: 'Support', path: '/support' },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm transition-transform duration-200 hover:scale-105 overflow-hidden"
        style={{ backgroundColor: '#1d1d1f' }}
      >
        {currentUser?.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          getUserInitial()
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
        >
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-100">
            <span className="text-sm font-semibold text-[#1d1d1f]">My Account</span>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setIsOpen(false)
                  setShowAccountModal(true)
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#6e6e73] hover:bg-black/5 transition-colors"
              >
                <item.icon size={18} strokeWidth={1.5} />
                {item.label}
              </button>
            ))}
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} strokeWidth={1.5} />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Account Modal */}
      <AnimatePresence>
        {showAccountModal && (
          <AccountModal onClose={() => setShowAccountModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
