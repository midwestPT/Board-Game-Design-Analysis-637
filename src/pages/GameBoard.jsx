import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import GameCard from '../components/GameCard'
import PlayerHand from '../components/PlayerHand'
import GameStats from '../components/GameStats'
import useGameStore from '../store/gameStore'

const { FiHeart, FiBattery, FiClock, FiTarget, FiUser, FiActivity, FiAward, FiTrendingUp } = FiIcons

function GameBoard() {
  const {
    gameState,
    currentPlayer,
    playCard,
    endTurn,
    initializeGame,
    getPlaySuggestions,
    getVictoryProgress,
    getLearningMoments,
    predictions,
    victoryStatus
  } = useGameStore()

  const [selectedCard, setSelectedCard] = useState(null)
  const [gamePhase, setGamePhase] = useState('investigation')
  const [showPredictions, setShowPredictions] = useState(false)
  const [showVictoryProgress, setShowVictoryProgress] = useState(false)

  useEffect(() => {
    // Initialize game from localStorage config
    const config = JSON.parse(localStorage.getItem('gameConfig') || '{}')
    initializeGame(config)
  }, [initializeGame])

  const handleCardPlay = async (card) => {
    if (selectedCard?.id === card.id) {
      setSelectedCard(null)
    } else {
      setSelectedCard(card)
    }
  }

  const handlePlaySelectedCard = async () => {
    if (selectedCard) {
      const result = await playCard(selectedCard.id)
      setSelectedCard(null)
      
      if (result.success && result.educationalFeedback) {
        // Show educational feedback
        showEducationalFeedback(result.educationalFeedback)
      }
    }
  }

  const showEducationalFeedback = (feedback) => {
    // This would show a modal or notification with educational content
    console.log('Educational feedback:', feedback)
  }

  const handleEndTurn = () => {
    endTurn()
    setSelectedCard(null)
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    )
  }

  const playSuggestions = getPlaySuggestions()
  const victoryProgress = getVictoryProgress()
  const learningMoments = getLearningMoments()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Game Header */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">Turn {gameState.turnNumber}</div>
                <div className="text-sm text-gray-600">of {gameState.maxTurns}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 capitalize">{currentPlayer} Turn</div>
                <div className="text-sm text-gray-600">{gamePhase} Phase</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <GameStats />
              
              {/* AI Suggestions Button */}
              <button
                onClick={() => setShowPredictions(!showPredictions)}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                <SafeIcon icon={FiTrendingUp} />
              </button>

              {/* Victory Progress Button */}
              <button
                onClick={() => setShowVictoryProgress(!showVictoryProgress)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <SafeIcon icon={FiAward} />
              </button>

              <button
                onClick={handleEndTurn}
                disabled={currentPlayer !== 'pt_student'}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                End Turn
              </button>
            </div>
          </div>

          {/* AI Predictions Panel */}
          <AnimatePresence>
            {showPredictions && predictions && (
              <motion.div
                className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h3 className="text-lg font-semibold text-purple-800 mb-3">AI Suggestions</h3>
                <div className="space-y-2">
                  {playSuggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="font-medium">{suggestion.card.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-purple-600">Value: {suggestion.netBenefit.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">{suggestion.reasoning}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Victory Progress Panel */}
          <AnimatePresence>
            {showVictoryProgress && victoryProgress && (
              <motion.div
                className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h3 className="text-lg font-semibold text-green-800 mb-3">Victory Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(victoryProgress).map(([condition, progress]) => (
                    <div key={condition} className="bg-white p-3 rounded border">
                      <h4 className="font-medium text-gray-800 capitalize">
                        {condition.replace('_', ' ')}
                      </h4>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress.progress_percentage || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {progress.progress_percentage || 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Learning Moments Display */}
        {learningMoments.length > 0 && (
          <motion.div
            className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Learning Moments</h3>
            {learningMoments.map((moment, index) => (
              <div key={index} className="text-yellow-700 mb-1">
                <strong>{moment.type}:</strong> {moment.description}
              </div>
            ))}
          </motion.div>
        )}

        {/* Game Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Zone */}
          <motion.div
            className="lg:col-span-1 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center mb-6">
              <SafeIcon icon={FiUser} className="text-2xl text-orange-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Patient</h2>
            </div>

            {/* Patient Resources */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div className="flex items-center">
                  <SafeIcon icon={FiActivity} className="text-orange-500 mr-2" />
                  <span className="font-medium">Cooperation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-orange-500 rounded-full transition-all"
                      style={{ width: `${(gameState.patientResources.cooperation / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{gameState.patientResources.cooperation}/10</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div className="flex items-center">
                  <SafeIcon icon={FiBattery} className="text-red-500 mr-2" />
                  <span className="font-medium">Deflection</span>
                </div>
                <span className="font-bold text-red-600">{gameState.patientResources.deflection}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div className="flex items-center">
                  <SafeIcon icon={FiHeart} className="text-pink-500 mr-2" />
                  <span className="font-medium">Emotional</span>
                </div>
                <span className="font-bold text-pink-600">{gameState.patientResources.emotional}</span>
              </div>
            </div>

            {/* Active Patient Effects */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Active Effects</h3>
              {gameState.activeEffects.patient.length === 0 ? (
                <p className="text-gray-500 text-sm">No active effects</p>
              ) : (
                gameState.activeEffects.patient.map((effect, index) => (
                  <div key={index} className="bg-white p-2 rounded text-sm">
                    {effect.name}
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Center Play Area */}
          <motion.div
            className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Play Area</h2>
              <p className="text-gray-600">Case: {gameState.currentCase?.title || 'Loading...'}</p>
            </div>

            {/* Selected Card Preview */}
            <AnimatePresence>
              {selectedCard && (
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold mb-2">Selected Card</h3>
                    <GameCard card={selectedCard} isSelected={true} />
                    <button
                      onClick={handlePlaySelectedCard}
                      className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Play Card
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent Actions */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Recent Actions</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                {gameState.gameLog.length === 0 ? (
                  <p className="text-gray-500 text-sm">No actions yet</p>
                ) : (
                  gameState.gameLog.slice(-5).map((log, index) => (
                    <div key={index} className="text-sm mb-2 last:mb-0">
                      <span className="font-medium">{log.player}:</span> {log.action}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* PT Student Zone */}
          <motion.div
            className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center mb-6">
              <SafeIcon icon={FiTarget} className="text-2xl text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">PT Student</h2>
            </div>

            {/* PT Resources */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div className="flex items-center">
                  <SafeIcon icon={FiBattery} className="text-blue-500 mr-2" />
                  <span className="font-medium">Energy</span>
                </div>
                <span className="font-bold text-blue-600">{gameState.ptResources.energy}/12</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div className="flex items-center">
                  <SafeIcon icon={FiHeart} className="text-green-500 mr-2" />
                  <span className="font-medium">Rapport</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-green-500 rounded-full transition-all"
                      style={{ width: `${(gameState.ptResources.rapport / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{gameState.ptResources.rapport}/10</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div className="flex items-center">
                  <SafeIcon icon={FiTarget} className="text-purple-500 mr-2" />
                  <span className="font-medium">Clues Found</span>
                </div>
                <span className="font-bold text-purple-600">{gameState.discoveredClues.length}</span>
              </div>
            </div>

            {/* Discovered Clues */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Discovered Clues</h3>
              <div className="bg-white rounded-lg p-4 max-h-32 overflow-y-auto">
                {gameState.discoveredClues.length === 0 ? (
                  <p className="text-gray-500 text-sm">No clues discovered yet</p>
                ) : (
                  gameState.discoveredClues.map((clue, index) => (
                    <div key={index} className="text-sm mb-1 last:mb-0 p-2 bg-blue-50 rounded">
                      {clue.description}
                      {clue.confidence && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({Math.round(clue.confidence * 100)}% confidence)
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Player Hand */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <PlayerHand
            cards={gameState.playerHands[currentPlayer] || []}
            onCardClick={handleCardPlay}
            selectedCard={selectedCard}
          />
        </motion.div>
      </div>
    </div>
  )
}

export default GameBoard