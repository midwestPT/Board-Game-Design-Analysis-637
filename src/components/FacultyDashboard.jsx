import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import { facultyService } from '../services/facultyService'
import useAuthStore from '../store/authStore'

const { 
  FiUsers, FiTrendingUp, FiBook, FiBarChart3, 
  FiSettings, FiDownload, FiPlus, FiAlertCircle 
} = FiIcons

function FacultyDashboard() {
  const { user } = useAuthStore()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      const data = await facultyService.createFacultyDashboard(user.id)
      setDashboardData(data)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssessment = async (assessmentConfig) => {
    try {
      await facultyService.createCustomAssessment(user.id, assessmentConfig)
      // Refresh dashboard data
      await loadDashboardData()
    } catch (error) {
      console.error('Error creating assessment:', error)
    }
  }

  const handleGenerateReport = async (classId) => {
    try {
      const report = await facultyService.generateClassReport(user.id, classId)
      // Handle report display/download
      console.log('Generated report:', report)
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading faculty dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <SafeIcon icon={FiAlertCircle} className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600">Unable to load faculty dashboard data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {dashboardData.faculty_info.full_name}
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: FiBarChart3 },
                { id: 'students', label: 'Students', icon: FiUsers },
                { id: 'assessments', label: 'Assessments', icon: FiBook },
                { id: 'curriculum', label: 'Curriculum', icon: FiSettings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <SafeIcon icon={tab.icon} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <OverviewTab dashboardData={dashboardData} />
          )}
          
          {activeTab === 'students' && (
            <StudentsTab 
              studentData={dashboardData.student_progress}
              onGenerateReport={handleGenerateReport}
            />
          )}
          
          {activeTab === 'assessments' && (
            <AssessmentsTab 
              assessmentData={dashboardData.assessment_tools}
              onCreateAssessment={handleCreateAssessment}
            />
          )}
          
          {activeTab === 'curriculum' && (
            <CurriculumTab 
              curriculumData={dashboardData.curriculum_integration}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ dashboardData }) {
  const stats = [
    {
      title: 'Total Students',
      value: dashboardData.student_progress.total_students,
      change: '+12%',
      icon: FiUsers,
      color: 'blue'
    },
    {
      title: 'Active Students',
      value: dashboardData.student_progress.active_students,
      change: '+8%',
      icon: FiTrendingUp,
      color: 'green'
    },
    {
      title: 'Avg. Competency',
      value: `${Math.round(Object.values(dashboardData.student_progress.average_competency).reduce((a, b) => a + b, 0) / Object.values(dashboardData.student_progress.average_competency).length)}%`,
      change: '+3%',
      icon: FiBarChart3,
      color: 'purple'
    },
    {
      title: 'At Risk Students',
      value: dashboardData.student_progress.at_risk_students.length,
      change: '-5%',
      icon: FiAlertCircle,
      color: 'red'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                <SafeIcon icon={stat.icon} className={`text-2xl text-${stat.color}-500`} />
              </div>
              <span className="text-green-500 text-sm font-medium">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Competency Progress</h3>
          <div className="space-y-4">
            {Object.entries(dashboardData.student_progress.average_competency).map(([competency, score]) => (
              <div key={competency}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {competency.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600">{Math.round(score)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">At Risk Students</h3>
          <div className="space-y-3">
            {dashboardData.student_progress.at_risk_students.slice(0, 5).map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{student.full_name}</p>
                  <p className="text-sm text-gray-600">
                    Avg. Score: {Math.round(Object.values(student.user_progress_pt2024?.competency_scores || {}).reduce((a, b) => a + b, 0) / Object.values(student.user_progress_pt2024?.competency_scores || {}).length) || 0}%
                  </p>
                </div>
                <SafeIcon icon={FiAlertCircle} className="text-red-500" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Students Tab Component
function StudentsTab({ studentData, onGenerateReport }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
        <button
          onClick={() => onGenerateReport('default')}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <SafeIcon icon={FiDownload} />
          <span>Generate Report</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Student Progress Overview</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900">Total Students</h4>
              <p className="text-2xl font-bold text-blue-600">{studentData.total_students}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900">Active Students</h4>
              <p className="text-2xl font-bold text-green-600">{studentData.active_students}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900">At Risk</h4>
              <p className="text-2xl font-bold text-red-600">{studentData.at_risk_students.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Assessments Tab Component
function AssessmentsTab({ assessmentData, onCreateAssessment }) {
  const [showCreateForm, setShowCreateForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Assessment Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          <SafeIcon icon={FiPlus} />
          <span>Create Assessment</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Assessment Tools</h3>
        <p className="text-gray-600">Create custom assessments and track student performance.</p>
      </div>

      {showCreateForm && (
        <AssessmentCreateForm
          onSubmit={onCreateAssessment}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  )
}

// Curriculum Tab Component
function CurriculumTab({ curriculumData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Curriculum Integration</h2>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Integration Status</h3>
        <p className="text-gray-600">Manage curriculum integration and learning objectives mapping.</p>
      </div>
    </div>
  )
}

// Assessment Create Form Component
function AssessmentCreateForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    competencies: [],
    cases: [],
    timeLimit: 60
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    onCancel()
  }

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl font-bold text-gray-900 mb-4">Create Custom Assessment</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assessment Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Limit (minutes)
          </label>
          <input
            type="number"
            value={formData.timeLimit}
            onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            required
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Assessment
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default FacultyDashboard