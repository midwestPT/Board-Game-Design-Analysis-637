import { create } from 'zustand'
import { authService } from '../services/authService'

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const user = await authService.getCurrentUser()
      set({ user, isAuthenticated: !!user, loading: false })

      // Set up auth state listener
      authService.onSessionChange((session) => {
        set({
          user: session?.user || null,
          session,
          isAuthenticated: !!session?.user,
          loading: false
        })
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ loading: false })
    }
  },

  signIn: async (email, password) => {
    try {
      const { user, session } = await authService.signIn(email, password)
      set({ user, session, isAuthenticated: true })
      return { user, session }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  },

  signUp: async (email, password, userData) => {
    try {
      const { user, session } = await authService.signUp(email, password, userData)
      set({ user, session, isAuthenticated: true })
      return { user, session }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  },

  signOut: async () => {
    try {
      await authService.signOut()
      set({ user: null, session: null, isAuthenticated: false })
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }
}))

export default useAuthStore