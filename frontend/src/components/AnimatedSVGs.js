import React from 'react';

// Animated Dumbbell SVG (LiftLink style)
export const AnimatedDumbbell = ({ size = 24, color = '#C4D600' }) => (
  <svg width={size} height={size} viewBox="0 0 40 24" fill="none">
    <defs>
      <linearGradient id="dumbbellGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C4D600" />
        <stop offset="50%" stopColor="#B2FF66" />
        <stop offset="100%" stopColor="#C4D600" />
      </linearGradient>
    </defs>
    
    {/* Left weight */}
    <rect x="2" y="4" width="6" height="16" rx="2" fill="url(#dumbbellGradient)">
      <animateTransform
        attributeName="transform"
        type="scale"
        values="1;1.1;1"
        dur="2s"
        repeatCount="indefinite"
      />
    </rect>
    
    {/* Bar */}
    <rect x="8" y="10" width="24" height="4" rx="2" fill={color}>
      <animate
        attributeName="fill"
        values="#C4D600;#B2FF66;#C4D600"
        dur="3s"
        repeatCount="indefinite"
      />
    </rect>
    
    {/* Right weight */}
    <rect x="32" y="4" width="6" height="16" rx="2" fill="url(#dumbbellGradient)">
      <animateTransform
        attributeName="transform"
        type="scale"
        values="1;1.1;1"
        dur="2s"
        repeatCount="indefinite"
        begin="0.5s"
      />
    </rect>
  </svg>
);

// Animated Tree (Fitness Forest)
export const AnimatedTree = ({ growth = 100, size = 32 }) => {
  const treeHeight = (growth / 100) * size;
  
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="treeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#8B7355" />
          <stop offset="100%" stopColor="#A0522D" />
        </linearGradient>
        <radialGradient id="leavesGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9ACD32" />
          <stop offset="100%" stopColor="#6B8E23" />
        </radialGradient>
      </defs>
      
      {/* Trunk */}
      <rect 
        x="14" 
        y={32 - (treeHeight * 0.4)} 
        width="4" 
        height={treeHeight * 0.4} 
        fill="url(#treeGradient)"
      >
        <animate
          attributeName="height"
          values="0;{treeHeight * 0.4}"
          dur="2s"
          fill="freeze"
        />
      </rect>
      
      {/* Leaves */}
      <circle 
        cx="16" 
        cy={32 - (treeHeight * 0.7)} 
        r={Math.max(2, treeHeight * 0.3)} 
        fill="url(#leavesGradient)"
      >
        <animate
          attributeName="r"
          values="0;{Math.max(2, treeHeight * 0.3)}"
          dur="2s"
          begin="1s"
          fill="freeze"
        />
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.05;1"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Sparkles */}
      {growth > 50 && (
        <>
          <circle cx="10" cy="10" r="1" fill="#FFD700">
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="22" cy="8" r="1" fill="#FFD700">
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="1.5s"
              repeatCount="indefinite"
              begin="0.5s"
            />
          </circle>
        </>
      )}
    </svg>
  );
};

// Animated Checkmark (Success feedback)
export const AnimatedCheckmark = ({ size = 24, color = '#C4D600' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <circle cx="12" cy="12" r="11" fill="none" stroke={color} strokeWidth="2" filter="url(#glow)">
      <animate
        attributeName="stroke-dasharray"
        values="0 70;70 70"
        dur="0.5s"
        fill="freeze"
      />
    </circle>
    
    <path 
      d="M8 12l3 3 5-5" 
      stroke={color} 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="none"
      strokeDasharray="0 20"
    >
      <animate
        attributeName="stroke-dasharray"
        values="0 20;20 20"
        dur="0.8s"
        begin="0.5s"
        fill="freeze"
      />
    </path>
  </svg>
);

// Animated Coin (LiftCoins)
export const AnimatedCoin = ({ size = 24, spinning = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FFA500" />
        <stop offset="100%" stopColor="#FFD700" />
      </linearGradient>
      <filter id="coinGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      fill="url(#coinGradient)" 
      filter="url(#coinGlow)"
    >
      {spinning && (
        <animateTransform
          attributeName="transform"
          type="rotateY"
          values="0;360"
          dur="1s"
          repeatCount="indefinite"
        />
      )}
    </circle>
    
    <text 
      x="12" 
      y="16" 
      textAnchor="middle" 
      fill="#8B4513" 
      fontSize="10" 
      fontWeight="bold"
    >
      LC
    </text>
    
    {spinning && (
      <animate
        attributeName="opacity"
        values="1;0.8;1"
        dur="0.5s"
        repeatCount="indefinite"
      />
    )}
  </svg>
);

// Animated Fire (Streak)
export const AnimatedFire = ({ size = 24, intensity = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#FF6B35" />
        <stop offset="50%" stopColor="#F7931E" />
        <stop offset="100%" stopColor="#FFD700" />
      </linearGradient>
    </defs>
    
    <path 
      d="M12 2c-1 4-4 6-4 10 0 4 4 8 8 8s8-4 8-8c0-4-3-6-4-10-1 2-4 2-8 0z" 
      fill="url(#fireGradient)"
    >
      <animateTransform
        attributeName="transform"
        type="scale"
        values="1;1.1;0.95;1"
        dur="0.8s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0.8;1;0.9;1"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </path>
    
    {/* Inner flame */}
    <path 
      d="M12 6c0 2-2 3-2 5 0 2 2 4 4 4s4-2 4-4c0-2-2-3-2-5-1 1-2 1-4 0z" 
      fill="#FFD700"
      opacity="0.8"
    >
      <animateTransform
        attributeName="transform"
        type="scale"
        values="0.9;1;0.85;0.9"
        dur="0.6s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

// Animated Heart (Favorites/Likes)
export const AnimatedHeart = ({ size = 24, beating = false, liked = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF6B9D" />
        <stop offset="100%" stopColor="#FF1744" />
      </linearGradient>
    </defs>
    
    <path 
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={liked ? "url(#heartGradient)" : "none"}
      stroke={liked ? "none" : "#666"}
      strokeWidth="2"
    >
      {beating && (
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.3;1"
          dur="0.6s"
          repeatCount="indefinite"
        />
      )}
    </path>
  </svg>
);

// Animated Loading Spinner
export const AnimatedSpinner = ({ size = 24, color = '#C4D600' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="#E5E5E5" 
      strokeWidth="2"
    />
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
      strokeDasharray="60"
      strokeDashoffset="60"
    >
      <animate
        attributeName="stroke-dashoffset"
        values="60;0;60"
        dur="2s"
        repeatCount="indefinite"
      />
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 12 12;360 12 12"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

// Animated Star (Achievements/Ratings)
export const AnimatedStar = ({ size = 24, filled = false, sparkling = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
      <filter id="starGlow">
        <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <path 
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={filled ? "url(#starGradient)" : "none"}
      stroke={filled ? "none" : "#666"}
      strokeWidth="2"
      filter={sparkling ? "url(#starGlow)" : "none"}
    >
      {sparkling && (
        <>
          <animateTransform
            attributeName="transform"
            type="scale"
            values="1;1.2;1"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.7;1;0.7"
            dur="1s"
            repeatCount="indefinite"
          />
        </>
      )}
    </path>
  </svg>
);

export default {
  AnimatedDumbbell,
  AnimatedTree,
  AnimatedCheckmark,
  AnimatedCoin,
  AnimatedFire,
  AnimatedHeart,
  AnimatedSpinner,
  AnimatedStar
};