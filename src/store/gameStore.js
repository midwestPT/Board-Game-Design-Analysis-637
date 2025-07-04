import {create} from 'zustand'
import {supabase} from '../lib/supabase'
import {demoService} from '../services/demoService'
import {gameEngine} from '../engine/GameEngine'
import {aiOpponent} from '../services/aiOpponentService'
import {applyModifierEffects, updateTemporaryModifiers} from '../data/gameModifiers'

const useGameStore = create((set, get) => ({
  gameState: null,
  currentPlayer: 'pt_student',
  gameId: null,
  loading: false,
  error: null,
  predictions: null,
  victoryStatus: null,
  aiThinking: false,
  playerRole: 'pt_student',
  activeModifiers: [],

  initializeGame: async (config) => {
    set({ loading: true, error: null })
    
    try {
      // Create game
      let game = await demoService.createGame(config)
      
      // Apply modifiers if provided
      if (config.modifiers && config.modifiers.length > 0) {
        game.game_state = applyModifierEffects(game.game_state, config.modifiers)
        game.game_state.activeModifiers = config.modifiers.map(modifier => ({
          ...modifier,
          remainingDuration: modifier.effect.duration === 'permanent' ? 'permanent' : modifier.effect.duration
        }))
      }
      
      // Set the human player's role
      const humanPlayerRole = config.playerRole === 'pt' ? 'pt_student' : 'patient'
      
      // Initialize AI opponent if playing against AI
      if (config.mode === 'ai') {
        await aiOpponent.initializeAI(config, game.game_state)
      }

      // Generate initial predictions
      const predictions = await gameEngine.predictionEngine.generatePredictions(game.game_state)

      set({
        gameState: game.game_state,
        gameId: game.id,
        currentPlayer: game.game_state.currentPlayer,
        playerRole: humanPlayerRole,
        predictions: predictions,
        loading: false,
        error: null,
        activeModifiers: game.game_state.activeModifiers || []
      })

      console.log('Game initialized successfully:', game.id)
      console.log('Human player role:', humanPlayerRole)
      console.log('Active modifiers:', game.game_state.activeModifiers)
      return game
    } catch (error) {
      console.error('Error initializing game:', error)
      set({ error: error.message, loading: false })
      throw error
    }
  },

  playCard: async (cardId, targetId = null) => {
    const state = get()
    const { gameState, currentPlayer, gameId, playerRole } = state

    if (!gameState) {
      console.error('No game state available')
      return { success: false, error: 'No active game' }
    }

    // Check if it's the human player's turn
    if (currentPlayer !== playerRole) {
      console.error('Not player turn:', { currentPlayer, playerRole })
      return { success: false, error: 'Not your turn' }
    }

    try {
      console.log(`Playing card ${cardId} for player ${currentPlayer}`)

      // Use game engine to process card play
      const result = await gameEngine.processCardPlay(
        gameState,
        cardId,
        currentPlayer,
        targetId
      )

      if (!result.success) {
        set({ error: result.error })
        return result
      }

      // Update local state
      set({
        gameState: result.gameState,
        predictions: result.predictions,
        victoryStatus: result.victoryUpdate,
        error: null
      })

      console.log('Card played successfully:', result.interactions)

      // If playing against AI and it's now the AI's turn, trigger AI response
      if (result.gameState.currentPlayer !== playerRole && gameState.game_mode === 'ai') {
        setTimeout(() => get().handleAITurn(), 1000) // Small delay for better UX
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

  handleAITurn: async () => {
    const state = get()
    const { gameState, playerRole } = state

    if (!gameState || gameState.currentPlayer === playerRole) {
      console.log('Not AI turn or no game state')
      return
    }

    try {
      set({ aiThinking: true })
      console.log('AI is thinking...')

      // Determine AI player role (opposite of human player)
      const aiPlayerRole = playerRole === 'pt_student' ? 'patient' : 'pt_student'

      // Get AI response
      const aiResponse = await aiOpponent.generateAIResponse(gameState, null)
      console.log('AI response:', aiResponse)

      if (aiResponse.action === 'play_card' && aiResponse.cardId) {
        console.log('AI playing card:', aiResponse.cardId, aiResponse.reasoning)

        // Process AI card play
        const result = await gameEngine.processCardPlay(
          gameState,
          aiResponse.cardId,
          aiPlayerRole,
          null
        )

        if (result.success) {
          // Add AI card play to game log with better formatting
          const playerName = aiPlayerRole === 'pt_student' ? 'Therapist' : 'Patient'
          result.gameState.gameLog.push({
            timestamp: Date.now(),
            action: 'card_played',
            player: aiPlayerRole,
            cardPlayed: aiResponse.cardId,
            cardName: result.gameState.playerHands[aiPlayerRole]?.find(c => c.id === aiResponse.cardId)?.name || 'Unknown Card',
            message: `${playerName} played ${result.gameState.playerHands[aiPlayerRole]?.find(c => c.id === aiResponse.cardId)?.name || 'a card'}.`,
            aiReasoning: aiResponse.reasoning,
            personality_context: aiResponse.personality_context
          })

          // Generate new predictions for human player
          const predictions = await gameEngine.predictionEngine.generatePredictions(result.gameState)

          set({
            gameState: result.gameState,
            predictions: predictions,
            victoryStatus: result.victoryUpdate,
            currentPlayer: result.gameState.currentPlayer,
            aiThinking: false
          })

          console.log('AI turn completed successfully')
        } else {
          console.error('AI card play failed:', result.error)
          // Force end AI turn if card play fails
          await get().forceEndAITurn()
        }
      } else {
        console.log('AI chose not to play a card:', aiResponse.message)
        // AI passes, force end turn
        await get().forceEndAITurn()
      }
    } catch (error) {
      console.error('Error during AI turn:', error)
      // Force end AI turn on error
      await get().forceEndAITurn()
    }
  },

  forceEndAITurn: async () => {
    const state = get()
    const { gameState, playerRole } = state

    try {
      console.log('Force ending AI turn')
      const newGameState = { ...gameState }
      
      // Switch back to human player
      newGameState.currentPlayer = playerRole
      
      // Add log entry
      newGameState.gameLog.push({
        timestamp: Date.now(),
        action: 'ai_turn_ended',
        player: 'system',
        message: 'AI turn ended, returning to player'
      })

      set({
        gameState: newGameState,
        currentPlayer: playerRole,
        aiThinking: false
      })

      console.log('AI turn force ended, back to player')
    } catch (error) {
      console.error('Error force ending AI turn:', error)
      set({ aiThinking: false, error: error.message })
    }
  },

  endTurn: async () => {
    const state = get()
    const { gameState, currentPlayer, playerRole } = state

    if (!gameState) return

    // Only allow human player to end their own turn
    if (currentPlayer !== playerRole) {
      console.log('Cannot end turn - not player turn')
      return
    }

    try {
      console.log(`Ending turn for ${currentPlayer}`)
      const newGameState = { ...gameState }

      // Determine next player (opposite role)
      const nextPlayer = playerRole === 'pt_student' ? 'patient' : 'pt_student'

      // Update temporary modifiers
      newGameState = updateTemporaryModifiers(newGameState)
      
      // If returning to human player, increment turn
      if (nextPlayer === playerRole) {
        newGameState.turnNumber += 1
        console.log(`Starting turn ${newGameState.turnNumber}`)
      }

      // Regenerate energy for the next player at start of their turn (with modifiers)
      if (nextPlayer === 'pt_student') {
        const baseRegen = 3
        const modifierRegen = newGameState.modifiers?.energyRegeneration || 0
        const totalRegen = Math.max(1, baseRegen + modifierRegen) // Minimum 1 energy per turn
        newGameState.ptResources.energy = Math.min(12, newGameState.ptResources.energy + totalRegen)
      } else {
        newGameState.patientResources.energy = Math.min(12, newGameState.patientResources.energy + 3)
      }

      // Clear cards played this turn
      newGameState.cardsPlayedThisTurn = []

      // Draw card if hand size below 5
      const currentHand = newGameState.playerHands[nextPlayer]
      if (currentHand && currentHand.length < 5) {
        const newCard = get().drawCard(nextPlayer, newGameState.currentCase.id)
        if (newCard) {
          newGameState.playerHands[nextPlayer].push(newCard)
          console.log(`${nextPlayer} drew a new card: ${newCard.name}`)
        }
      }

      newGameState.currentPlayer = nextPlayer

      // Add turn change to log with better formatting
      const currentPlayerName = currentPlayer === 'pt_student' ? 'Therapist' : 'Patient'
      const nextPlayerName = nextPlayer === 'pt_student' ? 'Therapist' : 'Patient'
      
      newGameState.gameLog.push({
        timestamp: Date.now(),
        action: 'turn_ended',
        player: currentPlayer,
        message: `${currentPlayerName} ended their turn. ${nextPlayerName}'s turn begins.`
      })

      // Generate new predictions
      const predictions = await gameEngine.predictionEngine.generatePredictions(newGameState)

      // Update victory conditions
      const victoryUpdate = await gameEngine.victorySystem.updateVictoryConditions(newGameState, {})

      set({
        gameState: newGameState,
        currentPlayer: nextPlayer,
        predictions: predictions,
        victoryStatus: victoryUpdate,
        activeModifiers: newGameState.activeModifiers || []
      })

      // Check for game end
      if (victoryUpdate.game_end_triggered) {
        await get().endGame(victoryUpdate.game_end_triggered)
        return
      }

      // If it's now the AI's turn, trigger AI response
      if (nextPlayer !== playerRole && gameState.game_mode === 'ai') {
        setTimeout(() => get().handleAITurn(), 1500)
      }
    } catch (error) {
      console.error('Error ending turn:', error)
      set({ error: error.message })
    }
  },

  drawCard: (playerType, caseId) => {
    // Generate a new card for the player using enhanced card database
    const cardPool = playerType === 'pt_student'
      ? demoService.generatePTCards(caseId)
      : demoService.generatePatientCards(caseId)

    if (cardPool.length === 0) return null

    const randomCard = cardPool[Math.floor(Math.random() * cardPool.length)]
    return {
      ...randomCard,
      id: `${randomCard.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
      console.log('Game ending:', endCondition)

      // Calculate final scores
      const finalScores = {
        pt_score: gameEngine.victorySystem.calculatePTScore(gameState),
        patient_score: gameEngine.victorySystem.calculatePatientScore(state.victoryStatus?.victory_progress || {}),
        accuracy: Math.round((gameState.discoveredClues.length / 10) * 100),
        efficiency: Math.round(((gameState.maxTurns - gameState.turnNumber) / gameState.maxTurns) * 100),
        communication: Math.round((gameState.ptResources.rapport / 10) * 100)
      }

      // Generate educational summary
      const educationalSummary = {
        competencies_demonstrated: Object.keys(gameState.competencyProgress),
        learning_moments: state.victoryStatus?.learning_moments || [],
        areas_for_improvement: [],
        clinical_insights: []
      }

      // Save game performance
      if (gameId) {
        await demoService.saveGamePerformance(gameId, state.gameState?.creator_id, {
          ...finalScores,
          endCondition: endCondition,
          educationalSummary: educationalSummary
        })
      }

      set({
        gameState: {
          ...gameState,
          status: 'completed',
          endCondition,
          finalScores
        },
        predictions: null,
        victoryStatus: {
          ...state.victoryStatus,
          game_completed: true,
          finalScores
        }
      })

      console.log('Game ended successfully:', finalScores)
      return { finalScores, educationalSummary, endCondition }
    } catch (error) {
      console.error('Error ending game:', error)
      set({ error: error.message })
    }
  },

  // Reset game state
  resetGame: () => {
    set({
      gameState: null,
      currentPlayer: 'pt_student',
      gameId: null,
      loading: false,
      error: null,
      predictions: null,
      victoryStatus: null,
      aiThinking: false,
      playerRole: 'pt_student',
      activeModifiers: []
    })
  }
}))

export default useGameStore
