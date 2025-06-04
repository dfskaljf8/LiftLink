import React, { useState, useEffect } from 'react';
import '../styles/ProfessionalDesign.css';
import { TactileButton, StreakCounter, FloatingMascot, SparkleButton } from './DelightfulAnimations';
import { MorphingProgressBar, PulsingCoinCounter, AnimatedCard } from './DelightfulComponents';

const ProfessionalHome = ({ setCurrentView, userProfile, searchTrainers }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('New York, NY');
  const [featuredTrainers, setFeaturedTrainers] = useState([]);
  const [showMascot, setShowMascot] = useState(true);
  const [celebrateAction, setCelebrateAction] = useState(false);
  const [categories, setCategories] = useState([
    { id: 1, name: 'Personal Trainers', icon: '💪', count: '2.3k+', color: '#00d4aa' },
    { id: 2, name: 'Yoga Instructors', icon: '🧘‍♀️', count: '1.8k+', color: '#8b5cf6' },
    { id: 3, name: 'Nutritionists', icon: '🥗', count: '950+', color: '#10b981' },
    { id: 4, name: 'Pilates', icon: '🤸‍♀️', count: '720+', color: '#f59e0b' },
    { id: 5, name: 'Boxing', icon: '🥊', count: '560+', color: '#ef4444' },
    { id: 6, name: 'Swimming', icon: '🏊‍♂️', count: '430+', color: '#3b82f6' }
  ]);

  useEffect(() => {
    // Mock featured trainers
    setFeaturedTrainers([
      {
        id: 1,
        name: 'Sarah Chen',
        specialties: ['Weight Loss', 'Strength Training'],
        rating: 4.9,
        reviews: 127,
        hourlyRate: 75,
        distance: '0.8 km away',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        verified: true
      },
      {
        id: 2,
        name: 'Marcus Torres',
        specialties: ['Athletic Performance', 'HIIT'],
        rating: 4.8,
        reviews: 89,
        hourlyRate: 85,
        distance: '1.2 km away',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        verified: true
      }
    ]);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchTrainers(searchQuery);
      setCurrentView('trainers');
    }
  };

  const handleCategorySelect = (category) => {
    setSearchQuery(category.name);
    searchTrainers(category.name);
    setCurrentView('trainers');
  };

  return (
    <div className="professional-home">
      {/* Header Section */}
      <div className="home-header" style={{
        padding: 'var(--space-xl) var(--space-lg)',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--primary-bg) 0%, var(--secondary-bg) 100%)'
      }}>
        <div className="welcome-section fade-in">
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: 'var(--space-sm)',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Find a Fitness Pro Now
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '18px',
            marginBottom: 'var(--space-xl)'
          }}>
            Connect with verified professionals in your area
          </p>
        </div>

        {/* Search Section */}
        <div className="search-section slide-up" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="search-container">
            <div style={{ position: 'relative', marginBottom: 'var(--space-md)' }}>
              <input
                type="text"
                className="search-input"
                placeholder="What type of trainer are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={{ paddingLeft: '50px' }}
              />
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px',
                color: 'var(--text-muted)'
              }}>
                🔍
              </div>
            </div>
            
            {/* Location Picker */}
            <div className="location-picker" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-sm)',
              color: 'var(--text-muted)',
              fontSize: '14px'
            }}>
              <span>📍</span>
              <span>{location}</span>
              <button style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                Change
              </button>
            </div>
          </div>

          <TactileButton 
            onClick={handleSearch}
            variant="primary"
            size="large"
            style={{
              width: '100%',
              maxWidth: '400px',
              marginTop: 'var(--space-md)',
              fontSize: '18px',
              padding: 'var(--space-lg)'
            }}
          >
            🔍 Search Trainers
          </TactileButton>
        </div>
      </div>

      {/* Quick Categories */}
      <div className="categories-section" style={{ padding: '0 var(--space-lg) var(--space-xl)' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: 'var(--space-lg)',
          textAlign: 'center'
        }}>
          Popular Categories
        </h2>
        
        <div className="categories-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-2xl)'
        }}>
          {categories.map((category, index) => (
            <AnimatedCard
              key={category.id}
              delay={index * 100}
              direction="scale"
              className="category-card glass-card interactive-card"
              onClick={() => handleCategorySelect(category)}
              style={{
                padding: 'var(--space-lg)',
                textAlign: 'center',
                cursor: 'pointer',
                borderLeft: `4px solid ${category.color}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Glow effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${category.color}, transparent)`,
                opacity: 0.6
              }} />
              
              <div style={{ 
                fontSize: '32px', 
                marginBottom: 'var(--space-sm)',
                animation: `bounce 2s infinite ${index * 0.2}s`
              }}>
                {category.icon}
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: 'var(--space-xs)',
                color: category.color
              }}>
                {category.name}
              </h3>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '14px'
              }}>
                {category.count} available
              </p>
            </AnimatedCard>
          ))}
        </div>
      </div>

      {/* Featured Trainers */}
      <div className="featured-section" style={{ padding: '0 var(--space-lg) var(--space-2xl)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-lg)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600'
          }}>
            Featured Professionals
          </h2>
          <button
            className="btn-secondary"
            onClick={() => setCurrentView('trainers')}
            style={{ fontSize: '14px', padding: 'var(--space-sm) var(--space-md)' }}
          >
            View All
          </button>
        </div>

        <div className="featured-grid" style={{
          display: 'grid',
          gap: 'var(--space-lg)'
        }}>
          {featuredTrainers.map((trainer, index) => (
            <AnimatedCard
              key={trainer.id}
              delay={index * 200}
              direction="up"
              className="pro-card interactive-card"
              onClick={() => setCurrentView('trainers')}
            >
              <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={trainer.avatar}
                    alt={trainer.name}
                    className="pro-avatar"
                    style={{ width: '80px', height: '80px' }}
                  />
                  {trainer.verified && (
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      background: 'var(--success)',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid var(--primary-bg)',
                      animation: 'pulse 2s infinite'
                    }}>
                      ✓
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: 'var(--space-xs)'
                  }}>
                    {trainer.name}
                  </h3>
                  
                  <div className="pro-rating" style={{ marginBottom: 'var(--space-xs)' }}>
                    <span className="star">⭐</span>
                    <span>{trainer.rating}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({trainer.reviews})</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--space-xs)',
                    marginBottom: 'var(--space-sm)'
                  }}>
                    {trainer.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'var(--card-bg)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          border: '1px solid rgba(0, 212, 170, 0.3)'
                        }}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{
                        fontWeight: '600',
                        color: 'var(--accent-primary)',
                        fontSize: '18px'
                      }}>
                        ${trainer.hourlyRate}/hour
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)'
                      }}>
                        📍 {trainer.distance}
                      </div>
                    </div>
                    
                    <TactileButton 
                      variant="primary"
                      size="medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCelebrateAction(true);
                        setTimeout(() => setCelebrateAction(false), 1000);
                      }}
                    >
                      ⚡ Book Now
                    </TactileButton>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>

      {/* User Stats Section */}
      {userProfile && (
        <div style={{ padding: '0 var(--space-lg) var(--space-xl)' }}>
          <AnimatedCard delay={600} direction="up" className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: 'var(--space-lg)',
              textAlign: 'center'
            }}>
              Your Fitness Journey
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 'var(--space-md)',
              marginBottom: 'var(--space-lg)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 'var(--space-sm)' }}>
                  <StreakCounter count={userProfile.consecutive_days || 0} isIncreasing={celebrateAction} />
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Day Streak
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 'var(--space-sm)' }}>
                  <PulsingCoinCounter coins={userProfile.lift_coins || 0} isIncreasing={celebrateAction} />
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  LiftCoins
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'var(--accent-secondary)',
                  marginBottom: 'var(--space-sm)'
                }}>
                  ⭐ {userProfile.level || 1}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Level
                </div>
              </div>
            </div>
            
            <MorphingProgressBar 
              progress={((userProfile.level || 1) % 10) * 10}
              label="Progress to next level"
              color="var(--accent-primary)"
              showSparkles={true}
            />
          </AnimatedCard>
        </div>
      )}

      {/* Floating Mascot */}
      {showMascot && (
        <FloatingMascot
          emotion="happy"
          message="Ready to find your perfect trainer? Let's get those gains! 💪"
          onDismiss={() => setShowMascot(false)}
        />
      )}

      {/* Bottom Spacing for Navigation */}
      <div style={{ height: '100px' }}></div>
    </div>
  );
};

export default ProfessionalHome;