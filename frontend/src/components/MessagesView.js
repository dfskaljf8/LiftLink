import React, { useState, useEffect, useRef } from 'react';
import { TactileButton, FloatingMascot } from '../DelightfulAnimations';
import { AnimatedCard } from '../DelightfulComponents';
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
          content: 'Hi! I\'m excited for our training session tomorrow.',
          timestamp: '2025-01-15T09:00:00Z',
          type: 'text',
          isRead: true
        }
      ],
      2: [
        {
          id: 1,
          senderId: 2,
          senderName: 'Marcus Torres',
          content: 'Great job on today\'s HIIT session!',
          timestamp: '2025-01-14T18:45:00Z',
          type: 'text',
          isRead: true
        }
      ]
    };

    setMessages(mockMessages[conversationId] || []);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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
  };

  return (
    <div className="messages-view">
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
          💬 Messages
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: '16px'
        }}>
          Connect with your trainers and fitness community
        </p>
      </div>

      <div style={{ padding: '20px' }}>
        <AnimatedCard className="glass-card" style={{
          padding: '20px',
          height: '600px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '20px'
          }}>
            Recent Conversations
          </h3>
          
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              style={{
                padding: '15px',
                borderRadius: '12px',
                marginBottom: '10px',
                cursor: 'pointer',
                background: selectedConversation?.id === conversation.id ? 'var(--accent-primary)' : 'var(--card-bg)',
                color: selectedConversation?.id === conversation.id ? 'white' : 'var(--text-primary)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <img
                  src={conversation.participantAvatar}
                  alt={conversation.participantName}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: 0,
                    marginBottom: '4px'
                  }}>
                    {conversation.participantName}
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    margin: 0,
                    opacity: 0.8
                  }}>
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <div style={{
                    background: '#ef4444',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </AnimatedCard>
      </div>

      {/* Floating Mascot */}
      {showMascot && conversations.length > 0 && (
        <FloatingMascot
          emotion="happy"
          message="Stay connected with your trainers!"
          onDismiss={() => setShowMascot(false)}
        />
      )}

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }} />
    </div>
  );
};

export default MessagesView;