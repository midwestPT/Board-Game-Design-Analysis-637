import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiUsers, FiCpu, FiSettings, FiPlay } = FiIcons;

function GameSetup() {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState('ai');
  const [difficulty, setDifficulty] = useState('beginner');
  const [playerRole, setPlayerRole] = useState('pt');
  const [selectedCase, setSelectedCase] = useState('ankle_sprain');

  const gameModes = [
    {
      id: 'ai',
      title: 'vs AI',
      description: 'Play against adaptive AI opponent',
      icon: FiCpu
    },
    {
      id: 'human',
      title: 'vs Human',
      description: 'Play against another player',
      icon: FiUsers
    },
    {
      id: 'practice',
      title: 'Practice Mode',
      description: 'Solo practice with guided hints',
      icon: FiUser
    }
  ];

  const difficulties = [
    {
      id: 'beginner',
      title: 'Beginner',
      description: 'Clear presentations, basic deflections',
      color: 'green'
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      description: 'Multiple differentials, moderate complexity',
      color: 'yellow'
    },
    {
      id: 'advanced',
      title: 'Advanced',
      description: 'Complex cases, multiple comorbidities',
      color: 'red'
    }
  ];

  const cases = [
    {
      id: 'ankle_sprain',
      title: 'Lateral Ankle Sprain',
      difficulty: 'beginner',
      description: 'Recent inversion injury with pain and swelling'
    },
    {
      id: 'low_back_pain',
      title: 'Chronic Low Back Pain',
      difficulty: 'intermediate',
      description: 'Long-standing pain with functional limitations'
    },
    {
      id: 'shoulder_impingement',
      title: 'Shoulder Impingement',
      difficulty: 'intermediate',
      description: 'Overhead athlete with gradual onset pain'
    },
    {
      id: 'fibromyalgia',
      title: 'Fibromyalgia Syndrome',
      difficulty: 'advanced',
      description: 'Complex pain presentation with multiple factors'
    }
  ];

  const handleStartGame = () => {
    const gameConfig = {
      mode: gameMode,
      difficulty,
      playerRole,
      case: selectedCase
    };
    
    // Store config in localStorage or context
    localStorage.setItem('gameConfig', JSON.stringify(gameConfig));
    navigate('/game');
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Game Setup</h1>
          <p className="text-xl text-gray-600">Configure your PhysioTactics experience</p>
        </motion.div>

        <div className="space-y-8">
          {/* Game Mode Selection */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <SafeIcon icon={FiUsers} className="mr-3 text-blue-500" />
              Game Mode
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {gameModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setGameMode(mode.id)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    gameMode === mode.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <SafeIcon icon={mode.icon} className="text-3xl mx-auto mb-3 text-blue-500" />
                  <h3 className="font-semibold text-gray-900 mb-2">{mode.title}</h3>
                  <p className="text-sm text-gray-600">{mode.description}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Player Role Selection */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <SafeIcon icon={FiUser} className="mr-3 text-purple-500" />
              Your Role
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setPlayerRole('pt')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  playerRole === 'pt'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-2">PT Student</h3>
                <p className="text-sm text-gray-600">Gather information and diagnose the patient's condition</p>
              </button>
              <button
                onClick={() => setPlayerRole('patient')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  playerRole === 'patient'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-2">Simulated Patient</h3>
                <p className="text-sm text-gray-600">Present realistic responses and complexity</p>
              </button>
            </div>
          </motion.div>

          {/* Difficulty Selection */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <SafeIcon icon={FiSettings} className="mr-3 text-orange-500" />
              Difficulty Level
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficulties.map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setDifficulty(diff.id)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    difficulty === diff.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full mx-auto mb-3 ${
                    diff.color === 'green' ? 'bg-green-500' :
                    diff.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <h3 className="font-semibold text-gray-900 mb-2">{diff.title}</h3>
                  <p className="text-sm text-gray-600">{diff.description}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Case Selection */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Case Selection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cases.map((case_) => (
                <button
                  key={case_.id}
                  onClick={() => setSelectedCase(case_.id)}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    selectedCase === case_.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{case_.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      case_.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      case_.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {case_.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{case_.description}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Start Game Button */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <button
              onClick={handleStartGame}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-4 rounded-xl font-semibold text-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
            >
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiPlay} className="text-xl" />
                <span>Start Game</span>
              </div>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default GameSetup;