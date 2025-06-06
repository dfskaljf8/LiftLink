import React from 'react';

// LiftLink Logo SVG (Animated)
export const LiftLinkLogo = ({ size = 120, animate = true }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 200 120" fill="none">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C4D600" />
        <stop offset="50%" stopColor="#B2FF66" />
        <stop offset="100%" stopColor="#C4D600" />
      </linearGradient>
      <filter id="logoGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Dumbbell Icon */}
    <g transform="translate(85, 15)">
      {/* Left weight */}
      <rect x="0" y="8" width="8" height="24" rx="3" fill="white" filter="url(#logoGlow)">
        {animate && (
          <animateTransform
            attributeName="transform"
            type="scale"
            values="1;1.05;1"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </rect>
      
      {/* Center bar */}
      <rect x="8" y="18" width="14" height="4" rx="2" fill="url(#logoGradient)">
        {animate && (
          <animate
            attributeName="fill"
            values="url(#logoGradient);#B2FF66;url(#logoGradient)"
            dur="3s"
            repeatCount="indefinite"
          />
        )}
      </rect>
      
      {/* Right weight */}
      <rect x="22" y="8" width="8" height="24" rx="3" fill="white" filter="url(#logoGlow)">
        {animate && (
          <animateTransform
            attributeName="transform"
            type="scale"
            values="1;1.05;1"
            dur="2s"
            repeatCount="indefinite"
            begin="0.5s"
          />
        )}
      </rect>
    </g>
    
    {/* LiftLink Text */}
    <g transform="translate(20, 65)">
      <text x="0" y="0" fontSize="24" fontWeight="700" fontFamily="Arial, sans-serif">
        <tspan fill="#C4D600">L</tspan>
        <tspan fill="white">ift</tspan>
        <tspan fill="#C4D600">L</tspan>
        <tspan fill="white">ink</tspan>
        {animate && (
          <animate
            attributeName="opacity"
            values="1;0.8;1"
            dur="4s"
            repeatCount="indefinite"
          />
        )}
      </text>
    </g>
    
    {/* Tagline */}
    <g transform="translate(30, 85)">
      <text x="0" y="0" fontSize="8" fill="rgba(255,255,255,0.7)" fontFamily="Arial, sans-serif">
        Beginners to Believers
      </text>
    </g>
    
    {/* Accent lines */}
    <path d="M10 10 Q20 5 30 10" stroke="#C4D600" strokeWidth="2" fill="none" opacity="0.3">
      {animate && (
        <animate
          attributeName="opacity"
          values="0.3;0.6;0.3"
          dur="5s"
          repeatCount="indefinite"
        />
      )}
    </path>
    <path d="M170 100 Q180 105 190 100" stroke="#C4D600" strokeWidth="2" fill="none" opacity="0.3">
      {animate && (
        <animate
          attributeName="opacity"
          values="0.3;0.6;0.3"
          dur="5s"
          repeatCount="indefinite"
          begin="2s"
        />
      )}
    </path>
  </svg>
);

// Animated Home Icon
export const AnimatedHome = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={active ? "#C4D600" : "#666"} />
        <stop offset="100%" stopColor={active ? "#B2FF66" : "#999"} />
      </linearGradient>
    </defs>
    
    <path 
      d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" 
      fill="url(#homeGradient)"
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="1"
    >
      {active && (
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.1;1"
          dur="2s"
          repeatCount="indefinite"
        />
      )}
    </path>
    
    {/* Door */}
    <rect x="10" y="14" width="4" height="6" fill={active ? "#000" : "#333"} />
    
    {/* Windows */}
    <rect x="6" y="12" width="2" height="2" fill={active ? "#FFD700" : "#555"}>
      {active && (
        <animate
          attributeName="fill"
          values="#FFD700;#FFF;#FFD700"
          dur="3s"
          repeatCount="indefinite"
        />
      )}
    </rect>
    <rect x="16" y="12" width="2" height="2" fill={active ? "#FFD700" : "#555"}>
      {active && (
        <animate
          attributeName="fill"
          values="#FFD700;#FFF;#FFD700"
          dur="3s"
          repeatCount="indefinite"
          begin="1s"
        />
      )}
    </rect>
  </svg>
);

// Animated Search Icon
export const AnimatedSearch = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle 
      cx="11" 
      cy="11" 
      r="8" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
    >
      {active && (
        <animate
          attributeName="r"
          values="8;9;8"
          dur="2s"
          repeatCount="indefinite"
        />
      )}
    </circle>
    <path 
      d="m21 21-4.35-4.35" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
    >
      {active && (
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 19 19;10 19 19;0 19 19"
          dur="2s"
          repeatCount="indefinite"
        />
      )}
    </path>
  </svg>
);

// Animated User Icon
export const AnimatedUser = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle 
      cx="12" 
      cy="7" 
      r="4" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      fill={active ? "rgba(196, 214, 0, 0.1)" : "none"}
    >
      {active && (
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.1;1"
          dur="2s"
          repeatCount="indefinite"
        />
      )}
    </circle>
  </svg>
);

// Animated Calendar Icon
export const AnimatedCalendar = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect 
      x="3" 
      y="4" 
      width="18" 
      height="18" 
      rx="2" 
      ry="2" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      fill={active ? "rgba(196, 214, 0, 0.1)" : "none"}
    />
    <line 
      x1="16" 
      y1="2" 
      x2="16" 
      y2="6" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line 
      x1="8" 
      y1="2" 
      x2="8" 
      y2="6" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line 
      x1="3" 
      y1="10" 
      x2="21" 
      y2="10" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    
    {/* Date numbers */}
    <circle cx="8" cy="14" r="1" fill={active ? "#C4D600" : "#666"}>
      {active && (
        <animate
          attributeName="opacity"
          values="1;0.5;1"
          dur="1s"
          repeatCount="indefinite"
        />
      )}
    </circle>
    <circle cx="12" cy="14" r="1" fill={active ? "#C4D600" : "#666"}>
      {active && (
        <animate
          attributeName="opacity"
          values="1;0.5;1"
          dur="1s"
          repeatCount="indefinite"
          begin="0.3s"
        />
      )}
    </circle>
    <circle cx="16" cy="14" r="1" fill={active ? "#C4D600" : "#666"}>
      {active && (
        <animate
          attributeName="opacity"
          values="1;0.5;1"
          dur="1s"
          repeatCount="indefinite"
          begin="0.6s"
        />
      )}
    </circle>
  </svg>
);

// Animated Message Icon
export const AnimatedMessage = ({ size = 24, active = false, hasNotification = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? "rgba(196, 214, 0, 0.1)" : "none"}
    >
      {active && (
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.05;1"
          dur="2s"
          repeatCount="indefinite"
        />
      )}
    </path>
    
    {/* Message dots */}
    <circle cx="9" cy="10" r="1" fill={active ? "#C4D600" : "#666"}>
      {active && (
        <animate
          attributeName="opacity"
          values="0.5;1;0.5"
          dur="1.5s"
          repeatCount="indefinite"
        />
      )}
    </circle>
    <circle cx="12" cy="10" r="1" fill={active ? "#C4D600" : "#666"}>
      {active && (
        <animate
          attributeName="opacity"
          values="0.5;1;0.5"
          dur="1.5s"
          repeatCount="indefinite"
          begin="0.3s"
        />
      )}
    </circle>
    <circle cx="15" cy="10" r="1" fill={active ? "#C4D600" : "#666"}>
      {active && (
        <animate
          attributeName="opacity"
          values="0.5;1;0.5"
          dur="1.5s"
          repeatCount="indefinite"
          begin="0.6s"
        />
      )}
    </circle>
    
    {/* Notification badge */}
    {hasNotification && (
      <circle cx="18" cy="6" r="4" fill="#ef4444">
        <animate
          attributeName="r"
          values="3;4;3"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    )}
  </svg>
);

// Animated Settings Icon
export const AnimatedSettings = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle 
      cx="12" 
      cy="12" 
      r="3" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      fill={active ? "rgba(196, 214, 0, 0.1)" : "none"}
    />
    <path 
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active && (
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 12 12;360 12 12"
          dur="8s"
          repeatCount="indefinite"
        />
      )}
    </path>
  </svg>
);

// Animated Chart/Analytics Icon
export const AnimatedChart = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M3 3v18h18" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Bars */}
    <rect x="7" y="12" width="3" height="9" fill={active ? "#C4D600" : "#666"}>
      {active && (
        <animate
          attributeName="height"
          values="9;12;9"
          dur="2s"
          repeatCount="indefinite"
        />
      )}
    </rect>
    <rect x="12" y="8" width="3" height="13" fill={active ? "#B2FF66" : "#888"}>
      {active && (
        <animate
          attributeName="height"
          values="13;16;13"
          dur="2s"
          repeatCount="indefinite"
          begin="0.5s"
        />
      )}
    </rect>
    <rect x="17" y="5" width="3" height="16" fill={active ? "#C4D600" : "#666"}>
      {active && (
        <animate
          attributeName="height"
          values="16;19;16"
          dur="2s"
          repeatCount="indefinite"
          begin="1s"
        />
      )}
    </rect>
  </svg>
);

// Animated Help Icon
export const AnimatedHelp = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      fill={active ? "rgba(196, 214, 0, 0.1)" : "none"}
    >
      {active && (
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.05;1"
          dur="3s"
          repeatCount="indefinite"
        />
      )}
    </circle>
    <path 
      d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="17" r="1" fill={active ? "#C4D600" : "#666"}>
      {active && (
        <animate
          attributeName="opacity"
          values="1;0.5;1"
          dur="2s"
          repeatCount="indefinite"
        />
      )}
    </circle>
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

// Animated Success Checkmark
export const AnimatedSuccess = ({ size = 24, color = '#C4D600' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill={color} stroke="none">
      <animate
        attributeName="r"
        values="0;11"
        dur="0.5s"
        fill="freeze"
      />
    </circle>
    <path 
      d="M8 12l3 3 5-5" 
      stroke="white" 
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

// Animated Error X
export const AnimatedError = ({ size = 24, color = '#ef4444' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill={color} stroke="none">
      <animate
        attributeName="r"
        values="0;11"
        dur="0.5s"
        fill="freeze"
      />
    </circle>
    <path 
      d="M8 8L16 16M16 8L8 16" 
      stroke="white" 
      strokeWidth="3" 
      strokeLinecap="round"
      strokeDasharray="0 12"
    >
      <animate
        attributeName="stroke-dasharray"
        values="0 12;12 12"
        dur="0.6s"
        begin="0.5s"
        fill="freeze"
      />
    </path>
  </svg>
);

// Group for Specialized Populations
// Animated Email
export const AnimatedEmail = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect 
      x="2" 
      y="4" 
      width="20" 
      height="16" 
      rx="2" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      fill={active ? "rgba(196, 214, 0, 0.1)" : "none"}
    />
    <path 
      d="M2 6L12 13L22 6" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active && (
        <animate
          attributeName="stroke-dasharray"
          values="0 40;40 40"
          dur="2s"
          repeatCount="indefinite"
        />
      )}
    </path>
  </svg>
);

// Animated Key
export const AnimatedKey = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle 
      cx="8" 
      cy="8" 
      r="4" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      fill={active ? "rgba(196, 214, 0, 0.1)" : "none"}
    />
    <path 
      d="M12 8L20 8M20 8L18 6M20 8L18 10" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active && (
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 8 8;10 8 8;0 8 8"
          dur="2s"
          repeatCount="indefinite"
        />
      )}
    </path>
  </svg>
);

// Animated Phone
export const AnimatedPhone = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect 
      x="5" 
      y="2" 
      width="14" 
      height="20" 
      rx="2" 
      ry="2" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      fill={active ? "rgba(196, 214, 0, 0.1)" : "none"}
    />
    <line 
      x1="12" 
      y1="18" 
      x2="12.01" 
      y2="18" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {active && (
      <animateTransform
        attributeName="transform"
        type="scale"
        values="1;1.05;1"
        dur="2s"
        repeatCount="indefinite"
      />
    )}
  </svg>
);

// Animated Credit Card
export const AnimatedCreditCard = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect 
      x="1" 
      y="4" 
      width="22" 
      height="16" 
      rx="2" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      fill={active ? "rgba(196, 214, 0, 0.1)" : "none"}
    />
    <line 
      x1="1" 
      y1="10" 
      x2="23" 
      y2="10" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
    />
    <line 
      x1="1" 
      y1="15" 
      x2="7" 
      y2="15" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
    />
    {active && (
      <animate
        attributeName="opacity"
        values="1;0.7;1"
        dur="2s"
        repeatCount="indefinite"
      />
    )}
  </svg>
);

// Animated Trash
export const AnimatedTrash = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" 
      stroke={active ? "#ef4444" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {active && (
      <animateTransform
        attributeName="transform"
        type="scale"
        values="1;1.1;1"
        dur="1s"
        repeatCount="indefinite"
      />
    )}
  </svg>
);

// Animated Book
export const AnimatedBook = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path 
      d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      fill={active ? "rgba(196, 214, 0, 0.1)" : "none"}
    />
    {active && (
      <animateTransform
        attributeName="transform"
        type="rotateY"
        values="0;10;0"
        dur="3s"
        repeatCount="indefinite"
      />
    )}
  </svg>
);

// Animated Lock
export const AnimatedLock = ({ size = 24, active = false, locked = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect 
      x="3" 
      y="11" 
      width="18" 
      height="11" 
      rx="2" 
      ry="2" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      fill={active ? "rgba(196, 214, 0, 0.1)" : "none"}
    />
    <circle 
      cx="12" 
      cy="16" 
      r="1" 
      fill={active ? "#C4D600" : "#666"}
    />
    <path 
      d={locked ? "M7 11V7a5 5 0 0 1 10 0v4" : "M7 11V7a5 5 0 0 1 10 0v2"} 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {active && (
      <animateTransform
        attributeName="transform"
        type="scale"
        values="1;1.05;1"
        dur="2s"
        repeatCount="indefinite"
      />
    )}
  </svg>
);

// Animated Document
export const AnimatedDocument = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? "rgba(196, 214, 0, 0.1)" : "none"}
    />
    <polyline 
      points="14,2 14,8 20,8" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line 
      x1="16" 
      y1="13" 
      x2="8" 
      y2="13" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line 
      x1="16" 
      y1="17" 
      x2="8" 
      y2="17" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {active && (
      <animate
        attributeName="opacity"
        values="1;0.8;1"
        dur="2s"
        repeatCount="indefinite"
      />
    )}
  </svg>
);

// Animated Location Pin
export const AnimatedLocation = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      fill={active ? "rgba(196, 214, 0, 0.2)" : "none"}
    >
      {active && (
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.1;1"
          dur="2s"
          repeatCount="indefinite"
        />
      )}
    </path>
    <circle 
      cx="12" 
      cy="10" 
      r="3" 
      stroke={active ? "#C4D600" : "#666"}
      strokeWidth="2"
      fill={active ? "#C4D600" : "none"}
    />
  </svg>
);

// Animated Door Exit
export const AnimatedDoor = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" 
      stroke={active ? "#ef4444" : "#666"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {active && (
      <animateTransform
        attributeName="transform"
        type="translateX"
        values="0;2;0"
        dur="2s"
        repeatCount="indefinite"
      />
    )}
  </svg>
);

// Animated Party/Celebration
export const AnimatedParty = ({ size = 24, active = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Confetti pieces */}
    <rect x="6" y="4" width="2" height="2" fill="#FFD700" transform="rotate(45 7 5)">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="45 7 5;405 7 5"
        dur="2s"
        repeatCount="indefinite"
      />
    </rect>
    <circle cx="16" cy="6" r="1" fill="#FF6B9D">
      <animate
        attributeName="cy"
        values="6;10;6"
        dur="1.5s"
        repeatCount="indefinite"
      />
    </circle>
    <rect x="4" y="8" width="1.5" height="1.5" fill="#00D4AA" transform="rotate(30 4.75 8.75)">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="30 4.75 8.75;390 4.75 8.75"
        dur="3s"
        repeatCount="indefinite"
      />
    </rect>
    <circle cx="18" cy="12" r="1.5" fill="#C4D600">
      <animate
        attributeName="cx"
        values="18;14;18"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>
    <rect x="8" y="16" width="2" height="2" fill="#FF4444" transform="rotate(60 9 17)">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="60 9 17;420 9 17"
        dur="2.5s"
        repeatCount="indefinite"
      />
    </rect>
    <circle cx="14" cy="18" r="1" fill="#8B5CF6">
      <animate
        attributeName="cy"
        values="18;14;18"
        dur="1.8s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

// New Specialty Category SVGs following LiftLink design philosophy

// Strength & Power Training SVG
export const AnimatedDumbbell = ({ size = 24, color = "#C4D600" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="8" width="4" height="8" rx="1" fill={color}>
      <animateTransform
        attributeName="transform"
        type="scale"
        values="1;1.1;1"
        dur="2s"
        repeatCount="indefinite"
      />
    </rect>
    <rect x="6" y="10" width="12" height="4" rx="1" fill={color}>
      <animate
        attributeName="opacity"
        values="0.8;1;0.8"
        dur="2s"
        repeatCount="indefinite"
      />
    </rect>
    <rect x="18" y="8" width="4" height="8" rx="1" fill={color}>
      <animateTransform
        attributeName="transform"
        type="scale"
        values="1;1.1;1"
        dur="2s"
        repeatCount="indefinite"
      />
    </rect>
  </svg>
);

// Running/Cardio SVG
export const AnimatedRunning = ({ size = 24, color = "#C4D600" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="4" r="2" fill={color}>
      <animate
        attributeName="r"
        values="2;2.5;2"
        dur="1.5s"
        repeatCount="indefinite"
      />
    </circle>
    <path d="M10 8L14 8L15 12L13 16L11 16L9 12Z" fill={color}>
      <animateTransform
        attributeName="transform"
        type="skewX"
        values="0;5;0;-5;0"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </path>
    <path d="M8 16L6 20" stroke={color} strokeWidth="2" strokeLinecap="round">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 8 16;-10 8 16;0 8 16"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </path>
    <path d="M16 16L18 20" stroke={color} strokeWidth="2" strokeLinecap="round">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 16 16;10 16 16;0 16 16"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

// Scale for Weight Management
export const AnimatedScale = ({ size = 24, color = "#C4D600" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="18" width="20" height="3" rx="1" fill={color} />
    <rect x="11" y="10" width="2" height="8" fill={color} />
    <path d="M6 12L12 6L18 12" stroke={color} strokeWidth="2" fill="none">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 12 9;5 12 9;0 12 9;-5 12 9;0 12 9"
        dur="3s"
        repeatCount="indefinite"
      />
    </path>
    <circle cx="6" cy="12" r="2" fill={color}>
      <animate
        attributeName="cy"
        values="12;13;12;11;12"
        dur="3s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="18" cy="12" r="2" fill={color}>
      <animate
        attributeName="cy"
        values="12;11;12;13;12"
        dur="3s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

// Yoga for Flexibility & Recovery
export const AnimatedYoga = ({ size = 24, color = "#C4D600" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="5" r="2" fill={color}>
      <animate
        attributeName="opacity"
        values="0.7;1;0.7"
        dur="3s"
        repeatCount="indefinite"
      />
    </circle>
    <path d="M12 8C12 8 8 10 8 14C8 16 10 16 12 16C14 16 16 16 16 14C16 10 12 8 12 8Z" fill={color}>
      <animateTransform
        attributeName="transform"
        type="scale"
        values="1;1.05;1"
        dur="4s"
        repeatCount="indefinite"
      />
    </path>
    <path d="M6 16L9 14" stroke={color} strokeWidth="2" strokeLinecap="round">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 7.5 15;10 7.5 15;0 7.5 15"
        dur="4s"
        repeatCount="indefinite"
      />
    </path>
    <path d="M15 14L18 16" stroke={color} strokeWidth="2" strokeLinecap="round">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 16.5 15;-10 16.5 15;0 16.5 15"
        dur="4s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

// Group for Specialized Populations
export const AnimatedGroup = ({ size = 24, color = "#C4D600" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="8" cy="6" r="2" fill={color}>
      <animate
        attributeName="cy"
        values="6;5.5;6"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="16" cy="6" r="2" fill={color}>
      <animate
        attributeName="cy"
        values="6;6.5;6"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="12" cy="8" r="2" fill={color}>
      <animate
        attributeName="cy"
        values="8;7.5;8"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>
    <ellipse cx="8" cy="16" rx="3" ry="4" fill={color} opacity="0.8" />
    <ellipse cx="16" cy="16" rx="3" ry="4" fill={color} opacity="0.8" />
    <ellipse cx="12" cy="18" rx="3" ry="4" fill={color} opacity="0.8" />
  </svg>
);

// Movement for Functional Training
export const AnimatedMovement = ({ size = 24, color = "#C4D600" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="4" r="2" fill={color} />
    <path d="M10 8L14 8L13 12L15 16L13 16L11 12Z" fill={color}>
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 12 12;5 12 12;0 12 12;-5 12 12;0 12 12"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>
    <path d="M9 12L7 16" stroke={color} strokeWidth="2" strokeLinecap="round">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 8 14;-15 8 14;0 8 14"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>
    <path d="M15 12L17 16" stroke={color} strokeWidth="2" strokeLinecap="round">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 16 14;15 16 14;0 16 14"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

// Brain for Mental & Mindful
export const AnimatedBrain = ({ size = 24, color = "#C4D600" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2C16.4183 2 20 5.58172 20 10C20 14.4183 16.4183 18 12 18C7.58172 18 4 14.4183 4 10C4 5.58172 7.58172 2 12 2Z" fill={color} opacity="0.3" />
    <path d="M8 8C8.5 8 9 8.5 9 9C9 9.5 8.5 10 8 10" stroke={color} strokeWidth="1.5" fill="none">
      <animate
        attributeName="stroke-dasharray"
        values="0 10;5 5;0 10"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>
    <path d="M12 6C12.5 6 13 6.5 13 7C13 7.5 12.5 8 12 8" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M16 8C16.5 8 17 8.5 17 9C17 9.5 16.5 10 16 10" stroke={color} strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="12" r="1" fill={color}>
      <animate
        attributeName="r"
        values="1;1.5;1"
        dur="1.5s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="9" cy="14" r="0.5" fill={color}>
      <animate
        attributeName="opacity"
        values="0.5;1;0.5"
        dur="1.8s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="15" cy="14" r="0.5" fill={color}>
      <animate
        attributeName="opacity"
        values="1;0.5;1"
        dur="1.8s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

// Boxing for Combat & Martial Arts
export const AnimatedBoxing = ({ size = 24, color = "#C4D600" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="8" cy="8" r="3" fill={color}>
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0 0;2 -1;0 0"
        dur="0.6s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="16" cy="8" r="3" fill={color}>
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0 0;-2 -1;0 0"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </circle>
    <path d="M8 11L12 15" stroke={color} strokeWidth="3" strokeLinecap="round">
      <animate
        attributeName="stroke-width"
        values="3;4;3"
        dur="0.6s"
        repeatCount="indefinite"
      />
    </path>
    <path d="M16 11L12 15" stroke={color} strokeWidth="3" strokeLinecap="round">
      <animate
        attributeName="stroke-width"
        values="3;4;3"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </path>
    <circle cx="12" cy="18" r="2" fill={color} opacity="0.7" />
  </svg>
);

// Dance for Creative Movement
export const AnimatedDance = ({ size = 24, color = "#C4D600" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="4" r="2" fill={color}>
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 12 4;10 12 4;0 12 4;-10 12 4;0 12 4"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>
    <path d="M12 7C12 7 8 9 10 13C12 17 14 15 16 13C18 11 14 9 12 7Z" fill={color}>
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 12 12;15 12 12;0 12 12;-15 12 12;0 12 12"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>
    <path d="M8 15L6 20" stroke={color} strokeWidth="2" strokeLinecap="round">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 7 17.5;20 7 17.5;0 7 17.5"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>
    <path d="M16 15L18 20" stroke={color} strokeWidth="2" strokeLinecap="round">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 17 17.5;-20 17 17.5;0 17 17.5"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

// Mountain for Outdoor & Adventure
export const AnimatedMountain = ({ size = 24, color = "#C4D600" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M2 20L8 8L12 12L16 6L22 20H2Z" fill={color}>
      <animate
        attributeName="fill-opacity"
        values="0.8;1;0.8"
        dur="3s"
        repeatCount="indefinite"
      />
    </path>
    <path d="M6 10L8 8L10 10" stroke={color} strokeWidth="2" fill="none" opacity="0.7" />
    <path d="M14 8L16 6L18 8" stroke={color} strokeWidth="2" fill="none" opacity="0.7" />
    <circle cx="12" cy="4" r="1.5" fill="#FFD700">
      <animate
        attributeName="cy"
        values="4;3;4"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>
    <path d="M12 5L11 6L13 6Z" fill="#FFD700">
      <animate
        attributeName="opacity"
        values="0.5;1;0.5"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

// Phone for Technology & Data
export const AnimatedPhone = ({ size = 24, color = "#C4D600" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="6" y="2" width="12" height="20" rx="2" fill={color} opacity="0.2" />
    <rect x="7" y="4" width="10" height="14" rx="1" fill="none" stroke={color} strokeWidth="1" />
    <circle cx="12" cy="20" r="1" fill={color}>
      <animate
        attributeName="r"
        values="1;1.5;1"
        dur="1.5s"
        repeatCount="indefinite"
      />
    </circle>
    <rect x="9" y="6" width="6" height="1" fill={color}>
      <animate
        attributeName="width"
        values="6;8;6"
        dur="2s"
        repeatCount="indefinite"
      />
    </rect>
    <rect x="9" y="8" width="4" height="1" fill={color} opacity="0.7" />
    <rect x="9" y="10" width="5" height="1" fill={color} opacity="0.7" />
    <circle cx="15" cy="8" r="0.5" fill={color}>
      <animate
        attributeName="fill"
        values={`${color};#FF4444;${color}`}
        dur="1s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

export default {
  LiftLinkLogo,
  AnimatedHome,
  AnimatedSearch,
  AnimatedUser,
  AnimatedCalendar,
  AnimatedMessage,
  AnimatedSettings,
  AnimatedChart,
  AnimatedHelp,
  AnimatedTree,
  AnimatedCheckmark,
  AnimatedCoin,
  AnimatedFire,
  AnimatedHeart,
  AnimatedSpinner,
  AnimatedStar,
  AnimatedSuccess,
  AnimatedError,
  AnimatedSportsTrophy,
  AnimatedEmail,
  AnimatedKey,
  AnimatedPhone,
  AnimatedCreditCard,
  AnimatedTrash,
  AnimatedBook,
  AnimatedLock,
  AnimatedDocument,
  AnimatedLocation,
  AnimatedDoor,
  AnimatedParty
};