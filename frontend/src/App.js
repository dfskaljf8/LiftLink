import React, { useState } from 'react';
import './styles/ProfessionalDesign.css';
import ProfessionalHome from './components/ProfessionalHome';
import { ProfessionalNavigation, ProfessionalSidebar } from './components/ProfessionalNavigation';

// Main App Component - Clean and Simple
const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock user profile data
  const mockUserProfile = {
    name: 'Demo User',
    level: 5,
    lift_coins: 150,
    consecutive_days: 7,
    xp_points: 450,
    total_coins_earned: 300
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const searchTrainers = (query) => {
    console.log('Searching for:', query);
    setCurrentView('trainers');
  };

  return (
    <div className="professional-app">
      {/* Sidebar Navigation */}
      <ProfessionalSidebar 
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        setCurrentView={setCurrentView}
        userProfile={mockUserProfile}
        logout={() => console.log('Logout clicked')}
      />
      
      {/* Header with Hamburger Menu */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-lg)',
        zIndex: 999
      }}>
        <button
          onClick={toggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '24px',
            cursor: 'pointer',
            padding: 'var(--space-sm)'
          }}
        >
          ☰
        </button>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)'
        }}>
          <span style={{
            fontSize: '20px',
            fontWeight: '600'
          }}>
            💪 LiftLink
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)'
        }}>
          <div style={{
            background: 'var(--accent-primary)',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {mockUserProfile.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{
        marginTop: '60px',
        minHeight: 'calc(100vh - 60px)',
        paddingBottom: '80px'
      }}>
        {currentView === 'home' && (
          <ProfessionalHome 
            setCurrentView={setCurrentView} 
            userProfile={mockUserProfile}
            searchTrainers={searchTrainers}
          />
        )}
        
        {currentView !== 'home' && (
          <div style={{
            padding: 'var(--space-xl)',
            textAlign: 'center'
          }}>
            <div className="glass-card" style={{
              padding: 'var(--space-2xl)',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                marginBottom: 'var(--space-md)'
              }}>
                {currentView.charAt(0).toUpperCase() + currentView.slice(1)} View
              </h2>
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-lg)'
              }}>
                This section is coming soon with enhanced features!
              </p>
              <button 
                className="btn-primary"
                onClick={() => setCurrentView('home')}
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <ProfessionalNavigation 
        currentView={currentView}
        setCurrentView={setCurrentView}
        userProfile={mockUserProfile}
        toggleSidebar={toggleSidebar}
      />
    </div>
  );
};

export default App;