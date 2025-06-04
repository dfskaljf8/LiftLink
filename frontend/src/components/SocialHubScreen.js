import React, { useState, useEffect } from 'react';
import { TactileButton, FloatingMascot } from '../DelightfulAnimations';
import { AnimatedCard } from '../DelightfulComponents';
import '../styles/ProfessionalDesign.css';

const SocialHubScreen = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [friends, setFriends] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [feed, setFeed] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showMascot, setShowMascot] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = () => {
    // Mock social data with realistic fitness interactions
    setFriends([
      {
        id: 1,
        name: 'Alex Chen',
        level: 8,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        status: 'online',
        lastWorkout: '2 hours ago',
        streak: 12,
        location: 'New York',
        mutualFriends: 3,
        isTrainer: false
      },
      {
        id: 2,
        name: 'Sarah Kim',
        level: 6,
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b190?w=50&h=50&fit=crop&crop=face',
        status: 'in-workout',
        lastWorkout: 'Active now',
        streak: 8,
        location: 'Los Angeles',
        mutualFriends: 5,
        isTrainer: true
      },
      {
        id: 3,
        name: 'Marcus Johnson',
        level: 10,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        status: 'offline',
        lastWorkout: '1 day ago',
        streak: 25,
        location: 'Chicago',
        mutualFriends: 2,
        isTrainer: false
      }
    ]);

    setChallenges([
      {
        id: 1,
        title: '30-Day Fitness Challenge',
        description: 'Complete 30 workouts in 30 days',
        participants: 156,
        daysLeft: 12,
        progress: 68,
        reward: '500 LiftCoins',
        icon: '🔥',
        type: 'community',
        difficulty: 'Medium'
      },
      {
        id: 2,
        title: 'Squad Goals',
        description: 'Team up with 3 friends for group workouts',
        participants: 4,
        daysLeft: 20,
        progress: 45,
        reward: '300 LiftCoins',
        icon: '👥',
        type: 'friends',
        difficulty: 'Easy'
      },
      {
        id: 3,
        title: 'Weekend Warrior',
        description: 'Complete 8 weekend workouts this month',
        participants: 234,
        daysLeft: 8,
        progress: 75,
        reward: '200 LiftCoins',
        icon: '⚡',
        type: 'personal',
        difficulty: 'Hard'
      }
    ]);

    setFeed([
      {
        id: 1,
        user: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        action: 'completed a HIIT workout',
        time: '2 hours ago',
        details: '45 minutes • 320 calories burned • 💪 Strength focus',
        likes: 12,
        comments: 3,
        type: 'workout',
        reactions: ['💪', '🔥', '👏'],
        location: 'Central Park, NYC'
      },
      {
        id: 2,
        user: 'Sarah Kim',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b190?w=50&h=50&fit=crop&crop=face',
        action: 'achieved a new milestone',
        time: '1 day ago',
        details: 'Reached Level 6! 🎉 30-day streak achieved',
        likes: 28,
        comments: 8,
        type: 'achievement',
        reactions: ['🎉', '🏆', '⭐'],
        badge: 'Consistency Champion'
      },
      {
        id: 3,
        user: 'Marcus Johnson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        action: 'completed a challenge',
        time: '2 days ago',
        details: '7-Day Strength Challenge completed! New personal best: 220 lbs deadlift',
        likes: 45,
        comments: 15,
        type: 'challenge',
        reactions: ['💪', '🔥', '🏆'],
        challenge: '7-Day Strength Challenge'
      }
    ]);

    setNotifications([
      { id: 1, text: 'Alex Chen liked your workout', time: '5 min ago', type: 'like' },
      { id: 2, text: 'New challenge available: "Cardio King"', time: '1 hour ago', type: 'challenge' },
      { id: 3, text: 'Sarah Kim commented on your progress', time: '2 hours ago', type: 'comment' }
    ]);
  };

  const handleLike = (feedId) => {
    setFeed(prev => prev.map(item => 
      item.id === feedId 
        ? { ...item, likes: item.likes + 1 }
        : item
    ));
  };

  const handleJoinChallenge = (challengeId) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, participants: challenge.participants + 1 }
        : challenge
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'var(--success)';
      case 'in-workout': return 'var(--warning)';
      case 'offline': return 'var(--text-muted)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return '🟢 Online';
      case 'in-workout': return '🏃‍♂️ Working out';
      case 'offline': return '⚫ Offline';
      default: return 'Unknown';
    }
  };

  const FeedItem = ({ item }) => (
    <AnimatedCard className="glass-card" style={{
      padding: '20px',
      marginBottom: '15px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '15px'
      }}>
        <div style={{ position: 'relative' }}>
          <img
            src={item.avatar}
            alt={item.user}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--accent-primary)'
            }}
          />
          {item.type === 'achievement' && (
            <div style={{
              position: 'absolute',
              bottom: '-5px',
              right: '-5px',
              background: 'var(--warning)',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px'
            }}>
              🏆
            </div>
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '5px'
          }}>
            <span style={{ fontWeight: '600', fontSize: '16px' }}>{item.user}</span>
            <span style={{ color: 'var(--text-muted)' }}>{item.action}</span>
          </div>
          
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            marginBottom: '10px',
            lineHeight: '1.4'
          }}>
            {item.details}
          </div>
          
          {item.location && (
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '10px'
            }}>
              📍 {item.location}
            </div>
          )}
          
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}>
            {item.time}
          </div>
        </div>
      </div>
      
      {/* Reactions */}
      <div style={{
        display: 'flex',
        gap: '15px',
        paddingTop: '15px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        alignItems: 'center'
      }}>
        <button
          onClick={() => handleLike(item.id)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ❤️ {item.likes}
        </button>
        
        <button style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          padding: '8px',
          borderRadius: '8px',
          transition: 'all 0.3s ease'
        }}>
          💬 {item.comments}
        </button>
        
        <button style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '14px',
          padding: '8px',
          borderRadius: '8px',
          transition: 'all 0.3s ease'
        }}>
          📤 Share
        </button>
        
        {/* Quick reactions */}
        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          gap: '5px'
        }}>
          {item.reactions.map((reaction, index) => (
            <button
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '20px',
                padding: '5px 10px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              {reaction}
            </button>
          ))}
        </div>
      </div>
    </AnimatedCard>
  );

  const FriendCard = ({ friend }) => (
    <AnimatedCard className="glass-card interactive-card" style={{
      padding: '20px',
      marginBottom: '15px',
      border: friend.isTrainer ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{ position: 'relative' }}>
          <img
            src={friend.avatar}
            alt={friend.name}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: `3px solid ${friend.isTrainer ? 'var(--accent-primary)' : 'var(--text-muted)'}`
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: getStatusColor(friend.status),
            border: '3px solid var(--primary-bg)'
          }} />
          {friend.isTrainer && (
            <div style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: 'var(--accent-primary)',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px'
            }}>
              💪
            </div>
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '5px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              margin: 0
            }}>
              {friend.name}
            </h3>
            {friend.isTrainer && (
              <span style={{
                background: 'var(--accent-primary)',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '600'
              }}>
                TRAINER
              </span>
            )}
          </div>
          
          <div style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            marginBottom: '5px'
          }}>
            Level {friend.level} • {getStatusText(friend.status)} • {friend.location}
          </div>
          
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            marginBottom: '10px'
          }}>
            🔥 {friend.streak} day streak • Last workout: {friend.lastWorkout}
          </div>
          
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}>
            {friend.mutualFriends} mutual friends
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <TactileButton size="small" variant="primary">
            💬 Message
          </TactileButton>
          <TactileButton size="small" variant="secondary">
            👋 Workout Together
          </TactileButton>
        </div>
      </div>
    </AnimatedCard>
  );

  const ChallengeCard = ({ challenge }) => (
    <AnimatedCard className="glass-card" style={{
      padding: '25px',
      marginBottom: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '48px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {challenge.icon}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: 0
            }}>
              {challenge.title}
            </h3>
            <span style={{
              background: challenge.difficulty === 'Easy' ? 'var(--success)' : 
                         challenge.difficulty === 'Medium' ? 'var(--warning)' : 'var(--error)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: '600'
            }}>
              {challenge.difficulty}
            </span>
          </div>
          
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            marginBottom: '10px',
            lineHeight: '1.4'
          }}>
            {challenge.description}
          </p>
          
          <div style={{
            display: 'flex',
            gap: '20px',
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}>
            <span>👥 {challenge.participants} participants</span>
            <span>⏰ {challenge.daysLeft} days left</span>
            <span>🏆 {challenge.reward}</span>
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Progress</span>
          <span style={{
            fontSize: '14px',
            color: 'var(--accent-primary)',
            fontWeight: '600'
          }}>
            {challenge.progress}%
          </span>
        </div>
        
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${challenge.progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--accent-primary) 0%, var(--success) 100%)',
            borderRadius: '4px',
            transition: 'width 0.8s ease',
            position: 'relative'
          }}>
            {challenge.progress > 70 && (
              <div style={{
                position: 'absolute',
                right: '5px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '10px',
                animation: 'bounce 2s infinite'
              }}>
                🔥
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '16px',
          color: 'var(--accent-primary)',
          fontWeight: '600'
        }}>
          {challenge.reward}
        </div>
        <TactileButton
          onClick={() => handleJoinChallenge(challenge.id)}
          variant="primary"
        >
          {challenge.type === 'personal' ? '🎯 Continue' : '🚀 Join Challenge'}
        </TactileButton>
      </div>
    </AnimatedCard>
  );

  const NotificationItem = ({ notification }) => (
    <div className="glass-card" style={{
      padding: '15px',
      marginBottom: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      animation: 'slideInRight 0.3s ease-out'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: notification.type === 'like' ? 'var(--error)' : 
                   notification.type === 'comment' ? 'var(--accent-primary)' : 'var(--warning)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px'
      }}>
        {notification.type === 'like' ? '❤️' : 
         notification.type === 'comment' ? '💬' : '🏆'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '500', marginBottom: '2px' }}>
          {notification.text}
        </div>
        <div style={{
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          {notification.time}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'feed', label: 'Feed', icon: '📰' },
    { id: 'friends', label: 'Friends', icon: '👥' },
    { id: 'challenges', label: 'Challenges', icon: '🏆' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  return (
    <div className="social-hub-screen">
      {/* Header */}
      <div style={{
        padding: '30px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="30" height="30" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse"%3E%3Ccircle cx="15" cy="15" r="2" fill="rgba(255,255,255,0.1)"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23dots)"/%3E%3C/svg%3E")',
          opacity: 0.3
        }} />
        
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          position: 'relative'
        }}>
          👥 Social Hub
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '16px',
          position: 'relative'
        }}>
          Connect, compete, and motivate each other
        </p>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '25px',
          overflowX: 'auto',
          padding: '5px 0'
        }}>
          {tabs.map((tab) => (
            <TactileButton
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.id)}
              style={{
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'notifications' && notifications.length > 0 && (
                <span style={{
                  background: 'var(--error)',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {notifications.length}
                </span>
              )}
            </TactileButton>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'feed' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600'
              }}>
                Activity Feed
              </h2>
              <TactileButton variant="secondary" size="small">
                ✨ Share Update
              </TactileButton>
            </div>
            
            {feed.map((item) => (
              <FeedItem key={item.id} item={item} />
            ))}
          </div>
        )}

        {activeTab === 'friends' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600'
              }}>
                Friends ({friends.length})
              </h2>
              <TactileButton variant="secondary" size="small">
                🔍 Find Friends
              </TactileButton>
            </div>
            
            {friends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        )}

        {activeTab === 'challenges' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600'
              }}>
                Active Challenges
              </h2>
              <TactileButton variant="secondary" size="small">
                🎯 Create Challenge
              </TactileButton>
            </div>
            
            {challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600'
              }}>
                Notifications
              </h2>
              <TactileButton variant="secondary" size="small">
                ✅ Mark All Read
              </TactileButton>
            </div>
            
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Mascot */}
      {showMascot && activeTab === 'feed' && (
        <FloatingMascot
          emotion="encouraging"
          message="Great to see you connecting with the fitness community! Keep motivating each other! 🤝"
          onDismiss={() => setShowMascot(false)}
        />
      )}

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }} />
    </div>
  );
};

export default SocialHubScreen;