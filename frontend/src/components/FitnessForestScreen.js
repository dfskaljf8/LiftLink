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
      <div className="progress-section">
        <h2>Your Progress</h2>
        <MorphingProgressBar 
          progress={forestData.progress}
          label="Overall Progress"
          color="#22c55e"
          showSparkles={true}
        />
      </div>

      <div className="stats-section">
        <AnimatedCard>
          <h3>Level {forestData.level}</h3>
          <p>Keep going!</p>
        </AnimatedCard>
        
        <AnimatedCard>
          <h3>{forestData.weeklyActivity} days</h3>
          <p>Weekly Streak</p>
        </AnimatedCard>
        
        <AnimatedCard>
          <h3>{forestData.totalXP} XP</h3>
          <p>Total Experience</p>
        </AnimatedCard>
      </div>

      <div className="rewards-section">
        <h2>Rewards</h2>
        <div className="rewards-grid">
          {rewards.map(reward => (
            <AnimatedCard key={reward.id} className={reward.unlocked ? 'unlocked' : 'locked'}>
              <h3>{reward.name}</h3>
              <p>{reward.unlocked ? 'Unlocked!' : `Unlock at ${reward.threshold}%`}</p>
            </AnimatedCard>
          ))}
        </div>
      </div>

      {showMascot && (
        <FloatingMascot
          emotion="happy"
          message="Keep up the great work! Your fitness journey is blooming! 🌱"
          onDismiss={() => setShowMascot(false)}
        />
      )}

      {showLevelUp && <Confetti />}
    </div>
  );
};

export default FitnessForestScreen;
};

export default FitnessForestScreen;