import { supabase } from '../lib/supabase'

export class GameService {
  constructor() {
    this.currentGameId = null
  }

  async createGame(gameConfig) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const gameData = {
        creator_id: user.id,
        game_mode: gameConfig.mode || 'ai',
        difficulty: gameConfig.difficulty || 'beginner',
        case_id: gameConfig.case || 'ankle_sprain',
        player_role: gameConfig.playerRole || 'pt',
        game_state: this.initializeGameState(gameConfig),
        status: 'active',
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('games_pt2024')
        .insert([gameData])
        .select()
        .single()

      if (error) throw error

      this.currentGameId = data.id
      return data
    } catch (error) {
      console.error('Create game error:', error)
      throw error
    }
  }

  async getGame(gameId) {
    try {
      const { data, error } = await supabase
        .from('games_pt2024')
        .select('*')
        .eq('id', gameId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get game error:', error)
      throw error
    }
  }

  async updateGameState(gameId, newState) {
    try {
      const { data, error } = await supabase
        .from('games_pt2024')
        .update({
          game_state: newState,
          updated_at: new Date().toISOString()
        })
        .eq('id', gameId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Update game state error:', error)
      throw error
    }
  }

  async saveGameAction(gameId, action) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('game_actions_pt2024')
        .insert([{
          game_id: gameId,
          user_id: user.id,
          action_type: action.type,
          action_data: action.data,
          timestamp: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Save game action error:', error)
      throw error
    }
  }

  async getGameHistory(gameId) {
    try {
      const { data, error } = await supabase
        .from('game_actions_pt2024')
        .select('*')
        .eq('game_id', gameId)
        .order('timestamp', { ascending: true })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get game history error:', error)
      throw error
    }
  }

  async getUserGames(userId) {
    try {
      const { data, error } = await supabase
        .from('games_pt2024')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get user games error:', error)
      throw error
    }
  }

  initializeGameState(config) {
    return {
      turnNumber: 1,
      maxTurns: config.difficulty === 'beginner' ? 10 : config.difficulty === 'intermediate' ? 8 : 6,
      currentCase: {
        id: config.case,
        title: this.getCaseTitle(config.case),
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
        pt_student: this.generateStartingHand('pt_student'),
        patient: this.generateStartingHand('patient')
      },
      discoveredClues: [],
      activeEffects: {
        pt_student: [],
        patient: []
      },
      gameLog: [],
      currentPlayer: 'pt_student'
    }
  }

  getCaseTitle(caseId) {
    const cases = {
      ankle_sprain: 'Lateral Ankle Sprain',
      low_back_pain: 'Chronic Low Back Pain',
      shoulder_impingement: 'Shoulder Impingement',
      fibromyalgia: 'Fibromyalgia Syndrome'
    }
    return cases[caseId] || 'Unknown Case'
  }

  generateStartingHand(playerType) {
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
    ]

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
    ]

    return playerType === 'pt_student' ? ptCards : patientCards
  }
}

export const gameService = new GameService()