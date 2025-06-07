import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { TactileButton, FloatingMascot, Confetti } from './DelightfulAnimations';
import { AnimatedCard } from './DelightfulComponents';
import { FOMONotificationSystem, SocialFOMOFeed, HarvestSystem, MegaCelebration } from './AddictiveGameSystem';
import { AddictiveProgressBar, CompetitiveProgressBar, StreakFOMOBar } from './EnhancedProgressBars';
import { ActionFeedback, FeedbackWidget } from './components/FeedbackSystem';
import { AnimatedDumbbell, AnimatedCoin, AnimatedFire, LiftLinkLogo } from './components/AnimatedSVGs';
import './styles/ProfessionalDesign.css';
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
import VerificationFlow from './components/VerificationFlow';
import TrainerCRM from './components/TrainerCRM';
import SeamlessOnboarding from './components/SeamlessOnboarding';
import HealthIntegrations from './components/HealthIntegrations';
import FindFriends from './components/FindFriends';
import SessionAttendance from './components/SessionAttendance';
import EnhancedProgressAnalytics from './components/EnhancedProgressAnalytics';

// Main App Component - Clean and Simple
const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

const AppContent = () => {
  const [currentView, setCurrentView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState('');
  const [showHarvest, setShowHarvest] = useState(false);
  const [actionFeedback, setActionFeedback] = useState({ type: '', visible: false });
  const [userVerified, setUserVerified] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'trainee' or 'trainer'
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Mock user profile data with verification status
  const mockUserProfile = {
    name: 'Demo User',
    role: userRole,
    level: 5,
    xp_points: 450,
    lift_coins: 150,
    consecutive_days: 7,
    max_streak: 12,
    last_login: Date.now() - (3 * 60 * 60 * 1000), // 3 hours ago
    avatar: 'DU',
    verified: userVerified,
    id_verified: userVerified,
    verification_complete: userVerified,
    token: userRole === 'trainer' ? 'demo_trainer' : 'demo_user'
  };

  // Check if user needs verification on first load
  useEffect(() => {
    // Check if onboarding was completed
    const savedOnboarding = localStorage.getItem('liftlink_onboarding');
    if (savedOnboarding) {
      const onboardingData = JSON.parse(savedOnboarding);
      setOnboardingComplete(true);
      setShowOnboarding(false);
    } else {
      // New user - show onboarding first
      setShowOnboarding(true);
      return;
    }

    // Check verification status (only after onboarding)
    const savedVerification = localStorage.getItem('liftlink_verification');
    if (savedVerification) {
      const verificationData = JSON.parse(savedVerification);
      setUserVerified(verificationData.verified);
      setUserRole(verificationData.role);
      setIsFirstTime(false);
    }
  }, []);

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
        setActionFeedback({ type: 'streak_milestone', visible: true });
        break;
      case 'bonus_expiring':
        setActionFeedback({ type: 'coins_earned', visible: true });
        break;
      case 'social_activity':
        setCurrentView('social');
        break;
      case 'limited_offer':
        setCurrentView('achievements');
        setActionFeedback({ type: 'achievement_unlocked', visible: true });
        break;
      default:
        break;
    }
  };

  const handleSuccessAction = (type) => {
    setActionFeedback({ type, visible: true });
  };

  const handleFeedback = (feedback) => {
    console.log('User feedback:', feedback);
    // Here you would send feedback to your analytics/support system
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const searchTrainers = (query) => {
    console.log('Searching for:', query);
    setCurrentView('trainers');
  };

  // Handle onboarding completion
  const handleOnboardingComplete = (onboardingData) => {
    // Save onboarding data
    setOnboardingComplete(true);
    setShowOnboarding(false);
    
    // Update user profile with onboarding data
    mockUserProfile.name = onboardingData.name || 'Demo User';
    
    // Show verification flow after onboarding
    setIsFirstTime(true);
    setUserVerified(false);
    
    // Save to localStorage
    localStorage.setItem('liftlink_onboarding', JSON.stringify({
      completed: true,
      data: onboardingData,
      completedAt: new Date().toISOString()
    }));
    
    triggerCelebration('onboarding_complete');
  };
  
  // Show onboarding for completely new users
  if (showOnboarding && !onboardingComplete) {
    return (
      <div className="professional-app">
        <SeamlessOnboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // Handle verification completion
  const handleVerificationComplete = (verificationData) => {
    setUserVerified(true);
    setUserRole(verificationData.role);
    setIsFirstTime(false);
    
    // Save to localStorage
    localStorage.setItem('liftlink_verification', JSON.stringify({
      verified: true,
      role: verificationData.role,
      completedAt: new Date().toISOString()
    }));
    
    // Navigate to appropriate dashboard
    if (verificationData.role === 'trainer') {
      setCurrentView('trainer-crm');
    } else {
      setCurrentView('home');
    }
    
    triggerCelebration('verification_complete');
  };

  // Reset verification (for demo purposes)
  const resetVerification = () => {
    setUserVerified(false);
    setUserRole(null);
    setIsFirstTime(true);
    setOnboardingComplete(false);
    setShowOnboarding(true);
    localStorage.removeItem('liftlink_verification');
    localStorage.removeItem('liftlink_onboarding');
    setCurrentView('home');
  };

  // Show verification flow if user is not verified
  if (!userVerified && isFirstTime) {
    return (
      <div className="professional-app">
        <VerificationFlow 
          onComplete={handleVerificationComplete}
          userProfile={mockUserProfile}
        />
      </div>
    );
  }

  return (
    <div className="professional-app">
      {/* Action Feedback System */}
      <ActionFeedback 
        type={actionFeedback.type}
        visible={actionFeedback.visible}
        onComplete={() => setActionFeedback({ type: '', visible: false })}
      />

      {/* Feedback Widget */}
      <FeedbackWidget 
        context={currentView}
        onFeedback={handleFeedback}
      />

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
        currentView={currentView}
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
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <LiftLinkLogo size={24} animate={true} />
            LiftLink {userRole === 'trainer' ? 'Pro' : ''}
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)'
        }}>
          {/* Role Badge */}
          <div style={{
            background: userRole === 'trainer' ? '#C4D600' : 'rgba(196, 214, 0, 0.2)',
            color: userRole === 'trainer' ? 'black' : '#C4D600',
            padding: 'var(--space-xs) var(--space-sm)',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            {userRole === 'trainer' ? '🏆 Trainer' : '💪 Trainee'}
          </div>
          
          {/* User Avatar */}
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
          
          {/* Demo Reset Button */}
          <button
            onClick={resetVerification}
            style={{
              background: 'none',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'var(--text-secondary)',
              padding: 'var(--space-xs)',
              borderRadius: 'var(--border-radius)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            title="Reset Demo"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{
        marginTop: '60px',
        minHeight: 'calc(100vh - 60px)',
        paddingBottom: '80px'
      }}>
        {currentView === 'home' && (
          <div>
            <ProfessionalHome 
              setCurrentView={setCurrentView} 
              userProfile={mockUserProfile}
              searchTrainers={searchTrainers}
            />
            
            {/* Addictive Progress Bars */}
            <div style={{ padding: '20px' }}>
              <AddictiveProgressBar 
                currentValue={mockUserProfile.xp_points} 
                maxValue={500} 
                type="level" 
              />
              <StreakFOMOBar 
                currentStreak={mockUserProfile.consecutive_days}
                maxStreak={mockUserProfile.max_streak}
                missedToday={false}
              />
              <CompetitiveProgressBar 
                userProgress={mockUserProfile.level}
                friendsProgress={competitiveFriends}
                metric="Level"
              />
            </div>
            
            {/* Social FOMO Feed */}
            <div style={{ padding: '0 20px' }}>
              <SocialFOMOFeed userProfile={mockUserProfile} />
            </div>
          </div>
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
            userLocation={userLocation}
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
        
        {/* Trainer CRM Dashboard - Only for trainers */}
        {currentView === 'trainer-crm' && userRole === 'trainer' && (
          <TrainerCRM userProfile={mockUserProfile} />
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
              
              {/* Role-specific help */}
              {userRole === 'trainer' && (
                <div style={{
                  marginBottom: 'var(--space-lg)',
                  padding: 'var(--space-md)',
                  background: 'rgba(196, 214, 0, 0.1)',
                  borderRadius: 'var(--border-radius)',
                  textAlign: 'left'
                }}>
                  <h4 style={{ fontSize: '16px', marginBottom: 'var(--space-sm)' }}>
                    Trainer Resources:
                  </h4>
                  <ul style={{ 
                    fontSize: '14px', 
                    color: 'var(--text-secondary)',
                    listStyle: 'none',
                    padding: 0
                  }}>
                    <li>• CRM Dashboard Management</li>
                    <li>• Client Communication Tools</li>
                    <li>• Certification Requirements</li>
                    <li>• Revenue Analytics</li>
                  </ul>
                </div>
              )}
              
              <button 
                className="btn-primary"
                onClick={() => setCurrentView('home')}
              >
                Back to {userRole === 'trainer' ? 'Dashboard' : 'Home'}
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