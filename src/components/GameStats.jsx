import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import useGameStore from '../store/gameStore';

const {
  FiClock, FiTarget, FiTrendingUp, FiZap, FiHeart, FiShield,
  FiUsers, FiBrain, FiAward, FiInfo, FiChevronDown, FiChevronUp
} = FiIcons;

function GameStats({ showDetailed = false, tutorialProgress = null, compact = false }) {
  const {
    turnNumber,
    maxTurns,
    ptResources,
    patientResources,
    diagnosticConfidence,
    activeModifiers,
    rapport
  } = useGameStore();
  
  const [gameTime, setGameTime] = useState(0);
  const [expandedView, setExpandedView] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setGameTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    if (confidence >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getResourceColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 70) return 'text-green-500';
    if (percentage >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3 text-sm">
        <div className="flex items-center space-x-1">
          <SafeIcon icon={FiClock} className="text-blue-500" />
          <span className="font-medium">{formatTime(gameTime)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <SafeIcon icon={FiTarget} className={getConfidenceColor(diagnosticConfidence || 0)} />
          <span className="font-medium">{diagnosticConfidence || 0}%</span>
        </div>
        <div className="flex items-center space-x-1">
          <SafeIcon icon={FiZap} className={getResourceColor(ptResources?.energy || 0, 10)} />
          <span className="font-medium">{ptResources?.energy || 0}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Game Statistics</h3>
        <button
          onClick={() => setExpandedView(!expandedView)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <SafeIcon
            icon={expandedView ? FiChevronUp : FiChevronDown}
            className="text-gray-600"
          />
        </button>
      </div>

      {/* Core Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <SafeIcon icon={FiClock} className="text-blue-500" />
            <span className="text-xs text-gray-600">Time</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {formatTime(gameTime)}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <SafeIcon icon={FiTarget} className={getConfidenceColor(diagnosticConfidence || 0)} />
            <span className="text-xs text-gray-600">Confidence</span>
          </div>
          <div className={`text-lg font-bold ${getConfidenceColor(diagnosticConfidence || 0)}`}>
            {diagnosticConfidence || 0}%
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <SafeIcon icon={FiTrendingUp} className="text-purple-500" />
            <span className="text-xs text-gray-600">Turn</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {turnNumber || 1}/{maxTurns || 10}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <SafeIcon icon={FiHeart} className="text-pink-500" />
            <span className="text-xs text-gray-600">Rapport</span>
          </div>
          <div className="text-lg font-bold text-pink-600">
            {rapport || ptResources?.rapport || 0}/10
          </div>
        </div>
      </div>

      {/* Resource Bars */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiZap} className="text-blue-500 text-sm" />
              <span className="text-sm font-medium text-gray-700">Energy</span>
            </div>
            <span className="text-sm text-gray-600">
              {ptResources?.energy || 0}/10
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((ptResources?.energy || 0) / 10) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiUsers} className="text-green-500 text-sm" />
              <span className="text-sm font-medium text-gray-700">Cooperation</span>
            </div>
            <span className="text-sm text-gray-600">
              {patientResources?.cooperation || 0}/10
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((patientResources?.cooperation || 0) / 10) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
          </div>
        </div>
      </div>

      {/* Tutorial Progress */}
      {tutorialProgress && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiAward} className="text-blue-500" />
            <span className="text-sm font-medium text-blue-800">Tutorial Progress</span>
          </div>
          <div className="text-xs text-blue-600 mb-1">
            Step {tutorialProgress.currentStep}/10: {tutorialProgress.currentStepTitle}
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${tutorialProgress.percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Active Modifiers */}
      {activeModifiers && activeModifiers.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiShield} className="text-orange-500" />
            <span className="text-sm font-medium text-gray-700">Active Modifiers</span>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              {activeModifiers.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {activeModifiers.slice(0, 3).map((modifier, index) => (
              <div
                key={index}
                className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full"
                title={modifier.description}
              >
                {modifier.name}
              </div>
            ))}
            {activeModifiers.length > 3 && (
              <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                +{activeModifiers.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expanded View */}
      <AnimatePresence>
        {expandedView && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t pt-4"
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">PT Resources</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Energy:</span>
                    <span className={getResourceColor(ptResources?.energy || 0, 10)}>
                      {ptResources?.energy || 0}/10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rapport:</span>
                    <span className="text-pink-600">{ptResources?.rapport || 0}/10</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Patient Resources</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cooperation:</span>
                    <span className="text-green-600">{patientResources?.cooperation || 0}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deflection:</span>
                    <span className="text-red-600">{patientResources?.deflection || 0}/15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Emotional:</span>
                    <span className="text-purple-600">{patientResources?.emotional || 0}/12</span>
                  </div>
                </div>
              </div>
            </div>

            {showDetailed && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-gray-700 mb-2">Game Analysis</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-600">Turn Efficiency:</span>
                    <span className="ml-2 font-medium">
                      {Math.round(((diagnosticConfidence || 0) / (turnNumber || 1)) * 10) / 10}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Time per Turn:</span>
                    <span className="ml-2 font-medium">
                      {formatTime(gameTime / (turnNumber || 1))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GameStats;