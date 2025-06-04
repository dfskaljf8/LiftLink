import React, { useState } from 'react';
import './styles/ProfessionalDesign.css';
import ProfessionalHome from './components/ProfessionalHome';
import { ProfessionalNavigation, ProfessionalSidebar } from './components/ProfessionalNavigation';

// Main App Component - Modern Adonis-inspired Design with Error Boundary
const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);

  // Error boundary function
  React.useEffect(() => {
    const handleError = (error) => {
      console.error('App Error:', error);
      setError(error.message);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red', fontFamily: 'Arial' }}>
        <h2>Error Detected:</h2>
        <p>{error}</p>
        <button onClick={() => {setError(null); window.location.reload();}}>
          Reload App
        </button>
      </div>
    );
  }

  try {
    return (
      <ThemeProvider>
        <AuthProvider>
          <AuthChecker>
            {({ user, userProfile, loading }) => {
              if (loading) {
                return (
                  <div className="mobile-app">
                    <div className="flex items-center justify-center h-screen">
                      <div className="text-center">
                        <div className="logo mb-4">
                          <div className="logo-icon">LL</div>
                          <span>LiftLink</span>
                        </div>
                        <div className="text-muted">Loading your fitness journey...</div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (!user) {
                return (
                  <div className="mobile-app">
                    <div className="flex items-center justify-center h-screen bg-background-primary">
                      <div className="w-full max-w-md p-6">
                        <div className="text-center mb-8">
                          <div className="logo mb-4">
                            <div className="logo-icon">LL</div>
                            <span>LiftLink</span>
                          </div>
                          <h1 className="text-2xl font-bold text-primary mb-2">Welcome to LiftLink</h1>
                          <p className="text-secondary">Your fitness journey starts here</p>
                        </div>
                        <MobileAuthForm isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)} />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="mobile-app">
                  <AppContent />
                </div>
              );
            }}
          </AuthChecker>
        </AuthProvider>
      </ThemeProvider>
    );
  } catch (err) {
    return (
      <div style={{ padding: '20px', color: 'red', fontFamily: 'Arial' }}>
        <h2>Render Error:</h2>
        <p>{err.message}</p>
        <button onClick={() => window.location.reload()}>
          Reload App
        </button>
      </div>
    );
  }
};

export default App;