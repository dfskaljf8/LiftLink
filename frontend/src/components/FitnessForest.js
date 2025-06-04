import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ProfessionalDesign.css';

const LegacyFitnessForest = () => {
  const { userProfile } = useAuth();
  
  return (
    <div className="mobile-card">
      <div className="card-header">
        <h2 className="card-title">Your Growth Tree</h2>
      </div>
      
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌲</div>
        <h3 style={{ color: '#6B8E5A', marginBottom: '1rem' }}>Growing Strong!</h3>
        <p style={{ color: '#4A90A4', marginBottom: '2rem' }}>
          Watch your fitness journey grow like a mighty tree. Every workout adds a new branch!
        </p>
        
        <div style={{ 
          background: 'rgba(154, 205, 50, 0.1)', 
          border: '1px solid rgba(154, 205, 50, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <h4 style={{ color: '#6B8E5A', marginBottom: '0.5rem' }}>Your Progress:</h4>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem' }}>🌱</div>
              <div style={{ color: '#4A90A4' }}>Level {userProfile?.level || 1}</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem' }}>🏆</div>
              <div style={{ color: '#4A90A4' }}>{userProfile?.consecutive_days || 0} Day Streak</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem' }}>💰</div>
              <div style={{ color: '#4A90A4' }}>{userProfile?.lift_coins || 0} Coins</div>
            </div>
          </div>
        </div>
        
        <button className="mobile-btn">
          <span className="btn-icon">🌿</span>
          Continue Growing
        </button>
      </div>
    </div>
  );
};

export default LegacyFitnessForest;