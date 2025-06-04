import React, { useState, useEffect, useRef } from 'react';
import { TactileButton, Confetti, FloatingMascot } from './DelightfulAnimations';
import './styles/ProfessionalDesign.css';

// FOMO Notification System
export const FOMONotificationSystem = ({ userProfile, onAction }) => {
  const [notifications, setNotifications] = useState([]);
  const [urgencyLevel, setUrgencyLevel] = useState(0);

  useEffect(() => {
    checkStreakStatus();
    checkDailyBonus();
    checkFriendActivity();
    checkLimitedOffers();
  }, []);

  const checkStreakStatus = () => {
    const daysMissed = calculateDaysMissed();
    const currentStreak = userProfile?.consecutive_days || 0;
    
    if (daysMissed === 1) {
      addNotification({
        type: 'streak_danger',
        title: 'Your tree is thirsty! 🌱',
        message: `Don't break your ${currentStreak}-day streak!`,
        urgency: 1,
        action: 'Start Workout',
        timeLeft: '2 hours'
      });
    } else if (daysMissed === 2) {
      addNotification({
        type: 'streak_critical',
        title: 'Your trainer noticed you\'re gone... 😢',
        message: `Sarah Chen is waiting for you!`,
        urgency: 2,
        action: 'Book Session',
        timeLeft: '1 day'
      });
    } else if (daysMissed >= 3) {
      addNotification({
        type: 'streak_emergency',
        title: 'Friends are passing your level!',
        message: `You've dropped from #3 to #7 this week`,
        urgency: 3,
        action: 'Catch Up Now',
        timeLeft: 'Today only'
      });
    }
  };

  const checkDailyBonus = () => {
    const bonusExpiresIn = calculateBonusTimeLeft();
    if (bonusExpiresIn < 8) {
      addNotification({
        type: 'bonus_expiring',
        title: 'LiftCoin Bonus Expires Soon! 🪙',
        message: `Claim 50 bonus coins in ${bonusExpiresIn}h`,
        urgency: 2,
        action: 'Claim Now',
        timeLeft: `${bonusExpiresIn}h left`
      });
    }
  };

  const checkFriendActivity = () => {
    addNotification({
      type: 'social_activity',
      title: 'John just beat his deadlift PR! 💪',
      message: 'Can you beat 225 lbs?',
      urgency: 1,
      action: 'Challenge Him',
      timeLeft: 'Live now'
    });
  };

  const checkLimitedOffers = () => {
    addNotification({
      type: 'limited_offer',
      title: 'Weekend Warrior Challenge! ⚡',
      message: 'Complete 3 workouts for exclusive badge',
      urgency: 2,
      action: 'Join Challenge',
      timeLeft: '48h left'
    });
  };

  const addNotification = (notification) => {
    setNotifications(prev => [...prev.slice(-2), { ...notification, id: Date.now() }]);
    setUrgencyLevel(Math.max(urgencyLevel, notification.urgency));
  };

  const calculateDaysMissed = () => Math.floor(Math.random() * 4); // Mock
  const calculateBonusTimeLeft = () => Math.floor(Math.random() * 12); // Mock

  const NotificationCard = ({ notification, index }) => (
    <div
      style={{
        position: 'fixed',
        top: `${100 + index * 80}px`,
        right: '20px',
        background: notification.urgency >= 2 ? 
          'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
          'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
        color: 'white',
        padding: '16px',
        borderRadius: '16px',
        maxWidth: '300px',
        zIndex: 1003,
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        animation: `slideInRight 0.5s ease-out ${index * 0.2}s both, ${notification.urgency >= 2 ? 'urgentPulse' : 'gentlePulse'} 2s infinite`,
        border: notification.urgency >= 3 ? '2px solid #fbbf24' : 'none'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '8px'
      }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
          {notification.title}
        </h4>
        <button
          onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ×
        </button>
      </div>
      
      <p style={{ fontSize: '14px', margin: '0 0 12px 0', opacity: 0.9 }}>
        {notification.message}
      </p>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <TactileButton
          size="small"
          onClick={() => onAction(notification.type)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          {notification.action}
        </TactileButton>
        <span style={{
          fontSize: '12px',
          opacity: 0.8,
          fontWeight: '500'
        }}>
          ⏰ {notification.timeLeft}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {notifications.map((notification, index) => (
        <NotificationCard key={notification.id} notification={notification} index={index} />
      ))}
      <style jsx>{`
        @keyframes urgentPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); box-shadow: 0 0 30px rgba(239, 68, 68, 0.6); }
        }
        @keyframes gentlePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.01); }
        }
      `}</style>
    </>
  );
};

// Social FOMO Feed
export const SocialFOMOFeed = ({ userProfile }) => {
  const [stories, setStories] = useState([]);
  const [friendActivity, setFriendActivity] = useState([]);

  useEffect(() => {
    loadSocialFOMO();
  }, []);

  const loadSocialFOMO = () => {
    const mockStories = [
      {
        id: 1,
        user: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
        type: 'workout_complete',
        content: 'Just crushed a 45-min HIIT session! 🔥',
        timestamp: Date.now() - 3600000, // 1 hour ago
        expiresIn: 23,
        viewed: false
      },
      {
        id: 2,
        user: 'Marcus Torres',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        type: 'achievement',
        content: 'New PR! 🏆 Deadlifted 275 lbs',
        timestamp: Date.now() - 7200000, // 2 hours ago
        expiresIn: 22,
        viewed: true
      },
      {
        id: 3,
        user: 'Emma Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b190?w=100&h=100&fit=crop',
        type: 'streak',
        content: '30-day streak! 🔥🔥🔥',
        timestamp: Date.now() - 10800000, // 3 hours ago
        expiresIn: 21,
        viewed: false
      }
    ];

    const mockActivity = [
      {
        id: 1,
        type: 'level_up',
        user: 'John Smith',
        message: 'reached Level 8! You\'re still at Level 5...',
        timeAgo: '2 min ago',
        urgency: 'high'
      },
      {
        id: 2,
        type: 'challenge_win',
        user: 'Lisa Park',
        message: 'won the "Weekend Warrior" challenge and earned 200 LiftCoins!',
        timeAgo: '15 min ago',
        urgency: 'medium'
      },
      {
        id: 3,
        type: 'streak_extend',
        user: 'Mike Johnson',
        message: 'extended their streak to 45 days! 🔥',
        timeAgo: '1 hour ago',
        urgency: 'low'
      }
    ];

    setStories(mockStories);
    setFriendActivity(mockActivity);
  };

  const StoryCircle = ({ story }) => (
    <div
      style={{
        position: 'relative',
        margin: '0 8px',
        textAlign: 'center',
        cursor: 'pointer'
      }}
      onClick={() => {/* View story */}}
    >
      <div style={{
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        background: story.viewed ? 
          'linear-gradient(45deg, #d1d5db 0%, #9ca3af 100%)' :
          'linear-gradient(45deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)',
        padding: '3px',
        animation: story.viewed ? 'none' : 'storyPulse 2s infinite'
      }}>
        <img
          src={story.avatar}
          alt={story.user}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid white'
          }}
        />
      </div>
      <div style={{
        fontSize: '12px',
        fontWeight: '500',
        marginTop: '4px',
        maxWidth: '70px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {story.user.split(' ')[0]}
      </div>
      <div style={{
        fontSize: '10px',
        color: 'var(--text-muted)',
        marginTop: '2px'
      }}>
        {story.expiresIn}h left
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div style={{
      background: activity.urgency === 'high' ? 
        'rgba(239, 68, 68, 0.1)' : 
        activity.urgency === 'medium' ? 
        'rgba(245, 158, 11, 0.1)' : 
        'var(--glass-bg)',
      border: `1px solid ${
        activity.urgency === 'high' ? 
        'rgba(239, 68, 68, 0.3)' : 
        activity.urgency === 'medium' ? 
        'rgba(245, 158, 11, 0.3)' : 
        'rgba(255, 255, 255, 0.2)'
      }`,
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '8px',
      animation: activity.urgency === 'high' ? 'urgentShake 0.5s ease-out' : 'none'
    }}>
      <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
        <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>
          {activity.user}
        </span>
        {' '}{activity.message}
      </div>
      <div style={{
        fontSize: '12px',
        color: 'var(--text-muted)',
        marginTop: '4px'
      }}>
        {activity.timeAgo}
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Stories Section */}
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🔥 Friend Stories
          <span style={{
            background: 'var(--error)',
            color: 'white',
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '8px',
            fontWeight: '600'
          }}>
            LIVE
          </span>
        </h3>
        
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {stories.map(story => (
            <StoryCircle key={story.id} story={story} />
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚡ Live Activity
          <div style={{
            width: '8px',
            height: '8px',
            background: '#10b981',
            borderRadius: '50%',
            animation: 'livePulse 1s infinite'
          }} />
        </h3>
        
        {friendActivity.map(activity => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>

      <style jsx>{`
        @keyframes storyPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes urgentShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

// Harvest/Accumulation System
export const HarvestSystem = ({ userProfile, onHarvest }) => {
  const [pendingRewards, setPendingRewards] = useState({});
  const [showHarvestModal, setShowHarvestModal] = useState(false);

  useEffect(() => {
    calculatePendingRewards();
    const interval = setInterval(calculatePendingRewards, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const calculatePendingRewards = () => {
    const lastLogin = new Date(userProfile?.last_login || Date.now() - 86400000);
    const hoursAway = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60));
    
    if (hoursAway >= 1) {
      setPendingRewards({
        strength: Math.min(hoursAway * 2, 50),
        liftCoins: Math.min(hoursAway * 5, 100),
        xp: Math.min(hoursAway * 10, 200),
        recovery: Math.min(hoursAway * 1, 24),
        hoursAway
      });
    }
  };

  const harvestRewards = () => {
    onHarvest(pendingRewards);
    setPendingRewards({});
    setShowHarvestModal(false);
  };

  if (Object.keys(pendingRewards).length === 0) return null;

  return (
    <>
      {/* Floating Harvest Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          zIndex: 1002,
          animation: 'harvestBounce 2s infinite'
        }}
      >
        <TactileButton
          onClick={() => setShowHarvestModal(true)}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            borderRadius: '50%',
            width: '70px',
            height: '70px',
            fontSize: '24px',
            boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)',
            border: '3px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          🌾
        </TactileButton>
        
        {/* Notification Badge */}
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          background: '#ef4444',
          color: 'white',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '600',
          animation: 'notificationPulse 1s infinite'
        }}>
          !
        </div>
      </div>

      {/* Harvest Modal */}
      {showHarvestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1003,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="harvest" width="60" height="60" patternUnits="userSpaceOnUse"%3E%3Ctext x="30" y="30" text-anchor="middle" dominant-baseline="middle" fill="rgba(245,158,11,0.1)" font-size="24"%3E🌾%3C/text%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23harvest)"/%3E%3C/svg%3E")',
              opacity: 0.3
            }} />
            
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                🎁
              </div>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Welcome Back!
              </h2>
              
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '24px',
                fontSize: '16px'
              }}>
                Your body recovered while you were away for {pendingRewards.hoursAway} hours!
              </p>

              {/* Rewards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>💪</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#ef4444' }}>
                    +{pendingRewards.strength}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Strength
                  </div>
                </div>
                
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🪙</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#f59e0b' }}>
                    +{pendingRewards.liftCoins}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    LiftCoins
                  </div>
                </div>
                
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#10b981' }}>
                    +{pendingRewards.xp}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    XP Points
                  </div>
                </div>
                
                <div style={{
                  background: 'rgba(99, 179, 237, 0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid rgba(99, 179, 237, 0.3)'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>😴</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#63b3ed' }}>
                    +{pendingRewards.recovery}h
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Recovery
                  </div>
                </div>
              </div>

              <TactileButton
                variant="primary"
                onClick={harvestRewards}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  fontSize: '18px',
                  fontWeight: '600',
                  padding: '16px'
                }}
              >
                🌾 Harvest All Rewards!
              </TactileButton>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes harvestBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }
        @keyframes notificationPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </>
  );
};

// Enhanced Celebration System
export const MegaCelebration = ({ trigger, onComplete }) => {
  const [active, setActive] = useState(false);
  const [celebrationType, setCelebrationType] = useState('');

  useEffect(() => {
    if (trigger) {
      triggerCelebration(trigger);
    }
  }, [trigger]);

  const triggerCelebration = (type) => {
    setCelebrationType(type);
    setActive(true);
    
    // Screen shake
    document.body.style.animation = 'celebrationShake 0.6s ease-out';
    
    setTimeout(() => {
      setActive(false);
      document.body.style.animation = '';
      onComplete?.();
    }, 3000);
  };

  if (!active) return null;

  const getCelebrationContent = () => {
    switch (celebrationType) {
      case 'level_up':
        return {
          emoji: '🎉',
          title: 'LEVEL UP!',
          subtitle: 'You reached a new level!',
          color: '#8b5cf6'
        };
      case 'streak':
        return {
          emoji: '🔥',
          title: 'STREAK POWER!',
          subtitle: 'Your dedication is unstoppable!',
          color: '#ef4444'
        };
      case 'achievement':
        return {
          emoji: '🏆',
          title: 'ACHIEVEMENT UNLOCKED!',
          subtitle: 'You earned a new badge!',
          color: '#f59e0b'
        };
      default:
        return {
          emoji: '⭐',
          title: 'AWESOME!',
          subtitle: 'Keep up the great work!',
          color: '#10b981'
        };
    }
  };

  const content = getCelebrationContent();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Confetti Background */}
      <Confetti />
      
      {/* Celebration Content */}
      <div style={{
        textAlign: 'center',
        animation: 'megaCelebration 3s ease-out'
      }}>
        <div style={{
          fontSize: '120px',
          marginBottom: '24px',
          animation: 'celebrationBounce 1s ease-out'
        }}>
          {content.emoji}
        </div>
        
        <h1 style={{
          fontSize: '48px',
          fontWeight: '900',
          background: `linear-gradient(135deg, ${content.color} 0%, ${content.color}dd 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          animation: 'titlePulse 0.8s ease-out'
        }}>
          {content.title}
        </h1>
        
        <p style={{
          fontSize: '24px',
          color: 'white',
          fontWeight: '600',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          animation: 'subtitleSlide 1s ease-out 0.5s both'
        }}>
          {content.subtitle}
        </p>
      </div>

      <style jsx>{`
        @keyframes celebrationShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes megaCelebration {
          0% { opacity: 0; transform: scale(0.3); }
          20% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes celebrationBounce {
          0% { transform: scale(0) rotate(0deg); }
          50% { transform: scale(1.2) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); }
        }
        @keyframes titlePulse {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes subtitleSlide {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default { FOMONotificationSystem, SocialFOMOFeed, HarvestSystem, MegaCelebration };