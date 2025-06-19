import React, { useState, useEffect, useContext, createContext } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Context for theme and user
const AppContext = createContext();

// LiftLink Logo Component
const LiftLinkLogo = ({ size = 60 }) => (
  <div className={`flex items-center space-x-3`}>
    <div className="relative">
      <svg width={size} height={size * 0.4} viewBox="0 0 400 160" className="cyberpunk-glow">
        {/* Barbell */}
        <rect x="50" y="70" width="300" height="20" rx="10" fill="#C4D600" />
        <rect x="30" y="55" width="30" height="50" rx="8" fill="#FFD700" />
        <rect x="340" y="55" width="30" height="50" rx="8" fill="#FFD700" />
        
        {/* Weight plates */}
        <rect x="20" y="45" width="20" height="70" rx="10" fill="#E0E0E0" />
        <rect x="360" y="45" width="20" height="70" rx="10" fill="#E0E0E0" />
        <rect x="10" y="35" width="20" height="90" rx="10" fill="#B0B0B0" />
        <rect x="370" y="35" width="20" height="90" rx="10" fill="#B0B0B0" />
      </svg>
    </div>
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
        LiftLink
      </h1>
      <p className="text-xs text-gray-400">Beginners to Believers</p>
    </div>
  </div>
);

// Tree SVG Components
const TreeSVG = ({ level, size = 100 }) => {
  const treeConfigs = {
    seed: {
      color: "#8B4513",
      svg: (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle cx="50" cy="80" r="8" fill="#8B4513" />
          <circle cx="50" cy="75" r="3" fill="#C4D600" />
        </svg>
      )
    },
    sprout: {
      color: "#C4D600",
      svg: (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <rect x="48" y="70" width="4" height="20" fill="#8B4513" />
          <path d="M45 70 Q50 60 55 70" fill="#C4D600" />
          <path d="M42 72 Q50 62 58 72" fill="#90EE90" />
        </svg>
      )
    },
    sapling: {
      color: "#90EE90",
      svg: (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <rect x="47" y="60" width="6" height="30" fill="#8B4513" />
          <circle cx="50" cy="55" r="12" fill="#90EE90" />
          <circle cx="45" cy="50" r="8" fill="#C4D600" />
          <circle cx="55" cy="50" r="8" fill="#C4D600" />
        </svg>
      )
    },
    young_tree: {
      color: "#228B22",
      svg: (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <rect x="45" y="50" width="10" height="40" fill="#8B4513" />
          <circle cx="50" cy="45" r="18" fill="#228B22" />
          <circle cx="38" cy="40" r="12" fill="#90EE90" />
          <circle cx="62" cy="40" r="12" fill="#90EE90" />
          <circle cx="50" cy="30" r="10" fill="#C4D600" />
        </svg>
      )
    },
    mature_tree: {
      color: "#006400",
      svg: (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <rect x="43" y="45" width="14" height="45" fill="#8B4513" />
          <circle cx="50" cy="40" r="22" fill="#006400" />
          <circle cx="32" cy="35" r="15" fill="#228B22" />
          <circle cx="68" cy="35" r="15" fill="#228B22" />
          <circle cx="50" cy="25" r="12" fill="#90EE90" />
          <circle cx="40" cy="20" r="8" fill="#C4D600" />
          <circle cx="60" cy="20" r="8" fill="#C4D600" />
        </svg>
      )
    },
    strong_oak: {
      color: "#004225",
      svg: (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <rect x="40" y="40" width="20" height="50" fill="#8B4513" />
          <circle cx="50" cy="35" r="28" fill="#004225" />
          <circle cx="28" cy="30" r="18" fill="#006400" />
          <circle cx="72" cy="30" r="18" fill="#006400" />
          <circle cx="50" cy="18" r="15" fill="#228B22" />
          <circle cx="35" cy="15" r="10" fill="#90EE90" />
          <circle cx="65" cy="15" r="10" fill="#90EE90" />
        </svg>
      )
    },
    mighty_pine: {
      color: "#003d00",
      svg: (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <rect x="47" y="35" width="6" height="55" fill="#8B4513" />
          <polygon points="50,10 35,30 65,30" fill="#003d00" />
          <polygon points="50,20 30,40 70,40" fill="#004225" />
          <polygon points="50,30 25,50 75,50" fill="#006400" />
          <polygon points="50,40 20,60 80,60" fill="#228B22" />
        </svg>
      )
    },
    ancient_elm: {
      color: "#002d00",
      svg: (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <rect x="35" y="30" width="30" height="60" fill="#654321" />
          <circle cx="50" cy="25" r="35" fill="#002d00" />
          <circle cx="25" cy="20" r="22" fill="#003d00" />
          <circle cx="75" cy="20" r="22" fill="#003d00" />
          <circle cx="50" cy="8" r="18" fill="#004225" />
          <circle cx="30" cy="5" r="12" fill="#006400" />
          <circle cx="70" cy="5" r="12" fill="#006400" />
        </svg>
      )
    },
    giant_sequoia: {
      color: "#001a00",
      svg: (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <rect x="30" y="25" width="40" height="65" fill="#654321" />
          <circle cx="50" cy="20" r="40" fill="#001a00" />
          <circle cx="20" cy="15" r="25" fill="#002d00" />
          <circle cx="80" cy="15" r="25" fill="#002d00" />
          <circle cx="50" cy="5" r="20" fill="#003d00" />
          <circle cx="25" cy="2" r="15" fill="#004225" />
          <circle cx="75" cy="2" r="15" fill="#004225" />
        </svg>
      )
    },
    redwood: {
      color: "#000d00",
      svg: (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <rect x="25" y="20" width="50" height="70" fill="#8B4513" />
          <circle cx="50" cy="15" r="45" fill="#000d00" />
          <circle cx="15" cy="10" r="28" fill="#001a00" />
          <circle cx="85" cy="10" r="28" fill="#001a00" />
          <circle cx="50" cy="2" r="22" fill="#002d00" />
          <circle cx="20" cy="0" r="18" fill="#003d00" />
          <circle cx="80" cy="0" r="18" fill="#003d00" />
          <circle cx="50" cy="18" r="8" fill="#FFD700" />
        </svg>
      )
    }
  };

  return (
    <div className="tree-container animate-pulse-glow">
      {treeConfigs[level]?.svg || treeConfigs.seed.svg}
    </div>
  );
};

// LiftCoin Component
const LiftCoin = ({ count, animate = false }) => (
  <div className={`flex items-center space-x-2 ${animate ? 'animate-bounce' : ''}`}>
    <svg width="24" height="24" viewBox="0 0 24 24" className="animate-spin-slow">
      <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#FFA500" strokeWidth="2"/>
      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#000">L</text>
    </svg>
    <span className="text-yellow-400 font-bold">{count}</span>
  </div>
);

// Navigation Component
const Navigation = ({ activeTab, setActiveTab, darkMode }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'tree', label: 'My Tree', icon: '🌳' },
    { id: 'trainers', label: 'Find Trainers', icon: '💪' },
    { id: 'sessions', label: 'Sessions', icon: '📊' },
    { id: 'rewards', label: 'Rewards', icon: '🏆' },
    { id: 'social', label: 'Friends', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className={`fixed left-0 top-0 h-full w-64 ${darkMode ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-md border-r ${darkMode ? 'border-green-400/30' : 'border-gray-200'} z-40 transition-all duration-300`}>
      <div className="p-4">
        <LiftLinkLogo />
      </div>
      
      <div className="px-4 space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === item.id 
                ? (darkMode ? 'bg-green-900/50 text-green-400 border border-green-400/50' : 'bg-blue-100 text-blue-600 border border-blue-300')
                : (darkMode ? 'text-gray-300 hover:bg-gray-800/50' : 'text-gray-600 hover:bg-gray-100')
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// Google Maps Component
const GoogleMap = ({ trainers = [] }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  
  useEffect(() => {
    if (!window.google && GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'demo_key_replace_with_real_key') {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (mapLoaded && window.google) {
      const map = new window.google.maps.Map(document.getElementById('trainer-map'), {
        center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
        zoom: 12,
        styles: [
          {
            featureType: "all",
            elementType: "all",
            stylers: [
              { saturation: -100 },
              { lightness: -20 }
            ]
          }
        ]
      });

      // Add sample trainer markers
      trainers.forEach((trainer, index) => {
        const marker = new window.google.maps.Marker({
          position: { 
            lat: 37.7749 + (Math.random() - 0.5) * 0.1, 
            lng: -122.4194 + (Math.random() - 0.5) * 0.1 
          },
          map: map,
          title: trainer.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#C4D600" stroke="#000" stroke-width="2"/>
                <text x="20" y="26" text-anchor="middle" font-size="20" fill="#000">💪</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-bold text-lg">${trainer.name}</h3>
              <p class="text-sm text-gray-600">${trainer.specialty}</p>
              <p class="text-sm">⭐ ${trainer.rating}/5.0</p>
              <p class="text-sm font-bold text-green-600">$${trainer.rate}/session</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });
    }
  }, [mapLoaded, trainers]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      {GOOGLE_MAPS_API_KEY === 'demo_key_replace_with_real_key' ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-2">🗺️ Map Preview</p>
            <p className="text-sm text-gray-500">Configure Google Maps API key to enable interactive map</p>
          </div>
        </div>
      ) : (
        <div id="trainer-map" className="w-full h-full"></div>
      )}
    </div>
  );
};

// Main App Sections
const Dashboard = ({ user, treeProgress, onCompleteSession }) => {
  const { darkMode } = useContext(AppContext);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Welcome back, {user.email.split('@')[0]}! 🚀
        </h1>
        <LiftCoin count={treeProgress?.lift_coins || 0} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${darkMode ? 'cyberpunk-card' : 'bg-white rounded-lg shadow-lg border border-gray-200'} p-6 text-center`}>
          <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            {treeProgress?.total_sessions || 0}
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Sessions</p>
        </div>
        <div className={`${darkMode ? 'cyberpunk-card' : 'bg-white rounded-lg shadow-lg border border-gray-200'} p-6 text-center`}>
          <div className={`text-3xl font-bold ${darkMode ? 'text-yellow-400' : 'text-orange-600'}`}>
            {treeProgress?.consistency_streak || 0}
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Streak Days</p>
        </div>
        <div className={`${darkMode ? 'cyberpunk-card' : 'bg-white rounded-lg shadow-lg border border-gray-200'} p-6 text-center`}>
          <div className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            {treeProgress?.current_level?.replace('_', ' ') || 'Seed'}
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tree Level</p>
        </div>
        <div className={`${darkMode ? 'cyberpunk-card' : 'bg-white rounded-lg shadow-lg border border-gray-200'} p-6 text-center`}>
          <div className={`text-3xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
            {Math.round(treeProgress?.progress_percentage || 0)}%
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Next Level</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={onCompleteSession}
          className={`${darkMode ? 'cyberpunk-button-primary' : 'bg-blue-600 hover:bg-blue-700 text-white'} p-6 rounded-xl text-xl font-bold transition-all duration-300 transform hover:scale-105`}
        >
          Complete Workout Session 💪
        </button>
        
        <button 
          className={`${darkMode ? 'cyberpunk-button-secondary' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} p-6 rounded-xl text-xl font-bold transition-all duration-300 transform hover:scale-105`}
        >
          AI Fitness Coach 🤖
        </button>
      </div>
    </div>
  );
};

const TreeSection = ({ treeProgress, user }) => {
  const { darkMode } = useContext(AppContext);

  return (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
        Your Growth Journey 🌳
      </h1>

      <div className={`${darkMode ? 'cyberpunk-card' : 'bg-white rounded-xl shadow-lg border border-gray-200'} p-8 text-center`}>
        {treeProgress && (
          <div className="space-y-6">
            <TreeSVG level={treeProgress.current_level} size={200} />
            
            <div>
              <h3 className={`text-2xl font-bold capitalize ${darkMode ? 'text-yellow-400' : 'text-green-600'}`}>
                {treeProgress.current_level.replace('_', ' ')}
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2 text-lg`}>
                Growth Progress: {Math.round(treeProgress.progress_percentage)}%
              </p>
            </div>

            <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-6`}>
              <div 
                className={`${darkMode ? 'bg-gradient-to-r from-green-400 to-yellow-400' : 'bg-gradient-to-r from-blue-400 to-green-400'} h-6 rounded-full transition-all duration-1000`}
                style={{ width: `${treeProgress.progress_percentage}%` }}
              ></div>
            </div>

            <div className="text-left space-y-4">
              <h4 className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>Tree Levels</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {['seed', 'sprout', 'sapling', 'young_tree', 'mature_tree', 'strong_oak', 'mighty_pine', 'ancient_elm', 'giant_sequoia', 'redwood'].map((level, index) => (
                  <div key={level} className={`text-center p-3 rounded-lg ${treeProgress.current_level === level ? (darkMode ? 'bg-green-900/50 border border-green-400' : 'bg-blue-100 border border-blue-300') : (darkMode ? 'bg-gray-800/50' : 'bg-gray-50')}`}>
                    <TreeSVG level={level} size={40} />
                    <p className={`text-xs mt-2 capitalize ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {level.replace('_', ' ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TrainersSection = () => {
  const { darkMode } = useContext(AppContext);
  
  const sampleTrainers = [
    { id: 1, name: 'Sarah Johnson', specialty: 'Weight Loss & Cardio', rating: 4.9, rate: 85, experience: '5 years' },
    { id: 2, name: 'Mike Chen', specialty: 'Strength Training', rating: 4.8, rate: 95, experience: '7 years' },
    { id: 3, name: 'Emma Davis', specialty: 'Yoga & Flexibility', rating: 4.7, rate: 70, experience: '4 years' },
    { id: 4, name: 'Chris Wilson', specialty: 'HIIT & CrossFit', rating: 4.9, rate: 100, experience: '8 years' },
    { id: 5, name: 'Lisa Martinez', specialty: 'Nutrition Coaching', rating: 4.6, rate: 75, experience: '3 years' },
    { id: 6, name: 'David Kim', specialty: 'Sports Training', rating: 4.8, rate: 90, experience: '6 years' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Find Your Perfect Trainer 💪
        </h1>
        <button className={`${darkMode ? 'cyberpunk-button-primary' : 'bg-blue-600 text-white'} px-6 py-2 rounded-lg`}>
          AI Matchmaker 🤖
        </button>
      </div>

      {/* Map Section */}
      <div className={`${darkMode ? 'cyberpunk-card' : 'bg-white rounded-xl shadow-lg border border-gray-200'} p-6`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Trainers Near You 🗺️
        </h2>
        <GoogleMap trainers={sampleTrainers} />
      </div>

      {/* Trainer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleTrainers.map(trainer => (
          <div key={trainer.id} className={`${darkMode ? 'cyberpunk-card' : 'bg-white rounded-xl shadow-lg border border-gray-200'} p-6`}>
            <div className="flex items-center space-x-4 mb-4">
              <div className={`w-16 h-16 rounded-full ${darkMode ? 'bg-green-900' : 'bg-blue-100'} flex items-center justify-center text-2xl`}>
                💪
              </div>
              <div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {trainer.name}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {trainer.experience} experience
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-blue-600'} font-medium`}>
                {trainer.specialty}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-yellow-400">⭐ {trainer.rating}/5.0</span>
                <span className={`font-bold ${darkMode ? 'text-yellow-400' : 'text-green-600'}`}>
                  ${trainer.rate}/session
                </span>
              </div>
            </div>
            
            <button className={`w-full mt-4 ${darkMode ? 'cyberpunk-button-primary' : 'bg-blue-600 text-white'} py-2 rounded-lg font-medium`}>
              Book Session
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SessionsSection = ({ sessions, onCompleteSession }) => {
  const { darkMode } = useContext(AppContext);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Your Sessions 📊
        </h1>
        <button 
          onClick={onCompleteSession}
          className={`${darkMode ? 'cyberpunk-button-primary' : 'bg-blue-600 text-white'} px-6 py-2 rounded-lg`}
        >
          + New Session
        </button>
      </div>

      <div className={`${darkMode ? 'cyberpunk-card' : 'bg-white rounded-xl shadow-lg border border-gray-200'} p-6`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Recent Sessions
        </h3>
        
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏋️‍♂️</div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>
              No sessions yet. Complete your first workout to start growing your tree! 🌱
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.slice(0, 10).map(session => (
              <div key={session.id} className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-4 rounded-lg flex justify-between items-center`}>
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">💪</div>
                  <div>
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {session.session_type}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {session.duration_minutes} minutes • {new Date(session.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <LiftCoin count={session.lift_coins_earned} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RewardsSection = ({ treeProgress }) => {
  const { darkMode } = useContext(AppContext);
  
  const rewards = [
    { id: 1, title: '10% Session Discount', cost: 100, available: true },
    { id: 2, title: 'Free Nutrition Consultation', cost: 500, available: true },
    { id: 3, title: 'Premium Trainer Access', cost: 1000, available: true },
    { id: 4, title: 'Fitness Equipment Discount', cost: 200, available: true },
    { id: 5, title: 'Free Personal Training Session', cost: 2000, available: false },
    { id: 6, title: 'LiftLink Merchandise', cost: 300, available: true }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Rewards Store 🏆
        </h1>
        <LiftCoin count={treeProgress?.lift_coins || 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map(reward => (
          <div key={reward.id} className={`${darkMode ? 'cyberpunk-card' : 'bg-white rounded-xl shadow-lg border border-gray-200'} p-6`}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🎁</div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {reward.title}
              </h3>
            </div>
            
            <div className="flex justify-between items-center">
              <LiftCoin count={reward.cost} />
              <button 
                disabled={!reward.available || (treeProgress?.lift_coins || 0) < reward.cost}
                className={`px-4 py-2 rounded-lg font-medium ${
                  reward.available && (treeProgress?.lift_coins || 0) >= reward.cost
                    ? (darkMode ? 'cyberpunk-button-primary' : 'bg-blue-600 text-white')
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {reward.available ? 'Redeem' : 'Coming Soon'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SocialSection = () => {
  const { darkMode } = useContext(AppContext);

  return (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
        Friends & Community 👥
      </h1>

      <div className={`${darkMode ? 'cyberpunk-card' : 'bg-white rounded-xl shadow-lg border border-gray-200'} p-6 text-center`}>
        <div className="text-6xl mb-4">👥</div>
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Connect with Friends
        </h2>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
          Find workout buddies, share your progress, and stay motivated together!
        </p>
        <button className={`${darkMode ? 'cyberpunk-button-primary' : 'bg-blue-600 text-white'} px-6 py-3 rounded-lg font-medium`}>
          Find Friends
        </button>
      </div>
    </div>
  );
};

const AnalyticsSection = ({ treeProgress, sessions }) => {
  const { darkMode } = useContext(AppContext);

  return (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
        Your Analytics 📈
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${darkMode ? 'cyberpunk-card' : 'bg-white rounded-xl shadow-lg border border-gray-200'} p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Progress Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Total Sessions</span>
              <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {treeProgress?.total_sessions || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Current Streak</span>
              <span className={`font-bold ${darkMode ? 'text-yellow-400' : 'text-orange-600'}`}>
                {treeProgress?.consistency_streak || 0} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>LiftCoins Earned</span>
              <span className={`font-bold ${darkMode ? 'text-yellow-400' : 'text-green-600'}`}>
                {treeProgress?.lift_coins || 0}
              </span>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'cyberpunk-card' : 'bg-white rounded-xl shadow-lg border border-gray-200'} p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Weekly Goal
          </h3>
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Complete 5 sessions this week
            </p>
            <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-4 mt-4`}>
              <div className={`${darkMode ? 'bg-gradient-to-r from-green-400 to-yellow-400' : 'bg-gradient-to-r from-blue-400 to-green-400'} h-4 rounded-full`} style={{ width: '60%' }}></div>
            </div>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              3 of 5 sessions completed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsSection = ({ user, onLogout }) => {
  const { darkMode, toggleDarkMode } = useContext(AppContext);

  return (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
        Settings ⚙️
      </h1>

      <div className={`${darkMode ? 'cyberpunk-card' : 'bg-white rounded-xl shadow-lg border border-gray-200'} p-6`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dark Mode</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Switch between light and dark themes
            </p>
          </div>
          <button 
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? 'bg-green-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              darkMode ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      <div className={`${darkMode ? 'cyberpunk-card' : 'bg-white rounded-xl shadow-lg border border-gray-200'} p-6`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Account
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Email</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {user.email}
            </p>
          </div>
          <div>
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Account Type</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} capitalize`}>
              {user.role.replace('_', ' ')}
            </p>
          </div>
          <button 
            onClick={onLogout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

// Onboarding Screen
const OnboardingScreen = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    fitness_goals: [],
    experience_level: ''
  });

  const roles = [
    { id: 'fitness_enthusiast', title: 'Fitness Enthusiast', desc: 'Ready to transform your fitness journey', icon: '💪' },
    { id: 'trainer', title: 'Professional Trainer', desc: 'Help others achieve their fitness goals', icon: '🏋️‍♂️' }
  ];

  const fitnessGoals = [
    { id: 'weight_loss', title: 'Weight Loss', icon: '🔥' },
    { id: 'muscle_building', title: 'Muscle Building', icon: '💪' },
    { id: 'general_fitness', title: 'General Fitness', icon: '🏃‍♂️' },
    { id: 'sport_training', title: 'Sport Training', icon: '⚽' },
    { id: 'rehabilitation', title: 'Rehabilitation', icon: '🏥' },
    { id: 'wellness', title: 'Wellness', icon: '🧘‍♀️' }
  ];

  const experienceLevels = [
    { id: 'beginner', title: 'Beginner', desc: 'Just starting out' },
    { id: 'intermediate', title: 'Intermediate', desc: 'Some experience' },
    { id: 'advanced', title: 'Advanced', desc: 'Experienced athlete' },
    { id: 'expert', title: 'Expert', desc: 'Professional level' }
  ];

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${API}/users`, formData);
      localStorage.setItem('liftlink_user', JSON.stringify(response.data));
      onComplete(response.data);
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const renderStep = () => {
    switch(step) {
      case 0:
        return (
          <div className="text-center space-y-8">
            <div className="cyberpunk-glow">
              <LiftLinkLogo size={120} />
            </div>
            <TreeSVG level="seed" size={120} />
            <input
              type="email"
              placeholder="Enter your email"
              className="cyberpunk-input w-full max-w-md mx-auto"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <button 
              onClick={() => setStep(1)}
              disabled={!formData.email}
              className="cyberpunk-button-primary"
            >
              Begin Journey →
            </button>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-center text-green-400">Choose Your Path</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setFormData({...formData, role: role.id})}
                  className={`cyberpunk-card p-6 text-left transition-all ${
                    formData.role === role.id ? 'border-green-400 bg-green-900/20' : ''
                  }`}
                >
                  <div className="text-4xl mb-4">{role.icon}</div>
                  <h3 className="text-xl font-bold text-green-400">{role.title}</h3>
                  <p className="text-gray-300">{role.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setStep(0)} className="cyberpunk-button-secondary">← Back</button>
              <button 
                onClick={() => setStep(2)}
                disabled={!formData.role}
                className="cyberpunk-button-primary"
              >
                Continue →
              </button>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-center text-green-400">Fitness Goals</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {fitnessGoals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => {
                    const goals = formData.fitness_goals.includes(goal.id)
                      ? formData.fitness_goals.filter(g => g !== goal.id)
                      : [...formData.fitness_goals, goal.id];
                    setFormData({...formData, fitness_goals: goals});
                  }}
                  className={`cyberpunk-card p-4 text-center transition-all ${
                    formData.fitness_goals.includes(goal.id) ? 'border-yellow-400 bg-yellow-900/20' : ''
                  }`}
                >
                  <div className="text-3xl mb-2">{goal.icon}</div>
                  <h3 className="text-sm font-bold text-yellow-400">{goal.title}</h3>
                </button>
              ))}
            </div>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setStep(1)} className="cyberpunk-button-secondary">← Back</button>
              <button 
                onClick={() => setStep(3)}
                disabled={formData.fitness_goals.length === 0}
                className="cyberpunk-button-primary"
              >
                Continue →
              </button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-center text-green-400">Experience Level</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experienceLevels.map(level => (
                <button
                  key={level.id}
                  onClick={() => setFormData({...formData, experience_level: level.id})}
                  className={`cyberpunk-card p-6 text-left transition-all ${
                    formData.experience_level === level.id ? 'border-blue-400 bg-blue-900/20' : ''
                  }`}
                >
                  <h3 className="text-xl font-bold text-blue-400">{level.title}</h3>
                  <p className="text-gray-300">{level.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setStep(2)} className="cyberpunk-button-secondary">← Back</button>
              <button 
                onClick={handleSubmit}
                disabled={!formData.experience_level}
                className="cyberpunk-button-primary"
              >
                Complete Setup 🚀
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen cyberpunk-bg flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {renderStep()}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [treeProgress, setTreeProgress] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('liftlink_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchTreeProgress();
      fetchSessions();
    }
  }, [user]);

  const fetchTreeProgress = async () => {
    try {
      const response = await axios.get(`${API}/users/${user.id}/tree-progress`);
      setTreeProgress(response.data);
    } catch (error) {
      console.error('Failed to fetch tree progress:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API}/users/${user.id}/sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const completeSession = async () => {
    try {
      await axios.post(`${API}/sessions`, {
        user_id: user.id,
        session_type: 'Workout Session',
        duration_minutes: 45
      });
      
      fetchTreeProgress();
      fetchSessions();
      
      // Show success message
      alert('🎉 Session completed! You earned 50 LiftCoins!');
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to complete session. Please try again.');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('liftlink_user');
    setUser(null);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard user={user} treeProgress={treeProgress} onCompleteSession={completeSession} />;
      case 'tree':
        return <TreeSection treeProgress={treeProgress} user={user} />;
      case 'trainers':
        return <TrainersSection />;
      case 'sessions':
        return <SessionsSection sessions={sessions} onCompleteSession={completeSession} />;
      case 'rewards':
        return <RewardsSection treeProgress={treeProgress} />;
      case 'social':
        return <SocialSection />;
      case 'analytics':
        return <AnalyticsSection treeProgress={treeProgress} sessions={sessions} />;
      case 'settings':
        return <SettingsSection user={user} onLogout={handleLogout} />;
      default:
        return <Dashboard user={user} treeProgress={treeProgress} onCompleteSession={completeSession} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen cyberpunk-bg flex items-center justify-center">
        <div className="text-center">
          <LiftLinkLogo size={100} />
          <TreeSVG level="seed" size={100} />
          <p className="text-green-400 mt-4 text-xl">Loading LiftLink...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div className="App">
        {!user ? (
          <OnboardingScreen onComplete={setUser} />
        ) : (
          <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'cyberpunk-bg' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />
            
            {/* Header */}
            <header className={`fixed top-0 left-64 right-0 ${darkMode ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-md border-b ${darkMode ? 'border-green-400/30' : 'border-gray-200'} p-4 z-30`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-600'}`}
                  >
                    {darkMode ? '🌞' : '🌙'}
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <LiftCoin count={treeProgress?.lift_coins || 0} />
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Level: {treeProgress?.current_level?.replace('_', ' ') || 'Seed'}
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="pl-64 pt-20 p-6">
              <div className="max-w-7xl mx-auto">
                {renderContent()}
              </div>
            </main>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}

export default App;