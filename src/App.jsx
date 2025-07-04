import React, { useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import LandingPage from './pages/LandingPage'
import GameSetup from './pages/GameSetup'
import GameBoard from './pages/GameBoard'
import Dashboard from './pages/Dashboard'
import CaseLibrary from './pages/CaseLibrary'
import MultiplayerLobby from './components/MultiplayerLobby'
import FacultyDashboard from './components/FacultyDashboard'
import Navigation from './components/Navigation'
import useAuthStore from './store/authStore'
import './App.css'

function App() {
  const { initialize, user } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Navigation />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/setup" element={<GameSetup />} />
            <Route path="/game" element={<GameBoard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cases" element={<CaseLibrary />} />
            <Route path="/multiplayer" element={<MultiplayerLobby />} />
            {user?.user_metadata?.role === 'faculty' && (
              <Route path="/faculty" element={<FacultyDashboard />} />
            )}
          </Routes>
        </div>
      </Router>
    </DndProvider>
  )
}

export default App