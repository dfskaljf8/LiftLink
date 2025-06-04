import React, { useState } from 'react';
import { TactileButton, FloatingMascot } from './DelightfulAnimations';
import { AnimatedCard, MorphingProgressBar } from './DelightfulComponents';
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
    experience: 'Beginner',
    height: '5\'8"',
    weight: '150 lbs',
    age: 28,
    fitnessLevel: 'Intermediate'
  });
  const [showMascot, setShowMascot] = useState(true);

  const stats = [
    { label: 'Level', value: userProfile?.level || 5, icon: '⭐', color: 'var(--accent-primary)' },
    { label: 'LiftCoins', value: userProfile?.lift_coins || 150, icon: '🪙', color: 'var(--warning)' },
    { label: 'Streak', value: userProfile?.consecutive_days || 7, icon: '🔥', color: 'var(--error)' },
    { label: 'XP Points', value: userProfile?.xp_points || 450, icon: '⚡', color: 'var(--accent-secondary)' }
  ];

  const achievements = [
    { title: 'First Workout', icon: '🏆', earned: true },
    { title: 'Week Streak', icon: '🔥', earned: true },
    { title: 'Level 5', icon: '⭐', earned: true },
    { title: 'Strength Hero', icon: '💪', earned: false },
    { title: 'Month Streak', icon: '🌟', earned: false }
  ];

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  return (
    <div className="profile-view">
      {/* Header */}
      <div style={{
        padding: '30px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--accent-tertiary) 0%, var(--accent-primary) 100%)',
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
              margin: '0 auto 20px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {editedProfile.name.charAt(0)}
              <button style={{
                position: 'absolute',
                bottom: '5px',
                right: '5px',
                background: 'var(--accent-secondary)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                📷
              </button>
            </div>
            
            {!isEditing ? (
              <>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '5px' }}>
                  {editedProfile.name}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  {editedProfile.email}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                  📍 {editedProfile.location}
                </p>
                <TactileButton variant="secondary" onClick={() => setIsEditing(true)}>
                  ✏️ Edit Profile
                </TactileButton>
              </>
            ) : (
              <div style={{ textAlign: 'left', maxWidth: '300px', margin: '0 auto' }}>
                <input
                  type="text"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                  placeholder="Full Name"
                  style={{
                    width: '100%',
                    background: 'var(--glass-bg)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    color: 'var(--text-primary)',
                    marginBottom: '10px'
                  }}
                />
                <input
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                  placeholder="Email"
                  style={{
                    width: '100%',
                    background: 'var(--glass-bg)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    color: 'var(--text-primary)',
                    marginBottom: '20px'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <TactileButton variant="secondary" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>
                    Cancel
                  </TactileButton>
                  <TactileButton variant="primary" onClick={handleSaveProfile} style={{ flex: 1 }}>
                    Save
                  </TactileButton>
                </div>
              </div>
            )}
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

        {/* Bio Section */}
        <AnimatedCard className="glass-card" style={{ padding: '25px', marginBottom: '25px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>
            About Me
          </h3>
          {!isEditing ? (
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {editedProfile.bio}
            </p>
          ) : (
            <textarea
              value={editedProfile.bio}
              onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
              style={{
                width: '100%',
                background: 'var(--glass-bg)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                color: 'var(--text-primary)',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          )}
        </AnimatedCard>

        {/* Fitness Goals */}
        <AnimatedCard className="glass-card" style={{ padding: '25px', marginBottom: '25px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>
            Fitness Goals
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            {editedProfile.goals.map((goal, index) => (
              <span
                key={index}
                style={{
                  background: 'var(--accent-primary)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {goal}
              </span>
            ))}
          </div>
        </AnimatedCard>

        {/* Quick Achievements */}
        <AnimatedCard className="glass-card" style={{ padding: '25px', marginBottom: '25px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
              Recent Achievements
            </h3>
            <TactileButton variant="secondary" size="small" onClick={() => setCurrentView('achievements')}>
              View All
            </TactileButton>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '15px'
          }}>
            {achievements.slice(0, 5).map((achievement, index) => (
              <div
                key={index}
                style={{
                  textAlign: 'center',
                  padding: '15px',
                  borderRadius: 'var(--radius-md)',
                  background: achievement.earned ? 'rgba(0, 212, 170, 0.1)' : 'var(--card-bg)',
                  border: achievement.earned ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                  opacity: achievement.earned ? 1 : 0.5
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                  {achievement.icon}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {achievement.title}
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>

        {/* Progress Summary */}
        <AnimatedCard className="glass-card" style={{ padding: '25px', marginBottom: '25px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            Progress Summary
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span>Level Progress</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                {((userProfile?.level || 5) % 10) * 10}%
              </span>
            </div>
            <MorphingProgressBar 
              progress={((userProfile?.level || 5) % 10) * 10}
              color="var(--accent-primary)"
              showSparkles={true}
            />
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--success)',
                marginBottom: '5px'
              }}>
                12
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-muted)'
              }}>
                Workouts This Month
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--warning)',
                marginBottom: '5px'
              }}>
                3.2k
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-muted)'
              }}>
                Calories Burned
              </div>
            </div>
          </div>
        </AnimatedCard>

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
          message="Your profile looks great! Keep tracking your progress and celebrating your achievements! 🎉"
          onDismiss={() => setShowMascot(false)}
        />
      )}

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }} />
    </div>
  );
};

export default ProfileView;