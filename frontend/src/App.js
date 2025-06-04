import React, { useState, useEffect } from 'react';
import { TactileButton, FloatingMascot, Confetti } from './DelightfulAnimations';
import { AnimatedCard } from './DelightfulComponents';
import { FOMONotificationSystem, SocialFOMOFeed, HarvestSystem, MegaCelebration } from './AddictiveGameSystem';
import { AddictiveProgressBar, CompetitiveProgressBar, StreakFOMOBar } from './EnhancedProgressBars';
import '../styles/ProfessionalDesign.css';
import ProfessionalHome from './components/ProfessionalHome';
import { ProfessionalNavigation, ProfessionalSidebar } from './components/ProfessionalNavigation';
import FitnessForestScreen from './components/FitnessForestScreen';
import ProgressAnalyticsScreen from './components/ProgressAnalyticsScreen';
import SocialHubScreen from './components/SocialHubScreen';
import AchievementsScreen from './components/AchievementsScreen';
import EnhancedTrainerSearch from './components/EnhancedTrainerSearch';
import BookingsView from './components/BookingsView';
import MessagesView from './components/MessagesView';
import ProfileView from './components/ProfileView';
import EnhancedSettings, { ThemeProvider } from './components/EnhancedSettings';

// Main App Component - Clean and Simple
const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

const AppContent = () => {
  const [currentView, setCurrentView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState('');
  const [showHarvest, setShowHarvest] = useState(false);

  // Mock user profile data
  const mockUserProfile = {
    name: 'Demo User',
    level: 5,
    xp_points: 450,
    lift_coins: 150,
    consecutive_days: 7,
    max_streak: 12,
    last_login: Date.now() - (3 * 60 * 60 * 1000), // 3 hours ago
    avatar: 'DU'
  };

  const competitiveFriends = [
    { name: 'Sarah Chen', value: 8 },
    { name: 'Marcus Torres', value: 6 },
    { name: 'Emma Rodriguez', value: 4 }
  ];

  const triggerCelebration = (type) => {
    setCelebrationType(type);
    setShowCelebration(true);
  };

  const handleHarvest = (rewards) => {
    // Process harvest rewards
    triggerCelebration('harvest');
  };

  const handleFOMOAction = (actionType) => {
    switch (actionType) {
      case 'streak_danger':
        setCurrentView('fitness-forest');
        break;
      case 'bonus_expiring':
        triggerCelebration('bonus');
        break;
      case 'social_activity':
        setCurrentView('social');
        break;
      case 'limited_offer':
        setCurrentView('achievements');
        break;
      default:
        break;
    }
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
      {/* FOMO Notification System */}
      <FOMONotificationSystem 
        userProfile={mockUserProfile} 
        onAction={handleFOMOAction}
      />

      {/* Harvest System */}
      <HarvestSystem 
        userProfile={mockUserProfile} 
        onHarvest={handleHarvest}
      />

      {/* Mega Celebration */}
      {showCelebration && (
        <MegaCelebration 
          trigger={celebrationType}
          onComplete={() => setShowCelebration(false)}
        />
      )}

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
        
        {currentView === 'fitness-forest' && (
          <FitnessForestScreen userProfile={mockUserProfile} />
        )}
        
        {currentView === 'analytics' && (
          <ProgressAnalyticsScreen userProfile={mockUserProfile} />
        )}
        
        {currentView === 'social' && (
          <SocialHubScreen userProfile={mockUserProfile} />
        )}
        
        {currentView === 'achievements' && (
          <AchievementsScreen userProfile={mockUserProfile} />
        )}
        
        {currentView === 'trainers' && (
          <EnhancedTrainerSearch 
            searchQuery="" 
            userProfile={mockUserProfile} 
          />
        )}
        
        {currentView === 'bookings' && (
          <BookingsView userProfile={mockUserProfile} />
        )}
        
        {currentView === 'messages' && (
          <MessagesView userProfile={mockUserProfile} />
        )}
        
        {currentView === 'profile' && (
          <ProfileView userProfile={mockUserProfile} setCurrentView={setCurrentView} />
        )}
        
        {currentView === 'settings' && (
          <EnhancedSettings />
        )}
        
        {/* Placeholder for help */}
        {currentView === 'help' && (
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
                Help Center
              </h2>
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-lg)'
              }}>
                Get assistance with your fitness journey!
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