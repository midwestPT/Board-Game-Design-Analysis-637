export class MultiplayerSynchronization {
  constructor() {
    this.connections = new Map()
    this.gameRooms = new Map()
    this.syncQueue = new Map()
    this.conflictResolver = new ConflictResolutionEngine()
  }

  // WebSocket foundation for real-time multiplayer
  initializeConnection(gameId, playerId, websocket) {
    const connectionId = `${gameId}_${playerId}`
    
    this.connections.set(connectionId, {
      gameId,
      playerId,
      websocket,
      lastSync: Date.now(),
      latency: 0,
      isConnected: true
    })

    // Set up WebSocket event handlers
    websocket.onmessage = (event) => {
      this.handleMessage(connectionId, JSON.parse(event.data))
    }

    websocket.onclose = () => {
      this.handleDisconnection(connectionId)
    }

    websocket.onerror = (error) => {
      this.handleConnectionError(connectionId, error)
    }

    // Send initial sync
    this.sendInitialSync(connectionId)
  }

  async synchronizeGameState(gameId, gameState, sourcePlayerId, action) {
    const syncPacket = {
      type: 'game_state_sync',
      gameId,
      sourcePlayer: sourcePlayerId,
      action,
      gameState: this.serializeGameState(gameState),
      timestamp: Date.now(),
      checksum: this.calculateChecksum(gameState)
    }

    // Add to sync queue for conflict resolution
    this.addToSyncQueue(gameId, syncPacket)

    // Broadcast to all players in the game except source
    await this.broadcastToGame(gameId, syncPacket, sourcePlayerId)

    return syncPacket
  }

  async broadcastToGame(gameId, packet, excludePlayerId = null) {
    const gameConnections = Array.from(this.connections.values())
      .filter(conn => conn.gameId === gameId && conn.isConnected)
      .filter(conn => excludePlayerId ? conn.playerId !== excludePlayerId : true)

    const sendPromises = gameConnections.map(async (connection) => {
      try {
        // Calculate latency-adjusted timing
        const adjustedPacket = {
          ...packet,
          serverTime: Date.now(),
          estimatedLatency: connection.latency
        }

        if (connection.websocket.readyState === WebSocket.OPEN) {
          connection.websocket.send(JSON.stringify(adjustedPacket))
          return { success: true, playerId: connection.playerId }
        } else {
          return { success: false, playerId: connection.playerId, error: 'Connection closed' }
        }
      } catch (error) {
        return { success: false, playerId: connection.playerId, error: error.message }
      }
    })

    const results = await Promise.all(sendPromises)
    return results
  }

  handleMessage(connectionId, message) {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    switch (message.type) {
      case 'ping':
        this.handlePing(connectionId, message)
        break
      case 'game_action':
        this.handleGameAction(connectionId, message)
        break
      case 'sync_request':
        this.handleSyncRequest(connectionId, message)
        break
      case 'conflict_resolution':
        this.handleConflictResolution(connectionId, message)
        break
    }
  }

  async handleGameAction(connectionId, message) {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    // Validate action
    const validation = await this.validateAction(connection.gameId, message.action, connection.playerId)
    if (!validation.isValid) {
      this.sendError(connectionId, 'Invalid action', validation.error)
      return
    }

    // Check for conflicts
    const conflictCheck = await this.checkForConflicts(connection.gameId, message.action)
    if (conflictCheck.hasConflict) {
      await this.resolveConflict(connection.gameId, conflictCheck.conflict)
      return
    }

    // Process action and sync
    try {
      const result = await this.processGameAction(connection.gameId, message.action, connection.playerId)
      if (result.success) {
        await this.synchronizeGameState(
          connection.gameId, 
          result.gameState, 
          connection.playerId, 
          message.action
        )
      }
    } catch (error) {
      this.sendError(connectionId, 'Action processing failed', error.message)
    }
  }

  addToSyncQueue(gameId, syncPacket) {
    if (!this.syncQueue.has(gameId)) {
      this.syncQueue.set(gameId, [])
    }

    const queue = this.syncQueue.get(gameId)
    queue.push(syncPacket)

    // Keep only last 10 sync packets for conflict resolution
    if (queue.length > 10) {
      queue.shift()
    }
  }

  async checkForConflicts(gameId, action) {
    const queue = this.syncQueue.get(gameId) || []
    const recentActions = queue.slice(-3) // Check last 3 actions

    for (const syncPacket of recentActions) {
      if (this.actionsConflict(action, syncPacket.action)) {
        return {
          hasConflict: true,
          conflict: {
            newAction: action,
            conflictingAction: syncPacket.action,
            timestamp: syncPacket.timestamp
          }
        }
      }
    }

    return { hasConflict: false }
  }

  actionsConflict(action1, action2) {
    // Check if actions affect the same game elements
    if (action1.type === 'play_card' && action2.type === 'play_card') {
      // Same player trying to play multiple cards simultaneously
      if (action1.playerId === action2.playerId) {
        return true
      }
      
      // Cards that target the same element
      if (action1.targetId && action1.targetId === action2.targetId) {
        return true
      }
    }

    return false
  }

  async resolveConflict(gameId, conflict) {
    const resolution = await this.conflictResolver.resolve(conflict)
    
    // Broadcast conflict resolution to all players
    const resolutionPacket = {
      type: 'conflict_resolution',
      gameId,
      resolution,
      timestamp: Date.now()
    }

    await this.broadcastToGame(gameId, resolutionPacket)
  }

  handlePing(connectionId, message) {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    // Calculate latency
    const latency = Date.now() - message.timestamp
    connection.latency = latency

    // Send pong
    const pongMessage = {
      type: 'pong',
      timestamp: Date.now(),
      latency: latency
    }

    if (connection.websocket.readyState === WebSocket.OPEN) {
      connection.websocket.send(JSON.stringify(pongMessage))
    }
  }

  serializeGameState(gameState) {
    // Create a clean, serializable version of game state
    return {
      id: gameState.id,
      turnNumber: gameState.turnNumber,
      currentPlayer: gameState.currentPlayer,
      ptResources: { ...gameState.ptResources },
      patientResources: { ...gameState.patientResources },
      discoveredClues: [...gameState.discoveredClues],
      activeEffects: { ...gameState.activeEffects },
      gameLog: gameState.gameLog.slice(-10), // Only last 10 entries
      playerHands: this.serializePlayerHands(gameState.playerHands)
    }
  }

  serializePlayerHands(playerHands) {
    // Only include hand for current player, hide others
    const serialized = {}
    Object.keys(playerHands).forEach(role => {
      serialized[role] = playerHands[role].map(card => ({
        id: card.id,
        name: card.name,
        type: card.type,
        // Include other non-sensitive card data
      }))
    })
    return serialized
  }

  calculateChecksum(gameState) {
    const stateString = JSON.stringify({
      turnNumber: gameState.turnNumber,
      currentPlayer: gameState.currentPlayer,
      ptResources: gameState.ptResources,
      patientResources: gameState.patientResources,
      clueCount: gameState.discoveredClues.length
    })

    let hash = 0
    for (let i = 0; i < stateString.length; i++) {
      const char = stateString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash
  }

  sendError(connectionId, type, message) {
    const connection = this.connections.get(connectionId)
    if (!connection || connection.websocket.readyState !== WebSocket.OPEN) return

    const errorPacket = {
      type: 'error',
      errorType: type,
      message: message,
      timestamp: Date.now()
    }

    connection.websocket.send(JSON.stringify(errorPacket))
  }

  handleDisconnection(connectionId) {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    connection.isConnected = false

    // Notify other players in the game
    const disconnectionPacket = {
      type: 'player_disconnected',
      gameId: connection.gameId,
      playerId: connection.playerId,
      timestamp: Date.now()
    }

    this.broadcastToGame(connection.gameId, disconnectionPacket, connection.playerId)
  }
}

// Conflict Resolution Engine
class ConflictResolutionEngine {
  async resolve(conflict) {
    const { newAction, conflictingAction } = conflict

    // Timestamp-based resolution (first action wins)
    if (conflictingAction.timestamp < newAction.timestamp) {
      return {
        resolution: 'first_action_wins',
        acceptedAction: conflictingAction,
        rejectedAction: newAction,
        reason: 'Earlier timestamp takes precedence'
      }
    }

    // If timestamps are very close, use player priority or other factors
    if (Math.abs(conflictingAction.timestamp - newAction.timestamp) < 100) {
      return await this.resolveByPriority(conflict)
    }

    return {
      resolution: 'latest_action_wins',
      acceptedAction: newAction,
      rejectedAction: conflictingAction,
      reason: 'Later timestamp takes precedence'
    }
  }

  async resolveByPriority(conflict) {
    // Resolve based on action priority or game rules
    const priorities = {
      'counter_card': 10,
      'play_card': 5,
      'end_turn': 1
    }

    const newPriority = priorities[conflict.newAction.type] || 0
    const conflictingPriority = priorities[conflict.conflictingAction.type] || 0

    if (conflictingPriority > newPriority) {
      return {
        resolution: 'priority_resolution',
        acceptedAction: conflict.conflictingAction,
        rejectedAction: conflict.newAction,
        reason: 'Higher priority action takes precedence'
      }
    }

    return {
      resolution: 'priority_resolution',
      acceptedAction: conflict.newAction,
      rejectedAction: conflict.conflictingAction,
      reason: 'Higher priority action takes precedence'
    }
  }
}

export const multiplayerSync = new MultiplayerSynchronization()