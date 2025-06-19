import React, { useState, useEffect, useContext, createContext } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Context for theme and user
const AppContext = createContext();

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

// Main Components
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
              <h1 className="text-6xl font-bold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
                LIFTLINK
              </h1>
              <p className="text-xl text-gray-300 mt-4">Elite Fitness Ecosystem</p>
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

const Dashboard = ({ user, onLogout }) => {
  const { darkMode, toggleDarkMode } = useContext(AppContext);
  const [treeProgress, setTreeProgress] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchTreeProgress();
    fetchSessions();
  }, []);

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
        session_type: 'workout',
        duration_minutes: 45
      });
      
      // Refresh data
      fetchTreeProgress();
      fetchSessions();
      
      // Show coin animation
      setTimeout(() => {
        window.location.reload(); // Simple refresh to update user data
      }, 1000);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'cyberpunk-bg' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-black/50' : 'bg-white/80'} backdrop-blur-md border-b ${darkMode ? 'border-green-400/30' : 'border-gray-200'} p-4`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            LIFTLINK
          </h1>
          <div className="flex items-center space-x-4">
            <LiftCoin count={treeProgress?.lift_coins || 0} />
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-600'}`}
            >
              {darkMode ? '🌞' : '🌙'}
            </button>
            <button 
              onClick={onLogout}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-red-900/50 text-red-400 border border-red-400' : 'bg-red-100 text-red-600 border border-red-300'}`}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Tree Progress */}
        <div className={`${darkMode ? 'cyberpunk-card' : 'bg-white rounded-xl shadow-lg border border-gray-200'} p-8 mb-8 text-center`}>
          <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Your Growth Journey
          </h2>
          
          {treeProgress && (
            <div className="space-y-6">
              <TreeSVG level={treeProgress.current_level} size={150} />
              
              <div>
                <h3 className={`text-xl font-bold capitalize ${darkMode ? 'text-yellow-400' : 'text-green-600'}`}>
                  {treeProgress.current_level.replace('_', ' ')}
                </h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
                  Progress: {Math.round(treeProgress.progress_percentage)}%
                </p>
              </div>

              <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-4`}>
                <div 
                  className={`${darkMode ? 'bg-gradient-to-r from-green-400 to-yellow-400' : 'bg-gradient-to-r from-blue-400 to-green-400'} h-4 rounded-full transition-all duration-1000`}
                  style={{ width: `${treeProgress.progress_percentage}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-4 rounded-lg`}>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
                    {treeProgress.total_sessions}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Sessions</div>
                </div>
                <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-4 rounded-lg`}>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-orange-600'}`}>
                    {treeProgress.consistency_streak}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Streak</div>
                </div>
                <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-4 rounded-lg`}>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {treeProgress.current_score}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Growth Score</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button 
            onClick={completeSession}
            className={`${darkMode ? 'cyberpunk-button-primary' : 'bg-blue-600 hover:bg-blue-700 text-white'} p-6 rounded-xl text-xl font-bold transition-all duration-300 transform hover:scale-105`}
          >
            Complete Workout Session 💪
          </button>
          
          <button 
            className={`${darkMode ? 'cyberpunk-button-secondary' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} p-6 rounded-xl text-xl font-bold transition-all duration-300 transform hover:scale-105`}
          >
            Find AI Trainer 🤖
          </button>
        </div>

        {/* Recent Sessions */}
        <div className={`${darkMode ? 'cyberpunk-card' : 'bg-white rounded-xl shadow-lg border border-gray-200'} p-6`}>
          <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Recent Sessions
          </h3>
          
          {sessions.length === 0 ? (
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-center py-8`}>
              No sessions yet. Complete your first workout to start growing your tree! 🌱
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 5).map(session => (
                <div key={session.id} className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-4 rounded-lg flex justify-between items-center`}>
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {session.session_type}
                    </span>
                    <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {session.duration_minutes} minutes
                    </span>
                  </div>
                  <LiftCoin count={session.lift_coins_earned} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Check for existing user
    const savedUser = localStorage.getItem('liftlink_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('liftlink_user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen cyberpunk-bg flex items-center justify-center">
        <div className="text-center">
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
          <Dashboard user={user} onLogout={handleLogout} />
        )}
      </div>
    </AppContext.Provider>
  );
}

export default App;