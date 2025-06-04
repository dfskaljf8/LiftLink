import React, { useState, useContext, createContext } from 'react';
import { TactileButton } from './DelightfulAnimations';
import { AnimatedCard } from './DelightfulComponents';
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
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'friends',
    activitySharing: true,
    locationSharing: false
  });
  const [preferences, setPreferences] = useState({
    units: 'imperial',
    language: 'en',
    autoSync: true,
    workoutMusic: true
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

  const SelectOption = ({ value, onChange, options, label }) => (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        fontWeight: '500',
        marginBottom: '8px'
      }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          background: 'var(--glass-bg)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md)',
          color: 'var(--text-primary)',
          fontSize: '16px'
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="settings-view">
      {/* Header */}
      <div style={{
        padding: '30px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--accent-muted) 0%, var(--accent-secondary) 100%)',
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
          <ToggleSwitch
            checked={notifications.workoutReminders}
            onChange={(value) => setNotifications({...notifications, workoutReminders: value})}
            label="Workout Reminders"
            description="Reminders for scheduled sessions"
          />
          <ToggleSwitch
            checked={notifications.socialUpdates}
            onChange={(value) => setNotifications({...notifications, socialUpdates: value})}
            label="Social Updates"
            description="Friend activities and achievements"
          />
          <ToggleSwitch
            checked={notifications.promotions}
            onChange={(value) => setNotifications({...notifications, promotions: value})}
            label="Promotions & Offers"
            description="Special deals and new features"
          />
        </SettingSection>

        {/* Privacy Settings */}
        <SettingSection title="Privacy" icon="🔒">
          <SelectOption
            value={privacy.profileVisibility}
            onChange={(value) => setPrivacy({...privacy, profileVisibility: value})}
            label="Profile Visibility"
            options={[
              { value: 'public', label: 'Public' },
              { value: 'friends', label: 'Friends Only' },
              { value: 'private', label: 'Private' }
            ]}
          />
          <ToggleSwitch
            checked={privacy.activitySharing}
            onChange={(value) => setPrivacy({...privacy, activitySharing: value})}
            label="Share Activity"
            description="Allow friends to see your workouts"
          />
          <ToggleSwitch
            checked={privacy.locationSharing}
            onChange={(value) => setPrivacy({...privacy, locationSharing: value})}
            label="Location Sharing"
            description="Share location for trainer search"
          />
        </SettingSection>

        {/* App Preferences */}
        <SettingSection title="Preferences" icon="🏋️">
          <SelectOption
            value={preferences.units}
            onChange={(value) => setPreferences({...preferences, units: value})}
            label="Measurement Units"
            options={[
              { value: 'imperial', label: 'Imperial (lbs, ft)' },
              { value: 'metric', label: 'Metric (kg, cm)' }
            ]}
          />
          <SelectOption
            value={preferences.language}
            onChange={(value) => setPreferences({...preferences, language: value})}
            label="Language"
            options={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Español' },
              { value: 'fr', label: 'Français' }
            ]}
          />
          <ToggleSwitch
            checked={preferences.autoSync}
            onChange={(value) => setPreferences({...preferences, autoSync: value})}
            label="Auto Sync"
            description="Automatically sync with fitness devices"
          />
          <ToggleSwitch
            checked={preferences.workoutMusic}
            onChange={(value) => setPreferences({...preferences, workoutMusic: value})}
            label="Workout Music"
            description="Play music during workouts"
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
            <TactileButton variant="secondary" style={{ justifyContent: 'flex-start' }}>
              📱 Manage Devices
            </TactileButton>
            <TactileButton variant="secondary" style={{ justifyContent: 'flex-start' }}>
              💳 Payment Methods
            </TactileButton>
            <TactileButton variant="secondary" style={{ justifyContent: 'flex-start' }}>
              📊 Export Data
            </TactileButton>
          </div>
        </SettingSection>

        {/* Support */}
        <SettingSection title="Support" icon="❓">
          <div style={{ display: 'grid', gap: '15px' }}>
            <TactileButton variant="secondary" style={{ justifyContent: 'flex-start' }}>
              📖 Help Center
            </TactileButton>
            <TactileButton variant="secondary" style={{ justifyContent: 'flex-start' }}>
              💬 Contact Support
            </TactileButton>
            <TactileButton variant="secondary" style={{ justifyContent: 'flex-start' }}>
              📋 Terms of Service
            </TactileButton>
            <TactileButton variant="secondary" style={{ justifyContent: 'flex-start' }}>
              🔒 Privacy Policy
            </TactileButton>
            <TactileButton variant="secondary" style={{ justifyContent: 'flex-start' }}>
              ⭐ Rate App
            </TactileButton>
          </div>
        </SettingSection>

        {/* Danger Zone */}
        <SettingSection title="Danger Zone" icon="⚠️">
          <div style={{ display: 'grid', gap: '15px' }}>
            <TactileButton 
              variant="secondary" 
              style={{ 
                justifyContent: 'flex-start',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'var(--error)',
                color: 'var(--error)'
              }}
            >
              🗑️ Delete Account
            </TactileButton>
            <TactileButton variant="secondary" style={{ justifyContent: 'flex-start' }}>
              🚪 Sign Out
            </TactileButton>
          </div>
        </SettingSection>

        {/* App Info */}
        <AnimatedCard className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            <div style={{ marginBottom: '5px' }}>LiftLink v2.1.0</div>
            <div>© 2025 LiftLink. All rights reserved.</div>
          </div>
        </AnimatedCard>
      </div>

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }} />
    </div>
  );
};

export default EnhancedSettings;