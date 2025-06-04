import React, { useState, useEffect, useRef } from 'react';
import { TactileButton, FloatingMascot } from './DelightfulAnimations';
import { AnimatedCard } from './DelightfulComponents';
import '../styles/ProfessionalDesign.css';

const MessagesView = ({ userProfile }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMascot, setShowMascot] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = () => {
    // Mock conversations data
    const mockConversations = [
      {
        id: 1,
        participantId: 1,
        participantName: 'Sarah Chen',
        participantAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        participantRole: 'trainer',
        lastMessage: 'Looking forward to our session tomorrow! 💪',
        lastMessageTime: '2025-01-15T14:30:00Z',
        unreadCount: 2,
        isOnline: true,
        status: 'active'
      },
      {
        id: 2,
        participantId: 2,
        participantName: 'Marcus Torres',
        participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        participantRole: 'trainer',
        lastMessage: 'Great job on today\'s HIIT session!',
        lastMessageTime: '2025-01-14T18:45:00Z',
        unreadCount: 0,
        isOnline: false,
        status: 'active'
      },
      {
        id: 3,
        participantId: 3,
        participantName: 'Emma Rodriguez',
        participantAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b190?w=150&h=150&fit=crop&crop=face',
        participantRole: 'trainer',
        lastMessage: 'Here are some yoga poses to practice at home',
        lastMessageTime: '2025-01-13T10:15:00Z',
        unreadCount: 1,
        isOnline: true,
        status: 'active'
      },
      {
        id: 4,
        participantId: 4,
        participantName: 'Alex Johnson',
        participantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        participantRole: 'user',
        lastMessage: 'Thanks for the workout tips!',
        lastMessageTime: '2025-01-12T16:20:00Z',
        unreadCount: 0,
        isOnline: false,
        status: 'active'
      }
    ];

    setConversations(mockConversations);
    if (mockConversations.length > 0) {
      setSelectedConversation(mockConversations[0]);
    }
  };

  const loadMessages = (conversationId) => {
    // Mock messages for selected conversation
    const mockMessages = {
      1: [
        {
          id: 1,
          senderId: 1,
          senderName: 'Sarah Chen',
          content: 'Hi! I\'m excited for our training session tomorrow. Do you have any specific goals you\'d like to focus on?',
          timestamp: '2025-01-15T09:00:00Z',
          type: 'text',
          isRead: true
        },
        {
          id: 2,
          senderId: 'me',
          senderName: 'Me',
          content: 'Hi Sarah! I\'d love to focus on weight loss and building some core strength. I\'ve been struggling with consistency.',
          timestamp: '2025-01-15T09:15:00Z',
          type: 'text',
          isRead: true
        },
        {
          id: 3,
          senderId: 1,
          senderName: 'Sarah Chen',
          content: 'Perfect! We\'ll work on a combination of cardio and functional movements that target your core. I\'ll also share some tips for building lasting habits.',
          timestamp: '2025-01-15T09:20:00Z',
          type: 'text',
          isRead: true
        },
        {
          id: 4,
          senderId: 'me',
          senderName: 'Me',
          content: 'That sounds great! Should I bring anything specific?',
          timestamp: '2025-01-15T09:25:00Z',
          type: 'text',
          isRead: true
        },
        {
          id: 5,
          senderId: 1,
          senderName: 'Sarah Chen',
          content: 'Just bring a water bottle and comfortable workout clothes. I\'ll have all the equipment we need!',
          timestamp: '2025-01-15T14:00:00Z',
          type: 'text',
          isRead: true
        },
        {
          id: 6,
          senderId: 1,
          senderName: 'Sarah Chen',
          content: 'Looking forward to our session tomorrow! 💪',
          timestamp: '2025-01-15T14:30:00Z',
          type: 'text',
          isRead: false
        }
      ],
      2: [
        {
          id: 1,
          senderId: 2,
          senderName: 'Marcus Torres',
          content: 'Great job on today\'s HIIT session! You really pushed through those burpees 🔥',
          timestamp: '2025-01-14T18:45:00Z',
          type: 'text',
          isRead: true
        }
      ],
      3: [
        {
          id: 1,
          senderId: 3,
          senderName: 'Emma Rodriguez',
          content: 'Here are some yoga poses to practice at home',
          timestamp: '2025-01-13T10:15:00Z',
          type: 'text',
          isRead: false
        }
      ],
      4: [
        {
          id: 1,
          senderId: 'me',
          senderName: 'Me',
          content: 'Thanks for the workout tips!',
          timestamp: '2025-01-12T16:20:00Z',
          type: 'text',
          isRead: true
        }
      ]
    };

    setMessages(mockMessages[conversationId] || []);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: messages.length + 1,
      senderId: 'me',
      senderName: 'Me',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update conversation last message
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, lastMessage: newMessage, lastMessageTime: message.timestamp, unreadCount: 0 }
        : conv
    ));
  };

  const ConversationList = () => (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      borderRight: selectedConversation ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
    }}>
      <div style={{
        padding: 'var(--space-lg)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: 'var(--space-md)'
        }}>
          Messages
        </h2>
        
        {/* Search */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search conversations..."
            style={{
              width: '100%',
              padding: 'var(--space-sm) var(--space-md)',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      <div style={{
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => setSelectedConversation(conversation)}
            style={{
              padding: 'var(--space-md)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              background: selectedConversation?.id === conversation.id ? 'rgba(0, 212, 170, 0.1)' : 'transparent',
              transition: 'background 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (selectedConversation?.id !== conversation.id) {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedConversation?.id !== conversation.id) {
                e.target.style.background = 'transparent';
              }
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)'
            }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={conversation.participantAvatar}
                  alt={conversation.participantName}
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
                  background: conversation.isOnline ? 'var(--success)' : 'var(--text-muted)',
                  border: '2px solid var(--primary-bg)'
                }} />
                {conversation.participantRole === 'trainer' && (
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: 'var(--accent-primary)',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px'
                  }}>
                    💪
                  </div>
                )}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-xs)'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {conversation.participantName}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)'
                    }}>
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <div style={{
                        background: 'var(--accent-primary)',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: '600',
                        color: 'white'
                      }}>
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
                
                <p style={{
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {conversation.lastMessage}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ChatWindow = () => {
    if (!selectedConversation) {
      return (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>💬</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '10px'
            }}>
              Select a conversation
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </div>
      );
    }

    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* Chat Header */}
        <div style={{
          padding: 'var(--space-lg)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'var(--glass-bg)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)'
          }}>
            <div style={{ position: 'relative' }}>
              <img
                src={selectedConversation.participantAvatar}
                alt={selectedConversation.participantName}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: selectedConversation.isOnline ? 'var(--success)' : 'var(--text-muted)',
                border: '2px solid var(--primary-bg)'
              }} />
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: 0,
                marginBottom: '2px'
              }}>
                {selectedConversation.participantName}
              </h3>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-muted)'
              }}>
                {selectedConversation.isOnline ? '🟢 Online' : '⚫ Offline'} • 
                {selectedConversation.participantRole === 'trainer' ? ' Personal Trainer' : ' Fitness Buddy'}
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: 'var(--space-sm)'
            }}>
              <TactileButton size="small" variant="secondary">
                📞
              </TactileButton>
              <TactileButton size="small" variant="secondary">
                📹
              </TactileButton>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          padding: 'var(--space-lg)',
          overflowY: 'auto',
          maxHeight: '400px'
        }}>
          {messages.map((message, index) => {
            const isMe = message.senderId === 'me';
            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
            
            return (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 'var(--space-sm)',
                  marginBottom: 'var(--space-md)',
                  flexDirection: isMe ? 'row-reverse' : 'row'
                }}
              >
                {!isMe && (
                  <div style={{
                    width: '30px',
                    height: '30px',
                    visibility: showAvatar ? 'visible' : 'hidden'
                  }}>
                    <img
                      src={selectedConversation.participantAvatar}
                      alt={selectedConversation.participantName}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                )}
                
                <div
                  style={{
                    maxWidth: '70%',
                    padding: 'var(--space-md)',
                    borderRadius: isMe 
                      ? '20px 20px 6px 20px' 
                      : '20px 20px 20px 6px',
                    background: isMe 
                      ? 'var(--accent-primary)' 
                      : 'var(--glass-bg)',
                    color: isMe ? 'white' : 'var(--text-primary)',
                    position: 'relative',
                    animation: 'slideInRight 0.3s ease-out'
                  }}
                >
                  <p style={{
                    margin: 0,
                    lineHeight: '1.4',
                    fontSize: '14px'
                  }}>
                    {message.content}
                  </p>
                  
                  <div style={{
                    fontSize: '10px',
                    color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                    marginTop: 'var(--space-xs)',
                    textAlign: 'right'
                  }}>
                    {formatTime(message.timestamp)}
                    {isMe && (
                      <span style={{ marginLeft: 'var(--space-xs)' }}>
                        {message.isRead ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div style={{
          padding: 'var(--space-lg)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'var(--glass-bg)'
        }}>
          <div style={{
            display: 'flex',
            gap: 'var(--space-sm)',
            alignItems: 'flex-end'
          }}>
            <TactileButton size="small" variant="secondary">
              📎
            </TactileButton>
            
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                style={{
                  width: '100%',
                  background: 'var(--card-bg)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-md)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  resize: 'none',
                  minHeight: '40px',
                  maxHeight: '120px'
                }}
                rows="1"
              />
            </div>
            
            <TactileButton 
              variant="primary" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              style={{
                opacity: newMessage.trim() ? 1 : 0.5
              }}
            >
              📤
            </TactileButton>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="messages-view">
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
          background: 'url("data:image/svg+xml,%3Csvg width="30" height="30" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="messages" width="30" height="30" patternUnits="userSpaceOnUse"%3E%3Ctext x="15" y="15" text-anchor="middle" dominant-baseline="middle" fill="rgba(255,255,255,0.1)" font-size="14"%3E💬%3C/text%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23messages)"/%3E%3C/svg%3E")',
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
          💬 Messages
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '16px',
          position: 'relative'
        }}>
          Connect with your trainers and fitness community
        </p>
      </div>

      <div style={{ padding: '20px' }}>
        <AnimatedCard className="glass-card" style={{
          padding: 0,
          height: '600px',
          display: 'flex',
          overflow: 'hidden'
        }}>
          <ConversationList />
          <ChatWindow />
        </AnimatedCard>
      </div>

      {/* Floating Mascot */}
      {showMascot && conversations.length > 0 && (
        <FloatingMascot
          emotion="happy"
          message="Stay connected with your trainers! Good communication leads to better results! 💬"
          onDismiss={() => setShowMascot(false)}
        />
      )}

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }} />
    </div>
  );
};

export default MessagesView;