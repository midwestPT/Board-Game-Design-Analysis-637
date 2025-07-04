import { supabase } from '../lib/supabase'

export class AnalyticsService {
  async trackUserProgress(userId, competencyData) {
    try {
      const { data, error } = await supabase
        .from('user_progress_pt2024')
        .upsert([{
          user_id: userId,
          competency_scores: competencyData.scores,
          performance_metrics: competencyData.metrics,
          last_updated: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Track user progress error:', error)
      throw error
    }
  }

  async getUserProgress(userId) {
    try {
      const { data, error } = await supabase
        .from('user_progress_pt2024')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get user progress error:', error)
      throw error
    }
  }

  async saveGamePerformance(gameId, userId, performanceData) {
    try {
      const { data, error } = await supabase
        .from('game_performance_pt2024')
        .insert([{
          game_id: gameId,
          user_id: userId,
          accuracy_score: performanceData.accuracy,
          efficiency_score: performanceData.efficiency,
          communication_score: performanceData.communication,
          diagnostic_score: performanceData.diagnostic,
          completion_time: performanceData.duration,
          cards_played: performanceData.cardsPlayed,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Save game performance error:', error)
      throw error
    }
  }

  async getUserGameHistory(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('game_performance_pt2024')
        .select(`
          *,
          games_pt2024 (
            case_id,
            difficulty,
            game_mode
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get user game history error:', error)
      throw error
    }
  }

  async getInstitutionAnalytics(institutionId) {
    try {
      const { data, error } = await supabase
        .from('institution_analytics_pt2024')
        .select('*')
        .eq('institution_id', institutionId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get institution analytics error:', error)
      throw error
    }
  }
}

export const analyticsService = new AnalyticsService()