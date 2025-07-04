import React from 'react';
import { motion } from 'framer-motion';
import GameCard from './GameCard';

function PlayerHand({ cards, onCardClick, selectedCard }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Your Hand</h2>
        <span className="text-sm text-gray-600">{cards.length} cards</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <GameCard
              card={card}
              isSelected={selectedCard?.id === card.id}
              onClick={() => onCardClick(card)}
            />
          </motion.div>
        ))}
      </div>
      
      {cards.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No cards in hand</p>
        </div>
      )}
    </div>
  );
}

export default PlayerHand;