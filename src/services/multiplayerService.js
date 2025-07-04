import { supabase } from '../lib/supabase'

export class MultiplayerService {
  constructor() {
    this.gameRooms = new Map()
    this.playerConnections = new Map()
    this.matchmakingQueue = []
  }

  async createGameRoom(hostId, gameConfig) {
    try {
      const roomId = this.generateRoomId()
      
      const { data: room, error } = await supabase
        .from('game_rooms_pt2024')
        .insert([{
          id: roomId,
          host_id: hostId,
          game_config: gameConfig,
          status: 'waiting',
          max_players: gameConfig.maxPlayers || 2,
          current_players: 1,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      // Set up real-time subscription for the room
      this.setupRoomSubscription(roomId)

      return room
    } catch (error) {
      console.error('Error creating game room:', error)
      throw error
    }
  }

  async joinGameRoom(roomId, playerId) {
    try {
      const { data: room, error } = await supabase
        .from('game_rooms_pt2024')
        .select('*')
        .eq('id', roomId)
        .single()

      if (error) throw error

      if (room.current_players >= room.max_players) {
        throw new Error('Room is full')
      }

      // Add player to room
      const { data: updatedRoom, error: updateError } = await supabase
        .from('game_rooms_pt2024')
        .update({
          current_players: room.current_players + 1,
          status: room.current_players + 1 >= room.max_players ? 'ready' : 'waiting'
        })
        .eq('id', roomId)
        .select()
        .single()

      if (updateError) throw updateError

      // Add player to room participants
      await supabase
        .from('room_participants_pt2024')
        .insert([{
          room_id: roomId,
          player_id: playerId,
          joined_at: new Date().toISOString()
        }])

      return updatedRoom
    } catch (error) {
      console.error('Error joining game room:', error)
      throw error
    }
  }

  async startMultiplayerGame(roomId) {
    try {
      const { data: room, error } = await supabase
        .from('game_rooms_pt2024')
        .select(`
          *,
          room_participants_pt2024 (
            player_id,
            user_profiles_pt2024 (
              full_name,
              role,
              institution_id
            )
          )
        `)
        .eq('id', roomId)
        .single()

      if (error) throw error

      // Create game instance
      const gameData = {
        room_id: roomId,
        creator_id: room.host_id,
        game_mode: 'multiplayer',
        difficulty: room.game_config.difficulty,
        case_id: room.game_config.case_id,
        game_state: this.initializeMultiplayerGameState(room),
        status: 'active',
        created_at: new Date().toISOString()
      }

      const { data: game, error: gameError } = await supabase
        .from('games_pt2024')
        .insert([gameData])
        .select()
        .single()

      if (gameError) throw gameError

      // Update room status
      await supabase
        .from('game_rooms_pt2024')
        .update({ status: 'in_progress', game_id: game.id })
        .eq('id', roomId)

      return game
    } catch (error) {
      console.error('Error starting multiplayer game:', error)
      throw error
    }
  }

  async findMatch(playerId, preferences) {
    try {
      // Add player to matchmaking queue
      const matchRequest = {
        player_id: playerId,
        preferences: preferences,
        timestamp: Date.now()
      }

      this.matchmakingQueue.push(matchRequest)

      // Try to find a match
      const match = await this.findCompatibleMatch(matchRequest)

      if (match) {
        // Remove both players from queue
        this.matchmakingQueue = this.matchmakingQueue.filter(
          req => req.player_id !== playerId && req.player_id !== match.player_id
        )

        // Create game room for matched players
        const room = await this.createGameRoom(playerId, {
          ...preferences,
          matchedWith: match.player_id
        })

        // Auto-join the matched player
        await this.joinGameRoom(room.id, match.player_id)

        return room
      }

      return null // No match found yet
    } catch (error) {
      console.error('Error in matchmaking:', error)
      throw error
    }
  }

  async findCompatibleMatch(request) {
    // Find compatible players based on preferences
    const compatiblePlayers = this.matchmakingQueue.filter(other => {
      if (other.player_id === request.player_id) return false
      
      // Check compatibility criteria
      const difficultyMatch = other.preferences.difficulty === request.preferences.difficulty
      const roleComplement = this.areRolesCompatible(
        other.preferences.preferred_role,
        request.preferences.preferred_role
      )
      const institutionMatch = other.preferences.institution_id === request.preferences.institution_id

      return difficultyMatch && roleComplement && institutionMatch
    })

    return compatiblePlayers.length > 0 ? compatiblePlayers[0] : null
  }

  areRolesCompatible(role1, role2) {
    // PT student needs patient, patient needs PT student
    return (role1 === 'pt_student' && role2 === 'patient') ||
           (role1 === 'patient' && role2 === 'pt_student')
  }

  setupRoomSubscription(roomId) {
    const subscription = supabase
      .channel(`room_${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_rooms_pt2024',
        filter: `id=eq.${roomId}`
      }, (payload) => {
        this.handleRoomUpdate(roomId, payload)
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'room_participants_pt2024',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        this.handleParticipantUpdate(roomId, payload)
      })
      .subscribe()

    return subscription
  }

  handleRoomUpdate(roomId, payload) {
    // Handle real-time room updates
    const room = this.gameRooms.get(roomId)
    if (room) {
      room.status = payload.new.status
      room.current_players = payload.new.current_players
      
      // Notify connected players
      this.notifyRoomPlayers(roomId, {
        type: 'room_update',
        data: payload.new
      })
    }
  }

  handleParticipantUpdate(roomId, payload) {
    // Handle player join/leave events
    this.notifyRoomPlayers(roomId, {
      type: 'participant_update',
      data: payload
    })
  }

  notifyRoomPlayers(roomId, message) {
    const connections = this.playerConnections.get(roomId) || []
    connections.forEach(connection => {
      if (connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify(message))
      }
    })
  }

  initializeMultiplayerGameState(room) {
    const participants = room.room_participants_pt2024
    
    return {
      room_id: room.id,
      players: participants.map(p => ({
        id: p.player_id,
        name: p.user_profiles_pt2024.full_name,
        role: p.user_profiles_pt2024.role,
        institution: p.user_profiles_pt2024.institution_id
      })),
      current_player_index: 0,
      turn_order: participants.map(p => p.player_id),
      game_phase: 'setup',
      shared_state: {
        discovered_clues: [],
        patient_state: {},
        collaborative_notes: []
      }
    }
  }

  generateRoomId() {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const multiplayerService = new MultiplayerService()