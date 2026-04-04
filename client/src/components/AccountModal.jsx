import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  User,
  KeyRound,
  Smartphone,
  RefreshCw,
  Bell,
  LifeBuoy,
  LogOut,
  Sparkles,
  Clock
} from 'lucide-react'

const navItems = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'api-tokens', icon: KeyRound, label: 'API Tokens' },
  { id: 'setup-guide', icon: Smartphone, label: 'Setup Guide' },
  { id: 'integrations', icon: RefreshCw, label: 'Integrations' },
  { id: 'whats-new', icon: Bell, label: "What's New" },
]

export default function AccountModal({ onClose }) {
  const { currentUser, logout, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('profile')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState('')

  // Close on ESC key
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  async function handleLogout() {
    try {
      await logout()
      onClose()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out', error)
    }
  }

  async function handleResetPassword() {
    if (!currentUser?.email) return

    try {
      setResetLoading(true)
      setResetError('')
      console.log('[Password Reset] Sending to:', currentUser.email)
      await resetPassword(currentUser.email)
      console.log('[Password Reset] Email sent successfully')
      setResetSuccess(true)
    } catch (error) {
      console.error('[Password Reset] Failed:', error.code, error.message)

      // Show specific error messages
      if (error.code === 'auth/too-many-requests') {
        setResetError('Too many attempts. Please try again later.')
      } else if (error.code === 'auth/user-not-found') {
        setResetError('No account found with this email.')
      } else {
        setResetError(`Failed to send reset email: ${error.message}`)
      }
    } finally {
      setResetLoading(false)
    }
  }

  function handleUpdateEmail() {
    alert('Email update coming soon!')
  }

  function handleUpgrade() {
    alert('Upgrade feature coming soon!')
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex"
        style={{ minHeight: '520px', maxHeight: '85vh' }}
      >
        {/* Left Sidebar */}
        <div className="w-56 bg-white border-r border-gray-200 flex flex-col py-6">
          {/* Header */}
          <div className="px-6 mb-4">
            <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
              Account
            </span>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5 ${
                  activeSection === item.id
                    ? 'bg-gray-100 text-[#1d1d1f] font-medium'
                    : 'text-[#1d1d1f] hover:bg-gray-50'
                }`}
              >
                <item.icon size={18} strokeWidth={1.5} />
                {item.label}
              </button>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-200 my-3" />

            {/* Support */}
            <button
              onClick={() => setActiveSection('support')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeSection === 'support'
                  ? 'bg-gray-100 text-[#1d1d1f] font-medium'
                  : 'text-[#1d1d1f] hover:bg-gray-50'
              }`}
            >
              <LifeBuoy size={18} strokeWidth={1.5} />
              Support
            </button>
          </nav>

          {/* Log Out */}
          <div className="px-3 mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} strokeWidth={1.5} />
              Log Out
            </button>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 p-8 overflow-y-auto bg-white">
          {activeSection === 'profile' ? (
            <ProfileContent
              email={currentUser?.email}
              onUpdateEmail={handleUpdateEmail}
              onResetPassword={handleResetPassword}
              resetLoading={resetLoading}
              resetSuccess={resetSuccess}
              resetError={resetError}
              onUpgrade={handleUpgrade}
            />
          ) : (
            <ComingSoonContent section={
              activeSection === 'support' ? 'Support' : navItems.find(n => n.id === activeSection)?.label
            } />
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

function ProfileContent({ email, onUpdateEmail, onResetPassword, resetLoading, resetSuccess, resetError, onUpgrade }) {
  return (
    <div>
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-semibold text-[#1d1d1f]">Profile</h2>
        <p className="text-sm text-[#6e6e73] mt-1">Manage your account information</p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-6" />

      <div className="space-y-6">
        {/* Email Address */}
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-3">
            Email Address
          </label>
          <div className="flex gap-3">
            <input
              type="email"
              value={email || ''}
              readOnly
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-[#1d1d1f] outline-none focus:border-gray-300"
            />
            <button
              onClick={onUpdateEmail}
              className="px-5 py-3 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#4b5563' }}
            >
              Update
            </button>
          </div>
          <p className="text-xs text-indigo-500 mt-2">
            You will need to verify your new email address.
          </p>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-3">
            Password
          </label>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-white">
            <span className="flex-1 text-sm text-[#6e6e73]">
              {resetSuccess ? 'Reset email sent!' : 'Active currently'}
            </span>
            <button
              onClick={onResetPassword}
              disabled={resetLoading || resetSuccess}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-[#1d1d1f] hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {resetLoading ? 'Sending...' : resetSuccess ? 'Email Sent' : 'Reset Password'}
            </button>
          </div>
          {resetError && (
            <p className="text-xs text-red-500 mt-2">{resetError}</p>
          )}
          {resetSuccess && (
            <p className="text-xs text-green-600 mt-2">
              Check your email for password reset instructions.
            </p>
          )}
        </div>

        {/* Billing & Subscription */}
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-3">
            Billing & Subscription
          </label>
          <div className="flex items-center gap-4 px-4 py-4 rounded-lg border border-gray-200 bg-gradient-to-r from-amber-50/50 to-white">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Sparkles size={18} className="text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1d1d1f]">Free Plan</p>
              <p className="text-xs text-[#6e6e73]">Basic features</p>
            </div>
            <button
              onClick={onUpgrade}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-[#1d1d1f] hover:bg-gray-50 transition-colors"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ComingSoonContent({ section }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-20">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Clock size={28} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">{section}</h3>
      <p className="text-sm text-[#6e6e73]">This feature is coming soon.</p>
    </div>
  )
}
