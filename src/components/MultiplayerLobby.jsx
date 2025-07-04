import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import { multiplayerService } from '../services/multiplayerService'
import useAuthStore from '../store/authStore'

const { FiUsers, FiPlay, FiSettings, FiWifi, FiClock, FiUserCheck } = FiIcons

function MultiplayerLobby() {
  const { user } = useAuthStore()
  const [gameRooms, setGameRooms] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [matchmaking, setMatchmaking] = useState(false)
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [roomSettings, setRoomSettings] = useState({
    difficulty: 'beginner',
    case_id: 'ankle_sprain',
    maxPlayers: 2,
    isPrivate: false
  })

  useEffect(() => {
    loadAvailableRooms()
  }, [])

  const loadAvailableRooms = async () => {
    try {
      // Load available public rooms
      const rooms = await multiplayerService.getAvailableRooms()
      setGameRooms(rooms)
    } catch (error) {
      console.error('Error loading rooms:', error)
    }
  }

  const handleCreateRoom = async () => {
    try {
      const room = await multiplayerService.createGameRoom(user.id, roomSettings)
      setCurrentRoom(room)
      setShowCreateRoom(false)
    } catch (error) {
      console.error('Error creating room:', error)
    }
  }

  const handleJoinRoom = async (roomId) => {
    try {
      const room = await multiplayerService.joinGameRoom(roomId, user.id)
      setCurrentRoom(room)
    } catch (error) {
      console.error('Error joining room:', error)
    }
  }

  const handleStartMatchmaking = async () => {
    try {
      setMatchmaking(true)
      const preferences = {
        difficulty: roomSettings.difficulty,
        case_id: roomSettings.case_id,
        preferred_role: 'pt_student',
        institution_id: user.user_metadata?.institution_id
      }

      const match = await multiplayerService.findMatch(user.id, preferences)
      
      if (match) {
        setCurrentRoom(match)
        setMatchmaking(false)
      }
    } catch (error) {
      console.error('Error in matchmaking:', error)
      setMatchmaking(false)
    }
  }

  const handleStartGame = async () => {
    try {
      if (currentRoom) {
        await multiplayerService.startMultiplayerGame(currentRoom.id)
        // Navigate to game board
        window.location.href = `/game?room=${currentRoom.id}`
      }
    } catch (error) {
      console.error('Error starting game:', error)
    }
  }

  if (currentRoom) {
    return <GameRoomLobby room={currentRoom} onStartGame={handleStartGame} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Multiplayer Lobby</h1>
          <p className="text-xl text-gray-600">Connect with other students for collaborative learning</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Match */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <SafeIcon icon={FiWifi} className="mr-3 text-blue-500" />
              Quick Match
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={roomSettings.difficulty}
                  onChange={(e) => setRoomSettings({ ...roomSettings, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Case Type
                </label>
                <select
                  value={roomSettings.case_id}
                  onChange={(e) => setRoomSettings({ ...roomSettings, case_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ankle_sprain">Ankle Sprain</option>
                  <option value="low_back_pain">Low Back Pain</option>
                  <option value="shoulder_impingement">Shoulder Impingement</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStartMatchmaking}
              disabled={matchmaking}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {matchmaking ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Searching...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <SafeIcon icon={FiPlay} className="mr-2" />
                  Find Match
                </div>
              )}
            </button>
          </motion.div>

          {/* Available Rooms */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <SafeIcon icon={FiUsers} className="mr-3 text-green-500" />
              Available Rooms
            </h2>

            <div className="space-y-3 mb-6">
              {gameRooms.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No rooms available</p>
              ) : (
                gameRooms.map((room) => (
                  <div
                    key={room.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {room.case_id.replace('_', ' ')} - {room.difficulty}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {room.current_players}/{room.max_players} players
                        </p>
                      </div>
                      <button
                        onClick={() => handleJoinRoom(room.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowCreateRoom(true)}
              className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Create Room
            </button>
          </motion.div>

          {/* Recent Games */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <SafeIcon icon={FiClock} className="mr-3 text-purple-500" />
              Recent Games
            </h2>

            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">Ankle Sprain</p>
                    <p className="text-sm text-gray-600">vs. StudentB</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">Won</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">Low Back Pain</p>
                    <p className="text-sm text-gray-600">vs. StudentC</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">Lost</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Create Room Modal */}
        <AnimatePresence>
          {showCreateRoom && (
            <CreateRoomModal
              settings={roomSettings}
              onSettingsChange={setRoomSettings}
              onCreateRoom={handleCreateRoom}
              onCancel={() => setShowCreateRoom(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Game Room Lobby Component
function GameRoomLobby({ room, onStartGame }) {
  const [players, setPlayers] = useState(room.players || [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Game Room</h1>
            <p className="text-gray-600">
              {room.case_id.replace('_', ' ')} - {room.difficulty}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">PT Student</h3>
              <div className="space-y-3">
                {players.filter(p => p.role === 'pt_student').map((player, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <SafeIcon icon={FiUserCheck} className="text-blue-500" />
                    <span className="font-medium">{player.name}</span>
                  </div>
                ))}
                {players.filter(p => p.role === 'pt_student').length === 0 && (
                  <p className="text-gray-500">Waiting for PT student...</p>
                )}
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Patient</h3>
              <div className="space-y-3">
                {players.filter(p => p.role === 'patient').map((player, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <SafeIcon icon={FiUserCheck} className="text-green-500" />
                    <span className="font-medium">{player.name}</span>
                  </div>
                ))}
                {players.filter(p => p.role === 'patient').length === 0 && (
                  <p className="text-gray-500">Waiting for patient...</p>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={onStartGame}
              disabled={players.length < 2}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {players.length < 2 ? 'Waiting for Players...' : 'Start Game'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Create Room Modal Component
function CreateRoomModal({ settings, onSettingsChange, onCreateRoom, onCancel }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Game Room</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={settings.difficulty}
                onChange={(e) => onSettingsChange({ ...settings, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Case
              </label>
              <select
                value={settings.case_id}
                onChange={(e) => onSettingsChange({ ...settings, case_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ankle_sprain">Ankle Sprain</option>
                <option value="low_back_pain">Low Back Pain</option>
                <option value="shoulder_impingement">Shoulder Impingement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Players
              </label>
              <select
                value={settings.maxPlayers}
                onChange={(e) => onSettingsChange({ ...settings, maxPlayers: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={2}>2 Players</option>
                <option value={4}>4 Players</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrivate"
                checked={settings.isPrivate}
                onChange={(e) => onSettingsChange({ ...settings, isPrivate: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
                Private Room
              </label>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onCreateRoom}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Room
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default MultiplayerLobby