import React, { useState, useEffect, useContext, createContext } from "react";
import "./App.css";
import axios from "axios";
import DocumentVerification from "./DocumentVerification";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const FITBIT_CLIENT_ID = process.env.REACT_APP_FITBIT_CLIENT_ID;
const GOOGLE_FIT_CLIENT_ID = process.env.REACT_APP_GOOGLE_FIT_CLIENT_ID;

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
  const [mode, setMode] = useState('email'); // 'email', 'signin', 'onboarding', 'verification'
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

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
      } else if (error.response?.status === 403) {
        // Verification required
        setError(error.response.data.detail);
        // For existing users who need verification, we need to get their user data first
        if (error.response.data.detail.includes('Age verification required') || 
            error.response.data.detail.includes('certification verification required')) {
          
          // Try to get user data from check-user endpoint to get the user ID
          try {
            const checkResponse = await axios.post(`${API}/check-user`, { email });
            if (checkResponse.data.exists && checkResponse.data.user_id) {
              setPendingUser({ 
                id: checkResponse.data.user_id, 
                email, 
                role: checkResponse.data.role || 'trainee'
              });
              setMode('verification');
            } else {
              setError('Unable to verify user. Please try signing up first.');
            }
          } catch (err) {
            console.error('Error getting user data:', err);
            setError('Unable to verify user information. Please try again.');
          }
        }
      } else {
        setError('Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = (userData) => {
    // After onboarding, user needs document verification
    setPendingUser(userData);
    setMode('verification');
  };

  const handleVerificationComplete = (verificationData) => {
    // After verification, automatically sign in
    if (verificationData.age_verified) {
      handleSignIn();
    }
  };

  if (mode === 'verification') {
    return (
      <DocumentVerification 
        user={pendingUser}
        userRole={pendingUser?.role || 'trainee'}
        onVerificationComplete={handleVerificationComplete}
        darkMode={true}
      />
    );
  }

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
    name: '',
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
              <h2 className="text-xl md:text-2xl font-bold text-green-400 mb-2">What's your name?</h2>
              <p className="text-gray-400 text-sm">Tell us what to call you</p>
            </div>
            <div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-3">
              <button onClick={onBack} className="premium-button-secondary flex-1">
                ← Back
              </button>
              <button 
                onClick={() => setStep(1)}
                disabled={!formData.name || formData.name.trim().length < 2}
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
              <h2 className="text-xl md:text-2xl font-bold text-green-400 mb-2">Choose Your Role</h2>
              <p className="text-gray-400 text-sm">How do you want to use LiftLink?</p>
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
              <button onClick={() => setStep(2)} className="premium-button-secondary flex-1">
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
    { id: 'fitness', label: 'Fitness', icon: SVGIcons.Analytics }
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
    { id: 'fitness', label: 'Fitness Devices', icon: SVGIcons.Analytics },
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

// Trainer CRM Dashboard - Main Component
const TrainerDashboard = ({ user, onLogout }) => {
  const { darkMode, toggleDarkMode } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'cyberpunk-bg' : 'light-mode-bg'}`}>
      <TrainerSideNavigation activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />
      <TrainerMobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />
      
      <header className={`hidden md:block fixed top-0 left-64 right-0 ${darkMode ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-md border-b ${darkMode ? 'border-green-400/30' : 'border-gray-200'} p-4 z-30`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <LiftLinkLogo size={40} showTagline={false} />
            <span className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>Trainer Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-600'}`}
            >
              <SVGIcons.Theme size={20} darkMode={darkMode} />
            </button>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {user?.email}
            </div>
            <button 
              onClick={onLogout}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="md:pl-64 md:pt-20 p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto">
          {renderTrainerContent(activeTab, user)}
        </div>
      </main>
    </div>
  );
};

// Trainer Side Navigation
const TrainerSideNavigation = ({ activeTab, setActiveTab, darkMode }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: SVGIcons.Home },
    { id: 'clients', label: 'Client Management', icon: SVGIcons.Profile },
    { id: 'checkin', label: 'Check-in System', icon: SVGIcons.Sessions },
    { id: 'schedule', label: 'My Schedule', icon: SVGIcons.Analytics },
    { id: 'earnings', label: 'Earnings', icon: SVGIcons.Rewards },
    { id: 'reviews', label: 'Reviews & Ratings', icon: SVGIcons.Friends },
    { id: 'profile', label: 'My Profile', icon: SVGIcons.Settings }
  ];

  return (
    <nav className={`hidden md:block fixed left-0 top-0 h-full w-64 ${darkMode ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-md border-r ${darkMode ? 'border-green-400/30' : 'border-gray-200'} z-40 transition-all duration-300`}>
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <LiftLinkLogo size={40} showTagline={false} />
          <span className={`text-sm font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>Trainer</span>
        </div>
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

// Trainer Mobile Navigation
const TrainerMobileNavigation = ({ activeTab, setActiveTab, darkMode }) => {
  const { toggleDarkMode } = useContext(AppContext);
  
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: SVGIcons.Home },
    { id: 'clients', label: 'Clients', icon: SVGIcons.Profile },
    { id: 'checkin', label: 'Check-in', icon: SVGIcons.Sessions },
    { id: 'schedule', label: 'Schedule', icon: SVGIcons.Analytics },
    { id: 'earnings', label: 'Earnings', icon: SVGIcons.Rewards }
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

// Trainer Dashboard Content
const TrainerDashboardMain = ({ user }) => {
  const { darkMode } = useContext(AppContext);
  const [clients, setClients] = useState([]);
  const [todaysSessions, setTodaysSessions] = useState([]);
  const [earnings, setEarnings] = useState({});

  useEffect(() => {
    // Mock data - in real app, this would come from API
    setClients([
      { id: '1', name: 'John Smith', email: 'john@example.com', nextSession: '2025-01-08 10:00', status: 'active' },
      { id: '2', name: 'Sarah Wilson', email: 'sarah@example.com', nextSession: '2025-01-08 14:00', status: 'active' },
      { id: '3', name: 'Mike Johnson', email: 'mike@example.com', nextSession: '2025-01-09 09:00', status: 'pending' }
    ]);
    
    setTodaysSessions([
      { id: '1', clientName: 'John Smith', time: '10:00 AM', duration: '60 min', status: 'upcoming' },
      { id: '2', clientName: 'Sarah Wilson', time: '2:00 PM', duration: '45 min', status: 'upcoming' },
      { id: '3', clientName: 'Alex Brown', time: '4:00 PM', duration: '60 min', status: 'completed' }
    ]);
    
    setEarnings({
      today: 225,
      thisWeek: 1250,
      thisMonth: 4800,
      pending: 150
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'} mb-2`}>
          Welcome back, {user?.email?.split('@')[0]}! 💪
        </h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Ready to help your clients reach their fitness goals?
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
          <div className="text-3xl mb-2">👥</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            {clients.length}
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Clients</p>
        </div>
        
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
          <div className="text-3xl mb-2">📅</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-green-600'}`}>
            {todaysSessions.length}
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Today's Sessions</p>
        </div>
        
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
          <div className="text-3xl mb-2">💰</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-green-600'}`}>
            ${earnings.thisWeek}
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Week</p>
        </div>
        
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
          <div className="text-3xl mb-2">⭐</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            4.9
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rating</p>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Today's Schedule
        </h2>
        <div className="space-y-3">
          {todaysSessions.map(session => (
            <div key={session.id} className={`p-4 rounded-lg border ${
              darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {session.clientName}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {session.time} • {session.duration}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  session.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : session.status === 'upcoming'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {session.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Clients */}
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Recent Clients
        </h2>
        <div className="space-y-3">
          {clients.slice(0, 3).map(client => (
            <div key={client.id} className={`p-4 rounded-lg border ${
              darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {client.name}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Next: {client.nextSession}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {client.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Client Management Component
const TrainerClientManagement = ({ user }) => {
  const { darkMode } = useContext(AppContext);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Mock data - in real app, this would come from API
    setClients([
      {
        id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        joinDate: '2024-12-01',
        status: 'active',
        totalSessions: 24,
        lastSession: '2025-01-05',
        fitnessGoals: ['weight_loss', 'cardio'],
        notes: 'Making great progress with cardio. Needs help with nutrition planning.'
      },
      {
        id: '2',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone: '+1 (555) 234-5678',
        joinDate: '2024-11-15',
        status: 'active',
        totalSessions: 32,
        lastSession: '2025-01-06',
        fitnessGoals: ['muscle_building', 'strength'],
        notes: 'Strong dedication. Ready for advanced strength training programs.'
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+1 (555) 345-6789',
        joinDate: '2024-12-20',
        status: 'pending',
        totalSessions: 3,
        lastSession: '2024-12-28',
        fitnessGoals: ['general_fitness'],
        notes: 'New client. Assessing current fitness level and preferences.'
      }
    ]);
  }, []);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h1 className={`text-2xl md:text-3xl font-bold mb-6 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Client Management
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search clients..."
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-green-400 focus:border-transparent`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SVGIcons.Profile size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <select
            className={`px-4 py-3 rounded-lg border ${
              darkMode 
                ? 'bg-gray-800/50 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-green-400 focus:border-transparent`}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Clients</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClients.map(client => (
          <div key={client.id} className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {client.name}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {client.email}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {client.phone}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                client.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : client.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {client.status}
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Sessions:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{client.totalSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Last Session:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{client.lastSession}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Member Since:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{client.joinDate}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Fitness Goals:</p>
              <div className="flex flex-wrap gap-1">
                {client.fitnessGoals.map(goal => (
                  <span key={goal} className={`px-2 py-1 text-xs rounded-full ${
                    darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
                  }`}>
                    {goal.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Notes:</p>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{client.notes}</p>
            </div>
            
            <div className="flex space-x-2">
              <button className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}>
                View Details
              </button>
              <button className={`flex-1 px-3 py-2 rounded-lg border font-medium transition-colors ${
                darkMode 
                  ? 'border-gray-600 hover:bg-gray-800/50 text-white' 
                  : 'border-gray-300 hover:bg-gray-50 text-gray-900'
              }`}>
                Schedule Session
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Check-in System Component
const TrainerCheckinSystem = ({ user }) => {
  const { darkMode } = useContext(AppContext);
  const [pendingCheckins, setPendingCheckins] = useState([]);
  const [todayCheckins, setTodayCheckins] = useState([]);

  useEffect(() => {
    // Mock data - in real app, this would come from API
    setPendingCheckins([
      {
        id: '1',
        clientName: 'John Smith',
        sessionTime: '10:00 AM',
        sessionType: 'Personal Training',
        duration: '60 min',
        status: 'waiting'
      },
      {
        id: '2',
        clientName: 'Sarah Wilson',
        sessionTime: '2:00 PM',
        sessionType: 'Strength Training',
        duration: '45 min',
        status: 'waiting'
      }
    ]);
    
    setTodayCheckins([
      {
        id: '3',
        clientName: 'Mike Johnson',
        sessionTime: '8:00 AM',
        sessionType: 'Cardio Training',
        duration: '45 min',
        status: 'completed',
        checkinTime: '7:58 AM'
      }
    ]);
  }, []);

  const handleCheckin = (sessionId) => {
    const session = pendingCheckins.find(s => s.id === sessionId);
    if (session) {
      // Move to completed
      setTodayCheckins([...todayCheckins, { 
        ...session, 
        status: 'completed', 
        checkinTime: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      }]);
      // Remove from pending
      setPendingCheckins(pendingCheckins.filter(s => s.id !== sessionId));
    }
  };

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h1 className={`text-2xl md:text-3xl font-bold mb-6 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Check-in System
        </h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Confirm client arrivals and manage session check-ins
        </p>
      </div>

      {/* Pending Check-ins */}
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Pending Check-ins ({pendingCheckins.length})
        </h2>
        
        {pendingCheckins.length > 0 ? (
          <div className="space-y-4">
            {pendingCheckins.map(session => (
              <div key={session.id} className={`p-4 rounded-lg border-2 border-yellow-400 bg-yellow-400/10`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {session.clientName}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {session.sessionTime} • {session.sessionType} • {session.duration}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleCheckin(session.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      ✓ Check In
                    </button>
                    <button className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg font-medium transition-colors">
                      ✗ No Show
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              All caught up!
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No pending check-ins at the moment
            </p>
          </div>
        )}
      </div>

      {/* Today's Completed Check-ins */}
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Today's Completed Sessions ({todayCheckins.length})
        </h2>
        
        <div className="space-y-3">
          {todayCheckins.map(session => (
            <div key={session.id} className={`p-4 rounded-lg border ${
              darkMode ? 'border-green-600 bg-green-900/20' : 'border-green-400 bg-green-50'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {session.clientName}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {session.sessionTime} • {session.sessionType} • {session.duration}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    Checked in at: {session.checkinTime}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Completed
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Function to render trainer content based on active tab
const renderTrainerContent = (activeTab, user) => {
  switch(activeTab) {
    case 'dashboard':
      return <TrainerDashboardMain user={user} />;
    case 'clients':
      return <TrainerClientManagement user={user} />;
    case 'checkin':
      return <TrainerCheckinSystem user={user} />;
    case 'schedule':
      return <TrainerSchedule user={user} />;
    case 'earnings':
      return <TrainerEarnings user={user} />;
    case 'reviews':
      return <TrainerReviews user={user} />;
    case 'profile':
      return <TrainerProfile user={user} />;
    default:
      return <TrainerDashboardMain user={user} />;
  }
};

// Enhanced Trainer Features Components
const TrainerSchedule = ({ user }) => {
  const { darkMode } = useContext(AppContext);
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, [user.id, selectedDate]);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`${API}/trainer/${user.id}/schedule`);
      setSchedule(response.data.schedule);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return darkMode ? 'text-green-400' : 'text-green-600';
      case 'pending': return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'cancelled': return darkMode ? 'text-red-400' : 'text-red-600';
      default: return darkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Schedule Management
          </h1>
          <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}>
            + New Appointment
          </button>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${
              darkMode ? 'bg-gray-800/50 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-green-400`}
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading schedule...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.length === 0 ? (
              <div className="text-center py-8">
                <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No appointments scheduled for this date
                </div>
              </div>
            ) : (
              schedule.map((appointment) => (
                <div key={appointment.id} className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
                  darkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {appointment.title}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        📍 {appointment.location}
                      </p>
                      {appointment.notes && (
                        <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          💭 {appointment.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.toUpperCase()}
                      </span>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {appointment.session_type}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TrainerEarnings = ({ user }) => {
  const { darkMode } = useContext(AppContext);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('');

  useEffect(() => {
    fetchEarnings();
  }, [user.id]);

  const fetchEarnings = async () => {
    try {
      const response = await axios.get(`${API}/trainer/${user.id}/earnings`);
      setEarnings(response.data);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async () => {
    try {
      const amount = Math.round(parseFloat(payoutAmount) * 100);
      await axios.post(`${API}/trainer/${user.id}/payout`, { amount });
      alert(`Payout request of $${payoutAmount} submitted successfully!`);
      setPayoutAmount('');
      fetchEarnings();
    } catch (error) {
      alert('Failed to request payout. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6 text-center`}>
        <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading earnings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Earnings Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              ${earnings?.total_earnings?.toFixed(2) || '0.00'}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Earnings</div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              ${earnings?.this_month?.toFixed(2) || '0.00'}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Month</div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              ${earnings?.pending_payments?.toFixed(2) || '0.00'}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Payments</h3>
            <div className="space-y-2">
              {earnings?.recent_payments?.map((payment, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {payment.client_name}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {payment.date} • {payment.session_type}
                    </div>
                  </div>
                  <div className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ${payment.amount.toFixed(2)}
                  </div>
                </div>
              )) || []}
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Request Payout</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-800/50 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-green-400`}
                  placeholder="0.00"
                />
              </div>
              <button
                onClick={requestPayout}
                disabled={!payoutAmount || parseFloat(payoutAmount) <= 0}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  !payoutAmount || parseFloat(payoutAmount) <= 0
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Request Payout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrainerReviews = ({ user }) => {
  const { darkMode } = useContext(AppContext);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [user.id]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/trainer/${user.id}/reviews`);
      setReviews(response.data.reviews);
      setAvgRating(response.data.avg_rating);
      setTotalReviews(response.data.total_reviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
    ));
  };

  if (loading) {
    return (
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6 text-center`}>
        <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Reviews & Ratings
        </h1>

        <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-6 rounded-lg border ${
          darkMode ? 'border-gray-600' : 'border-gray-200'
        } mb-6`}>
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-yellow-400">
              {avgRating.toFixed(1)}
            </div>
            <div>
              <div className="flex text-xl">
                {renderStars(Math.round(avgRating))}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Based on {totalReviews} reviews
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
              darkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {review.client_name}
                  </h3>
                  <div className="flex text-sm text-yellow-400">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {review.date}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {review.session_type}
                  </div>
                </div>
              </div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TrainerProfile = ({ user }) => {
  const { darkMode } = useContext(AppContext);
  const [profile, setProfile] = useState({
    bio: "Certified personal trainer with 5+ years of experience helping clients achieve their fitness goals.",
    specialties: ["Weight Loss", "Strength Training", "Nutrition Coaching"],
    certifications: ["NASM-CPT", "Precision Nutrition Level 1"],
    hourlyRate: 75,
    availability: "Monday-Friday 6AM-8PM"
  });

  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    console.log('Saving profile:', profile);
    setEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Trainer Profile
          </h1>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {editing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              disabled={!editing}
              rows={4}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-800/50 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-400 ${!editing ? 'cursor-not-allowed opacity-75' : ''}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Hourly Rate ($)
            </label>
            <input
              type="number"
              value={profile.hourlyRate}
              onChange={(e) => setProfile({...profile, hourlyRate: parseInt(e.target.value)})}
              disabled={!editing}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-800/50 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-400 ${!editing ? 'cursor-not-allowed opacity-75' : ''}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Availability
            </label>
            <input
              type="text"
              value={profile.availability}
              onChange={(e) => setProfile({...profile, availability: e.target.value})}
              disabled={!editing}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-800/50 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-400 ${!editing ? 'cursor-not-allowed opacity-75' : ''}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Specialties
            </label>
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map((specialty, index) => (
                <span key={index} className={`px-3 py-1 rounded-full text-sm ${
                  darkMode ? 'bg-green-600 text-white' : 'bg-blue-100 text-blue-800'
                }`}>
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Certifications
            </label>
            <div className="flex flex-wrap gap-2">
              {profile.certifications.map((cert, index) => (
                <span key={index} className={`px-3 py-1 rounded-full text-sm ${
                  darkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800'
                }`}>
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Google Maps Component for Trainers
const TrainerMap = ({ trainers, selectedTrainer, onTrainerSelect }) => {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markersRef = React.useRef([]);

  useEffect(() => {
    if (window.google && mapRef.current) {
      // Initialize map
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.7589, lng: -73.9851 }, // Default to NYC
        zoom: 12,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry.fill',
            stylers: [{ color: '#1a1a1a' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#0f4c75' }]
          }
        ]
      });

      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add markers for trainers
      trainers.forEach(trainer => {
        const marker = new window.google.maps.Marker({
          position: { lat: trainer.lat, lng: trainer.lng },
          map: mapInstanceRef.current,
          title: trainer.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#C4D600" stroke="#fff" stroke-width="2"/>
                <text x="20" y="26" text-anchor="middle" font-size="20" fill="#000">💪</text>
              </svg>
            `)
          }
        });

        // Add click listener
        marker.addListener('click', () => {
          onTrainerSelect(trainer);
        });

        markersRef.current.push(marker);
      });
    }
  }, [trainers, onTrainerSelect]);

  // Highlight selected trainer
  useEffect(() => {
    if (selectedTrainer && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: selectedTrainer.lat, lng: selectedTrainer.lng });
      mapInstanceRef.current.setZoom(15);
    }
  }, [selectedTrainer]);

  return <div ref={mapRef} className="w-full h-full" />;
};
// Trainers Section Component (updated with Google Maps)
const TrainersSection = ({ user }) => {
  const { darkMode } = useContext(AppContext);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  useEffect(() => {
    // Load Google Maps
    if (!window.google && GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here') {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      setMapLoaded(true);
    }

    // Mock trainer data with locations
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
          address: '123 Main St, Downtown',
          lat: 40.7128,
          lng: -74.0060,
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
          address: '456 Oak Ave, Midtown',
          lat: 40.7589,
          lng: -73.9851,
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
          address: '789 Pine St, Uptown',
          lat: 40.7831,
          lng: -73.9712,
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
          address: '321 Elm St, Downtown',
          lat: 40.7505,
          lng: -73.9934,
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Section */}
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Trainer Locations
          </h2>
          <div className="h-96 rounded-lg overflow-hidden">
            {mapLoaded && GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here' ? (
              <TrainerMap trainers={filteredTrainers} selectedTrainer={selectedTrainer} onTrainerSelect={setSelectedTrainer} />
            ) : (
              <div className={`h-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-lg`}>
                <div className="text-center">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Map will appear here with Google Maps API
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trainers List */}
        <div className="space-y-4">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Available Trainers ({filteredTrainers.length})
          </h2>
          
          {filteredTrainers.map(trainer => (
            <div 
              key={trainer.id} 
              className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 hover:scale-105 transition-transform duration-200 cursor-pointer ${
                selectedTrainer?.id === trainer.id ? 'ring-2 ring-green-400' : ''
              }`}
              onClick={() => setSelectedTrainer(trainer)}
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{trainer.image}</div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{trainer.name}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{trainer.location}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{trainer.address}</p>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{trainer.rating}</span>
                    </div>
                    <span className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{trainer.sessions} sessions</span>
                    <span className={`text-sm font-bold ${darkMode ? 'text-yellow-400' : 'text-green-600'}`}>{trainer.price}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {trainer.specialties.slice(0, 2).map(specialty => (
                      <span key={specialty} className={`px-2 py-1 text-xs rounded-full ${
                        darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
                      }`}>
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  darkMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}>
                  Book
                </button>
              </div>
            </div>
          ))}
          
          {filteredTrainers.length === 0 && (
            <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-8 text-center`}>
              <SVGIcons.Trainers size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No trainers found</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
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

// Fitness Integration Section Component
const FitnessIntegrationSection = ({ user }) => {
  const { darkMode } = useContext(AppContext);
  const [fitbitConnected, setFitbitConnected] = useState(false);
  const [googleFitConnected, setGoogleFitConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSync, setLastSync] = useState(null);
  const [fitnessData, setFitnessData] = useState({});

  useEffect(() => {
    // Check connection status
    checkConnectionStatus();
    if (fitbitConnected || googleFitConnected) {
      fetchFitnessData();
    }
  }, [fitbitConnected, googleFitConnected]);

  const checkConnectionStatus = async () => {
    try {
      const response = await axios.get(`${API}/fitness/status/${user.id}`);
      setFitbitConnected(response.data.fitbit_connected);
      setGoogleFitConnected(response.data.google_fit_connected);
      setLastSync(response.data.last_sync);
    } catch (error) {
      console.error('Failed to check fitness connection status:', error);
    }
  };

  const connectFitbit = async () => {
    try {
      const response = await axios.get(`${API}/fitbit/login`);
      window.location.href = response.data.authorization_url;
    } catch (error) {
      console.error('Failed to connect to Fitbit:', error);
      alert('Failed to connect to Fitbit. Please try again.');
    }
  };

  const connectGoogleFit = async () => {
    try {
      const response = await axios.get(`${API}/google-fit/login`);
      window.location.href = response.data.authorization_url;
    } catch (error) {
      console.error('Failed to connect to Google Fit:', error);
      alert('Failed to connect to Google Fit. Please try again.');
    }
  };

  const syncData = async () => {
    setSyncStatus('syncing');
    try {
      const response = await axios.post(`${API}/sync/workouts`, { user_id: user.id });
      setSyncStatus('success');
      setLastSync(new Date().toISOString());
      fetchFitnessData();
      alert(`Successfully synced ${response.data.synced_workouts} workouts!`);
    } catch (error) {
      setSyncStatus('error');
      console.error('Failed to sync fitness data:', error);
      alert('Failed to sync fitness data. Please try again.');
    }
  };

  const fetchFitnessData = async () => {
    try {
      const response = await axios.get(`${API}/fitness/data/${user.id}`);
      setFitnessData(response.data);
    } catch (error) {
      console.error('Failed to fetch fitness data:', error);
    }
  };

  const disconnectFitbit = async () => {
    try {
      await axios.delete(`${API}/fitbit/disconnect/${user.id}`);
      setFitbitConnected(false);
      alert('Fitbit disconnected successfully!');
    } catch (error) {
      console.error('Failed to disconnect Fitbit:', error);
      alert('Failed to disconnect Fitbit. Please try again.');
    }
  };

  const disconnectGoogleFit = async () => {
    try {
      await axios.delete(`${API}/google-fit/disconnect/${user.id}`);
      setGoogleFitConnected(false);
      alert('Google Fit disconnected successfully!');
    } catch (error) {
      console.error('Failed to disconnect Google Fit:', error);
      alert('Failed to disconnect Google Fit. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h1 className={`text-2xl md:text-3xl font-bold mb-6 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Fitness Device Integration
        </h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
          Connect your fitness trackers and apps to automatically sync your workouts to LiftLink
        </p>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fitbit Integration */}
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">⌚</div>
              <div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Fitbit
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Connect your Fitbit device
                </p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${fitbitConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
          </div>
          
          {fitbitConnected ? (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                  ✓ Connected and syncing data
                </p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={syncData}
                  disabled={syncStatus === 'syncing'}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    syncStatus === 'syncing' 
                      ? 'opacity-50 cursor-not-allowed' 
                      : darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                </button>
                <button 
                  onClick={disconnectFitbit}
                  className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={connectFitbit}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Connect Fitbit
            </button>
          )}
        </div>

        {/* Google Fit Integration */}
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">📱</div>
              <div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Google Fit
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Connect your Google Fit data
                </p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${googleFitConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
          </div>
          
          {googleFitConnected ? (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                  ✓ Connected and syncing data
                </p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={syncData}
                  disabled={syncStatus === 'syncing'}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    syncStatus === 'syncing' 
                      ? 'opacity-50 cursor-not-allowed' 
                      : darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                </button>
                <button 
                  onClick={disconnectGoogleFit}
                  className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={connectGoogleFit}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Connect Google Fit
            </button>
          )}
        </div>
      </div>

      {/* Sync Status */}
      {(fitbitConnected || googleFitConnected) && (
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Sync Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-1`}>
                {fitnessData.total_workouts || 0}
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Synced Workouts
              </p>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-1`}>
                {fitnessData.this_week || 0}
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                This Week
              </p>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mb-1`}>
                {fitnessData.avg_duration || 0}min
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Duration
              </p>
            </div>
          </div>
          
          {lastSync && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Last sync: {new Date(lastSync).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Synced Workouts */}
      {fitnessData.recent_workouts && fitnessData.recent_workouts.length > 0 && (
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Recent Synced Workouts
          </h2>
          
          <div className="space-y-3">
            {fitnessData.recent_workouts.slice(0, 5).map((workout, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {workout.activity_type}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {workout.duration} minutes • {workout.calories} calories
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(workout.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      From {workout.source}
                    </div>
                    {workout.auto_confirmed && (
                      <div className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        Auto-confirmed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      {!fitbitConnected && !googleFitConnected && (
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Why Connect Your Fitness Devices?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Automatic Sync
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Your workouts are automatically detected and recorded
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Better Analytics
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Get detailed insights from your fitness tracker data
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Accurate Tracking
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Real heart rate, calories, and duration data
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
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

// Rewards Section Component
const RewardsSection = ({ user, treeProgress }) => {
  const { darkMode } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('earn');

  const rewardCategories = [
    {
      id: 'badges',
      name: 'Achievement Badges',
      items: [
        { id: 'first_session', name: 'First Steps', description: 'Complete your first workout', earned: true, coins: 25 },
        { id: 'week_streak', name: 'Week Warrior', description: '7-day consistency streak', earned: (treeProgress?.consistency_streak || 0) >= 7, coins: 100 },
        { id: 'month_streak', name: 'Monthly Master', description: '30-day consistency streak', earned: (treeProgress?.consistency_streak || 0) >= 30, coins: 500 },
        { id: 'tree_level_5', name: 'Growing Strong', description: 'Reach Tree Level 5', earned: false, coins: 200 },
        { id: 'hundred_sessions', name: 'Century Club', description: 'Complete 100 sessions', earned: false, coins: 1000 }
      ]
    }
  ];

  const quickEarnMethods = [
    { action: 'Complete a workout session', coins: 50, icon: '💪' },
    { action: 'Maintain 7-day streak', coins: 100, icon: '🔥' },
    { action: 'Invite a friend', coins: 200, icon: '👥' },
    { action: 'Complete weekly challenge', coins: 150, icon: '🏆' },
    { action: 'Update your profile', coins: 25, icon: '👤' },
    { action: 'Rate a trainer', coins: 30, icon: '⭐' }
  ];

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Rewards Center
          </h1>
          <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-3 rounded-lg`}>
            <LiftCoin count={treeProgress?.lift_coins || 0} size="lg" />
          </div>
        </div>
        
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('earn')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'earn'
                ? (darkMode ? 'bg-green-600 text-white' : 'bg-blue-600 text-white')
                : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
            }`}
          >
            Earn Coins
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'achievements'
                ? (darkMode ? 'bg-green-600 text-white' : 'bg-blue-600 text-white')
                : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
            }`}
          >
            Achievements
          </button>
        </div>
      </div>

      {activeTab === 'earn' && (
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Quick Ways to Earn LiftCoins
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickEarnMethods.map((method, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{method.icon}</span>
                    <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{method.action}</span>
                  </div>
                  <LiftCoin count={method.coins} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {rewardCategories.map(category => (
            <div key={category.id} className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
                {category.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map(item => (
                  <div key={item.id} className={`p-4 rounded-lg border-2 ${
                    item.earned 
                      ? (darkMode ? 'border-green-500 bg-green-900/20' : 'border-green-400 bg-green-50')
                      : (darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50')
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-bold ${
                        item.earned 
                          ? (darkMode ? 'text-green-400' : 'text-green-600')
                          : (darkMode ? 'text-white' : 'text-gray-900')
                      }`}>
                        {item.name}
                      </h3>
                      {item.earned && <span className="text-green-400 text-xl">✓</span>}
                    </div>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                    <LiftCoin count={item.coins} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Friends Section Component (Enhanced with functional features)
const FriendsSection = ({ user }) => {
  const { darkMode } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data - in real app, this would come from API
    setFriends([
      { id: '1', name: 'Alex Johnson', level: 'mature_tree', coins: 2500, streak: 15, avatar: '🧑‍💼', status: 'online' },
      { id: '2', name: 'Maria Garcia', level: 'strong_oak', coins: 3200, streak: 22, avatar: '👩‍💻', status: 'offline' },
      { id: '3', name: 'David Kim', level: 'sapling', coins: 1100, streak: 8, avatar: '👨‍🎨', status: 'online' }
    ]);
    
    setRequests([
      { id: '4', name: 'Sarah Wilson', level: 'young_tree', avatar: '👩‍🔬', mutualFriends: 2 },
      { id: '5', name: 'Mike Chen', level: 'mature_tree', avatar: '👨‍💼', mutualFriends: 1 }
    ]);
    
    setLeaderboard([
      { id: '1', name: 'Maria Garcia', level: 'strong_oak', coins: 3200, streak: 22, avatar: '👩‍💻', rank: 1, weeklyProgress: 450 },
      { id: '2', name: 'You', level: 'sapling', coins: 1850, streak: 5, avatar: '👤', rank: 2, weeklyProgress: 320 },
      { id: '3', name: 'Alex Johnson', level: 'mature_tree', coins: 2500, streak: 15, avatar: '🧑‍💼', rank: 3, weeklyProgress: 280 },
      { id: '4', name: 'David Kim', level: 'sapling', coins: 1100, streak: 8, avatar: '👨‍🎨', rank: 4, weeklyProgress: 220 },
      { id: '5', name: 'Sarah Wilson', level: 'young_tree', coins: 950, streak: 12, avatar: '👩‍🔬', rank: 5, weeklyProgress: 180 },
      { id: '6', name: 'Mike Chen', level: 'mature_tree', coins: 2100, streak: 18, avatar: '👨‍💼', rank: 6, weeklyProgress: 150 },
      { id: '7', name: 'Emily Brown', level: 'sapling', coins: 880, streak: 6, avatar: '👩‍🎓', rank: 7, weeklyProgress: 120 },
      { id: '8', name: 'James Lee', level: 'young_tree', coins: 720, streak: 4, avatar: '👨‍🚀', rank: 8, weeklyProgress: 100 }
    ]);
  }, []);

  const acceptRequest = (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setFriends([...friends, { 
        ...request, 
        coins: Math.floor(Math.random() * 2000) + 500, 
        streak: Math.floor(Math.random() * 20) + 1,
        status: 'online'
      }]);
      setRequests(requests.filter(r => r.id !== requestId));
    }
  };

  const rejectRequest = (requestId) => {
    setRequests(requests.filter(r => r.id !== requestId));
  };

  const handleAddFriend = async () => {
    if (!friendEmail.trim()) return;
    
    // Simulate API call
    try {
      // Mock adding friend request
      const newRequest = {
        id: Date.now().toString(),
        name: friendEmail.split('@')[0],
        level: 'sapling',
        avatar: '👤',
        mutualFriends: 0
      };
      
      alert(`Friend request sent to ${friendEmail}!`);
      setFriendEmail('');
      setShowAddFriend(false);
      
      // In real app, this would send a friend request
    } catch (error) {
      alert('Failed to send friend request. Please try again.');
    }
  };

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h1 className={`text-2xl md:text-3xl font-bold mb-6 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Friends & Community
        </h1>
        
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'friends'
                ? (darkMode ? 'bg-green-600 text-white' : 'bg-blue-600 text-white')
                : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
              activeTab === 'requests'
                ? (darkMode ? 'bg-green-600 text-white' : 'bg-blue-600 text-white')
                : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
            }`}
          >
            Requests
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {requests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? (darkMode ? 'bg-green-600 text-white' : 'bg-blue-600 text-white')
                : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
            }`}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {activeTab === 'friends' && (
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
              Your Friends
            </h2>
            <button 
              onClick={() => setShowAddFriend(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Add Friend
            </button>
          </div>

          {/* Search Friends */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search friends..."
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-green-400 focus:border-transparent`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {filteredFriends.length > 0 ? (
            <div className="space-y-4">
              {filteredFriends.map(friend => (
                <div key={friend.id} className={`p-4 rounded-lg border ${
                  darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="text-3xl">{friend.avatar}</div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
                          friend.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div>
                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {friend.name}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Level: {friend.level.replace('_', ' ')} • {friend.streak} day streak
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {friend.status === 'online' ? '🟢 Online' : '⚫ Offline'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <LiftCoin count={friend.coins} size="sm" />
                      <div className="flex space-x-2 mt-2">
                        <button className={`px-3 py-1 text-xs rounded-lg ${
                          darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}>
                          Challenge
                        </button>
                        <button className={`px-3 py-1 text-xs rounded-lg ${
                          darkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'
                        }`}>
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <SVGIcons.Friends size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {searchTerm ? 'No friends found' : 'No friends yet'}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchTerm ? 'Try a different search term' : 'Add friends to compete and motivate each other!'}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
          <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Friend Requests
          </h2>
          
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map(request => (
                <div key={request.id} className={`p-4 rounded-lg border ${
                  darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{request.avatar}</div>
                      <div>
                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {request.name}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Level: {request.level.replace('_', ' ')}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {request.mutualFriends} mutual friends
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => acceptRequest(request.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => rejectRequest(request.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📭</div>
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No pending requests</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You're all caught up!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
          <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Weekly Leaderboard
          </h2>
          
          <div className="space-y-3">
            {leaderboard.map(user => (
              <div key={user.id} className={`p-4 rounded-lg border ${
                user.name === 'You' 
                  ? (darkMode ? 'border-green-500 bg-green-900/20' : 'border-blue-500 bg-blue-50')
                  : (darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50')
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      user.rank === 1 ? 'bg-yellow-400 text-black' :
                      user.rank === 2 ? 'bg-gray-300 text-black' :
                      user.rank === 3 ? 'bg-orange-400 text-black' :
                      (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900')
                    }`}>
                      {user.rank}
                    </div>
                    <div className="text-2xl">{user.avatar}</div>
                    <div>
                      <h3 className={`font-bold ${
                        user.name === 'You' 
                          ? (darkMode ? 'text-green-400' : 'text-blue-600')
                          : (darkMode ? 'text-white' : 'text-gray-900')
                      }`}>
                        {user.name}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.level.replace('_', ' ')} • {user.streak} day streak
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <LiftCoin count={user.coins} size="sm" />
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      +{user.weeklyProgress} this week
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className={`mt-6 p-4 rounded-lg border-2 border-dashed ${
            darkMode ? 'border-gray-600' : 'border-gray-300'
          }`}>
            <div className="text-center">
              <div className="text-2xl mb-2">🏆</div>
              <h3 className={`font-bold mb-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                Weekly Challenge
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Earn 500+ LiftCoins this week to climb the leaderboard!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full ${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
              Add Friend
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Friend's Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-green-400 focus:border-transparent`}
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
                />
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowAddFriend(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${
                    darkMode 
                      ? 'border-gray-600 hover:bg-gray-800/50 text-white' 
                      : 'border-gray-300 hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddFriend}
                  disabled={!friendEmail.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    !friendEmail.trim() 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  } ${
                    darkMode 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Analytics Section Component (Enhanced with comprehensive analytics)
const AnalyticsSection = ({ user, treeProgress, sessions }) => {
  const { darkMode } = useContext(AppContext);
  const [timeFilter, setTimeFilter] = useState('week');
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    // Generate comprehensive analytics data
    const generateAnalytics = () => {
      const today = new Date();
      const weekData = {
        sessions: sessions?.slice(0, 7).length || 5,
        coins: (sessions?.slice(0, 7).length || 5) * 50,
        streak: treeProgress?.consistency_streak || 7,
        progress: 15,
        avgDuration: 42,
        totalDuration: 210,
        weeklyGoal: 5,
        weeklyProgress: Math.min(100, ((sessions?.slice(0, 7).length || 5) / 5) * 100)
      };
      
      const monthData = {
        sessions: sessions?.length || 18,
        coins: (sessions?.length || 18) * 50,
        streak: treeProgress?.consistency_streak || 7,
        progress: 45,
        avgDuration: 45,
        totalDuration: 810,
        monthlyGoal: 20,
        monthlyProgress: Math.min(100, ((sessions?.length || 18) / 20) * 100)
      };
      
      const yearData = {
        sessions: 156,
        coins: 7800,
        streak: 22,
        progress: 78,
        avgDuration: 43,
        totalDuration: 6708,
        yearlyGoal: 200,
        yearlyProgress: 78
      };

      return { week: weekData, month: monthData, year: yearData };
    };

    setAnalyticsData(generateAnalytics());
  }, [sessions, treeProgress]);

  const currentData = analyticsData[timeFilter] || {};

  // Generate chart data for the last 7 days
  const getWeeklyChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sessionCounts = [1, 0, 1, 1, 0, 1, 1]; // Mock data
    const maxSessions = Math.max(...sessionCounts, 1);
    
    return days.map((day, index) => ({
      day,
      sessions: sessionCounts[index],
      height: (sessionCounts[index] / maxSessions) * 100
    }));
  };

  const weeklyData = getWeeklyChartData();

  // Generate monthly trend data
  const getMonthlyTrend = () => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const progressData = [65, 72, 68, 85]; // Mock data
    
    return weeks.map((week, index) => ({
      week,
      progress: progressData[index]
    }));
  };

  const monthlyTrend = getMonthlyTrend();

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Progress Analytics
          </h1>
          <select
            className={`px-4 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-800/50 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-green-400 focus:border-transparent`}
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
            <SVGIcons.Sessions size={32} className={`mx-auto mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentData.sessions || 0}
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sessions</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              Avg: {currentData.avgDuration || 0} min
            </p>
          </div>
          
          <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
            <LiftCoin count={currentData.coins || 0} size="md" />
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Coins Earned</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              +{Math.round((currentData.coins || 0) * 0.15)} bonus
            </p>
          </div>
          
          <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
            <div className="text-3xl mb-2">🔥</div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
              {currentData.streak || 0}
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Day Streak</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
              Personal best!
            </p>
          </div>
          
          <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
            <div className="text-3xl mb-2">📈</div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {currentData.progress || 0}%
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Goal Progress</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              On track!
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Weekly Activity
        </h2>
        <div className="flex items-end justify-between h-32 space-x-2">
          {weeklyData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className={`w-full rounded-t-lg transition-all duration-500 ${
                darkMode ? 'bg-green-500' : 'bg-blue-500'
              }`} style={{ height: `${data.height}%`, minHeight: data.sessions > 0 ? '20px' : '4px' }}>
              </div>
              <span className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {data.day}
              </span>
              <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {data.sessions}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${darkMode ? 'bg-green-500' : 'bg-blue-500'}`}></div>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sessions completed</span>
            </div>
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Goal: {currentData.weeklyGoal || 5} sessions/week
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Trends */}
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Monthly Progress Trend
          </h2>
          <div className="space-y-3">
            {monthlyTrend.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {data.week}
                </span>
                <div className="flex items-center space-x-2 flex-1 ml-4">
                  <div className={`flex-1 h-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full`}>
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        darkMode ? 'bg-gradient-to-r from-green-400 to-yellow-400' : 'bg-gradient-to-r from-blue-400 to-green-400'
                      }`}
                      style={{ width: `${data.progress}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {data.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Types Breakdown */}
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Session Types
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cardio</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-20 h-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full`}>
                  <div className="w-3/5 h-2 bg-red-500 rounded-full"></div>
                </div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>60%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Strength</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-20 h-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full`}>
                  <div className="w-2/5 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>35%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Flexibility</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-20 h-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full`}>
                  <div className="w-1/5 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Detailed Statistics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
              {currentData.totalDuration || 0}
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Minutes Exercised
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              = {Math.round((currentData.totalDuration || 0) / 60)} hours
            </p>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mb-2`}>
              {Math.round((currentData.weeklyProgress || 0))}%
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Goal Completion
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {timeFilter === 'week' ? 'Weekly' : timeFilter === 'month' ? 'Monthly' : 'Yearly'} target
            </p>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>
              {Math.round((currentData.coins || 0) / (currentData.sessions || 1))}
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg Coins per Session
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              Standard: 50 coins
            </p>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Recent Achievements
        </h2>
        <div className="space-y-3">
          <div className={`p-3 rounded-lg border-l-4 border-green-400 ${
            darkMode ? 'bg-green-900/20' : 'bg-green-50'
          }`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏆</span>
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                  Week Warrior
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Completed 7-day consistency streak
                </p>
              </div>
              <LiftCoin count={100} size="sm" />
            </div>
          </div>
          
          <div className={`p-3 rounded-lg border-l-4 border-blue-400 ${
            darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
          }`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🌱</span>
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                  Tree Growth
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Reached {treeProgress?.current_level?.replace('_', ' ') || 'Sapling'} level
                </p>
              </div>
              <LiftCoin count={75} size="sm" />
            </div>
          </div>
          
          <div className={`p-3 rounded-lg border-l-4 border-purple-400 ${
            darkMode ? 'bg-purple-900/20' : 'bg-purple-50'
          }`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                  Quick Session
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Completed session in under 30 minutes
                </p>
              </div>
              <LiftCoin count={25} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Section Component
const SettingsSection = ({ user, onLogout }) => {
  const { darkMode, toggleDarkMode } = useContext(AppContext);

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h1 className={`text-2xl md:text-3xl font-bold mb-6 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Settings
        </h1>
      </div>

      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Profile Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-800/50 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-400 focus:border-transparent`}
              disabled
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Account Type
            </label>
            <div className={`w-full px-3 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-800/50 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } cursor-not-allowed opacity-75`}>
              {user?.role === 'trainer' ? 'Professional Trainer' : 'Fitness Enthusiast'}
            </div>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Account type cannot be changed. Contact support if you need to upgrade to a trainer account.
            </p>
          </div>
        </div>
      </div>

      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Appearance Settings
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Dark Mode
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Toggle between light and dark themes
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h2 className={`text-xl font-bold mb-4 text-red-400`}>
          Account Actions
        </h2>
        <button
          onClick={onLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

// Profile Section Component (for mobile)
const ProfileSection = ({ user, treeProgress, onLogout }) => {
  const { darkMode } = useContext(AppContext);

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6 text-center`}>
        <div className="mb-4">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-white">👤</span>
          </div>
          <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {user?.email || 'User'}
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {user?.role?.replace('_', ' ') || 'Fitness Enthusiast'}
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
              {treeProgress?.total_sessions || 0}
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sessions</p>
          </div>
          <div className="text-center">
            <div className={`text-xl font-bold ${darkMode ? 'text-yellow-400' : 'text-green-600'}`}>
              {treeProgress?.lift_coins || 0}
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>LiftCoins</p>
          </div>
          <div className="text-center">
            <div className={`text-xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
              {treeProgress?.consistency_streak || 0}
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Streak</p>
          </div>
        </div>
      </div>

      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Current Tree Level
        </h2>
        <div className="flex items-center space-x-4">
          <TreeSVG level={treeProgress?.current_level || 'seed'} size={60} />
          <div className="flex-1">
            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {treeProgress?.current_level?.replace('_', ' ') || 'Seed'}
            </h3>
            <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-2 mt-2`}>
              <div 
                className={`${darkMode ? 'bg-gradient-to-r from-green-400 to-yellow-400' : 'bg-gradient-to-r from-blue-400 to-green-400'} h-2 rounded-full`}
                style={{ width: `${treeProgress?.progress_percentage || 0}%` }}
              ></div>
            </div>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {Math.round(treeProgress?.progress_percentage || 0)}% to next level
            </p>
          </div>
        </div>
      </div>

      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Quick Actions
        </h2>
        <div className="space-y-3">
          <button className={`w-full p-3 rounded-lg border transition-colors ${
            darkMode 
              ? 'border-gray-600 hover:bg-gray-800/50 text-white' 
              : 'border-gray-300 hover:bg-gray-50 text-gray-900'
          }`}>
            Edit Profile
          </button>
          <button 
            onClick={onLogout}
            className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component (Updated - No manual session creation)
const Dashboard = ({ user, treeProgress }) => {
  const { darkMode } = useContext(AppContext);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6 md:p-8`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'} mb-2`}>
              Welcome back, {user?.email?.split('@')[0] || 'Fitness Champion'}! 🚀
            </h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Ready to grow your fitness tree today?
            </p>
          </div>
          <TreeSVG level={treeProgress?.current_level || 'seed'} size={80} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
          <div className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'} mb-1`}>
            {treeProgress?.total_sessions || 0}
          </div>
          <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sessions</p>
        </div>
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-4 text-center`}>
          <div className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'} mb-1`}>
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
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6 text-center space-y-2`}>
          <div className="text-3xl">⌚</div>
          <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Connect Fitness Device</div>
          <div className={`text-sm opacity-75 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Auto-track your workouts</div>
          <button className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
            darkMode 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}>
            Get Started
          </button>
        </div>
        
        <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6 text-center space-y-2`}>
          <div className="text-3xl">👨‍💼</div>
          <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Find Trainers</div>
          <div className={`text-sm opacity-75 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Book sessions with professionals</div>
          <button className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
            darkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}>
            Browse Trainers
          </button>
        </div>
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
    // This function is deprecated - sessions are now created through:
    // 1. Trainer confirmation via check-in system
    // 2. Automatic sync from fitness devices (Fitbit, Google Fit, etc.)
    alert('Sessions are now automatically tracked through your fitness devices or confirmed by trainers. Visit the Fitness section to connect your devices!');
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
        return <Dashboard user={user} treeProgress={treeProgress} />;
      case 'trainers':
        return <TrainersSection user={user} />;
      case 'tree':
        return <TreeSection user={user} treeProgress={treeProgress} />;
      case 'sessions':
        return <SessionsSection user={user} sessions={sessions} />;
      case 'fitness':
        return <FitnessIntegrationSection user={user} />;
      case 'rewards':
        return <RewardsSection user={user} treeProgress={treeProgress} />;
      case 'friends':
        return <FriendsSection user={user} />;
      case 'analytics':
        return <AnalyticsSection user={user} treeProgress={treeProgress} sessions={sessions} />;
      case 'settings':
        return <SettingsSection user={user} onLogout={handleLogout} />;
      case 'profile':
        return <ProfileSection user={user} treeProgress={treeProgress} onLogout={handleLogout} />;
      default:
        return <Dashboard user={user} treeProgress={treeProgress} />;
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
        ) : user.role === 'trainer' ? (
          <TrainerDashboard user={user} onLogout={handleLogout} />
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