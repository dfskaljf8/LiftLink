import React, { useState } from 'react';
import { AnimatedDumbbell, AnimatedTree, AnimatedCoin, AnimatedFire, AnimatedStar } from './AnimatedSVGs';
import '../styles/ProfessionalDesign.css';

const ProfessionalNavigation = ({ currentView, setCurrentView, userProfile, toggleSidebar }) => {
  const [activeTab, setActiveTab] = useState(currentView || 'home');

  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'trainers', label: 'Search', icon: '🔍' },
    { id: 'bookings', label: 'Bookings', icon: '📅' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'profile', label: 'Account', icon: '👤' }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setCurrentView(tabId);
  };

  return (
    <>
      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <div className="nav-icon">{typeof tab.icon === 'string' ? tab.icon : tab.icon}</div>
              <div className="nav-label">{tab.label}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

const ProfessionalSidebar = ({ isOpen, toggleSidebar, setCurrentView, userProfile, logout }) => {
  const sidebarItems = [
    { 
      id: 'fitness-forest', 
      label: 'Forest', 
      icon: <AnimatedTree size={24} growth={userProfile?.level * 10 || 50} />,
      subtitle: 'Grow your progress'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: <span style={{ fontSize: '24px' }}>📊</span>,
      subtitle: 'Track your journey'
    },
    { 
      id: 'social', 
      label: 'Social', 
      icon: <span style={{ fontSize: '24px' }}>👥</span>,
      subtitle: 'Connect & compete'
    },
    { 
      id: 'achievements', 
      label: 'Rewards', 
      icon: <AnimatedStar size={24} filled sparkling />,
      subtitle: 'Your milestones'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: '⚙️',
      subtitle: 'Customize app'
    },
    { 
      id: 'help', 
      label: 'Help & Support', 
      icon: '❓',
      subtitle: 'Get assistance'
    }
  ];

  const handleItemClick = (itemId) => {
    setCurrentView(itemId);
    toggleSidebar();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {userProfile?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{
                fontWeight: '600',
                fontSize: '16px',
                marginBottom: '2px'
              }}>
                {userProfile?.name || 'User'}
              </div>
              <div style={{
                color: 'var(--text-muted)',
                fontSize: '14px'
              }}>
                Level {userProfile?.level || 1} • {userProfile?.lift_coins || 0} LiftCoins
              </div>
            </div>
          </div>
          
          <button
            onClick={toggleSidebar}
            style={{
              position: 'absolute',
              top: 'var(--space-md)',
              right: 'var(--space-md)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Menu Items */}
        <div className="sidebar-menu">
          {sidebarItems.map((item) => (
            <a
              key={item.id}
              href="#"
              className="sidebar-item"
              onClick={(e) => {
                e.preventDefault();
                handleItemClick(item.id);
              }}
            >
              <div style={{ fontSize: '20px' }}>{item.icon}</div>
              <div>
                <div style={{
                  fontWeight: '500',
                  marginBottom: '2px'
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)'
                }}>
                  {item.subtitle}
                </div>
              </div>
            </a>
          ))}
          
          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'rgba(255, 255, 255, 0.1)',
            margin: 'var(--space-lg) 0'
          }}></div>
          
          {/* Logout */}
          <a
            href="#"
            className="sidebar-item"
            onClick={(e) => {
              e.preventDefault();
              logout();
              toggleSidebar();
            }}
            style={{ color: 'var(--error)' }}
          >
            <div style={{ fontSize: '20px' }}>🚪</div>
            <div>
              <div style={{ fontWeight: '500' }}>Logout</div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-muted)'
              }}>
                Sign out of your account
              </div>
            </div>
          </a>
        </div>
      </div>
    </>
  );
};

export { ProfessionalNavigation, ProfessionalSidebar };