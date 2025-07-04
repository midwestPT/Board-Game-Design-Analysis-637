// Game Modifiers - Ongoing effects that add challenge and variety
export const gameModifiers = {
  // Energy & Resource Modifiers
  running_on_empty: {
    id: 'running_on_empty',
    name: 'Running on Empty',
    description: 'Start each turn with -1 energy regeneration',
    flavor: 'That 7am coffee isn\'t working anymore',
    icon: '☕',
    visual: 'coffee cup dripping empty with therapist holding it and clock showing 7am',
    effect: {
      type: 'energy_regeneration',
      modifier: -1,
      duration: 'permanent'
    },
    difficulty: 'easy'
  },
  
  double_booked: {
    id: 'double_booked',
    name: 'Double Booked',
    description: 'Every 3rd turn, lose 1 additional energy',
    flavor: 'Someone forgot to check the schedule',
    icon: '📅',
    visual: 'calendar with overlapping appointments',
    effect: {
      type: 'periodic_energy_loss',
      modifier: -1,
      interval: 3,
      duration: 'permanent'
    },
    difficulty: 'easy'
  },

  new_grad_nerves: {
    id: 'new_grad_nerves',
    name: 'New Grad Nerves',
    description: 'Start with -2 rapport, first assessment costs +1 energy',
    flavor: 'Is this normal? Should I know this already?',
    icon: '😰',
    visual: 'nervous therapist with sweat drops',
    effect: {
      type: 'multiple',
      effects: [
        { type: 'starting_rapport', modifier: -2 },
        { type: 'first_assessment_cost', modifier: 1 }
      ],
      duration: 'permanent'
    },
    difficulty: 'medium'
  },

  patient_from_hell: {
    id: 'patient_from_hell',
    name: 'Patient from Hell',
    description: 'Patient starts with +3 deflection, +2 emotional instability',
    flavor: 'Good luck with this one',
    icon: '😈',
    visual: 'patient with arms crossed and angry expression',
    effect: {
      type: 'multiple',
      effects: [
        { type: 'starting_deflection', modifier: 3 },
        { type: 'starting_emotional', modifier: 2 }
      ],
      duration: 'permanent'
    },
    difficulty: 'medium'
  },

  documentation_nightmare: {
    id: 'documentation_nightmare',
    name: 'Documentation Nightmare',
    description: 'Every card played requires 1 additional energy',
    flavor: 'Chart by exception? More like chart by everything',
    icon: '📝',
    visual: 'stack of paperwork growing taller',
    effect: {
      type: 'card_cost_increase',
      modifier: 1,
      duration: 'permanent'
    },
    difficulty: 'hard'
  },

  insurance_denied: {
    id: 'insurance_denied',
    name: 'Insurance Denied',
    description: 'Treatment cards cost +2 energy, limited to 2 per game',
    flavor: 'Prior authorization required for everything',
    icon: '🚫',
    visual: 'red stamp saying DENIED on treatment plan',
    effect: {
      type: 'multiple',
      effects: [
        { type: 'treatment_cost_increase', modifier: 2 },
        { type: 'treatment_limit', modifier: 2 }
      ],
      duration: 'permanent'
    },
    difficulty: 'hard'
  },

  // Temporary Modifiers (2-4 turns)
  equipment_malfunction: {
    id: 'equipment_malfunction',
    name: 'Equipment Malfunction',
    description: 'Assessment cards have 50% chance to fail for 3 turns',
    flavor: 'The ultrasound machine is making weird noises',
    icon: '⚡',
    visual: 'broken equipment with sparks',
    effect: {
      type: 'assessment_failure_chance',
      modifier: 0.5,
      duration: 3
    },
    difficulty: 'medium'
  },

  supply_shortage: {
    id: 'supply_shortage',
    name: 'Supply Shortage',
    description: 'Treatment cards cost +1 energy for 4 turns',
    flavor: 'We\'re out of everything except hope',
    icon: '📦',
    visual: 'empty supply cabinet',
    effect: {
      type: 'treatment_cost_increase',
      modifier: 1,
      duration: 4
    },
    difficulty: 'easy'
  },

  fire_drill: {
    id: 'fire_drill',
    name: 'Fire Drill',
    description: 'Skip next turn, lose 2 rapport with patient',
    flavor: 'Not now, really?',
    icon: '🚨',
    visual: 'fire alarm with people evacuating',
    effect: {
      type: 'multiple',
      effects: [
        { type: 'skip_turn', modifier: 1 },
        { type: 'rapport_loss', modifier: -2 }
      ],
      duration: 1
    },
    difficulty: 'medium'
  },

  // Positive Modifiers (for balance)
  mentor_visit: {
    id: 'mentor_visit',
    name: 'Mentor Visit',
    description: 'Next 2 assessment cards reveal additional clues',
    flavor: 'Finally, someone who knows what they\'re doing',
    icon: '👨‍⚕️',
    visual: 'experienced therapist observing',
    effect: {
      type: 'assessment_bonus',
      modifier: 1,
      duration: 2
    },
    difficulty: 'bonus'
  },

  perfect_weather: {
    id: 'perfect_weather',
    name: 'Perfect Weather',
    description: 'Patient cooperation +1 for 3 turns',
    flavor: 'Even the weather is cooperating today',
    icon: '☀️',
    visual: 'sunny day through window',
    effect: {
      type: 'cooperation_bonus',
      modifier: 1,
      duration: 3
    },
    difficulty: 'bonus'
  }
};

// Modifier Sets for Different Difficulty Levels
export const modifierSets = {
  easy: {
    name: 'Rookie Challenges',
    description: 'Perfect for new therapists',
    count: 1,
    pool: ['running_on_empty', 'double_booked', 'supply_shortage']
  },
  
  medium: {
    name: 'Seasoned Professional',
    description: 'Real-world complications',
    count: 2,
    pool: ['running_on_empty', 'double_booked', 'new_grad_nerves', 'patient_from_hell', 'equipment_malfunction', 'fire_drill']
  },
  
  hard: {
    name: 'Nightmare Shift',
    description: 'Everything that can go wrong, will',
    count: 3,
    pool: ['documentation_nightmare', 'insurance_denied', 'patient_from_hell', 'equipment_malfunction', 'fire_drill', 'new_grad_nerves']
  },
  
  mixed: {
    name: 'Real World',
    description: 'Challenges with occasional bright spots',
    count: 2,
    pool: ['running_on_empty', 'patient_from_hell', 'equipment_malfunction', 'mentor_visit', 'perfect_weather']
  }
};

// Helper Functions
export const getRandomModifiers = (difficulty = 'medium') => {
  const set = modifierSets[difficulty];
  const selectedModifiers = [];
  const availableModifiers = [...set.pool];
  
  for (let i = 0; i < set.count && availableModifiers.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableModifiers.length);
    const modifierId = availableModifiers.splice(randomIndex, 1)[0];
    selectedModifiers.push(gameModifiers[modifierId]);
  }
  
  return selectedModifiers;
};

export const getModifiersByIds = (modifierIds) => {
  return modifierIds.map(id => gameModifiers[id]).filter(Boolean);
};

export const applyModifierEffects = (gameState, modifiers) => {
  let modifiedState = { ...gameState };
  
  modifiers.forEach(modifier => {
    const effects = modifier.effect.type === 'multiple' ? modifier.effect.effects : [modifier.effect];
    
    effects.forEach(effect => {
      switch (effect.type) {
        case 'starting_rapport':
          modifiedState.ptResources.rapport = Math.max(0, modifiedState.ptResources.rapport + effect.modifier);
          break;
        case 'starting_deflection':
          modifiedState.patientResources.deflection += effect.modifier;
          break;
        case 'starting_emotional':
          modifiedState.patientResources.emotional += effect.modifier;
          break;
        case 'energy_regeneration':
          modifiedState.modifiers = modifiedState.modifiers || {};
          modifiedState.modifiers.energyRegeneration = (modifiedState.modifiers.energyRegeneration || 0) + effect.modifier;
          break;
        case 'card_cost_increase':
          modifiedState.modifiers = modifiedState.modifiers || {};
          modifiedState.modifiers.cardCostIncrease = (modifiedState.modifiers.cardCostIncrease || 0) + effect.modifier;
          break;
        case 'treatment_cost_increase':
          modifiedState.modifiers = modifiedState.modifiers || {};
          modifiedState.modifiers.treatmentCostIncrease = (modifiedState.modifiers.treatmentCostIncrease || 0) + effect.modifier;
          break;
        case 'treatment_limit':
          modifiedState.modifiers = modifiedState.modifiers || {};
          modifiedState.modifiers.treatmentLimit = effect.modifier;
          break;
        case 'assessment_failure_chance':
          modifiedState.modifiers = modifiedState.modifiers || {};
          modifiedState.modifiers.assessmentFailureChance = effect.modifier;
          break;
        case 'cooperation_bonus':
          modifiedState.modifiers = modifiedState.modifiers || {};
          modifiedState.modifiers.cooperationBonus = (modifiedState.modifiers.cooperationBonus || 0) + effect.modifier;
          break;
        case 'rapport_loss':
          modifiedState.ptResources.rapport = Math.max(0, modifiedState.ptResources.rapport + effect.modifier);
          break;
      }
    });
  });
  
  return modifiedState;
};

export const updateTemporaryModifiers = (gameState) => {
  if (!gameState.activeModifiers) return gameState;
  
  const updatedModifiers = gameState.activeModifiers.map(modifier => {
    if (modifier.effect.duration === 'permanent') {
      return modifier;
    }
    
    const remainingDuration = (modifier.remainingDuration || modifier.effect.duration) - 1;
    
    if (remainingDuration <= 0) {
      return null; // Mark for removal
    }
    
    return {
      ...modifier,
      remainingDuration
    };
  }).filter(Boolean);
  
  return {
    ...gameState,
    activeModifiers: updatedModifiers
  };
};