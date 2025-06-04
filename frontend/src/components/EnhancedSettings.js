import React, { useState, useContext, createContext } from 'react';
import { TactileButton } from '../DelightfulAnimations';
import { AnimatedCard } from '../DelightfulComponents';
import '../styles/ProfessionalDesign.css';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

const EnhancedSettings = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    workoutReminders: true,
    socialUpdates: false,
    promotions: false
  });

  const SettingSection = ({ title, children, icon }) => (
    <AnimatedCard className="glass-card" style={{ padding: '25px', marginBottom: '20px' }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        {title}
      </h3>
      {children}
    </AnimatedCard>
  );

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '500', marginBottom: '4px' }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {description}
          </div>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: '50px',
          height: '28px',
          borderRadius: '14px',
          border: 'none',
          background: checked ? 'var(--accent-primary)' : 'var(--text-muted)',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'white',
          position: 'absolute',
          top: '2px',
          left: checked ? '24px' : '2px',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  );

  return (
    <div className="settings-view">
      {/* Header */}
      <div style={{
        padding: '30px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '10px',
          color: 'white'
        }}>
          ⚙️ Settings
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: '16px'
        }}>
          Customize your LiftLink experience
        </p>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Theme Settings */}
        <SettingSection title="Appearance" icon="🎨">
          <ToggleSwitch
            checked={darkMode}
            onChange={setDarkMode}
            label="Dark Mode"
            description="Switch between light and dark themes"
          />
        </SettingSection>

        {/* Notification Settings */}
        <SettingSection title="Notifications" icon="🔔">
          <ToggleSwitch
            checked={notifications.push}
            onChange={(value) => setNotifications({...notifications, push: value})}
            label="Push Notifications"
            description="Receive notifications on your device"
          />
          <ToggleSwitch
            checked={notifications.email}
            onChange={(value) => setNotifications({...notifications, email: value})}
            label="Email Notifications"
            description="Get updates via email"
          />
        </SettingSection>

        {/* Account Actions */}
        <SettingSection title="Account" icon="👤">
          <div style={{ display: 'grid', gap: '15px' }}>
            <TactileButton variant="secondary" style={{ justifyContent: 'flex-start' }}>
              📧 Change Email
            </TactileButton>
            <TactileButton variant="secondary" style={{ justifyContent: 'flex-start' }}>
              🔑 Change Password
            </TactileButton>
          </div>
        </SettingSection>
      </div>

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }} />
    </div>
  );
};

export default EnhancedSettings;