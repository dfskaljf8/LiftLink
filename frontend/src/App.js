import React, { useState, useEffect } from 'react';
import './App.css';

// Backend URL from environment
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://fitness-platform-10.preview.emergentagent.com';
const API = `${BACKEND_URL}/api`;

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login'); // 'login', 'register', 'dashboard'
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    checkBackendHealth();
    checkStoredUser();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API}/health`);
      if (response.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendStatus('error');
    }
  };

  const checkStoredUser = () => {
    const storedUser = localStorage.getItem('liftlink_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setMode('dashboard');
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('liftlink_user');
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First check if user exists
      const checkResponse = await fetch(`${API}/check-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const checkData = await checkResponse.json();

      if (checkData.exists) {
        // User exists, try to login
        const loginResponse = await fetch(`${API}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email })
        });

        if (loginResponse.ok) {
          const userData = await loginResponse.json();
          setUser(userData);
          localStorage.setItem('liftlink_user', JSON.stringify(userData));
          setMode('dashboard');
        } else if (loginResponse.status === 403) {
          setError('Account needs verification. Please complete document verification.');
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        // User doesn't exist, switch to registration
        setMode('register');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          role: 'trainee',
          fitness_goals: ['General Fitness'],
          experience_level: 'beginner'
        })
      });

      if (response.ok) {
        const userData = await response.json();
        setError('Registration successful! Please complete document verification to login.');
        setMode('login');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('liftlink_user');
    setMode('login');
    setEmail('');
    setName('');
  };

  const renderLoginForm = () => (
    <div className="auth-container">
      <div className="logo-section">
        <div className="logo">🏋️</div>
        <h1 className="title">LiftLink</h1>
        <p className="tagline">Beginners to Believers</p>
      </div>

      <form onSubmit={handleLogin} className="auth-form">
        <h2>Welcome Back</h2>
        <p>Enter your email to continue</p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
        />

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading || !email} className="button primary">
          {loading ? 'Checking...' : 'Continue'}
        </button>

        <p className="switch-mode">
          New to LiftLink? <button type="button" onClick={() => setMode('register')} className="link-button">Create Account</button>
        </p>
      </form>
    </div>
  );

  const renderRegisterForm = () => (
    <div className="auth-container">
      <div className="logo-section">
        <div className="logo">🏋️</div>
        <h1 className="title">LiftLink</h1>
        <p className="tagline">Beginners to Believers</p>
      </div>

      <form onSubmit={handleRegister} className="auth-form">
        <h2>Create Account</h2>
        <p>Join the LiftLink community</p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
        />

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input"
        />

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading || !email || !name} className="button primary">
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="switch-mode">
          Already have an account? <button type="button" onClick={() => setMode('login')} className="link-button">Sign In</button>
        </p>
      </form>
    </div>
  );

  const renderDashboard = () => (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-small">
          <span className="logo">🏋️</span>
          <span className="title">LiftLink</span>
        </div>
        <div className="user-info">
          <span>Welcome, {user.name || user.email}!</span>
          <button onClick={handleLogout} className="button secondary">Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          <div className="card">
            <h3>🔐 Authentication Status</h3>
            <p className="status success">✅ Logged In</p>
            <p>Role: {user.role || 'trainee'}</p>
            <p>Verified: {user.age_verified ? '✅ Yes' : '⚠️ Pending'}</p>
          </div>

          <div className="card">
            <h3>🌐 Backend Connection</h3>
            <p className={`status ${backendStatus === 'connected' ? 'success' : 'error'}`}>
              {backendStatus === 'connected' ? '✅ Connected' : '❌ Error'}
            </p>
            <button onClick={checkBackendHealth} className="button small">Refresh</button>
          </div>

          <div className="card">
            <h3>🎯 Testing Features</h3>
            <div className="button-group">
              <button onClick={() => testAPI('/api/users/' + user.id)} className="button small">Test Profile API</button>
              <button onClick={() => testAPI('/api/trainers/all')} className="button small">Test Trainers API</button>
              <button onClick={() => testAPI('/api/payments/session-cost/trainer_001')} className="button small">Test Payments API</button>
            </div>
          </div>

          <div className="card">
            <h3>📱 React Native Components</h3>
            <p>This web interface tests the backend APIs that power the React Native mobile app.</p>
            <div className="component-list">
              <span className="component">✅ AuthContext</span>
              <span className="component">✅ PaymentScreen</span>
              <span className="component">✅ TrainerDashboard</span>
              <span className="component">✅ NotificationCenter</span>
              <span className="component">✅ GoogleFitIntegration</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  const testAPI = async (endpoint) => {
    try {
      const response = await fetch(`${API}${endpoint}`);
      const data = await response.json();
      alert(`API Test: ${endpoint}\nStatus: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      alert(`API Test Failed: ${endpoint}\nError: ${error.message}`);
    }
  };

  return (
    <div className="App">
      {mode === 'login' && renderLoginForm()}
      {mode === 'register' && renderRegisterForm()}
      {mode === 'dashboard' && renderDashboard()}
    </div>
  );
}

export default App;