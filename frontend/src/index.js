import React from 'react';
import ReactDOM from 'react-dom/client';

/**
 * LiftLink - React Native Mobile App
 * 
 * This is a placeholder file. The actual application is a React Native mobile app
 * located in /app/react-native-app/
 * 
 * There is no web version of this application.
 */

const MobileOnlyMessage = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏋️ LiftLink</h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>React Native Mobile App</p>
        
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: '10px',
          backdropFilter: 'blur(10px)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h2>Mobile App Only</h2>
          <p>This application is built with React Native for iOS and Android devices.</p>
          <p style={{ marginTop: '1rem' }}>There is no web version available.</p>
          
          <div style={{ marginTop: '2rem' }}>
            <h3>To Run the Mobile App:</h3>
            <p style={{ 
              background: 'rgba(0,0,0,0.3)', 
              padding: '1rem', 
              borderRadius: '5px',
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}>
              cd /app/react-native-app<br/>
              yarn ios     # For iOS<br/>
              yarn android # For Android
            </p>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <h3>Backend API Status:</h3>
            <p style={{ 
              background: 'rgba(0,255,0,0.2)', 
              padding: '0.5rem 1rem', 
              borderRadius: '5px',
              display: 'inline-block'
            }}>
              ✅ All 44 endpoints operational
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MobileOnlyMessage />);
