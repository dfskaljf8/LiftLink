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
          Your Fitness Forest
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '16px',
          position: 'relative'
        }}>
          Watch your progress grow into a mighty tree
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
            <div style={{ marginBottom: '8px' }}>
              <AnimatedTrophy size={24} active={true} />
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '600',
              color: 'var(--accent-primary)',
              marginBottom: '5px'
            }}>
              {forestData.level}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Level
            </div>
          </AnimatedCard>
          
          <AnimatedCard delay={200} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ marginBottom: '8px' }}>
              <AnimatedFire size={24} intensity={forestData.weeklyActivity > 0 ? 1 : 0.5} />
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '600',
              color: 'var(--success)',
              marginBottom: '5px'
            }}>
              {forestData.weeklyActivity}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Day Streak
            </div>
          </AnimatedCard>
          
          <AnimatedCard delay={300} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ marginBottom: '8px' }}>
              <AnimatedCoin size={24} spinning={true} />
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '600',
              color: '#FFD700',
              marginBottom: '5px'
            }}>
              {userProfile?.lift_coins || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              LiftCoins
            </div>
          </AnimatedCard>
        </div>

        {/* Single Growing Tree */}
        <AnimatedCard delay={400} className="glass-card" style={{
          padding: '30px',
          textAlign: 'center',
          marginBottom: '25px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '20px',
            color: 'var(--text-primary)'
          }}>
            Your Growth Tree
          </h2>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <SingleGrowingTree 
              progress={forestData.progress} 
              size={280} 
              animated={true} 
            />
          </div>
          
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '16px',
              marginBottom: '10px'
            }}>
              {forestData.progress < 25 && "Your tree is just starting to grow! Keep working out to see amazing progress."}
              {forestData.progress >= 25 && forestData.progress < 50 && "Beautiful flowers are blooming! You're building great habits."}
              {forestData.progress >= 50 && forestData.progress < 75 && "Your tree is bearing fruit! You're seeing real results."}
              {forestData.progress >= 75 && forestData.progress < 100 && "Almost fully grown! Birds are visiting your magnificent tree."}
              {forestData.progress >= 100 && "Congratulations! Your tree is legendary. You're a fitness master!"}
            </p>
          </div>

          <MorphingProgressBar 
            progress={forestData.progress}
            label={`${Math.round(forestData.progress)}% Complete`}
            color="#22c55e"
            showSparkles={forestData.progress > 75}
          />
        </AnimatedCard>

        {/* Unlockable Rewards */}
        <AnimatedCard delay={500} className="glass-card" style={{
          padding: '25px',
          marginBottom: '25px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AnimatedStar size={24} filled={true} sparkling={true} />
            Growth Rewards
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px'
          }}>
            {rewards.map((reward, index) => (
              <div
                key={reward.id}
                className={`interactive-card ${reward.unlocked ? 'glass-card' : 'glass-card-muted'}`}
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  borderColor: reward.unlocked ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                  background: reward.unlocked 
                    ? 'linear-gradient(135deg, rgba(196, 214, 0, 0.1) 0%, rgba(178, 255, 102, 0.05) 100%)'
                    : 'rgba(255, 255, 255, 0.02)',
                  transform: reward.unlocked ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ marginBottom: '10px' }}>
                  {reward.unlocked ? (
                    <AnimatedStar size={32} filled={true} sparkling={true} />
                  ) : (
                    <AnimatedStar size={32} filled={false} sparkling={false} />
                  )}
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: reward.unlocked ? 'var(--accent-primary)' : 'var(--text-muted)'
                }}>
                  {reward.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: reward.unlocked ? 'var(--success)' : 'var(--text-muted)'
                }}>
                  {reward.unlocked ? 'Unlocked!' : `${reward.threshold}% to unlock`}
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </div>

      {/* Level Up Celebration */}
      {showLevelUp && <Confetti />}

      {/* Floating Mascot */}
      {showMascot && (
        <FloatingMascot
          emotion="happy"
          message="Your tree grows with every workout! Keep nurturing your fitness journey!"
          onDismiss={() => setShowMascot(false)}
        />
      )}

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }} />
    </div>
  );
};

export default FitnessForestScreen;