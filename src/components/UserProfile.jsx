import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import { authService } from '../services/authService'
import { analyticsService } from '../services/analyticsService'

const { FiUser, FiSettings, FiLogOut, FiTrendingUp, FiAward } = FiIcons

function UserProfile({ user, onSignOut }) {
  const [userProgress, setUserProgress] = useState(null)
  const [gameHistory, setGameHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      const [progress, history] = await Promise.all([
        analyticsService.getUserProgress(user.id),
        analyticsService.getUserGameHistory(user.id, 5)
      ])

      setUserProgress(progress)
      setGameHistory(history)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      onSignOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <SafeIcon icon={FiUser} className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user.user_metadata?.full_name || user.email}
            </h3>
            <p className="text-sm text-gray-600">
              {user.user_metadata?.role || 'Student'}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <SafeIcon icon={FiLogOut} className="text-xl" />
        </button>
      </div>

      {userProgress && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3">Progress Overview</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiTrendingUp} className="text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Avg. Score</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {userProgress.competency_scores?.overall || 0}%
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiAward} className="text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Games</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {gameHistory.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {gameHistory.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Recent Games</h4>
          <div className="space-y-2">
            {gameHistory.slice(0, 3).map((game, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {game.games_pt2024?.case_id || 'Unknown Case'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(game.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {game.accuracy_score}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default UserProfile