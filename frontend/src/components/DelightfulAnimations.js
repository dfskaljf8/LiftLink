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

// Sparkle effect for buttons and interactions
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