import { supabase } from '../lib/supabase'

export class AuthService {
  constructor() {
    this.currentUser = null
    this.sessionListeners = []
  }

  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: userData.role || 'student',
            institution_id: userData.institution_id,
            full_name: userData.full_name
          }
        }
      })

      if (error) throw error

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user, userData)
      }

      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      this.currentUser = data.user
      this.notifySessionListeners(data.session)

      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      this.currentUser = null
      this.notifySessionListeners(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  async createUserProfile(user, userData) {
    try {
      const { error } = await supabase
        .from('user_profiles_pt2024')
        .insert([
          {
            user_id: user.id,
            email: user.email,
            full_name: userData.full_name,
            role: userData.role || 'student',
            institution_id: userData.institution_id,
            created_at: new Date().toISOString()
          }
        ])

      if (error) throw error
    } catch (error) {
      console.error('Profile creation error:', error)
      throw error
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      this.currentUser = user
      return user
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  onSessionChange(callback) {
    this.sessionListeners.push(callback)
    
    // Set up Supabase auth listener
    supabase.auth.onAuthStateChange((event, session) => {
      callback(session)
    })
  }

  notifySessionListeners(session) {
    this.sessionListeners.forEach(listener => listener(session))
  }
}

export const authService = new AuthService()