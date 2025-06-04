import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import './App.css';
import './index.css';
import './MatrixNeo.css';
import './MobileTactical.css';
import './MarketplaceDesign.css';
import './ThemeSystem.css';
import './ModernDesign.css';
import './styles/ProfessionalDesign.css';
import ProfessionalHome from './components/ProfessionalHome';
import { ProfessionalNavigation, ProfessionalSidebar } from './components/ProfessionalNavigation';
import ProfessionalTrainerSearch from './components/ProfessionalTrainerSearch';
import FitnessForest from './components/FitnessForest';
import ProgressAnalytics from './components/ProgressAnalytics';
import SocialHub from './components/SocialHub';
import { 
  BookingManagement, 
  MessagesView, 
  AchievementsView, 
  Settings, 
  HelpSupport,
  TrainerDashboard,
  AdminDashboard 
} from './components/PlaceholderViews';

// API Configuration - Must be at top level
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Modern Top Navigation Component (Adonis-inspired)
const ModernTopNav = ({ user, onNotificationClick, onProfileClick }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="top-nav">
      <div className="top-nav-content">
        <div className="logo">
          <div className="logo-icon">LL</div>
          <span>LiftLink</span>
        </div>
        
        <div className="top-nav-actions">
          <button className="icon-button" onClick={onNotificationClick}>
            <span>🔔</span>
            <div className="notification-badge">3</div>
          </button>
          
          <button className="icon-button" onClick={toggleTheme}>
            <span>{theme === 'light' ? '🌙' : '☀️'}</span>
          </button>
          
          <button className="icon-button" onClick={onProfileClick}>
            <img 
              src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name}&background=6366F1&color=fff`}
              alt="Profile"
              style={{ width: '24px', height: '24px', borderRadius: '6px' }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

// Modern Bottom Navigation Component (Adonis-inspired)
const ModernBottomNav = ({ currentView, setCurrentView, user }) => {
  const navItems = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'search', icon: '🔍', label: 'Search' },
    { id: 'bookings', icon: '📅', label: 'Bookings' },
    { id: 'messages', icon: '💬', label: 'Messages' },
    { id: 'profile', icon: '👤', label: 'Profile' }
  ];
  
  return (
    <div className="bottom-nav">
      {navItems.map(item => (
        <div
          key={item.id}
          className={`nav-item ${currentView === item.id ? 'active' : ''}`}
          onClick={() => setCurrentView(item.id)}
        >
          <div className="nav-icon">{item.icon}</div>
          <div className="nav-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

// Modern Home Screen Component (Adonis-inspired)
const ModernHomeScreen = ({ setCurrentView, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredPros, setFeaturedPros] = useState([]);
  const [ongoingBookings, setOngoingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      // Load featured trainers
      const response = await api.get('/api/trainers/featured');
      setFeaturedPros(response.data.trainers || []);
      
      // Load ongoing bookings
      const bookingsResponse = await api.get('/api/bookings/ongoing');
      setOngoingBookings(bookingsResponse.data.bookings || []);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setCurrentView('search');
      // Pass search query to search component
    }
  };

  return (
    <div className="main-content">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'Warrior'}! 👋
        </h1>
        <p className="text-secondary">Ready to crush your fitness goals today?</p>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-icon">🔍</div>
        <input
          type="text"
          className="search-input"
          placeholder="Find a trainer, gym, or workout..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button 
          className="btn btn-primary btn-lg"
          onClick={() => setCurrentView('search')}
        >
          🎯 Find a Pro Now
        </button>
        <button 
          className="btn btn-secondary btn-lg"
          onClick={() => setCurrentView('bookings')}
        >
          📅 My Sessions
        </button>
      </div>

      {/* Ongoing Bookings */}
      {ongoingBookings.length > 0 && (
        <div className="carousel-container">
          <div className="carousel-header">
            <h2 className="carousel-title">Upcoming Sessions</h2>
            <a href="#" className="see-all-link" onClick={() => setCurrentView('bookings')}>
              See all
            </a>
          </div>
          <div className="carousel-scroll">
            {ongoingBookings.map(booking => (
              <div key={booking.id} className="carousel-item">
                <div className="card card-compact">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={booking.trainerImage || `https://ui-avatars.com/api/?name=${booking.trainerName}`}
                      alt={booking.trainerName}
                      className="pro-avatar"
                    />
                    <div>
                      <div className="font-semibold text-primary">{booking.trainerName}</div>
                      <div className="text-sm text-secondary">{booking.sessionType}</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted mb-2">
                    📅 {new Date(booking.sessionDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted">
                    ⏰ {booking.sessionTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Pros */}
      <div className="carousel-container">
        <div className="carousel-header">
          <h2 className="carousel-title">Featured Trainers</h2>
          <a href="#" className="see-all-link" onClick={() => setCurrentView('search')}>
            See all
          </a>
        </div>
        
        {loading ? (
          <div className="carousel-scroll">
            {[1, 2, 3].map(i => (
              <div key={i} className="carousel-item">
                <div className="card card-compact">
                  <div className="skeleton" style={{ height: '60px', marginBottom: '12px' }}></div>
                  <div className="skeleton" style={{ height: '20px', marginBottom: '8px' }}></div>
                  <div className="skeleton" style={{ height: '16px' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="carousel-scroll">
            {featuredPros.map(pro => (
              <div key={pro.trainer_id} className="carousel-item">
                <FeaturedProCard pro={pro} onClick={() => setCurrentView('pro-profile')} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-primary">{user?.level || 1}</div>
            <div className="text-sm text-muted">Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-success">{user?.consecutive_days || 0}</div>
            <div className="text-sm text-muted">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-accent">{user?.lift_coins || 0}</div>
            <div className="text-sm text-muted">LiftCoins</div>
          </div>
        </div>
      </div>

      {/* Today's Goal */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))' }}>
        <div className="text-center">
          <div className="text-4xl mb-3">💪</div>
          <h4 className="text-lg font-semibold text-primary mb-2">Today's Goal</h4>
          <p className="text-secondary mb-4">Complete 1 workout session</p>
          <button className="btn btn-primary">Start Workout</button>
        </div>
      </div>
    </div>
  );
};

// Featured Pro Card Component
const FeaturedProCard = ({ pro, onClick }) => {
  return (
    <div className="pro-card" onClick={onClick}>
      <div className="pro-header">
        <img
          src={pro.profileImage || `https://ui-avatars.com/api/?name=${pro.trainer_name}&background=6366F1&color=fff`}
          alt={pro.trainer_name}
          className="pro-avatar"
        />
        <div className="pro-info">
          <div className="pro-name">{pro.trainer_name}</div>
          <div className="pro-specialty">{pro.specialties?.[0] || 'Personal Trainer'}</div>
          <div className="pro-rating">
            <span className="rating-stars">⭐</span>
            <span>{pro.rating || 4.8}</span>
            <span>({pro.total_reviews || 127})</span>
          </div>
        </div>
        <div className="status-badge status-online">
          <span>🟢</span>
          Online
        </div>
      </div>
      
      <div className="pro-tags">
        {pro.specialties?.slice(0, 2).map(specialty => (
          <span key={specialty} className="tag">{specialty}</span>
        ))}
      </div>
      
      <div className="pro-footer">
        <div className="pro-price">
          ${pro.hourly_rate}
          <span className="price-period">/session</span>
        </div>
        <button className="btn btn-primary btn-sm">Book Now</button>
      </div>
    </div>
  );
};

// Gamification Engine
const GamificationEngine = {
  getRankName: (level) => {
    if (level >= 50) return 'ELITE';
    if (level >= 25) return 'ADVANCED';
    if (level >= 10) return 'INTERMEDIATE';
    if (level >= 5) return 'BEGINNER';
    return 'ROOKIE';
  }
};

// Theme Context
const ThemeContext = createContext();

// Theme Provider Component
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('liftlink-theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Apply theme to document body
    document.body.setAttribute('data-theme', theme);
    // Save theme preference
    localStorage.setItem('liftlink-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// LiftLink Logo Component
const LiftLinkLogo = ({ size = "md" }) => {
  const sizeClasses = {
    sm: { container: "w-8 h-8", text: "text-sm" },
    md: { container: "w-10 h-10", text: "text-base" },
    lg: { container: "w-12 h-12", text: "text-lg" },
    xl: { container: "w-16 h-16", text: "text-xl" }
  };
  
  const { container, text } = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div 
        className={`logo-icon ${container}`} 
        style={{ 
          background: 'linear-gradient(135deg, #6B8E5A, #4A90A4)',
          color: '#fff',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)'
        }}
      >
        LL
      </div>
      <span 
        className={`logo-text ${text}`}
        style={{
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #6B8E5A, #4A90A4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        LiftLink
      </span>
    </div>
  );
};

// Theme Toggle Button Component
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="theme-icon">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
    </button>
  );
};

// Professional Marketplace Audio System

// Modern Trainer Card Component
const ModernTrainerCard = ({ trainer, viewMode, onClick }) => {
  const isListView = viewMode === 'list';
  
  return (
    <div className={`pro-card ${isListView ? 'flex gap-4' : ''}`} onClick={onClick}>
      <div className={isListView ? 'flex-shrink-0' : ''}>
        <img
          src={trainer.profileImage || `https://ui-avatars.com/api/?name=${trainer.trainer_name}&background=6366F1&color=fff`}
          alt={trainer.trainer_name}
          className="pro-avatar"
        />
      </div>
      
      <div className={`flex-1 ${isListView ? '' : 'mt-3'}`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="pro-name">{trainer.trainer_name}</div>
            <div className="pro-specialty">{trainer.specialties?.[0] || 'Personal Trainer'}</div>
          </div>
          <div className="status-badge status-online">
            <span>🟢</span>
            Online
          </div>
        </div>
        
        <div className="pro-rating mb-3">
          <span className="rating-stars">⭐</span>
          <span>{trainer.rating || 4.8}</span>
          <span>({trainer.total_reviews || 127} reviews)</span>
        </div>
        
        <div className="pro-tags mb-3">
          {trainer.specialties?.slice(0, 3).map(specialty => (
            <span key={specialty} className="tag">{specialty}</span>
          ))}
        </div>
        
        <div className="pro-footer">
          <div className="pro-price">
            ${trainer.hourly_rate}
            <span className="price-period">/session</span>
          </div>
          <button className="btn btn-primary btn-sm">Book Now</button>
        </div>
      </div>
    </div>
  );
};

// Modern Pro Profile Screen Component (Adonis-inspired)
const ModernProProfileScreen = ({ trainerId, setCurrentView }) => {
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    if (trainerId) {
      loadTrainerProfile();
    }
  }, [trainerId]);

  const loadTrainerProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/trainers/${trainerId}`);
      setTrainer(response.data);
    } catch (error) {
      console.error('Error loading trainer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="skeleton" style={{ height: '200px', marginBottom: '20px' }}></div>
        <div className="skeleton" style={{ height: '40px', marginBottom: '10px' }}></div>
        <div className="skeleton" style={{ height: '20px' }}></div>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="main-content">
        <div className="card text-center py-12">
          <h3>Trainer not found</h3>
          <button className="btn btn-primary mt-4" onClick={() => setCurrentView('search')}>
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Back Button */}
      <button 
        className="btn btn-secondary mb-4"
        onClick={() => setCurrentView('search')}
      >
        ← Back to Search
      </button>

      {/* Profile Header */}
      <div className="card mb-6">
        <div className="flex items-start gap-4 mb-4">
          <img
            src={trainer.profileImage || `https://ui-avatars.com/api/?name=${trainer.trainer_name}&background=6366F1&color=fff`}
            alt={trainer.trainer_name}
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '16px', 
              objectFit: 'cover' 
            }}
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary mb-1">{trainer.trainer_name}</h1>
            <div className="text-secondary mb-2">{trainer.specialties?.[0] || 'Personal Trainer'}</div>
            <div className="flex items-center gap-4 mb-3">
              <div className="pro-rating">
                <span className="rating-stars">⭐</span>
                <span className="font-semibold">{trainer.rating || 4.8}</span>
                <span className="text-muted">({trainer.total_reviews || 127})</span>
              </div>
              <div className="status-badge status-online">
                <span>🟢</span>
                Online
              </div>
            </div>
            <div className="text-2xl font-bold text-brand-primary">
              ${trainer.hourly_rate}
              <span className="text-base font-normal text-muted">/session</span>
            </div>
          </div>
        </div>
        
        <button className="btn btn-primary btn-lg w-full">
          📅 Book Session - ${trainer.hourly_rate}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 border-b border-neutral-200">
        {['about', 'reviews', 'schedule'].map(tab => (
          <button
            key={tab}
            className={`flex-1 py-3 text-center font-medium capitalize ${
              activeTab === tab 
                ? 'text-brand-primary border-b-2 border-brand-primary' 
                : 'text-muted'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">About</h3>
            <p className="text-secondary mb-4">
              {trainer.bio || "Experienced personal trainer dedicated to helping clients achieve their fitness goals through personalized training programs and nutritional guidance."}
            </p>
            
            <h4 className="font-semibold mb-3">Specialties</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {trainer.specialties?.map(specialty => (
                <span key={specialty} className="tag">{specialty}</span>
              ))}
            </div>
            
            <h4 className="font-semibold mb-3">Experience</h4>
            <p className="text-secondary">{trainer.experience_years || 5}+ years of experience</p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Certifications</h3>
            <div className="space-y-2">
              {trainer.certifications?.map(cert => (
                <div key={cert.id} className="flex items-center gap-3">
                  <span>✅</span>
                  <span>{cert.name}</span>
                </div>
              )) || (
                <div className="flex items-center gap-3">
                  <span>✅</span>
                  <span>Certified Personal Trainer</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card">
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={`https://ui-avatars.com/api/?name=User${i}&background=random`}
                  alt="User"
                  style={{ width: '40px', height: '40px', borderRadius: '8px' }}
                />
                <div className="flex-1">
                  <div className="font-semibold">User {i}</div>
                  <div className="text-sm text-muted">2 weeks ago</div>
                </div>
                <div className="pro-rating">
                  <span className="rating-stars">⭐</span>
                  <span>5.0</span>
                </div>
              </div>
              <p className="text-secondary">
                Amazing trainer! Really helped me achieve my fitness goals. 
                Highly recommend for anyone looking to get in shape.
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Available Times</h3>
          <div className="text-center py-8 text-muted">
            📅 Schedule integration coming soon
          </div>
        </div>
      )}
    </div>
  );
};

// Professional Marketplace Audio System
const MarketplaceAudio = {
  audioContext: null,
  
  init() {
    if (!this.audioContext && (window.AudioContext || window.webkitAudioContext)) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  
  playSound: (type, volume = 0.1) => {
    try {
      MarketplaceAudio.init();
      if (!MarketplaceAudio.audioContext) return;
      
      const sounds = {
        tap: { freq: 800, duration: 0.1 },
        success: { freq: 1200, duration: 0.15 },
        match: { freq: 880, duration: 0.3 },
        booking: { freq: 1000, duration: 0.2 },
        message: { freq: 660, duration: 0.15 },
        error: { freq: 300, duration: 0.3 },
        click: { freq: 850, duration: 0.12 },
        hover: { freq: 600, duration: 0.08 }
      };
      
      const sound = sounds[type];
      if (sound) {
        const oscillator = MarketplaceAudio.audioContext.createOscillator();
        const gainNode = MarketplaceAudio.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(MarketplaceAudio.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(sound.freq, MarketplaceAudio.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume, MarketplaceAudio.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, MarketplaceAudio.audioContext.currentTime + sound.duration);
        
        oscillator.start(MarketplaceAudio.audioContext.currentTime);
        oscillator.stop(MarketplaceAudio.audioContext.currentTime + sound.duration);
      }
    } catch (e) {
      console.log('Audio not supported:', e);
    }
  }
};

// Mobile Tactical Audio System (Wrapper for MarketplaceAudio)
const MobileTacticalAudio = {
  playSound: (type, volume = 0.1) => {
    MarketplaceAudio.playSound(type, volume);
  },
  
  init: () => {
    MarketplaceAudio.init();
  }
};

// Professional Haptic Feedback
const MarketplaceHaptics = {
  light: () => {
    if (navigator.vibrate) navigator.vibrate(10);
  },
  medium: () => {
    if (navigator.vibrate) navigator.vibrate(25);
  },
  heavy: () => {
    if (navigator.vibrate) navigator.vibrate(50);
  },
  success: () => {
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
  },
  error: () => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  },
  match: () => {
    if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
  }
};

// Mobile Haptics System (Wrapper for MarketplaceHaptics)
const MobileHaptics = {
  light: () => MarketplaceHaptics.light(),
  medium: () => MarketplaceHaptics.medium(),
  heavy: () => MarketplaceHaptics.heavy(),
  success: () => MarketplaceHaptics.success(),
  error: () => MarketplaceHaptics.error(),
  match: () => MarketplaceHaptics.match()
};

// Enhanced Auth Context with Marketplace Features
const AuthContext = createContext();

// Google Maps Components
const MapComponent = ({ center, zoom, trainers, onTrainerSelect, userLocation }) => {
  const ref = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        styles: [
          {
            "featureType": "all",
            "elementType": "all",
            "stylers": [
              { "invert_lightness": true },
              { "saturation": -100 },
              { "lightness": 33 },
              { "gamma": 0.5 },
              { "hue": "#00ff88" }
            ]
          }
        ]
      });
      setMap(newMap);
    }
  }, [ref, map, center, zoom]);

  useEffect(() => {
    if (map) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      const newMarkers = [];

      // Add user location marker
      if (userLocation) {
        const userMarker = new window.google.maps.Marker({
          position: { lat: userLocation.lat, lng: userLocation.lng },
          map,
          title: "Your Location",
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="15" fill="#00ff88" stroke="#000" stroke-width="2"/>
                <circle cx="20" cy="20" r="5" fill="#000"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20)
          }
        });
        newMarkers.push(userMarker);
      }

      // Add trainer markers
      trainers.forEach((trainer, index) => {
        if (trainer.location && trainer.location.coordinates) {
          const [lng, lat] = trainer.location.coordinates;
          const marker = new window.google.maps.Marker({
            position: { lat, lng },
            map,
            title: trainer.trainer_name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 0C11.2 0 4 7.2 4 16c0 12 16 24 16 24s16-12 16-24c0-8.8-7.2-16-16-16z" fill="#ff6b6b"/>
                  <circle cx="20" cy="16" r="8" fill="#fff"/>
                  <text x="20" y="21" text-anchor="middle" font-size="12" fill="#ff6b6b" font-weight="bold">💪</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 40)
            }
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; max-width: 250px; color: #333;">
                <h3 style="margin: 0 0 10px 0; color: #ff6b6b;">${trainer.trainer_name}</h3>
                <p style="margin: 5px 0;"><strong>Rate:</strong> $${trainer.hourly_rate}/hour</p>
                <p style="margin: 5px 0;"><strong>Gym:</strong> ${trainer.gym_name || 'Multiple Locations'}</p>
                <p style="margin: 5px 0;"><strong>Specialties:</strong> ${(trainer.specialties || []).join(', ')}</p>
                ${trainer.distance_km ? `<p style="margin: 5px 0;"><strong>Distance:</strong> ${trainer.distance_km} km away</p>` : ''}
                <button onclick="window.selectTrainer('${trainer.trainer_id}')" 
                        style="background: #ff6b6b; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 10px; cursor: pointer;">
                  View Details
                </button>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          newMarkers.push(marker);
        }
      });

      setMarkers(newMarkers);

      // Global function for trainer selection from info window
      window.selectTrainer = (trainerId) => {
        const trainer = trainers.find(t => t.trainer_id === trainerId);
        if (trainer && onTrainerSelect) {
          onTrainerSelect(trainer);
        }
      };
    }
  }, [map, trainers, userLocation, onTrainerSelect]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

const TrainerMap = ({ trainers, center, userLocation, onTrainerSelect }) => {
  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className="map-loading">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <h3>Loading Map...</h3>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className="map-error">
            <div className="error-icon">🗺️</div>
            <h3>Map Failed to Load</h3>
            <p>Please check your internet connection and try again</p>
          </div>
        );
      case Status.SUCCESS:
        return (
          <MapComponent
            center={center}
            zoom={13}
            trainers={trainers}
            onTrainerSelect={onTrainerSelect}
            userLocation={userLocation}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Wrapper apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} render={render}>
      <MapComponent
        center={center}
        zoom={13}
        trainers={trainers}
        onTrainerSelect={onTrainerSelect}
        userLocation={userLocation}
      />
    </Wrapper>
  );
};



// LiftLink Marketplace - Instant Matching System
const InstantMatch = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [matchPreferences, setMatchPreferences] = useState({
    goal: '',
    location: '',
    sessionType: 'in-person',
    budget: '',
    availability: 'today'
  });
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const goals = [
    { id: 'weight-loss', label: 'Lose Weight', icon: '🎯', description: 'Get leaner and stronger' },
    { id: 'muscle-gain', label: 'Build Muscle', icon: '💪', description: 'Gain size and strength' },
    { id: 'fitness', label: 'Get Fit', icon: '⚡', description: 'Improve overall fitness' },
    { id: 'sport', label: 'Sport Training', icon: '🏆', description: 'Train for your sport' },
    { id: 'rehab', label: 'Rehabilitation', icon: '🩺', description: 'Recover from injury' },
    { id: 'wellness', label: 'Wellness', icon: '🧘', description: 'Mind and body balance' }
  ];

  const sessionTypes = [
    { id: 'in-person', label: 'In-Person', icon: '🏃', description: 'Meet at gym or location' },
    { id: 'virtual', label: 'Virtual', icon: '💻', description: 'Online video sessions' },
    { id: 'both', label: 'Both', icon: '🔄', description: 'Flexible options' }
  ];

  const availabilityOptions = [
    { id: 'today', label: 'Today', urgency: 'high' },
    { id: 'this-week', label: 'This Week', urgency: 'medium' },
    { id: 'flexible', label: 'Flexible', urgency: 'low' }
  ];

  const handleInstantMatch = async () => {
    setIsMatching(true);
    MarketplaceAudio.playSound('match');
    MarketplaceHaptics.match();

    // Simulate AI matching process
    setTimeout(() => {
      const matches = [
        {
          id: 'trainer_1',
          name: 'Sarah Chen',
          avatar: 'SC',
          specialty: 'Weight Loss Specialist',
          rating: 4.9,
          reviews: 127,
          rate: 75,
          availability: 'Available now',
          distance: '1.2 miles',
          verified: true,
          experience: '8 years',
          successRate: 95,
          nextSlot: '2:00 PM today',
          tags: ['NASM Certified', 'Nutrition Expert'],
          matchScore: 98
        },
        {
          id: 'trainer_2', 
          name: 'Marcus Torres',
          avatar: 'MT',
          specialty: 'Strength & Conditioning',
          rating: 4.8,
          reviews: 89,
          rate: 85,
          availability: 'Available today',
          distance: '0.8 miles',
          verified: true,
          experience: '6 years',
          successRate: 92,
          nextSlot: '4:00 PM today',
          tags: ['CSCS Certified', 'Athletic Performance'],
          matchScore: 94
        },
        {
          id: 'trainer_3',
          name: 'Jordan Kim',
          avatar: 'JK', 
          specialty: 'Functional Fitness',
          rating: 4.9,
          reviews: 156,
          rate: 70,
          availability: 'Available tomorrow',
          distance: '2.1 miles',
          verified: true,
          experience: '5 years',
          successRate: 97,
          nextSlot: '10:00 AM tomorrow',
          tags: ['CrossFit L2', 'Movement Expert'],
          matchScore: 90
        }
      ];
      
      setPotentialMatches(matches);
      setIsMatching(false);
      setShowResults(true);
    }, 2000);
  };

  const handleBookTrainer = (trainer) => {
    MarketplaceAudio.playSound('booking');
    MarketplaceHaptics.success();
    alert(`Booking session with ${trainer.name}! 🎉`);
  };

  if (showResults) {
    return (
      <div className="instant-match-results fade-in">
        <div className="results-header">
          <button 
            className="btn btn-ghost"
            onClick={() => {
              setShowResults(false);
              setPotentialMatches([]);
              MarketplaceAudio.playSound('tap');
            }}
          >
            ← Back to Search
          </button>
          <h2>Perfect Matches Found! 🎯</h2>
          <p>These trainers are available and match your goals</p>
        </div>

        <div className="match-results">
          {potentialMatches.map((trainer, index) => (
            <div key={trainer.id} className="trainer-match-card card scale-in" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="card-body">
                <div className="trainer-match-header">
                  <div className="trainer-basic">
                    <div className="avatar avatar-lg">{trainer.avatar}</div>
                    <div className="trainer-info">
                      <h3>{trainer.name}</h3>
                      <p>{trainer.specialty}</p>
                      <div className="trainer-credentials">
                        {trainer.verified && <span className="badge badge-success">✓ Verified</span>}
                        <span className="badge badge-primary">{trainer.experience}</span>
                      </div>
                    </div>
                  </div>
                  <div className="match-score">
                    <div className="score-circle">
                      <span>{trainer.matchScore}%</span>
                    </div>
                    <p>Match</p>
                  </div>
                </div>

                <div className="trainer-stats">
                  <div className="stat">
                    <div className="rating">
                      <span className="rating-star">★</span>
                      <span>{trainer.rating}</span>
                    </div>
                    <p>{trainer.reviews} reviews</p>
                  </div>
                  <div className="stat">
                    <strong>${trainer.rate}</strong>
                    <p>per session</p>
                  </div>
                  <div className="stat">
                    <strong>{trainer.distance}</strong>
                    <p>away</p>
                  </div>
                </div>

                <div className="trainer-availability">
                  <div className="availability-status">
                    <span className="status-dot status-online"></span>
                    <span>{trainer.availability}</span>
                  </div>
                  <p>Next slot: <strong>{trainer.nextSlot}</strong></p>
                </div>

                <div className="trainer-tags">
                  {trainer.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="tag">{tag}</span>
                  ))}
                </div>

                <div className="trainer-actions">
                  <button className="btn btn-secondary">
                    💬 Message
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleBookTrainer(trainer)}
                  >
                    🚀 Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="match-footer">
          <p>Not seeing what you want? <button className="btn btn-ghost">Adjust preferences</button></p>
        </div>
      </div>
    );
  }

  return (
    <div className="instant-match">
      <div className="match-hero">
        <h1>Find Your Perfect Trainer</h1>
        <p>Answer a few quick questions and we'll match you with the ideal fitness pro in seconds</p>
      </div>

      <div className="match-form">
        {/* Goal Selection */}
        <div className="form-section">
          <h3>What's your main goal? 🎯</h3>
          <div className="goal-grid">
            {goals.map((goal) => (
              <button
                key={goal.id}
                className={`goal-card ${matchPreferences.goal === goal.id ? 'selected' : ''}`}
                onClick={() => {
                  setMatchPreferences({...matchPreferences, goal: goal.id});
                  MarketplaceAudio.playSound('tap');
                  MarketplaceHaptics.light();
                }}
              >
                <div className="goal-icon">{goal.icon}</div>
                <h4>{goal.label}</h4>
                <p>{goal.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Session Type */}
        <div className="form-section">
          <h3>How would you like to train? 💪</h3>
          <div className="session-type-grid">
            {sessionTypes.map((type) => (
              <button
                key={type.id}
                className={`session-type-card ${matchPreferences.sessionType === type.id ? 'selected' : ''}`}
                onClick={() => {
                  setMatchPreferences({...matchPreferences, sessionType: type.id});
                  MarketplaceAudio.playSound('tap');
                  MarketplaceHaptics.light();
                }}
              >
                <div className="type-icon">{type.icon}</div>
                <h4>{type.label}</h4>
                <p>{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Budget Range */}
        <div className="form-section">
          <h3>What's your budget per session? 💰</h3>
          <div className="budget-selector">
            <input
              type="range"
              min="30"
              max="200"
              value={matchPreferences.budget || 75}
              onChange={(e) => setMatchPreferences({...matchPreferences, budget: e.target.value})}
              className="budget-slider"
            />
            <div className="budget-display">
              <span>${matchPreferences.budget || 75} per session</span>
            </div>
            <div className="budget-labels">
              <span>$30</span>
              <span>$200+</span>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="form-section">
          <h3>When do you want to start? ⏰</h3>
          <div className="availability-options">
            {availabilityOptions.map((option) => (
              <button
                key={option.id}
                className={`availability-card ${matchPreferences.availability === option.id ? 'selected' : ''} ${option.urgency}`}
                onClick={() => {
                  setMatchPreferences({...matchPreferences, availability: option.id});
                  MarketplaceAudio.playSound('tap');
                  MarketplaceHaptics.light();
                }}
              >
                {option.label}
                {option.urgency === 'high' && <span className="urgency-badge">🔥</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Location Input */}
        <div className="form-section">
          <h3>Where are you located? 📍</h3>
          <input
            type="text"
            placeholder="Enter your zip code or city"
            value={matchPreferences.location}
            onChange={(e) => setMatchPreferences({...matchPreferences, location: e.target.value})}
            className="input location-input"
            onFocus={() => MarketplaceHaptics.light()}
          />
        </div>

        {/* Match Button */}
        <div className="match-action">
          <button
            className={`btn btn-primary btn-xl match-btn ${isMatching ? 'matching' : ''}`}
            onClick={handleInstantMatch}
            disabled={!matchPreferences.goal || isMatching}
          >
            {isMatching ? (
              <>
                <div className="loading-spinner"></div>
                Finding Your Perfect Match...
              </>
            ) : (
              <>
                ⚡ Find My Trainer
              </>
            )}
          </button>
          {!matchPreferences.goal && (
            <p className="helper-text">Please select your main goal to continue</p>
          )}
        </div>
      </div>

      {isMatching && (
        <div className="matching-overlay">
          <div className="matching-animation">
            <div className="pulse-rings">
              <div className="pulse-ring"></div>
              <div className="pulse-ring"></div>
              <div className="pulse-ring"></div>
            </div>
            <h3>Finding Your Perfect Match...</h3>
            <p>Analyzing 500+ verified trainers in your area</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Mobile Loading Screen - Simple Language  
const MobileLoadingScreen = ({ progress = 0 }) => {
  const [currentStatus, setCurrentStatus] = useState('Getting ready...');
  const [dots, setDots] = useState('');

  useEffect(() => {
    const statuses = [
      'Getting ready...',
      'Loading your info...',
      'Connecting to LiftLink...',
      'Setting up your account...',
      'Almost there...',
      'Welcome to LiftLink!'
    ];
    
    const statusIndex = Math.floor((progress / 100) * statuses.length);
    setCurrentStatus(statuses[Math.min(statusIndex, statuses.length - 1)]);
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, [progress]);

  return (
    <div className="mobile-loading">
      <LiftLinkLogo size="xl" />
      <div className="loading-spinner"></div>
      <div className="loading-text">LiftLink</div>
      <div className="loading-subtitle">{currentStatus}{dots}</div>
    </div>
  );
};

// Mobile Top Navigation
const MobileTopNav = ({ onMenuToggle, userProfile }) => {
  return (
    <div className="mobile-nav-bar">
      <button 
        className="nav-menu-btn"
        onClick={onMenuToggle}
        onTouchStart={() => MobileHaptics.light()}
      >
        ☰
      </button>
      
      <LiftLinkLogo />
      
      <button 
        className="nav-profile-btn"
        onTouchStart={() => MobileHaptics.light()}
      >
        {userProfile?.name?.charAt(0) || '👤'}
      </button>
    </div>
  );
};

// Mobile Bottom Navigation - Simple Language
const MobileBottomNav = ({ currentView, setCurrentView, userProfile }) => {
  const navItems = [
    { key: 'dashboard', label: 'Home', icon: '🏠' },
    { key: 'trainers', label: 'Trainers', icon: '🎯' },
    { key: 'progress', label: 'Progress', icon: '📊' },
    { key: 'social', label: 'Friends', icon: '👥' },
    { key: 'profile', label: 'Profile', icon: '👤' }
  ];

  // Add trainer-specific items
  if (userProfile?.role === 'trainer') {
    navItems[4] = { key: 'trainer-dashboard', label: 'My Clients', icon: '🏋️‍♂️', badge: 3 };
  }

  // Add admin items  
  if (userProfile?.role === 'admin') {
    navItems[4] = { key: 'admin', label: 'Settings', icon: '🛡️', badge: 5 };
  }

  const handleNavigation = (key) => {
    setCurrentView(key);
    MobileTacticalAudio.playSound('tap');
    MobileHaptics.light();
  };

  return (
    <div className="mobile-bottom-nav">
      {navItems.map((item) => (
        <div
          key={item.key}
          className={`bottom-nav-item ${currentView === item.key ? 'active' : ''}`}
          onClick={() => handleNavigation(item.key)}
          onTouchStart={() => MobileHaptics.light()}
        >
          <div className="nav-item-icon">{item.icon}</div>
          <div className="nav-item-label">{item.label}</div>
          {item.badge && <div className="nav-item-badge">{item.badge}</div>}
        </div>
      ))}
    </div>
  );
};

// Mobile Auth Forms - Simple Language
const MobileAuthForm = ({ isLogin, onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      MobileTacticalAudio.playSound('tap');
      
      if (!isLogin && password !== confirmPassword) {
        setError('Passwords don\'t match. Please try again.');
        setLoading(false);
        MobileTacticalAudio.playSound('error');
        return;
      }

      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      
      MobileTacticalAudio.playSound('success');
      MobileHaptics.success();
    } catch (error) {
      // Friendly error messages
      let friendlyError = 'Something went wrong. Please try again.';
      
      if (error.message.includes('ACCESS DENIED') || error.message.includes('Invalid credentials')) {
        friendlyError = 'We couldn\'t log you in. Check your email and password and try again.';
      } else if (error.message.includes('register') || error.message.includes('sign up')) {
        friendlyError = 'We couldn\'t create your account. Please try again.';
      }
      
      setError(friendlyError);
      MobileTacticalAudio.playSound('error');
      MobileHaptics.error();
    }
    
    setLoading(false);
  };

  return (
    <div className="mobile-tactical-app">
      <div className="mobile-loading">
        <LiftLinkLogo size="xl" />
        
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px', marginTop: '2rem' }}>
          <div className="mobile-form-group">
            <label className="mobile-form-label">Email</label>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mobile-form-input"
              onFocus={() => MobileHaptics.light()}
            />
          </div>

          <div className="mobile-form-group">
            <label className="mobile-form-label">Password</label>
            <input
              type="password"
              placeholder={isLogin ? "Your password" : "Create a password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mobile-form-input"
              onFocus={() => MobileHaptics.light()}
            />
          </div>

          {!isLogin && (
            <div className="mobile-form-group">
              <label className="mobile-form-label">Confirm Password</label>
              <input
                type="password"
                placeholder="Type your password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mobile-form-input"
                onFocus={() => MobileHaptics.light()}
              />
            </div>
          )}
          
          {error && (
            <div style={{ 
              color: '#B85450', 
              textAlign: 'center', 
              marginBottom: '1rem',
              padding: '0.75rem',
              background: 'rgba(184, 84, 80, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(184, 84, 80, 0.3)'
            }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading} 
            className="mobile-btn"
            style={{ marginBottom: '1rem' }}
          >
            {loading ? (
              <div className="loading-spinner" style={{ width: '20px', height: '20px', margin: '0' }}></div>
            ) : (
              <>
                <span className="btn-icon">{isLogin ? '🚀' : '✨'}</span>
                {isLogin ? 'Log In' : 'Sign Up'}
              </>
            )}
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#4A90A4', fontSize: '14px' }}>
              {isLogin ? 'Don\'t have an account?' : 'Already have an account?'}{' '}
            </span>
            <button 
              type="button" 
              onClick={onToggle}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B8E5A',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
              onTouchStart={() => MobileHaptics.light()}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </form>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '12px',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{ 
            textAlign: 'center', 
            color: '#4A90A4', 
            fontSize: '12px', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '0.5rem'
          }}>
            Try the Demo
          </div>
          <div style={{ fontSize: '12px', color: '#6B8E5A' }}>
            <div style={{ marginBottom: '4px' }}>Member: user@demo.com / demo123</div>
            <div>Trainer: trainer@demo.com / demo123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Auth Provider with Mobile Features
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/api/users/profile');
      setUserProfile(response.data);
      MobileTacticalAudio.playSound('success');
    } catch (error) {
      console.log('User profile fetch error:', error.response?.data?.detail || error.message);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
      MobileTacticalAudio.playSound('error');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      fetchUserProfile();
    }
    
    // Simplified loading - no 3 second delay
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  const login = async (email, password) => {
    try {
      MobileTacticalAudio.playSound('tap');
      
      let demoToken = '';
      let demoUser = {};
      
      if (email === 'user@demo.com' && password === 'demo123') {
        demoToken = 'demo_user';
        demoUser = { uid: 'demo_user_1', email, displayName: 'Operator Alpha' };
      } else if (email === 'trainer@demo.com' && password === 'demo123') {
        demoToken = 'demo_trainer';
        demoUser = { uid: 'demo_user_2', email, displayName: 'Commander Beta' };
      } else if (email === 'aaravdthakker@gmail.com' || email === 'aadidthakker@gmail.com' || email === 'sid.the.manne@gmail.com') {
        demoToken = 'demo_admin';
        demoUser = { uid: 'admin_aarav', email, displayName: 'Supreme Commander' };
      } else {
        throw new Error('We couldn\'t find an account with that email and password. Please check and try again.');
      }
      
      localStorage.setItem('auth_token', demoToken);
      localStorage.setItem('user_data', JSON.stringify(demoUser));
      setUser(demoUser);
      
      try {
        await api.post('/api/users/register', {
          email: demoUser.email,
          name: demoUser.displayName || demoUser.email.split('@')[0],
        });
      } catch (error) {
        console.log('User registration note:', error.response?.data?.detail || 'User may already exist');
      }
      
      const response = await api.get('/api/users/profile');
      setUserProfile(response.data);
      
      MobileTacticalAudio.playSound('success');
      MobileHaptics.success();
      
      return { user: demoUser };
    } catch (error) {
      MobileTacticalAudio.playSound('error');
      MobileHaptics.heavy();
      throw new Error(error.message || 'Something went wrong. Please try again.');
    }
  };

  const register = async (email, password) => {
    return await login(email, password);
  };

  const logout = async () => {
    MobileTacticalAudio.playSound('click');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setUserProfile(null);
    MobileHaptics.medium();
  };

  const value = {
    user,
    userProfile,
    login,
    register,
    logout,
    loading
  };

  if (loading) {
    return <MobileLoadingScreen progress={loadingProgress} />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth Checker Component
const AuthChecker = ({ children }) => {
  const auth = useAuth();
  return children(auth);
};

// Mobile Component Wrappers - Updated
const MobileDashboard = ({ setCurrentView }) => {
  return <HomeDashboard setCurrentView={setCurrentView} />;
};

const MobileTrainerSearch = () => {
  return <TrainerSearch />;
};

const MobileBookings = () => {
  return <MyBookings />;
};

const MobileProgress = () => {
  return <ProgressAnalytics />;
};

const MobileTree = () => {
  const { userProfile } = useAuth();
  return <FitnessForest userProfile={userProfile} />;
};

const MobileSocial = () => {
  return <SocialNetwork />;
};

const MobileProfile = () => {
  return <UserProfile />;
};

const MobileTrainerDashboard = () => {
  return <TrainerDashboard />;
};

const MobileAdminDashboard = () => {
  return <AdminDashboard />;
};
const SocialNetwork = () => {
  const { userProfile } = useAuth();
  
  return (
    <div className="mobile-card">
      <div className="card-header">
        <h2 className="card-title">Connect with Friends</h2>
      </div>
      
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
        <h3 style={{ color: '#6B8E5A', marginBottom: '1rem' }}>Coming Soon!</h3>
        <p style={{ color: '#4A90A4', marginBottom: '2rem' }}>
          Connect with workout buddies, share your progress, and join fitness challenges together.
        </p>
        
        <div style={{ 
          background: 'rgba(154, 205, 50, 0.1)', 
          border: '1px solid rgba(154, 205, 50, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <h4 style={{ color: '#6B8E5A', marginBottom: '0.5rem' }}>What's Coming:</h4>
          <ul style={{ textAlign: 'left', color: '#4A90A4' }}>
            <li>Find workout partners nearby</li>
            <li>Share your fitness wins</li>
            <li>Join group challenges</li>
            <li>Celebrate together</li>
          </ul>
        </div>
        
        <button className="mobile-btn secondary" disabled>
          <span className="btn-icon">🔔</span>
          Get Notified When Ready
        </button>
      </div>
    </div>
  );
};


const UserProfile = () => {
  const { userProfile, logout } = useAuth();
  
  return (
    <div className="mobile-card">
      <div className="card-header">
        <h2 className="card-title">My Profile</h2>
      </div>
      
      <div style={{ padding: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6B8E5A, #FFD700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 1rem',
            boxShadow: '0 0 20px rgba(154, 205, 50, 0.5)'
          }}>
            {userProfile?.name?.charAt(0) || '👤'}
          </div>
          <h3 style={{ color: '#6B8E5A', marginBottom: '0.5rem' }}>
            {userProfile?.name || 'Fitness Warrior'}
          </h3>
          <p style={{ color: '#4A90A4' }}>
            {userProfile?.role === 'trainer' ? 'Personal Trainer' : 
             userProfile?.role === 'admin' ? 'Administrator' : 'Member'}
          </p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: '#6B8E5A', marginBottom: '1rem' }}>Your Stats</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ 
              background: 'rgba(154, 205, 50, 0.1)', 
              border: '1px solid rgba(154, 205, 50, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', color: '#6B8E5A' }}>{userProfile?.level || 1}</div>
              <div style={{ fontSize: '0.8rem', color: '#4A90A4' }}>Level</div>
            </div>
            <div style={{ 
              background: 'rgba(154, 205, 50, 0.1)', 
              border: '1px solid rgba(154, 205, 50, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', color: '#6B8E5A' }}>{userProfile?.consecutive_days || 0}</div>
              <div style={{ fontSize: '0.8rem', color: '#4A90A4' }}>Day Streak</div>
            </div>
            <div style={{ 
              background: 'rgba(154, 205, 50, 0.1)', 
              border: '1px solid rgba(154, 205, 50, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', color: '#6B8E5A' }}>{userProfile?.lift_coins || 0}</div>
              <div style={{ fontSize: '0.8rem', color: '#4A90A4' }}>Coins</div>
            </div>
            <div style={{ 
              background: 'rgba(154, 205, 50, 0.1)', 
              border: '1px solid rgba(154, 205, 50, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', color: '#6B8E5A' }}>{userProfile?.xp_points || 0}</div>
              <div style={{ fontSize: '0.8rem', color: '#4A90A4' }}>XP Points</div>
            </div>
          </div>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: '#6B8E5A', marginBottom: '1rem' }}>Settings</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="mobile-btn secondary" style={{ justifyContent: 'flex-start' }}>
              <span className="btn-icon">🔔</span>
              Notifications
            </button>
            <button className="mobile-btn secondary" style={{ justifyContent: 'flex-start' }}>
              <span className="btn-icon">🎯</span>
              Goals
            </button>
            <button className="mobile-btn secondary" style={{ justifyContent: 'flex-start' }}>
              <span className="btn-icon">🏆</span>
              Achievements
            </button>
            <button className="mobile-btn secondary" style={{ justifyContent: 'flex-start' }}>
              <span className="btn-icon">⚙️</span>
              App Settings
            </button>
          </div>
        </div>
        
        <button 
          className="mobile-btn danger"
          onClick={logout}
          onTouchStart={() => MobileHaptics.light()}
        >
          <span className="btn-icon">🚪</span>
          Sign Out
        </button>
      </div>
    </div>
  );
};



const AdminDashboard = () => {
  return (
    <div className="mobile-card">
      <div className="card-header">
        <h2 className="card-title">Admin Dashboard</h2>
      </div>
      
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
        <h3 style={{ color: '#6B8E5A', marginBottom: '1rem' }}>Admin Controls</h3>
        <p style={{ color: '#4A90A4', marginBottom: '2rem' }}>
          Manage users, trainers, and platform settings.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            background: 'rgba(154, 205, 50, 0.1)', 
            border: '1px solid rgba(154, 205, 50, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', color: '#6B8E5A' }}>2,847</div>
            <div style={{ fontSize: '0.8rem', color: '#4A90A4' }}>Total Users</div>
          </div>
          <div style={{ 
            background: 'rgba(154, 205, 50, 0.1)', 
            border: '1px solid rgba(154, 205, 50, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', color: '#6B8E5A' }}>127</div>
            <div style={{ fontSize: '0.8rem', color: '#4A90A4' }}>Active Trainers</div>
          </div>
        </div>
        
        <button className="mobile-btn">
          <span className="btn-icon">⚙️</span>
          Manage Platform
        </button>
      </div>
    </div>
  );
};

const ProgressAnalytics = () => {
  const { userProfile } = useAuth();
  
  return (
    <div className="mobile-card">
      <div className="card-header">
        <h2 className="card-title">Your Progress</h2>
      </div>
      
      <div style={{ padding: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ color: '#6B8E5A', marginBottom: '0.5rem' }}>Keep Going!</h3>
          <p style={{ color: '#4A90A4' }}>You're doing great. Here's how you're doing.</p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: '#6B8E5A', marginBottom: '1rem' }}>This Week</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ 
              background: 'rgba(154, 205, 50, 0.1)', 
              border: '1px solid rgba(154, 205, 50, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', color: '#6B8E5A' }}>4</div>
              <div style={{ fontSize: '0.8rem', color: '#4A90A4' }}>Workouts</div>
            </div>
            <div style={{ 
              background: 'rgba(154, 205, 50, 0.1)', 
              border: '1px solid rgba(154, 205, 50, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', color: '#6B8E5A' }}>320</div>
              <div style={{ fontSize: '0.8rem', color: '#4A90A4' }}>Minutes</div>
            </div>
            <div style={{ 
              background: 'rgba(154, 205, 50, 0.1)', 
              border: '1px solid rgba(154, 205, 50, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', color: '#6B8E5A' }}>1,240</div>
              <div style={{ fontSize: '0.8rem', color: '#4A90A4' }}>Calories</div>
            </div>
            <div style={{ 
              background: 'rgba(154, 205, 50, 0.1)', 
              border: '1px solid rgba(154, 205, 50, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', color: '#6B8E5A' }}>{userProfile?.consecutive_days || 0}</div>
              <div style={{ fontSize: '0.8rem', color: '#4A90A4' }}>Day Streak</div>
            </div>
          </div>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: '#6B8E5A', marginBottom: '1rem' }}>Goals</h4>
          <div style={{ 
            background: 'rgba(154, 205, 50, 0.1)', 
            border: '1px solid rgba(154, 205, 50, 0.3)',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#4A90A4' }}>Weekly Workouts</span>
              <span style={{ color: '#6B8E5A' }}>4/5</span>
            </div>
            <div style={{ 
              background: 'rgba(0, 0, 0, 0.3)', 
              borderRadius: '4px', 
              height: '8px',
              position: 'relative'
            }}>
              <div style={{ 
                background: '#6B8E5A', 
                borderRadius: '4px', 
                height: '100%',
                width: '80%',
                boxShadow: '0 0 10px rgba(154, 205, 50, 0.5)'
              }}></div>
            </div>
          </div>
        </div>
        
        <button className="mobile-btn">
          <span className="btn-icon">🎯</span>
          Set New Goals
        </button>
      </div>
    </div>
  );
};

const MyBookings = () => {
  return (
    <div className="mobile-card">
      <div className="card-header">
        <h2 className="card-title">My Sessions</h2>
        <button className="card-action">+ Book New</button>
      </div>
      
      <div style={{ padding: '1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: '#6B8E5A', marginBottom: '1rem' }}>Upcoming</h4>
          
          <div style={{ 
            background: 'rgba(154, 205, 50, 0.1)', 
            border: '1px solid rgba(154, 205, 50, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h5 style={{ color: '#6B8E5A', margin: 0 }}>Strength Training</h5>
              <span style={{ 
                background: 'rgba(154, 205, 50, 0.2)', 
                color: '#6B8E5A', 
                padding: '2px 8px', 
                borderRadius: '12px',
                fontSize: '0.8rem'
              }}>
                Confirmed
              </span>
            </div>
            <p style={{ color: '#4A90A4', margin: '0.5rem 0' }}>with Sarah Johnson</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#4A90A4', fontSize: '0.9rem' }}>Tomorrow, 2:00 PM</span>
              <button 
                className="mobile-btn secondary" 
                style={{ 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.8rem',
                  minHeight: 'auto'
                }}
              >
                Reschedule
              </button>
            </div>
          </div>
          
          <div style={{ 
            background: 'rgba(154, 205, 50, 0.1)', 
            border: '1px solid rgba(154, 205, 50, 0.3)',
            borderRadius: '12px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h5 style={{ color: '#6B8E5A', margin: 0 }}>Cardio & Core</h5>
              <span style={{ 
                background: 'rgba(255, 215, 0, 0.2)', 
                color: '#FFD700', 
                padding: '2px 8px', 
                borderRadius: '12px',
                fontSize: '0.8rem'
              }}>
                Pending
              </span>
            </div>
            <p style={{ color: '#4A90A4', margin: '0.5rem 0' }}>with Mike Torres</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#4A90A4', fontSize: '0.9rem' }}>Friday, 10:00 AM</span>
              <button 
                className="mobile-btn secondary" 
                style={{ 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.8rem',
                  minHeight: 'auto'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <h4 style={{ color: '#6B8E5A', marginBottom: '1rem' }}>Past Sessions</h4>
          <p style={{ color: '#4A90A4', textAlign: 'center', padding: '2rem' }}>
            Your completed sessions will show up here.
          </p>
        </div>
      </div>
    </div>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};



// ID Verification Component
const IDVerification = ({ onVerified }) => {
  const [documentType, setDocumentType] = useState('drivers_license');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid file (JPG, PNG, or PDF)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!selectedFile) {
        throw new Error('Please select a file to upload');
      }

      // Calculate age for client-side validation
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear() - 
        ((today.getMonth() < birthDate.getMonth()) || 
         (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
      
      if (age < 18) {
        throw new Error('You must be 18 or older to use this platform');
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('document_type', documentType);
      formData.append('date_of_birth', dateOfBirth);

      const response = await api.post('/api/verification/upload-id', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(`ID Verification successful! Age verified: ${response.data.age} years old`);
      onVerified();
    } catch (error) {
      setError(error.response?.data?.detail || error.message);
    }
    setLoading(false);
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="verification-header">
          <h2>🔐 Age Verification Required</h2>
          <p>Please verify your age by uploading a valid ID document</p>
          <div className="age-requirement">
            <span className="requirement-badge">18+ Only</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="verification-form">
          <div className="form-group">
            <label>Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="form-select"
              required
            >
              <option value="drivers_license">Driver's License</option>
              <option value="passport">Passport</option>
              <option value="national_id">National ID</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="form-input"
              required
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>Upload ID Document</label>
            <div className="file-upload-area">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="file-input"
                id="id-upload"
                required
              />
              <label htmlFor="id-upload" className="file-upload-label">
                <div className="upload-icon">📄</div>
                <div className="upload-text">
                  {selectedFile ? selectedFile.name : 'Click to upload ID document'}
                </div>
                <div className="upload-hint">JPG, PNG, or PDF (max 10MB)</div>
              </label>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="verification-note">
            <p>🔒 Your ID information is encrypted and stored securely. We only verify your age and identity.</p>
          </div>

          <button type="submit" disabled={loading} className="verify-btn">
            {loading ? 'Verifying...' : 'Verify Age & Identity'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Certification Upload Component
const CertificationUpload = ({ onComplete }) => {
  const [certType, setCertType] = useState('NASM');
  const [certNumber, setCertNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid file (JPG, PNG, or PDF)');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!selectedFile) {
        throw new Error('Please select a certification file to upload');
      }
      if (!agreedToTerms) {
        throw new Error('Please agree to the certification terms');
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('cert_type', certType);
      formData.append('cert_number', certNumber);
      if (expirationDate) {
        formData.append('expiration_date', expirationDate);
      }

      const response = await api.post('/api/verification/upload-certification', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(`${certType} certification verified successfully!`);
      onComplete();
    } catch (error) {
      setError(error.response?.data?.detail || error.message);
    }
    setLoading(false);
  };

  return (
    <div className="certification-container">
      <div className="certification-card">
        <div className="certification-header">
          <h2>🏆 Upload Fitness Certification</h2>
          <p>Verify your credentials to become a certified trainer</p>
        </div>

        <form onSubmit={handleSubmit} className="certification-form">
          <div className="form-group">
            <label>Certification Type</label>
            <select
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
              className="form-select"
              required
            >
              <option value="NASM">NASM - National Academy of Sports Medicine</option>
              <option value="ACE">ACE - American Council on Exercise</option>
              <option value="ISSA">ISSA - International Sports Sciences Association</option>
              <option value="CSCS">CSCS - Certified Strength & Conditioning Specialist</option>
              <option value="Other">Other Certification</option>
            </select>
          </div>

          <div className="form-group">
            <label>Certification Number/ID</label>
            <input
              type="text"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              className="form-input"
              placeholder="Enter your certification number"
              required
            />
          </div>

          <div className="form-group">
            <label>Expiration Date (if applicable)</label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>Upload Certification Document</label>
            <div className="file-upload-area">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="file-input"
                id="cert-upload"
                required
              />
              <label htmlFor="cert-upload" className="file-upload-label">
                <div className="upload-icon">🎓</div>
                <div className="upload-text">
                  {selectedFile ? selectedFile.name : 'Click to upload certification'}
                </div>
                <div className="upload-hint">JPG, PNG, or PDF format</div>
              </label>
            </div>
          </div>

          <div className="agreement-section">
            <label className="agreement-checkbox">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                required
              />
              <span className="checkmark"></span>
              <span className="agreement-text">
                I confirm that this certification is valid and legally obtained. 
                I understand that false information may result in account termination.
              </span>
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="verification-info">
            <div className="info-item">
              <span className="info-icon">✅</span>
              <span>Instant verification for recognized certifications</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🔍</span>
              <span>Cross-checked against public certification databases</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🏅</span>
              <span>Certified badge displayed on your trainer profile</span>
            </div>
          </div>

          <button type="submit" disabled={loading || !agreedToTerms} className="upload-cert-btn">
            {loading ? 'Uploading & Verifying...' : 'Upload Certification'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Tactical Navigation System
const TacticalNavigation = ({ currentView, setCurrentView }) => {
  const { userProfile, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [missionStats, setMissionStats] = useState({
    operationalTime: '00:00:00',
    completedMissions: 0,
    currentObjectives: 3
  });

  // Update operational time
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
      const minutes = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
      setMissionStats(prev => ({
        ...prev,
        operationalTime: `${hours}:${minutes}:${seconds}`
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const navSections = [
    {
      title: 'PRIMARY OPERATIONS',
      items: [
        { key: 'dashboard', label: 'Command Center', icon: '⚡', priority: 'alpha' },
        { key: 'trainers', label: 'Tactical Search', icon: '🎯', priority: 'alpha' },
        { key: 'bookings', label: 'Mission Log', icon: '📋', priority: 'bravo' },
        { key: 'progress', label: 'Intel Analysis', icon: '📊', priority: 'bravo' }
      ]
    },
    {
      title: 'ADVANCED SYSTEMS', 
      items: [
        { key: 'fitnessforest', label: 'Evolution Tree', icon: '🌲', priority: 'charlie' },
        { key: 'social', label: 'Squad Network', icon: '👥', priority: 'charlie' },
        { key: 'profile', label: 'Operator File', icon: '🔰', priority: 'delta' }
      ]
    }
  ];

  // Add role-specific sections
  if (userProfile?.role === 'trainer') {
    navSections[0].items.splice(2, 0, { 
      key: 'trainer-dashboard', 
      label: 'Trainer Command', 
      icon: '🏋️‍♂️', 
      priority: 'alpha',
      notification: 3 
    });
  }

  if (userProfile?.role === 'admin') {
    navSections.push({
      title: 'COMMAND AUTHORITY',
      items: [
        { key: 'admin', label: 'Control Center', icon: '🛡️', priority: 'omega', notification: 5 }
      ]
    });
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    MobileTacticalAudio.playSound('click');
    MobileHaptics.light();
  };

  const handleNavigation = (key) => {
    if (key === 'logout') {
      logout();
    } else {
      setCurrentView(key);
      setSidebarOpen(false);
      MobileTacticalAudio.playSound('click');
      MobileHaptics.light();
    }
  };

  return (
    <>
      {/* Tactical HUD Overlay */}
      <div className="hud-overlay">
        <div className="hud-corners hud-corner-tl"></div>
        <div className="hud-corners hud-corner-tr"></div>
        <div className="hud-corners hud-corner-bl"></div>
        <div className="hud-corners hud-corner-br"></div>
        <div className="hud-grid"></div>
      </div>

      {/* Tactical Hamburger Menu */}
      <button 
        className={`tactical-hamburger ${sidebarOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
        onMouseEnter={() => MobileTacticalAudio.playSound('hover')}
      >
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 99
          }}
        />
      )}

      {/* Tactical Sidebar */}
      <div className={`tactical-sidebar ${sidebarOpen ? 'active' : ''}`}>
        {/* Command Header */}
        <div className="command-header">
          <div className="command-logo">
            <div className="logo-icon">⚡</div>
            <div className="logo-text">LIFTLINK</div>
          </div>
        </div>

        {/* Operator Profile */}
        <div className="operator-profile">
          <div className="operator-avatar">
            {userProfile?.name?.charAt(0) || '👤'}
          </div>
          <div className="operator-info">
            <div className="operator-name">{userProfile?.name || 'OPERATOR'}</div>
            <div className="operator-rank">
              <span className="rank-badge">
                {GamificationEngine.getRankName(userProfile?.level || 1)}
              </span>
              <span>LVL {userProfile?.level || 1}</span>
            </div>
            <div className="operator-stats">
              <div className="stat-item">
                <span className="stat-value">{userProfile?.lift_coins || 0}</span>
                <span className="stat-label">COINS</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userProfile?.consecutive_days || 0}</span>
                <span className="stat-label">STREAK</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userProfile?.level || 1}</span>
                <span className="stat-label">RANK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Status */}
        <div className="mission-status">
          <div className="status-header">OPERATIONAL STATUS</div>
          <div className="status-metrics">
            <div className="status-metric">
              <span className="metric-label">TIME</span>
              <span className="metric-value">{missionStats.operationalTime}</span>
            </div>
            <div className="status-metric">
              <span className="metric-label">OBJECTIVES</span>
              <span className="metric-value">{missionStats.currentObjectives}</span>
            </div>
          </div>
        </div>

        {/* Tactical Navigation */}
        <div className="tactical-nav">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              <div className="nav-section-title">{section.title}</div>
              {section.items.map((item) => (
                <div
                  key={item.key}
                  className={`nav-item ${currentView === item.key ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.key)}
                  onMouseEnter={() => MobileTacticalAudio.playSound('hover')}
                >
                  <div className="nav-icon">{item.icon}</div>
                  <div className="nav-label">{item.label}</div>
                  {item.priority && (
                    <div className={`nav-priority priority-${item.priority}`}>
                      {item.priority}
                    </div>
                  )}
                  {item.notification && (
                    <div className="nav-notification">{item.notification}</div>
                  )}
                </div>
              ))}
            </div>
          ))}
          
          {/* Logout Section */}
          <div className="nav-section">
            <div className="nav-section-title">SYSTEM</div>
            <div
              className="nav-item nav-item-logout"
              onClick={() => handleNavigation('logout')}
              onMouseEnter={() => MobileTacticalAudio.playSound('hover')}
            >
              <div className="nav-icon">🚪</div>
              <div className="nav-label">LOGOUT</div>
              <div className="nav-priority priority-omega">OMEGA</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Tactical Login Interface
const TacticalLogin = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [securityLevel, setSecurityLevel] = useState(0);
  const { login } = useAuth();

  // Security level animation based on input
  useEffect(() => {
    const emailScore = email.length > 0 ? 1 : 0;
    const passwordScore = password.length >= 6 ? 2 : password.length > 0 ? 1 : 0;
    setSecurityLevel(emailScore + passwordScore);
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      MobileTacticalAudio.playSound('click');
      await login(email, password);
    } catch (error) {
      setError(error.message);
      MobileTacticalAudio.playSound('error');
      MobileHaptics.heavy();
    }
    
    setLoading(false);
  };

  return (
    <div className="tactical-login">
      <div className="hud-overlay">
        <div className="hud-corners hud-corner-tl"></div>
        <div className="hud-corners hud-corner-tr"></div>
        <div className="hud-corners hud-corner-bl"></div>
        <div className="hud-corners hud-corner-br"></div>
      </div>
      
      <div className="login-container">
        <div className="login-header">
          <div className="tactical-emblem">⚡</div>
          <h1 className="login-title">LIFTLINK</h1>
          <div className="login-subtitle">TACTICAL FITNESS COMMAND</div>
          <div className="security-clearance">SECURITY CLEARANCE REQUIRED</div>
        </div>

        <div className="security-status">
          <div className="security-level">
            <span className="security-label">SECURITY LEVEL</span>
            <div className="security-bars">
              {[1, 2, 3].map(i => (
                <div 
                  key={i}
                  className={`security-bar ${i <= securityLevel ? 'active' : ''}`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="tactical-form">
          <div className="form-field">
            <label className="field-label">OPERATOR ID</label>
            <input
              type="email"
              placeholder="Enter access credentials"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                MobileTacticalAudio.playSound('hover');
              }}
              required
              className="tactical-input"
            />
            <div className="field-scanner"></div>
          </div>

          <div className="form-field">
            <label className="field-label">SECURITY CODE</label>
            <input
              type="password"
              placeholder="Enter authorization code"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                MobileTacticalAudio.playSound('hover');
              }}
              required
              className="tactical-input"
            />
            <div className="field-scanner"></div>
          </div>
          
          {error && (
            <div className="tactical-error">
              <div className="error-icon">⚠️</div>
              <div className="error-message">{error}</div>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading} 
            className="tactical-submit"
            onMouseEnter={() => MobileTacticalAudio.playSound('hover')}
          >
            {loading ? (
              <div className="loading-sequence">
                <div className="loading-dots">AUTHENTICATING<span className="dots"></span></div>
              </div>
            ) : (
              <>
                <span className="submit-icon">🔓</span>
                INITIATE ACCESS
              </>
            )}
          </button>
          
          <div className="auth-toggle">
            <span className="toggle-text">
              Need clearance authorization?{' '}
            </span>
            <button 
              type="button" 
              onClick={onToggle} 
              className="toggle-link"
              onMouseEnter={() => MobileTacticalAudio.playSound('hover')}
            >
              REQUEST ACCESS
            </button>
          </div>
        </form>

        <div className="demo-credentials">
          <div className="demo-header">DEMO ACCESS CODES</div>
          <div className="demo-accounts">
            <div className="demo-account">
              <span className="account-type">USER</span>
              <span className="account-creds">user@demo.com / demo123</span>
            </div>
            <div className="demo-account">
              <span className="account-type">TRAINER</span>
              <span className="account-creds">trainer@demo.com / demo123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tactical Registration Interface
const TacticalRegistration = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [securityChecks, setSecurityChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false
  });
  const { register } = useAuth();

  // Password security validation
  useEffect(() => {
    setSecurityChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      match: password === confirmPassword && password.length > 0
    });
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('SECURITY CODES DO NOT MATCH');
      setLoading(false);
      MobileTacticalAudio.playSound('error');
      return;
    }

    try {
      MobileTacticalAudio.playSound('click');
      await register(email, password);
    } catch (error) {
      setError(error.message);
      MobileTacticalAudio.playSound('error');
    }
    
    setLoading(false);
  };

  return (
    <div className="tactical-login">
      <div className="hud-overlay">
        <div className="hud-corners hud-corner-tl"></div>
        <div className="hud-corners hud-corner-tr"></div>
        <div className="hud-corners hud-corner-bl"></div>
        <div className="hud-corners hud-corner-br"></div>
      </div>
      
      <div className="login-container">
        <div className="login-header">
          <div className="tactical-emblem">⚡</div>
          <h1 className="login-title">LIFTLINK</h1>
          <div className="login-subtitle">OPERATOR REGISTRATION</div>
          <div className="security-clearance">NEW RECRUIT AUTHORIZATION</div>
        </div>

        <form onSubmit={handleSubmit} className="tactical-form">
          <div className="form-field">
            <label className="field-label">OPERATOR ID</label>
            <input
              type="email"
              placeholder="Create access credentials"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                MobileTacticalAudio.playSound('hover');
              }}
              required
              className="tactical-input"
            />
          </div>

          <div className="form-field">
            <label className="field-label">SECURITY CODE</label>
            <input
              type="password"
              placeholder="Create authorization code"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                MobileTacticalAudio.playSound('hover');
              }}
              required
              className="tactical-input"
            />
          </div>

          <div className="form-field">
            <label className="field-label">CONFIRM CODE</label>
            <input
              type="password"
              placeholder="Verify authorization code"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                MobileTacticalAudio.playSound('hover');
              }}
              required
              className="tactical-input"
            />
          </div>

          {/* Security Requirements */}
          <div className="security-requirements">
            <div className="requirements-header">SECURITY REQUIREMENTS</div>
            <div className="requirements-list">
              {Object.entries({
                length: '8+ characters',
                uppercase: 'Uppercase letter',
                lowercase: 'Lowercase letter', 
                number: 'Number',
                match: 'Codes match'
              }).map(([key, label]) => (
                <div key={key} className={`requirement ${securityChecks[key] ? 'met' : ''}`}>
                  <span className="requirement-icon">
                    {securityChecks[key] ? '✓' : '○'}
                  </span>
                  <span className="requirement-text">{label}</span>
                </div>
              ))}
            </div>
          </div>
          
          {error && (
            <div className="tactical-error">
              <div className="error-icon">⚠️</div>
              <div className="error-message">{error}</div>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading || !Object.values(securityChecks).every(Boolean)} 
            className="tactical-submit"
            onMouseEnter={() => MobileTacticalAudio.playSound('hover')}
          >
            {loading ? (
              <div className="loading-sequence">
                <div className="loading-dots">REGISTERING<span className="dots"></span></div>
              </div>
            ) : (
              <>
                <span className="submit-icon">🛡️</span>
                REQUEST CLEARANCE
              </>
            )}
          </button>
          
          <div className="auth-toggle">
            <span className="toggle-text">
              Already have clearance?{' '}
            </span>
            <button 
              type="button" 
              onClick={onToggle} 
              className="toggle-link"
              onMouseEnter={() => MobileTacticalAudio.playSound('hover')}
            >
              ACCESS SYSTEM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HomeDashboard = ({ setCurrentView }) => {
  const { userProfile } = useAuth();
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Welcome Card */}
      <div className="mobile-card">
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <h2 style={{ color: '#6B8E5A', marginBottom: '0.5rem' }}>
            Welcome back, {userProfile?.name?.split(' ')[0] || 'Warrior'}! 👋
          </h2>
          <p style={{ color: '#4A90A4' }}>Ready to crush your fitness goals today?</p>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="mobile-card">
        <div className="card-header">
          <h3 className="card-title">Your Stats</h3>
          <button 
            className="card-action"
            onClick={() => setCurrentView('progress')}
            onTouchStart={() => MobileHaptics.light()}
          >
            View All
          </button>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '1rem',
          padding: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', color: '#6B8E5A' }}>{userProfile?.level || 1}</div>
            <div style={{ fontSize: '0.8rem', color: '#4A90A4' }}>Level</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', color: '#6B8E5A' }}>{userProfile?.consecutive_days || 0}</div>
            <div style={{ fontSize: '0.8rem', color: '#4A90A4' }}>Day Streak</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', color: '#6B8E5A' }}>{userProfile?.lift_coins || 0}</div>
            <div style={{ fontSize: '0.8rem', color: '#4A90A4' }}>Coins</div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mobile-card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '1rem',
          padding: '1rem'
        }}>
          <button 
            className="mobile-btn"
            onClick={() => setCurrentView('trainers')}
            onTouchStart={() => MobileHaptics.light()}
          >
            <span className="btn-icon">🎯</span>
            Find Trainers
          </button>
          <button 
            className="mobile-btn secondary"
            onClick={() => setCurrentView('bookings')}
            onTouchStart={() => MobileHaptics.light()}
          >
            <span className="btn-icon">📅</span>
            My Sessions
          </button>
        </div>
      </div>
      
      {/* Today's Goal */}
      <div className="mobile-card">
        <div className="card-header">
          <h3 className="card-title">Today's Goal</h3>
        </div>
        
        <div style={{ padding: '1rem' }}>
          <div style={{ 
            background: 'rgba(154, 205, 50, 0.1)', 
            border: '1px solid rgba(154, 205, 50, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💪</div>
            <h4 style={{ color: '#6B8E5A', marginBottom: '0.5rem' }}>Complete 1 Workout</h4>
            <p style={{ color: '#4A90A4', fontSize: '0.9rem' }}>You've got this! Let's make today count.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Trainer Search Component with Map Integration
const TrainerSearch = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'map'
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [filters, setFilters] = useState({
    specialty: '',
    maxRate: '',
    gym: '',
    experience: '',
    rating: ''
  });

  useEffect(() => {
    getUserLocation();
    fetchTrainers();
  }, [filters]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Keep default location
        }
      );
    }
  };

  const fetchTrainers = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.specialty) params.append('specialty', filters.specialty);
      if (filters.maxRate) params.append('max_rate', filters.maxRate);
      if (filters.gym) params.append('gym', filters.gym);
      
      // Add user location for distance calculation
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
      }

      const response = await api.get(`/api/trainers/search?${params}`);
      setTrainers(response.data.trainers);
    } catch (error) {
      console.error('Error fetching trainers:', error);
    }
    setLoading(false);
  };

  const handleBooking = async (trainer) => {
    try {
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() + 1); // Tomorrow
      sessionDate.setHours(10, 0, 0, 0); // 10 AM

      const response = await api.post('/api/bookings/create', {
        trainer_id: trainer.trainer_id,
        session_date: sessionDate.toISOString(),
        duration_hours: 1.0
      });

      // Create payment session
      const paymentResponse = await api.post(`/api/payments/create-session?booking_id=${response.data.booking_id}`);
      
      // Redirect to Stripe checkout
      window.location.href = paymentResponse.data.checkout_url;
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking. Please try again.');
    }
  };

  const handleTrainerSelect = (trainer) => {
    setSelectedTrainer(trainer);
    setViewMode('grid'); // Switch back to grid view to show details
  };

  const renderTrainerCard = (trainer) => (
    <div key={trainer.trainer_id} className={`trainer-card ${selectedTrainer?.trainer_id === trainer.trainer_id ? 'selected' : ''}`}>
      {/* Card Header */}
      <div className="trainer-header">
        <div className="trainer-avatar">
          {trainer.trainer_name?.charAt(0) || '💪'}
        </div>
        <div className="trainer-basic-info">
          <h3>{trainer.trainer_name}</h3>
          <p className="trainer-title">Certified Personal Trainer</p>
          <div className="trainer-rating">
            <span className="stars">⭐⭐⭐⭐⭐</span>
            <span className="rating-text">4.9 (127 reviews)</span>
          </div>
        </div>
        <div className="trainer-actions">
          <button className="favorite-btn">💜</button>
          <button className="share-btn">📤</button>
        </div>
      </div>

      {/* Trainer Details */}
      <div className="trainer-body">
        <div className="trainer-location">
          <span className="location-icon">📍</span>
          <span>{trainer.gym_name || 'Multiple Locations'}</span>
          {trainer.distance_km && (
            <span className="distance-badge">{trainer.distance_km} km away</span>
          )}
        </div>
        
        <div className="trainer-bio">
          <p>{trainer.bio || 'Dedicated fitness professional committed to helping you achieve your goals through personalized training programs and nutritional guidance.'}</p>
        </div>

        <div className="trainer-specialties">
          {(trainer.specialties || ['Weight Training', 'Nutrition', 'Personal Training']).map((specialty, index) => {
            const specialtyIcons = {
              'Weight Training': '🏋️',
              'Cardio': '🏃',
              'Yoga': '🧘',
              'CrossFit': '⚡',
              'Personal Training': '👤',
              'Nutrition': '🥗',
              'Sports Performance': '🏆',
              'Rehabilitation': '🩺'
            };
            
            return (
              <span key={index} className="specialty-tag">
                <span className="specialty-icon">{specialtyIcons[specialty] || '💪'}</span>
                {specialty}
              </span>
            );
          })}
        </div>

        <div className="trainer-stats">
          <div className="stat">
            <span className="stat-number">{trainer.experience_years || '5'}</span>
            <span className="stat-label">Years Exp</span>
          </div>
          <div className="stat">
            <span className="stat-number">{trainer.total_clients || '150+'}</span>
            <span className="stat-label">Clients</span>
          </div>
          <div className="stat">
            <span className="stat-number">{trainer.success_rate || '95%'}</span>
            <span className="stat-label">Success Rate</span>
          </div>
        </div>

        <div className="trainer-pricing">
          <div className="pricing-info">
            <span className="price">${trainer.hourly_rate || '75'}</span>
            <span className="price-period">/hour</span>
          </div>
          <div className="pricing-details">
            <span className="original-price">${(trainer.hourly_rate || 75) + 15}</span>
            <span className="discount">20% off first session</span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="trainer-footer">
        <div className="availability">
          <span className="availability-status available">🟢 Available Today</span>
          <span className="next-slot">Next: 2:00 PM</span>
        </div>
        
        <div className="action-buttons">
          <button className="message-btn">💬 Message</button>
          <button 
            className="book-btn"
            onClick={() => handleBooking(trainer)}
          >
            🚀 Book Session
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="trainer-search">
      {/* Enhanced Header */}
      <div className="search-header">
        <div className="header-content">
          <h1>Find Your Perfect Trainer</h1>
          <p>Connect with certified fitness professionals in your area</p>
          <div className="search-stats">
            <span className="stat">🏆 {trainers.length} Expert Trainers</span>
            <span className="stat">⭐ 4.9 Avg Rating</span>
            <span className="stat">📍 Multiple Locations</span>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="filters-section">
        <div className="filters-header">
          <h3>🔍 Find the Right Fit</h3>
          <button 
            className="clear-filters"
            onClick={() => setFilters({ specialty: '', maxRate: '', gym: '', experience: '', rating: '' })}
          >
            Clear All
          </button>
        </div>
        
        <div className="filters-grid">
          <div className="filter-group">
            <label>💪 Specialty</label>
            <select
              value={filters.specialty}
              onChange={(e) => setFilters({...filters, specialty: e.target.value})}
              className="filter-select"
            >
              <option value="">All Specialties</option>
              <option value="Weight Training">🏋️ Weight Training</option>
              <option value="Cardio">🏃 Cardio & Endurance</option>
              <option value="Yoga">🧘 Yoga & Flexibility</option>
              <option value="CrossFit">⚡ CrossFit</option>
              <option value="Personal Training">👤 Personal Training</option>
              <option value="Nutrition">🥗 Nutrition Coaching</option>
              <option value="Sports Performance">🏆 Sports Performance</option>
              <option value="Rehabilitation">🩺 Rehabilitation</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>💰 Max Rate ($/hour)</label>
            <input
              type="number"
              placeholder="e.g. 100"
              value={filters.maxRate}
              onChange={(e) => setFilters({...filters, maxRate: e.target.value})}
              className="filter-input"
              min="20"
              max="300"
            />
          </div>
          
          <div className="filter-group">
            <label>📍 Gym/Location</label>
            <input
              type="text"
              placeholder="Search by gym name"
              value={filters.gym}
              onChange={(e) => setFilters({...filters, gym: e.target.value})}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label>📅 Experience</label>
            <select
              value={filters.experience}
              onChange={(e) => setFilters({...filters, experience: e.target.value})}
              className="filter-select"
            >
              <option value="">Any Experience</option>
              <option value="1-2">1-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="results-section">
        <div className="results-header">
          <div className="results-count">
            <h3>Available Trainers ({trainers.length})</h3>
            <p>Showing top-rated professionals in your area</p>
          </div>
          <div className="view-options">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              📋 Grid View
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📃 List View
            </button>
            <button 
              className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
            >
              🗺️ Map View
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <h3>Finding the best trainers for you...</h3>
            <p>Searching through our network of certified professionals</p>
          </div>
        ) : trainers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No trainers found</h3>
            <p>Try adjusting your search criteria or browse all available trainers</p>
            <button 
              className="reset-search-btn"
              onClick={() => setFilters({ specialty: '', maxRate: '', gym: '', experience: '', rating: '' })}
            >
              View All Trainers
            </button>
          </div>
        ) : (
          <>
            {/* Map View */}
            {viewMode === 'map' && (
              <div className="map-view-container">
                <div className="map-wrapper">
                  <TrainerMap 
                    trainers={trainers}
                    center={mapCenter}
                    userLocation={userLocation}
                    onTrainerSelect={handleTrainerSelect}
                  />
                </div>
                <div className="map-legend">
                  <div className="legend-item">
                    <div className="legend-marker user-marker"></div>
                    <span>Your Location</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-marker trainer-marker"></div>
                    <span>Available Trainers</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-info">💡 Click on markers for trainer details</span>
                  </div>
                </div>
              </div>
            )}

            {/* Grid/List View */}
            {viewMode !== 'map' && (
              <div className={viewMode === 'grid' ? 'trainers-grid' : 'trainers-list'}>
                {trainers.map(renderTrainerCard)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Elite Payment Experience Component
const PaymentExperience = ({ sessionData, onComplete }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentType, setPaymentType] = useState('one-time'); // 'one-time' or 'subscription'
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const paymentMethods = [
    { id: 'venmo', name: 'Venmo', icon: 'V', desc: 'Quick & social' },
    { id: 'cashapp', name: 'CashApp', icon: '$', desc: 'Instant transfer' },
    { id: 'paypal', name: 'PayPal', icon: 'P', desc: 'Secure & trusted' },
    { id: 'applepay', name: 'Apple Pay', icon: '', desc: 'Touch ID / Face ID' },
    { id: 'stripe', name: 'Card', icon: '💳', desc: 'Visa, Mastercard, Amex' }
  ];

  const subscriptionBenefits = [
    'Unlimited 1-on-1 sessions with your mentor',
    'Priority booking and scheduling',
    'Exclusive workout plans and nutrition guides',
    'Progress tracking and analytics',
    'Access to elite mentor network',
    'Cancel anytime, no commitment'
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleCardInputChange = (field, value) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createConfetti = () => {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      container.appendChild(confetti);
    }
    
    return container;
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      
      // Add confetti effect
      const confetti = createConfetti();
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        document.body.removeChild(confetti);
      }, 1500);
    }, 2000);
  };

  const handleReturnToDashboard = () => {
    setShowSuccess(false);
    onComplete && onComplete();
  };

  if (showSuccess) {
    return (
      <div className="payment-success-overlay">
        <div className="success-content">
          <div className="success-checkmark">✓</div>
          <h2 className="success-title">You're locked in.</h2>
          <p className="success-message">
            Payment successful! Your {paymentType === 'subscription' ? 'subscription' : 'session'} is confirmed.
          </p>
          <button className="success-return-btn" onClick={handleReturnToDashboard}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      {/* Header */}
      <div className="payment-header">
        <h1 className="payment-title">Complete Your Payment to Unlock LiftLink</h1>
        <p className="payment-subtitle">
          Secure, encrypted, and instant. Choose your preferred method below.
        </p>
      </div>

      {/* Payment Type Toggle */}
      <div className="payment-type-toggle">
        <button 
          className={`toggle-option ${paymentType === 'one-time' ? 'active' : ''}`}
          onClick={() => setPaymentType('one-time')}
        >
          One-Time Session
        </button>
        <button 
          className={`toggle-option ${paymentType === 'subscription' ? 'active' : ''}`}
          onClick={() => setPaymentType('subscription')}
        >
          Monthly Subscription
        </button>
      </div>

      {/* Subscription Benefits */}
      {paymentType === 'subscription' && (
        <div className="subscription-benefits">
          <h3 className="section-title">Elite Membership Benefits</h3>
          <div className="benefits-list">
            {subscriptionBenefits.map((benefit, index) => (
              <div key={index} className="benefit-item">
                <div className="benefit-check">✓</div>
                <div className="benefit-text">{benefit}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session Summary */}
      <div className="session-summary">
        <div className="summary-header">
          <div className="mentor-avatar">
            {sessionData?.mentorName?.charAt(0) || 'M'}
          </div>
          <div className="mentor-info">
            <h3>{sessionData?.mentorName || 'Elite Mentor'}</h3>
            <p className="mentor-title">Certified Personal Trainer</p>
          </div>
        </div>
        
        <div className="summary-details">
          <div className="summary-item">
            <span className="item-label">Session Type</span>
            <span className="item-value">{sessionData?.sessionType || 'Personal Training'}</span>
          </div>
          <div className="summary-item">
            <span className="item-label">Duration</span>
            <span className="item-value">{sessionData?.duration || '60 minutes'}</span>
          </div>
          <div className="summary-item">
            <span className="item-label">Date & Time</span>
            <span className="item-value">{sessionData?.dateTime || 'Tomorrow, 2:00 PM'}</span>
          </div>
          <div className="summary-item">
            <span className="item-label">Location</span>
            <span className="item-value">{sessionData?.location || 'Elite Fitness Center'}</span>
          </div>
        </div>

        <div className="total-amount">
          <span className="total-label">
            {paymentType === 'subscription' ? 'Monthly Total' : 'Session Total'}
          </span>
          <span className="total-price">
            ${paymentType === 'subscription' ? '199' : sessionData?.price || '75'}
          </span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="payment-methods-section">
        <h3 className="section-title">Select Payment Method</h3>
        <div className="payment-methods-grid">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`payment-method-card ${selectedMethod?.id === method.id ? 'selected' : ''}`}
              onClick={() => handleMethodSelect(method)}
            >
              <div className="payment-method-icon">{method.icon}</div>
              <div className="payment-method-name">{method.name}</div>
              <div className="payment-method-desc">{method.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Payment Form */}
      {selectedMethod?.id === 'stripe' && (
        <div className="payment-form-expanded">
          <h3 className="section-title">Card Details</h3>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Card Number</label>
              <input
                className="payment-input"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardData.cardNumber}
                onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Cardholder Name</label>
              <input
                className="payment-input"
                type="text"
                placeholder="John Doe"
                value={cardData.cardholderName}
                onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Expiry Date</label>
              <input
                className="payment-input"
                type="text"
                placeholder="MM/YY"
                value={cardData.expiryDate}
                onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label">CVV</label>
              <input
                className="payment-input"
                type="text"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => handleCardInputChange('cvv', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Trust Elements */}
      <div className="trust-elements">
        <div className="trust-badge">
          <span className="trust-icon">🔒</span>
          <span>SSL Encrypted</span>
        </div>
        <div className="trust-badge">
          <span className="trust-icon">✓</span>
          <span>Secure Checkout</span>
        </div>
        <div className="trust-badge">
          <span className="trust-icon">🛡️</span>
          <span>Protected by Stripe</span>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        className="confirm-payment-btn"
        disabled={!selectedMethod || isProcessing}
        onClick={handlePayment}
      >
        {isProcessing ? 'Processing...' : 'Confirm & Unlock LiftLink'}
      </button>
    </div>
  );
};

// Bookings Component
const BookingManagementView = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/api/bookings/my');
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading">Loading bookings...</div>;

  return (
    <div className="bookings">
      <div className="bookings-header">
        <h1>My Bookings 📅</h1>
        <p>Track your training sessions</p>
      </div>

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings yet. Book your first session!</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.booking_id} className="booking-card">
              <div className="booking-header">
                <h3>
                  {booking.trainer_name || booking.client_name}
                  <span className={`status-badge ${booking.status}`}>
                    {booking.status}
                  </span>
                </h3>
                <p className="booking-date">
                  {new Date(booking.session_date).toLocaleDateString()} at{' '}
                  {new Date(booking.session_date).toLocaleTimeString()}
                </p>
              </div>
              <div className="booking-details">
                <p>📍 {booking.gym_name || 'Gym location'}</p>
                <p>⏱️ {booking.duration_hours} hour(s)</p>
                <p>💰 ${booking.total_amount.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Alias for booking management
const BookingManagement = () => <MyBookings />;

// Progress Analytics Component with Advanced Data Visualization
const ProgressAnalyticsView = () => {
  const [progressData, setProgressData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showAddProgress, setShowAddProgress] = useState(false);
  const [newProgress, setNewProgress] = useState({
    weight: '',
    body_fat_percentage: '',
    muscle_mass: '',
    notes: ''
  });

  useEffect(() => {
    fetchProgressData();
    fetchAnalytics();
    fetchLeaderboard();
  }, []);

  const fetchProgressData = async () => {
    try {
      const response = await api.get('/api/progress/my');
      setProgressData(response.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/progress/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    setLoading(false);
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/api/progress/leaderboard');
      setLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleAddProgress = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/progress/add', {
        weight: parseFloat(newProgress.weight),
        body_fat_percentage: newProgress.body_fat_percentage ? parseFloat(newProgress.body_fat_percentage) : null,
        muscle_mass: newProgress.muscle_mass ? parseFloat(newProgress.muscle_mass) : null,
        notes: newProgress.notes
      });
      
      setNewProgress({ weight: '', body_fat_percentage: '', muscle_mass: '', notes: '' });
      setShowAddProgress(false);
      fetchProgressData();
      fetchAnalytics();
      alert('Progress entry added successfully!');
    } catch (error) {
      console.error('Error adding progress:', error);
      alert('Error adding progress entry');
    }
  };

  const SimpleLineChart = ({ data, dataKey, color }) => {
    if (!data || data.length === 0) return <div className="no-data">No data available</div>;

    const maxValue = Math.max(...data.map(d => d[dataKey]));
    const minValue = Math.min(...data.map(d => d[dataKey]));
    const range = maxValue - minValue;

    return (
      <div className="simple-chart">
        <div className="chart-container">
          <svg viewBox="0 0 400 200" className="chart-svg">
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="0"
                y1={i * 40}
                x2="400"
                y2={i * 40}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
            ))}
            
            {/* Data line */}
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="3"
              points={data.map((d, i) => {
                const x = (i / (data.length - 1)) * 400;
                const y = range > 0 ? 180 - ((d[dataKey] - minValue) / range) * 160 : 90;
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Area fill */}
            <polygon
              fill={`url(#gradient-${dataKey})`}
              points={
                data.map((d, i) => {
                  const x = (i / (data.length - 1)) * 400;
                  const y = range > 0 ? 180 - ((d[dataKey] - minValue) / range) * 160 : 90;
                  return `${x},${y}`;
                }).join(' ') + ' 400,180 0,180'
              }
            />
            
            {/* Data points */}
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * 400;
              const y = range > 0 ? 180 - ((d[dataKey] - minValue) / range) * 160 : 90;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>
        <div className="chart-labels">
          <span className="chart-min">{minValue.toFixed(1)}</span>
          <span className="chart-max">{maxValue.toFixed(1)}</span>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading analytics...</div>;

  return (
    <div className="progress-analytics">
      <div className="analytics-header">
        <h1>🔥 Progress Analytics</h1>
        <p>Track your transformation journey with real-time insights</p>
        <button 
          onClick={() => setShowAddProgress(true)}
          className="add-progress-btn"
        >
          + Add Progress Entry
        </button>
      </div>

      <div className="analytics-tabs">
        <button 
          className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          📊 Progress
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tree' ? 'active' : ''}`}
          onClick={() => setActiveTab('tree')}
        >
          🌳 My Tree
        </button>
        <button 
          className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          👥 Social
        </button>
      </div>

      {showAddProgress && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Progress Entry</h2>
              <button onClick={() => setShowAddProgress(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleAddProgress} className="progress-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Weight (kg/lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newProgress.weight}
                    onChange={(e) => setNewProgress({...newProgress, weight: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Body Fat % (optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newProgress.body_fat_percentage}
                    onChange={(e) => setNewProgress({...newProgress, body_fat_percentage: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Muscle Mass (optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newProgress.muscle_mass}
                    onChange={(e) => setNewProgress({...newProgress, muscle_mass: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newProgress.notes}
                  onChange={(e) => setNewProgress({...newProgress, notes: e.target.value})}
                  className="form-textarea"
                  placeholder="How are you feeling? Any observations..."
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">Save Progress</button>
                <button type="button" onClick={() => setShowAddProgress(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="analytics-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            {progressData?.stats && (
              <div className="stats-overview">
                <div className="stat-card-lg">
                  <div className="stat-icon">⚖️</div>
                  <div className="stat-content">
                    <div className="stat-value">{progressData.stats.total_weight_loss.toFixed(1)} kg</div>
                    <div className="stat-label">Total Weight Loss</div>
                    <div className="stat-change">
                      {progressData.stats.weight_change_percentage > 0 ? '📉' : '📈'} 
                      {Math.abs(progressData.stats.weight_change_percentage).toFixed(1)}% change
                    </div>
                  </div>
                </div>

                <div className="stat-card-lg">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-content">
                    <div className="stat-value">{progressData.stats.current_weight.toFixed(1)} kg</div>
                    <div className="stat-label">Current Weight</div>
                    <div className="stat-change">From {progressData.stats.starting_weight.toFixed(1)} kg</div>
                  </div>
                </div>

                <div className="stat-card-lg">
                  <div className="stat-icon">📅</div>
                  <div className="stat-content">
                    <div className="stat-value">{progressData.stats.days_tracked}</div>
                    <div className="stat-label">Days Tracked</div>
                    <div className="stat-change">{progressData.stats.total_entries} entries</div>
                  </div>
                </div>
              </div>
            )}

            {analytics?.trend_direction && (
              <div className="trend-insight">
                <h3>Current Trend</h3>
                <div className="trend-card">
                  <div className="trend-icon">
                    {analytics.trend_direction === 'losing' ? '📉' : 
                     analytics.trend_direction === 'gaining' ? '📈' : '➡️'}
                  </div>
                  <div className="trend-content">
                    <div className="trend-title">
                      You're {analytics.trend_direction} weight
                    </div>
                    <div className="trend-detail">
                      {Math.abs(analytics.recent_trend).toFixed(1)} kg change this week
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="trends-section">
            {analytics?.weekly_data && analytics.weekly_data.length > 0 ? (
              <div className="chart-section">
                <h3>Weight Trend (Weekly Average)</h3>
                <SimpleLineChart 
                  data={analytics.weekly_data}
                  dataKey="average_weight"
                  color="var(--accent-primary)"
                />
              </div>
            ) : (
              <div className="no-data-message">
                <div className="no-data-icon">📈</div>
                <h3>No trend data yet</h3>
                <p>Add more progress entries to see your weight trends</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="leaderboard-section">
            <h3>🏆 Weight Loss Leaderboard</h3>
            <div className="leaderboard-list">
              {leaderboard.map((user, index) => (
                <div key={index} className="leaderboard-item">
                  <div className="rank">
                    {index + 1 <= 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user.user_name}</div>
                    <div className="user-stats">
                      {user.days_tracked} days • {user.entries_count} entries
                    </div>
                  </div>
                  <div className="progress-stats">
                    <div className="weight-loss">{user.weight_loss.toFixed(1)} kg lost</div>
                    <div className="percentage">{user.weight_loss_percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            <h3>Progress History</h3>
            <div className="history-list">
              {progressData?.progress_entries?.map((entry, index) => (
                <div key={entry.progress_id} className="history-item">
                  <div className="history-date">
                    {new Date(entry.date_recorded).toLocaleDateString()}
                  </div>
                  <div className="history-content">
                    <div className="weight-entry">
                      <span className="weight-value">{entry.weight} kg</span>
                      {entry.body_fat_percentage && (
                        <span className="body-fat">{entry.body_fat_percentage}% BF</span>
                      )}
                    </div>
                    {entry.notes && (
                      <div className="entry-notes">{entry.notes}</div>
                    )}
                  </div>
                  {index === 0 && <div className="latest-badge">Latest</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboardView = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsResponse, usersResponse, trainersResponse, bookingsResponse, transactionsResponse] = 
        await Promise.all([
          api.get('/api/admin/stats'),
          api.get('/api/admin/users'),
          api.get('/api/admin/trainers'),
          api.get('/api/admin/bookings'),
          api.get('/api/admin/transactions')
        ]);

      setStats(statsResponse.data);
      setUsers(usersResponse.data.users);
      setTrainers(trainersResponse.data.trainers);
      setBookings(bookingsResponse.data.bookings);
      setTransactions(transactionsResponse.data.transactions);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🔥 Admin Dashboard</h1>
        <p>Platform Management & Analytics</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users ({stats?.total_users})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'trainers' ? 'active' : ''}`}
          onClick={() => setActiveTab('trainers')}
        >
          🏋️‍♂️ Trainers ({stats?.total_trainers})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          📅 Bookings ({stats?.total_bookings})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          💰 Transactions
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="admin-overview">
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="stat-number">{stats?.total_users || 0}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-number">{stats?.total_trainers || 0}</div>
                <div className="stat-label">Active Trainers</div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-number">{stats?.total_admins || 0}</div>
                <div className="stat-label">Admins</div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-number">{stats?.confirmed_bookings || 0}</div>
                <div className="stat-label">Confirmed Sessions</div>
              </div>
              <div className="admin-stat-card revenue">
                <div className="stat-number">${stats?.total_platform_revenue?.toFixed(2) || '0.00'}</div>
                <div className="stat-label">Platform Revenue</div>
              </div>
            </div>

            <div className="recent-activity">
              <h2>Recent Bookings</h2>
              <div className="activity-list">
                {stats?.recent_bookings?.map((booking, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-info">
                      <strong>{booking.user_name}</strong> booked session with <strong>{booking.trainer_name}</strong>
                      <div className="activity-meta">
                        ${booking.total_amount} • {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-users">
            <h2>All Users</h2>
            <div className="users-table">
              {users.map((user) => (
                <div key={user.user_id} className="user-row">
                  <div className="user-info">
                    <div className="user-avatar">{user.name?.charAt(0) || '👤'}</div>
                    <div className="user-details">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                      <small>Joined: {new Date(user.created_at).toLocaleDateString()}</small>
                    </div>
                  </div>
                  <div className="user-role">
                    <span className={`role-badge ${user.role}`}>
                      {user.role === 'admin' ? '👑 Admin' : 
                       user.role === 'trainer' ? '🏋️‍♂️ Trainer' : '👤 User'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trainers' && (
          <div className="admin-trainers">
            <h2>All Trainers</h2>
            <div className="trainers-grid">
              {trainers.map((trainer) => (
                <div key={trainer.trainer_id} className="admin-trainer-card">
                  <div className="trainer-header">
                    <div className="trainer-avatar">{trainer.user_info?.name?.charAt(0) || '🏋️‍♂️'}</div>
                    <div className="trainer-info">
                      <h4>{trainer.user_info?.name}</h4>
                      <p>{trainer.gym_name}</p>
                      <p className="trainer-rate">${trainer.hourly_rate}/hr</p>
                    </div>
                  </div>
                  <div className="trainer-stats">
                    <div className="stat">
                      <span className="stat-number">{trainer.booking_stats?.total_bookings || 0}</span>
                      <span className="stat-label">Total Bookings</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">{trainer.booking_stats?.confirmed_bookings || 0}</span>
                      <span className="stat-label">Confirmed</span>
                    </div>
                  </div>
                  <div className="trainer-specialties">
                    {(trainer.specialties || []).map((specialty, index) => (
                      <span key={index} className="specialty-tag">{specialty}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="admin-bookings">
            <h2>All Bookings</h2>
            <div className="bookings-table">
              {bookings.map((booking) => (
                <div key={booking.booking_id} className="booking-row">
                  <div className="booking-info">
                    <div className="booking-main">
                      <strong>{booking.user_name}</strong> → <strong>{booking.trainer_name}</strong>
                    </div>
                    <div className="booking-details">
                      <span>📅 {new Date(booking.session_date).toLocaleDateString()}</span>
                      <span>⏱️ {booking.duration_hours}h</span>
                      <span>💰 ${booking.total_amount}</span>
                    </div>
                  </div>
                  <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="admin-transactions">
            <h2>Payment Transactions</h2>
            <div className="transactions-table">
              {transactions.map((transaction) => (
                <div key={transaction.transaction_id} className="transaction-row">
                  <div className="transaction-info">
                    <div className="transaction-main">
                      <strong>{transaction.user_name}</strong>
                    </div>
                    <div className="transaction-details">
                      <span>💰 ${transaction.amount} {transaction.currency.toUpperCase()}</span>
                      <span>📅 {new Date(transaction.created_at).toLocaleDateString()}</span>
                      {transaction.booking_info && (
                        <span>🏋️‍♂️ with {transaction.booking_info.trainer_name}</span>
                      )}
                    </div>
                  </div>
                  <span className={`status-badge ${transaction.payment_status}`}>
                    {transaction.payment_status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Trainer Dashboard Component
const TrainerDashboardView = () => {
  const { userProfile } = useAuth();
  const [clients, setClients] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainerData();
  }, []);

  const fetchTrainerData = async () => {
    try {
      const [clientsResponse, scheduleResponse, statsResponse] = await Promise.all([
        api.get('/api/trainers/clients'),
        api.get('/api/trainers/schedule'),
        api.get('/api/trainers/stats')
      ]);
      
      setClients(clientsResponse.data.clients || []);
      setSchedule(scheduleResponse.data.schedule || []);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching trainer data:', error);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading">Loading trainer dashboard...</div>;

  return (
    <div className="trainer-dashboard">
      <div className="trainer-header">
        <h1>🏋️‍♂️ Trainer Hub</h1>
        <p>Manage your clients and schedule</p>
      </div>

      <div className="trainer-stats">
        <div className="stat-card">
          <div className="stat-number">{stats?.total_clients || 0}</div>
          <div className="stat-label">Active Clients</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.sessions_this_week || 0}</div>
          <div className="stat-label">Sessions This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">${stats?.earnings_this_month?.toFixed(2) || '0.00'}</div>
          <div className="stat-label">Monthly Earnings</div>
        </div>
      </div>

      <div className="trainer-sections">
        <div className="section">
          <h2>Upcoming Sessions</h2>
          <div className="schedule-list">
            {schedule.length === 0 ? (
              <p>No upcoming sessions scheduled.</p>
            ) : (
              schedule.map((session, index) => (
                <div key={index} className="session-card">
                  <div className="session-time">
                    {new Date(session.session_date).toLocaleDateString()} at{' '}
                    {new Date(session.session_date).toLocaleTimeString()}
                  </div>
                  <div className="session-client">{session.client_name}</div>
                  <div className="session-duration">{session.duration_hours}h</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="section">
          <h2>My Clients</h2>
          <div className="clients-list">
            {clients.length === 0 ? (
              <p>No clients yet.</p>
            ) : (
              clients.map((client) => (
                <div key={client.client_id} className="client-card">
                  <div className="client-avatar">{client.name?.charAt(0) || '👤'}</div>
                  <div className="client-info">
                    <h4>{client.name}</h4>
                    <p>{client.total_sessions} sessions completed</p>
                    <p>Last session: {new Date(client.last_session).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Tree Visualization Component
const TreeVisualization = () => {
  const { userProfile } = useAuth();
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddNode, setShowAddNode] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [newNodeData, setNewNodeData] = useState({
    node_type: 'goal',
    title: '',
    description: '',
    xp_reward: 0,
    coin_reward: 0
  });

  useEffect(() => {
    fetchTreeData();
  }, []);

  const fetchTreeData = async () => {
    try {
      const endpoint = userProfile?.role === 'trainer' 
        ? '/api/tree/trainer-impact' 
        : '/api/tree/my-tree';
      
      const response = await api.get(endpoint);
      setTreeData(response.data);
    } catch (error) {
      console.error('Error fetching tree data:', error);
    }
    setLoading(false);
  };

  const handleCreateNode = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/tree/create-node', {
        ...newNodeData,
        position: { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.8 + 0.1 }
      });
      
      setNewNodeData({
        node_type: 'goal',
        title: '',
        description: '',
        xp_reward: 0,
        coin_reward: 0
      });
      setShowAddNode(false);
      fetchTreeData();
      alert('New goal created on your tree!');
    } catch (error) {
      console.error('Error creating node:', error);
      alert('Error creating tree node');
    }
  };

  const handleCompleteNode = async (nodeId) => {
    try {
      await api.put(`/api/tree/update-node/${nodeId}`, {
        status: 'completed'
      });
      fetchTreeData();
      alert('🎉 Goal completed! XP and coins awarded!');
    } catch (error) {
      console.error('Error completing node:', error);
      alert('Error completing goal');
    }
  };

  const TreeNode = ({ node, x, y }) => {
    const isCompleted = node.status === 'completed';
    const isActive = node.status === 'active';
    
    return (
      <div
        className={`tree-node ${node.status}`}
        style={{
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          backgroundColor: node.color,
          opacity: isCompleted ? 0.8 : 1
        }}
        onClick={() => setSelectedNode(node)}
      >
        <div className="node-icon">{node.icon}</div>
        <div className="node-title">{node.title}</div>
        {isCompleted && <div className="completion-badge">✓</div>}
        {isActive && (
          <button 
            className="complete-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleCompleteNode(node.node_id);
            }}
          >
            Complete
          </button>
        )}
      </div>
    );
  };

  const TrainerImpactView = () => {
    if (!treeData) return null;

    return (
      <div className="trainer-impact-tree">
        <div className="impact-header">
          <h2>🌲 Your Training Impact Forest</h2>
          <div className="forest-stats">
            <div className="stat">
              <span className="stat-number">{treeData.total_clients}</span>
              <span className="stat-label">Clients Transformed</span>
            </div>
            <div className="stat">
              <span className="stat-number">{treeData.total_sessions_given}</span>
              <span className="stat-label">Sessions Given</span>
            </div>
            <div className="stat">
              <span className="stat-number">{Math.round(treeData.forest_health)}%</span>
              <span className="stat-label">Forest Health</span>
            </div>
          </div>
        </div>

        <div className="clients-forest">
          {(treeData.clients_impact || []).map((client, index) => (
            <div key={client.client_id} className="client-tree">
              <div className="client-header">
                <h3>{client.client_name}</h3>
                <div className="client-stats">
                  <span>{client.total_sessions} sessions</span>
                  <span>{client.nodes_completed}/{client.total_nodes} goals</span>
                  <span>{client.current_streak} day streak</span>
                </div>
              </div>
              
              <div className="mini-tree">
                {(client.recent_achievements || []).map((achievement, idx) => (
                  <div key={idx} className="mini-achievement">
                    {achievement.icon} {achievement.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading your tree...</div>;

  if (userProfile?.role === 'trainer') {
    return <TrainerImpactView />;
  }

  return (
    <div className="tree-visualization">
      <div className="tree-header">
        <h1>🌳 Your Progress Tree</h1>
        <p>Watch your fitness journey grow into a beautiful tree of achievements</p>
        
        <div className="tree-stats">
          <div className="stat">
            <span className="stat-number">{treeData?.total_nodes || 0}</span>
            <span className="stat-label">Total Goals</span>
          </div>
          <div className="stat">
            <span className="stat-number">{treeData?.completed_nodes || 0}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat">
            <span className="stat-number">{treeData?.tree_structure?.growth_points || 0}</span>
            <span className="stat-label">Growth Points</span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowAddNode(true)}
          className="add-goal-btn"
        >
          + Add New Goal
        </button>
      </div>

      <div className="tree-canvas">
        <div className="tree-trunk"></div>
        <div className="tree-branches">
          {treeData?.nodes?.map((node) => (
            <TreeNode
              key={node.node_id}
              node={node}
              x={node.position.x}
              y={node.position.y}
            />
          ))}
        </div>
        
        {treeData?.nodes?.length === 0 && (
          <div className="empty-tree">
            <div className="empty-tree-icon">🌱</div>
            <h3>Plant Your First Goal</h3>
            <p>Your fitness tree is waiting to grow. Add your first goal to get started!</p>
          </div>
        )}
      </div>

      {showAddNode && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>🎯 Add New Goal</h2>
              <button onClick={() => setShowAddNode(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleCreateNode} className="node-form">
              <div className="form-group">
                <label>Goal Type</label>
                <select
                  value={newNodeData.node_type}
                  onChange={(e) => setNewNodeData({...newNodeData, node_type: e.target.value})}
                  className="form-select"
                >
                  <option value="goal">🎯 Goal</option>
                  <option value="milestone">📍 Milestone</option>
                  <option value="achievement">🏆 Achievement</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newNodeData.title}
                  onChange={(e) => setNewNodeData({...newNodeData, title: e.target.value})}
                  className="form-input"
                  placeholder="e.g., Lose 10 lbs, Run 5K, Bench 200 lbs"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newNodeData.description}
                  onChange={(e) => setNewNodeData({...newNodeData, description: e.target.value})}
                  className="form-textarea"
                  placeholder="Describe your goal and how you'll achieve it..."
                  required
                />
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>XP Reward</label>
                  <input
                    type="number"
                    value={newNodeData.xp_reward}
                    onChange={(e) => setNewNodeData({...newNodeData, xp_reward: parseInt(e.target.value)})}
                    className="form-input"
                    min="0"
                    max="500"
                  />
                </div>
                <div className="form-group">
                  <label>Coin Reward</label>
                  <input
                    type="number"
                    value={newNodeData.coin_reward}
                    onChange={(e) => setNewNodeData({...newNodeData, coin_reward: parseInt(e.target.value)})}
                    className="form-input"
                    min="0"
                    max="1000"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-btn">Plant Goal 🌱</button>
                <button type="button" onClick={() => setShowAddNode(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedNode && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedNode.icon} {selectedNode.title}</h2>
              <button onClick={() => setSelectedNode(null)} className="close-btn">×</button>
            </div>
            <div className="node-details">
              <p>{selectedNode.description}</p>
              <div className="node-rewards">
                {selectedNode.xp_reward > 0 && (
                  <span className="reward">⚡ {selectedNode.xp_reward} XP</span>
                )}
                {selectedNode.coin_reward > 0 && (
                  <span className="reward">🪙 {selectedNode.coin_reward} Coins</span>
                )}
              </div>
              <div className="node-status">
                Status: <span className={`status ${selectedNode.status}`}>
                  {selectedNode.status === 'completed' ? '✅ Completed' : 
                   selectedNode.status === 'active' ? '🎯 Active' : '🔒 Locked'}
                </span>
              </div>
              {selectedNode.completion_date && (
                <div className="completion-date">
                  Completed: {new Date(selectedNode.completion_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Elite Connections Component (Replacing Social)
const SocialTracking = () => {
  const [connectionData, setConnectionData] = useState({
    innerCircle: [
      { id: 1, name: 'Marcus Kane', status: 'Currently training', streak: 28, prs: 12, totalLifts: '2.4K' },
      { id: 2, name: 'Sarah Chen', status: 'Rest day', streak: 21, prs: 8, totalLifts: '1.8K' },
      { id: 3, name: 'Alex Rivera', status: 'Post-workout', streak: 45, prs: 15, totalLifts: '3.1K' },
      { id: 4, name: 'Jordan Blake', status: 'Pre-workout', streak: 12, prs: 6, totalLifts: '1.2K' },
      { id: 5, name: 'Riley Stone', status: 'Currently training', streak: 33, prs: 10, totalLifts: '2.7K' }
    ],
    realtimeActivity: [
      { member: 'Marcus Kane', action: 'deadlifted 405 lbs', time: '2 min ago', avatar: 'M' },
      { member: 'Alex Rivera', action: 'completed 5K run', time: '8 min ago', avatar: 'A' },
      { member: 'Sarah Chen', action: 'hit new squat PR', time: '23 min ago', avatar: 'S' },
      { member: 'Riley Stone', action: 'started leg day', time: '35 min ago', avatar: 'R' }
    ]
  });

  return (
    <div className="connections-container">
      <div className="connections-header">
        <h1 className="connections-title">Elite Connections</h1>
        <p className="connections-subtitle">
          Your exclusive inner circle of elite performers. Real-time performance tracking for high-achievers only.
        </p>
      </div>

      <div className="connections-grid">
        {/* Inner Circle Leaderboard */}
        <div className="inner-circle">
          <div className="inner-circle-header">
            <h2 className="inner-circle-title">Inner Circle</h2>
            <span className="circle-stats">5 Elite Members</span>
          </div>
          
          <div className="leaderboard">
            {connectionData.innerCircle.map((member, index) => (
              <div key={member.id} className="leaderboard-entry">
                <div className={`rank-badge ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : 'other'}`}>
                  {index + 1}
                </div>
                <div className="member-info">
                  <div className="member-name">{member.name}</div>
                  <div className="member-status">{member.status}</div>
                </div>
                <div className="member-stats">
                  <div className="stat-item">
                    <span className="stat-value">{member.streak}</span>
                    <span className="stat-label">Streak</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{member.prs}</span>
                    <span className="stat-label">PRs</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{member.totalLifts}</span>
                    <span className="stat-label">Total</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Activity */}
        <div className="realtime-activity">
          <div className="activity-header">
            <h2 className="activity-title">Live Activity</h2>
            <div className="live-indicator"></div>
          </div>
          
          <div className="activity-list">
            {connectionData.realtimeActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-avatar">{activity.avatar}</div>
                <div className="activity-content">
                  <div className="activity-member">{activity.member}</div>
                  <div className="activity-description">{activity.action}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Rings */}
      <div className="progress-rings">
        <div className="rings-header">
          <h2 className="rings-title">Performance Metrics</h2>
          <p className="rings-subtitle">Your elite performance indicators</p>
        </div>
        
        <div className="rings-grid">
          <div className="progress-ring-card">
            <div className="progress-ring">
              <svg width="120" height="120">
                <circle cx="60" cy="60" r="40" className="ring-background" />
                <circle cx="60" cy="60" r="40" className="ring-progress" />
              </svg>
              <div className="ring-center">
                <span className="ring-value">92</span>
                <span className="ring-unit">%</span>
              </div>
            </div>
            <div className="ring-label">Weekly Goal</div>
            <div className="ring-subtitle">4.6K / 5K target</div>
          </div>
          
          <div className="progress-ring-card">
            <div className="progress-ring">
              <svg width="120" height="120">
                <circle cx="60" cy="60" r="40" className="ring-background" />
                <circle cx="60" cy="60" r="40" className="ring-progress" />
              </svg>
              <div className="ring-center">
                <span className="ring-value">28</span>
                <span className="ring-unit">days</span>
              </div>
            </div>
            <div className="ring-label">Current Streak</div>
            <div className="ring-subtitle">Personal best</div>
          </div>
          
          <div className="progress-ring-card">
            <div className="progress-ring">
              <svg width="120" height="120">
                <circle cx="60" cy="60" r="40" className="ring-background" />
                <circle cx="60" cy="60" r="40" className="ring-progress" />
              </svg>
              <div className="ring-center">
                <span className="ring-value">15</span>
                <span className="ring-unit">PRs</span>
              </div>
            </div>
            <div className="ring-label">This Month</div>
            <div className="ring-subtitle">+3 from last month</div>
          </div>
        </div>
      </div>

      {/* Exclusive Invite Section */}
      <div className="invite-section">
        <h2 className="invite-title">Expand Your Circle</h2>
        <p className="invite-description">
          Invite elite performers to join your exclusive network. Access is by invitation only.
        </p>
        <button className="invite-btn">Send Elite Invitation</button>
      </div>
    </div>
  );
};

// Settings Component
const Settings = () => {
  const { logout } = useAuth();
  
  return (
    <div className="settings-container fade-in-up">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <p className="text-secondary">Manage your account preferences and settings</p>
      </div>

      <div className="settings-grid">
        <div className="settings-card card">
          <div className="card-header">
            <h3 className="card-title">Account</h3>
            <p className="card-subtitle">Manage your account settings</p>
          </div>
          <div className="card-body">
            <div className="settings-group">
              <button 
                onClick={logout}
                className="settings-btn logout-btn"
              >
                <span className="btn-icon">🚪</span>
                <div className="btn-content">
                  <span className="btn-title">Logout</span>
                  <span className="btn-subtitle">Sign out of your account</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="settings-card card">
          <div className="card-header">
            <h3 className="card-title">Privacy & Legal</h3>
            <p className="card-subtitle">Review our policies and terms</p>
          </div>
          <div className="card-body">
            <div className="settings-group">
              <div className="settings-item">
                <span className="item-icon">📄</span>
                <div className="item-content">
                  <span className="item-title">Terms & Conditions</span>
                  <span className="item-subtitle">Review our terms of service</span>
                </div>
                <button className="item-action btn-soft">View</button>
              </div>
              
              <div className="settings-item">
                <span className="item-icon">🔒</span>
                <div className="item-content">
                  <span className="item-title">Privacy Policy</span>
                  <span className="item-subtitle">Understand how we protect your data</span>
                </div>
                <button className="item-action btn-soft">View</button>
              </div>
              
              <div className="settings-item">
                <span className="item-icon">🛡️</span>
                <div className="item-content">
                  <span className="item-title">Safety Guidelines</span>
                  <span className="item-subtitle">Learn about our safety measures</span>
                </div>
                <button className="item-action btn-soft">View</button>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card card">
          <div className="card-header">
            <h3 className="card-title">App Information</h3>
            <p className="card-subtitle">Learn more about LiftLink</p>
          </div>
          <div className="card-body">
            <div className="settings-group">
              <div className="app-info">
                <div className="app-logo">
                  <span className="logo-icon">💪</span>
                  <span className="logo-text">LiftLink</span>
                </div>
                <p className="app-tagline">Transform Your Body, Transform Your Life</p>
                <div className="app-version">Version 2.0.0</div>
              </div>
              
              <div className="faith-message">
                <h4>Our Mission</h4>
                <p>
                  LiftLink is built on the foundation of hope, growth, and community. 
                  We believe that every fitness journey is a path of personal transformation, 
                  guided by faith and supported by others who share the same vision of becoming 
                  the best version of ourselves.
                </p>
                <p>
                  "She is clothed with strength and dignity; she can laugh at the days to come." 
                  - Proverbs 31:25
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// FitnessForest Component (renamed from TreeVisualization)
const FitnessForestView = () => {
  const { userProfile } = useAuth();
  const [forestData, setForestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddNode, setShowAddNode] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [newNodeData, setNewNodeData] = useState({
    node_type: 'goal',
    title: '',
    description: '',
    xp_reward: 0,
    coin_reward: 0
  });

  useEffect(() => {
    fetchForestData();
  }, []);

  const fetchForestData = async () => {
    try {
      const endpoint = userProfile?.role === 'trainer' 
        ? '/api/tree/trainer-impact' 
        : '/api/tree/my-tree';
      
      const response = await api.get(endpoint);
      setForestData(response.data);
    } catch (error) {
      console.error('Error fetching forest data:', error);
    }
    setLoading(false);
  };

  const handleCreateNode = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/tree/create-node', {
        ...newNodeData,
        position: { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.8 + 0.1 }
      });
      
      setNewNodeData({
        node_type: 'goal',
        title: '',
        description: '',
        xp_reward: 0,
        coin_reward: 0
      });
      setShowAddNode(false);
      fetchForestData();
      alert('New goal planted in your FitnessForest!');
    } catch (error) {
      console.error('Error creating node:', error);
      alert('Error planting new goal');
    }
  };

  const handleCompleteNode = async (nodeId) => {
    try {
      await api.put(`/api/tree/update-node/${nodeId}`, {
        status: 'completed'
      });
      fetchForestData();
      alert('🎉 Goal completed! Your forest grows stronger!');
    } catch (error) {
      console.error('Error completing node:', error);
      alert('Error completing goal');
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Growing your FitnessForest...</p>
      </div>
    </div>
  );

  return (
    <div className="fitness-forest fade-in-up">
      <div className="forest-header">
        <h1>🌳 Your FitnessForest</h1>
        <p className="text-secondary">
          Watch your fitness journey bloom into a beautiful forest of achievements
        </p>
        
        <div className="forest-stats">
          <div className="stat-card">
            <span className="stat-number">{forestData?.total_nodes || 0}</span>
            <span className="stat-label">Goals Planted</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{forestData?.completed_nodes || 0}</span>
            <span className="stat-label">Goals Bloomed</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{forestData?.tree_structure?.growth_points || 0}</span>
            <span className="stat-label">Growth Points</span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowAddNode(true)}
          className="btn-primary add-goal-btn"
        >
          🌱 Plant New Goal
        </button>
      </div>

      <div className="forest-canvas">
        <div className="forest-background">
          <div className="forest-ground"></div>
          <div className="forest-sky"></div>
        </div>
        
        <div className="forest-trees">
          {forestData?.nodes?.map((node, index) => (
            <div
              key={node.node_id}
              className={`forest-node ${node.status} stagger`}
              style={{
                left: `${node.position.x * 100}%`,
                top: `${node.position.y * 100}%`,
                animationDelay: `${index * 0.1}s`
              }}
              onClick={() => setSelectedNode(node)}
            >
              <div className="node-icon">{node.icon}</div>
              <div className="node-title">{node.title}</div>
              {node.status === 'completed' && (
                <div className="completion-glow"></div>
              )}
              {node.status === 'active' && (
                <button 
                  className="complete-btn btn-soft"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompleteNode(node.node_id);
                  }}
                >
                  Complete
                </button>
              )}
            </div>
          ))}
        </div>
        
        {(!forestData?.nodes || forestData.nodes.length === 0) && (
          <div className="empty-forest">
            <div className="empty-forest-icon">🌱</div>
            <h3>Plant Your First Goal</h3>
            <p>Your FitnessForest is waiting to grow. Add your first goal to begin your journey!</p>
            <button 
              onClick={() => setShowAddNode(true)}
              className="btn-primary"
            >
              🌱 Plant First Goal
            </button>
          </div>
        )}
      </div>

      {/* Add Node Modal */}
      {showAddNode && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>🌱 Plant New Goal</h2>
              <button onClick={() => setShowAddNode(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleCreateNode} className="node-form">
              <div className="form-group">
                <label className="form-label">Goal Type</label>
                <select
                  value={newNodeData.node_type}
                  onChange={(e) => setNewNodeData({...newNodeData, node_type: e.target.value})}
                  className="form-select"
                >
                  <option value="goal">🎯 Goal</option>
                  <option value="milestone">📍 Milestone</option>
                  <option value="achievement">🏆 Achievement</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={newNodeData.title}
                  onChange={(e) => setNewNodeData({...newNodeData, title: e.target.value})}
                  className="form-input"
                  placeholder="e.g., Lose 10 lbs, Run 5K, Bench 200 lbs"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={newNodeData.description}
                  onChange={(e) => setNewNodeData({...newNodeData, description: e.target.value})}
                  className="form-textarea"
                  placeholder="Describe your goal and how you'll achieve it..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">XP Reward</label>
                  <input
                    type="number"
                    value={newNodeData.xp_reward}
                    onChange={(e) => setNewNodeData({...newNodeData, xp_reward: parseInt(e.target.value)})}
                    className="form-input"
                    min="0"
                    max="500"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Coin Reward</label>
                  <input
                    type="number"
                    value={newNodeData.coin_reward}
                    onChange={(e) => setNewNodeData({...newNodeData, coin_reward: parseInt(e.target.value)})}
                    className="form-input"
                    min="0"
                    max="1000"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">Plant Goal 🌱</button>
                <button type="button" onClick={() => setShowAddNode(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Node Details Modal */}
      {selectedNode && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedNode.icon} {selectedNode.title}</h2>
              <button onClick={() => setSelectedNode(null)} className="close-btn">×</button>
            </div>
            <div className="node-details">
              <p className="text-secondary">{selectedNode.description}</p>
              
              {(selectedNode.xp_reward > 0 || selectedNode.coin_reward > 0) && (
                <div className="node-rewards">
                  {selectedNode.xp_reward > 0 && (
                    <span className="reward-badge">⚡ {selectedNode.xp_reward} XP</span>
                  )}
                  {selectedNode.coin_reward > 0 && (
                    <span className="reward-badge">🪙 {selectedNode.coin_reward} Coins</span>
                  )}
                </div>
              )}
              
              <div className="node-status">
                <span className="status-label">Status:</span>
                <span className={`status-badge ${selectedNode.status}`}>
                  {selectedNode.status === 'completed' ? '✅ Completed' : 
                   selectedNode.status === 'active' ? '🎯 Active' : '🔒 Locked'}
                </span>
              </div>
              
              {selectedNode.completion_date && (
                <div className="completion-info">
                  <span className="completion-label">Completed:</span>
                  <span className="completion-date">
                    {new Date(selectedNode.completion_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const Profile = () => {
  const { userProfile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isTrainerRegistration, setIsTrainerRegistration] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    gym: ''
  });
  const [trainerData, setTrainerData] = useState({
    bio: '',
    specialties: [],
    hourly_rate: '',
    gym_name: '',
    experience_years: '',
    certifications: []
  });

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        gym: userProfile.gym || ''
      });
    }
  }, [userProfile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/users/profile', profileData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handleTrainerRegistration = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/trainers/register', {
        ...trainerData,
        specialties: trainerData.specialties.filter(s => s.trim()),
        hourly_rate: parseFloat(trainerData.hourly_rate),
        experience_years: parseInt(trainerData.experience_years),
        location: { lat: 40.7128, lng: -74.0060 } // Default to NYC
      });
      setIsTrainerRegistration(false);
      alert('Trainer registration successful!');
      window.location.reload();
    } catch (error) {
      console.error('Error registering trainer:', error);
      alert('Error registering as trainer');
    }
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {userProfile?.name?.charAt(0) || '👤'}
        </div>
        <div className="profile-info">
          <h1>{userProfile?.name}</h1>
          <p>{user?.email}</p>
          <span className={`role-badge ${userProfile?.role || 'user'}`}>
            {userProfile?.role === 'trainer' ? '🏋️‍♂️ Trainer' : '💪 Member'}
          </span>
        </div>
      </div>

      <div className="profile-content">
        {isEditing ? (
          <form onSubmit={handleProfileUpdate} className="profile-form">
            <h2>Edit Profile</h2>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Gym</label>
              <input
                type="text"
                value={profileData.gym}
                onChange={(e) => setProfileData({...profileData, gym: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        ) : isTrainerRegistration ? (
          <form onSubmit={handleTrainerRegistration} className="trainer-form">
            <h2>Become a Trainer 🎯</h2>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={trainerData.bio}
                onChange={(e) => setTrainerData({...trainerData, bio: e.target.value})}
                className="form-textarea"
                placeholder="Tell us about your training philosophy..."
                required
              />
            </div>
            <div className="form-group">
              <label>Specialties (comma separated)</label>
              <input
                type="text"
                value={(trainerData.specialties || []).join(', ')}
                onChange={(e) => setTrainerData({...trainerData, specialties: e.target.value.split(',').map(s => s.trim())})}
                className="form-input"
                placeholder="Weight Training, Cardio, Yoga..."
                required
              />
            </div>
            <div className="form-group">
              <label>Hourly Rate ($)</label>
              <input
                type="number"
                value={trainerData.hourly_rate}
                onChange={(e) => setTrainerData({...trainerData, hourly_rate: e.target.value})}
                className="form-input"
                placeholder="50"
                required
              />
            </div>
            <div className="form-group">
              <label>Gym Name</label>
              <input
                type="text"
                value={trainerData.gym_name}
                onChange={(e) => setTrainerData({...trainerData, gym_name: e.target.value})}
                className="form-input"
                placeholder="Your gym name"
                required
              />
            </div>
            <div className="form-group">
              <label>Years of Experience</label>
              <input
                type="number"
                value={trainerData.experience_years}
                onChange={(e) => setTrainerData({...trainerData, experience_years: e.target.value})}
                className="form-input"
                placeholder="5"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">Register as Trainer</button>
              <button type="button" onClick={() => setIsTrainerRegistration(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-display">
            <div className="profile-section">
              <h2>Personal Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Name</label>
                  <span>{userProfile?.name || 'Not set'}</span>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <span>{user?.email}</span>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <span>{userProfile?.phone || 'Not set'}</span>
                </div>
                <div className="info-item">
                  <label>Gym</label>
                  <span>{userProfile?.gym || 'Not set'}</span>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button onClick={() => setIsEditing(true)} className="edit-btn">
                Edit Profile
              </button>
              {userProfile?.role !== 'trainer' && (
                <button onClick={() => setIsTrainerRegistration(true)} className="trainer-btn">
                  Become a Trainer 🚀
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Inner App Component (inside AuthProvider)
const AppContent = () => {
  const [currentView, setCurrentView] = useState('home');
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, userProfile, loading: authLoading, login, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (error) {
      setError(error.message);
    }
    
    setLoading(false);
  };

  const onToggle = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  const searchTrainers = (query) => {
    setSearchQuery(query);
    setCurrentView('trainers');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <ProfessionalHome 
            setCurrentView={setCurrentView} 
            userProfile={userProfile}
            searchTrainers={searchTrainers}
          />
        );
      case 'trainers':
        return (
          <ProfessionalTrainerSearch 
            searchQuery={searchQuery}
            userProfile={userProfile}
          />
        );
      case 'bookings':
        return <BookingManagement />;
      case 'messages':
        return <MessagesView />;
      case 'profile':
        return <Profile />;
      case 'fitness-forest':
        return <FitnessForest userProfile={userProfile} />;
      case 'analytics':
        return <ProgressAnalytics userProfile={userProfile} />;
      case 'social':
        return <SocialHub userProfile={userProfile} />;
      case 'achievements':
        return <AchievementsView userProfile={userProfile} />;
      case 'settings':
        return <Settings />;
      case 'help':
        return <HelpSupport />;
      case 'trainer-dashboard':
        return <TrainerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <ProfessionalHome 
            setCurrentView={setCurrentView} 
            userProfile={userProfile}
            searchTrainers={searchTrainers}
          />
        );
    }
  };
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <h2>LiftLink</h2>
          <p>Building your fitness journey...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-content">
          <div className="auth-header">
            <div className="elite-logo">
              <span className="elite-logo-icon">💪</span>
              <span className="elite-logo-text">LiftLink</span>
            </div>
            <p className="elite-tagline">Elite Fitness Network</p>
          </div>
          
          {authMode === 'login' ? (
            <div className="auth-form">
              <div className="form-group">
                <input
                  type="email"
                  placeholder="ACCESS EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="elite-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="SECURITY CODE"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="elite-input"
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button type="submit" disabled={loading} className="elite-submit-btn" onClick={handleSubmit}>
                {loading ? 'LOGGING IN...' : 'LOG IN'}
              </button>
              
              <div className="form-toggle">
                <span>
                  Need an account?{' '}
                  <button type="button" onClick={onToggle} className="toggle-btn">
                    Sign Up
                  </button>
                </span>
              </div>
            </div>
          ) : (
            <RegistrationForm onToggle={onToggle} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="professional-app">
      {/* Sidebar Navigation */}
      <ProfessionalSidebar 
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        setCurrentView={setCurrentView}
        userProfile={userProfile}
        logout={logout}
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
            {userProfile?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{
        marginTop: '60px',
        minHeight: 'calc(100vh - 60px)',
        paddingBottom: '80px'
      }}>
        {renderCurrentView()}
      </main>

      {/* Bottom Navigation */}
      <ProfessionalNavigation 
        currentView={currentView}
        setCurrentView={setCurrentView}
        userProfile={userProfile}
        toggleSidebar={toggleSidebar}
      />
    </div>
  );
};

// Main App Component - Modern Adonis-inspired Design

// Modern Profile Screen Component (Adonis-inspired)
const ModernProfileScreen = ({ setCurrentView, user }) => {
  const [profile, setProfile] = useState(user);
  const [editing, setEditing] = useState(false);

  const profileSections = [
    { id: 'personal', icon: '👤', title: 'Personal Info', desc: 'Name, email, phone' },
    { id: 'fitness', icon: '💪', title: 'Fitness Goals', desc: 'Goals, preferences, level' },
    { id: 'payment', icon: '💳', title: 'Payment Methods', desc: 'Cards, billing info' },
    { id: 'notifications', icon: '🔔', title: 'Notifications', desc: 'Email, push, SMS' },
    { id: 'privacy', icon: '🔒', title: 'Privacy & Security', desc: 'Password, 2FA, data' },
    { id: 'help', icon: '❓', title: 'Help & Support', desc: 'FAQ, contact, feedback' }
  ];

  return (
    <div className="main-content">
      {/* Profile Header */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <img
            src={profile?.profileImage || `https://ui-avatars.com/api/?name=${profile?.name}&background=6366F1&color=fff`}
            alt={profile?.name}
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '16px', 
              objectFit: 'cover' 
            }}
          />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-primary mb-1">{profile?.name}</h2>
            <div className="text-secondary mb-2">{profile?.email}</div>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-medium">Level:</span>
                <span className="text-brand-primary ml-1">{profile?.level || 1}</span>
              </div>
              <div>
                <span className="font-medium">LiftCoins:</span>
                <span className="text-brand-accent ml-1">{profile?.lift_coins || 0}</span>
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm">Edit</button>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="space-y-3">
        {profileSections.map(section => (
          <div key={section.id} className="card cursor-pointer hover:bg-background-secondary">
            <div className="flex items-center gap-4">
              <div className="text-2xl">{section.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-primary">{section.title}</div>
                <div className="text-sm text-muted">{section.desc}</div>
              </div>
              <div className="text-muted">›</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 space-y-3">
        <button className="btn btn-secondary w-full justify-start">
          📊 Progress Analytics
        </button>
        <button className="btn btn-secondary w-full justify-start">
          🌳 Fitness Forest
        </button>
        <button className="btn btn-secondary w-full justify-start">
          👥 Social Features
        </button>
        <button className="btn btn-secondary w-full justify-start text-brand-danger">
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
};

// Modern Profile Screen Component (Adonis-inspired)
const MessagesPlaceholder = ({ setCurrentView, user }) => {
  return (
    <div className="main-content">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Messages</h1>
        <p className="text-secondary">Chat with your trainers</p>
      </div>
      
      <div className="card text-center py-12">
        <div className="text-4xl mb-4">💬</div>
        <h3 className="text-lg font-semibold mb-2">Messages Coming Soon</h3>
        <p className="text-muted mb-4">Direct messaging with trainers will be available soon!</p>
        <button 
          className="btn btn-primary"
          onClick={() => setCurrentView('search')}
        >
          Find a Trainer
        </button>
      </div>
    </div>
  );
};

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

// Auth Handler Component - Legacy (Remove if not used)
const AuthHandler = ({ setCurrentView }) => {
  const { user, loading } = useAuth();
  const [view, setView] = useState('home');
  const [authMode, setAuthMode] = useState('login');

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo-container">
          <div className="logo-large">
            <span className="logo-lift">Lift</span>
            <span className="logo-link">Link</span>
          </div>
          <div className="tagline-large">Beginners to Believers</div>
          <div className="subtitle">Your fitness journey starts here</div>
        </div>
        <div className="loading-text">Loading your fitness journey...</div>
        <div className="loading-progress">
          <div className="progress-bar"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-container">
        {authMode === 'login' ? (
          <LoginForm onToggle={() => setAuthMode('register')} />
        ) : (
          <RegistrationForm onToggle={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'home':
        return <HomeDashboard setCurrentView={setView} />;
      case 'trainers':
        return <TrainerSearch />;
      case 'bookings':
        return <MyBookings />;
      case 'progress':
        return <ProgressAnalytics />;
      case 'tree':
        return <TreeVisualization />;
      case 'social':
        return <SocialTracking />;
      case 'admin':
        return <AdminDashboard />;
      case 'profile':
        return <Profile />;
      default:
        return <HomeDashboard setCurrentView={setView} />;
    }
  };

  return (
    <div className="professional-app">
      {/* Sidebar Navigation */}
      <ProfessionalSidebar 
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        setCurrentView={setCurrentView}
        userProfile={userProfile}
        logout={logout}
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
            {userProfile?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{
        marginTop: '60px',
        minHeight: 'calc(100vh - 60px)',
        paddingBottom: '80px'
      }}>
        {renderCurrentView()}
      </main>

      {/* Bottom Navigation */}
      <ProfessionalNavigation 
        currentView={currentView}
        setCurrentView={setCurrentView}
        userProfile={userProfile}
        toggleSidebar={toggleSidebar}
      />
    </div>
  );
};

export default App;
