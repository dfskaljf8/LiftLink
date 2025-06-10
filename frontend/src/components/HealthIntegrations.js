import React, { useState, useEffect } from 'react';
import { AnimatedDumbbell, AnimatedStar, AnimatedCheckmark } from './AnimatedSVGs';

// Health Device Integration Component
const HealthIntegrations = ({ userProfile }) => {
  const [connectedDevices, setConnectedDevices] = useState({
    google_fit: false,
    apple_health: false,
    fitbit: false,
    garmin: false
  });
  const [showHealthKitNotice, setShowHealthKitNotice] = useState(true);
  
  // HealthKit Notice Component
  const HealthKitNotice = () => (
    <div style={{
      background: 'rgba(0, 122, 255, 0.1)',
      border: '1px solid #007AFF',
      borderRadius: '16px',
      padding: '20px',
      margin: '20px 0',
      display: showHealthKitNotice ? 'block' : 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '24px', marginRight: '12px' }}>🍎</span>
        <h3 style={{ margin: 0, color: '#007AFF', fontSize: '18px' }}>
          Apple HealthKit Integration
        </h3>
        <button 
          onClick={() => setShowHealthKitNotice(false)}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: '#007AFF',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ×
        </button>
      </div>
      <p style={{ 
        margin: 0, 
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        <strong>This app uses Apple HealthKit to sync your fitness data</strong> including steps, heart rate, calories, and workout information. Your health data is private, secure, and remains under your control. You can manage permissions in iOS Settings → Privacy & Security → Health.
      </p>
    </div>
  );
  const [healthData, setHealthData] = useState({
    steps: 0,
    heart_rate: 0,
    calories: 0,
    sleep_hours: 0,
    active_minutes: 0
  });
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Check connected devices on component mount
  useEffect(() => {
    fetchConnectedDevices();
    fetchHealthData();
  }, []);

  const fetchConnectedDevices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health/connected-devices`, {
        headers: {
          'Authorization': `Bearer ${userProfile?.token || 'demo_user'}`
        }
      });
      if (response.ok) {
        const devices = await response.json();
        setConnectedDevices(devices);
      }
    } catch (error) {
      console.error('Error fetching connected devices:', error);
    }
  };

  const fetchHealthData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health/data/today`, {
        headers: {
          'Authorization': `Bearer ${userProfile?.token || 'demo_user'}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
    }
  };

  const connectDevice = async (provider) => {
    setLoading(true);
    try {
      // Initiate OAuth flow for the selected provider
      const response = await fetch(`${API_BASE_URL}/api/health/auth/${provider}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userProfile?.token || 'demo_user'}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const authData = await response.json();
        
        // Special handling for different providers
        if (provider === 'google_fit') {
          // For Google Fit, open OAuth in new window for better UX
          const popup = window.open(
            authData.auth_url,
            'google_fit_auth',
            'width=500,height=600,scrollbars=yes,resizable=yes'
          );
          
          // Listen for OAuth completion (in a real app, you'd handle the callback)
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              // In a real implementation, check if auth was successful
              setConnectedDevices(prev => ({ ...prev, google_fit: true }));
              alert('Google Fit connected successfully! (Demo)');
            }
          }, 1000);
        } else if (provider === 'apple_health') {
          // Apple HealthKit requires native iOS app
          alert('Apple HealthKit integration requires the LiftLink mobile app. Coming soon!');
        } else {
          // For other providers, redirect to OAuth URL
          window.open(authData.auth_url, '_blank');
        }
      }
    } catch (error) {
      console.error(`Error connecting to ${provider}:`, error);
      alert(`Failed to connect to ${provider}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const disconnectDevice = async (provider) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health/disconnect/${provider}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userProfile?.token || 'demo_user'}`
        }
      });
      
      if (response.ok) {
        setConnectedDevices(prev => ({
          ...prev,
          [provider]: false
        }));
      }
    } catch (error) {
      console.error(`Error disconnecting ${provider}:`, error);
    }
  };

  const syncHealthData = async () => {
    setSyncStatus('syncing');
    try {
      const response = await fetch(`${API_BASE_URL}/api/health/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userProfile?.token || 'demo_user'}`
        }
      });
      
      if (response.ok) {
        setSyncStatus('success');
        await fetchHealthData();
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error syncing health data:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const devices = [
    {
      name: 'Google Fit',
      key: 'google_fit',
      icon: '📱',
      description: 'Connect your Android devices and Google Fit data',
      color: '#4285F4'
    },
    {
      name: 'Apple Health',
      key: 'apple_health',
      icon: '🍎',
      description: 'Sync your iPhone and Apple Watch health data',
      color: '#007AFF'
    },
    {
      name: 'Fitbit',
      key: 'fitbit',
      icon: '⌚',
      description: 'Connect your Fitbit devices and activity data',
      color: '#00B0B9'
    },
    {
      name: 'Garmin',
      key: 'garmin',
      icon: '🏃',
      description: 'Sync your Garmin watches and fitness data',
      color: '#007CC3'
    }
  ];

  return (
    <div className="mobile-scroll-container" style={{
      width: '100%',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '28px'
        }}>
          📊
        </div>
        
        <h2 style={{
          fontSize: '1.4em',
          fontWeight: '600',
          marginBottom: '8px',
          color: 'var(--text-primary)'
        }}>
          Health Integrations
        </h2>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95em',
          lineHeight: '1.4'
        }}>
          Connect your wearables and health apps for comprehensive fitness tracking
        </p>
      </div>

      {/* Today's Health Summary */}
      <div className="glass-card" style={{
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '1.1em',
            fontWeight: '600',
            margin: 0
          }}>
            Today's Summary
          </h3>
          
          <button
            onClick={syncHealthData}
            disabled={syncStatus === 'syncing'}
            style={{
              background: syncStatus === 'success' 
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.1))'
                : syncStatus === 'error'
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))'
                : 'linear-gradient(135deg, rgba(196, 214, 0, 0.2), rgba(178, 255, 102, 0.1))',
              border: `1px solid ${syncStatus === 'success' ? '#22C55E' : syncStatus === 'error' ? '#EF4444' : '#C4D600'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              color: syncStatus === 'success' ? '#22C55E' : syncStatus === 'error' ? '#EF4444' : '#C4D600',
              fontSize: '0.9em',
              cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
              touchAction: 'manipulation'
            }}
          >
            {syncStatus === 'syncing' ? '🔄 Syncing...' : 
             syncStatus === 'success' ? '✅ Synced' :
             syncStatus === 'error' ? '❌ Error' : '🔄 Sync Now'}
          </button>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '12px',
            background: 'rgba(196, 214, 0, 0.1)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '1.5em', marginBottom: '4px' }}>👣</div>
            <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#C4D600' }}>
              {healthData.steps.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>Steps</div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '1.5em', marginBottom: '4px' }}>❤️</div>
            <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#EF4444' }}>
              {healthData.heart_rate}
            </div>
            <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>BPM</div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '12px',
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '1.5em', marginBottom: '4px' }}>🔥</div>
            <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#F59E0B' }}>
              {healthData.calories}
            </div>
            <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>Calories</div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '12px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '1.5em', marginBottom: '4px' }}>😴</div>
            <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#6366F1' }}>
              {healthData.sleep_hours}h
            </div>
            <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>Sleep</div>
          </div>
        </div>
      </div>

      {/* Connected Devices */}
      <div className="glass-card" style={{
        padding: '20px',
        borderRadius: '12px'
      }}>
        <h3 style={{
          fontSize: '1.1em',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          Connected Devices
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {devices.map((device) => (
            <div key={device.key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: connectedDevices[device.key] 
                ? 'rgba(34, 197, 94, 0.1)' 
                : 'rgba(107, 114, 128, 0.1)',
              borderRadius: '8px',
              border: `1px solid ${connectedDevices[device.key] ? '#22C55E' : 'rgba(255, 255, 255, 0.1)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  fontSize: '24px',
                  width: '40px',
                  textAlign: 'center'
                }}>
                  {device.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: '1em',
                    fontWeight: '500',
                    marginBottom: '2px'
                  }}>
                    {device.name}
                  </div>
                  <div style={{
                    fontSize: '0.8em',
                    color: 'var(--text-secondary)'
                  }}>
                    {device.description}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => connectedDevices[device.key] 
                  ? disconnectDevice(device.key) 
                  : connectDevice(device.key)
                }
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.9em',
                  fontWeight: '500',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  background: connectedDevices[device.key]
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))'
                    : `linear-gradient(135deg, ${device.color}20, ${device.color}10)`,
                  color: connectedDevices[device.key] ? '#EF4444' : device.color,
                  border: `1px solid ${connectedDevices[device.key] ? '#EF4444' : device.color}`
                }}
              >
                {connectedDevices[device.key] ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Notice */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(196, 214, 0, 0.1)',
        borderRadius: '12px',
        fontSize: '0.9em',
        color: 'var(--text-secondary)',
        lineHeight: '1.5'
      }}>
        <p style={{ margin: 0 }}>
          🔒 <strong>Privacy First:</strong> Your health data is encrypted and only used to enhance your fitness experience. 
          You can disconnect any device at any time, and all associated data will be permanently deleted from our servers.
        </p>
      </div>
    </div>
  );
};

export default HealthIntegrations;