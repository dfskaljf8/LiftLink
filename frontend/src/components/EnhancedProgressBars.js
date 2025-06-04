import React, { useState, useEffect } from 'react';

// Addictive Progress Bar - Always shows 80% completion to next milestone
export const AddictiveProgressBar = ({ currentValue, maxValue, type = 'level', showMilestone = true }) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isNearComplete, setIsNearComplete] = useState(false);

  useEffect(() => {
    // Calculate progress but always show 80-95% to create urgency
    const realProgress = (currentValue / maxValue) * 100;
    const adjustedProgress = Math.max(80, Math.min(95, realProgress + 20));
    
    // Animate to the adjusted progress
    const timer = setTimeout(() => {
      setDisplayProgress(adjustedProgress);
      setIsNearComplete(adjustedProgress >= 90);
    }, 100);

    return () => clearTimeout(timer);
  }, [currentValue, maxValue]);

  const getProgressColor = () => {
    if (isNearComplete) {
      return 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)';
    }
    switch (type) {
      case 'level': return 'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%)';
      case 'strength': return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
      case 'streak': return 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
      default: return 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
    }
  };

  const getMilestoneText = () => {
    const remaining = Math.max(1, Math.ceil(maxValue - currentValue));
    const milestones = {
      level: `${remaining} XP to Level ${Math.floor(currentValue / maxValue) + 1}!`,
      strength: `${remaining} reps to next strength milestone!`,
      streak: `${remaining} day${remaining !== 1 ? 's' : ''} to next streak reward!`
    };
    return milestones[type] || `${remaining} to completion!`;
  };

  return (
    <div style={{ position: 'relative', marginBottom: '16px' }}>
      {/* Progress Bar Container */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        height: '16px',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Shimmer Effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
          animation: 'shimmer 2s infinite'
        }} />
        
        {/* Progress Fill */}
        <div style={{
          width: `${displayProgress}%`,
          height: '100%',
          background: getProgressColor(),
          borderRadius: '12px',
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          animation: isNearComplete ? 'urgentPulse 1s infinite' : 'none'
        }}>
          {/* Sparkle Effect */}
          <div style={{
            position: 'absolute',
            top: '2px',
            right: '8px',
            width: '4px',
            height: '4px',
            background: 'white',
            borderRadius: '50%',
            animation: 'sparkle 1.5s infinite'
          }} />
        </div>
      </div>

      {/* Milestone Text */}
      {showMilestone && (
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          marginTop: '8px',
          color: isNearComplete ? '#f59e0b' : 'var(--text-secondary)',
          textAlign: 'center',
          animation: isNearComplete ? 'milestoneUrgent 0.5s infinite alternate' : 'none'
        }}>
          {isNearComplete ? '🔥 ' : ''}
          {getMilestoneText()}
          {isNearComplete ? ' 🔥' : ''}
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes urgentPulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes milestoneUrgent {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

// Comparative Progress Bar (showing user vs friends)
export const CompetitiveProgressBar = ({ userProgress, friendsProgress, metric = 'Level' }) => {
  const maxProgress = Math.max(userProgress, ...friendsProgress.map(f => f.value));
  
  return (
    <div style={{
      background: 'var(--glass-bg)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      marginBottom: '16px'
    }}>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🏆 {metric} Leaderboard
        <span style={{
          fontSize: '12px',
          background: 'var(--error)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '8px',
          fontWeight: '600'
        }}>
          LIVE
        </span>
      </h4>

      {/* User Progress */}
      <div style={{
        background: userProgress >= Math.max(...friendsProgress.map(f => f.value)) ? 
          'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        border: `1px solid ${userProgress >= Math.max(...friendsProgress.map(f => f.value)) ? 
          'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '12px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
            You {userProgress >= Math.max(...friendsProgress.map(f => f.value)) ? '👑' : ''}
          </span>
          <span style={{
            fontWeight: '600',
            fontSize: '18px',
            color: userProgress >= Math.max(...friendsProgress.map(f => f.value)) ? 
              'var(--success)' : 'var(--error)'
          }}>
            {userProgress}
          </span>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          height: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(userProgress / maxProgress) * 100}%`,
            height: '100%',
            background: userProgress >= Math.max(...friendsProgress.map(f => f.value)) ? 
              'linear-gradient(90deg, #10b981 0%, #059669 100%)' :
              'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '8px',
            transition: 'width 1s ease-out',
            animation: userProgress >= Math.max(...friendsProgress.map(f => f.value)) ? 
              'victoryPulse 1s infinite' : 'none'
          }} />
        </div>
      </div>

      {/* Friends Progress */}
      {friendsProgress.slice(0, 3).map((friend, index) => (
        <div key={friend.name} style={{
          background: 'var(--card-bg)',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <span style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {friend.name}
            </span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              {friend.value}
            </span>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
            height: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(friend.value / maxProgress) * 100}%`,
              height: '100%',
              background: 'var(--accent-muted)',
              borderRadius: '4px',
              transition: 'width 1s ease-out'
            }} />
          </div>
        </div>
      ))}

      {userProgress < Math.max(...friendsProgress.map(f => f.value)) && (
        <div style={{
          textAlign: 'center',
          marginTop: '12px',
          padding: '8px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--error)',
            marginBottom: '4px'
          }}>
            You're behind! 😱
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {Math.max(...friendsProgress.map(f => f.value)) - userProgress} {metric.toLowerCase()} points to catch up
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes victoryPulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }
      `}</style>
    </div>
  );
};

// Streak Visualization with FOMO
export const StreakFOMOBar = ({ currentStreak, maxStreak, missedToday = false }) => {
  const streakMilestones = [7, 14, 30, 60, 100];
  const nextMilestone = streakMilestones.find(m => m > currentStreak) || streakMilestones[streakMilestones.length - 1];
  const daysToMilestone = nextMilestone - currentStreak;

  return (
    <div style={{
      background: missedToday ? 
        'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)' :
        'var(--glass-bg)',
      borderRadius: '16px',
      padding: '20px',
      border: `1px solid ${missedToday ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.2)'}`,
      marginBottom: '16px',
      animation: missedToday ? 'streakDanger 1s infinite alternate' : 'none'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h4 style={{
          fontSize: '18px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🔥 Current Streak
          {missedToday && (
            <span style={{
              background: 'var(--error)',
              color: 'white',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '8px',
              fontWeight: '600',
              animation: 'urgentBlink 0.5s infinite'
            }}>
              IN DANGER!
            </span>
          )}
        </h4>
        <div style={{
          fontSize: '32px',
          fontWeight: '700',
          color: missedToday ? 'var(--error)' : 'var(--accent-primary)'
        }}>
          {currentStreak}
        </div>
      </div>

      {/* Streak Progress to Next Milestone */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        height: '20px',
        overflow: 'hidden',
        marginBottom: '12px',
        position: 'relative'
      }}>
        <div style={{
          width: `${(currentStreak / nextMilestone) * 100}%`,
          height: '100%',
          background: missedToday ? 
            'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' :
            'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '12px',
          transition: 'width 1s ease-out',
          position: 'relative'
        }}>
          {/* Fire emojis along the progress */}
          {Array.from({ length: Math.floor(currentStreak / 7) }, (_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: `${(i + 1) * (100 / Math.floor(currentStreak / 7))}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: '16px',
                animation: 'fireFlicker 1s infinite alternate'
              }}
            >
              🔥
            </div>
          ))}
        </div>
      </div>

      {/* Milestone Info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px'
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          Next milestone: {nextMilestone} days
        </span>
        <span style={{
          fontWeight: '600',
          color: daysToMilestone <= 3 ? 'var(--warning)' : 'var(--text-primary)'
        }}>
          {daysToMilestone} day{daysToMilestone !== 1 ? 's' : ''} to go!
        </span>
      </div>

      {/* Warning Message */}
      {missedToday && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--error)',
            marginBottom: '4px'
          }}>
            ⚠️ Streak in Danger!
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Complete a workout in the next 6 hours to save your {currentStreak}-day streak!
          </div>
        </div>
      )}

      {/* Max Streak Achievement */}
      {currentStreak === maxStreak && maxStreak > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--success)',
            marginBottom: '4px'
          }}>
            🏆 Personal Best!
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            This is your longest streak ever!
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes streakDanger {
          0% { border-color: rgba(239, 68, 68, 0.3); }
          100% { border-color: rgba(239, 68, 68, 0.6); }
        }
        @keyframes urgentBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fireFlicker {
          0% { transform: translate(-50%, -50%) scale(1); }
          100% { transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export { AddictiveProgressBar, CompetitiveProgressBar, StreakFOMOBar };