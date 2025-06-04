import React from 'react';

export const SingleGrowingTree = ({ progress = 0, size = 300, animated = true }) => {
  // Progress from 0-100, determines tree size and features
  const treeScale = Math.max(0.1, progress / 100);
  const trunkHeight = size * 0.4 * treeScale;
  const crownRadius = size * 0.25 * treeScale;
  const hasFlowers = progress > 25;
  const hasFruit = progress > 50;
  const hasAnimals = progress > 75;
  const isFullyGrown = progress >= 100;
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{
      filter: isFullyGrown ? 'drop-shadow(0 0 20px rgba(196, 214, 0, 0.4))' : 'none'
    }}>
      <defs>
        <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B4513" />
          <stop offset="100%" stopColor="#A0522D" />
        </linearGradient>
        
        <radialGradient id="leavesGradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#9ACD32" />
          <stop offset="50%" stopColor="#6B8E23" />
          <stop offset="100%" stopColor="#556B2F" />
        </radialGradient>
        
        <radialGradient id="flowerGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFB6C1" />
          <stop offset="100%" stopColor="#FF69B4" />
        </radialGradient>
      </defs>
      
      {/* Ground */}
      <ellipse 
        cx={size/2} 
        cy={size * 0.9} 
        rx={size * 0.4 * treeScale} 
        ry={size * 0.05} 
        fill="#8B4513" 
        opacity="0.3"
      />
      
      {/* Roots (visible when tree is small) */}
      {progress < 30 && (
        <g opacity="0.4">
          <path 
            d={`M${size/2 - 20 * treeScale} ${size * 0.85} Q${size/2 - 30 * treeScale} ${size * 0.9} ${size/2 - 40 * treeScale} ${size * 0.95}`} 
            stroke="#8B4513" 
            strokeWidth="2" 
            fill="none"
          />
          <path 
            d={`M${size/2 + 20 * treeScale} ${size * 0.85} Q${size/2 + 30 * treeScale} ${size * 0.9} ${size/2 + 40 * treeScale} ${size * 0.95}`} 
            stroke="#8B4513" 
            strokeWidth="2" 
            fill="none"
          />
        </g>
      )}
      
      {/* Main Trunk */}
      <rect 
        x={size/2 - (15 * treeScale)} 
        y={size * 0.85 - trunkHeight} 
        width={30 * treeScale} 
        height={trunkHeight} 
        fill="url(#trunkGradient)"
        rx="3"
      >
        {animated && (
          <animate
            attributeName="height"
            values={`0;${trunkHeight}`}
            dur="3s"
            fill="freeze"
          />
        )}
      </rect>
      
      {/* Trunk texture lines */}
      {progress > 10 && (
        <g stroke="#654321" strokeWidth="1" opacity="0.6">
          <line 
            x1={size/2 - (10 * treeScale)} 
            y1={size * 0.85 - trunkHeight * 0.3} 
            x2={size/2 + (10 * treeScale)} 
            y2={size * 0.85 - trunkHeight * 0.3}
          />
          <line 
            x1={size/2 - (8 * treeScale)} 
            y1={size * 0.85 - trunkHeight * 0.6} 
            x2={size/2 + (8 * treeScale)} 
            y2={size * 0.85 - trunkHeight * 0.6}
          />
        </g>
      )}
      
      {/* Branches (appear after 20% progress) */}
      {progress > 20 && (
        <g stroke="#8B4513" strokeWidth={Math.max(2, 4 * treeScale)} strokeLinecap="round">
          {/* Main branches */}
          <path 
            d={`M${size/2} ${size * 0.85 - trunkHeight * 0.8} L${size/2 - 30 * treeScale} ${size * 0.85 - trunkHeight * 1.2}`}
            opacity="0.8"
          />
          <path 
            d={`M${size/2} ${size * 0.85 - trunkHeight * 0.8} L${size/2 + 30 * treeScale} ${size * 0.85 - trunkHeight * 1.2}`}
            opacity="0.8"
          />
          <path 
            d={`M${size/2} ${size * 0.85 - trunkHeight * 0.6} L${size/2 - 20 * treeScale} ${size * 0.85 - trunkHeight * 1.1}`}
            opacity="0.6"
          />
          <path 
            d={`M${size/2} ${size * 0.85 - trunkHeight * 0.6} L${size/2 + 20 * treeScale} ${size * 0.85 - trunkHeight * 1.1}`}
            opacity="0.6"
          />
        </g>
      )}
      
      {/* Smaller branches (appear after 40% progress) */}
      {progress > 40 && (
        <g stroke="#8B4513" strokeWidth={Math.max(1, 2 * treeScale)} strokeLinecap="round" opacity="0.7">
          <path d={`M${size/2 - 25 * treeScale} ${size * 0.85 - trunkHeight * 1.15} L${size/2 - 35 * treeScale} ${size * 0.85 - trunkHeight * 1.3}`} />
          <path d={`M${size/2 + 25 * treeScale} ${size * 0.85 - trunkHeight * 1.15} L${size/2 + 35 * treeScale} ${size * 0.85 - trunkHeight * 1.3}`} />
          <path d={`M${size/2 - 15 * treeScale} ${size * 0.85 - trunkHeight * 1.05} L${size/2 - 25 * treeScale} ${size * 0.85 - trunkHeight * 1.25}`} />
          <path d={`M${size/2 + 15 * treeScale} ${size * 0.85 - trunkHeight * 1.05} L${size/2 + 25 * treeScale} ${size * 0.85 - trunkHeight * 1.25}`} />
        </g>
      )}
      
      {/* Main Crown */}
      {progress > 15 && (
        <ellipse 
          cx={size/2} 
          cy={size * 0.85 - trunkHeight * 1.3} 
          rx={crownRadius} 
          ry={crownRadius * 0.8} 
          fill="url(#leavesGradient)"
        >
          {animated && (
            <animate
              attributeName="rx"
              values={`0;${crownRadius}`}
              dur="2s"
              begin="1s"
              fill="freeze"
            />
          )}
          {animated && (
            <animate
              attributeName="ry"
              values={`0;${crownRadius * 0.8}`}
              dur="2s"
              begin="1s"
              fill="freeze"
            />
          )}
          {animated && progress > 30 && (
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1;1.02;1"
              dur="4s"
              repeatCount="indefinite"
            />
          )}
        </ellipse>
      )}
      
      {/* Additional foliage clusters */}
      {progress > 35 && (
        <g fill="url(#leavesGradient)" opacity="0.9">
          <circle 
            cx={size/2 - crownRadius * 0.6} 
            cy={size * 0.85 - trunkHeight * 1.1} 
            r={crownRadius * 0.4}
          />
          <circle 
            cx={size/2 + crownRadius * 0.6} 
            cy={size * 0.85 - trunkHeight * 1.1} 
            r={crownRadius * 0.4}
          />
          <circle 
            cx={size/2} 
            cy={size * 0.85 - trunkHeight * 0.9} 
            r={crownRadius * 0.3}
          />
        </g>
      )}
      
      {/* Flowers (appear after 25% progress) */}
      {hasFlowers && (
        <g>
          {[...Array(Math.floor(progress / 10))].map((_, i) => {
            const angle = (i * 60) * (Math.PI / 180);
            const x = size/2 + Math.cos(angle) * crownRadius * 0.7;
            const y = size * 0.85 - trunkHeight * 1.3 + Math.sin(angle) * crownRadius * 0.5;
            
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={3 * treeScale}
                fill="url(#flowerGradient)"
              >
                {animated && (
                  <animate
                    attributeName="opacity"
                    values="0.7;1;0.7"
                    dur="3s"
                    repeatCount="indefinite"
                    begin={`${i * 0.5}s`}
                  />
                )}
              </circle>
            );
          })}
        </g>
      )}
      
      {/* Fruit (appear after 50% progress) */}
      {hasFruit && (
        <g>
          {[...Array(Math.floor(progress / 20))].map((_, i) => {
            const angle = (i * 90) * (Math.PI / 180);
            const x = size/2 + Math.cos(angle) * crownRadius * 0.5;
            const y = size * 0.85 - trunkHeight * 1.2 + Math.sin(angle) * crownRadius * 0.4;
            
            return (
              <ellipse
                key={i}
                cx={x}
                cy={y}
                rx={4 * treeScale}
                ry={6 * treeScale}
                fill="#FF6347"
              >
                {animated && (
                  <animateTransform
                    attributeName="transform"
                    type="scale"
                    values="1;1.1;1"
                    dur="2s"
                    repeatCount="indefinite"
                    begin={`${i * 0.7}s`}
                  />
                )}
              </ellipse>
            );
          })}
        </g>
      )}
      
      {/* Birds (appear after 75% progress) */}
      {hasAnimals && (
        <g>
          {[...Array(2)].map((_, i) => {
            const x = size/2 + (i === 0 ? -crownRadius * 1.2 : crownRadius * 1.2);
            const y = size * 0.85 - trunkHeight * 1.5;
            
            return (
              <g key={i}>
                <path
                  d={`M${x - 8} ${y} Q${x} ${y - 4} ${x + 8} ${y}`}
                  stroke="#333"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                >
                  {animated && (
                    <animateTransform
                      attributeName="transform"
                      type="translateY"
                      values="0;-3;0"
                      dur="1s"
                      repeatCount="indefinite"
                      begin={`${i * 0.5}s`}
                    />
                  )}
                </path>
              </g>
            );
          })}
        </g>
      )}
      
      {/* Special effects for fully grown tree */}
      {isFullyGrown && (
        <g>
          {/* Golden sparkles */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45) * (Math.PI / 180);
            const x = size/2 + Math.cos(angle) * crownRadius * 1.3;
            const y = size * 0.85 - trunkHeight * 1.3 + Math.sin(angle) * crownRadius * 1.1;
            
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2"
                fill="#FFD700"
              >
                <animate
                  attributeName="opacity"
                  values="0;1;0"
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${i * 0.25}s`}
                />
              </circle>
            );
          })}
          
          {/* Crown glow */}
          <ellipse 
            cx={size/2} 
            cy={size * 0.85 - trunkHeight * 1.3} 
            rx={crownRadius * 1.1} 
            ry={crownRadius * 0.9} 
            fill="none"
            stroke="#C4D600"
            strokeWidth="2"
            opacity="0.6"
          >
            <animate
              attributeName="opacity"
              values="0.3;0.8;0.3"
              dur="3s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>
      )}
      
      {/* Progress indicator */}
      <text 
        x={size/2} 
        y={size * 0.95} 
        textAnchor="middle" 
        fill="#C4D600" 
        fontSize={12 * treeScale}
        fontWeight="600"
      >
        {Math.round(progress)}% Growth
      </text>
    </svg>
  );
};

export default SingleGrowingTree;