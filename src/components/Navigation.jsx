import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import AuthModal from './AuthModal'
import UserProfile from './UserProfile'
import useAuthStore from '../store/authStore'

const { FiHome, FiPlay, FiBook, FiBarChart3, FiUser, FiUsers, FiSettings } = FiIcons

function Navigation() {
  const location = useLocation()
  const { user, isAuthenticated, loading } = useAuthStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)

  const getNavItems = () => {
    const baseItems = [
      { path: '/', icon: FiHome, label: 'Home' },
      { path: '/setup', icon: FiPlay, label: 'Play' },
      { path: '/cases', icon: FiBook, label: 'Cases' },
      { path: '/dashboard', icon: FiBarChart3, label: 'Progress' },
      { path: '/multiplayer', icon: FiUsers, label: 'Multiplayer' }
    ]

    // Add faculty-specific navigation
    if (user?.user_metadata?.role === 'faculty') {
      baseItems.push({ path: '/faculty', icon: FiSettings, label: 'Faculty' })
    }

    return baseItems
  }

  const navItems = getNavItems()

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
  }

  const handleUserSignOut = () => {
    setShowUserProfile(false)
  }

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiPlay} className="text-white text-lg" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">PhysioTactics</h1>
              </motion.div>
            </div>

            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={item.icon} className="text-lg" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {location.pathname === item.path && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              ) : isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserProfile(!showUserProfile)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <SafeIcon icon={FiUser} className="text-lg" />
                    <span className="font-medium">
                      {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}
                    </span>
                    {user?.user_metadata?.role === 'faculty' && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Faculty
                      </span>
                    )}
                  </button>
                  
                  {showUserProfile && (
                    <div className="absolute right-0 top-full mt-2 w-80 z-50">
                      <UserProfile user={user} onSignOut={handleUserSignOut} />
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}

export default Navigation