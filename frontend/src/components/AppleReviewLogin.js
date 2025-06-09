import React, { useState } from 'react';
import { LiftLinkLogo } from './AnimatedSVGs';

const AppleReviewLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showTestAccounts, setShowTestAccounts] = useState(false);

  const appleTestAccounts = [
    {
      username: 'apple_reviewer_2024',
      password: 'LiftLink2024Review!',
      role: 'trainee',
      description: 'Main Apple Reviewer Account (Trainee)',
      features: ['Age & ID Verification', 'Trainer Search', 'Health Integrations', 'Social Features', 'Progress Tracking']
    },
    {
      username: 'apple_trainer_reviewer',
      password: 'TrainerReview2024!', 
      role: 'trainer',
      description: 'Apple Reviewer Account (Trainer)',
      features: ['Trainer CRM Dashboard', 'Client Management', 'Session Analytics', 'Revenue Tracking', 'Certification System']
    }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // For Apple review, we'll use the provided test credentials
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/apple-review-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const userData = await response.json();
        onLogin(userData);
      } else {
        alert('Invalid credentials. Please use the provided Apple test accounts.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const quickLogin = (account) => {
    setCredentials({
      username: account.username,
      password: account.password
    });
  };

  return (
    <div className="apple-review-login">
      <div className="login-container">
        <div className="login-header">
          <LiftLinkLogo size={48} animate={true} />
          <h1>LiftLink</h1>
          <p>Apple App Review Login</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              placeholder="Enter test account username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              placeholder="Enter test account password"
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Login to Review App
          </button>
        </form>

        <div className="test-accounts-section">
          <button 
            className="show-accounts-btn"
            onClick={() => setShowTestAccounts(!showTestAccounts)}
          >
            {showTestAccounts ? 'Hide' : 'Show'} Apple Test Accounts
          </button>

          {showTestAccounts && (
            <div className="test-accounts">
              <h3>Apple Review Test Accounts</h3>
              <p className="accounts-note">
                These accounts have been pre-configured with verification bypasses and demo data for Apple review purposes.
              </p>
              
              {appleTestAccounts.map((account, index) => (
                <div key={index} className="test-account-card">
                  <div className="account-header">
                    <h4>{account.description}</h4>
                    <span className={`role-badge ${account.role}`}>
                      {account.role === 'trainer' ? '🏆 Trainer' : '💪 Trainee'}
                    </span>
                  </div>
                  
                  <div className="account-credentials">
                    <div className="credential">
                      <span className="label">Username:</span>
                      <code>{account.username}</code>
                    </div>
                    <div className="credential">
                      <span className="label">Password:</span>
                      <code>{account.password}</code>
                    </div>
                  </div>

                  <div className="account-features">
                    <h5>Available Features:</h5>
                    <ul>
                      {account.features.map((feature, fIndex) => (
                        <li key={fIndex}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    className="quick-login-btn"
                    onClick={() => quickLogin(account)}
                  >
                    Quick Fill Credentials
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="review-notes">
          <h3>For Apple Reviewers</h3>
          <div className="note-item">
            <strong>Verification Bypass:</strong> Test accounts automatically pass age and ID verification
          </div>
          <div className="note-item">
            <strong>Demo Data:</strong> Pre-populated with realistic fitness data and progress
          </div>
          <div className="note-item">
            <strong>All Features Enabled:</strong> Full access to trainer search, health integrations, social features
          </div>
          <div className="note-item">
            <strong>Safe Environment:</strong> All financial transactions are in test mode
          </div>
        </div>
      </div>

      <style jsx>{`
        .apple-review-login {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        .login-container {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 40px;
          max-width: 600px;
          width: 100%;
          backdrop-filter: blur(20px);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          margin: 16px 0 8px 0;
        }

        .login-header p {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .login-form {
          margin-bottom: 32px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: #ffffff;
          font-size: 16px;
          box-sizing: border-box;
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .form-group input:focus {
          outline: none;
          border-color: #C4D600;
          box-shadow: 0 0 0 2px rgba(196, 214, 0, 0.2);
        }

        .login-btn {
          width: 100%;
          background: linear-gradient(135deg, #C4D600, #8BAE00);
          color: #000;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(196, 214, 0, 0.3);
        }

        .test-accounts-section {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 24px;
          margin-bottom: 24px;
        }

        .show-accounts-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 20px;
        }

        .show-accounts-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .test-accounts h3 {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 12px 0;
        }

        .accounts-note {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 20px;
          padding: 12px;
          background: rgba(196, 214, 0, 0.1);
          border-radius: 8px;
          border-left: 3px solid #C4D600;
        }

        .test-account-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .account-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .account-header h4 {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }

        .role-badge {
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .role-badge.trainer {
          background: #C4D600;
          color: #000;
        }

        .role-badge.trainee {
          background: rgba(196, 214, 0, 0.2);
          color: #C4D600;
        }

        .account-credentials {
          margin-bottom: 16px;
        }

        .credential {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .credential .label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          min-width: 80px;
        }

        .credential code {
          background: rgba(0, 0, 0, 0.3);
          padding: 4px 8px;
          border-radius: 6px;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
          font-size: 13px;
          color: #C4D600;
        }

        .account-features h5 {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 8px 0;
        }

        .account-features ul {
          list-style: none;
          padding: 0;
          margin: 0 0 16px 0;
        }

        .account-features li {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 4px;
          padding-left: 16px;
          position: relative;
        }

        .account-features li:before {
          content: '•';
          color: #C4D600;
          position: absolute;
          left: 0;
        }

        .quick-login-btn {
          background: rgba(196, 214, 0, 0.2);
          border: 1px solid #C4D600;
          color: #C4D600;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .quick-login-btn:hover {
          background: rgba(196, 214, 0, 0.3);
        }

        .review-notes {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 24px;
        }

        .review-notes h3 {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 16px 0;
        }

        .note-item {
          background: rgba(255, 255, 255, 0.03);
          border-left: 3px solid #C4D600;
          padding: 12px 16px;
          margin-bottom: 8px;
          border-radius: 0 8px 8px 0;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
        }

        .note-item strong {
          color: #C4D600;
        }
      `}</style>
    </div>
  );
};

export default AppleReviewLogin;