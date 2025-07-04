import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiZap, FiHeart, FiShield, FiTarget } = FiIcons;

function GameCard({ card, isSelected = false, onClick, disabled = false }) {
  const getCardTypeColor = (type) => {
    const colors = {
      assessment: 'from-blue-500 to-blue-600',
      history_taking: 'from-green-500 to-green-600',
      clinical_reasoning: 'from-purple-500 to-purple-600',
      communication: 'from-yellow-500 to-yellow-600',
      deflection: 'from-red-500 to-red-600',
      emotional_state: 'from-pink-500 to-pink-600',
      complexity: 'from-orange-500 to-orange-600',
      communication_barrier: 'from-gray-500 to-gray-600'
    };
    return colors[type] || 'from-gray-400 to-gray-500';
  };

  const getCardIcon = (type) => {
    const icons = {
      assessment: FiTarget,
      history_taking: FiHeart,
      clinical_reasoning: FiShield,
      communication: FiZap,
      deflection: FiShield,
      emotional_state: FiHeart,
      complexity: FiTarget,
      communication_barrier: FiZap
    };
    return icons[type] || FiTarget;
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'border-gray-300',
      uncommon: 'border-green-400',
      rare: 'border-blue-400',
      epic: 'border-purple-400',
      legendary: 'border-yellow-400'
    };
    return colors[rarity] || 'border-gray-300';
  };

  return (
    <motion.div
      className={`relative bg-white rounded-xl shadow-lg border-2 transition-all cursor-pointer ${
        isSelected ? 'border-blue-500 shadow-xl scale-105' : getRarityColor(card.rarity)
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:scale-105'}`}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { y: -5 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      layout
    >
      {/* Card Header */}
      <div className={`bg-gradient-to-r ${getCardTypeColor(card.type)} text-white p-3 rounded-t-xl`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-bold text-sm leading-tight">{card.name}</h3>
            <p className="text-xs opacity-90 capitalize">{card.type.replace('_', ' ')}</p>
          </div>
          <SafeIcon icon={getCardIcon(card.type)} className="text-lg flex-shrink-0 ml-2" />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3">
        {/* Costs */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex space-x-2">
            {card.energy_cost && (
              <div className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                <SafeIcon icon={FiZap} className="mr-1" />
                {card.energy_cost}
              </div>
            )}
            {card.deflection_cost && (
              <div className="flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                <SafeIcon icon={FiShield} className="mr-1" />
                {card.deflection_cost}
              </div>
            )}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            card.rarity === 'common' ? 'bg-gray-100 text-gray-700' :
            card.rarity === 'uncommon' ? 'bg-green-100 text-green-700' :
            card.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
            'bg-purple-100 text-purple-700'
          }`}>
            {card.rarity}
          </span>
        </div>

        {/* Card Text */}
        <div className="text-xs text-gray-700 mb-2 leading-relaxed">
          {card.card_text}
        </div>

        {/* Flavor Text */}
        {card.flavor_text && (
          <div className="text-xs text-gray-500 italic border-t pt-2">
            {card.flavor_text}
          </div>
        )}
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  );
}

export default GameCard;