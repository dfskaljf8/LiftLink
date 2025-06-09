import React, { useState, useRef, useEffect } from 'react';
import { LiftLinkLogo, AnimatedDumbbell, AnimatedCoin, AnimatedFire } from './AnimatedSVGs';
import '../styles/iPadOptimized.css';

const iPadScreenshots = () => {
  const [screenshotMode, setScreenshotMode] = useState('home');
  const [mockUserData, setMockUserData] = useState({
    name: 'Demo User',
    level: 5,
    xp_points: 450,
    lift_coins: 150,
    consecutive_days: 7,
    role: 'trainee'
  });

  const screenshotModes = [
    'home',
    'onboarding', 
    'verification',
    'trainer-search',
    'health-integrations',
    'social-hub',
    'progress-analytics',
    'session-attendance',
    'trainer-crm'
  ];

  useEffect(() => {
    // Apply iPad-specific viewport settings
    document.body.classList.add('ipad-screenshot-mode');
    
    // Check URL parameters for specific screen
    const urlParams = new URLSearchParams(window.location.search);
    const requestedScreen = urlParams.get('screen');
    if (requestedScreen && screenshotModes.includes(requestedScreen)) {
      setScreenshotMode(requestedScreen);
    }
    
    return () => {
      document.body.classList.remove('ipad-screenshot-mode');
    };
  }, []);

  const renderScreenshotContent = () => {
    switch (screenshotMode) {
      case 'home':
        return <HomeScreenshot userData={mockUserData} />;
      case 'onboarding':
        return <OnboardingScreenshot />;
      case 'verification':
        return <VerificationScreenshot />;
      case 'trainer-search':
        return <TrainerSearchScreenshot />;
      case 'health-integrations':
        return <HealthIntegrationsScreenshot />;
      case 'social-hub':
        return <SocialHubScreenshot />;
      case 'progress-analytics':
        return <ProgressAnalyticsScreenshot />;
      case 'session-attendance':
        return <SessionAttendanceScreenshot />;
      case 'trainer-crm':
        return <TrainerCRMScreenshot />;
      default:
        return <HomeScreenshot userData={mockUserData} />;
    }
  };

  return (
    <div className="ipad-screenshot-container">
      {/* Screenshot Mode Selector - Hidden in screenshots */}
      <div className="screenshot-controls">
        <h3>iPad 13" Screenshots</h3>
        <div className="mode-selector">
          {screenshotModes.map(mode => (
            <button
              key={mode}
              onClick={() => setScreenshotMode(mode)}
              className={screenshotMode === mode ? 'active' : ''}
            >
              {mode.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>
        <div className="user-role-toggle">
          <label>
            <input
              type="checkbox"
              checked={mockUserData.role === 'trainer'}
              onChange={(e) => setMockUserData({
                ...mockUserData,
                role: e.target.checked ? 'trainer' : 'trainee'
              })}
            />
            Trainer Mode
          </label>
        </div>
      </div>

      {/* Main Screenshot Content */}
      <div className="ipad-screenshot-frame">
        {renderScreenshotContent()}
      </div>
    </div>
  );
};

// Home Screen Screenshot
const HomeScreenshot = ({ userData }) => (
  <div className="ipad-home-screen">
    {/* Header */}
    <div className="ipad-header">
      <div className="header-left">
        <LiftLinkLogo size={32} animate={true} />
        <span className="app-title">LiftLink {userData.role === 'trainer' ? 'Pro' : ''}</span>
      </div>
      <div className="header-right">
        <div className="coins-display">
          <AnimatedCoin size={20} />
          <span>{userData.lift_coins}</span>
        </div>
        <div className="level-badge">
          Lv. {userData.level}
        </div>
        <div className="user-avatar">
          {userData.name.charAt(0)}
        </div>
      </div>
    </div>

    {/* Hero Section */}
    <div className="ipad-hero">
      <div className="hero-content">
        <h1>Welcome back, {userData.name}!</h1>
        <p>Ready to crush your fitness goals today?</p>
        <div className="streak-display">
          <AnimatedFire size={24} />
          <span>{userData.consecutive_days} day streak</span>
        </div>
      </div>
      <div className="hero-image">
        <AnimatedDumbbell size={120} animate={true} />
      </div>
    </div>

    {/* Quick Actions Grid */}
    <div className="ipad-quick-actions">
      <div className="action-card">
        <div className="action-icon">🔍</div>
        <h3>Find Trainers</h3>
        <p>Discover certified trainers near you</p>
      </div>
      <div className="action-card">
        <div className="action-icon">📊</div>
        <h3>Track Progress</h3>
        <p>View your fitness analytics</p>
      </div>
      <div className="action-card">
        <div className="action-icon">🏆</div>
        <h3>Achievements</h3>
        <p>Unlock new badges and rewards</p>
      </div>
      <div className="action-card">
        <div className="action-icon">👥</div>
        <h3>Social Hub</h3>
        <p>Connect with fitness friends</p>
      </div>
    </div>

    {/* Progress Overview */}
    <div className="ipad-progress-section">
      <h2>Your Progress</h2>
      <div className="progress-cards">
        <div className="progress-card">
          <h4>XP Points</h4>
          <div className="progress-bar">
            <div className="progress-fill" style={{width: '75%'}}></div>
          </div>
          <span>{userData.xp_points} / 600</span>
        </div>
        <div className="progress-card">
          <h4>Weekly Goal</h4>
          <div className="progress-bar">
            <div className="progress-fill" style={{width: '60%'}}></div>
          </div>
          <span>3 / 5 sessions</span>
        </div>
      </div>
    </div>
  </div>
);

// Onboarding Screenshot
const OnboardingScreenshot = () => (
  <div className="ipad-onboarding-screen">
    <div className="onboarding-progress">
      <div className="progress-dots">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`dot ${i <= 3 ? 'active' : ''}`}></div>
        ))}
      </div>
    </div>
    
    <div className="onboarding-content">
      <div className="onboarding-icon">
        <AnimatedDumbbell size={80} animate={true} />
      </div>
      <h1>What are your fitness goals?</h1>
      <p>Select all that apply to personalize your experience</p>
      
      <div className="goals-grid">
        {[
          { icon: '💪', label: 'Build Muscle', selected: true },
          { icon: '🏃', label: 'Lose Weight', selected: true },
          { icon: '❤️', label: 'Improve Cardio', selected: false },
          { icon: '🤸', label: 'Flexibility', selected: false },
          { icon: '🏋️', label: 'Strength Training', selected: true },
          { icon: '⚖️', label: 'Maintain Weight', selected: false }
        ].map((goal, index) => (
          <div key={index} className={`goal-card ${goal.selected ? 'selected' : ''}`}>
            <div className="goal-icon">{goal.icon}</div>
            <span>{goal.label}</span>
          </div>
        ))}
      </div>
      
      <button className="continue-btn">
        Continue
        <span className="arrow">→</span>
      </button>
    </div>
  </div>
);

// Verification Screenshot
const VerificationScreenshot = () => (
  <div className="ipad-verification-screen">
    <div className="verification-header">
      <button className="back-btn">←</button>
      <h2>Age & ID Verification</h2>
      <div className="step-indicator">Step 2 of 3</div>
    </div>
    
    <div className="verification-content">
      <div className="verification-icon">
        <div className="id-card-icon">🆔</div>
      </div>
      
      <h1>Upload Government ID</h1>
      <p>We need to verify your identity to ensure a safe environment for all users.</p>
      
      <div className="upload-zone">
        <div className="upload-icon">📷</div>
        <p>Tap to upload your ID</p>
        <span>Driver's License, Passport, or National ID</span>
      </div>
      
      <div className="security-features">
        <div className="security-item">
          <span className="check">✓</span>
          <span>Bank-level encryption</span>
        </div>
        <div className="security-item">
          <span className="check">✓</span>
          <span>Automatic data deletion</span>
        </div>
        <div className="security-item">
          <span className="check">✓</span>
          <span>GDPR compliant</span>
        </div>
      </div>
    </div>
  </div>
);

// Trainer Search Screenshot
const TrainerSearchScreenshot = () => (
  <div className="ipad-trainer-search">
    <div className="search-header">
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Search trainers near you..." value="Strength training" readOnly />
        <button className="filter-btn">⚙️</button>
      </div>
    </div>
    
    <div className="filters-bar">
      <div className="filter-chip active">Strength Training</div>
      <div className="filter-chip">5 stars</div>
      <div className="filter-chip">&lt; 5 miles</div>
      <div className="filter-chip">Available today</div>
    </div>
    
    <div className="trainers-grid">
      {[
        {
          name: 'Sarah Johnson',
          specialty: 'Strength Training',
          rating: 4.9,
          reviews: 127,
          hourly: 85,
          distance: '2.3 miles',
          image: '👩‍💪',
          certified: true
        },
        {
          name: 'Mike Rodriguez',
          specialty: 'CrossFit & HIIT',
          rating: 4.8,
          reviews: 203,
          hourly: 95,
          distance: '1.8 miles',
          image: '👨‍💪',
          certified: true
        },
        {
          name: 'Alex Chen',
          specialty: 'Powerlifting',
          rating: 5.0,
          reviews: 89,
          hourly: 110,
          distance: '3.1 miles',
          image: '🏋️',
          certified: true
        }
      ].map((trainer, index) => (
        <div key={index} className="trainer-card">
          <div className="trainer-image">{trainer.image}</div>
          <div className="trainer-info">
            <div className="trainer-header">
              <h3>{trainer.name}</h3>
              {trainer.certified && <span className="verified-badge">✓</span>}
            </div>
            <p className="specialty">{trainer.specialty}</p>
            <div className="trainer-stats">
              <span className="rating">⭐ {trainer.rating} ({trainer.reviews})</span>
              <span className="distance">📍 {trainer.distance}</span>
            </div>
            <div className="trainer-price">
              <span className="hourly">${trainer.hourly}/hour</span>
              <button className="book-btn">Book Session</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Health Integrations Screenshot
const HealthIntegrationsScreenshot = () => (
  <div className="ipad-health-integrations">
    <div className="page-header">
      <h1>Health Device Integrations</h1>
      <p>Connect your devices for automatic fitness tracking</p>
    </div>
    
    <div className="integrations-grid">
      {[
        { name: 'Apple Health', icon: '🍎', connected: true, color: '#007AFF' },
        { name: 'Google Fit', icon: '📱', connected: false, color: '#4285F4' },
        { name: 'Fitbit', icon: '⌚', connected: true, color: '#00B0B9' },
        { name: 'Garmin Connect', icon: '🏃', connected: false, color: '#007CC3' }
      ].map((device, index) => (
        <div key={index} className="integration-card">
          <div className="device-icon" style={{color: device.color}}>
            {device.icon}
          </div>
          <h3>{device.name}</h3>
          <div className={`connection-status ${device.connected ? 'connected' : 'disconnected'}`}>
            {device.connected ? '✓ Connected' : 'Not Connected'}
          </div>
          <button className={`connect-btn ${device.connected ? 'disconnect' : 'connect'}`}>
            {device.connected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      ))}
    </div>
    
    <div className="health-summary">
      <h2>Today's Activity</h2>
      <div className="activity-cards">
        <div className="activity-card">
          <div className="activity-icon">👟</div>
          <div className="activity-data">
            <h4>8,542</h4>
            <p>Steps</p>
          </div>
        </div>
        <div className="activity-card">
          <div className="activity-icon">❤️</div>
          <div className="activity-data">
            <h4>72 BPM</h4>
            <p>Heart Rate</p>
          </div>
        </div>
        <div className="activity-card">
          <div className="activity-icon">🔥</div>
          <div className="activity-data">
            <h4>2,140</h4>
            <p>Calories</p>
          </div>
        </div>
        <div className="activity-card">
          <div className="activity-icon">😴</div>
          <div className="activity-data">
            <h4>7.5h</h4>
            <p>Sleep</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Social Hub Screenshot
const SocialHubScreenshot = () => (
  <div className="ipad-social-hub">
    <div className="social-header">
      <h1>Social Hub</h1>
      <button className="add-friends-btn">+ Add Friends</button>
    </div>
    
    <div className="social-content">
      <div className="friends-section">
        <h2>Friends Activity</h2>
        <div className="activity-feed">
          {[
            {
              name: 'Sarah Chen',
              action: 'completed a strength training session',
              time: '2 hours ago',
              avatar: '👩',
              icon: '💪'
            },
            {
              name: 'Mike Torres',
              action: 'reached a 30-day streak!',
              time: '4 hours ago',
              avatar: '👨',
              icon: '🔥'
            },
            {
              name: 'Emma Rodriguez',
              action: 'earned the "Consistency Champion" badge',
              time: '1 day ago',
              avatar: '👩‍🦱',
              icon: '🏆'
            }
          ].map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-avatar">{activity.avatar}</div>
              <div className="activity-content">
                <p><strong>{activity.name}</strong> {activity.action}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
              <div className="activity-icon">{activity.icon}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="leaderboard-section">
        <h2>Weekly Leaderboard</h2>
        <div className="leaderboard">
          {[
            { rank: 1, name: 'You', points: 1250, avatar: '👤' },
            { rank: 2, name: 'Alex Kim', points: 1180, avatar: '👨‍💼' },
            { rank: 3, name: 'Lisa Park', points: 1050, avatar: '👩‍💻' }
          ].map((user, index) => (
            <div key={index} className={`leaderboard-item ${user.name === 'You' ? 'current-user' : ''}`}>
              <span className="rank">#{user.rank}</span>
              <div className="user-info">
                <span className="avatar">{user.avatar}</span>
                <span className="name">{user.name}</span>
              </div>
              <span className="points">{user.points} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Progress Analytics Screenshot
const ProgressAnalyticsScreenshot = () => (
  <div className="ipad-progress-analytics">
    <div className="analytics-header">
      <h1>Progress Analytics</h1>
      <div className="time-filter">
        <button className="active">This Week</button>
        <button>This Month</button>
        <button>3 Months</button>
      </div>
    </div>
    
    <div className="analytics-overview">
      <div className="overview-cards">
        <div className="overview-card">
          <h3>Total Sessions</h3>
          <div className="metric">24</div>
          <span className="change positive">+15% from last week</span>
        </div>
        <div className="overview-card">
          <h3>Active Minutes</h3>
          <div className="metric">420</div>
          <span className="change positive">+8% from last week</span>
        </div>
        <div className="overview-card">
          <h3>Calories Burned</h3>
          <div className="metric">3,240</div>
          <span className="change positive">+12% from last week</span>
        </div>
        <div className="overview-card">
          <h3>Consistency Score</h3>
          <div className="metric">92%</div>
          <span className="change positive">+5% from last week</span>
        </div>
      </div>
    </div>
    
    <div className="charts-section">
      <div className="chart-container">
        <h3>Weekly Activity</h3>
        <div className="chart-placeholder">
          <div className="chart-bars">
            {[60, 80, 45, 90, 75, 95, 85].map((height, index) => (
              <div key={index} className="chart-bar" style={{height: `${height}%`}}></div>
            ))}
          </div>
          <div className="chart-labels">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
      </div>
      
      <div className="goals-progress">
        <h3>Goals Progress</h3>
        {[
          { goal: 'Lose 10 lbs', progress: 70, current: '7 lbs lost' },
          { goal: 'Build muscle mass', progress: 45, current: '4.5% increase' },
          { goal: 'Run 5K under 25min', progress: 85, current: '26:30 current time' }
        ].map((goal, index) => (
          <div key={index} className="goal-item">
            <div className="goal-header">
              <span className="goal-name">{goal.goal}</span>
              <span className="goal-current">{goal.current}</span>
            </div>
            <div className="goal-progress-bar">
              <div className="progress-fill" style={{width: `${goal.progress}%`}}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Session Attendance Screenshot
const SessionAttendanceScreenshot = () => (
  <div className="ipad-session-attendance">
    <div className="session-header">
      <h1>Session Check-in</h1>
      <div className="session-time">10:00 AM - 11:00 AM</div>
    </div>
    
    <div className="session-details">
      <div className="trainer-info">
        <div className="trainer-avatar">👨‍💪</div>
        <div className="trainer-details">
          <h2>Alex Rodriguez</h2>
          <p>Strength Training Session</p>
          <div className="session-location">
            <span className="location-icon">📍</span>
            <span>FitLife Gym - Studio A</span>
          </div>
        </div>
        <div className="session-status verified">
          <span className="status-icon">✓</span>
          <span>Verified Location</span>
        </div>
      </div>
    </div>
    
    <div className="checkin-section">
      <div className="gps-verification">
        <div className="gps-icon">🎯</div>
        <h3>GPS Verified</h3>
        <p>You're at the correct location!</p>
      </div>
      
      <div className="session-timer">
        <div className="timer-display">
          <span className="time">45:32</span>
          <span className="label">Session Duration</span>
        </div>
      </div>
      
      <div className="session-actions">
        <button className="checkout-btn">
          Check Out & Generate Certificate
        </button>
        <button className="emergency-btn">
          Emergency Contact
        </button>
      </div>
    </div>
    
    <div className="session-rewards">
      <h3>Session Rewards</h3>
      <div className="rewards-list">
        <div className="reward-item">
          <AnimatedCoin size={20} />
          <span>+25 LiftCoins</span>
        </div>
        <div className="reward-item">
          <span className="xp-icon">⚡</span>
          <span>+50 XP Points</span>
        </div>
        <div className="reward-item">
          <span className="badge-icon">🏆</span>
          <span>Progress Toward "Consistency Champion"</span>
        </div>
      </div>
    </div>
  </div>
);

// Trainer CRM Screenshot
const TrainerCRMScreenshot = () => (
  <div className="ipad-trainer-crm">
    <div className="crm-header">
      <h1>Trainer Dashboard</h1>
      <div className="date-range">
        <span>This Week: June 3-9, 2025</span>
      </div>
    </div>
    
    <div className="crm-overview">
      <div className="overview-metrics">
        <div className="metric-card">
          <h3>Total Clients</h3>
          <div className="metric-value">24</div>
          <span className="metric-change">+3 this week</span>
        </div>
        <div className="metric-card">
          <h3>Sessions This Week</h3>
          <div className="metric-value">18</div>
          <span className="metric-change">+2 from last week</span>
        </div>
        <div className="metric-card">
          <h3>Revenue</h3>
          <div className="metric-value">$1,520</div>
          <span className="metric-change">+12% from last week</span>
        </div>
        <div className="metric-card">
          <h3>Rating</h3>
          <div className="metric-value">4.9 ⭐</div>
          <span className="metric-change">Based on 127 reviews</span>
        </div>
      </div>
    </div>
    
    <div className="crm-content">
      <div className="upcoming-sessions">
        <h2>Today's Sessions</h2>
        <div className="sessions-list">
          {[
            { time: '10:00 AM', client: 'Sarah Johnson', type: 'Strength Training', status: 'confirmed' },
            { time: '2:00 PM', client: 'Mike Chen', type: 'HIIT Workout', status: 'confirmed' },
            { time: '4:00 PM', client: 'Emma Wilson', type: 'Personal Training', status: 'pending' }
          ].map((session, index) => (
            <div key={index} className="session-item">
              <div className="session-time">{session.time}</div>
              <div className="session-details">
                <h4>{session.client}</h4>
                <p>{session.type}</p>
              </div>
              <div className={`session-status ${session.status}`}>
                {session.status}
              </div>
              <button className="session-action">View Details</button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="client-insights">
        <h2>Client Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Most Popular Session</h4>
            <p>Strength Training (45%)</p>
          </div>
          <div className="insight-card">
            <h4>Average Session Length</h4>
            <p>62 minutes</p>
          </div>
          <div className="insight-card">
            <h4>Client Retention</h4>
            <p>92% (Excellent)</p>
          </div>
          <div className="insight-card">
            <h4>Peak Hours</h4>
            <p>6-8 PM weekdays</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default iPadScreenshots;