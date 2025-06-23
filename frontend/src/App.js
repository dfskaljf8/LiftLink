import React, { useState, useEffect, useContext, createContext } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Context for theme and user
const AppContext = createContext();

// Email validation utility
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

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
  ),

  Email: ({ size = 24, color = "currentColor", className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" fill={color} opacity="0.2"/>
      <path fill={color} d="M2 8l10 6 10-6"/>
      <circle cx="18" cy="8" r="2" fill="#FFD700" className="animate-bounce"/>
    </svg>
  ),

  Lock: ({ size = 24, color = "currentColor", className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2" fill={color} opacity="0.2"/>
      <path fill={color} d="M8 11V7a4 4 0 1 1 8 0v4"/>
      <circle cx="12" cy="16" r="2" fill={color}/>
      <circle cx="12" cy="8" r="1" fill="#FFD700" className="animate-pulse"/>
    </svg>
  ),

  ArrowRight: ({ size = 24, color = "currentColor", className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path fill={color} d="M8 4l8 8-8 8"/>
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

// Authentication Flow Component
const AuthenticationFlow = ({ onComplete }) => {
  const [mode, setMode] = useState('email'); // 'email', 'signin', 'onboarding'
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailValid, setEmailValid] = useState(false);

  // Email validation in real-time
  useEffect(() => {
    setEmailValid(validateEmail(email));
    if (error && validateEmail(email)) {
      setError('');
    }
  }, [email, error]);

  const handleEmailSubmit = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/check-user`, { email });
      
      if (response.data.exists) {
        // User exists, route to sign-in
        setMode('signin');
      } else {
        // New user, route to onboarding
        setMode('onboarding');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/login`, { email });
      localStorage.setItem('liftlink_user', JSON.stringify(response.data));
      onComplete(response.data);
    } catch (error) {
      console.error('Sign in failed:', error);
      if (error.response?.status === 404) {
        setError('User not found. Please check your email or sign up.');
      } else {
        setError('Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = (userData) => {
    onComplete(userData);
  };

  if (mode === 'signin') {
    return <SignInScreen email={email} onSignIn={handleSignIn} onBack={() => setMode('email')} loading={loading} error={error} />;
  }

  if (mode === 'onboarding') {
    return <OnboardingScreen email={email} onComplete={handleOnboardingComplete} onBack={() => setMode('email')} />;
  }

  return (
    <div className="min-h-screen cyberpunk-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6 md:space-y-8">
          <div className="space-y-4">
            <LiftLinkLogo size={100} />
            <TreeSVG level="seed" size={80} />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-green-400">Welcome to LiftLink</h2>
            <p className="text-gray-400 text-sm md:text-base">
              Enter your email to sign in or create your account
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SVGIcons.Email size={20} color={emailValid ? '#C4D600' : '#9CA3AF'} />
              </div>
              <input
                type="email"
                placeholder="Enter your email address"
                className={`premium-input w-full pl-12 ${
                  emailValid ? 'border-green-400' : email ? 'border-red-400' : ''
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && emailValid && !loading && handleEmailSubmit()}
              />
              {email && !emailValid && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-red-400 text-sm">✗</span>
                </div>
              )}
              {emailValid && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-green-400 text-sm">✓</span>
                </div>
              )}
            </div>
            
            {error && (
              <div className="bg-red-900/20 border border-red-400/50 rounded-lg p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button 
              onClick={handleEmailSubmit}
              disabled={!emailValid || loading}
              className={`premium-button-primary w-full flex items-center justify-center space-x-2 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <SVGIcons.ArrowRight size={16} color="#000" />
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-xs">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sign In Screen Component
const SignInScreen = ({ email, onSignIn, onBack, loading, error }) => {
  return (
    <div className="min-h-screen cyberpunk-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <LiftLinkLogo size={80} />
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-400/50 rounded-lg p-4">
              <SVGIcons.Lock size={32} color="#C4D600" className="mx-auto mb-3" />
              <h2 className="text-xl font-bold text-green-400 mb-2">Welcome Back!</h2>
              <p className="text-gray-300 text-sm">
                We found your account for:
              </p>
              <p className="text-white font-medium mt-1">{email}</p>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-400/50 rounded-lg p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button 
                onClick={onSignIn}
                disabled={loading}
                className={`premium-button-primary w-full flex items-center justify-center space-x-2 ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <SVGIcons.Lock size={16} color="#000" />
                    <span>Sign In to LiftLink</span>
                  </>
                )}
              </button>

              <button 
                onClick={onBack}
                className="premium-button-secondary w-full"
                disabled={loading}
              >
                ← Use Different Email
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-xs">
              Secure sign-in • Your data is protected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Onboarding with proper validation and email pre-filled
const OnboardingScreen = ({ email, onComplete, onBack }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: email,
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
        setError(error.response.data?.detail || 'Registration failed. Please try again.');
      } else if (error.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
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
          <div className="space-y-6 md:space-y-8">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-green-400 mb-2">Let's Get Started!</h2>
              <p className="text-gray-400 text-sm">Creating account for {email}</p>
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
              <button onClick={onBack} className="premium-button-secondary flex-1">
                ← Back
              </button>
              <button 
                onClick={() => setStep(1)}
                disabled={!formData.role}
                className="premium-button-primary flex-1"
              >
                Continue →
              </button>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-green-400 mb-2">Fitness Goals</h2>
              <p className="text-gray-400 text-sm">What do you want to achieve? (Select multiple)</p>
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
                  {formData.fitness_goals.includes(goal.id) && (
                    <div className="mt-1 text-yellow-400">✓</div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setStep(0)} className="premium-button-secondary flex-1">
                ← Back
              </button>
              <button 
                onClick={() => setStep(2)}
                disabled={formData.fitness_goals.length === 0}
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
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-blue-400">{level.title}</h3>
                      <p className="text-gray-300 text-sm">{level.desc}</p>
                    </div>
                    {formData.experience_level === level.id && (
                      <div className="text-blue-400 text-xl">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {error && (
              <div className="bg-red-900/20 border border-red-400/50 rounded-lg p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}
            <div className="flex space-x-3">
              <button onClick={() => setStep(1)} className="premium-button-secondary flex-1">
                ← Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!formData.experience_level || loading}
                className="premium-button-primary flex-1"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Complete Setup 🚀'
                )}
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
          <LiftLinkLogo size={60} showTagline={false} />
          <div className="flex justify-center space-x-2 mt-4">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? 'bg-green-400' : 'bg-gray-600'}`} />
            ))}
          </div>
        </div>
        {renderStep()}
      </div>
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

// Enhanced Google Maps Component (keeping existing implementation)
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

// Trainers Section Component
const TrainersSection = ({ user }) => {
  const { darkMode } = useContext(AppContext);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock trainer data - in real app, this would come from API
    setTimeout(() => {
      setTrainers([
        {
          id: '1',
          name: 'Sarah Johnson',
          specialties: ['Weight Loss', 'HIIT', 'Nutrition'],
          experience: '5 years',
          rating: 4.9,
          sessions: 250,
          price: '$75/session',
          image: '👩‍💼',
          location: 'Downtown Gym',
          bio: 'Certified personal trainer specializing in weight loss and high-intensity training.'
        },
        {
          id: '2',
          name: 'Mike Chen',
          specialties: ['Strength Training', 'Powerlifting', 'Muscle Building'],
          experience: '8 years',
          rating: 4.8,
          sessions: 400,
          price: '$85/session',
          image: '👨‍💪',
          location: 'Iron House Gym',
          bio: 'Former competitive powerlifter focused on building strength and muscle mass.'
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          specialties: ['Yoga', 'Flexibility', 'Mindfulness'],
          experience: '6 years',
          rating: 5.0,
          sessions: 300,
          price: '$60/session',
          image: '🧘‍♀️',
          location: 'Zen Fitness Studio',
          bio: 'Certified yoga instructor combining physical fitness with mental wellness.'
        },
        {
          id: '4',
          name: 'David Kim',
          specialties: ['CrossFit', 'Functional Training', 'Athletic Performance'],
          experience: '7 years',
          rating: 4.7,
          sessions: 350,
          price: '$80/session',
          image: '🏃‍♂️',
          location: 'CrossFit Elite',
          bio: 'Former athlete specializing in functional movement and performance training.'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTrainers = trainers.filter(trainer => {
    const matchesSearch = trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainer.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'all' || trainer.specialties.some(spec => 
      spec.toLowerCase().includes(filter.toLowerCase())
    );
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6 text-center`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Finding the best trainers for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h1 className={`text-2xl md:text-3xl font-bold mb-6 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Find Your Perfect Trainer
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search trainers or specialties..."
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-green-400 focus:border-transparent`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SVGIcons.Trainers size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <select
            className={`px-4 py-3 rounded-lg border ${
              darkMode 
                ? 'bg-gray-800/50 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-green-400 focus:border-transparent`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Specialties</option>
            <option value="weight">Weight Loss</option>
            <option value="strength">Strength Training</option>
            <option value="yoga">Yoga</option>
            <option value="crossfit">CrossFit</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainers.map(trainer => (
          <div key={trainer.id} className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6 hover:scale-105 transition-transform duration-200`}>
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{trainer.image}</div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{trainer.name}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{trainer.location}</p>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Experience:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{trainer.experience}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rating:</span>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{trainer.rating}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sessions:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{trainer.sessions}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Specialties:</p>
              <div className="flex flex-wrap gap-1">
                {trainer.specialties.map(specialty => (
                  <span key={specialty} className={`px-2 py-1 text-xs rounded-full ${
                    darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
                  }`}>
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
            
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>{trainer.bio}</p>
            
            <div className="flex justify-between items-center">
              <span className={`text-lg font-bold ${darkMode ? 'text-yellow-400' : 'text-green-600'}`}>{trainer.price}</span>
              <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
                Book Session
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredTrainers.length === 0 && (
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-8 text-center`}>
          <SVGIcons.Trainers size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No trainers found</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

// Tree Section Component - Detailed Tree Progression
const TreeSection = ({ user, treeProgress }) => {
  const { darkMode } = useContext(AppContext);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const treeData = [
    { level: 'seed', name: 'Seed', description: 'Every great journey begins with a single seed', threshold: 0 },
    { level: 'sprout', name: 'Sprout', description: 'Your first steps toward fitness greatness', threshold: 5 },
    { level: 'sapling', name: 'Sapling', description: 'Growing stronger with each workout', threshold: 15 },
    { level: 'young_tree', name: 'Young Tree', description: 'Building a solid foundation', threshold: 30 },
    { level: 'mature_tree', name: 'Mature Tree', description: 'Consistent growth and development', threshold: 50 },
    { level: 'strong_oak', name: 'Strong Oak', description: 'Resilient and steadfast in your journey', threshold: 75 },
    { level: 'mighty_pine', name: 'Mighty Pine', description: 'Reaching new heights of fitness', threshold: 105 },
    { level: 'ancient_elm', name: 'Ancient Elm', description: 'Wisdom gained through experience', threshold: 140 },
    { level: 'giant_sequoia', name: 'Giant Sequoia', description: 'Towering achievement in fitness', threshold: 180 },
    { level: 'redwood', name: 'Redwood', description: 'The pinnacle of fitness mastery', threshold: 225 }
  ];

  const currentScore = (treeProgress?.total_sessions || 0) + ((treeProgress?.consistency_streak || 0) * 2);
  const currentLevelIndex = treeData.findIndex(tree => tree.level === treeProgress?.current_level) || 0;
  const [selectedLevel, setSelectedLevel] = useState(null);

  const treeData = [
    { level: 'seed', name: 'Seed', description: 'Every great journey begins with a single seed', threshold: 0 },
    { level: 'sprout', name: 'Sprout', description: 'Your first steps toward fitness greatness', threshold: 5 },
    { level: 'sapling', name: 'Sapling', description: 'Growing stronger with each workout', threshold: 15 },
    { level: 'young_tree', name: 'Young Tree', description: 'Building a solid foundation', threshold: 30 },
    { level: 'mature_tree', name: 'Mature Tree', description: 'Consistent growth and development', threshold: 50 },
    { level: 'strong_oak', name: 'Strong Oak', description: 'Resilient and steadfast in your journey', threshold: 75 },
    { level: 'mighty_pine', name: 'Mighty Pine', description: 'Reaching new heights of fitness', threshold: 105 },
    { level: 'ancient_elm', name: 'Ancient Elm', description: 'Wisdom gained through experience', threshold: 140 },
    { level: 'giant_sequoia', name: 'Giant Sequoia', description: 'Towering achievement in fitness', threshold: 180 },
    { level: 'redwood', name: 'Redwood', description: 'The pinnacle of fitness mastery', threshold: 225 }
  ];

  const currentScore = (treeProgress?.total_sessions || 0) + ((treeProgress?.consistency_streak || 0) * 2);
  const currentLevelIndex = treeData.findIndex(tree => tree.level === treeProgress?.current_level) || 0;

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h1 className={`text-2xl md:text-3xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Your Growth Journey
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
            <div className="text-center mb-4">
              <TreeSVG level={treeProgress?.current_level || 'seed'} size={80} />
            </div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Current Level
            </h3>
            <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
              {treeProgress?.current_level?.replace('_', ' ') || 'Seed'}
            </p>
          </div>
          
          <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
            <div className="text-4xl mb-2">💪</div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Progress Score
            </h3>
            <p className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-green-600'}`}>
              {currentScore}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Sessions + (Streak × 2)
            </p>
          </div>
          
          <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
            <LiftCoin count={treeProgress?.lift_coins || 0} size="lg" />
            <h3 className={`text-lg font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              LiftCoins
            </h3>
          </div>
        </div>
      </div>

      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          All Growth Levels
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {treeData.map((tree, index) => {
            const isUnlocked = index <= currentLevelIndex;
            const isCurrent = tree.level === treeProgress?.current_level;
            
            return (
              <div
                key={tree.level}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isCurrent 
                    ? (darkMode ? 'border-green-400 bg-green-900/30' : 'border-blue-500 bg-blue-100')
                    : isUnlocked
                    ? (darkMode ? 'border-gray-600 hover:border-gray-500 bg-gray-800/30' : 'border-gray-300 hover:border-gray-400 bg-gray-50')
                    : (darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-100')
                } ${!isUnlocked ? 'opacity-50' : ''}`}
                onClick={() => isUnlocked && setSelectedLevel(tree)}
              >
                <div className="text-center">
                  <div className="mb-2 relative">
                    <TreeSVG level={tree.level} size={60} />
                    {isCurrent && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-xs">👑</span>
                      </div>
                    )}
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <SVGIcons.Lock size={24} color="#666" />
                      </div>
                    )}
                  </div>
                  <h3 className={`text-sm font-bold ${
                    isCurrent 
                      ? (darkMode ? 'text-green-400' : 'text-blue-600')
                      : (darkMode ? 'text-white' : 'text-gray-900')
                  }`}>
                    {tree.name}
                  </h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Score: {tree.threshold}+
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedLevel && (
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
              {selectedLevel.name}
            </h3>
            <button 
              onClick={() => setSelectedLevel(null)}
              className={`text-2xl ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              ×
            </button>
          </div>
          <div className="flex items-center space-x-6">
            <TreeSVG level={selectedLevel.level} size={100} />
            <div className="flex-1">
              <p className={`text-lg mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {selectedLevel.description}
              </p>
              <div className="space-y-2">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Required Score:</strong> {selectedLevel.threshold}+
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Your Score:</strong> {currentScore}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sessions Section Component
const SessionsSection = ({ user, sessions, onCompleteSession }) => {
  const { darkMode } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const handleQuickSession = async (sessionType, duration) => {
    setLoading(true);
    try {
      await onCompleteSession();
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    return session.session_type.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h1 className={`text-2xl md:text-3xl font-bold mb-6 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Workout Sessions
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => handleQuickSession('Cardio Workout', 30)}
            disabled={loading}
            className={`p-4 rounded-lg border-2 transition-all ${
              darkMode 
                ? 'border-red-500 hover:bg-red-900/20 text-red-400' 
                : 'border-red-400 hover:bg-red-50 text-red-600'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-3xl mb-2">🏃‍♂️</div>
            <h3 className="font-bold">Cardio Session</h3>
            <p className="text-sm opacity-75">30 minutes • 50 LiftCoins</p>
          </button>
          
          <button
            onClick={() => handleQuickSession('Strength Training', 45)}
            disabled={loading}
            className={`p-4 rounded-lg border-2 transition-all ${
              darkMode 
                ? 'border-blue-500 hover:bg-blue-900/20 text-blue-400' 
                : 'border-blue-400 hover:bg-blue-50 text-blue-600'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-3xl mb-2">💪</div>
            <h3 className="font-bold">Strength Training</h3>
            <p className="text-sm opacity-75">45 minutes • 50 LiftCoins</p>
          </button>
          
          <button
            onClick={() => handleQuickSession('Flexibility Workout', 20)}
            disabled={loading}
            className={`p-4 rounded-lg border-2 transition-all ${
              darkMode 
                ? 'border-green-500 hover:bg-green-900/20 text-green-400' 
                : 'border-green-400 hover:bg-green-50 text-green-600'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-3xl mb-2">🧘‍♀️</div>
            <h3 className="font-bold">Flexibility</h3>
            <p className="text-sm opacity-75">20 minutes • 50 LiftCoins</p>
          </button>
        </div>
      </div>

      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Session History
          </h2>
          <select
            className={`px-3 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-800/50 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-green-400 focus:border-transparent`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Sessions</option>
            <option value="workout">Workout Sessions</option>
            <option value="cardio">Cardio</option>
            <option value="strength">Strength</option>
          </select>
        </div>
        
        {filteredSessions.length > 0 ? (
          <div className="space-y-3">
            {filteredSessions.map(session => (
              <div key={session.id} className={`p-4 rounded-lg border ${
                darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {session.session_type}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Duration: {session.duration_minutes} minutes
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(session.created_at).toLocaleDateString()} at {new Date(session.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <LiftCoin count={50} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <SVGIcons.Sessions size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No sessions yet</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Complete your first workout to start tracking your progress!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ user, treeProgress, onCompleteSession }) => {
  const { darkMode } = useContext(AppContext);
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
          <AuthenticationFlow onComplete={setUser} />
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