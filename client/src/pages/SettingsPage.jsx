import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  ChevronLeft,
  ChevronRight,
  User,
  KeyRound,
  Smartphone,
  RefreshCw,
  Bell,
  LifeBuoy,
  LogOut,
  Sparkles,
  Mail,
  Lock,
} from 'lucide-react'

export default function SettingsPage() {
  const { currentUser, logout, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  // Get user's display name or email
  const getUserName = () => {
    const storedName = localStorage.getItem('one_dot_name')
    if (storedName) return storedName
    if (currentUser?.displayName) return currentUser.displayName
    return currentUser?.email?.split('@')[0] || 'User'
  }

  const getUserInitial = () => {
    const name = getUserName()
    return name.charAt(0).toUpperCase()
  }

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out', error)
    }
  }

  async function handleResetPassword() {
    if (!currentUser?.email || resetLoading) return
    try {
      setResetLoading(true)
      await resetPassword(currentUser.email)
      setResetSuccess(true)
    } catch (error) {
      console.error('Failed to send reset email', error)
    } finally {
      setResetLoading(false)
    }
  }

  const menuItems = [
    { id: 'profile', icon: User, label: 'Profile', hasDetail: true },
    { id: 'api-tokens', icon: KeyRound, label: 'API Tokens', hasDetail: true },
    { id: 'setup-guide', icon: Smartphone, label: 'Setup Guide', hasDetail: true },
    { id: 'integrations', icon: RefreshCw, label: 'Integrations', hasDetail: true },
    { id: 'whats-new', icon: Bell, label: "What's New", hasDetail: true },
  ]

  // Render detail view for a section
  if (activeSection) {
    return (
      <div className="min-h-screen bg-[#f5f5f7]">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center h-14 px-4">
            <button
              onClick={() => setActiveSection(null)}
              className="flex items-center gap-1 text-[#ff5f45] font-medium"
            >
              <ChevronLeft size={24} />
              <span>Settings</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-4">
          {activeSection === 'profile' ? (
            <ProfileSection
              email={currentUser?.email}
              onResetPassword={handleResetPassword}
              resetLoading={resetLoading}
              resetSuccess={resetSuccess}
            />
          ) : (
            <ComingSoonSection title={menuItems.find(m => m.id === activeSection)?.label || activeSection} />
          )}
        </div>
      </div>
    )
  }

  // Main settings list
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-[#ff5f45] font-medium"
          >
            <ChevronLeft size={24} />
            <span>Back</span>
          </button>
          <h1 className="flex-1 text-center font-semibold text-[#1d1d1f] pr-12">
            Settings
          </h1>
        </div>
      </header>

      {/* User Profile Card */}
      <div className="p-4">
        <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold"
            style={{ backgroundColor: '#1d1d1f' }}
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getUserInitial()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1d1d1f] truncate">{getUserName()}</p>
            <p className="text-sm text-[#6e6e73] truncate">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <item.icon size={18} className="text-[#1d1d1f]" />
              </div>
              <span className="flex-1 text-[15px] text-[#1d1d1f]">{item.label}</span>
              {item.hasDetail && <ChevronRight size={20} className="text-gray-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Support Section */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setActiveSection('support')}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-gray-50"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <LifeBuoy size={18} className="text-[#1d1d1f]" />
            </div>
            <span className="flex-1 text-[15px] text-[#1d1d1f]">Support</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Log Out */}
      <div className="px-4 mt-6 pb-24">
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl py-3.5 text-center text-red-500 font-medium shadow-sm hover:bg-gray-50 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}

function ProfileSection({ email, onResetPassword, resetLoading, resetSuccess }) {
  return (
    <div className="space-y-4">
      {/* Email */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Mail size={18} className="text-[#6e6e73]" />
          <span className="text-sm font-medium text-[#6e6e73]">Email Address</span>
        </div>
        <p className="text-[15px] text-[#1d1d1f] bg-gray-50 rounded-xl px-4 py-3">
          {email}
        </p>
        <p className="text-xs text-[#6e6e73] mt-2 px-1">
          Contact support to change your email address.
        </p>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Lock size={18} className="text-[#6e6e73]" />
          <span className="text-sm font-medium text-[#6e6e73]">Password</span>
        </div>
        <button
          onClick={onResetPassword}
          disabled={resetLoading || resetSuccess}
          className="w-full py-3 rounded-xl border border-gray-200 text-[15px] font-medium text-[#1d1d1f] hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {resetLoading ? 'Sending...' : resetSuccess ? 'Reset Email Sent!' : 'Reset Password'}
        </button>
        {resetSuccess && (
          <p className="text-xs text-green-600 mt-2 px-1">
            Check your email for reset instructions.
          </p>
        )}
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles size={18} className="text-[#6e6e73]" />
          <span className="text-sm font-medium text-[#6e6e73]">Subscription</span>
        </div>
        <div className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-white rounded-xl px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Sparkles size={18} className="text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-[#1d1d1f]">Free Plan</p>
            <p className="text-xs text-[#6e6e73]">Basic features</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ComingSoonSection({ title }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Bell size={28} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">{title}</h3>
      <p className="text-sm text-[#6e6e73]">This feature is coming soon.</p>
    </div>
  )
}
