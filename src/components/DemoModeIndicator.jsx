import React from 'react'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import useAuthStore from '../store/authStore'

const { FiInfo, FiPlay } = FiIcons

function DemoModeIndicator() {
  const { isDemoMode, setDemoUser } = useAuthStore()

  if (!isDemoMode) return null

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <SafeIcon icon={FiInfo} className="text-yellow-400 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Demo Mode Active
            </h3>
            <p className="text-sm text-yellow-700">
              You're experiencing PhysioTactics with sample data. No account required!
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setDemoUser('student')}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
          >
            Demo as Student
          </button>
          <button
            onClick={() => setDemoUser('faculty')}
            className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 transition-colors"
          >
            Demo as Faculty
          </button>
        </div>
      </div>
    </div>
  )
}

export default DemoModeIndicator