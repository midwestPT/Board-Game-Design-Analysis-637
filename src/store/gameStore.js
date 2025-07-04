import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { demoService } from '../services/demoService'
import { gameEngine } from '../engine/GameEngine'
import { multiplayerSync } from '../engine/MultiplayerSync'

const useGameStore = create((set, get) => ({
  gameState: null,
  currentPlayer: 'pt_student',
  gameId: null,
  loading: false,
  error: null,
  isDemoMode: !supabase,
  predictions: null,
  victoryStatus: null,

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

      // Generate initial predictions
      const predictions = await gameEngine.predictionEngine.generatePredictions(game.game_state)

      set({
        gameState: game.game_state,
        gameId: game.id,
        currentPlayer: game.game_state.currentPlayer,
        predictions: predictions,
        loading: false
      })

      return game
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  playCard: async (cardId, targetId = null) => {
    const state = get()
    const { gameState, currentPlayer, gameId } = state
    
    if (!gameState) return

    try {
      // Use game engine to process card play
      const result = await gameEngine.processCardPlay(
        gameState, 
        cardId, 
        currentPlayer, 
        targetId
      )

      if (!result.success) {
        set({ error: result.error })
        return { success: false, error: result.error, suggestions: result.suggestions }
      }

      // Update local state
      set({
        gameState: result.gameState,
        predictions: result.predictions,
        victoryStatus: result.victoryUpdate,
        error: null
      })

      // Sync with multiplayer if applicable
      if (gameState.isMultiplayer) {
        await multiplayerSync.synchronizeGameState(
          gameId,
          result.gameState,
          currentPlayer,
          { type: 'play_card', cardId, targetId }
        )
      }

      return {
        success: true,
        interactions: result.interactions,
        educationalFeedback: result.educationalFeedback
      }
    } catch (error) {
      console.error('Error playing card:', error)
      set({ error: error.message })
      return { success: false, error: error.message }
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

      // Clear cards played this turn
      newGameState.cardsPlayedThisTurn = []

      // Draw card if hand size below 5
      const currentHand = newGameState.playerHands[nextPlayer]
      if (currentHand.length < 5) {
        const newCard = demoService.generateStartingHand(nextPlayer)[0]
        if (newCard) {
          newCard.id = `${newCard.id}_${Date.now()}`
          newGameState.playerHands[nextPlayer].push(newCard)
        }
      }

      newGameState.currentPlayer = nextPlayer

      // Generate new predictions
      const predictions = await gameEngine.predictionEngine.generatePredictions(newGameState)

      // Update victory conditions
      const victoryUpdate = await gameEngine.victorySystem.updateVictoryConditions(newGameState, {})

      set({
        gameState: newGameState,
        currentPlayer: nextPlayer,
        predictions: predictions,
        victoryStatus: victoryUpdate
      })

      // Check for game end
      if (victoryUpdate.game_end_triggered) {
        await get().endGame(victoryUpdate.game_end_triggered)
      }

    } catch (error) {
      console.error('Error ending turn:', error)
      set({ error: error.message })
    }
  },

  // New method for handling counter cards during opponent's turn
  playCounterCard: async (cardId, targetActionId) => {
    const state = get()
    const { gameState, currentPlayer } = state

    if (!gameState) return

    try {
      // Validate counter timing
      const validation = await gameEngine.validators.validateCounterPlay(
        gameState, 
        cardId, 
        currentPlayer, 
        targetActionId
      )

      if (!validation.isValid) {
        return { success: false, error: validation.error }
      }

      // Process counter card
      const result = await gameEngine.processCardPlay(
        gameState, 
        cardId, 
        currentPlayer, 
        targetActionId
      )

      if (result.success) {
        set({
          gameState: result.gameState,
          predictions: result.predictions,
          victoryStatus: result.victoryUpdate
        })
      }

      return result
    } catch (error) {
      console.error('Error playing counter card:', error)
      return { success: false, error: error.message }
    }
  },

  // Get optimal play suggestions
  getPlaySuggestions: () => {
    const state = get()
    return state.predictions?.optimalPlays || []
  },

  // Get current victory progress
  getVictoryProgress: () => {
    const state = get()
    return state.victoryStatus?.victory_progress || {}
  },

  // Get learning moments
  getLearningMoments: () => {
    const state = get()
    return state.victoryStatus?.learning_moments || []
  },

  endGame: async (endCondition) => {
    const state = get()
    const { gameState, gameId } = state

    try {
      // Calculate final scores
      const finalScores = await gameEngine.victorySystem.calculateFinalScores(gameState)
      
      // Generate educational summary
      const educationalSummary = await gameEngine.generateEducationalSummary(gameState)

      // Save game performance
      if (gameId) {
        await get().saveGamePerformance({
          userId: gameState.players[0].id, // Assuming single player for demo
          gameId: gameId,
          ...finalScores,
          endCondition: endCondition,
          educationalSummary: educationalSummary
        })
      }

      set({
        gameState: { ...gameState, status: 'completed', endCondition, finalScores },
        predictions: null,
        victoryStatus: { ...state.victoryStatus, game_completed: true, finalScores }
      })

      return {
        finalScores,
        educationalSummary,
        endCondition
      }
    } catch (error) {
      console.error('Error ending game:', error)
      set({ error: error.message })
    }
  },

  saveGamePerformance: async (performanceData) => {
    const state = get()
    const { gameId } = state
    
    if (!gameId) return

    try {
      if (!supabase) {
        await demoService.saveGamePerformance(gameId, performanceData.userId, performanceData)
      } else {
        // Real Supabase save would go here
        await demoService.saveGamePerformance(gameId, performanceData.userId, performanceData)
      }
    } catch (error) {
      console.error('Error saving game performance:', error)
    }
  },

  // Multiplayer specific methods
  joinMultiplayerGame: async (roomId) => {
    try {
      // Initialize multiplayer connection
      const websocket = new WebSocket(`ws://localhost:3001/game/${roomId}`)
      
      await new Promise((resolve, reject) => {
        websocket.onopen = () => {
          multiplayerSync.initializeConnection(roomId, 'current_player_id', websocket)
          resolve()
        }
        websocket.onerror = reject
      })

      set({ isMultiplayer: true, roomId: roomId })
    } catch (error) {
      console.error('Error joining multiplayer game:', error)
      set({ error: 'Failed to join multiplayer game' })
    }
  },

  handleMultiplayerUpdate: (update) => {
    const state = get()
    
    // Handle different types of multiplayer updates
    switch (update.type) {
      case 'game_state_sync':
        set({ gameState: update.gameState })
        break
      case 'player_disconnected':
        // Handle player disconnection
        console.log('Player disconnected:', update.playerId)
        break
      case 'conflict_resolution':
        // Handle conflict resolution
        console.log('Conflict resolved:', update.resolution)
        break
    }
  }
}))

export default useGameStore