import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiClock, FiTarget, FiTrendingUp } = FiIcons;

function GameStats() {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <SafeIcon icon={FiClock} className="text-blue-500" />
        <span className="text-sm font-medium">12:34</span>
      </div>
      <div className="flex items-center space-x-2">
        <SafeIcon icon={FiTarget} className="text-green-500" />
        <span className="text-sm font-medium">85%</span>
      </div>
      <div className="flex items-center space-x-2">
        <SafeIcon icon={FiTrendingUp} className="text-purple-500" />
        <span className="text-sm font-medium">Level 3</span>
      </div>
    </div>
  );
}

export default GameStats;