import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiTrendingUp, FiTarget, FiClock, FiAward, FiBook, FiUsers } = FiIcons;

function Dashboard() {
  const stats = [
    {
      title: 'Games Played',
      value: '47',
      change: '+12%',
      icon: FiTarget,
      color: 'blue'
    },
    {
      title: 'Avg. Accuracy',
      value: '78%',
      change: '+5%',
      icon: FiTrendingUp,
      color: 'green'
    },
    {
      title: 'Study Time',
      value: '23h',
      change: '+18%',
      icon: FiClock,
      color: 'purple'
    },
    {
      title: 'Achievements',
      value: '12',
      change: '+3',
      icon: FiAward,
      color: 'yellow'
    }
  ];

  const recentGames = [
    {
      case: 'Ankle Sprain',
      accuracy: 92,
      duration: '12:34',
      date: '2 hours ago'
    },
    {
      case: 'Shoulder Impingement',
      accuracy: 78,
      duration: '18:22',
      date: '1 day ago'
    },
    {
      case: 'Low Back Pain',
      accuracy: 85,
      duration: '15:45',
      date: '2 days ago'
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Learning Dashboard</h1>
          <p className="text-xl text-gray-600">Track your progress and improve your clinical reasoning skills</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, y: 30 }}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Games */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <SafeIcon icon={FiBook} className="mr-3 text-blue-500" />
              Recent Games
            </h2>
            <div className="space-y-4">
              {recentGames.map((game, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">{game.case}</h3>
                    <p className="text-sm text-gray-600">{game.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        game.accuracy >= 90 ? 'bg-green-100 text-green-700' :
                        game.accuracy >= 80 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {game.accuracy}%
                      </span>
                      <span className="text-sm text-gray-600">{game.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Progress Chart */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <SafeIcon icon={FiTrendingUp} className="mr-3 text-green-500" />
              Progress Overview
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Diagnostic Accuracy</span>
                  <span className="text-sm text-gray-600">78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Communication Skills</span>
                  <span className="text-sm text-gray-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Clinical Reasoning</span>
                  <span className="text-sm text-gray-600">72%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Efficiency</span>
                  <span className="text-sm text-gray-600">68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          className="mt-8 bg-white rounded-2xl shadow-lg p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <SafeIcon icon={FiAward} className="mr-3 text-yellow-500" />
            Recent Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <SafeIcon icon={FiTarget} className="text-3xl text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">First Perfect Game</h3>
              <p className="text-sm text-gray-600">Achieved 100% accuracy</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <SafeIcon icon={FiClock} className="text-3xl text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Speed Demon</h3>
              <p className="text-sm text-gray-600">Completed game in under 10 minutes</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <SafeIcon icon={FiUsers} className="text-3xl text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Team Player</h3>
              <p className="text-sm text-gray-600">Won 5 multiplayer games</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;