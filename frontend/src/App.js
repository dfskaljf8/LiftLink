import React, { useState, useEffect, useContext, createContext } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Context for theme and user
const AppContext = createContext();

// Professional SVG Icons (Duolingo-style)
const SVGIcons = {
  Home: ({ size = 24, color = "currentColor", className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path fill={color} d="M12 3l8 6v12h-5v-7h-6v7H4V9z"/>
      <circle cx="12" cy="13" r="1" fill={color} className="animate-pulse"/>
    </svg>
  ),
  
  Trainers: ({ size = 24, color = "currentColor", className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path fill={color} d="M6 2h3v2h6V2h3v2h2v2H4V4h2V2z"/>
      <rect x="8" y="8" width="8" height="2" rx="1" fill={color}/>
      <rect x="6" y="12" width="12" height="2" rx="1" fill={color}/>
      <rect x="7" y="16" width="10" height="2" rx="1" fill={color}/>
      <rect x="9" y="20" width="6" height="1" rx="0.5" fill={color}/>
      <g className="animate-bounce" style={{transformOrigin: '12px 10px'}}>
        <circle cx="10" cy="10" r="1" fill={color}/>
        <circle cx="14" cy="10" r="1" fill={color}/>
      </g>
    </svg>
  ),
  
  Tree: ({ size = 24, color = "currentColor", className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <rect x="11" y="16" width="2" height="6" fill="#8B4513"/>
      <circle cx="12" cy="12" r="6" fill={color} className="animate-pulse"/>
      <circle cx="8" cy="8" r="3" fill={color} opacity="0.8"/>
      <circle cx="16" cy="8" r="3" fill={color} opacity="0.8"/>
      <circle cx="12" cy="6" r="2" fill="#FFD700" className="animate-ping"/>
    </svg>
  ),
  
  Sessions: ({ size = 24, color = "currentColor", className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <rect x="3" y="6" width="18" height="12" rx="2" fill={color} opacity="0.2"/>
      <rect x="6" y="9" width="3" height="6" rx="1" fill={color}/>
      <rect x="10.5" y="12" width="3" height="3" rx="1" fill={color}/>
      <rect x="15" y="10" width="3" height="5" rx="1" fill={color}/>
      <g className="animate-pulse">
        <circle cx="8" cy="4" r="1" fill={color}/>
        <circle cx="12" cy="4" r="1" fill={color}/>
        <circle cx="16" cy="4" r="1" fill={color}/>
      </g>
    </svg>
  ),
  
  Profile: ({ size = 24, color = "currentColor", className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="8" r="4" fill={color}/>
      <path fill={color} d="M4 20v-2c0-2.5 4-4 8-4s8 1.5 8 4v2z"/>
      <circle cx="16" cy="6" r="2" fill="#FFD700" className="animate-bounce"/>
    </svg>
  ),
  
  Rewards: ({ size = 24, color = "currentColor", className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path fill={color} d="M12 2l2.5 7.5H22l-6 4.5L18.5 22 12 17l-6.5 5L8 14l-6-4.5h7.5z"/>
      <circle cx="12" cy="12" r="3" fill="#FFD700" className="animate-spin-slow"/>
      <circle cx="12" cy="12" r="1" fill={color} className="animate-ping"/>
    </svg>
  ),
  
  Friends: ({ size = 24, color = "currentColor", className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <circle cx="9" cy="8" r="3" fill={color}/>
      <circle cx="15" cy="8" r="3" fill={color}/>
      <path fill={color} d="M3 18v-1c0-1.5 2.5-3 6-3s6 1.5 6 3v1z"/>
      <path fill={color} d="M9 18v-1c0-1.5 2.5-3 6-3s6 1.5 6 3v1z"/>
      <g className="animate-pulse">
        <circle cx="6" cy="6" r="1" fill="#FFD700"/>
        <circle cx="18" cy="6" r="1" fill="#FFD700"/>
      </g>
    </svg>
  ),
  
  Analytics: ({ size = 24, color = "currentColor", className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" fill={color} opacity="0.1"/>
      <rect x="6" y="16" width="2" height="4" fill={color}/>
      <rect x="10" y="12" width="2" height="8" fill={color}/>
      <rect x="14" y="8" width="2" height="12" fill={color}/>
      <rect x="18" y="6" width="2" height="14" fill={color}/>
      <path stroke={color} strokeWidth="2" fill="none" 
            d="M6 17 L10 13 L14 9 L18 7"
            className="animate-pulse"/>
    </svg>
  ),
  
  Settings: ({ size = 24, color = "currentColor", className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="3" fill={color}/>
      <path fill={color} d="M12 1l2.1 4.2 4.2.6-3 2.9.7 4.2-3.8-2-3.8 2 .7-4.2-3-2.9 4.2-.6z" 
            className="animate-spin-slow"/>
    </svg>
  ),
  
  Theme: ({ size = 24, darkMode = true, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      {darkMode ? (
        <g>
          <circle cx="12" cy="12" r="6" fill="#FFD700"/>
          <g className="animate-pulse">
            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" 
                  stroke="#FFD700" strokeWidth="2"/>
          </g>
        </g>
      ) : (
        <g>
          <path fill="#4A5568" d="M12 2.25a9.75 9.75 0 1 0 0 19.5 6.75 6.75 0 0 1 0-13.5A9.75 9.75 0 0 0 12 2.25z"/>
          <g className="animate-pulse">
            <circle cx="8" cy="8" r="1" fill="#E2E8F0"/>
            <circle cx="16" cy="10" r="0.5" fill="#E2E8F0"/>
            <circle cx="6" cy="14" r="0.5" fill="#E2E8F0"/>
          </g>
        </g>
      )}
    </svg>
  ),
  
  LiftCoin: ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`${className} animate-spin-slow`}>
      <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#FFA500" strokeWidth="2"/>
      <circle cx="12" cy="12" r="6" fill="#FFA500" opacity="0.3"/>
      <text x="12" y="16" textAnchor="middle" fontSize="8" fill="#000" fontWeight="bold">L</text>
      <circle cx="12" cy="12" r="2" fill="#FFE55C" className="animate-ping"/>
    </svg>
  )
};

// Enhanced LiftLink Logo Component
const LiftLinkLogo = ({ size = 60, showTagline = true }) => (
  <div className={`flex items-center space-x-3`}>
    <div className="relative">
      <svg width={size} height={size * 0.4} viewBox="0 0 400 160" className="drop-shadow-lg">
        <rect x="50" y="70" width="300" height="20" rx="10" fill="#C4D600" />
        <rect x="30" y="55" width="30" height="50" rx="8" fill="#FFD700" />
        <rect x="340" y="55" width="30" height="50" rx="8" fill="#FFD700" />
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
      {showTagline && <p className="text-xs text-gray-400">Beginners to Believers</p>}
    </div>
  </div>
);

// Enhanced Tree SVG Components
const TreeSVG = ({ level, size = 100 }) => {
  const treeConfigs = {
    seed: {
      color: "#8B4513",
      svg: (
        <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
          <circle cx="50" cy="80" r="8" fill="#8B4513" />
          <circle cx="50" cy="75" r="3" fill="#C4D600" className="animate-pulse" />
        </svg>
      )
    },
    sprout: {
      color: "#C4D600",
      svg: (
        <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
          <rect x="48" y="70" width="4" height="20" fill="#8B4513" />
          <path d="M45 70 Q50 60 55 70" fill="#C4D600" className="animate-pulse" />
          <path d="M42 72 Q50 62 58 72" fill="#90EE90" />
        </svg>
      )
    },
    sapling: {
      color: "#90EE90",
      svg: (
        <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
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
        <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
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
        <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
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
        <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
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
        <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
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
        <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
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
        <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
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
        <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
          <rect x="25" y="20" width="50" height="70" fill="#8B4513" />
          <circle cx="50" cy="15" r="45" fill="#000d00" />
          <circle cx="15" cy="10" r="28" fill="#001a00" />
          <circle cx="85" cy="10" r="28" fill="#001a00" />
          <circle cx="50" cy="2" r="22" fill="#002d00" />
          <circle cx="20" cy="0" r="18" fill="#003d00" />
          <circle cx="80" cy="0" r="18" fill="#003d00" />
          <circle cx="50" cy="18" r="8" fill="#FFD700" className="animate-pulse" />
        </svg>
      )
    }
  };

  return (
    <div className="tree-container">
      {treeConfigs[level]?.svg || treeConfigs.seed.svg}
    </div>
  );
};

// Enhanced LiftCoin Component
const LiftCoin = ({ count, animate = false, size = "md" }) => {
  const sizes = {
    sm: { icon: 16, text: "text-sm" },
    md: { icon: 24, text: "text-base" },
    lg: { icon: 32, text: "text-lg" }
  };
  
  return (
    <div className={`flex items-center space-x-2 ${animate ? 'animate-bounce' : ''}`}>
      <SVGIcons.LiftCoin size={sizes[size].icon} />
      <span className={`text-yellow-400 font-bold ${sizes[size].text}`}>{count}</span>
    </div>
  );
};

// Mobile-First Bottom Navigation
const BottomNavigation = ({ activeTab, setActiveTab, darkMode }) => {
  const { toggleDarkMode } = useContext(AppContext);
  
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: SVGIcons.Home },
    { id: 'trainers', label: 'Trainers', icon: SVGIcons.Trainers },
    { id: 'tree', label: 'Progress', icon: SVGIcons.Tree },
    { id: 'sessions', label: 'Sessions', icon: SVGIcons.Sessions },
    { id: 'profile', label: 'Profile', icon: SVGIcons.Profile }
  ];

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-md border-t ${darkMode ? 'border-green-400/30' : 'border-gray-200'} z-50`}>
      <div className="flex justify-around py-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all ${
              activeTab === item.id 
                ? (darkMode ? 'text-green-400' : 'text-blue-600')
                : (darkMode ? 'text-gray-400' : 'text-gray-500')
            }`}
          >
            <item.icon 
              size={20} 
              color={activeTab === item.id ? (darkMode ? '#C4D600' : '#3b82f6') : 'currentColor'}
            />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
        <button
          onClick={toggleDarkMode}
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
        >
          <SVGIcons.Theme size={20} darkMode={darkMode} />
          <span className="text-xs font-medium">Theme</span>
        </button>
      </div>
    </nav>
  );
};

// Desktop Side Navigation
const SideNavigation = ({ activeTab, setActiveTab, darkMode }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: SVGIcons.Home },
    { id: 'tree', label: 'My Tree', icon: SVGIcons.Tree },
    { id: 'trainers', label: 'Find Trainers', icon: SVGIcons.Trainers },
    { id: 'sessions', label: 'Sessions', icon: SVGIcons.Sessions },
    { id: 'rewards', label: 'Rewards', icon: SVGIcons.Rewards },
    { id: 'friends', label: 'Friends', icon: SVGIcons.Friends },
    { id: 'analytics', label: 'Analytics', icon: SVGIcons.Analytics },
    { id: 'settings', label: 'Settings', icon: SVGIcons.Settings }
  ];

  return (
    <nav className={`hidden md:block fixed left-0 top-0 h-full w-64 ${darkMode ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-md border-r ${darkMode ? 'border-green-400/30' : 'border-gray-200'} z-40 transition-all duration-300`}>
      <div className="p-4">
        <LiftLinkLogo />
      </div>
      
      <div className="px-4 space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? (darkMode ? 'bg-green-900/50 text-green-400 border border-green-400/50 shadow-lg' : 'bg-blue-100 text-blue-600 border border-blue-300 shadow-lg')
                : (darkMode ? 'text-gray-300 hover:bg-gray-800/50' : 'text-gray-600 hover:bg-gray-100')
            }`}
          >
            <item.icon 
              size={20} 
              color={activeTab === item.id ? (darkMode ? '#C4D600' : '#3b82f6') : 'currentColor'}
            />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// Enhanced Google Maps Component
const EnhancedGoogleMap = ({ trainers = [], selectedTrainer, onTrainerSelect }) => {
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
      const map = new window.google.maps.Map(document.getElementById('enhanced-trainer-map'), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 13,
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#1a1a1a" }]
          },
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#C4D600" }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#0a0a0a" }]
          }
        ]
      });

      trainers.forEach((trainer, index) => {
        const marker = new window.google.maps.Marker({
          position: { 
            lat: 37.7749 + (Math.random() - 0.5) * 0.02, 
            lng: -122.4194 + (Math.random() - 0.5) * 0.02 
          },
          map: map,
          title: trainer.name,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="${selectedTrainer?.id === trainer.id ? '#FFD700' : '#C4D600'}" stroke="#000" stroke-width="2"/>
                <circle cx="20" cy="20" r="10" fill="#fff" opacity="0.9"/>
                <text x="20" y="24" text-anchor="middle" font-size="12" fill="#000">💪</text>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });

        marker.addListener('click', () => {
          onTrainerSelect(trainer);
        });
      });
    }
  }, [mapLoaded, trainers, selectedTrainer, onTrainerSelect]);

  return (
    <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden shadow-lg">
      {GOOGLE_MAPS_API_KEY === 'demo_key_replace_with_real_key' ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 rounded-xl">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🗺️</div>
            <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">Interactive Map Preview</p>
            <p className="text-sm text-gray-500">Configure Google Maps API key to enable live trainer locations</p>
          </div>
        </div>
      ) : (
        <div id="enhanced-trainer-map" className="w-full h-full"></div>
      )}
    </div>
  );
};

// Enhanced Trainer Card Component
const TrainerCard = ({ trainer, onSelect, isSelected, darkMode }) => (
  <div 
    onClick={() => onSelect(trainer)}
    className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 md:p-6 cursor-pointer transition-all duration-300 ${
      isSelected ? 'ring-2 ring-green-400 scale-105' : 'hover:scale-102'
    }`}
  >
    <div className="flex items-center space-x-4 mb-4">
      <div className="relative">
        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full ${darkMode ? 'bg-gradient-to-br from-green-900 to-green-700' : 'bg-gradient-to-br from-blue-100 to-blue-200'} flex items-center justify-center text-xl md:text-2xl shadow-lg`}>
          {trainer.avatar || '💪'}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${trainer.online ? 'bg-green-400' : 'bg-gray-400'} border-2 border-white`}></div>
      </div>
      <div className="flex-1">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {trainer.name}
        </h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {trainer.experience} experience
        </p>
      </div>
      <div className="text-right">
        <div className="flex items-center space-x-1 mb-1">
          <span className="text-yellow-400">⭐</span>
          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {trainer.rating}
          </span>
        </div>
        <p className="text-xs text-gray-500">({trainer.reviews} reviews)</p>
      </div>
    </div>
    
    <div className="space-y-3">
      <div>
        <p className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-blue-600'} mb-1`}>
          Specialties
        </p>
        <div className="flex flex-wrap gap-1">
          {trainer.specialties.map((specialty, index) => (
            <span 
              key={index}
              className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <span className={`text-lg font-bold ${darkMode ? 'text-yellow-400' : 'text-green-600'}`}>
            ${trainer.rate}
          </span>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            /session
          </span>
        </div>
        <div className="flex space-x-2">
          <button className={`px-3 py-1 text-xs rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
            Message
          </button>
          <button className={`px-3 py-1 text-xs rounded-lg ${darkMode ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
            Book
          </button>
        </div>
      </div>
      
      {trainer.nextAvailable && (
        <p className={`text-xs ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Next available: {trainer.nextAvailable}
        </p>
      )}
    </div>
  </div>
);

// Enhanced Filter Component
const TrainerFilters = ({ filters, setFilters, darkMode }) => {
  const specialties = ['Weight Loss', 'Strength Training', 'Yoga', 'HIIT', 'CrossFit', 'Nutrition'];
  const priceRanges = [
    { label: 'Under $50', min: 0, max: 50 },
    { label: '$50-$100', min: 50, max: 100 },
    { label: '$100+', min: 100, max: 1000 }
  ];

  return (
    <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 space-y-4`}>
      <h3 className={`font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>Filters</h3>
      
      <div>
        <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 block`}>
          Specialty
        </label>
        <select 
          value={filters.specialty}
          onChange={(e) => setFilters({...filters, specialty: e.target.value})}
          className={`w-full p-2 rounded-lg text-sm ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'} border`}
        >
          <option value="">All Specialties</option>
          {specialties.map(specialty => (
            <option key={specialty} value={specialty}>{specialty}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 block`}>
          Price Range
        </label>
        <div className="space-y-2">
          {priceRanges.map((range, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input 
                type="radio" 
                name="priceRange"
                checked={filters.priceMin === range.min && filters.priceMax === range.max}
                onChange={() => setFilters({...filters, priceMin: range.min, priceMax: range.max})}
                className="text-green-400"
              />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            checked={filters.onlineOnly}
            onChange={(e) => setFilters({...filters, onlineOnly: e.target.checked})}
            className="text-green-400"
          />
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Available now
          </span>
        </label>
      </div>
    </div>
  );
};

// Main App Sections with Enhanced Design
const Dashboard = ({ user, treeProgress, onCompleteSession }) => {
  const { darkMode } = useContext(AppContext);

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'} mb-2`}>
          Welcome back, {user.email.split('@')[0]}! 👋
        </h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Ready to continue your fitness journey?
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
          <div className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'} mb-1`}>
            {treeProgress?.total_sessions || 0}
          </div>
          <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sessions</p>
        </div>
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
          <div className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-yellow-400' : 'text-orange-600'} mb-1`}>
            {treeProgress?.consistency_streak || 0}
          </div>
          <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Streak</p>
        </div>
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
          <div className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mb-1`}>
            {treeProgress?.current_level?.replace('_', ' ') || 'Seed'}
          </div>
          <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Level</p>
        </div>
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
          <LiftCoin count={treeProgress?.lift_coins || 0} size="sm" />
        </div>
      </div>

      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Your Progress Tree
        </h2>
        <div className="flex items-center space-x-6">
          <TreeSVG level={treeProgress?.current_level || 'seed'} size={80} />
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {treeProgress?.current_level?.replace('_', ' ') || 'Seed'}
              </span>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {Math.round(treeProgress?.progress_percentage || 0)}%
              </span>
            </div>
            <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-3`}>
              <div 
                className={`${darkMode ? 'bg-gradient-to-r from-green-400 to-yellow-400' : 'bg-gradient-to-r from-blue-400 to-green-400'} h-3 rounded-full transition-all duration-1000`}
                style={{ width: `${treeProgress?.progress_percentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={onCompleteSession}
          className={`${darkMode ? 'premium-button-primary' : 'premium-button-light'} p-6 text-center space-y-2`}
        >
          <div className="text-3xl">💪</div>
          <div className="text-lg font-bold">Complete Workout</div>
          <div className="text-sm opacity-75">Earn 50 LiftCoins</div>
        </button>
        
        <button className={`${darkMode ? 'premium-button-secondary' : 'premium-button-light-secondary'} p-6 text-center space-y-2`}>
          <div className="text-3xl">🤖</div>
          <div className="text-lg font-bold">AI Coach</div>
          <div className="text-sm opacity-75">Get personalized advice</div>
        </button>
      </div>
    </div>
  );
};

const TrainersSection = () => {
  const { darkMode } = useContext(AppContext);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [filters, setFilters] = useState({
    specialty: '',
    priceMin: 0,
    priceMax: 1000,
    onlineOnly: false
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const sampleTrainers = [
    { 
      id: 1, 
      name: 'Sarah Johnson', 
      specialties: ['Weight Loss', 'Cardio'], 
      rating: 4.9, 
      reviews: 127,
      rate: 85, 
      experience: '5 years',
      avatar: '👩‍💼',
      online: true,
      nextAvailable: 'Today 3:00 PM'
    },
    { 
      id: 2, 
      name: 'Mike Chen', 
      specialties: ['Strength Training', 'CrossFit'], 
      rating: 4.8, 
      reviews: 89,
      rate: 95, 
      experience: '7 years',
      avatar: '👨‍💪',
      online: false,
      nextAvailable: 'Tomorrow 9:00 AM'
    },
    { 
      id: 3, 
      name: 'Emma Davis', 
      specialties: ['Yoga', 'Flexibility'], 
      rating: 4.7, 
      reviews: 203,
      rate: 70, 
      experience: '4 years',
      avatar: '🧘‍♀️',
      online: true,
      nextAvailable: 'Today 6:00 PM'
    },
    { 
      id: 4, 
      name: 'Chris Wilson', 
      specialties: ['HIIT', 'CrossFit'], 
      rating: 4.9, 
      reviews: 156,
      rate: 100, 
      experience: '8 years',
      avatar: '🏋️‍♂️',
      online: true,
      nextAvailable: 'Today 4:30 PM'
    },
    { 
      id: 5, 
      name: 'Lisa Martinez', 
      specialties: ['Nutrition', 'Weight Loss'], 
      rating: 4.6, 
      reviews: 78,
      rate: 75, 
      experience: '3 years',
      avatar: '👩‍⚕️',
      online: false,
      nextAvailable: 'Tomorrow 11:00 AM'
    },
    { 
      id: 6, 
      name: 'David Kim', 
      specialties: ['Sports Training', 'Strength'], 
      rating: 4.8, 
      reviews: 145,
      rate: 90, 
      experience: '6 years',
      avatar: '⚽',
      online: true,
      nextAvailable: 'Today 5:15 PM'
    }
  ];

  const filteredTrainers = sampleTrainers.filter(trainer => {
    if (filters.specialty && !trainer.specialties.includes(filters.specialty)) return false;
    if (trainer.rate < filters.priceMin || trainer.rate > filters.priceMax) return false;
    if (filters.onlineOnly && !trainer.online) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Find Your Trainer
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {filteredTrainers.length} trainers available
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`${darkMode ? 'premium-button-secondary' : 'premium-button-light-secondary'} px-4 py-2 text-sm`}
          >
            Filters {showFilters ? '↑' : '↓'}
          </button>
          <button className={`${darkMode ? 'premium-button-primary' : 'premium-button-light'} px-4 py-2 text-sm`}>
            AI Match 🤖
          </button>
        </div>
      </div>

      {showFilters && (
        <TrainerFilters filters={filters} setFilters={setFilters} darkMode={darkMode} />
      )}

      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 md:p-6`}>
        <h2 className={`text-lg md:text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Trainers Near You
        </h2>
        <EnhancedGoogleMap 
          trainers={filteredTrainers} 
          selectedTrainer={selectedTrainer}
          onTrainerSelect={setSelectedTrainer}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredTrainers.map(trainer => (
          <TrainerCard 
            key={trainer.id}
            trainer={trainer}
            onSelect={setSelectedTrainer}
            isSelected={selectedTrainer?.id === trainer.id}
            darkMode={darkMode}
          />
        ))}
      </div>
    </div>
  );
};

// Enhanced Rewards Section
const RewardsSection = ({ treeProgress }) => {
  const { darkMode } = useContext(AppContext);
  
  const rewards = [
    { id: 1, title: '10% Session Discount', description: 'Save on your next training session', cost: 100, available: true, category: 'discount' },
    { id: 2, title: 'Free Nutrition Consultation', description: '30-minute session with nutrition expert', cost: 500, available: true, category: 'service' },
    { id: 3, title: 'Premium Trainer Access', description: 'Unlock top-tier trainers for 1 month', cost: 1000, available: true, category: 'access' },
    { id: 4, title: 'Fitness Equipment Voucher', description: '$50 off fitness equipment purchase', cost: 200, available: true, category: 'discount' },
    { id: 5, title: 'Free Personal Training', description: 'Complimentary 1-hour personal session', cost: 2000, available: true, category: 'service' },
    { id: 6, title: 'LiftLink Merchandise', description: 'Exclusive branded workout gear', cost: 300, available: true, category: 'merchandise' },
    { id: 7, title: 'Wellness Retreat Weekend', description: '2-day fitness and wellness experience', cost: 5000, available: false, category: 'experience' },
    { id: 8, title: 'AI Coach Pro', description: 'Advanced AI coaching for 3 months', cost: 800, available: true, category: 'service' }
  ];

  const categories = ['All', 'Discount', 'Service', 'Access', 'Merchandise', 'Experience'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredRewards = selectedCategory === 'All' 
    ? rewards 
    : rewards.filter(reward => reward.category === selectedCategory.toLowerCase());

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'discount': return '💰';
      case 'service': return '🎯';
      case 'access': return '🔓';
      case 'merchandise': return '👕';
      case 'experience': return '🏖️';
      default: return '🎁';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Rewards Store
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Redeem your LiftCoins for amazing rewards
          </p>
        </div>
        <LiftCoin count={treeProgress?.lift_coins || 0} size="lg" />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category
                ? (darkMode ? 'bg-green-600 text-white' : 'bg-blue-600 text-white')
                : (darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredRewards.map(reward => (
          <div key={reward.id} className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">{getCategoryIcon(reward.category)}</div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                {reward.title}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                {reward.description}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-center">
                <LiftCoin count={reward.cost} size="sm" />
              </div>
              
              <button 
                disabled={!reward.available || (treeProgress?.lift_coins || 0) < reward.cost}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  reward.available && (treeProgress?.lift_coins || 0) >= reward.cost
                    ? (darkMode ? 'premium-button-primary' : 'premium-button-light')
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {!reward.available ? 'Coming Soon' : 
                 (treeProgress?.lift_coins || 0) >= reward.cost ? 'Redeem' : 'Need More Coins'}
              </button>
              
              {!reward.available && (
                <p className={`text-xs text-center ${darkMode ? 'text-yellow-400' : 'text-orange-600'}`}>
                  🔒 Unlock at higher tree levels
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Earn Section */}
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Quick Ways to Earn LiftCoins
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">💪</div>
            <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Complete Sessions</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>50 coins per workout</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🔥</div>
            <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Maintain Streaks</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bonus for consistency</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Achieve Goals</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Major milestones</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Friends Section
const FriendsSection = () => {
  const { darkMode } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('friends');

  const sampleFriends = [
    { id: 1, name: 'Alex Thompson', level: 'Sapling', streak: 15, lastWorkout: '2 hours ago', avatar: '🏃‍♂️' },
    { id: 2, name: 'Maria Garcia', level: 'Young Tree', streak: 8, lastWorkout: '1 day ago', avatar: '🧘‍♀️' },
    { id: 3, name: 'John Smith', level: 'Mature Tree', streak: 22, lastWorkout: '3 hours ago', avatar: '🏋️‍♂️' },
    { id: 4, name: 'Sarah Wilson', level: 'Strong Oak', streak: 45, lastWorkout: '30 min ago', avatar: '🏃‍♀️' }
  ];

  const friendRequests = [
    { id: 1, name: 'Mike Johnson', mutualFriends: 3, avatar: '💪' },
    { id: 2, name: 'Emma Davis', mutualFriends: 1, avatar: '🤸‍♀️' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Friends & Community
        </h1>
        <button className={`${darkMode ? 'premium-button-primary' : 'premium-button-light'} px-4 py-2 text-sm`}>
          <SVGIcons.Friends size={16} className="inline mr-2" />
          Find Friends
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {['friends', 'requests', 'leaderboard'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? (darkMode ? 'bg-green-600 text-white' : 'bg-blue-600 text-white')
                : (darkMode ? 'text-gray-400' : 'text-gray-600')
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Friends List */}
      {activeTab === 'friends' && (
        <div className="space-y-4">
          {sampleFriends.map(friend => (
            <div key={friend.id} className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full ${darkMode ? 'bg-green-900' : 'bg-blue-100'} flex items-center justify-center text-xl`}>
                    {friend.avatar}
                  </div>
                  <div>
                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {friend.name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Level: {friend.level} • {friend.streak} day streak
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
                      Last workout: {friend.lastWorkout}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className={`px-3 py-1 text-xs rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    Message
                  </button>
                  <button className={`px-3 py-1 text-xs rounded-lg ${darkMode ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                    Challenge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friend Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {friendRequests.length === 0 ? (
            <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-8 text-center`}>
              <div className="text-4xl mb-4">👥</div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                No pending friend requests
              </p>
            </div>
          ) : (
            friendRequests.map(request => (
              <div key={request.id} className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full ${darkMode ? 'bg-green-900' : 'bg-blue-100'} flex items-center justify-center text-xl`}>
                      {request.avatar}
                    </div>
                    <div>
                      <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {request.name}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {request.mutualFriends} mutual friends
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs rounded-lg bg-red-600 text-white">
                      Decline
                    </button>
                    <button className={`px-3 py-1 text-xs rounded-lg ${darkMode ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Weekly Leaderboard
          </h3>
          <div className="space-y-3">
            {sampleFriends.map((friend, index) => (
              <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-400 text-black' :
                    index === 1 ? 'bg-gray-300 text-black' :
                    index === 2 ? 'bg-orange-400 text-black' :
                    'bg-gray-500 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {friend.avatar}
                  </span>
                  <div>
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {friend.name}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {friend.streak} day streak
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
                    {friend.streak * 50} pts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Analytics Section
const AnalyticsSection = ({ treeProgress, sessions }) => {
  const { darkMode } = useContext(AppContext);
  const [timeRange, setTimeRange] = useState('week');

  const analyticsData = {
    totalSessions: treeProgress?.total_sessions || 0,
    totalMinutes: (treeProgress?.total_sessions || 0) * 45,
    averagePerWeek: Math.round((treeProgress?.total_sessions || 0) / 4),
    consistency: Math.round(((treeProgress?.consistency_streak || 0) / 30) * 100),
    caloriesBurned: (treeProgress?.total_sessions || 0) * 350,
    strengthGain: Math.round((treeProgress?.total_sessions || 0) * 2.5)
  };

  const weeklyData = [
    { day: 'Mon', sessions: 1, calories: 350 },
    { day: 'Tue', sessions: 0, calories: 0 },
    { day: 'Wed', sessions: 1, calories: 350 },
    { day: 'Thu', sessions: 1, calories: 350 },
    { day: 'Fri', sessions: 0, calories: 0 },
    { day: 'Sat', sessions: 2, calories: 700 },
    { day: 'Sun', sessions: 1, calories: 350 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Your Analytics
        </h1>
        <div className="flex space-x-2">
          {['week', 'month', 'year'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                timeRange === range
                  ? (darkMode ? 'bg-green-600 text-white' : 'bg-blue-600 text-white')
                  : (darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
          <SVGIcons.Sessions size={32} color={darkMode ? '#C4D600' : '#3b82f6'} className="mx-auto mb-2" />
          <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            {analyticsData.totalSessions}
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Sessions</p>
        </div>
        
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
          <div className="text-2xl mb-2">⏱️</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-orange-600'}`}>
            {analyticsData.totalMinutes}
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Minutes</p>
        </div>
        
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
          <div className="text-2xl mb-2">🔥</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
            {analyticsData.caloriesBurned}
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Calories Burned</p>
        </div>
        
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
          <div className="text-2xl mb-2">💪</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            {analyticsData.consistency}%
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Consistency</p>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Weekly Activity
        </h3>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weeklyData.map(day => (
            <div key={day.day} className="text-center">
              <div className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {day.day}
              </div>
              <div 
                className={`h-24 rounded-lg flex flex-col justify-end p-2 ${
                  day.sessions > 0 
                    ? (darkMode ? 'bg-green-600' : 'bg-blue-600')
                    : (darkMode ? 'bg-gray-700' : 'bg-gray-200')
                }`}
                style={{ height: `${Math.max(24, day.sessions * 30)}px` }}
              >
                <div className="text-white text-xs font-bold">
                  {day.sessions}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Progress Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Tree Progress</span>
              <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {treeProgress?.current_level?.replace('_', ' ') || 'Seed'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Current Streak</span>
              <span className={`font-bold ${darkMode ? 'text-yellow-400' : 'text-orange-600'}`}>
                {treeProgress?.consistency_streak || 0} days
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>LiftCoins Earned</span>
              <span className={`font-bold ${darkMode ? 'text-yellow-400' : 'text-green-600'}`}>
                {treeProgress?.lift_coins || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Average Per Week</span>
              <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {analyticsData.averagePerWeek} sessions
              </span>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Goals & Achievements
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Weekly Goal (5 sessions)
                </span>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  3/5
                </span>
              </div>
              <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-3`}>
                <div className={`${darkMode ? 'bg-gradient-to-r from-green-400 to-yellow-400' : 'bg-gradient-to-r from-blue-400 to-green-400'} h-3 rounded-full`} style={{ width: '60%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Monthly Challenge
                </span>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {treeProgress?.total_sessions || 0}/20
                </span>
              </div>
              <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-3`}>
                <div className={`${darkMode ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gradient-to-r from-purple-400 to-pink-400'} h-3 rounded-full`} style={{ width: `${Math.min(((treeProgress?.total_sessions || 0) / 20) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Comprehensive Settings Section
const SettingsSection = ({ user, onLogout }) => {
  const { darkMode, toggleDarkMode } = useContext(AppContext);
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    friendActivity: true,
    achievements: true,
    weeklyReports: false
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    shareProgress: true,
    allowFriendRequests: true
  });

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
        Settings
      </h1>

      {/* Profile Section */}
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Profile Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
              Email
            </label>
            <input 
              type="email" 
              value={user.email} 
              disabled
              className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-300'} border`}
            />
          </div>
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
              Account Type
            </label>
            <input 
              type="text" 
              value={user.role.replace('_', ' ')} 
              disabled
              className={`w-full p-3 rounded-lg capitalize ${darkMode ? 'bg-gray-800 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-300'} border`}
            />
          </div>
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
              Fitness Goals
            </label>
            <div className="flex flex-wrap gap-2">
              {user.fitness_goals.map(goal => (
                <span 
                  key={goal}
                  className={`px-3 py-1 text-sm rounded-full capitalize ${darkMode ? 'bg-green-900 text-green-300' : 'bg-blue-100 text-blue-800'}`}
                >
                  {goal.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Appearance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SVGIcons.Theme size={24} darkMode={darkMode} />
              <div>
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Theme Mode
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Switch between light and dark themes
                </p>
              </div>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                darkMode ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Notifications
        </h3>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'} capitalize`}>
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {key === 'workoutReminders' && 'Get reminded about your scheduled workouts'}
                  {key === 'friendActivity' && 'See when friends complete workouts'}
                  {key === 'achievements' && 'Celebrate your fitness milestones'}
                  {key === 'weeklyReports' && 'Receive weekly progress summaries'}
                </p>
              </div>
              <button 
                onClick={() => setNotifications({...notifications, [key]: !value})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? (darkMode ? 'bg-green-600' : 'bg-blue-600') : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Privacy & Social
        </h3>
        <div className="space-y-4">
          {Object.entries(privacy).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'} capitalize`}>
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {key === 'profileVisible' && 'Make your profile visible to other users'}
                  {key === 'shareProgress' && 'Allow friends to see your workout progress'}
                  {key === 'allowFriendRequests' && 'Let other users send you friend requests'}
                </p>
              </div>
              <button 
                onClick={() => setPrivacy({...privacy, [key]: !value})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? (darkMode ? 'bg-green-600' : 'bg-blue-600') : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Account Actions
        </h3>
        <div className="space-y-3">
          <button className={`w-full p-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Export Data
          </button>
          <button className={`w-full p-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}>
            Reset Progress
          </button>
          <button 
            onClick={onLogout}
            className="w-full p-3 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

// Other existing sections (TreeSection, SessionsSection, ProfileSection) remain the same
const TreeSection = ({ treeProgress, user }) => {
  const { darkMode } = useContext(AppContext);

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
        Your Growth Journey
      </h1>

      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6 md:p-8 text-center`}>
        {treeProgress && (
          <div className="space-y-6">
            <TreeSVG level={treeProgress.current_level} size={150} />
            
            <div>
              <h3 className={`text-xl md:text-2xl font-bold capitalize ${darkMode ? 'text-yellow-400' : 'text-green-600'} mb-2`}>
                {treeProgress.current_level.replace('_', ' ')}
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm md:text-base`}>
                Growth Progress: {Math.round(treeProgress.progress_percentage)}%
              </p>
            </div>

            <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-4`}>
              <div 
                className={`${darkMode ? 'bg-gradient-to-r from-green-400 to-yellow-400' : 'bg-gradient-to-r from-blue-400 to-green-400'} h-4 rounded-full transition-all duration-1000`}
                style={{ width: `${treeProgress.progress_percentage}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-3 rounded-lg`}>
                <div className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
                  {treeProgress.total_sessions}
                </div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sessions</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-3 rounded-lg`}>
                <div className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-orange-600'}`}>
                  {treeProgress.consistency_streak}
                </div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Streak</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-3 rounded-lg`}>
                <div className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {treeProgress.current_score}
                </div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Score</div>
              </div>
            </div>

            <div className="text-left space-y-4">
              <h4 className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>All Levels</h4>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {['seed', 'sprout', 'sapling', 'young_tree', 'mature_tree', 'strong_oak', 'mighty_pine', 'ancient_elm', 'giant_sequoia', 'redwood'].map((level, index) => (
                  <div key={level} className={`text-center p-2 rounded-lg ${treeProgress.current_level === level ? (darkMode ? 'bg-green-900/50 border border-green-400' : 'bg-blue-100 border border-blue-300') : (darkMode ? 'bg-gray-800/30' : 'bg-gray-50')}`}>
                    <TreeSVG level={level} size={30} />
                    <p className={`text-xs mt-1 capitalize ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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

const SessionsSection = ({ sessions, onCompleteSession }) => {
  const { darkMode } = useContext(AppContext);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Your Sessions
        </h1>
        <button 
          onClick={onCompleteSession}
          className={`${darkMode ? 'premium-button-primary' : 'premium-button-light'} px-4 py-2 text-sm`}
        >
          + New Session
        </button>
      </div>

      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h3 className={`text-lg md:text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Recent Activity
        </h3>
        
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <SVGIcons.Sessions size={64} color={darkMode ? '#C4D600' : '#3b82f6'} className="mx-auto mb-4" />
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-base md:text-lg mb-4`}>
              No sessions yet
            </p>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
              Complete your first workout to start growing your tree! 🌱
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 10).map(session => (
              <div key={session.id} className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-4 rounded-xl flex justify-between items-center`}>
                <div className="flex items-center space-x-4">
                  <SVGIcons.Sessions size={24} color={darkMode ? '#C4D600' : '#3b82f6'} />
                  <div>
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {session.session_type}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {session.duration_minutes} min • {new Date(session.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <LiftCoin count={session.lift_coins_earned} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileSection = ({ user, onLogout, treeProgress }) => {
  const { darkMode, toggleDarkMode } = useContext(AppContext);

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
        Profile
      </h1>

      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6 text-center`}>
        <div className={`w-20 h-20 mx-auto rounded-full ${darkMode ? 'bg-gradient-to-br from-green-900 to-green-700' : 'bg-gradient-to-br from-blue-100 to-blue-200'} flex items-center justify-center text-3xl mb-4`}>
          <SVGIcons.Profile size={32} color={darkMode ? '#C4D600' : '#3b82f6'} />
        </div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>
          {user.email.split('@')[0]}
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} capitalize mb-4`}>
          {user.role.replace('_', ' ')}
        </p>
        <div className="flex justify-center">
          <LiftCoin count={treeProgress?.lift_coins || 0} size="lg" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
          <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'} mb-1`}>
            {treeProgress?.total_sessions || 0}
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Sessions</p>
        </div>
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
          <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-orange-600'} mb-1`}>
            {treeProgress?.consistency_streak || 0}
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Day Streak</p>
        </div>
      </div>

      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Quick Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SVGIcons.Theme size={20} darkMode={darkMode} />
              <div>
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dark Mode</h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Switch themes
                </p>
              </div>
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

          <button 
            onClick={onLogout}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Onboarding with better error handling
const OnboardingScreen = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    fitness_goals: [],
    experience_level: ''
  });

  const roles = [
    { id: 'fitness_enthusiast', title: 'Fitness Enthusiast', desc: 'Transform your fitness journey', icon: SVGIcons.Profile },
    { id: 'trainer', title: 'Professional Trainer', desc: 'Help others achieve their goals', icon: SVGIcons.Trainers }
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
    setLoading(true);
    setError('');
    
    try {
      // Validate form data
      if (!formData.email || !formData.role || formData.fitness_goals.length === 0 || !formData.experience_level) {
        throw new Error('Please fill in all required fields');
      }

      console.log('Submitting registration:', formData);
      const response = await axios.post(`${API}/users`, formData);
      console.log('Registration successful:', response.data);
      
      localStorage.setItem('liftlink_user', JSON.stringify(response.data));
      onComplete(response.data);
    } catch (error) {
      console.error('Registration failed:', error);
      
      if (error.response) {
        // Server responded with error
        setError(error.response.data?.detail || 'Registration failed. Please try again.');
      } else if (error.request) {
        // Network error
        setError('Network error. Please check your connection and try again.');
      } else {
        // Other error
        setError(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 0:
        return (
          <div className="text-center space-y-6 md:space-y-8">
            <div className="space-y-4">
              <LiftLinkLogo size={100} />
              <TreeSVG level="seed" size={80} />
            </div>
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-green-400">Welcome to LiftLink</h2>
              <p className="text-gray-400 text-sm md:text-base">Start your fitness transformation today</p>
            </div>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="premium-input w-full max-w-sm mx-auto"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              {error && step === 0 && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
            </div>
            <button 
              onClick={() => setStep(1)}
              disabled={!formData.email}
              className="premium-button-primary w-full max-w-sm mx-auto"
            >
              Begin Journey →
            </button>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-green-400 mb-2">Choose Your Path</h2>
              <p className="text-gray-400 text-sm">Select your role to customize your experience</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setFormData({...formData, role: role.id})}
                  className={`glass-card-dark p-6 text-left transition-all ${
                    formData.role === role.id ? 'ring-2 ring-green-400 bg-green-900/20' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <role.icon size={32} color="#C4D600" />
                    <div>
                      <h3 className="text-lg font-bold text-green-400">{role.title}</h3>
                      <p className="text-gray-300 text-sm">{role.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setStep(0)} className="premium-button-secondary flex-1">
                ← Back
              </button>
              <button 
                onClick={() => setStep(2)}
                disabled={!formData.role}
                className="premium-button-primary flex-1"
              >
                Continue →
              </button>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-green-400 mb-2">Fitness Goals</h2>
              <p className="text-gray-400 text-sm">What do you want to achieve?</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {fitnessGoals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => {
                    const goals = formData.fitness_goals.includes(goal.id)
                      ? formData.fitness_goals.filter(g => g !== goal.id)
                      : [...formData.fitness_goals, goal.id];
                    setFormData({...formData, fitness_goals: goals});
                  }}
                  className={`glass-card-dark p-4 text-center transition-all ${
                    formData.fitness_goals.includes(goal.id) ? 'ring-2 ring-yellow-400 bg-yellow-900/20' : ''
                  }`}
                >
                  <div className="text-2xl mb-2">{goal.icon}</div>
                  <h3 className="text-sm font-bold text-yellow-400">{goal.title}</h3>
                </button>
              ))}
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setStep(1)} className="premium-button-secondary flex-1">
                ← Back
              </button>
              <button 
                onClick={() => setStep(3)}
                disabled={formData.fitness_goals.length === 0}
                className="premium-button-primary flex-1"
              >
                Continue →
              </button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-green-400 mb-2">Experience Level</h2>
              <p className="text-gray-400 text-sm">Tell us about your fitness background</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {experienceLevels.map(level => (
                <button
                  key={level.id}
                  onClick={() => setFormData({...formData, experience_level: level.id})}
                  className={`glass-card-dark p-4 text-left transition-all ${
                    formData.experience_level === level.id ? 'ring-2 ring-blue-400 bg-blue-900/20' : ''
                  }`}
                >
                  <h3 className="text-lg font-bold text-blue-400">{level.title}</h3>
                  <p className="text-gray-300 text-sm">{level.desc}</p>
                </button>
              ))}
            </div>
            {error && (
              <div className="text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div className="flex space-x-3">
              <button onClick={() => setStep(2)} className="premium-button-secondary flex-1">
                ← Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!formData.experience_level || loading}
                className="premium-button-primary flex-1"
              >
                {loading ? 'Creating Account...' : 'Complete Setup 🚀'}
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
      <div className="max-w-md w-full">
        <div className="mb-6 text-center">
          <div className="flex justify-center space-x-2 mb-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? 'bg-green-400' : 'bg-gray-600'}`} />
            ))}
          </div>
        </div>
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
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('liftlink_user');
      }
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
      case 'friends':
        return <FriendsSection />;
      case 'analytics':
        return <AnalyticsSection treeProgress={treeProgress} sessions={sessions} />;
      case 'settings':
        return <SettingsSection user={user} onLogout={handleLogout} />;
      case 'profile':
        return <ProfileSection user={user} onLogout={handleLogout} treeProgress={treeProgress} />;
      default:
        return <Dashboard user={user} treeProgress={treeProgress} onCompleteSession={completeSession} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen cyberpunk-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <LiftLinkLogo size={80} />
          <TreeSVG level="seed" size={60} />
          <p className="text-green-400 text-lg">Loading LiftLink...</p>
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
          <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'cyberpunk-bg' : 'light-mode-bg'}`}>
            <SideNavigation activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />
            <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />
            
            <header className={`hidden md:block fixed top-0 left-64 right-0 ${darkMode ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-md border-b ${darkMode ? 'border-green-400/30' : 'border-gray-200'} p-4 z-30`}>
              <div className="flex justify-between items-center">
                <button 
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-600'}`}
                >
                  <SVGIcons.Theme size={20} darkMode={darkMode} />
                </button>
                <div className="flex items-center space-x-4">
                  <LiftCoin count={treeProgress?.lift_coins || 0} />
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Level: {treeProgress?.current_level?.replace('_', ' ') || 'Seed'}
                  </div>
                </div>
              </div>
            </header>

            <main className={`${activeTab !== 'profile' ? 'md:pl-64 md:pt-20' : 'md:pl-64 md:pt-20'} p-4 md:p-6 pb-20 md:pb-6`}>
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