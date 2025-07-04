import { create } from 'zustand'
import { gameService } from '../services/gameService'
import { analyticsService } from '../services/analyticsService'

const useGameStore = create((set, get) => ({
  gameState: null,
  currentPlayer: 'pt_student',
  gameId: null,
  loading: false,
  error: null,

  initializeGame: async (config) => {
    set({ loading: true, error: null })
    
    try {
      const game = await gameService.createGame(config)
      set({
        gameState: game.game_state,
        gameId: game.id,
        currentPlayer: game.game_state.currentPlayer,
        loading: false
      })
      
      return game
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  loadGame: async (gameId) => {
    set({ loading: true, error: null })
    
    try {
      const game = await gameService.getGame(gameId)
      set({
        gameState: game.game_state,
        gameId: game.id,
        currentPlayer: game.game_state.currentPlayer,
        loading: false
      })
      
      return game
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  playCard: async (cardId) => {
    const state = get()
    const { gameState, currentPlayer, gameId } = state
    
    if (!gameState || !gameId) return

    try {
      const playerHand = gameState.playerHands[currentPlayer]
      const card = playerHand.find(c => c.id === cardId)
      
      if (!card) return

      // Create new game state with card effects applied
      const newGameState = { ...gameState }
      
      // Remove card from hand
      newGameState.playerHands[currentPlayer] = playerHand.filter(c => c.id !== cardId)
      
      // Apply card effects
      if (card.type === 'assessment') {
        newGameState.discoveredClues.push({
          id: Date.now(),
          description: `Discovered: ${card.name} findings`,
          source: card.name
        })
        newGameState.ptResources.energy -= card.energy_cost || 1
      }
      
      // Add to game log
      newGameState.gameLog.push({
        player: currentPlayer,
        action: `Played ${card.name}`,
        timestamp: Date.now()
      })

      // Save action to database
      await gameService.saveGameAction(gameId, {
        type: 'play_card',
        data: { cardId, cardName: card.name, player: currentPlayer }
      })

      // Update game state in database
      await gameService.updateGameState(gameId, newGameState)

      set({ gameState: newGameState })
    } catch (error) {
      console.error('Error playing card:', error)
      set({ error: error.message })
    }
  },

  endTurn: async () => {
    const state = get()
    const { gameState, currentPlayer, gameId } = state
    
    if (!gameState || !gameId) return

    try {
      const newGameState = { ...gameState }
      
      // Switch players
      const nextPlayer = currentPlayer === 'pt_student' ? 'patient' : 'pt_student'
      
      // If returning to PT student, increment turn
      if (nextPlayer === 'pt_student') {
        newGameState.turnNumber += 1
        // Regenerate energy
        newGameState.ptResources.energy = Math.min(12, newGameState.ptResources.energy + 2)
      }
      
      // Draw card if hand size below 5
      const currentHand = newGameState.playerHands[nextPlayer]
      if (currentHand.length < 5) {
        const newCard = gameService.generateRandomCard?.(nextPlayer)
        if (newCard) {
          newGameState.playerHands[nextPlayer].push(newCard)
        }
      }

      newGameState.currentPlayer = nextPlayer

      // Save action to database
      await gameService.saveGameAction(gameId, {
        type: 'end_turn',
        data: { previousPlayer: currentPlayer, nextPlayer }
      })

      // Update game state in database
      await gameService.updateGameState(gameId, newGameState)

      set({
        gameState: newGameState,
        currentPlayer: nextPlayer
      })
    } catch (error) {
      console.error('Error ending turn:', error)
      set({ error: error.message })
    }
  },

  saveGamePerformance: async (performanceData) => {
    const state = get()
    const { gameId } = state
    
    if (!gameId) return

    try {
      await analyticsService.saveGamePerformance(gameId, performanceData.userId, performanceData)
    } catch (error) {
      console.error('Error saving game performance:', error)
    }
  }
}))

export default useGameStore