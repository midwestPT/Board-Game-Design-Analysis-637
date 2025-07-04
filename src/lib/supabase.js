import { createClient } from '@supabase/supabase-js'

// Real Supabase credentials
const SUPABASE_URL = 'https://hcukacnputasitezgphl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdWthY25wdXRhc2l0ZXpncGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTIzMjYsImV4cCI6MjA2NzE2ODMyNn0.Klzx6VTJSJyZ25keu532Dij9NZZIuyH4N7gnNf9A2IM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
})

// Mock data for demo mode when not authenticated
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