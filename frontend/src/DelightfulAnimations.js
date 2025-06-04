import React, { useState, useEffect } from 'react';
import '../styles/ProfessionalDesign.css';

// Delightful micro-interactions and animations for LiftLink
// Inspired by Revolut, Uber, and DoorDash polish levels

// Confetti celebration component
export const Confetti = ({ trigger, onComplete }) => {
  const [particles, setParticles] = useState([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: window.innerHeight,
        dx: (Math.random() - 0.5) * 10,
        dy: -(Math.random() * 15 + 10),
        color: ['#00d4aa', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)],
        size: Math.random() * 6 + 4,
        life: 100
      }));
      
      setParticles(newParticles);
      setIsActive(true);
      
      setTimeout(() => {
        setIsActive(false);
        onComplete && onComplete();
      }, 3000);
    }
  }, [trigger, onComplete]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.dx,
        y: particle.y + particle.dy,
        dy: particle.dy + 0.3, // gravity
        life: particle.life - 1
      })).filter(particle => particle.life > 0));
    }, 16);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 9999
    }}>
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: '50%',
            opacity: particle.life / 100,
            transform: `rotate(${particle.life * 3}deg)`
          }}
        />
      ))}
    </div>
  );
};

// Animated streak counter with flame effects
export const StreakCounter = ({ count, isIncreasing }) => {
  const [displayCount, setDisplayCount] = useState(count);
  const [flames, setFlames] = useState([]);

  useEffect(() => {
    if (isIncreasing) {
      let current = displayCount;
      const target = count;
      const increment = Math.ceil((target - current) / 20);
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
          
          // Create flame effect
          const newFlames = Array.from({ length: 8 }, (_, i) => ({
            id: Date.now() + i,
            angle: (i / 8) * Math.PI * 2,
            distance: 0,
            life: 40
          }));
          setFlames(newFlames);
        }
        setDisplayCount(current);
      }, 50);
      
      return () => clearInterval(timer);
    } else {
      setDisplayCount(count);
    }
  }, [count, isIncreasing, displayCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlames(prev => prev.map(flame => ({
        ...flame,
        distance: flame.distance + 2,
        life: flame.life - 1
      })).filter(flame => flame.life > 0));
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'relative',
      display: 'inline-block',
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#f59e0b'
    }}>
      🔥 {displayCount}
      
      {flames.map(flame => (
        <div
          key={flame.id}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translate(${Math.cos(flame.angle) * flame.distance}px, ${Math.sin(flame.angle) * flame.distance}px)`,
            fontSize: '0.5rem',
            opacity: flame.life / 40,
            pointerEvents: 'none'
          }}
        >
          🔥
        </div>
      ))}
    </div>
  );
};

// Floating mascot animation  
export const FloatingMascot = ({ emotion = 'happy', message, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [bobOffset, setBobOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBobOffset(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const mascotEmojis = {
    happy: '💪',
    celebrating: '🎉',
    encouraging: '👍',
    thinking: '🤔',
    sleeping: '😴'
  };

  const bobTransform = `translateY(${Math.sin(bobOffset * 0.1) * 5}px)`;

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      right: '20px',
      zIndex: 1000,
      animation: 'slideInRight 0.5s ease-out'
    }}>
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '20px',
        padding: '16px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(20px)',
        maxWidth: '200px',
        transform: bobTransform,
        transition: 'transform 0.1s ease'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: message ? '8px' : '0'
        }}>
          <div style={{
            fontSize: '32px',
            animation: 'bounce 1s infinite'
          }}>
            {mascotEmojis[emotion]}
          </div>
          
          {onDismiss && (
            <button
              onClick={() => {
                setIsVisible(false);
                onDismiss();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '16px',
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              ✕
            </button>
          )}
        </div>
        
        {message && (
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: 'var(--text-primary)',
            lineHeight: '1.4'
          }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

// Tactile button with haptic-like feedback
export const TactileButton = ({ children, onClick, variant = 'primary', size = 'medium', ...props }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const ripple = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      size: Math.max(rect.width, rect.height) * 2
    };
    
    setRipples(prev => [...prev, ripple]);
    setIsPressed(true);
    
    setTimeout(() => setIsPressed(false), 150);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 600);
    
    onClick && onClick(e);
  };

  const buttonStyles = {
    primary: {
      background: 'linear-gradient(135deg, var(--accent-primary) 0%, #00b894 100%)',
      color: 'white',
      boxShadow: isPressed ? 'inset 0 2px 8px rgba(0, 0, 0, 0.3)' : '0 4px 15px rgba(0, 212, 170, 0.4)'
    },
    secondary: {
      background: 'var(--glass-bg)',
      color: 'var(--text-primary)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: isPressed ? 'inset 0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
    }
  };

  const sizeStyles = {
    small: { padding: '8px 16px', fontSize: '14px' },
    medium: { padding: '12px 24px', fontSize: '16px' },
    large: { padding: '16px 32px', fontSize: '18px' }
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      style={{
        position: 'relative',
        border: 'none',
        borderRadius: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        overflow: 'hidden',
        transform: isPressed ? 'scale(0.98) translateY(1px)' : 'scale(1) translateY(0)',
        transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
        ...buttonStyles[variant],
        ...sizeStyles[size],
        ...props.style
      }}
    >
      {children}
      
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          style={{
            position: 'absolute',
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.3)',
            transform: 'scale(0)',
            animation: 'ripple 0.6s ease-out',
            pointerEvents: 'none'
          }}
        />
      ))}
    </button>
  );
};