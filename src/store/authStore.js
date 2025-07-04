import { create } from 'zustand'
import { supabase, mockUser, mockFacultyUser } from '../lib/supabase'
import { demoService } from '../services/demoService'

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  isDemoMode: !supabase,

  initialize: async () => {
    try {
      if (!supabase) {
        // Demo mode - no real authentication needed
        set({ 
          loading: false,
          isDemoMode: true
        })
        return
      }

      // Real Supabase authentication
      const { data: { user } } = await supabase.auth.getUser()
      set({
        user,
        isAuthenticated: !!user,
        loading: false
      })

      // Set up auth state listener
      supabase.auth.onAuthStateChange((event, session) => {
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
      if (!supabase) {
        // Demo mode
        const { user, session } = await demoService.signIn(email, password)
        set({ user, session, isAuthenticated: true })
        return { user, session }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: true
      })

      return data
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  },

  signUp: async (email, password, userData) => {
    try {
      if (!supabase) {
        // Demo mode
        const { user, session } = await demoService.signUp(email, password, userData)
        set({ user, session, isAuthenticated: true })
        return { user, session }
      }

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

      // In demo mode or if user created successfully
      if (data.user) {
        set({
          user: data.user,
          session: data.session,
          isAuthenticated: true
        })
      }

      return data
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  },

  signOut: async () => {
    try {
      if (!supabase) {
        // Demo mode
        await demoService.signOut()
        set({ user: null, session: null, isAuthenticated: false })
        return
      }

      const { error } = await supabase.auth.signOut()
      if (error) throw error

      set({ user: null, session: null, isAuthenticated: false })
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  },

  // Demo mode helpers
  setDemoUser: (userType = 'student') => {
    const user = userType === 'faculty' ? mockFacultyUser : mockUser
    set({
      user,
      session: { access_token: 'demo-token' },
      isAuthenticated: true
    })
  }
}))

export default useAuthStore