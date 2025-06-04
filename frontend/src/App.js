import React, { useState } from 'react';
import './styles/ProfessionalDesign.css';
import ProfessionalHome from './components/ProfessionalHome';
import { ProfessionalNavigation, ProfessionalSidebar } from './components/ProfessionalNavigation';

// Main App Component - Modern Adonis-inspired Design with Error Boundary
const App = () => {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="professional-app">
      {/* Main Content Area */}
      <main style={{
        minHeight: '100vh',
        paddingBottom: '80px'
      }}>
        <ProfessionalHome 
          setCurrentView={setCurrentView} 
          userProfile={{ level: 5, lift_coins: 150, consecutive_days: 7 }}
          searchTrainers={() => {}}
        />
      </main>

      {/* Bottom Navigation */}
      <ProfessionalNavigation 
        currentView={currentView}
        setCurrentView={setCurrentView}
        userProfile={{ level: 5, lift_coins: 150, consecutive_days: 7 }}
        toggleSidebar={() => {}}
      />
    </div>
  );

export default App;