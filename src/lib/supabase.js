import { createClient } from '@supabase/supabase-js'

// These will be replaced with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'

// For demo purposes, we'll use mock data if Supabase isn't connected
const isDemoMode = SUPABASE_URL === 'YOUR_SUPABASE_URL'

export const supabase = isDemoMode ? null : createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
})

// Mock data for demo mode
export const mockUser = {
  id: 'demo-user-123',
  email: 'demo@physiotactics.com',
  user_metadata: {
    full_name: 'Demo Student',
    role: 'student',
    institution_id: 'demo-university'
  }
}

export const mockFacultyUser = {
  id: 'demo-faculty-123',
  email: 'faculty@physiotactics.com',
  user_metadata: {
    full_name: 'Dr. Demo Faculty',
    role: 'faculty',
    institution_id: 'demo-university'
  }
}

export default supabase