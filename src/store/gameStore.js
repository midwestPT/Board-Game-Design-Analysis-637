import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { demoService } from '../services/demoService'

const useGameStore = create((set, get) => ({
  gameState: null,
  currentPlayer: 'pt_student',
  gameId: null,
  loading: false,
  error: null,
  isDemoMode: !supabase,

  initializeGame: async (config) => {
    set({ loading: true, error: null })
    
    try {
      let game
      
      if (!supabase) {
        // Demo mode
        game = await demoService.createGame(config)
      } else {
        // Real Supabase game creation would go here
        game = await demoService.createGame(config) // Fallback to demo for now
      }

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
      // For demo, we'll just reinitialize a game
      const game = await demoService.createGame({
        mode: 'ai',
        difficulty: 'beginner',
        case: 'ankle_sprain',
        playerRole: 'pt'
      })

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
    const { gameState, currentPlayer } = state
    
    if (!gameState) return

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

      if (card.type === 'deflection') {
        newGameState.patientResources.deflection -= card.deflection_cost || 1
      }

      if (card.type === 'communication') {
        newGameState.ptResources.rapport += 1
      }

      // Add to game log
      newGameState.gameLog.push({
        player: currentPlayer,
        action: `Played ${card.name}`,
        timestamp: Date.now()
      })

      set({ gameState: newGameState })
    } catch (error) {
      console.error('Error playing card:', error)
      set({ error: error.message })
    }
  },

  endTurn: async () => {
    const state = get()
    const { gameState, currentPlayer } = state
    
    if (!gameState) return

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
        const newCard = demoService.generateStartingHand(nextPlayer)[0] // Get a random card
        if (newCard) {
          newCard.id = `${newCard.id}_${Date.now()}` // Make unique
          newGameState.playerHands[nextPlayer].push(newCard)
        }
      }

      newGameState.currentPlayer = nextPlayer

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
      if (!supabase) {
        // Demo mode
        await demoService.saveGamePerformance(gameId, performanceData.userId, performanceData)
      } else {
        // Real Supabase save would go here
        await demoService.saveGamePerformance(gameId, performanceData.userId, performanceData)
      }
    } catch (error) {
      console.error('Error saving game performance:', error)
    }
  }
}))

export default useGameStore