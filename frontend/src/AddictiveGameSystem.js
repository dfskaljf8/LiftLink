import React, { useState, useEffect, useRef } from 'react';
import { TactileButton, Confetti, FloatingMascot } from './DelightfulAnimations';
import { 
  AnimatedFire, AnimatedCoin, AnimatedTrophy, AnimatedHeart, AnimatedStar,
  AnimatedUser, AnimatedParty, AnimatedSuccess, AnimatedChart, AnimatedCheckmark
} from './components/AnimatedSVGs';
import './styles/ProfessionalDesign.css';

// Enhanced FOMO Notification System - Less cluttered, more exciting
export const FOMONotificationSystem = ({ userProfile, onAction }) => {
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkForNotifications();
  }, []);

  useEffect(() => {
    if (notificationQueue.length > 0 && !isProcessing) {
      processNextNotification();
    }
  }, [notificationQueue, isProcessing]);

  const checkForNotifications = () => {
    const newNotifications = [];
    
    const daysMissed = calculateDaysMissed();
    const currentStreak = userProfile?.consecutive_days || 0;
    
    if (daysMissed === 1) {
      newNotifications.push({
        type: 'streak_danger',
        title: 'Your Fitness Tree Needs You!',
        message: `Don't let your ${currentStreak}-day streak wither away`,
        urgency: 1,
        action: 'Water Your Tree',
        timeLeft: '2 hours',
        icon: <AnimatedFire size={32} intensity={0.7} />,
        color: '#f59e0b'
      });
    }

    const bonusExpiresIn = calculateBonusTimeLeft();
    if (bonusExpiresIn < 8) {
      newNotifications.push({
        type: 'bonus_expiring',
        title: 'Bonus Treasure Awaits!',
        message: `Claim 50 golden LiftCoins before they disappear`,
        urgency: 2,
        action: 'Claim Treasure',
        timeLeft: `${bonusExpiresIn}h left`,
        icon: <AnimatedCoin size={32} spinning={true} />,
        color: '#fbbf24'
      });
    }

    // Only show friend activity if no urgent notifications
    if (newNotifications.length === 0) {
      newNotifications.push({
        type: 'social_activity',
        title: 'John just crushed his deadlift PR!',
        message: 'Think you can beat 225 lbs?',
        urgency: 0,
        action: 'Challenge Accepted',
        timeLeft: 'Live now',
        icon: <AnimatedTrophy size={32} active={true} />,
        color: '#10b981'
      });
    }

    // Queue notifications instead of showing all at once
    setNotificationQueue(newNotifications);
  };

  const processNextNotification = () => {
    if (notificationQueue.length === 0) return;
    
    setIsProcessing(true);
    const nextNotification = notificationQueue[0];
    setCurrentNotification({ ...nextNotification, id: Date.now() });
    
    // Remove from queue
    setNotificationQueue(prev => prev.slice(1));
    
    // Auto-dismiss after 5 seconds, then process next
    setTimeout(() => {
      setCurrentNotification(null);
      setIsProcessing(false);
    }, 5000);
  };

  const dismissNotification = () => {
    setCurrentNotification(null);
    setIsProcessing(false);
  };

  const handleAction = (type) => {
    onAction(type);
    dismissNotification();
  };

  const calculateDaysMissed = () => Math.floor(Math.random() * 2); // Mock
  const calculateBonusTimeLeft = () => Math.floor(Math.random() * 12); // Mock

  if (!currentNotification) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: `linear-gradient(135deg, ${currentNotification.color}15 0%, ${currentNotification.color}05 100%)`,
          backdropFilter: 'blur(20px)',
          border: `2px solid ${currentNotification.color}30`,
          borderRadius: '20px',
          padding: '20px',
          maxWidth: '320px',
          zIndex: 1003,
          boxShadow: `0 15px 35px ${currentNotification.color}20, 0 5px 15px rgba(0,0,0,0.1)`,
          animation: 'elegantSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          overflow: 'hidden'
        }}
      >
        {/* Subtle animated background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, ${currentNotification.color}08, transparent, ${currentNotification.color}08)`,
          animation: 'subtleShimmer 3s ease-in-out infinite'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              padding: '8px',
              background: `${currentNotification.color}20`,
              borderRadius: '12px',
              animation: 'iconFloat 2s ease-in-out infinite'
            }}>
              {currentNotification.icon}
            </div>
            
            <div style={{ flex: 1 }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                margin: '0 0 4px 0',
                color: 'var(--text-primary)',
                lineHeight: '1.3'
              }}>
                {currentNotification.title}
              </h4>
              
              <p style={{ 
                fontSize: '14px', 
                margin: 0,
                color: 'var(--text-secondary)',
                lineHeight: '1.4'
              }}>
                {currentNotification.message}
              </p>
            </div>
            
            <button
              onClick={dismissNotification}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--glass-bg)'}
              onMouseLeave={(e) => e.target.style.background = 'none'}
            >
              ×
            </button>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px'
          }}>
            <TactileButton
              size="small"
              onClick={() => handleAction(currentNotification.type)}
              style={{
                background: `linear-gradient(135deg, ${currentNotification.color} 0%, ${currentNotification.color}dd 100%)`,
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: `0 4px 12px ${currentNotification.color}30`
              }}
            >
              {currentNotification.action}
            </TactileButton>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontWeight: '500'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                background: currentNotification.urgency >= 2 ? '#ef4444' : '#10b981',
                borderRadius: '50%',
                animation: 'livePulse 1.5s infinite'
              }} />
              {currentNotification.timeLeft}
            </div>
          </div>
          
          {/* Progress bar for auto-dismiss */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            background: `${currentNotification.color}40`,
            width: '100%',
            borderRadius: '0 0 18px 18px'
          }}>
            <div style={{
              height: '100%',
              background: currentNotification.color,
              borderRadius: '0 0 18px 18px',
              animation: 'progressShrink 5s linear'
            }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes elegantSlideIn {
          0% { 
            opacity: 0; 
            transform: translateX(100%) scale(0.8);
          }
          100% { 
            opacity: 1; 
            transform: translateX(0) scale(1);
          }
        }
        @keyframes subtleShimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes progressShrink {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </>
  );
};

// Cleaner Social FOMO Feed
export const SocialFOMOFeed = ({ userProfile }) => {
  const [stories, setStories] = useState([]);
  const [friendActivity, setFriendActivity] = useState([]);
  const [showFullFeed, setShowFullFeed] = useState(false);

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
        content: 'Just crushed a 45-min HIIT session!',
        timestamp: Date.now() - 3600000,
        expiresIn: 23,
        viewed: false
      },
      {
        id: 2,
        user: 'Marcus Torres',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        type: 'achievement',
        content: 'New PR! Deadlifted 275 lbs',
        timestamp: Date.now() - 7200000,
        expiresIn: 22,
        viewed: true
      },
      {
        id: 3,
        user: 'Emma Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b190?w=100&h=100&fit=crop',
        type: 'streak',
        content: '30-day streak achieved!',
        timestamp: Date.now() - 10800000,
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
        urgency: 'high',
        icon: <AnimatedStar size={20} filled={true} sparkling={true} />
      },
      {
        id: 2,
        type: 'challenge_win',
        user: 'Lisa Park',
        message: 'won the "Weekend Warrior" challenge!',
        timeAgo: '15 min ago',
        urgency: 'medium',
        icon: <AnimatedTrophy size={20} active={true} />
      }
    ];

    setStories(mockStories);
    setFriendActivity(mockActivity);
  };

  const StoryCircle = ({ story, index }) => (
    <div
      style={{
        position: 'relative',
        margin: '0 8px',
        textAlign: 'center',
        cursor: 'pointer',
        animation: `storyAppear 0.6s ease-out ${index * 0.1}s both`
      }}
      onClick={() => {/* View story */}}
    >
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: story.viewed ? 
          'linear-gradient(45deg, #d1d5db 0%, #9ca3af 100%)' :
          'linear-gradient(45deg, #C4D600 0%, #B2FF66 50%, #10b981 100%)',
        padding: '2px',
        animation: story.viewed ? 'none' : 'storyGlow 2s ease-in-out infinite'
      }}>
        <img
          src={story.avatar}
          alt={story.user}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid white'
          }}
        />
      </div>
      <div style={{
        fontSize: '11px',
        fontWeight: '500',
        marginTop: '4px',
        maxWidth: '64px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: 'var(--text-secondary)'
      }}>
        {story.user.split(' ')[0]}
      </div>
      {!story.viewed && (
        <div style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          width: '16px',
          height: '16px',
          background: '#ef4444',
          borderRadius: '50%',
          border: '2px solid white',
          animation: 'newStoryPulse 1.5s infinite'
        }} />
      )}
    </div>
  );

  const ActivityItem = ({ activity, index }) => (
    <div style={{
      background: 'var(--glass-bg)',
      border: `1px solid ${activity.urgency === 'high' ? '#C4D600' : 'rgba(255, 255, 255, 0.1)'}`,
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '8px',
      animation: `activitySlide 0.5s ease-out ${index * 0.1}s both`,
      transition: 'all 0.3s ease'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px' 
      }}>
        <div style={{
          padding: '6px',
          background: activity.urgency === 'high' ? '#C4D60020' : 'var(--card-bg)',
          borderRadius: '8px'
        }}>
          {activity.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
            <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>
              {activity.user}
            </span>
            {' '}{activity.message}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginTop: '2px'
          }}>
            {activity.timeAgo}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Compact Stories Section */}
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AnimatedFire size={20} intensity={1} />
            Friend Stories
            <div style={{
              background: '#ef4444',
              color: 'white',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '8px',
              fontWeight: '600'
            }}>
              {stories.filter(s => !s.viewed).length}
            </div>
          </h3>
        </div>
        
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          paddingBottom: '4px',
          gap: '4px'
        }}>
          {stories.slice(0, 4).map((story, index) => (
            <StoryCircle key={story.id} story={story} index={index} />
          ))}
        </div>
      </div>

      {/* Condensed Activity Feed */}
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AnimatedUser size={20} active={true} />
            Live Activity
            <div style={{
              width: '6px',
              height: '6px',
              background: '#10b981',
              borderRadius: '50%',
              animation: 'livePulse 1.5s infinite'
            }} />
          </h3>
          
          <button
            onClick={() => setShowFullFeed(!showFullFeed)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {showFullFeed ? 'Show Less' : 'Show All'}
          </button>
        </div>
        
        {friendActivity.slice(0, showFullFeed ? friendActivity.length : 2).map((activity, index) => (
          <ActivityItem key={activity.id} activity={activity} index={index} />
        ))}
      </div>

      <style jsx>{`
        @keyframes storyGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(196, 214, 0, 0.4); }
          50% { box-shadow: 0 0 0 4px rgba(196, 214, 0, 0.1); }
        }
        @keyframes storyAppear {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes newStoryPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes activitySlide {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
};

// Elegant Harvest System
export const HarvestSystem = ({ userProfile, onHarvest }) => {
  const [pendingRewards, setPendingRewards] = useState({});
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [isFloating, setIsFloating] = useState(true);

  useEffect(() => {
    calculatePendingRewards();
    const interval = setInterval(calculatePendingRewards, 60000); // Update every minute
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
    } else {
      setPendingRewards({});
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
      {/* Elegant Floating Harvest Button */}
      {isFloating && (
        <div
          style={{
            position: 'fixed',
            bottom: '120px',
            right: '20px',
            zIndex: 1002,
          }}
        >
          <div
            onClick={() => setShowHarvestModal(true)}
            style={{
              background: 'linear-gradient(135deg, #C4D600 0%, #B2FF66 100%)',
              borderRadius: '50%',
              width: '64px',
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(196, 214, 0, 0.3), 0 0 0 0 rgba(196, 214, 0, 0.4)',
              border: '3px solid rgba(255, 255, 255, 0.2)',
              animation: 'harvestPulse 2s ease-in-out infinite',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 12px 35px rgba(196, 214, 0, 0.4), 0 0 0 8px rgba(196, 214, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 8px 25px rgba(196, 214, 0, 0.3), 0 0 0 0 rgba(196, 214, 0, 0.4)';
            }}
          >
            <AnimatedCoin size={28} spinning={true} />
          </div>
          
          {/* Reward Count Badge */}
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '600',
            border: '2px solid white',
            animation: 'badgeBounce 1s infinite'
          }}>
            4
          </div>
        </div>
      )}

      {/* Elegant Harvest Modal */}
      {showHarvestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1003,
          padding: '20px',
          animation: 'modalAppear 0.4s ease-out'
        }}>
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(196, 214, 0, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'modalSlide 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {/* Elegant background effect */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              right: '-50%',
              bottom: '-50%',
              background: 'radial-gradient(circle, rgba(196, 214, 0, 0.1) 0%, transparent 70%)',
              animation: 'backgroundRotate 10s linear infinite'
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ marginBottom: '16px' }}>
                <AnimatedStar size={64} filled={true} sparkling={true} />
              </div>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #C4D600 0%, #B2FF66 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Welcome Back, Champion!
              </h2>
              
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '24px',
                fontSize: '16px'
              }}>
                Your body recovered for {pendingRewards.hoursAway} hours!
              </p>

              {/* Elegant Rewards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  animation: 'rewardFloat 2s ease-in-out infinite'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <AnimatedHeart size={28} beating={true} liked={true} />
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#ef4444' }}>
                    +{pendingRewards.strength}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Strength
                  </div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, rgba(196, 214, 0, 0.1) 0%, rgba(196, 214, 0, 0.05) 100%)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid rgba(196, 214, 0, 0.2)',
                  animation: 'rewardFloat 2s ease-in-out infinite 0.2s'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <AnimatedCoin size={28} spinning={true} />
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#C4D600' }}>
                    +{pendingRewards.liftCoins}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    LiftCoins
                  </div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  animation: 'rewardFloat 2s ease-in-out infinite 0.4s'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <AnimatedStar size={28} filled={true} sparkling={true} />
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#10b981' }}>
                    +{pendingRewards.xp}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    XP Points
                  </div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, rgba(99, 179, 237, 0.1) 0%, rgba(99, 179, 237, 0.05) 100%)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid rgba(99, 179, 237, 0.2)',
                  animation: 'rewardFloat 2s ease-in-out infinite 0.6s'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <AnimatedCheckmark size={28} color="#63b3ed" />
                  </div>
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
                  background: 'linear-gradient(135deg, #C4D600 0%, #B2FF66 100%)',
                  fontSize: '18px',
                  fontWeight: '600',
                  padding: '16px',
                  color: '#000000',
                  border: 'none',
                  boxShadow: '0 8px 25px rgba(196, 214, 0, 0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <AnimatedCoin size={20} spinning={true} />
                  Claim All Rewards!
                </div>
              </TactileButton>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes harvestPulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 8px 25px rgba(196, 214, 0, 0.3), 0 0 0 0 rgba(196, 214, 0, 0.4);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 12px 35px rgba(196, 214, 0, 0.4), 0 0 0 8px rgba(196, 214, 0, 0.1);
          }
        }
        @keyframes badgeBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes modalAppear {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes modalSlide {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes backgroundRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rewardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
};

// Refined Celebration System
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
    
    setTimeout(() => {
      setActive(false);
      onComplete?.();
    }, 2500); // Shorter duration
  };

  if (!active) return null;

  const getCelebrationContent = () => {
    switch (celebrationType) {
      case 'level_up':
        return {
          icon: <AnimatedStar size={80} filled={true} sparkling={true} />,
          title: 'LEVEL UP!',
          subtitle: 'You reached a new level!',
          color: '#C4D600'
        };
      case 'streak':
        return {
          icon: <AnimatedFire size={80} intensity={1} />,
          title: 'STREAK POWER!',
          subtitle: 'Your dedication is unstoppable!',
          color: '#ef4444'
        };
      case 'achievement':
        return {
          icon: <AnimatedTrophy size={80} active={true} />,
          title: 'ACHIEVEMENT UNLOCKED!',
          subtitle: 'You earned a new badge!',
          color: '#f59e0b'
        };
      default:
        return {
          icon: <AnimatedSuccess size={80} color="#10b981" />,
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
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)'
    }}>
      {/* Elegant Confetti */}
      <Confetti />
      
      {/* Celebration Content */}
      <div style={{
        textAlign: 'center',
        animation: 'celebrationElegant 2.5s ease-out',
        background: 'var(--glass-bg)',
        borderRadius: '24px',
        padding: '40px',
        backdropFilter: 'blur(20px)',
        border: `2px solid ${content.color}30`,
        boxShadow: `0 20px 40px ${content.color}20`
      }}>
        <div style={{
          marginBottom: '20px',
          animation: 'iconCelebrate 1s ease-out'
        }}>
          {content.icon}
        </div>
        
        <h1 style={{
          fontSize: '36px',
          fontWeight: '900',
          background: `linear-gradient(135deg, ${content.color} 0%, ${content.color}dd 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
          animation: 'titleCelebrate 0.8s ease-out 0.2s both'
        }}>
          {content.title}
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: 'var(--text-secondary)',
          fontWeight: '500',
          animation: 'subtitleCelebrate 1s ease-out 0.5s both'
        }}>
          {content.subtitle}
        </p>
      </div>

      <style jsx>{`
        @keyframes celebrationElegant {
          0% { 
            opacity: 0; 
            transform: scale(0.6) translateY(30px); 
          }
          60% { 
            opacity: 1; 
            transform: scale(1.05) translateY(-10px); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        @keyframes iconCelebrate {
          0% { transform: scale(0) rotate(0deg); }
          60% { transform: scale(1.2) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); }
        }
        @keyframes titleCelebrate {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes subtitleCelebrate {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default { FOMONotificationSystem, SocialFOMOFeed, HarvestSystem, MegaCelebration };