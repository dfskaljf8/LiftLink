import React, { useState, useEffect } from 'react';
import './styles/ProfessionalDesign.css';

// Additional delightful UI components for LiftLink

// Morphing progress bar with glow effects
export const MorphingProgressBar = ({ progress, label, color = '#00d4aa', showSparkles = true }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [sparklePositions, setSparklePositions] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
      
      if (showSparkles && progress > 0) {
        const sparkles = Array.from({ length: Math.floor(progress / 10) }, (_, i) => ({
          id: i,
          position: (i + 1) * 10,
          delay: i * 100
        }));
        setSparklePositions(sparkles);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [progress, showSparkles]);

  return (
    <div style={{ position: 'relative', marginBottom: '1rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: '500'
      }}>
        <span>{label}</span>
        <span style={{ color }}>{progress}%</span>
      </div>
      
      <div style={{
        width: '100%',
        height: '12px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '6px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          right: '-2px',
          bottom: '-2px',
          background: `linear-gradient(90deg, transparent, ${color}20, transparent)`,
          borderRadius: '8px',
          opacity: animatedProgress > 0 ? 1 : 0,
          transition: 'opacity 0.5s ease'
        }} />
        
        <div style={{
          width: `${animatedProgress}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          borderRadius: '6px',
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          boxShadow: `0 0 20px ${color}50`
        }}>
          <div style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            height: '3px',
            background: 'rgba(255, 255, 255, 0.4)',
            borderRadius: '2px',
            animation: 'shimmer 2s infinite'
          }} />
        </div>
        
        {sparklePositions.map(sparkle => (
          <div
            key={sparkle.id}
            style={{
              position: 'absolute',
              left: `${sparkle.position}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#ffffff',
              fontSize: '8px',
              animation: `sparkle 0.8s ease-out ${sparkle.delay}ms both`,
              pointerEvents: 'none'
            }}
          >
            ✨
          </div>
        ))}
      </div>
    </div>
  );
};

// Sparkle button with particle effects
export const SparkleButton = ({ children, onClick, sparkleIntensity = 5, ...props }) => {
  const [sparkles, setSparkles] = useState([]);
  const [isPressed, setIsPressed] = useState(false);

  const createSparkle = (e) => {
    const rect = e.target.getBoundingClientRect();
    const newSparkles = Array.from({ length: sparkleIntensity }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      size: Math.random() * 4 + 2,
      color: ['#ffffff', '#00d4aa', '#fbbf24'][Math.floor(Math.random() * 3)],
      life: 30
    }));
    
    setSparkles(prev => [...prev, ...newSparkles]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSparkles(prev => prev.map(sparkle => ({
        ...sparkle,
        life: sparkle.life - 1,
        y: sparkle.y - 1,
        x: sparkle.x + (Math.random() - 0.5) * 2
      })).filter(sparkle => sparkle.life > 0));
    }, 16);

    return () => clearInterval(interval);
  }, []);

  const handleClick = (e) => {
    createSparkle(e);
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onClick && onClick(e);
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        transform: isPressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 0.1s ease',
        ...props.style
      }}
    >
      {children}
      
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          style={{
            position: 'absolute',
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
            backgroundColor: sparkle.color,
            borderRadius: '50%',
            opacity: sparkle.life / 30,
            pointerEvents: 'none',
            boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.color}`
          }}
        />
      ))}
    </button>
  );
};

// Animated card with entrance effects
export const AnimatedCard = ({ children, delay = 0, direction = 'up', ...props }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animationStyles = {
    up: {
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      opacity: isVisible ? 1 : 0
    },
    left: {
      transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
      opacity: isVisible ? 1 : 0
    },
    scale: {
      transform: isVisible ? 'scale(1)' : 'scale(0.95)',
      opacity: isVisible ? 1 : 0
    }
  };

  return (
    <div
      {...props}
      style={{
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        ...animationStyles[direction],
        ...props.style
      }}
    >
      {children}
    </div>
  );
};

// Pulsing coin counter with glow
export const PulsingCoinCounter = ({ coins, isIncreasing }) => {
  const [displayCoins, setDisplayCoins] = useState(coins);
  const [pulseClass, setPulseClass] = useState('');

  useEffect(() => {
    if (isIncreasing) {
      setPulseClass('coin-pulse');
      
      let current = displayCoins;
      const target = coins;
      const increment = Math.ceil((target - current) / 15);
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
          setTimeout(() => setPulseClass(''), 1000);
        }
        setDisplayCoins(current);
      }, 50);
      
      return () => clearInterval(timer);
    } else {
      setDisplayCoins(coins);
    }
  }, [coins, isIncreasing, displayCoins]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#fbbf24'
    }}>
      <span className={pulseClass} style={{
        fontSize: '1.5rem',
        animation: pulseClass ? 'coin-glow 0.5s ease-out' : 'none'
      }}>
        🪙
      </span>
      <span>{displayCoins.toLocaleString()}</span>
    </div>
  );
};

// Loading spinner with personality
export const PersonalitySpinner = ({ message = "Getting your gains ready..." }) => {
  const [currentMessage, setCurrentMessage] = useState(message);
  const [dots, setDots] = useState('');

  const messages = [
    "Getting your gains ready...",
    "Warming up the servers...",
    "Flexing the database...",
    "Stretching the network...",
    "Almost there, champ!"
  ];

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    const messageInterval = setInterval(() => {
      setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 2000);

    return () => {
      clearInterval(dotInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      padding: '40px'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid rgba(0, 212, 170, 0.3)',
        borderTop: '4px solid var(--accent-primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      
      <div style={{
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '8px' }}>
          {currentMessage}{dots}
        </div>
        <div style={{ fontSize: '32px', animation: 'bounce 2s infinite' }}>
          💪
        </div>
      </div>
    </div>
  );
};

export default {
  MorphingProgressBar,
  SparkleButton,
  AnimatedCard,
  PulsingCoinCounter,
  PersonalitySpinner
};