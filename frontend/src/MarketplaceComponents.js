// LiftLink Marketplace Components
// Inspired by Adonis with LiftLink's unique identity

import React, { useState, useEffect } from 'react';

// Marketplace Audio & Haptics (imported from main app)
const MarketplaceAudio = {
  playSound: (type) => {
    // Simple implementation for demo
    console.log(`Playing ${type} sound`);
  }
};

const MarketplaceHaptics = {
  light: () => {
    if (navigator.vibrate) navigator.vibrate(10);
  },
  match: () => {
    if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
  },
  success: () => {
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
  }
};

// LiftLink Logo Component
export const LiftLinkLogo = ({ size = 'normal', className = '' }) => {
  const sizeClass = size === 'large' ? 'large' : size === 'xl' ? 'xl' : '';
  
  return (
    <div className={`liftlink-logo ${sizeClass} ${className}`}>
      <div className="logo-barbell"></div>
      <div className="logo-text">
        <span className="lift">Lift</span><span className="link">Link</span>
      </div>
      {size === 'xl' && <div className="logo-tagline">Beginners to Believers</div>}
    </div>
  );
};

// Instant Matching System - Core Marketplace Feature
export const InstantMatch = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [matchPreferences, setMatchPreferences] = useState({
    goal: '',
    location: '',
    sessionType: 'in-person',
    budget: 75,
    availability: 'today'
  });
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const goals = [
    { id: 'weight-loss', label: 'Lose Weight', icon: '🎯', description: 'Get leaner and stronger' },
    { id: 'muscle-gain', label: 'Build Muscle', icon: '💪', description: 'Gain size and strength' },
    { id: 'fitness', label: 'Get Fit', icon: '⚡', description: 'Improve overall fitness' },
    { id: 'sport', label: 'Sport Training', icon: '🏆', description: 'Train for your sport' },
    { id: 'rehab', label: 'Rehabilitation', icon: '🩺', description: 'Recover from injury' },
    { id: 'wellness', label: 'Wellness', icon: '🧘', description: 'Mind and body balance' }
  ];

  const sessionTypes = [
    { id: 'in-person', label: 'In-Person', icon: '🏃', description: 'Meet at gym or location' },
    { id: 'virtual', label: 'Virtual', icon: '💻', description: 'Online video sessions' },
    { id: 'both', label: 'Both', icon: '🔄', description: 'Flexible options' }
  ];

  const availabilityOptions = [
    { id: 'today', label: 'Today', urgency: 'high' },
    { id: 'this-week', label: 'This Week', urgency: 'medium' },
    { id: 'flexible', label: 'Flexible', urgency: 'low' }
  ];

  const handleInstantMatch = async () => {
    setIsMatching(true);
    MarketplaceAudio.playSound('match');
    MarketplaceHaptics.match();

    // Simulate AI matching process
    setTimeout(() => {
      const matches = [
        {
          id: 'trainer_1',
          name: 'Sarah Chen',
          avatar: 'SC',
          specialty: 'Weight Loss Specialist',
          rating: 4.9,
          reviews: 127,
          rate: 75,
          availability: 'Available now',
          distance: '1.2 miles',
          verified: true,
          experience: '8 years',
          successRate: 95,
          nextSlot: '2:00 PM today',
          tags: ['NASM Certified', 'Nutrition Expert'],
          matchScore: 98
        },
        {
          id: 'trainer_2', 
          name: 'Marcus Torres',
          avatar: 'MT',
          specialty: 'Strength & Conditioning',
          rating: 4.8,
          reviews: 89,
          rate: 85,
          availability: 'Available today',
          distance: '0.8 miles',
          verified: true,
          experience: '6 years',
          successRate: 92,
          nextSlot: '4:00 PM today',
          tags: ['CSCS Certified', 'Athletic Performance'],
          matchScore: 94
        },
        {
          id: 'trainer_3',
          name: 'Jordan Kim',
          avatar: 'JK', 
          specialty: 'Functional Fitness',
          rating: 4.9,
          reviews: 156,
          rate: 70,
          availability: 'Available tomorrow',
          distance: '2.1 miles',
          verified: true,
          experience: '5 years',
          successRate: 97,
          nextSlot: '10:00 AM tomorrow',
          tags: ['CrossFit L2', 'Movement Expert'],
          matchScore: 90
        }
      ];
      
      setPotentialMatches(matches);
      setIsMatching(false);
      setShowResults(true);
    }, 2000);
  };

  const handleBookTrainer = (trainer) => {
    MarketplaceAudio.playSound('booking');
    MarketplaceHaptics.success();
    alert(`Booking session with ${trainer.name}! 🎉`);
  };

  if (showResults) {
    return (
      <div className="instant-match-results fade-in">
        <div className="results-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button 
            className="btn btn-ghost"
            onClick={() => {
              setShowResults(false);
              setPotentialMatches([]);
              MarketplaceAudio.playSound('tap');
            }}
            style={{ marginBottom: '1rem' }}
          >
            ← Back to Search
          </button>
          <h2 style={{ color: '#6B8E5A', fontSize: '2rem', marginBottom: '0.5rem' }}>
            Perfect Matches Found! 🎯
          </h2>
          <p style={{ color: '#4A90A4', fontSize: '1.1rem' }}>
            These trainers are available and match your goals
          </p>
        </div>

        <div className="match-results" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {potentialMatches.map((trainer, index) => (
            <div 
              key={trainer.id} 
              className="trainer-match-card card scale-in" 
              style={{
                animationDelay: `${index * 0.1}s`,
                background: 'rgba(20, 20, 20, 0.8)',
                border: '1px solid rgba(107, 142, 90, 0.2)',
                borderRadius: '16px',
                padding: '1.5rem'
              }}
            >
              <div className="trainer-match-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <div className="trainer-basic" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="avatar avatar-lg" style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6B8E5A, #7FA068)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: '600'
                  }}>
                    {trainer.avatar}
                  </div>
                  <div className="trainer-info">
                    <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                      {trainer.name}
                    </h3>
                    <p style={{ color: '#B0B0B0', marginBottom: '0.5rem' }}>{trainer.specialty}</p>
                    <div className="trainer-credentials" style={{ display: 'flex', gap: '0.5rem' }}>
                      {trainer.verified && (
                        <span className="badge badge-success" style={{
                          background: 'rgba(82, 196, 26, 0.2)',
                          color: '#52C41A',
                          border: '1px solid rgba(82, 196, 26, 0.3)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          ✓ Verified
                        </span>
                      )}
                      <span className="badge badge-primary" style={{
                        background: 'rgba(107, 142, 90, 0.2)',
                        color: '#6B8E5A',
                        border: '1px solid rgba(107, 142, 90, 0.3)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {trainer.experience}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="match-score" style={{ textAlign: 'center' }}>
                  <div className="score-circle" style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, #6B8E5A, #7FA068, #6B8E5A)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{ 
                      color: 'white', 
                      fontWeight: '700', 
                      fontSize: '1rem' 
                    }}>
                      {trainer.matchScore}%
                    </span>
                  </div>
                  <p style={{ color: '#B0B0B0', fontSize: '0.875rem' }}>Match</p>
                </div>
              </div>

              <div className="trainer-stats" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                marginBottom: '1rem',
                padding: '1rem',
                background: 'rgba(107, 142, 90, 0.1)',
                borderRadius: '12px'
              }}>
                <div className="stat" style={{ textAlign: 'center' }}>
                  <div className="rating" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    <span className="rating-star" style={{ color: '#D4AF37' }}>★</span>
                    <span style={{ color: '#FFFFFF', fontWeight: '600' }}>{trainer.rating}</span>
                  </div>
                  <p style={{ color: '#B0B0B0', fontSize: '0.875rem' }}>{trainer.reviews} reviews</p>
                </div>
                <div className="stat" style={{ textAlign: 'center' }}>
                  <strong style={{ color: '#6B8E5A', fontSize: '1.25rem' }}>${trainer.rate}</strong>
                  <p style={{ color: '#B0B0B0', fontSize: '0.875rem' }}>per session</p>
                </div>
                <div className="stat" style={{ textAlign: 'center' }}>
                  <strong style={{ color: '#4A90A4', fontSize: '1.25rem' }}>{trainer.distance}</strong>
                  <p style={{ color: '#B0B0B0', fontSize: '0.875rem' }}>away</p>
                </div>
              </div>

              <div className="trainer-availability" style={{ 
                marginBottom: '1rem',
                padding: '0.75rem',
                background: 'rgba(82, 196, 26, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(82, 196, 26, 0.2)'
              }}>
                <div className="availability-status" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="status-dot status-online" style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#52C41A',
                    boxShadow: '0 0 6px rgba(82, 196, 26, 0.6)'
                  }}></span>
                  <span style={{ color: '#52C41A', fontWeight: '500' }}>{trainer.availability}</span>
                </div>
                <p style={{ color: '#B0B0B0', fontSize: '0.875rem' }}>
                  Next slot: <strong style={{ color: '#FFFFFF' }}>{trainer.nextSlot}</strong>
                </p>
              </div>

              <div className="trainer-tags" style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                marginBottom: '1.5rem',
                flexWrap: 'wrap'
              }}>
                {trainer.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex} 
                    className="tag"
                    style={{
                      background: 'rgba(74, 144, 164, 0.2)',
                      color: '#4A90A4',
                      border: '1px solid rgba(74, 144, 164, 0.3)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '16px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="trainer-actions" style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-secondary"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    color: '#4A90A4',
                    border: '1px solid #4A90A4',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(74, 144, 164, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                  }}
                >
                  💬 Message
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleBookTrainer(trainer)}
                  style={{
                    flex: 2,
                    background: '#6B8E5A',
                    color: 'white',
                    border: '1px solid #6B8E5A',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#5A7A4B';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#6B8E5A';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  🚀 Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="match-footer" style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: '#B0B0B0' }}>
            Not seeing what you want?{' '}
            <button 
              className="btn btn-ghost"
              style={{
                background: 'none',
                border: 'none',
                color: '#6B8E5A',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Adjust preferences
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="instant-match" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="match-hero" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ 
          color: '#FFFFFF', 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          marginBottom: '1rem',
          fontFamily: 'Manrope, sans-serif'
        }}>
          Find Your Perfect Trainer
        </h1>
        <p style={{ 
          color: '#B0B0B0', 
          fontSize: '1.125rem', 
          maxWidth: '600px', 
          margin: '0 auto' 
        }}>
          Answer a few quick questions and we'll match you with the ideal fitness pro in seconds
        </p>
      </div>

      <div className="match-form">
        {/* Goal Selection */}
        <div className="form-section" style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ 
            color: '#6B8E5A', 
            fontSize: '1.5rem', 
            marginBottom: '1.5rem',
            fontWeight: '600'
          }}>
            What's your main goal? 🎯
          </h3>
          <div className="goal-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {goals.map((goal) => (
              <button
                key={goal.id}
                className={`goal-card ${matchPreferences.goal === goal.id ? 'selected' : ''}`}
                onClick={() => {
                  setMatchPreferences({...matchPreferences, goal: goal.id});
                  MarketplaceAudio.playSound('tap');
                  MarketplaceHaptics.light();
                }}
                style={{
                  background: matchPreferences.goal === goal.id 
                    ? 'rgba(107, 142, 90, 0.2)' 
                    : 'rgba(20, 20, 20, 0.8)',
                  border: matchPreferences.goal === goal.id 
                    ? '2px solid #6B8E5A' 
                    : '1px solid rgba(107, 142, 90, 0.2)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (matchPreferences.goal !== goal.id) {
                    e.target.style.borderColor = 'rgba(107, 142, 90, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (matchPreferences.goal !== goal.id) {
                    e.target.style.borderColor = 'rgba(107, 142, 90, 0.2)';
                  }
                }}
              >
                <div className="goal-icon" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                  {goal.icon}
                </div>
                <h4 style={{ 
                  color: '#FFFFFF', 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem' 
                }}>
                  {goal.label}
                </h4>
                <p style={{ color: '#B0B0B0', fontSize: '0.875rem', margin: 0 }}>
                  {goal.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Session Type */}
        <div className="form-section" style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ 
            color: '#6B8E5A', 
            fontSize: '1.5rem', 
            marginBottom: '1.5rem',
            fontWeight: '600'
          }}>
            How would you like to train? 💪
          </h3>
          <div className="session-type-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {sessionTypes.map((type) => (
              <button
                key={type.id}
                className={`session-type-card ${matchPreferences.sessionType === type.id ? 'selected' : ''}`}
                onClick={() => {
                  setMatchPreferences({...matchPreferences, sessionType: type.id});
                  MarketplaceAudio.playSound('tap');
                  MarketplaceHaptics.light();
                }}
                style={{
                  background: matchPreferences.sessionType === type.id 
                    ? 'rgba(107, 142, 90, 0.2)' 
                    : 'rgba(20, 20, 20, 0.8)',
                  border: matchPreferences.sessionType === type.id 
                    ? '2px solid #6B8E5A' 
                    : '1px solid rgba(107, 142, 90, 0.2)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                <div className="type-icon" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                  {type.icon}
                </div>
                <h4 style={{ 
                  color: '#FFFFFF', 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem' 
                }}>
                  {type.label}
                </h4>
                <p style={{ color: '#B0B0B0', fontSize: '0.875rem', margin: 0 }}>
                  {type.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Budget Range */}
        <div className="form-section" style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ 
            color: '#6B8E5A', 
            fontSize: '1.5rem', 
            marginBottom: '1.5rem',
            fontWeight: '600'
          }}>
            What's your budget per session? 💰
          </h3>
          <div className="budget-selector" style={{
            background: 'rgba(20, 20, 20, 0.8)',
            border: '1px solid rgba(107, 142, 90, 0.2)',
            borderRadius: '12px',
            padding: '2rem'
          }}>
            <input
              type="range"
              min="30"
              max="200"
              value={matchPreferences.budget}
              onChange={(e) => setMatchPreferences({...matchPreferences, budget: e.target.value})}
              className="budget-slider"
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: 'rgba(107, 142, 90, 0.3)',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            <div className="budget-display" style={{ 
              textAlign: 'center', 
              margin: '1rem 0' 
            }}>
              <span style={{ 
                color: '#6B8E5A', 
                fontSize: '1.5rem', 
                fontWeight: '700' 
              }}>
                ${matchPreferences.budget} per session
              </span>
            </div>
            <div className="budget-labels" style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: '#B0B0B0',
              fontSize: '0.875rem'
            }}>
              <span>$30</span>
              <span>$200+</span>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="form-section" style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ 
            color: '#6B8E5A', 
            fontSize: '1.5rem', 
            marginBottom: '1.5rem',
            fontWeight: '600'
          }}>
            When do you want to start? ⏰
          </h3>
          <div className="availability-options" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            {availabilityOptions.map((option) => (
              <button
                key={option.id}
                className={`availability-card ${matchPreferences.availability === option.id ? 'selected' : ''} ${option.urgency}`}
                onClick={() => {
                  setMatchPreferences({...matchPreferences, availability: option.id});
                  MarketplaceAudio.playSound('tap');
                  MarketplaceHaptics.light();
                }}
                style={{
                  background: matchPreferences.availability === option.id 
                    ? 'rgba(107, 142, 90, 0.2)' 
                    : 'rgba(20, 20, 20, 0.8)',
                  border: matchPreferences.availability === option.id 
                    ? '2px solid #6B8E5A' 
                    : '1px solid rgba(107, 142, 90, 0.2)',
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  position: 'relative',
                  color: '#FFFFFF',
                  fontWeight: '500'
                }}
              >
                {option.label}
                {option.urgency === 'high' && (
                  <span className="urgency-badge" style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    fontSize: '1rem'
                  }}>
                    🔥
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Location Input */}
        <div className="form-section" style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ 
            color: '#6B8E5A', 
            fontSize: '1.5rem', 
            marginBottom: '1.5rem',
            fontWeight: '600'
          }}>
            Where are you located? 📍
          </h3>
          <input
            type="text"
            placeholder="Enter your zip code or city"
            value={matchPreferences.location}
            onChange={(e) => setMatchPreferences({...matchPreferences, location: e.target.value})}
            className="input location-input"
            onFocus={() => MarketplaceHaptics.light()}
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              background: 'rgba(20, 20, 20, 0.8)',
              border: '1px solid rgba(107, 142, 90, 0.3)',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#6B8E5A';
              e.target.style.boxShadow = '0 0 0 3px rgba(107, 142, 90, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(107, 142, 90, 0.3)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Match Button */}
        <div className="match-action" style={{ textAlign: 'center' }}>
          <button
            className={`btn btn-primary btn-xl match-btn ${isMatching ? 'matching' : ''}`}
            onClick={handleInstantMatch}
            disabled={!matchPreferences.goal || isMatching}
            style={{
              background: matchPreferences.goal && !isMatching ? '#6B8E5A' : 'rgba(107, 142, 90, 0.5)',
              color: 'white',
              border: 'none',
              padding: '1.25rem 3rem',
              borderRadius: '16px',
              fontSize: '1.25rem',
              fontWeight: '700',
              cursor: matchPreferences.goal && !isMatching ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              margin: '0 auto',
              minWidth: '300px'
            }}
            onMouseEnter={(e) => {
              if (matchPreferences.goal && !isMatching) {
                e.target.style.background = '#5A7A4B';
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (matchPreferences.goal && !isMatching) {
                e.target.style.background = '#6B8E5A';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {isMatching ? (
              <>
                <div 
                  className="loading-spinner"
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                ></div>
                Finding Your Perfect Match...
              </>
            ) : (
              <>
                ⚡ Find My Trainer
              </>
            )}
          </button>
          {!matchPreferences.goal && (
            <p className="helper-text" style={{ 
              color: '#B0B0B0', 
              fontSize: '0.875rem', 
              marginTop: '1rem' 
            }}>
              Please select your main goal to continue
            </p>
          )}
        </div>
      </div>

      {isMatching && (
        <div className="matching-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="matching-animation" style={{ textAlign: 'center' }}>
            <div className="pulse-rings" style={{ 
              position: 'relative', 
              width: '120px', 
              height: '120px', 
              margin: '0 auto 2rem'
            }}>
              <div className="pulse-ring" style={{
                position: 'absolute',
                border: '4px solid #6B8E5A',
                borderRadius: '50%',
                width: '120px',
                height: '120px',
                animation: 'pulse 2s infinite'
              }}></div>
              <div className="pulse-ring" style={{
                position: 'absolute',
                border: '4px solid #7FA068',
                borderRadius: '50%',
                width: '120px',
                height: '120px',
                animation: 'pulse 2s infinite 0.5s'
              }}></div>
              <div className="pulse-ring" style={{
                position: 'absolute',
                border: '4px solid #4A90A4',
                borderRadius: '50%',
                width: '120px',
                height: '120px',
                animation: 'pulse 2s infinite 1s'
              }}></div>
            </div>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Finding Your Perfect Match...
            </h3>
            <p style={{ color: '#B0B0B0' }}>
              Analyzing 500+ verified trainers in your area
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Verified Pro Profile Component
export const VerifiedProProfile = ({ trainer, onBook, onMessage }) => {
  const [showFullBio, setShowFullBio] = useState(false);
  
  return (
    <div className="verified-pro-profile card">
      <div className="card-body">
        <div className="pro-header">
          <div className="pro-avatar-section">
            <div className="avatar avatar-xl">{trainer.avatar}</div>
            <div className="verification-badge">
              <span className="badge badge-success">✓ Verified Pro</span>
            </div>
          </div>
          <div className="pro-basic-info">
            <h2>{trainer.name}</h2>
            <p className="pro-specialty">{trainer.specialty}</p>
            <div className="pro-rating">
              <div className="rating">
                <span className="rating-star">★</span>
                <span>{trainer.rating}</span>
              </div>
              <span className="rating-text">({trainer.reviews} reviews)</span>
            </div>
          </div>
          <div className="pro-availability">
            <span className="status-dot status-online"></span>
            <span>{trainer.availability}</span>
          </div>
        </div>

        <div className="pro-credentials">
          <h4>Credentials & Certifications</h4>
          <div className="credentials-grid">
            {trainer.certifications?.map((cert, index) => (
              <div key={index} className="credential-item">
                <span className="credential-icon">🎓</span>
                <span>{cert}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pro-experience">
          <div className="experience-stats">
            <div className="stat">
              <strong>{trainer.experience}</strong>
              <span>Experience</span>
            </div>
            <div className="stat">
              <strong>{trainer.clientsHelped}+</strong>
              <span>Clients Helped</span>
            </div>
            <div className="stat">
              <strong>{trainer.successRate}%</strong>
              <span>Success Rate</span>
            </div>
          </div>
        </div>

        <div className="pro-bio">
          <h4>About {trainer.name.split(' ')[0]}</h4>
          <p>{showFullBio ? trainer.fullBio : trainer.shortBio}</p>
          <button 
            className="btn btn-ghost"
            onClick={() => setShowFullBio(!showFullBio)}
          >
            {showFullBio ? 'Show Less' : 'Read More'}
          </button>
        </div>

        <div className="pro-specialties">
          <h4>Specialties</h4>
          <div className="specialties-grid">
            {trainer.specialties?.map((specialty, index) => (
              <span key={index} className="specialty-tag">
                {specialty}
              </span>
            ))}
          </div>
        </div>

        <div className="pro-pricing">
          <div className="pricing-header">
            <h4>Session Rates</h4>
          </div>
          <div className="pricing-options">
            <div className="pricing-option">
              <span className="session-type">Single Session</span>
              <span className="session-price">${trainer.singleRate}</span>
            </div>
            <div className="pricing-option popular">
              <span className="session-type">4-Session Package</span>
              <span className="session-price">${trainer.packageRate}</span>
              <span className="savings">Save 15%</span>
            </div>
            <div className="pricing-option">
              <span className="session-type">Monthly Package</span>
              <span className="session-price">${trainer.monthlyRate}</span>
              <span className="savings">Save 25%</span>
            </div>
          </div>
        </div>

        <div className="pro-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => onMessage(trainer)}
          >
            💬 Send Message
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => onBook(trainer)}
          >
            📅 Book Session
          </button>
        </div>
      </div>
    </div>
  );
};

// Real-time Booking Calendar Component  
export const BookingCalendar = ({ trainer, onBookingComplete }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [sessionType, setSessionType] = useState('single');
  const [notes, setNotes] = useState('');

  const availableSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', 
    '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      MarketplaceAudio.playSound('booking');
      MarketplaceHaptics.success();
      onBookingComplete({
        trainer,
        date: selectedDate,
        time: selectedTime,
        sessionType,
        notes
      });
    }
  };

  return (
    <div className="booking-calendar card">
      <div className="card-header">
        <h3>Book with {trainer.name}</h3>
        <p>{trainer.specialty}</p>
      </div>
      
      <div className="card-body">
        <div className="session-type-selector">
          <h4>Session Type</h4>
          <div className="session-options">
            <button 
              className={`session-option ${sessionType === 'single' ? 'selected' : ''}`}
              onClick={() => setSessionType('single')}
            >
              Single Session - ${trainer.singleRate}
            </button>
            <button 
              className={`session-option ${sessionType === 'package' ? 'selected' : ''}`}
              onClick={() => setSessionType('package')}
            >
              4-Session Package - ${trainer.packageRate} <span className="savings">Save 15%</span>
            </button>
          </div>
        </div>

        <div className="date-selector">
          <h4>Choose Date</h4>
          {/* Calendar component would go here */}
        </div>

        <div className="time-selector">
          <h4>Available Times</h4>
          <div className="time-slots">
            {availableSlots.map((time) => (
              <button
                key={time}
                className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className="booking-notes">
          <h4>Notes for Your Trainer (Optional)</h4>
          <textarea
            placeholder="Let your trainer know about your goals, any injuries, or special requests..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input"
            rows="3"
          />
        </div>

        <div className="booking-summary">
          <div className="summary-item">
            <span>Trainer:</span>
            <span>{trainer.name}</span>
          </div>
          <div className="summary-item">
            <span>Date:</span>
            <span>{selectedDate || 'Please select'}</span>
          </div>
          <div className="summary-item">
            <span>Time:</span>
            <span>{selectedTime || 'Please select'}</span>
          </div>
          <div className="summary-item total">
            <span>Total:</span>
            <span>${sessionType === 'single' ? trainer.singleRate : trainer.packageRate}</span>
          </div>
        </div>

        <button
          className="btn btn-primary btn-xl"
          onClick={handleBooking}
          disabled={!selectedDate || !selectedTime}
        >
          Complete Booking
        </button>
      </div>
    </div>
  );
};

export default { InstantMatch, VerifiedProProfile, BookingCalendar, LiftLinkLogo };