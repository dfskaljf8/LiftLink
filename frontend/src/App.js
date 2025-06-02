import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';
import './App.css';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// Auth Context
const AuthContext = createContext();

// API configuration
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const user = auth.currentUser;
  if (user) {
    config.headers.Authorization = `Bearer ${user.uid}`;
  }
  return config;
});

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Register user in backend if not exists
          await api.post('/api/users/register', {
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          });
          
          // Get user profile
          const response = await api.get('/api/users/profile');
          setUserProfile(response.data);
        } catch (error) {
          console.log('User registration/profile fetch:', error.response?.data?.detail || error.message);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    setUserProfile(null);
    return await signOut(auth);
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

// Navigation Component
const Navigation = () => {
  const { user, userProfile, logout } = useAuth();
  const [currentView, setCurrentView] = useState('home');

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="logo">
          <span className="logo-lift">Lift</span>
          <span className="logo-link">Link</span>
        </div>
        <span className="tagline">Beginners to Believers</span>
      </div>
      
      {user && (
        <div className="nav-links">
          <button 
            className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
          >
            🏠 Home
          </button>
          <button 
            className={`nav-btn ${currentView === 'trainers' ? 'active' : ''}`}
            onClick={() => setCurrentView('trainers')}
          >
            💪 Find Trainers
          </button>
          <button 
            className={`nav-btn ${currentView === 'bookings' ? 'active' : ''}`}
            onClick={() => setCurrentView('bookings')}
          >
            📅 My Bookings
          </button>
          {userProfile?.role === 'trainer' && (
            <button 
              className={`nav-btn ${currentView === 'trainer-dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('trainer-dashboard')}
            >
              🎯 Trainer Dashboard
            </button>
          )}
          <button 
            className={`nav-btn ${currentView === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentView('profile')}
          >
            👤 Profile
          </button>
          <button className="nav-btn logout" onClick={logout}>
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
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
const HomeDashboard = () => {
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
          <button className="action-btn primary">
            {userProfile?.role === 'trainer' ? '📅 Manage Schedule' : '💪 Find Trainers'}
          </button>
          <button className="action-btn secondary">
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

// Profile Component
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
  const [currentView, setCurrentView] = useState('home');

  return (
    <AuthProvider>
      <div className="app">
        <AuthHandler setCurrentView={setCurrentView} />
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
        <div className="logo-large">
          <span className="logo-lift">Lift</span>
          <span className="logo-link">Link</span>
        </div>
        <div className="loading-text">Loading your fitness journey...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderView = () => {
    switch (view) {
      case 'home':
        return <HomeDashboard />;
      case 'trainers':
        return <TrainerSearch />;
      case 'bookings':
        return <MyBookings />;
      case 'profile':
        return <Profile />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="app-container">
      <Navigation currentView={view} setCurrentView={setView} />
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
