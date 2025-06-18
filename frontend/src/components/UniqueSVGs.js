import React from 'react';

// LiftLink Unique Animated SVG Components

export const LiftLinkMascot = ({ mood = 'happy', size = 32 }) => {
  const animations = {
    happy: 'animate-bounce',
    celebrating: 'animate-pulse',
    encouraging: 'animate-bounce',
    thinking: 'animate-pulse',
    sleeping: 'animate-pulse'
  };

  const colors = {
    happy: '#C4D600',
    celebrating: '#FFD700',
    encouraging: '#00FF88',
    thinking: '#9333EA',
    sleeping: '#64748B'
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      className={animations[mood]}
      style={{ filter: 'drop-shadow(0 4px 8px rgba(196, 214, 0, 0.3))' }}
    >
      {/* LiftLink Robot Mascot */}
      <defs>
        <linearGradient id={`mascot-${mood}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[mood]} />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      
      {/* Body */}
      <rect x="16" y="20" width="32" height="36" rx="8" fill={`url(#mascot-${mood})`} stroke="#C4D600" strokeWidth="2"/>
      
      {/* Head */}
      <circle cx="32" cy="16" r="12" fill={`url(#mascot-${mood})`} stroke="#C4D600" strokeWidth="2"/>
      
      {/* Eyes */}
      <circle cx="28" cy="14" r="2" fill="#C4D600"/>
      <circle cx="36" cy="14" r="2" fill="#C4D600"/>
      
      {/* Mouth - changes based on mood */}
      {mood === 'happy' && <path d="M 26 18 Q 32 22 38 18" stroke="#C4D600" strokeWidth="2" fill="none"/>}
      {mood === 'celebrating' && <rect x="26" y="18" width="12" height="3" rx="1" fill="#C4D600"/>}
      {mood === 'encouraging' && <path d="M 26 19 L 32 16 L 38 19" stroke="#C4D600" strokeWidth="2" fill="none"/>}
      {mood === 'thinking' && <circle cx="32" cy="18" r="2" fill="none" stroke="#C4D600" strokeWidth="1"/>}
      {mood === 'sleeping' && <path d="M 26 18 Q 32 20 38 18" stroke="#C4D600" strokeWidth="2" fill="none"/>}
      
      {/* Arms */}
      <rect x="10" y="28" width="6" height="16" rx="3" fill={colors[mood]}/>
      <rect x="48" y="28" width="6" height="16" rx="3" fill={colors[mood]}/>
      
      {/* Legs */}
      <rect x="20" y="52" width="6" height="10" rx="3" fill={colors[mood]}/>
      <rect x="38" y="52" width="6" height="10" rx="3" fill={colors[mood]}/>
      
      {/* Special effects based on mood */}
      {mood === 'celebrating' && (
        <>
          <circle cx="20" cy="10" r="1" fill="#FFD700" opacity="0.8"/>
          <circle cx="44" cy="12" r="1" fill="#FFD700" opacity="0.6"/>
          <circle cx="48" cy="20" r="1" fill="#FFD700" opacity="0.9"/>
        </>
      )}
    </svg>
  );
};

export const FitnessGoalIcon = ({ type, size = 32 }) => {
  const iconConfig = {
    'weight-loss': { color: '#FF6B6B', path: 'M20,32 Q32,16 44,32 Q32,48 20,32' },
    'muscle-gain': { color: '#C4D600', path: 'M16,24 L24,16 L40,16 L48,24 L48,40 L40,48 L24,48 L16,40 Z' },
    'fitness': { color: '#00D4AA', path: 'M32,8 L40,24 L56,24 L44,36 L48,52 L32,44 L16,52 L20,36 L8,24 L24,24 Z' },
    'sport': { color: '#FFD700', path: 'M32,8 L36,20 L48,20 L40,28 L44,40 L32,36 L20,40 L24,28 L16,20 L28,20 Z' },
    'rehab': { color: '#9333EA', path: 'M32,16 Q40,16 40,24 Q40,32 32,32 Q24,32 24,24 Q24,16 32,16' },
    'wellness': { color: '#64748B', path: 'M32,12 Q28,20 32,28 Q36,36 32,44 Q28,36 32,28 Q36,20 32,12' }
  };

  const config = iconConfig[type] || iconConfig['fitness'];

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64"
      className="animate-pulse hover:animate-bounce transition-all duration-300"
      style={{ filter: `drop-shadow(0 2px 4px ${config.color}40)` }}
    >
      <defs>
        <linearGradient id={`goal-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={config.color} />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      
      <path 
        d={config.path} 
        fill={`url(#goal-${type})`} 
        stroke={config.color} 
        strokeWidth="2"
      />
      
      {/* Animated glow effect */}
      <path 
        d={config.path} 
        fill="none" 
        stroke={config.color} 
        strokeWidth="4" 
        opacity="0.3"
        className="animate-ping"
      />
    </svg>
  );
};

export const SessionTypeIcon = ({ type, size = 32 }) => {
  const iconConfig = {
    'in-person': { 
      color: '#C4D600', 
      elements: (
        <>
          <rect x="20" y="16" width="24" height="32" rx="4" fill="url(#session-in-person)" stroke="#C4D600" strokeWidth="2"/>
          <circle cx="32" cy="24" r="4" fill="#C4D600"/>
          <rect x="28" y="32" width="8" height="12" rx="2" fill="#C4D600"/>
        </>
      )
    },
    'virtual': { 
      color: '#00D4AA', 
      elements: (
        <>
          <rect x="16" y="20" width="32" height="24" rx="4" fill="url(#session-virtual)" stroke="#00D4AA" strokeWidth="2"/>
          <rect x="20" y="24" width="24" height="16" rx="2" fill="#1a1a1a"/>
          <circle cx="32" cy="32" r="6" fill="#00D4AA"/>
        </>
      )
    },
    'both': { 
      color: '#FFD700', 
      elements: (
        <>
          <path d="M16,32 Q32,16 48,32 Q32,48 16,32" fill="url(#session-both)" stroke="#FFD700" strokeWidth="2"/>
          <circle cx="26" cy="32" r="3" fill="#FFD700"/>
          <circle cx="38" cy="32" r="3" fill="#FFD700"/>
        </>
      )
    }
  };

  const config = iconConfig[type] || iconConfig['both'];

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64"
      className="hover:scale-110 transition-transform duration-300"
      style={{ filter: `drop-shadow(0 2px 4px ${config.color}40)` }}
    >
      <defs>
        <linearGradient id={`session-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={config.color} />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      
      {config.elements}
    </svg>
  );
};

export const UrgencyIcon = ({ size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32"
    className="animate-pulse"
    style={{ filter: 'drop-shadow(0 2px 4px rgba(255, 107, 107, 0.5))' }}
  >
    <defs>
      <linearGradient id="urgency-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FF6B6B" />
      </linearGradient>
    </defs>
    
    {/* Flame shape */}
    <path 
      d="M16,4 Q20,8 22,14 Q20,18 18,20 Q16,24 14,20 Q12,18 10,14 Q12,8 16,4 Z" 
      fill="url(#urgency-gradient)"
      className="animate-bounce"
    />
    
    {/* Inner flame */}
    <path 
      d="M16,8 Q18,10 19,14 Q18,16 16,18 Q14,16 13,14 Q14,10 16,8 Z" 
      fill="#FFD700"
      opacity="0.8"
    />
  </svg>
);

export const LocationIcon = ({ size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32"
    className="animate-bounce"
    style={{ filter: 'drop-shadow(0 2px 4px rgba(196, 214, 0, 0.4))' }}
  >
    <defs>
      <linearGradient id="location-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C4D600" />
        <stop offset="100%" stopColor="#1a1a1a" />
      </linearGradient>
    </defs>
    
    {/* Location pin */}
    <path 
      d="M16,4 Q24,4 24,12 Q24,20 16,28 Q8,20 8,12 Q8,4 16,4 Z" 
      fill="url(#location-gradient)"
      stroke="#C4D600"
      strokeWidth="2"
    />
    
    {/* Center dot */}
    <circle 
      cx="16" 
      cy="12" 
      r="4" 
      fill="#C4D600"
      className="animate-ping"
    />
  </svg>
);

export const PowerIcon = ({ size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32"
    className="animate-pulse"
    style={{ filter: 'drop-shadow(0 2px 4px rgba(196, 214, 0, 0.5))' }}
  >
    <defs>
      <linearGradient id="power-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C4D600" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#C4D600" />
      </linearGradient>
    </defs>
    
    {/* Lightning bolt */}
    <path 
      d="M12,2 L20,2 L16,14 L22,14 L10,30 L14,18 L8,18 L12,2 Z" 
      fill="url(#power-gradient)"
      className="animate-bounce"
    />
    
    {/* Glow effect */}
    <path 
      d="M12,2 L20,2 L16,14 L22,14 L10,30 L14,18 L8,18 L12,2 Z" 
      fill="none"
      stroke="#C4D600"
      strokeWidth="2"
      opacity="0.6"
      className="animate-ping"
    />
  </svg>
);

// Enhanced LiftCoin with unique design
export const LiftCoin = ({ size = 32, animated = true }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 64 64"
    className={animated ? "animate-spin" : "hover:animate-bounce"}
    style={{ filter: 'drop-shadow(0 4px 8px rgba(255, 215, 0, 0.4))' }}
  >
    <defs>
      <linearGradient id="coin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FFA500" />
        <stop offset="100%" stopColor="#FFD700" />
      </linearGradient>
      <radialGradient id="coin-shine" cx="30%" cy="30%">
        <stop offset="0%" stopColor="#FFFACD" opacity="0.8" />
        <stop offset="100%" stopColor="#FFD700" opacity="0.2" />
      </radialGradient>
    </defs>
    
    {/* Coin body */}
    <circle 
      cx="32" 
      cy="32" 
      r="28" 
      fill="url(#coin-gradient)"
      stroke="#B8860B"
      strokeWidth="2"
    />
    
    {/* Shine effect */}
    <circle 
      cx="32" 
      cy="32" 
      r="26" 
      fill="url(#coin-shine)"
    />
    
    {/* LiftLink "L" symbol */}
    <path 
      d="M20,16 L20,48 L40,48 L40,44 L24,44 L24,16 Z" 
      fill="#B8860B"
      stroke="#8B4513"
      strokeWidth="1"
    />
    
    {/* Value indicator */}
    <circle 
      cx="44" 
      cy="20" 
      r="8" 
      fill="#C4D600"
      stroke="#1a1a1a"
      strokeWidth="1"
    />
    <text 
      x="44" 
      y="24" 
      textAnchor="middle" 
      fill="#1a1a1a" 
      fontSize="10" 
      fontWeight="bold"
    >
      1
    </text>
  </svg>
);

export default {
  LiftLinkMascot,
  FitnessGoalIcon,
  SessionTypeIcon,
  UrgencyIcon,
  LocationIcon,
  PowerIcon,
  LiftCoin
};
