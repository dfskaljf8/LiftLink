import React, { useState } from 'react';
import { TactileButton, FloatingMascot } from '../DelightfulAnimations';
import { AnimatedCard, MorphingProgressBar } from '../DelightfulComponents';
import '../styles/ProfessionalDesign.css';

const ProfileView = ({ userProfile, setCurrentView }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: userProfile?.name || 'Demo User',
    email: 'demo@liftlink.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    bio: 'Fitness enthusiast on a journey to better health and strength.',
    goals: ['Weight Loss', 'Muscle Building', 'Endurance'],
    experience: 'Beginner'
  });
  const [showMascot, setShowMascot] = useState(true);

  const stats = [
    { label: 'Level', value: userProfile?.level || 5, icon: '⭐', color: 'var(--accent-primary)' },
    { label: 'LiftCoins', value: userProfile?.lift_coins || 150, icon: '🪙', color: 'var(--warning)' },
    { label: 'Streak', value: userProfile?.consecutive_days || 7, icon: '🔥', color: 'var(--error)' },
    { label: 'XP Points', value: userProfile?.xp_points || 450, icon: '⚡', color: 'var(--accent-secondary)' }
  ];

  return (
    <div className="profile-view">
      {/* Header */}
      <div style={{
        padding: '30px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '10px',
          color: 'white'
        }}>
          👤 My Profile
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: '16px'
        }}>
          Track your fitness journey and achievements
        </p>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Profile Card */}
        <AnimatedCard className="glass-card" style={{ padding: '30px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 auto 20px'
            }}>
              {editedProfile.name.charAt(0)}
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '5px' }}>
              {editedProfile.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
              {editedProfile.email}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              📍 {editedProfile.location}
            </p>
          </div>
        </AnimatedCard>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '15px',
          marginBottom: '25px'
        }}>
          {stats.map((stat, index) => (
            <AnimatedCard key={stat.label} delay={index * 100} className="glass-card" style={{
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                {stat.icon}
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: stat.color,
                marginBottom: '5px'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-muted)'
              }}>
                {stat.label}
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Quick Actions */}
        <AnimatedCard className="glass-card" style={{ padding: '25px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            Quick Actions
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px'
          }}>
            <TactileButton variant="primary" onClick={() => setCurrentView('trainers')}>
              🔍 Find Trainers
            </TactileButton>
            <TactileButton variant="secondary" onClick={() => setCurrentView('bookings')}>
              📅 My Bookings
            </TactileButton>
            <TactileButton variant="secondary" onClick={() => setCurrentView('analytics')}>
              📊 View Analytics
            </TactileButton>
            <TactileButton variant="secondary" onClick={() => setCurrentView('settings')}>
              ⚙️ Settings
            </TactileButton>
          </div>
        </AnimatedCard>
      </div>

      {/* Floating Mascot */}
      {showMascot && (
        <FloatingMascot
          emotion="happy"
          message="Your profile looks great! Keep tracking your progress!"
          onDismiss={() => setShowMascot(false)}
        />
      )}

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }} />
    </div>
  );
};

export default ProfileView;