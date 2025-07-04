import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiBook, FiFilter, FiSearch, FiPlay, FiClock, FiTarget } = FiIcons;

function CaseLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const cases = [
    {
      id: 'ankle_sprain',
      title: 'Lateral Ankle Sprain',
      category: 'Acute Musculoskeletal',
      difficulty: 'beginner',
      description: 'Recent inversion injury with pain and swelling',
      duration: '15-20 min',
      objectives: ['Ottawa Rules', 'Grading System', 'Return to Activity'],
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
    },
    {
      id: 'low_back_pain',
      title: 'Chronic Low Back Pain',
      category: 'Chronic Pain',
      difficulty: 'intermediate',
      description: 'Long-standing pain with functional limitations',
      duration: '25-30 min',
      objectives: ['Biopsychosocial Model', 'Red Flags', 'Functional Assessment'],
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'
    },
    {
      id: 'shoulder_impingement',
      title: 'Shoulder Impingement Syndrome',
      category: 'Sports Medicine',
      difficulty: 'intermediate',
      description: 'Overhead athlete with gradual onset pain',
      duration: '20-25 min',
      objectives: ['Special Tests', 'Movement Analysis', 'Activity Modification'],
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
    },
    {
      id: 'fibromyalgia',
      title: 'Fibromyalgia Syndrome',
      category: 'Complex Chronic',
      difficulty: 'advanced',
      description: 'Complex pain presentation with multiple factors',
      duration: '35-40 min',
      objectives: ['Central Sensitization', 'Multidisciplinary Care', 'Patient Education'],
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop'
    },
    {
      id: 'stroke_recovery',
      title: 'Post-Stroke Rehabilitation',
      category: 'Neurological',
      difficulty: 'advanced',
      description: 'Patient 6 months post-CVA with hemiparesis',
      duration: '30-35 min',
      objectives: ['Neuroplasticity', 'Functional Training', 'Family Education'],
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop'
    },
    {
      id: 'pediatric_development',
      title: 'Pediatric Developmental Delay',
      category: 'Pediatrics',
      difficulty: 'advanced',
      description: '4-year-old with gross motor delays',
      duration: '25-30 min',
      objectives: ['Developmental Milestones', 'Family-Centered Care', 'Play-Based Assessment'],
      image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop'
    }
  ];

  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
  const categories = ['all', 'Acute Musculoskeletal', 'Chronic Pain', 'Sports Medicine', 'Complex Chronic', 'Neurological', 'Pediatrics'];

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || case_.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'all' || case_.category === selectedCategory;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-red-100 text-red-700'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Case Library</h1>
          <p className="text-xl text-gray-600">Explore realistic patient scenarios for clinical reasoning practice</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search cases..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Difficulties' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCases.map((case_, index) => (
            <motion.div
              key={case_.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              {/* Case Image */}
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
                <img
                  src={case_.image}
                  alt={case_.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(case_.difficulty)}`}>
                    {case_.difficulty}
                  </span>
                </div>
              </div>

              {/* Case Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{case_.title}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-2">{case_.category}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{case_.description}</p>
                </div>

                {/* Case Details */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <SafeIcon icon={FiClock} className="mr-1" />
                    {case_.duration}
                  </div>
                  <div className="flex items-center">
                    <SafeIcon icon={FiTarget} className="mr-1" />
                    {case_.objectives.length} objectives
                  </div>
                </div>

                {/* Learning Objectives */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Learning Objectives:</h4>
                  <div className="flex flex-wrap gap-2">
                    {case_.objectives.slice(0, 3).map((objective, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {objective}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Play Button */}
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center">
                  <SafeIcon icon={FiPlay} className="mr-2" />
                  Practice This Case
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <SafeIcon icon={FiBook} className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No cases found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default CaseLibrary;