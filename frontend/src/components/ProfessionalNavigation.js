import React, { useState } from 'react';
import { 
  LiftLinkLogo, 
  AnimatedHome, 
  AnimatedTree, 
  AnimatedChart, 
  AnimatedUser, 
  AnimatedStar, 
  AnimatedSearch, 
  AnimatedCalendar, 
  AnimatedMessage, 
  AnimatedSettings, 
  AnimatedHelp 
} from './AnimatedSVGs';
import '../styles/ProfessionalDesign.css';

const ProfessionalNavigation = ({ currentView, setCurrentView, userProfile, toggleSidebar }) => {
  const [activeTab, setActiveTab] = useState(currentView || 'home');

  const tabs = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: <AnimatedHome size={20} active={activeTab === 'home'} />
    },
    { 
      id: 'trainers', 
      label: 'Search', 
      icon: <AnimatedSearch size={20} active={activeTab === 'trainers'} />
    },
    { 
      id: 'bookings', 
      label: 'Bookings', 
      icon: <AnimatedCalendar size={20} active={activeTab === 'bookings'} />
    },
    { 
      id: 'messages', 
      label: 'Messages', 
      icon: <AnimatedMessage size={20} active={activeTab === 'messages'} hasNotification={true} />
    },
    { 
      id: 'profile', 
      label: 'Account', 
      icon: <AnimatedUser size={20} active={activeTab === 'profile'} />
    }
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

const ProfessionalSidebar = ({ isOpen, toggleSidebar, setCurrentView, currentView, userProfile, logout }) => {
  const sidebarItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: <AnimatedHome size={20} active={currentView === 'home'} />
    },
    { 
      id: 'fitness-forest', 
      label: 'Fitness Forest', 
      icon: <AnimatedTree size={20} growth={userProfile?.level * 10 || 50} />
    },
    { 
      id: 'analytics', 
      label: 'Progress Analytics', 
      icon: <AnimatedChart size={20} active={currentView === 'analytics'} />
    },
    { 
      id: 'social', 
      label: 'Social Hub', 
      icon: <AnimatedUser size={20} active={currentView === 'social'} />
    },
    { 
      id: 'achievements', 
      label: 'Achievements', 
      icon: <AnimatedStar size={20} filled={currentView === 'achievements'} sparkling={currentView === 'achievements'} />
    },
    { 
      id: 'trainers', 
      label: 'Find Trainers', 
      icon: <AnimatedSearch size={20} active={currentView === 'trainers'} />
    },
    { 
      id: 'bookings', 
      label: 'My Bookings', 
      icon: <AnimatedCalendar size={20} active={currentView === 'bookings'} />
    },
    { 
      id: 'messages', 
      label: 'Messages', 
      icon: <AnimatedMessage size={20} active={currentView === 'messages'} hasNotification={true} />
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: <AnimatedUser size={20} active={currentView === 'profile'} />
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <AnimatedSettings size={20} active={currentView === 'settings'} />
    },
    { 
      id: 'help', 
      label: 'Get Help', 
      icon: <AnimatedHelp size={20} active={currentView === 'help'} />
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