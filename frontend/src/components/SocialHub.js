import React, { useState, useEffect } from 'react';
import '../styles/ProfessionalDesign.css';

const SocialHub = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [friends, setFriends] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [feed, setFeed] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Mock social data
    setFriends([
      {
        id: 1,
        name: 'Alex Chen',
        level: 8,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        status: 'online',
        lastWorkout: '2 hours ago',
        streak: 12
      },
      {
        id: 2,
        name: 'Sarah Kim',
        level: 6,
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b190?w=50&h=50&fit=crop&crop=face',
        status: 'offline',
        lastWorkout: '1 day ago',
        streak: 8
      },
      {
        id: 3,
        name: 'Marcus Johnson',
        level: 10,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        status: 'online',
        lastWorkout: '30 min ago',
        streak: 25
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
        icon: '🔥'
      },
      {
        id: 2,
        title: 'Squad Goals',
        description: 'Team up with 3 friends for group workouts',
        participants: 89,
        daysLeft: 20,
        progress: 45,
        reward: '300 LiftCoins',
        icon: '👥'
      },
      {
        id: 3,
        title: 'Weekend Warrior',
        description: 'Complete 8 weekend workouts this month',
        participants: 234,
        daysLeft: 8,
        progress: 75,
        reward: '200 LiftCoins',
        icon: '⚡'
      }
    ]);

    setFeed([
      {
        id: 1,
        user: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        action: 'completed a HIIT workout',
        time: '2 hours ago',
        details: '45 minutes • 320 calories burned',
        likes: 12,
        comments: 3,
        type: 'workout'
      },
      {
        id: 2,
        user: 'Sarah Kim',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b190?w=50&h=50&fit=crop&crop=face',
        action: 'achieved a new milestone',
        time: '1 day ago',
        details: 'Reached Level 6! 🎉',
        likes: 28,
        comments: 8,
        type: 'achievement'
      },
      {
        id: 3,
        user: 'Marcus Johnson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        action: 'shared a progress photo',
        time: '2 days ago',
        details: '6 months transformation progress',
        likes: 45,
        comments: 15,
        type: 'photo'
      }
    ]);

    setMessages([
      {
        id: 1,
        user: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        lastMessage: 'Great workout today! Want to join me tomorrow?',
        time: '2 hours ago',
        unread: true
      },
      {
        id: 2,
        user: 'Sarah Kim',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b190?w=50&h=50&fit=crop&crop=face',
        lastMessage: 'Thanks for the motivation! 💪',
        time: '1 day ago',
        unread: false
      }
    ]);
  }, []);

  const FeedItem = ({ item }) => (
    <div className="glass-card slide-up" style={{
      padding: 'var(--space-lg)',
      marginBottom: 'var(--space-md)'
    }}>
      <div style={{
        display: 'flex',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-md)'
      }}>
        <img
          src={item.avatar}
          alt={item.user}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            marginBottom: 'var(--space-xs)'
          }}>
            <span style={{ fontWeight: '600' }}>{item.user}</span>
            <span style={{ color: 'var(--text-muted)' }}>{item.action}</span>
          </div>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            marginBottom: 'var(--space-sm)'
          }}>
            {item.details}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}>
            {item.time}
          </div>
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        gap: 'var(--space-lg)',
        paddingTop: 'var(--space-sm)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-xs)',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          ❤️ {item.likes}
        </button>
        <button style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-xs)',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          💬 {item.comments}
        </button>
        <button style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          📤 Share
        </button>
      </div>
    </div>
  );

  const FriendCard = ({ friend }) => (
    <div className="glass-card" style={{
      padding: 'var(--space-md)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-md)',
      marginBottom: 'var(--space-sm)'
    }}>
      <div style={{ position: 'relative' }}>
        <img
          src={friend.avatar}
          alt={friend.name}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: friend.status === 'online' ? 'var(--success)' : 'var(--text-muted)',
          border: '2px solid var(--primary-bg)'
        }}></div>
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: '600',
          marginBottom: '2px'
        }}>
          {friend.name}
        </div>
        <div style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginBottom: '2px'
        }}>
          Level {friend.level} • {friend.streak} day streak
        </div>
        <div style={{
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          Last workout: {friend.lastWorkout}
        </div>
      </div>
      
      <button className="btn-secondary" style={{
        padding: 'var(--space-sm)',
        fontSize: '12px'
      }}>
        Message
      </button>
    </div>
  );

  const ChallengeCard = ({ challenge }) => (
    <div className="glass-card" style={{
      padding: 'var(--space-lg)',
      marginBottom: 'var(--space-md)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-md)'
      }}>
        <div style={{ fontSize: '32px' }}>
          {challenge.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: 'var(--space-xs)'
          }}>
            {challenge.title}
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            marginBottom: 'var(--space-xs)'
          }}>
            {challenge.description}
          </p>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}>
            {challenge.participants} participants • {challenge.daysLeft} days left
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-sm)'
        }}>
          <span style={{ fontSize: '14px' }}>Progress</span>
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
          height: '6px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${challenge.progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--accent-primary) 0%, var(--success) 100%)',
            borderRadius: '3px'
          }}></div>
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '14px',
          color: 'var(--accent-primary)',
          fontWeight: '600'
        }}>
          🏆 {challenge.reward}
        </div>
        <button className="btn-primary" style={{
          padding: 'var(--space-sm) var(--space-md)',
          fontSize: '14px'
        }}>
          Join Challenge
        </button>
      </div>
    </div>
  );

  const MessageItem = ({ message }) => (
    <div className="glass-card" style={{
      padding: 'var(--space-md)',
      marginBottom: 'var(--space-sm)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-md)',
      cursor: 'pointer',
      border: message.unread ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <img
        src={message.avatar}
        alt={message.user}
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          objectFit: 'cover'
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: message.unread ? '600' : '500',
          marginBottom: '2px'
        }}>
          {message.user}
        </div>
        <div style={{
          color: message.unread ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontSize: '14px',
          marginBottom: '2px'
        }}>
          {message.lastMessage}
        </div>
        <div style={{
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          {message.time}
        </div>
      </div>
      {message.unread && (
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'var(--accent-primary)'
        }}></div>
      )}
    </div>
  );

  const tabs = [
    { id: 'feed', label: 'Feed', icon: '📰' },
    { id: 'friends', label: 'Friends', icon: '👥' },
    { id: 'challenges', label: 'Challenges', icon: '🏆' },
    { id: 'messages', label: 'Messages', icon: '💬' }
  ];

  return (
    <div className="social-hub">
      {/* Header */}
      <div style={{
        padding: 'var(--space-xl) var(--space-lg)',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: 'var(--space-sm)',
          background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Social Hub
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '16px'
        }}>
          Connect, compete, and motivate each other
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ padding: '0 var(--space-lg) var(--space-lg)' }}>
        <div style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-xl)',
          overflowX: 'auto',
          padding: 'var(--space-sm) 0'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: 'var(--space-sm) var(--space-md)',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 var(--space-lg) var(--space-2xl)' }}>
        {activeTab === 'feed' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-lg)'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600'
              }}>
                Activity Feed
              </h2>
              <button className="btn-secondary" style={{
                padding: 'var(--space-sm) var(--space-md)',
                fontSize: '14px'
              }}>
                Share Update
              </button>
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
              marginBottom: 'var(--space-lg)'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600'
              }}>
                Friends ({friends.length})
              </h2>
              <button className="btn-secondary" style={{
                padding: 'var(--space-sm) var(--space-md)',
                fontSize: '14px'
              }}>
                Find Friends
              </button>
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
              marginBottom: 'var(--space-lg)'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600'
              }}>
                Active Challenges
              </h2>
              <button className="btn-secondary" style={{
                padding: 'var(--space-sm) var(--space-md)',
                fontSize: '14px'
              }}>
                Create Challenge
              </button>
            </div>
            
            {challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-lg)'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600'
              }}>
                Messages
              </h2>
              <button className="btn-secondary" style={{
                padding: 'var(--space-sm) var(--space-md)',
                fontSize: '14px'
              }}>
                New Message
              </button>
            </div>
            
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }}></div>
    </div>
  );
};

export default SocialHub;