import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const { FiClock, FiInfo, FiX, FiZap } = FiIcons

function GameModifiers({ modifiers = [], onRemoveModifier, compact = false }) {
  const [showDetails, setShowDetails] = useState(false)
  const [selectedModifier, setSelectedModifier] = useState(null)

  if (!modifiers || modifiers.length === 0) {
    return null
  }

  const getModifierColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'medium': return 'bg-orange-100 border-orange-300 text-orange-800'
      case 'hard': return 'bg-red-100 border-red-300 text-red-800'
      case 'bonus': return 'bg-green-100 border-green-300 text-green-800'
      default: return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getModifierIcon = (modifier) => {
    // Return the emoji icon from the modifier data
    return modifier.icon || '⚡'
  }

  const formatDuration = (modifier) => {
    if (modifier.effect.duration === 'permanent') {
      return 'Permanent'
    }
    const remaining = modifier.remainingDuration || modifier.effect.duration
    return `${remaining} turn${remaining !== 1 ? 's' : ''}`
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {modifiers.map((modifier, index) => (
          <motion.div
            key={modifier.id}
            className={`px-2 py-1 rounded-full text-xs border ${getModifierColor(modifier.difficulty)}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            title={modifier.description}
          >
            <span className="mr-1">{getModifierIcon(modifier)}</span>
            {modifier.name}
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Active Challenges</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-500 hover:text-blue-700 transition-colors"
          title="Toggle details"
        >
          <SafeIcon icon={FiInfo} />
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {modifiers.map((modifier, index) => (
          <motion.div
            key={modifier.id}
            className={`border rounded-lg p-3 ${getModifierColor(modifier.difficulty)}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{getModifierIcon(modifier)}</span>
                  <h4 className="font-semibold">{modifier.name}</h4>
                  <div className="flex items-center space-x-1 text-xs">
                    <SafeIcon icon={FiClock} />
                    <span>{formatDuration(modifier)}</span>
                  </div>
                </div>
                
                <p className="text-sm mb-1">{modifier.description}</p>
                
                {modifier.flavor && (
                  <p className="text-xs italic opacity-80">"{modifier.flavor}"</p>
                )}
              </div>

              {onRemoveModifier && modifier.effect.duration !== 'permanent' && (
                <button
                  onClick={() => onRemoveModifier(modifier.id)}
                  className="text-red-500 hover:text-red-700 transition-colors ml-2"
                  title="Remove modifier"
                >
                  <SafeIcon icon={FiX} />
                </button>
              )}
            </div>

            {showDetails && (
              <motion.div
                className="mt-2 pt-2 border-t border-current border-opacity-20"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="text-xs space-y-1">
                  <div><strong>Effect Type:</strong> {modifier.effect.type}</div>
                  {modifier.effect.modifier && (
                    <div><strong>Modifier:</strong> {modifier.effect.modifier > 0 ? '+' : ''}{modifier.effect.modifier}</div>
                  )}
                  {modifier.effect.interval && (
                    <div><strong>Interval:</strong> Every {modifier.effect.interval} turns</div>
                  )}
                  <div><strong>Difficulty:</strong> {modifier.difficulty}</div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {modifiers.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <SafeIcon icon={FiZap} className="text-2xl mb-2" />
          <p>No active challenges</p>
        </div>
      )}
    </div>
  )
}

export default GameModifiers