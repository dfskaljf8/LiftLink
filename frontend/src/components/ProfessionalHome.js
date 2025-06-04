import React, { useState, useEffect } from 'react';
import '../styles/ProfessionalDesign.css';

const ProfessionalHome = ({ setCurrentView, userProfile, searchTrainers }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('New York, NY');
  const [featuredTrainers, setFeaturedTrainers] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: 'Personal Trainers', icon: '💪', count: '2.3k+' },
    { id: 2, name: 'Yoga Instructors', icon: '🧘‍♀️', count: '1.8k+' },
    { id: 3, name: 'Nutritionists', icon: '🥗', count: '950+' },
    { id: 4, name: 'Pilates', icon: '🤸‍♀️', count: '720+' },
    { id: 5, name: 'Boxing', icon: '🥊', count: '560+' },
    { id: 6, name: 'Swimming', icon: '🏊‍♂️', count: '430+' }
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

          <button 
            className="btn-primary scale-in"
            onClick={handleSearch}
            style={{
              width: '100%',
              maxWidth: '400px',
              marginTop: 'var(--space-md)',
              fontSize: '18px',
              padding: 'var(--space-lg)'
            }}
          >
            Search Trainers
          </button>
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
            <div
              key={category.id}
              className="category-card glass-card fade-in"
              onClick={() => handleCategorySelect(category)}
              style={{
                padding: 'var(--space-lg)',
                textAlign: 'center',
                cursor: 'pointer',
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: 'var(--space-sm)' }}>
                {category.icon}
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: 'var(--space-xs)'
              }}>
                {category.name}
              </h3>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '14px'
              }}>
                {category.count} available
              </p>
            </div>
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
            <div
              key={trainer.id}
              className="pro-card slide-up"
              onClick={() => setCurrentView('trainers')}
              style={{
                animationDelay: `${index * 0.2}s`
              }}
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
                      border: '2px solid var(--primary-bg)'
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
                          color: 'var(--text-secondary)'
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
                        color: 'var(--accent-primary)'
                      }}>
                        ${trainer.hourlyRate}/hour
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)'
                      }}>
                        {trainer.distance}
                      </div>
                    </div>
                    
                    <button className="btn-primary" style={{
                      padding: 'var(--space-sm) var(--space-md)',
                      fontSize: '14px'
                    }}>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Spacing for Navigation */}
      <div style={{ height: '100px' }}></div>
    </div>
  );
};

export default ProfessionalHome;