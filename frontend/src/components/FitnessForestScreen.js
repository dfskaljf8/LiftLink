import React, { useState, useEffect } from 'react';
import { TactileButton, StreakCounter, FloatingMascot, Confetti } from '../DelightfulAnimations';
import { AnimatedCard, MorphingProgressBar } from '../DelightfulComponents';
import { SingleGrowingTree } from './SingleGrowingTree';
import { AnimatedTrophy, AnimatedCoin, AnimatedFire, AnimatedStar } from './AnimatedSVGs';
import '../styles/ProfessionalDesign.css';

const FitnessForestScreen = ({ userProfile }) => {
  const [forestData, setForestData] = useState({
    progress: 0,
    level: 1,
    weeklyActivity: 0,
    totalXP: 0,
    availableRewards: []
  });
  
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showMascot, setShowMascot] = useState(true);

  // Calculate tree progress based on user profile
  const calculateProgress = () => {
    const level = userProfile?.level || 1;
    const xp = userProfile?.xp || 0;
    const streak = userProfile?.consecutive_days || 0;
    const coins = userProfile?.lift_coins || 0;
    
    // Calculate progress as percentage (0-100)
    // Based on user level, streak, and overall activity
    const baseProgress = Math.min(level * 10, 100); // Level contributes to progress
    const streakBonus = Math.min(streak * 2, 30); // Streak adds bonus (max 30%)
    const activityBonus = Math.min(xp / 100, 20); // XP adds bonus (max 20%)
    
    return Math.min(baseProgress + streakBonus + activityBonus, 100);
  };

  useEffect(() => {
    const progress = calculateProgress();
    setForestData({
      progress: progress,
      level: userProfile?.level || 1,
      weeklyActivity: userProfile?.consecutive_days || 0,
      totalXP: userProfile?.xp || 0,
      availableRewards: []
    });
  }, [userProfile]);

  const rewards = [
    { id: 1, name: 'Golden Leaves', threshold: 25, unlocked: forestData.progress >= 25 },
    { id: 2, name: 'Mystical Flowers', threshold: 50, unlocked: forestData.progress >= 50 },
    { id: 3, name: 'Magical Fruit', threshold: 75, unlocked: forestData.progress >= 75 },
    { id: 4, name: 'Legendary Aura', threshold: 100, unlocked: forestData.progress >= 100 }
  ];

  return (
    <div className="fitness-forest-screen">
      {/* Header */}
      <div style={{
        padding: '30px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0f4c3a 0%, #1a5d3a 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grid)"/%3E%3C/svg%3E")',
          opacity: 0.3
        }} />
        
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          position: 'relative'
        }}>
          🌲 Your Fitness Forest
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '16px',
          position: 'relative'
        }}>
          Every workout grows your magical forest
        </p>
      </div>

      {/* Stats Dashboard */}
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '15px',
          marginBottom: '25px'
        }}>
          <AnimatedCard delay={100} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '600',
              color: 'var(--accent-primary)',
              marginBottom: '5px'
            }}>
              {forestData.currentLevel}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Forest Level
            </div>
          </AnimatedCard>
          
          <AnimatedCard delay={200} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '600',
              color: 'var(--success)',
              marginBottom: '5px'
            }}>
              {forestData.totalTrees}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Trees Grown
            </div>
          </AnimatedCard>
          
          <AnimatedCard delay={300} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <StreakCounter count={forestData.weeklyActivity} isIncreasing={animatingGrowth} />
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
              Activity Streak
            </div>
          </AnimatedCard>
        </div>

        {/* Forest Canvas */}
        <AnimatedCard delay={400} className="glass-card" style={{
          position: 'relative',
          height: '300px',
          marginBottom: '25px',
          overflow: 'hidden',
          borderRadius: '20px'
        }}>
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          />
          
          {forestData.trees.map(tree => (
            <TreeComponent
              key={tree.id}
              tree={tree}
              onClick={setSelectedTree}
            />
          ))}
          
          {/* Forest floor gradient */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50px',
            background: 'linear-gradient(to top, rgba(0, 100, 0, 0.3), transparent)'
          }} />
        </AnimatedCard>

        {/* Current Tree Stage */}
        <AnimatedCard delay={500} className="glass-card" style={{
          padding: '25px',
          textAlign: 'center',
          marginBottom: '25px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '15px'
          }}>
            Current Stage: {getCurrentTreeStage(forestData.currentLevel).name}
          </h3>
          
          <div style={{
            fontSize: '60px',
            marginBottom: '15px',
            animation: 'pulse 2s infinite'
          }}>
            {getCurrentTreeStage(forestData.currentLevel).emoji}
          </div>
          
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '20px'
          }}>
            {getCurrentTreeStage(forestData.currentLevel).description}
          </p>
          
          <MorphingProgressBar 
            progress={((forestData.currentLevel % 5) / 5) * 100}
            label="Progress to next stage"
            color={getCurrentTreeStage(forestData.currentLevel).color}
            showSparkles={true}
          />
        </AnimatedCard>

        {/* Environment Items */}
        {forestData.availableItems.length > 0 && (
          <AnimatedCard delay={600} className="glass-card" style={{
            padding: '25px',
            marginBottom: '25px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '15px'
            }}>
              🎨 Customize Your Forest
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '10px'
            }}>
              {forestData.availableItems.map(item => (
                <div
                  key={item.id}
                  className="interactive-card glass-card"
                  style={{
                    padding: '15px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                    {item.emoji}
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                    {item.name}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: 'var(--accent-primary)',
                    fontWeight: '600'
                  }}>
                    🪙 {item.cost}
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>
        )}
      </div>

      {/* Tree Detail Modal */}
      <TreeDetailModal
        tree={selectedTree}
        onClose={() => setSelectedTree(null)}
        onWater={waterTree}
      />

      {/* Level Up Celebration */}
      <Confetti />

      {/* Floating Mascot */}
      {showMascot && (
        <FloatingMascot
          emotion="happy"
          message="Your forest grows with every workout! Keep nurturing your trees! 🌱"
          onDismiss={() => setShowMascot(false)}
        />
      )}

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }} />
    </div>
  );
};

export default FitnessForestScreen;