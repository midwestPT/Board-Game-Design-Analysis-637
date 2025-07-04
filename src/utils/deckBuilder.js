// Deck Building Utility for PhysioTactics
import { PHYSIOTACTICS_CARD_DATABASE } from '../data/expandedCardDatabase'

export class DeckBuilder {
  constructor() {
    this.cardDatabase = PHYSIOTACTICS_CARD_DATABASE
  }

  // Build PT Student Deck
  buildPTDeck(difficulty = 'beginner', specialization = 'general', caseType = 'general') {
    const deckSize = this.getDeckSize(difficulty)
    const rarityDistribution = this.getRarityDistribution(difficulty)
    
    let availableCards = [...this.cardDatabase.pt_student_cards]
    
    // Add case-specific cards if available
    if (this.cardDatabase.case_specific_cards[caseType]?.pt_cards) {
      availableCards = [...availableCards, ...this.cardDatabase.case_specific_cards[caseType].pt_cards]
    }
    
    // Add advanced cards for higher difficulties
    if (difficulty !== 'beginner') {
      availableCards = [...availableCards, ...this.cardDatabase.advanced_pt_cards]
    }

    return this.buildDeckWithDistribution(availableCards, deckSize, rarityDistribution)
  }

  // Build Patient Deck
  buildPatientDeck(difficulty = 'beginner', personalityType = 'cooperative', caseType = 'general') {
    const deckSize = this.getDeckSize(difficulty)
    const rarityDistribution = this.getPatientRarityDistribution(difficulty, personalityType)
    
    let availableCards = [...this.cardDatabase.patient_cards]
    
    // Add case-specific cards if available
    if (this.cardDatabase.case_specific_cards[caseType]?.patient_cards) {
      availableCards = [...availableCards, ...this.cardDatabase.case_specific_cards[caseType].patient_cards]
    }
    
    // Add advanced cards for higher difficulties
    if (difficulty !== 'beginner') {
      availableCards = [...availableCards, ...this.cardDatabase.advanced_patient_cards]
    }

    // Filter by personality type
    availableCards = this.filterByPersonality(availableCards, personalityType)

    return this.buildDeckWithDistribution(availableCards, deckSize, rarityDistribution)
  }

  // Get deck size based on difficulty
  getDeckSize(difficulty) {
    const sizes = {
      beginner: 25,
      intermediate: 30,
      advanced: 35,
      expert: 40
    }
    return sizes[difficulty] || 25
  }

  // Get rarity distribution for PT deck
  getRarityDistribution(difficulty) {
    const distributions = {
      beginner: { common: 0.7, uncommon: 0.25, rare: 0.05, epic: 0, legendary: 0 },
      intermediate: { common: 0.6, uncommon: 0.3, rare: 0.08, epic: 0.02, legendary: 0 },
      advanced: { common: 0.5, uncommon: 0.35, rare: 0.12, epic: 0.03, legendary: 0 },
      expert: { common: 0.4, uncommon: 0.35, rare: 0.18, epic: 0.06, legendary: 0.01 }
    }
    return distributions[difficulty] || distributions.beginner
  }

  // Get rarity distribution for Patient deck
  getPatientRarityDistribution(difficulty, personalityType) {
    const baseDistribution = this.getRarityDistribution(difficulty)
    
    // Adjust based on personality type
    const adjustments = {
      cooperative: { rare: -0.05, common: 0.05 },
      challenging: { rare: 0.05, epic: 0.02, common: -0.07 },
      complex: { epic: 0.03, rare: 0.02, common: -0.05 },
      dramatic: { uncommon: 0.1, rare: 0.05, common: -0.15 }
    }

    const adjustment = adjustments[personalityType] || {}
    const adjusted = { ...baseDistribution }
    
    Object.keys(adjustment).forEach(rarity => {
      adjusted[rarity] = Math.max(0, adjusted[rarity] + adjustment[rarity])
    })

    return adjusted
  }

  // Build deck with specific rarity distribution
  buildDeckWithDistribution(availableCards, deckSize, rarityDistribution) {
    const deck = []
    const cardsByRarity = this.groupCardsByRarity(availableCards)
    
    // Calculate target counts for each rarity
    const targetCounts = {}
    Object.keys(rarityDistribution).forEach(rarity => {
      targetCounts[rarity] = Math.floor(deckSize * rarityDistribution[rarity])
    })

    // Add cards by rarity
    Object.keys(targetCounts).forEach(rarity => {
      const count = targetCounts[rarity]
      const cards = cardsByRarity[rarity] || []
      
      if (cards.length > 0) {
        for (let i = 0; i < count; i++) {
          const randomCard = cards[Math.floor(Math.random() * cards.length)]
          deck.push({ ...randomCard, id: `${randomCard.id}_${Date.now()}_${i}` })
        }
      }
    })

    // Fill remaining slots with common cards if needed
    while (deck.length < deckSize && cardsByRarity.common) {
      const randomCard = cardsByRarity.common[Math.floor(Math.random() * cardsByRarity.common.length)]
      deck.push({ ...randomCard, id: `${randomCard.id}_${Date.now()}_${deck.length}` })
    }

    return this.shuffleDeck(deck)
  }

  // Group cards by rarity
  groupCardsByRarity(cards) {
    return cards.reduce((groups, card) => {
      const rarity = card.rarity || 'common'
      if (!groups[rarity]) groups[rarity] = []
      groups[rarity].push(card)
      return groups
    }, {})
  }

  // Filter cards by personality type
  filterByPersonality(cards, personalityType) {
    const personalityFilters = {
      cooperative: (card) => !card.high_deflection && !card.dramatic,
      challenging: (card) => card.deflection_cost >= 2 || card.resists_guidance,
      complex: (card) => card.adds_complexity || card.complexity_type,
      dramatic: (card) => card.emotional_cost >= 2 || card.amplifies_symptoms
    }

    const filter = personalityFilters[personalityType]
    return filter ? cards.filter(filter) : cards
  }

  // Build starting hand
  buildStartingHand(playerType, difficulty = 'beginner', size = 5) {
    const deck = playerType === 'pt_student' 
      ? this.buildPTDeck(difficulty)
      : this.buildPatientDeck(difficulty)
    
    return deck.slice(0, size)
  }

  // Build balanced deck for multiplayer
  buildBalancedDeck(playerType, opponentDifficulty = 'intermediate') {
    if (playerType === 'pt_student') {
      return this.buildPTDeck('intermediate', 'general')
    } else {
      return this.buildPatientDeck(opponentDifficulty, 'challenging')
    }
  }

  // Build tutorial deck with specific cards
  buildTutorialDeck(step) {
    const tutorialCards = {
      1: [ // Basic Assessment
        this.cardDatabase.pt_student_cards.find(c => c.id === 'pt_rom_assessment'),
        this.cardDatabase.pt_student_cards.find(c => c.id === 'pt_pain_scale_reality'),
        this.cardDatabase.pt_student_cards.find(c => c.id === 'pt_active_listening')
      ],
      2: [ // Communication
        this.cardDatabase.pt_student_cards.find(c => c.id === 'pt_empathetic_response'),
        this.cardDatabase.pt_student_cards.find(c => c.id === 'pt_reassurance'),
        this.cardDatabase.pt_student_cards.find(c => c.id === 'pt_education_anatomy')
      ],
      3: [ // Clinical Reasoning
        this.cardDatabase.pt_student_cards.find(c => c.id === 'pt_differential_diagnosis'),
        this.cardDatabase.pt_student_cards.find(c => c.id === 'pt_clinical_instinct'),
        this.cardDatabase.pt_student_cards.find(c => c.id === 'pt_evidence_review')
      ]
    }

    return tutorialCards[step] || []
  }

  // Shuffle deck
  shuffleDeck(deck) {
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Draw cards from deck
  drawCards(deck, count = 1) {
    return deck.splice(0, count)
  }

  // Validate deck composition
  validateDeck(deck, requirements = {}) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      stats: this.getDeckStats(deck)
    }

    // Check minimum deck size
    if (deck.length < (requirements.minSize || 20)) {
      validation.isValid = false
      validation.errors.push(`Deck too small: ${deck.length} cards (minimum ${requirements.minSize || 20})`)
    }

    // Check energy curve
    const energyCurve = this.getEnergyCurve(deck)
    if (energyCurve.high > 0.3) {
      validation.warnings.push('High energy cost cards may be difficult to play')
    }

    // Check card type balance
    const typeBalance = this.getTypeBalance(deck)
    if (typeBalance.assessment < 0.2) {
      validation.warnings.push('Low number of assessment cards')
    }

    return validation
  }

  // Get deck statistics
  getDeckStats(deck) {
    return {
      size: deck.length,
      rarityDistribution: this.calculateRarityDistribution(deck),
      energyCurve: this.getEnergyCurve(deck),
      typeBalance: this.getTypeBalance(deck),
      averageEnergyCost: this.getAverageEnergyCost(deck)
    }
  }

  // Calculate rarity distribution
  calculateRarityDistribution(deck) {
    const distribution = {}
    deck.forEach(card => {
      const rarity = card.rarity || 'common'
      distribution[rarity] = (distribution[rarity] || 0) + 1
    })
    
    Object.keys(distribution).forEach(rarity => {
      distribution[rarity] = distribution[rarity] / deck.length
    })
    
    return distribution
  }

  // Get energy curve
  getEnergyCurve(deck) {
    const curve = { low: 0, medium: 0, high: 0 }
    
    deck.forEach(card => {
      const cost = card.energy_cost || card.deflection_cost || card.emotional_cost || 0
      if (cost <= 1) curve.low++
      else if (cost <= 2) curve.medium++
      else curve.high++
    })

    Object.keys(curve).forEach(level => {
      curve[level] = curve[level] / deck.length
    })

    return curve
  }

  // Get type balance
  getTypeBalance(deck) {
    const balance = {}
    deck.forEach(card => {
      const type = card.type
      balance[type] = (balance[type] || 0) + 1
    })
    
    Object.keys(balance).forEach(type => {
      balance[type] = balance[type] / deck.length
    })
    
    return balance
  }

  // Get average energy cost
  getAverageEnergyCost(deck) {
    const totalCost = deck.reduce((sum, card) => {
      return sum + (card.energy_cost || card.deflection_cost || card.emotional_cost || 0)
    }, 0)
    
    return totalCost / deck.length
  }

  // Create custom deck
  createCustomDeck(cardIds) {
    const customDeck = []
    
    cardIds.forEach(cardId => {
      const card = this.findCardById(cardId)
      if (card) {
        customDeck.push({ ...card, id: `${card.id}_custom_${Date.now()}` })
      }
    })
    
    return customDeck
  }

  // Find card by ID
  findCardById(cardId) {
    const allCards = [
      ...this.cardDatabase.pt_student_cards,
      ...this.cardDatabase.patient_cards,
      ...this.cardDatabase.advanced_pt_cards,
      ...this.cardDatabase.advanced_patient_cards
    ]
    
    // Also check case-specific cards
    Object.values(this.cardDatabase.case_specific_cards || {}).forEach(caseCards => {
      if (caseCards.pt_cards) allCards.push(...caseCards.pt_cards)
      if (caseCards.patient_cards) allCards.push(...caseCards.patient_cards)
    })
    
    return allCards.find(card => card.id === cardId)
  }

  // Get recommended deck for case
  getRecommendedDeck(caseType, playerRole, difficulty) {
    if (playerRole === 'pt_student') {
      return this.buildPTDeck(difficulty, 'general', caseType)
    } else {
      return this.buildPatientDeck(difficulty, 'challenging', caseType)
    }
  }
}

export default DeckBuilder