import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import './App.css';

// Auth Context
const AuthContext = createContext();

// API configuration
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

// Simple Auth Provider Component (without Firebase for now)
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Check for existing auth token
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/api/users/profile');
      setUserProfile(response.data);
    } catch (error) {
      console.log('User profile fetch error:', error.response?.data?.detail || error.message);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      // For demo purposes, simulate login
      let demoToken = '';
      let demoUser = {};
      
      if (email === 'user@demo.com' && password === 'demo123') {
        demoToken = 'demo_user';
        demoUser = { uid: 'demo_user_1', email, displayName: 'Demo User' };
      } else if (email === 'trainer@demo.com' && password === 'demo123') {
        demoToken = 'demo_trainer';
        demoUser = { uid: 'demo_user_2', email, displayName: 'Demo Trainer' };
      } else if (email === 'aaravdthakker@gmail.com' || email === 'aadidthakker@gmail.com' || email === 'sid.the.manne@gmail.com') {
        demoToken = 'demo_admin';
        demoUser = { uid: 'admin_aarav', email, displayName: 'Admin User' };
      } else {
        throw new Error('Invalid credentials');
      }
      
      localStorage.setItem('auth_token', demoToken);
      localStorage.setItem('user_data', JSON.stringify(demoUser));
      setUser(demoUser);
      
      // Try to register user in backend
      try {
        await api.post('/api/users/register', {
          email: demoUser.email,
          name: demoUser.displayName || demoUser.email.split('@')[0],
        });
      } catch (error) {
        console.log('User registration note:', error.response?.data?.detail || 'User may already exist');
      }
      
      // Get user profile
      const response = await api.get('/api/users/profile');
      setUserProfile(response.data);
      
      return { user: demoUser };
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (email, password) => {
    // For demo, redirect to login
    return await login(email, password);
  };

  const logout = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userProfile,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
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
        ((today.getMonth(), today.getDate()) < (birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
      
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

// Navigation Component
const Navigation = ({ currentView, setCurrentView }) => {
  const { userProfile, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { key: 'dashboard', label: 'Home', icon: '🏠' },
    { key: 'trainers', label: 'Find Trainers', icon: '🔍' },
    { key: 'bookings', label: 'My Bookings', icon: '📅' },
    { key: 'progress', label: 'Progress', icon: '📊' },
    { key: 'fitnessforest', label: 'FitnessForest', icon: '🌳' },
    { key: 'social', label: 'Social', icon: '👥' },
    { key: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  // Add trainer-specific items
  if (userProfile?.role === 'trainer') {
    navItems.splice(-1, 0, { key: 'trainer-dashboard', label: 'Trainer Hub', icon: '🏋️‍♂️' });
  }

  // Add admin items
  if (userProfile?.role === 'admin') {
    navItems.splice(-1, 0, { key: 'admin', label: 'Admin Panel', icon: '🛡️' });
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button 
        className="hamburger-btn"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">💪</span>
            <span className="logo-text">LiftLink</span>
          </div>
          <button className="sidebar-close" onClick={toggleSidebar}>×</button>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">
            {userProfile?.name?.charAt(0) || '👤'}
          </div>
          <div className="profile-info">
            <div className="profile-name">{userProfile?.name || 'User'}</div>
            <div className="profile-role">
              {userProfile?.role === 'trainer' ? '🏋️‍♂️ Trainer' : 
               userProfile?.role === 'admin' ? '🛡️ Admin' : '💪 Member'}
            </div>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-icon">🪙</span>
                <span className="stat-value">{userProfile?.lift_coins || 0}</span>
              </div>
              <div className="stat">
                <span className="stat-icon">⚡</span>
                <span className="stat-value">L{userProfile?.level || 1}</span>
              </div>
              <div className="stat">
                <span className="stat-icon">🔥</span>
                <span className="stat-value">{userProfile?.consecutive_days || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${currentView === item.key ? 'active' : ''}`}
              onClick={() => {
                setCurrentView(item.key);
                setSidebarOpen(false); // Close sidebar on mobile after navigation
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {currentView === item.key && <div className="nav-indicator"></div>}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

// Login Component
const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (error) {
      setError(error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-large">
            <span className="logo-lift">Lift</span>
            <span className="logo-link">Link</span>
          </div>
          <p className="tagline-large">Beginners to Believers</p>
          <p className="subtitle">Your fitness journey starts here</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
          
          <div className="form-toggle">
            <span>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)}
                className="toggle-btn"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </span>
          </div>
        </form>

        <div className="demo-section">
          <p className="demo-text">🚀 Quick Demo Access:</p>
          <div className="demo-buttons">
            <button 
              onClick={() => {setEmail('user@demo.com'); setPassword('demo123')}}
              className="demo-btn"
            >
              Demo User
            </button>
            <button 
              onClick={() => {setEmail('trainer@demo.com'); setPassword('demo123')}}
              className="demo-btn"
            >
              Demo Trainer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Home Dashboard Component
const HomeDashboard = ({ setCurrentView }) => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back! 💪</h1>
        <p>Ready to crush your fitness goals?</p>
      </div>

      <div className="stats-grid">
        {userProfile?.role === 'trainer' ? (
          <>
            <div className="stat-card">
              <div className="stat-number">{stats?.total_bookings || 0}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats?.confirmed_bookings || 0}</div>
              <div className="stat-label">Confirmed Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">${stats?.total_earnings?.toFixed(2) || '0.00'}</div>
              <div className="stat-label">Total Earnings</div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-number">{stats?.total_bookings || 0}</div>
              <div className="stat-label">Sessions Booked</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats?.confirmed_sessions || 0}</div>
              <div className="stat-label">Sessions Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">🔥</div>
              <div className="stat-label">Current Streak</div>
            </div>
          </>
        )}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button 
            className="action-btn primary"
            onClick={() => setCurrentView(userProfile?.role === 'trainer' ? 'trainer-dashboard' : 'trainers')}
          >
            {userProfile?.role === 'trainer' ? '📅 Manage Schedule' : '💪 Find Trainers'}
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => setCurrentView(userProfile?.role === 'trainer' ? 'bookings' : 'progress')}
          >
            {userProfile?.role === 'trainer' ? '👥 View Clients' : '📊 Track Progress'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Trainer Search Component
const TrainerSearch = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialty: '',
    maxRate: '',
    gym: ''
  });

  useEffect(() => {
    fetchTrainers();
  }, [filters]);

  const fetchTrainers = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.specialty) params.append('specialty', filters.specialty);
      if (filters.maxRate) params.append('max_rate', filters.maxRate);
      if (filters.gym) params.append('gym', filters.gym);

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

  return (
    <div className="trainer-search">
      <div className="search-header">
        <h1>Find Your Perfect Trainer 🎯</h1>
        <p>Connect with certified trainers in your area</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <select
            value={filters.specialty}
            onChange={(e) => setFilters({...filters, specialty: e.target.value})}
            className="filter-select"
          >
            <option value="">All Specialties</option>
            <option value="Weight Training">Weight Training</option>
            <option value="Cardio">Cardio</option>
            <option value="Yoga">Yoga</option>
            <option value="CrossFit">CrossFit</option>
            <option value="Personal Training">Personal Training</option>
          </select>
        </div>
        <div className="filter-group">
          <input
            type="number"
            placeholder="Max hourly rate"
            value={filters.maxRate}
            onChange={(e) => setFilters({...filters, maxRate: e.target.value})}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <input
            type="text"
            placeholder="Gym name"
            value={filters.gym}
            onChange={(e) => setFilters({...filters, gym: e.target.value})}
            className="filter-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Finding trainers...</div>
      ) : (
        <div className="trainers-grid">
          {trainers.length === 0 ? (
            <div className="no-trainers">
              <p>No trainers found. Try adjusting your filters.</p>
            </div>
          ) : (
            trainers.map((trainer) => (
              <div key={trainer.trainer_id} className="trainer-card">
                <div className="trainer-avatar">
                  {trainer.trainer_name?.charAt(0) || '👤'}
                </div>
                <div className="trainer-info">
                  <h3>{trainer.trainer_name}</h3>
                  <p className="trainer-gym">📍 {trainer.gym_name}</p>
                  <p className="trainer-bio">{trainer.bio}</p>
                  <div className="trainer-specialties">
                    {trainer.specialties.map((specialty, index) => (
                      <span key={index} className="specialty-tag">
                        {specialty}
                      </span>
                    ))}
                  </div>
                  <div className="trainer-details">
                    <span className="trainer-rate">${trainer.hourly_rate}/hr</span>
                    <span className="trainer-experience">{trainer.experience_years} years exp</span>
                  </div>
                  <button
                    onClick={() => handleBooking(trainer)}
                    className="book-btn"
                  >
                    Book Session 🔥
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Bookings Component
const MyBookings = () => {
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

// Progress Analytics Component with Advanced Data Visualization
const ProgressAnalytics = () => {
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
const AdminDashboard = () => {
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
                    {trainer.specialties?.map((specialty, index) => (
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
          {treeData.clients_impact.map((client, index) => (
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
                {client.recent_achievements.map((achievement, idx) => (
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

// Social Tracking Component
const SocialTracking = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [socialData, setSocialData] = useState({
    following: [],
    followers: [],
    feed: [],
    leaderboards: {},
    recommendations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocialData();
  }, []);

  const fetchSocialData = async () => {
    try {
      const [followingRes, followersRes, feedRes, leaderboardsRes, recommendationsRes] = 
        await Promise.all([
          api.get('/api/social/following'),
          api.get('/api/social/followers'),
          api.get('/api/social/feed'),
          api.get('/api/social/leaderboards'),
          api.get('/api/social/recommendations')
        ]);

      setSocialData({
        following: followingRes.data.following,
        followers: followersRes.data.followers,
        feed: feedRes.data.activities,
        leaderboards: leaderboardsRes.data,
        recommendations: recommendationsRes.data.recommendations
      });
    } catch (error) {
      console.error('Error fetching social data:', error);
    }
    setLoading(false);
  };

  const handleFollow = async (userId) => {
    try {
      await api.post('/api/social/follow', { user_id: userId });
      fetchSocialData();
      alert('Successfully followed user!');
    } catch (error) {
      console.error('Error following user:', error);
      alert('Error following user');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await api.delete(`/api/social/unfollow/${userId}`);
      fetchSocialData();
      alert('Unfollowed user');
    } catch (error) {
      console.error('Error unfollowing user:', error);
      alert('Error unfollowing user');
    }
  };

  if (loading) return <div className="loading">Loading social data...</div>;

  return (
    <div className="social-tracking">
      <div className="social-header">
        <h1>👥 Social Fitness</h1>
        <p>Connect, compete, and celebrate progress together</p>
      </div>

      <div className="social-tabs">
        <button 
          className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          📱 Feed
        </button>
        <button 
          className={`tab-btn ${activeTab === 'leaderboards' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboards')}
        >
          🏆 Leaderboards
        </button>
        <button 
          className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          👥 Following ({socialData.following.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          🔍 Discover
        </button>
      </div>

      <div className="social-content">
        {activeTab === 'feed' && (
          <div className="social-feed">
            <h2>Recent Activity</h2>
            {socialData.feed.length === 0 ? (
              <div className="empty-feed">
                <div className="empty-icon">📱</div>
                <h3>No Activity Yet</h3>
                <p>Follow some friends to see their progress here!</p>
              </div>
            ) : (
              <div className="activity-list">
                {socialData.feed.map((activity) => (
                  <div key={activity.activity_id} className="activity-item">
                    <div className="activity-user">
                      <div className="user-avatar">
                        {activity.user_name?.charAt(0) || '👤'}
                      </div>
                      <div className="user-info">
                        <strong>{activity.user_name}</strong>
                        <span className="user-level">Level {activity.user_level}</span>
                      </div>
                    </div>
                    <div className="activity-content">
                      <h4>{activity.title}</h4>
                      <p>{activity.description}</p>
                      {activity.metadata?.xp_earned && (
                        <div className="activity-rewards">
                          <span className="xp-reward">⚡ +{activity.metadata.xp_earned} XP</span>
                          {activity.metadata?.coins_earned && (
                            <span className="coin-reward">🪙 +{activity.metadata.coins_earned}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="activity-time">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboards' && (
          <div className="leaderboards">
            <div className="leaderboard-section">
              <h3>🔥 Longest Streaks</h3>
              <div className="leaderboard-list">
                {socialData.leaderboards.streak_leaders?.map((user, index) => (
                  <div key={user.user_id} className="leaderboard-item">
                    <div className="rank">
                      {index + 1 <= 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                    </div>
                    <div className="user-info">
                      <strong>{user.name}</strong>
                      <span>Level {user.level}</span>
                    </div>
                    <div className="streak-count">
                      {user.streak} days 🔥
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="leaderboard-section">
              <h3>🪙 Top Coin Earners</h3>
              <div className="leaderboard-list">
                {socialData.leaderboards.coin_leaders?.map((user, index) => (
                  <div key={user.user_id} className="leaderboard-item">
                    <div className="rank">
                      {index + 1 <= 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                    </div>
                    <div className="user-info">
                      <strong>{user.name}</strong>
                      <span>Level {user.level}</span>
                    </div>
                    <div className="coin-count">
                      {user.total_coins} 🪙
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="leaderboard-section">
              <h3>🏋️‍♂️ Top Trainers This Month</h3>
              <div className="leaderboard-list">
                {socialData.leaderboards.trainer_leaders?.map((trainer, index) => (
                  <div key={trainer.trainer_id} className="leaderboard-item">
                    <div className="rank">
                      {index + 1 <= 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                    </div>
                    <div className="user-info">
                      <strong>{trainer.name}</strong>
                      <span>{trainer.gym}</span>
                    </div>
                    <div className="session-count">
                      {trainer.sessions_this_month} sessions
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'following' && (
          <div className="following-section">
            <h2>Following ({socialData.following.length})</h2>
            <div className="user-list">
              {socialData.following.map((user) => (
                <div key={user.user_id} className="user-card">
                  <div className="user-avatar">
                    {user.name?.charAt(0) || '👤'}
                  </div>
                  <div className="user-info">
                    <h4>{user.name}</h4>
                    <span className="user-role">
                      {user.role === 'trainer' ? '🏋️‍♂️ Trainer' : '💪 Member'}
                    </span>
                    <div className="user-stats">
                      <span>🔥 {user.current_streak} days</span>
                      <span>🪙 {user.lift_coins}</span>
                      <span>⚡ Level {user.level}</span>
                    </div>
                  </div>
                  <div className="user-actions">
                    <button 
                      onClick={() => handleUnfollow(user.user_id)}
                      className="unfollow-btn"
                    >
                      Unfollow
                    </button>
                  </div>
                  
                  {user.recent_activities?.length > 0 && (
                    <div className="recent-activity">
                      <h5>Recent Activity:</h5>
                      {user.recent_activities.slice(0, 2).map((activity, idx) => (
                        <div key={idx} className="mini-activity">
                          {activity.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="recommendations-section">
            <h2>🔍 Discover New Connections</h2>
            <div className="user-list">
              {socialData.recommendations.map((user) => (
                <div key={user.user_id} className="user-card">
                  <div className="user-avatar">
                    {user.name?.charAt(0) || '👤'}
                  </div>
                  <div className="user-info">
                    <h4>{user.name}</h4>
                    <span className="user-role">
                      {user.role === 'trainer' ? '🏋️‍♂️ Trainer' : '💪 Member'}
                    </span>
                    <div className="recommendation-reason">
                      {user.reason === 'nearby_user' && `📍 ${user.distance_km}km away`}
                      {user.reason === 'shared_trainer' && `🏋️‍♂️ Trains with ${user.shared_trainer}`}
                    </div>
                    <div className="user-stats">
                      <span>🔥 {user.streak} days</span>
                      {user.gym && <span>🏢 {user.gym}</span>}
                    </div>
                  </div>
                  <div className="user-actions">
                    <button 
                      onClick={() => handleFollow(user.user_id)}
                      className="follow-btn"
                    >
                      Follow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
const FitnessForest = () => {
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
                value={trainerData.specialties.join(', ')}
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

// Main App Component
const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login');
  const { loading } = useAuth();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'trainers':
        return <TrainerSearch />;
      case 'bookings':
        return <BookingManagement />;
      case 'progress':
        return <ProgressAnalytics />;
      case 'fitnessforest':
        return <FitnessForest />;
      case 'social':
        return <SocialTracking />;
      case 'settings':
        return <Settings />;
      case 'trainer-dashboard':
        return <TrainerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <div className="app">
        <AuthChecker>
          {({ user, userProfile }) => {
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
                <div className="app-container">
                  <div className="auth-container">
                    <div className="auth-background">
                      <div className="floating-shapes">
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                        <div className="shape shape-3"></div>
                      </div>
                    </div>
                    <div className="auth-content">
                      <div className="auth-header">
                        <div className="logo">
                          <span className="logo-icon">💪</span>
                          <span className="logo-text">LiftLink</span>
                        </div>
                        <p className="tagline">Transform Your Body, Transform Your Life</p>
                      </div>
                      
                      {authMode === 'login' ? (
                        <LoginForm onToggle={() => setAuthMode('register')} />
                      ) : (
                        <RegistrationForm onToggle={() => setAuthMode('login')} />
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div className="app-container">
                <Navigation currentView={currentView} setCurrentView={setCurrentView} />
                <main className="main-content">
                  <div className="content-wrapper">
                    {renderCurrentView()}
                  </div>
                </main>
              </div>
            );
          }}
        </AuthChecker>
      </div>
    </AuthProvider>
  );
};

// Auth Handler Component
const AuthHandler = ({ setCurrentView }) => {
  const { user, loading } = useAuth();
  const [view, setView] = useState('home');

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
    return <LoginForm />;
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
    <div className="app-container">
      <Navigation currentView={view} setCurrentView={setView} />
      <main className="main-content">
        <div className="view-container">
          {renderView()}
        </div>
      </main>
      <div className="background-effects">
        <div className="floating-particle"></div>
        <div className="floating-particle"></div>
        <div className="floating-particle"></div>
      </div>
    </div>
  );
};

export default App;
