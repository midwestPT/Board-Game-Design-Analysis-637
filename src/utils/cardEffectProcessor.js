// Card Effect Processing Utility for PhysioTactics
import { getRandomModifiers, applyModifierEffects } from '../data/gameModifiers'

export class CardEffectProcessor {
  constructor(gameEngine) {
    this.gameEngine = gameEngine
    this.activeEffects = new Map()
  }

  // Process PT Student Card Effects
  processPTCardEffect(card, gameState) {
    const effects = {
      assessment: () => this.processAssessmentCard(card, gameState),
      history_taking: () => this.processHistoryTakingCard(card, gameState),
      clinical_reasoning: () => this.processClinicalReasoningCard(card, gameState),
      communication: () => this.processCommunicationCard(card, gameState),
      treatment: () => this.processTreatmentCard(card, gameState)
    }

    return effects[card.type]?.() || this.processDefaultEffect(card, gameState)
  }

  // Process Patient Card Effects
  processPatientCardEffect(card, gameState) {
    const effects = {
      deflection: () => this.processDeflectionCard(card, gameState),
      emotional_state: () => this.processEmotionalStateCard(card, gameState),
      complexity: () => this.processComplexityCard(card, gameState)
    }

    return effects[card.type]?.() || this.processDefaultEffect(card, gameState)
  }

  // Assessment Card Processing
  processAssessmentCard(card, gameState) {
    const result = {
      cluesRevealed: card.clues_revealed || 1,
      confidenceBoost: card.confidence_boost || 0,
      energyCost: card.energy_cost || 0,
      effects: []
    }

    // Apply modifiers
    if (gameState.activeModifiers) {
      const modifierEffects = applyModifierEffects(gameState.activeModifiers, 'assessment')
      result.energyCost = Math.max(0, result.energyCost + (modifierEffects.energyCostModifier || 0))
      result.confidenceBoost = Math.max(0, result.confidenceBoost + (modifierEffects.confidenceModifier || 0))
    }

    // Special card effects
    if (card.assessment_category === 'special_test') {
      result.effects.push({
        type: 'high_diagnostic_value',
        value: card.confidence_boost || 15
      })
    }

    if (card.assessment_category === 'neurological') {
      result.effects.push({
        type: 'red_flag_screening',
        value: true
      })
    }

    return result
  }

  // Communication Card Processing
  processCommunicationCard(card, gameState) {
    const result = {
      rapportChange: card.rapport_change || 0,
      countersEmotional: card.counters_emotional || false,
      reducesAnxiety: card.reduces_anxiety || false,
      energyCost: card.energy_cost || 0,
      effects: []
    }

    // Apply modifiers
    if (gameState.activeModifiers) {
      const modifierEffects = applyModifierEffects(gameState.activeModifiers, 'communication')
      result.energyCost = Math.max(0, result.energyCost + (modifierEffects.energyCostModifier || 0))
      result.rapportChange = Math.max(0, result.rapportChange + (modifierEffects.rapportModifier || 0))
    }

    // Special communication effects
    if (card.builds_cultural_trust) {
      result.effects.push({
        type: 'cultural_competence',
        value: 2
      })
    }

    if (card.manages_crisis) {
      result.effects.push({
        type: 'crisis_management',
        value: true
      })
    }

    return result
  }

  // Deflection Card Processing
  processDeflectionCard(card, gameState) {
    const result = {
      deflectionCost: card.deflection_cost || 0,
      informationReduction: card.information_reduction || 0,
      counters: card.counters || [],
      effects: []
    }

    // Apply modifiers
    if (gameState.activeModifiers) {
      const modifierEffects = applyModifierEffects(gameState.activeModifiers, 'deflection')
      result.deflectionCost = Math.max(0, result.deflectionCost + (modifierEffects.deflectionCostModifier || 0))
    }

    // Special deflection effects
    if (card.misinformation) {
      result.effects.push({
        type: 'requires_education',
        value: true
      })
    }

    if (card.resists_guidance) {
      result.effects.push({
        type: 'guidance_resistance',
        value: 0.5
      })
    }

    return result
  }

  // Emotional State Card Processing
  processEmotionalStateCard(card, gameState) {
    const result = {
      emotionalCost: card.emotional_cost || 0,
      emotionType: card.emotion_type || 'neutral',
      requiresResponse: card.requires_response || null,
      effects: []
    }

    // Apply modifiers
    if (gameState.activeModifiers) {
      const modifierEffects = applyModifierEffects(gameState.activeModifiers, 'emotional')
      result.emotionalCost = Math.max(0, result.emotionalCost + (modifierEffects.emotionalCostModifier || 0))
    }

    // Special emotional effects
    if (card.affects_participation) {
      result.effects.push({
        type: 'participation_impact',
        value: 0.7
      })
    }

    if (card.impairs_healing) {
      result.effects.push({
        type: 'healing_impairment',
        value: true
      })
    }

    return result
  }

  // Treatment Card Processing
  processTreatmentCard(card, gameState) {
    const result = {
      energyCost: card.energy_cost || 0,
      requiresAssessment: card.requires_assessment || false,
      requiresRapport: card.requires_rapport || 0,
      effects: []
    }

    // Apply modifiers
    if (gameState.activeModifiers) {
      const modifierEffects = applyModifierEffects(gameState.activeModifiers, 'treatment')
      result.energyCost = Math.max(0, result.energyCost + (modifierEffects.energyCostModifier || 0))
    }

    // Special treatment effects
    if (card.improves_function) {
      result.effects.push({
        type: 'functional_improvement',
        value: true
      })
    }

    if (card.prevents_reinjury) {
      result.effects.push({
        type: 'injury_prevention',
        value: true
      })
    }

    return result
  }

  // Clinical Reasoning Card Processing
  processClinicalReasoningCard(card, gameState) {
    const result = {
      energyCost: card.energy_cost || 0,
      confidenceBoost: card.confidence_boost || 0,
      requiresClues: card.requires_clues || 0,
      effects: []
    }

    // Apply modifiers
    if (gameState.activeModifiers) {
      const modifierEffects = applyModifierEffects(gameState.activeModifiers, 'clinical_reasoning')
      result.energyCost = Math.max(0, result.energyCost + (modifierEffects.energyCostModifier || 0))
      result.confidenceBoost = Math.max(0, result.confidenceBoost + (modifierEffects.confidenceModifier || 0))
    }

    // Special clinical reasoning effects
    if (card.counters_outdated_practices) {
      result.effects.push({
        type: 'evidence_based_practice',
        value: true
      })
    }

    if (card.wisdom_gained) {
      result.effects.push({
        type: 'peer_consultation',
        value: 15
      })
    }

    return result
  }

  // Complexity Card Processing
  processComplexityCard(card, gameState) {
    const result = {
      emotionalCost: card.emotional_cost || 0,
      complexityType: card.complexity_type || 'general',
      addsComplexity: card.adds_complexity || false,
      effects: []
    }

    // Apply modifiers
    if (gameState.activeModifiers) {
      const modifierEffects = applyModifierEffects(gameState.activeModifiers, 'complexity')
      result.emotionalCost = Math.max(0, result.emotionalCost + (modifierEffects.emotionalCostModifier || 0))
    }

    // Special complexity effects
    if (card.affects_attendance) {
      result.effects.push({
        type: 'attendance_impact',
        value: 0.8
      })
    }

    if (card.complicates_treatment) {
      result.effects.push({
        type: 'treatment_complexity',
        value: 1.5
      })
    }

    return result
  }

  // Default Effect Processing
  processDefaultEffect(card, gameState) {
    return {
      energyCost: card.energy_cost || 0,
      deflectionCost: card.deflection_cost || 0,
      emotionalCost: card.emotional_cost || 0,
      effects: []
    }
  }

  // Combo Effect Processing
  processComboEffects(cards, gameState) {
    const comboEffects = []
    
    // Check for card combinations
    const cardTypes = cards.map(card => card.type)
    
    // Assessment + Communication combo
    if (cardTypes.includes('assessment') && cardTypes.includes('communication')) {
      comboEffects.push({
        type: 'assessment_communication_combo',
        bonus: 5,
        description: 'Comprehensive assessment with excellent communication'
      })
    }

    // Treatment + Education combo
    if (cardTypes.includes('treatment') && cardTypes.includes('communication')) {
      comboEffects.push({
        type: 'treatment_education_combo',
        bonus: 3,
        description: 'Treatment with patient education'
      })
    }

    return comboEffects
  }

  // Victory Condition Processing
  processVictoryConditions(gameState) {
    const conditions = {
      diagnosticAccuracy: gameState.diagnosticConfidence >= 85,
      patientEngagement: gameState.rapport >= 8,
      efficientAssessment: gameState.turnNumber <= gameState.maxTurns * 0.75,
      comprehensiveAssessment: gameState.discoveredClues.length >= 5,
      excellentCommunication: gameState.rapport >= 9 && gameState.patientCooperation >= 8
    }

    return conditions
  }

  // Apply Active Effect
  applyActiveEffect(effectId, effect, duration = 1) {
    this.activeEffects.set(effectId, {
      effect,
      duration,
      appliedTurn: this.gameEngine.currentTurn
    })
  }

  // Process Active Effects
  processActiveEffects(gameState) {
    const effectsToRemove = []
    
    for (const [effectId, effectData] of this.activeEffects) {
      const turnsActive = gameState.turnNumber - effectData.appliedTurn
      
      if (turnsActive >= effectData.duration) {
        effectsToRemove.push(effectId)
      } else {
        // Apply ongoing effect
        this.applyOngoingEffect(effectData.effect, gameState)
      }
    }

    // Remove expired effects
    effectsToRemove.forEach(effectId => this.activeEffects.delete(effectId))
  }

  // Apply Ongoing Effect
  applyOngoingEffect(effect, gameState) {
    switch (effect.type) {
      case 'energy_boost':
        gameState.ptResources.energy += effect.value
        break
      case 'rapport_maintenance':
        gameState.rapport = Math.max(gameState.rapport, effect.value)
        break
      case 'confidence_boost':
        gameState.diagnosticConfidence += effect.value
        break
    }
  }

  // Get Effect Summary
  getEffectSummary(card) {
    const summary = {
      costs: [],
      benefits: [],
      special: []
    }

    if (card.energy_cost) summary.costs.push(`Energy: ${card.energy_cost}`)
    if (card.deflection_cost) summary.costs.push(`Deflection: ${card.deflection_cost}`)
    if (card.emotional_cost) summary.costs.push(`Emotional: ${card.emotional_cost}`)

    if (card.clues_revealed) summary.benefits.push(`Reveals ${card.clues_revealed} clue(s)`)
    if (card.confidence_boost) summary.benefits.push(`+${card.confidence_boost} confidence`)
    if (card.rapport_change) summary.benefits.push(`${card.rapport_change > 0 ? '+' : ''}${card.rapport_change} rapport`)

    if (card.counters_emotional) summary.special.push('Counters emotional cards')
    if (card.requires_assessment) summary.special.push('Requires prior assessment')
    if (card.advanced_technique) summary.special.push('Advanced technique')

    return summary
  }
}

export default CardEffectProcessor