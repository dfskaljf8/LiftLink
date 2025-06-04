import React from 'react';
import '../styles/ProfessionalDesign.css';

// Placeholder components for views not yet converted to professional design

export const BookingManagement = () => (
  <div style={{ padding: 'var(--space-lg)' }}>
    <div style={{
      padding: 'var(--space-xl) var(--space-lg)',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      marginBottom: 'var(--space-lg)'
    }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: 'var(--space-sm)'
      }}>
        My Bookings
      </h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        Manage your training sessions
      </p>
    </div>

    <div className="glass-card" style={{
      padding: 'var(--space-2xl)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '60px', marginBottom: 'var(--space-md)' }}>
        📅
      </div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: 'var(--space-sm)'
      }}>
        No Bookings Yet
      </h3>
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: 'var(--space-lg)'
      }}>
        Book your first training session to get started!
      </p>
      <button className="btn-primary">
        Find a Trainer
      </button>
    </div>
  </div>
);

export const MessagesView = () => (
  <div style={{ padding: 'var(--space-lg)' }}>
    <div style={{
      padding: 'var(--space-xl) var(--space-lg)',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      marginBottom: 'var(--space-lg)'
    }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: 'var(--space-sm)'
      }}>
        Messages
      </h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        Chat with your trainers
      </p>
    </div>

    <div className="glass-card" style={{
      padding: 'var(--space-2xl)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '60px', marginBottom: 'var(--space-md)' }}>
        💬
      </div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: 'var(--space-sm)'
      }}>
        No Messages Yet
      </h3>
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: 'var(--space-lg)'
      }}>
        Start a conversation with a trainer to get personalized guidance!
      </p>
      <button className="btn-primary">
        Find a Trainer
      </button>
    </div>
  </div>
);

export const AchievementsView = ({ userProfile }) => (
  <div style={{ padding: 'var(--space-lg)' }}>
    <div style={{
      padding: 'var(--space-xl) var(--space-lg)',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      marginBottom: 'var(--space-lg)'
    }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: 'var(--space-sm)',
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Achievements
      </h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        Celebrate your fitness milestones
      </p>
    </div>

    <div style={{
      display: 'grid',
      gap: 'var(--space-md)',
      marginBottom: 'var(--space-xl)'
    }}>
      {[
        { icon: '🏆', title: 'First Workout', desc: 'Completed your first training session', earned: true },
        { icon: '🔥', title: 'Week Streak', desc: 'Worked out 7 days in a row', earned: true },
        { icon: '⭐', title: 'Level 5', desc: 'Reached fitness level 5', earned: userProfile?.level >= 5 },
        { icon: '💪', title: 'Strength Hero', desc: 'Complete 20 strength training sessions', earned: false },
        { icon: '🌟', title: 'Month Streak', desc: 'Worked out 30 days in a row', earned: false }
      ].map((achievement, index) => (
        <div
          key={index}
          className={`glass-card ${achievement.earned ? 'scale-in' : ''}`}
          style={{
            padding: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            opacity: achievement.earned ? 1 : 0.5,
            animationDelay: `${index * 0.1}s`
          }}
        >
          <div style={{ fontSize: '32px' }}>
            {achievement.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: 'var(--space-xs)'
            }}>
              {achievement.title}
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px'
            }}>
              {achievement.desc}
            </p>
          </div>
          {achievement.earned && (
            <div style={{
              background: 'var(--success)',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}>
              ✓
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export const Settings = () => (
  <div style={{ padding: 'var(--space-lg)' }}>
    <div style={{
      padding: 'var(--space-xl) var(--space-lg)',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      marginBottom: 'var(--space-lg)'
    }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: 'var(--space-sm)'
      }}>
        Settings
      </h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        Customize your LiftLink experience
      </p>
    </div>

    <div style={{
      display: 'grid',
      gap: 'var(--space-md)'
    }}>
      {[
        { icon: '🔔', title: 'Notifications', desc: 'Push notifications, email alerts' },
        { icon: '🌙', title: 'Theme', desc: 'Dark mode, light mode preferences' },
        { icon: '🔒', title: 'Privacy', desc: 'Data settings, profile visibility' },
        { icon: '💳', title: 'Payment', desc: 'Payment methods, billing history' },
        { icon: '🏋️', title: 'Fitness Goals', desc: 'Update your fitness objectives' },
        { icon: '📍', title: 'Location', desc: 'Update your location preferences' }
      ].map((setting, index) => (
        <div
          key={index}
          className="glass-card"
          style={{
            padding: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '24px' }}>
            {setting.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: 'var(--space-xs)'
            }}>
              {setting.title}
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px'
            }}>
              {setting.desc}
            </p>
          </div>
          <div style={{
            color: 'var(--text-muted)',
            fontSize: '18px'
          }}>
            ›
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const HelpSupport = () => (
  <div style={{ padding: 'var(--space-lg)' }}>
    <div style={{
      padding: 'var(--space-xl) var(--space-lg)',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      marginBottom: 'var(--space-lg)'
    }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: 'var(--space-sm)',
        background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Help & Support
      </h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        Get the help you need
      </p>
    </div>

    <div style={{
      display: 'grid',
      gap: 'var(--space-md)'
    }}>
      {[
        { icon: '❓', title: 'FAQ', desc: 'Frequently asked questions' },
        { icon: '💬', title: 'Live Chat', desc: 'Chat with our support team' },
        { icon: '📧', title: 'Email Support', desc: 'Send us an email' },
        { icon: '📞', title: 'Phone Support', desc: 'Call our support line' },
        { icon: '📖', title: 'User Guide', desc: 'Learn how to use LiftLink' },
        { icon: '🐛', title: 'Report Bug', desc: 'Report technical issues' }
      ].map((item, index) => (
        <div
          key={index}
          className="glass-card"
          style={{
            padding: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '24px' }}>
            {item.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: 'var(--space-xs)'
            }}>
              {item.title}
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px'
            }}>
              {item.desc}
            </p>
          </div>
          <div style={{
            color: 'var(--text-muted)',
            fontSize: '18px'
          }}>
            ›
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Legacy component placeholders
export const TrainerDashboard = () => (
  <div className="glass-card" style={{ margin: 'var(--space-lg)', padding: 'var(--space-xl)', textAlign: 'center' }}>
    <h2>Trainer Dashboard</h2>
    <p>Coming soon - Professional trainer interface</p>
  </div>
);

export const AdminDashboard = () => (
  <div className="glass-card" style={{ margin: 'var(--space-lg)', padding: 'var(--space-xl)', textAlign: 'center' }}>
    <h2>Admin Dashboard</h2>
    <p>Coming soon - Administrative controls</p>
  </div>
);