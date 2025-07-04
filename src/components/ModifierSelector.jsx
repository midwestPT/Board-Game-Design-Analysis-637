import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import { gameModifiers, modifierSets, getRandomModifiers } from '../data/gameModifiers'

const { FiShuffle, FiCheck, FiX, FiInfo, FiZap } = FiIcons

function ModifierSelector({ onModifiersSelected, initialDifficulty = 'medium', onClose }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty)
  const [selectedModifiers, setSelectedModifiers] = useState([])
  const [showDetails, setShowDetails] = useState({})

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 border-green-300 text-green-800'
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'hard': return 'bg-red-100 border-red-300 text-red-800'
      case 'mixed': return 'bg-purple-100 border-purple-300 text-purple-800'
      default: return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getModifierColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
      case 'medium': return 'bg-orange-50 border-orange-200 hover:bg-orange-100'
      case 'hard': return 'bg-red-50 border-red-200 hover:bg-red-100'
      case 'bonus': return 'bg-green-50 border-green-200 hover:bg-green-100'
      default: return 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    }
  }

  const handleRandomSelection = () => {
    const randomModifiers = getRandomModifiers(selectedDifficulty)
    setSelectedModifiers(randomModifiers.map(m => m.id))
  }

  const handleModifierToggle = (modifierId) => {
    setSelectedModifiers(prev => {
      const currentSet = modifierSets[selectedDifficulty]
      const isSelected = prev.includes(modifierId)
      
      if (isSelected) {
        return prev.filter(id => id !== modifierId)
      } else {
        // Enforce count limit
        if (prev.length >= currentSet.count) {
          return [modifierId, ...prev.slice(0, currentSet.count - 1)]
        }
        return [...prev, modifierId]
      }
    })
  }

  const handleConfirm = () => {
    const modifierObjects = selectedModifiers.map(id => gameModifiers[id]).filter(Boolean)
    onModifiersSelected(modifierObjects)
    onClose()
  }

  const currentSet = modifierSets[selectedDifficulty]
  const availableModifiers = currentSet.pool.map(id => gameModifiers[id]).filter(Boolean)

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Choose Your Challenges</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <SafeIcon icon={FiX} className="text-xl" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Difficulty Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Difficulty Level</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(modifierSets).map(([difficulty, set]) => (
                <button
                  key={difficulty}
                  onClick={() => {
                    setSelectedDifficulty(difficulty)
                    setSelectedModifiers([])
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedDifficulty === difficulty
                      ? getDifficultyColor(difficulty) + ' border-current'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold capitalize">{set.name}</div>
                  <div className="text-sm opacity-75">{set.description}</div>
                  <div className="text-xs mt-1">Choose {set.count} modifier{set.count !== 1 ? 's' : ''}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Selection Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">
                Selected Modifiers ({selectedModifiers.length}/{currentSet.count})
              </h4>
              <button
                onClick={handleRandomSelection}
                className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <SafeIcon icon={FiShuffle} />
                <span>Random</span>
              </button>
            </div>
            
            {selectedModifiers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedModifiers.map(id => {
                  const modifier = gameModifiers[id]
                  return (
                    <div
                      key={id}
                      className={`px-3 py-1 rounded-full text-sm border ${getModifierColor(modifier.difficulty)}`}
                    >
                      <span className="mr-1">{modifier.icon}</span>
                      {modifier.name}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-2">
                No modifiers selected
              </div>
            )}
          </div>

          {/* Available Modifiers */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Modifiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableModifiers.map(modifier => (
                <motion.div
                  key={modifier.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedModifiers.includes(modifier.id)
                      ? getModifierColor(modifier.difficulty) + ' border-current'
                      : getModifierColor(modifier.difficulty) + ' border-gray-200'
                  }`}
                  onClick={() => handleModifierToggle(modifier.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{modifier.icon}</span>
                        <h4 className="font-semibold">{modifier.name}</h4>
                        {selectedModifiers.includes(modifier.id) && (
                          <SafeIcon icon={FiCheck} className="text-green-600" />
                        )}
                      </div>
                      
                      <p className="text-sm mb-2">{modifier.description}</p>
                      
                      {modifier.flavor && (
                        <p className="text-xs italic opacity-75">"{modifier.flavor}"</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
                          {modifier.difficulty}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowDetails(prev => ({
                              ...prev,
                              [modifier.id]: !prev[modifier.id]
                            }))
                          }}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <SafeIcon icon={FiInfo} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showDetails[modifier.id] && (
                      <motion.div
                        className="mt-3 pt-3 border-t border-current border-opacity-20"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="text-xs space-y-1">
                          <div><strong>Effect:</strong> {modifier.effect.type}</div>
                          {modifier.effect.modifier && (
                            <div><strong>Modifier:</strong> {modifier.effect.modifier > 0 ? '+' : ''}{modifier.effect.modifier}</div>
                          )}
                          <div><strong>Duration:</strong> {modifier.effect.duration === 'permanent' ? 'Permanent' : `${modifier.effect.duration} turns`}</div>
                          {modifier.visual && (
                            <div><strong>Visual:</strong> {modifier.visual}</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Skip Modifiers
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setSelectedModifiers([])
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear All
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={selectedModifiers.length === 0}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Game with {selectedModifiers.length} Modifier{selectedModifiers.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ModifierSelector