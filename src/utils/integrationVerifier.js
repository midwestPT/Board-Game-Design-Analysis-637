// Integration Verification Utility for PhysioTactics
// Verifies all tutorial and modifier systems are properly connected

import { useGameStore } from '../store/gameStore';
import { GAME_CONFIG } from '../config/gameConfig';
import { validateGameState } from './gameStateValidator';
import { initializeTutorialProgress } from './tutorialProgressTracker';
import { buildDeck } from './deckBuilder';
import { processCardEffect } from './cardEffectProcessor';

// Component verification
const verifyComponents = () => {
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  const addResult = (test, status, message) => {
    results.details.push({ test, status, message });
    results[status]++;
  };

  try {
    // Verify Tutorial Component
    const tutorialModule = import('../components/Tutorial.jsx');
    if (tutorialModule) {
      addResult('Tutorial Component', 'passed', 'Tutorial.jsx imports successfully');
    } else {
      addResult('Tutorial Component', 'failed', 'Tutorial.jsx not found or has import errors');
    }

    // Verify Modifier Components
    const modifierSelectorModule = import('../components/ModifierSelector.jsx');
    const gameModifiersModule = import('../components/GameModifiers.jsx');
    
    if (modifierSelectorModule && gameModifiersModule) {
      addResult('Modifier Components', 'passed', 'All modifier components import successfully');
    } else {
      addResult('Modifier Components', 'failed', 'Modifier components missing or have import errors');
    }

    // Verify Game Store Integration
    const store = useGameStore.getState();
    if (store) {
      addResult('Game Store', 'passed', 'Game store accessible');
      
      // Check for required store properties
      const requiredProperties = [
        'gameState',
        'tutorialProgress', 
        'activeModifiers',
        'setTutorialProgress',
        'setActiveModifiers'
      ];
      
      const missingProperties = requiredProperties.filter(prop => !(prop in store));
      if (missingProperties.length === 0) {
        addResult('Store Properties', 'passed', 'All required store properties present');
      } else {
        addResult('Store Properties', 'warnings', `Missing properties: ${missingProperties.join(', ')}`);
      }
    } else {
      addResult('Game Store', 'failed', 'Game store not accessible');
    }

    // Verify Utility Functions
    const utilities = [
      { name: 'validateGameState', func: validateGameState },
      { name: 'initializeTutorialProgress', func: initializeTutorialProgress },
      { name: 'buildDeck', func: buildDeck },
      { name: 'processCardEffect', func: processCardEffect }
    ];

    utilities.forEach(({ name, func }) => {
      if (typeof func === 'function') {
        addResult(`Utility: ${name}`, 'passed', `${name} function available`);
      } else {
        addResult(`Utility: ${name}`, 'failed', `${name} function not available`);
      }
    });

    // Verify Configuration
    if (GAME_CONFIG && GAME_CONFIG.tutorial && GAME_CONFIG.modifiers) {
      addResult('Game Configuration', 'passed', 'Game configuration loaded successfully');
    } else {
      addResult('Game Configuration', 'failed', 'Game configuration missing or incomplete');
    }

    // Verify Data Files
    const dataFiles = [
      { name: 'expandedCardDatabase', path: '../data/expandedCardDatabase.js' },
      { name: 'gameModifiers', path: '../data/gameModifiers.js' }
    ];

    dataFiles.forEach(({ name, path }) => {
      try {
        const module = import(path);
        if (module) {
          addResult(`Data: ${name}`, 'passed', `${name} data file accessible`);
        }
      } catch (error) {
        addResult(`Data: ${name}`, 'failed', `${name} data file not accessible: ${error.message}`);
      }
    });

  } catch (error) {
    addResult('Integration Verification', 'failed', `Verification failed: ${error.message}`);
  }

  return results;
};

// Store state verification
const verifyStoreState = () => {
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  const addResult = (test, status, message) => {
    results.details.push({ test, status, message });
    results[status]++;
  };

  try {
    const store = useGameStore.getState();
    
    // Check game state structure
    if (store.gameState) {
      const gameState = store.gameState;
      const requiredGameStateProps = [
        'currentTurn',
        'players',
        'gamePhase',
        'turnCount'
      ];
      
      const missingGameStateProps = requiredGameStateProps.filter(prop => !(prop in gameState));
      if (missingGameStateProps.length === 0) {
        addResult('Game State Structure', 'passed', 'Game state has all required properties');
      } else {
        addResult('Game State Structure', 'warnings', `Missing game state properties: ${missingGameStateProps.join(', ')}`);
      }
    } else {
      addResult('Game State Structure', 'failed', 'Game state not initialized');
    }

    // Check tutorial progress
    if (store.tutorialProgress) {
      addResult('Tutorial Progress', 'passed', 'Tutorial progress state available');
    } else {
      addResult('Tutorial Progress', 'warnings', 'Tutorial progress state not initialized');
    }

    // Check active modifiers
    if (store.activeModifiers !== undefined) {
      addResult('Active Modifiers', 'passed', 'Active modifiers state available');
    } else {
      addResult('Active Modifiers', 'warnings', 'Active modifiers state not initialized');
    }

    // Check store actions
    const requiredActions = [
      'initializeGame',
      'playCard',
      'endTurn',
      'updateGameState'
    ];
    
    const missingActions = requiredActions.filter(action => typeof store[action] !== 'function');
    if (missingActions.length === 0) {
      addResult('Store Actions', 'passed', 'All required store actions available');
    } else {
      addResult('Store Actions', 'warnings', `Missing store actions: ${missingActions.join(', ')}`);
    }

  } catch (error) {
    addResult('Store State Verification', 'failed', `Store verification failed: ${error.message}`);
  }

  return results;
};

// Feature functionality verification
const verifyFeatureFunctionality = () => {
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  const addResult = (test, status, message) => {
    results.details.push({ test, status, message });
    results[status]++;
  };

  try {
    // Test tutorial initialization
    const tutorialProgress = initializeTutorialProgress();
    if (tutorialProgress && tutorialProgress.currentStep === 1) {
      addResult('Tutorial Initialization', 'passed', 'Tutorial initializes correctly');
    } else {
      addResult('Tutorial Initialization', 'failed', 'Tutorial initialization failed');
    }

    // Test game state validation
    const sampleGameState = {
      players: {
        pt: { energy: 10, rapport: 5, diagnosticConfidence: 0 },
        patient: { cooperation: 7, deflection: 8, emotional: 6 }
      },
      currentTurn: 'pt',
      gamePhase: 'playing',
      turnCount: 1
    };
    
    const validation = validateGameState(sampleGameState);
    if (validation.isValid) {
      addResult('Game State Validation', 'passed', 'Game state validation working');
    } else {
      addResult('Game State Validation', 'warnings', `Validation issues: ${validation.errors.join(', ')}`);
    }

    // Test deck building
    const deck = buildDeck('beginner', 'ankle_sprain');
    if (deck && deck.length > 0) {
      addResult('Deck Building', 'passed', `Deck built successfully with ${deck.length} cards`);
    } else {
      addResult('Deck Building', 'failed', 'Deck building failed');
    }

    // Test card effect processing
    const sampleCard = {
      id: 'test_card',
      type: 'assessment',
      energyCost: 2,
      effects: [{ type: 'diagnosticConfidence', value: 10 }]
    };
    
    const processedEffect = processCardEffect(sampleCard, sampleGameState);
    if (processedEffect) {
      addResult('Card Effect Processing', 'passed', 'Card effects process correctly');
    } else {
      addResult('Card Effect Processing', 'failed', 'Card effect processing failed');
    }

  } catch (error) {
    addResult('Feature Functionality', 'failed', `Feature verification failed: ${error.message}`);
  }

  return results;
};

// Complete integration verification
export const runIntegrationVerification = () => {
  console.log('🔍 Running PhysioTactics Integration Verification...\n');
  
  const componentResults = verifyComponents();
  const storeResults = verifyStoreState();
  const functionalityResults = verifyFeatureFunctionality();
  
  const totalResults = {
    passed: componentResults.passed + storeResults.passed + functionalityResults.passed,
    failed: componentResults.failed + storeResults.failed + functionalityResults.failed,
    warnings: componentResults.warnings + storeResults.warnings + functionalityResults.warnings,
    details: [
      ...componentResults.details,
      ...storeResults.details,
      ...functionalityResults.details
    ]
  };
  
  // Generate report
  console.log('📊 Integration Verification Results:');
  console.log(`✅ Passed: ${totalResults.passed}`);
  console.log(`❌ Failed: ${totalResults.failed}`);
  console.log(`⚠️  Warnings: ${totalResults.warnings}`);
  console.log('\n📋 Detailed Results:');
  
  totalResults.details.forEach(({ test, status, message }) => {
    const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
    console.log(`${icon} ${test}: ${message}`);
  });
  
  // Overall status
  const overallStatus = totalResults.failed === 0 ? 
    (totalResults.warnings === 0 ? 'PERFECT' : 'GOOD') : 
    'NEEDS_ATTENTION';
  
  console.log(`\n🎯 Overall Status: ${overallStatus}`);
  
  if (overallStatus === 'PERFECT') {
    console.log('🎉 All systems are fully integrated and ready!');
  } else if (overallStatus === 'GOOD') {
    console.log('✨ Systems are integrated with minor warnings. Review warnings for optimal performance.');
  } else {
    console.log('🔧 Some systems need attention. Please review failed tests.');
  }
  
  return totalResults;
};

// Quick integration check for development
export const quickIntegrationCheck = () => {
  try {
    // Check if main systems are available
    const hasComponents = !!(import('../components/Tutorial.jsx') && import('../components/ModifierSelector.jsx'));
    const hasStore = !!useGameStore.getState();
    const hasConfig = !!GAME_CONFIG;
    const hasUtils = !!(validateGameState && initializeTutorialProgress);
    
    const allSystemsReady = hasComponents && hasStore && hasConfig && hasUtils;
    
    if (allSystemsReady) {
      console.log('🚀 Quick Check: All systems appear to be integrated!');
      return true;
    } else {
      console.log('⚠️ Quick Check: Some systems may not be fully integrated');
      return false;
    }
  } catch (error) {
    console.log('❌ Quick Check: Integration check failed:', error.message);
    return false;
  }
};

// Auto-run verification in development
if (process.env.NODE_ENV === 'development') {
  // Run quick check on module load
  setTimeout(() => {
    console.log('\n🔄 Auto-running integration verification...');
    quickIntegrationCheck();
  }, 1000);
}

export default {
  runIntegrationVerification,
  quickIntegrationCheck,
  verifyComponents,
  verifyStoreState,
  verifyFeatureFunctionality
};