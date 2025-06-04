import React, { useState, useEffect } from 'react';
import { AnimatedCheckmark, AnimatedCoin, AnimatedFire, AnimatedStar } from './AnimatedSVGs';

// Multi-phase animation feedback
export const MultiPhaseButton = ({ children, onClick, className, ...props }) => {
  const [phase, setPhase] = useState('idle'); // idle, pressed, success, complete

  const handleClick = async (e) => {
    setPhase('pressed');
    
    setTimeout(() => setPhase('success'), 150);
    setTimeout(() => setPhase('complete'), 800);
    setTimeout(() => setPhase('idle'), 1200);
    
    if (onClick) onClick(e);
  };

  return (
    <button
      className={`multi-phase-btn ${phase} ${className || ''}`}
      onClick={handleClick}
      {...props}
      style={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.15s ease-out',
        transform: phase === 'pressed' ? 'scale3d(0.95, 0.95, 1)' : 'scale3d(1, 1, 1)',
        ...props.style
      }}
    >
      {children}
      
      {/* Success overlay */}
      {phase === 'success' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'successPop 0.6s ease-out'
        }}>
          <AnimatedCheckmark size={20} />
        </div>
      )}
      
      <style jsx>{`
        @keyframes successPop {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </button>
  );
};

// Contextual tooltip system
export const ContextualTooltip = ({ children, message, trigger = 'hover', position = 'top' }) => {
  const [visible, setVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Auto-show for first-time users
    if (!hasShown && trigger === 'auto') {
      setTimeout(() => {
        setVisible(true);
        setHasShown(true);
        setTimeout(() => setVisible(false), 3000);
      }, 1000);
    }
  }, [hasShown, trigger]);

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => trigger === 'hover' && setVisible(true)}
      onMouseLeave={() => trigger === 'hover' && setVisible(false)}
      onClick={() => trigger === 'click' && setVisible(!visible)}
    >
      {children}
      
      {visible && (
        <div style={{
          position: 'absolute',
          bottom: position === 'top' ? '100%' : 'auto',
          top: position === 'bottom' ? '100%' : 'auto',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '14px',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          animation: 'tooltipFade 0.3s ease-out',
          backdropFilter: 'blur(10px)'
        }}>
          {message}
          
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            [position === 'top' ? 'bottom' : 'top']: '-4px',
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            [position === 'top' ? 'borderTop' : 'borderBottom']: '4px solid rgba(0, 0, 0, 0.9)'
          }} />
        </div>
      )}
      
      <style jsx>{`
        @keyframes tooltipFade {
          0% { opacity: 0; transform: translateX(-50%) translateY(${position === 'top' ? '10px' : '-10px'}); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
};

// Action-based visual feedback
export const ActionFeedback = ({ type, visible, onComplete }) => {
  useEffect(() => {
    if (visible && onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  if (!visible) return null;

  const getFeedbackContent = () => {
    switch (type) {
      case 'booking_success':
        return {
          icon: <AnimatedCheckmark size={40} />,
          title: 'Session Booked!',
          message: 'Your training session has been confirmed',
          color: '#10b981'
        };
      case 'coins_earned':
        return {
          icon: <AnimatedCoin size={40} spinning />,
          title: '+50 LiftCoins!',
          message: 'Keep up the great work!',
          color: '#f59e0b'
        };
      case 'streak_milestone':
        return {
          icon: <AnimatedFire size={40} intensity={2} />,
          title: '7-Day Streak!',
          message: 'You\'re on fire! 🔥',
          color: '#ef4444'
        };
      case 'achievement_unlocked':
        return {
          icon: <AnimatedStar size={40} filled sparkling />,
          title: 'Achievement Unlocked!',
          message: 'First Workout Completed',
          color: '#8b5cf6'
        };
      default:
        return {
          icon: <AnimatedCheckmark size={40} />,
          title: 'Success!',
          message: 'Action completed',
          color: '#10b981'
        };
    }
  };

  const content = getFeedbackContent();

  return (
    <div style={{
      position: 'fixed',
      top: '20%',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      border: `2px solid ${content.color}`,
      borderRadius: '20px',
      padding: '30px',
      textAlign: 'center',
      zIndex: 1001,
      animation: 'feedbackSlideIn 0.5s ease-out',
      boxShadow: `0 10px 40px ${content.color}30`
    }}>
      <div style={{ marginBottom: '15px' }}>
        {content.icon}
      </div>
      
      <h3 style={{
        fontSize: '20px',
        fontWeight: '600',
        margin: '0 0 8px 0',
        color: content.color
      }}>
        {content.title}
      </h3>
      
      <p style={{
        fontSize: '14px',
        color: 'var(--text-secondary)',
        margin: 0
      }}>
        {content.message}
      </p>
      
      <style jsx>{`
        @keyframes feedbackSlideIn {
          0% { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.9); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

// Real-time error feedback
export const ErrorFeedback = ({ field, error, onRetry }) => {
  if (!error) return null;

  return (
    <div style={{
      position: 'relative',
      animation: 'errorShake 0.5s ease-out',
      marginTop: '8px'
    }}>
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#ef4444',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          !
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#ef4444',
            marginBottom: '4px'
          }}>
            {field} Error
          </div>
          <div style={{
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            {error}
          </div>
        </div>
        
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              background: 'none',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              padding: '6px 12px',
              color: '#ef4444',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Retry
          </button>
        )}
      </div>
      
      <style jsx>{`
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

// Embedded feedback widget
export const FeedbackWidget = ({ context, onFeedback }) => {
  const [expanded, setExpanded] = useState(false);
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating > 0) {
      onFeedback?.({ context, rating });
      setSubmitted(true);
      setTimeout(() => {
        setExpanded(false);
        setSubmitted(false);
        setRating(0);
      }, 2000);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          style={{
            background: 'var(--accent-primary)',
            color: '#000',
            border: 'none',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(196, 214, 0, 0.3)',
            transition: 'all 0.3s ease',
            animation: 'feedbackPulse 3s infinite'
          }}
        >
          💭
        </button>
      ) : (
        <div style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '20px',
          width: '300px',
          animation: 'feedbackExpand 0.3s ease-out'
        }}>
          {!submitted ? (
            <>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 12px 0'
              }}>
                How was this experience?
              </h4>
              
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                justifyContent: 'center'
              }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <AnimatedStar 
                      size={24} 
                      filled={star <= rating} 
                      sparkling={star <= rating}
                    />
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setExpanded(false)}
                  style={{
                    flex: 1,
                    background: 'var(--card-bg)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={rating === 0}
                  style={{
                    flex: 1,
                    background: rating > 0 ? 'var(--accent-primary)' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    color: '#000',
                    cursor: rating > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  Submit
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <AnimatedCheckmark size={32} />
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                marginTop: '8px'
              }}>
                Thank you!
              </div>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        @keyframes feedbackPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); box-shadow: 0 4px 25px rgba(196, 214, 0, 0.4); }
        }
        
        @keyframes feedbackExpand {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export { MultiPhaseButton, ContextualTooltip, ActionFeedback, ErrorFeedback, FeedbackWidget };