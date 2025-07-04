import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  gameState: null,
  currentPlayer: 'pt_student',
  
  initializeGame: (config) => {
    const initialState = {
      turnNumber: 1,
      maxTurns: config.difficulty === 'beginner' ? 10 : 
                 config.difficulty === 'intermediate' ? 8 : 6,
      currentCase: {
        id: config.case,
        title: getCaseTitle(config.case),
        difficulty: config.difficulty
      },
      ptResources: {
        energy: 10,
        rapport: 5
      },
      patientResources: {
        cooperation: 7,
        deflection: 8,
        emotional: 6
      },
      playerHands: {
        pt_student: generateStartingHand('pt_student'),
        patient: generateStartingHand('patient')
      },
      discoveredClues: [],
      activeEffects: {
        pt_student: [],
        patient: []
      },
      gameLog: []
    };
    
    set({ 
      gameState: initialState,
      currentPlayer: 'pt_student'
    });
  },

  playCard: (cardId) => {
    const state = get();
    const { gameState, currentPlayer } = state;
    
    if (!gameState) return;

    const playerHand = gameState.playerHands[currentPlayer];
    const card = playerHand.find(c => c.id === cardId);
    
    if (!card) return;

    // Create new game state with card effects applied
    const newGameState = { ...gameState };
    
    // Remove card from hand
    newGameState.playerHands[currentPlayer] = playerHand.filter(c => c.id !== cardId);
    
    // Apply card effects (simplified for demo)
    if (card.type === 'assessment') {
      newGameState.discoveredClues.push({
        id: Date.now(),
        description: `Discovered: ${card.name} findings`,
        source: card.name
      });
      newGameState.ptResources.energy -= card.energy_cost || 1;
    }
    
    // Add to game log
    newGameState.gameLog.push({
      player: currentPlayer,
      action: `Played ${card.name}`,
      timestamp: Date.now()
    });
    
    set({ gameState: newGameState });
  },

  endTurn: () => {
    const state = get();
    const { gameState, currentPlayer } = state;
    
    if (!gameState) return;

    const newGameState = { ...gameState };
    
    // Switch players
    const nextPlayer = currentPlayer === 'pt_student' ? 'patient' : 'pt_student';
    
    // If returning to PT student, increment turn
    if (nextPlayer === 'pt_student') {
      newGameState.turnNumber += 1;
      // Regenerate energy
      newGameState.ptResources.energy = Math.min(12, newGameState.ptResources.energy + 2);
    }
    
    // Draw card if hand size below 5
    const currentHand = newGameState.playerHands[nextPlayer];
    if (currentHand.length < 5) {
      const newCard = generateRandomCard(nextPlayer);
      if (newCard) {
        newGameState.playerHands[nextPlayer].push(newCard);
      }
    }
    
    set({ 
      gameState: newGameState,
      currentPlayer: nextPlayer 
    });
  }
}));

// Helper functions
function getCaseTitle(caseId) {
  const cases = {
    ankle_sprain: 'Lateral Ankle Sprain',
    low_back_pain: 'Chronic Low Back Pain',
    shoulder_impingement: 'Shoulder Impingement',
    fibromyalgia: 'Fibromyalgia Syndrome'
  };
  return cases[caseId] || 'Unknown Case';
}

function generateStartingHand(playerType) {
  // Simplified card generation for demo
  const ptCards = [
    {
      id: 'rom_test_1',
      name: 'Range of Motion Test',
      type: 'assessment',
      energy_cost: 2,
      rarity: 'common',
      card_text: 'Reveal 1 Physical Finding. Patient may play 1 Deflection card in response.'
    },
    {
      id: 'pain_scale_1',
      name: 'Pain Scale Assessment',
      type: 'history_taking',
      energy_cost: 1,
      rarity: 'common',
      card_text: 'Reveals current pain level (1-10). Patient may modify by ±2.'
    },
    {
      id: 'empathy_1',
      name: 'Therapeutic Empathy',
      type: 'communication',
      energy_cost: 0,
      rarity: 'common',
      card_text: 'Counters Patient emotional cards. Maintains cooperation level.'
    }
  ];

  const patientCards = [
    {
      id: 'minimize_1',
      name: 'Minimize Symptoms',
      type: 'deflection',
      deflection_cost: 1,
      rarity: 'common',
      card_text: 'Reduce reported pain/dysfunction by 50%.'
    },
    {
      id: 'anxiety_1',
      name: 'Performance Anxiety',
      type: 'emotional_state',
      emotional_cost: 2,
      rarity: 'common',
      card_text: 'PT must play Communication card or lose 1 rapport point.'
    }
  ];

  return playerType === 'pt_student' ? ptCards : patientCards;
}

function generateRandomCard(playerType) {
  // Simplified random card generation
  const ptCards = [
    {
      id: `new_pt_${Date.now()}`,
      name: 'Clinical Assessment',
      type: 'assessment',
      energy_cost: 2,
      rarity: 'common',
      card_text: 'Gather clinical information about the patient.'
    }
  ];

  const patientCards = [
    {
      id: `new_patient_${Date.now()}`,
      name: 'Hesitation',
      type: 'deflection',
      deflection_cost: 1,
      rarity: 'common',
      card_text: 'Avoid providing direct answers.'
    }
  ];

  const cards = playerType === 'pt_student' ? ptCards : patientCards;
  return cards[Math.floor(Math.random() * cards.length)];
}

export default useGameStore;