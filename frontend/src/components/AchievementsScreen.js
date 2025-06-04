import React, { useState, useEffect } from 'react';
import { TactileButton, FloatingMascot, Confetti } from './DelightfulAnimations';
import { AnimatedCard, MorphingProgressBar } from './DelightfulComponents';
import '../styles/ProfessionalDesign.css';

const AchievementsScreen = ({ userProfile }) => {
  const [achievements, setAchievements] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCelebration, setShowCelebration] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const achievementCategories = [
    { id: 'all', name: 'All', icon: '🏆', color: '#fbbf24' },
    { id: 'fitness', name: 'Fitness', icon: '💪', color: '#00d4aa' },
    { id: 'consistency', name: 'Consistency', icon: '🔥', color: '#f59e0b' },
    { id: 'social', name: 'Social', icon: '👥', color: '#8b5cf6' },
    { id: 'milestones', name: 'Milestones', icon: '⭐', color: '#3b82f6' },
    { id: 'special', name: 'Special', icon: '🎉', color: '#ef4444' }
  ];

  useEffect(() => {
    generateAchievements();
  }, [userProfile]);

  const generateAchievements = () => {
    const userLevel = userProfile?.level || 1;
    const streak = userProfile?.consecutive_days || 0;
    const coins = userProfile?.lift_coins || 0;

    const allAchievements = [
      // Fitness Achievements
      {
        id: 1,
        title: 'First Steps',
        description: 'Complete your first workout',
        category: 'fitness',
        icon: '👟',
        progress: 100,
        maxProgress: 100,
        unlocked: userLevel >= 1,
        rarity: 'common',
        points: 10,
        reward: '10 LiftCoins',
        unlockedDate: '2024-01-10',
        requirements: 'Complete 1 workout'
      },
      {
        id: 2,
        title: 'Strength Seeker',
        description: 'Complete 10 strength training workouts',
        category: 'fitness',
        icon: '🏋️‍♀️',
        progress: Math.min(100, userLevel * 10),
        maxProgress: 100,
        unlocked: userLevel >= 3,
        rarity: 'uncommon',
        points: 25,
        reward: '25 LiftCoins',
        unlockedDate: userLevel >= 3 ? '2024-01-15' : null,
        requirements: 'Complete 10 strength workouts'
      },
      {
        id: 3,
        title: 'Cardio Champion',
        description: 'Burn 5000 calories through cardio',
        category: 'fitness',
        icon: '❤️‍🔥',
        progress: Math.min(100, userLevel * 8),
        maxProgress: 100,
        unlocked: userLevel >= 5,
        rarity: 'rare',
        points: 50,
        reward: '50 LiftCoins + Special Badge',
        unlockedDate: userLevel >= 5 ? '2024-01-20' : null,
        requirements: 'Burn 5000 calories'
      },
      // Consistency Achievements
      {
        id: 4,
        title: 'Week Warrior',
        description: 'Maintain a 7-day workout streak',
        category: 'consistency',
        icon: '🔥',
        progress: Math.min(100, (streak / 7) * 100),
        maxProgress: 100,
        unlocked: streak >= 7,
        rarity: 'uncommon',
        points: 30,
        reward: '30 LiftCoins',
        unlockedDate: streak >= 7 ? '2024-01-17' : null,
        requirements: '7-day streak'
      },
      {
        id: 5,
        title: 'Month Master',
        description: 'Maintain a 30-day workout streak',
        category: 'consistency',
        icon: '📅',
        progress: Math.min(100, (streak / 30) * 100),
        maxProgress: 100,
        unlocked: streak >= 30,
        rarity: 'epic',
        points: 100,
        reward: '100 LiftCoins + Epic Badge',
        unlockedDate: streak >= 30 ? '2024-02-10' : null,
        requirements: '30-day streak'
      },
      // Social Achievements
      {
        id: 6,
        title: 'Social Butterfly',
        description: 'Connect with 5 fitness friends',
        category: 'social',
        icon: '🦋',
        progress: 60,
        maxProgress: 100,
        unlocked: false,
        rarity: 'uncommon',
        points: 20,
        reward: '20 LiftCoins',
        requirements: 'Add 5 friends'
      },
      {
        id: 7,
        title: 'Team Player',
        description: 'Complete 3 group challenges',
        category: 'social',
        icon: '🤝',
        progress: 33,
        maxProgress: 100,
        unlocked: false,
        rarity: 'rare',
        points: 40,
        reward: '40 LiftCoins',
        requirements: 'Complete 3 group challenges'
      },
      // Milestone Achievements
      {
        id: 8,
        title: 'Level Up!',
        description: 'Reach Level 5',
        category: 'milestones',
        icon: '⭐',
        progress: Math.min(100, (userLevel / 5) * 100),
        maxProgress: 100,
        unlocked: userLevel >= 5,
        rarity: 'rare',
        points: 75,
        reward: '75 LiftCoins + Level Badge',
        unlockedDate: userLevel >= 5 ? '2024-01-25' : null,
        requirements: 'Reach Level 5'
      },
      {
        id: 9,
        title: 'Coin Collector',
        description: 'Earn 500 LiftCoins',
        category: 'milestones',
        icon: '🪙',
        progress: Math.min(100, (coins / 500) * 100),
        maxProgress: 100,
        unlocked: coins >= 500,
        rarity: 'epic',
        points: 100,
        reward: 'Exclusive Avatar Frame',
        unlockedDate: coins >= 500 ? '2024-02-01' : null,
        requirements: 'Earn 500 LiftCoins'
      },
      // Special Achievements
      {
        id: 10,
        title: 'Early Bird',
        description: 'Complete 10 morning workouts',
        category: 'special',
        icon: '🌅',
        progress: 40,
        maxProgress: 100,
        unlocked: false,
        rarity: 'legendary',
        points: 150,
        reward: 'Legendary Badge + Special Animation',
        requirements: '10 morning workouts (6-9 AM)'
      },
      {
        id: 11,
        title: 'Night Owl',
        description: 'Complete 10 evening workouts',
        category: 'special',
        icon: '🦉',
        progress: 70,
        maxProgress: 100,
        unlocked: false,
        rarity: 'legendary',
        points: 150,
        reward: 'Legendary Badge + Special Animation',
        requirements: '10 evening workouts (6-10 PM)'
      }
    ];

    setAchievements(allAchievements);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#9ca3af';
      case 'uncommon': return '#10b981';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getRarityGlow = (rarity) => {
    switch (rarity) {
      case 'common': return '0 0 10px rgba(156, 163, 175, 0.3)';
      case 'uncommon': return '0 0 15px rgba(16, 185, 129, 0.4)';
      case 'rare': return '0 0 20px rgba(59, 130, 246, 0.5)';
      case 'epic': return '0 0 25px rgba(139, 92, 246, 0.6)';
      case 'legendary': return '0 0 30px rgba(245, 158, 11, 0.7)';
      default: return 'none';
    }
  };

  const handleAchievementClick = (achievement) => {
    if (achievement.unlocked) {
      setNewAchievement(achievement);
      setShowCelebration(true);
      if (achievement.rarity === 'epic' || achievement.rarity === 'legendary') {
        setShowConfetti(true);
      }
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const AchievementCard = ({ achievement, index }) => {
    const isLocked = !achievement.unlocked && achievement.progress < 100;
    
    return (
      <AnimatedCard
        delay={index * 100}
        direction="scale"
        className={`glass-card interactive-card ${!isLocked ? 'achievement-unlocked' : ''}`}
        onClick={() => handleAchievementClick(achievement)}
        style={{
          padding: '25px',
          marginBottom: '20px',
          border: `2px solid ${achievement.unlocked ? getRarityColor(achievement.rarity) : 'rgba(255, 255, 255, 0.1)'}`,
          boxShadow: achievement.unlocked ? getRarityGlow(achievement.rarity) : 'none',
          opacity: isLocked ? 0.6 : 1,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          background: achievement.unlocked 
            ? `linear-gradient(135deg, ${getRarityColor(achievement.rarity)}10, var(--card-bg))`
            : 'var(--card-bg)'
        }}
      >
        {/* Rarity shine effect for unlocked achievements */}
        {achievement.unlocked && achievement.rarity !== 'common' && (
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            right: '-50%',
            bottom: '-50%',
            background: `linear-gradient(45deg, transparent, ${getRarityColor(achievement.rarity)}20, transparent)`,
            animation: 'shimmer 3s infinite',
            transform: 'rotate(45deg)'
          }} />
        )}
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            fontSize: '48px',
            filter: isLocked ? 'grayscale(1)' : 'none',
            transform: achievement.unlocked ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.3s ease',
            animation: achievement.unlocked && achievement.rarity === 'legendary' ? 'bounce 2s infinite' : 'none'
          }}>
            {achievement.icon}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: 0,
                color: achievement.unlocked ? getRarityColor(achievement.rarity) : 'var(--text-primary)'
              }}>
                {achievement.title}
              </h3>
              
              <span style={{
                background: getRarityColor(achievement.rarity),
                color: 'white',
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                {achievement.rarity}
              </span>
              
              {achievement.unlocked && (
                <div style={{
                  background: 'var(--success)',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  animation: 'pulse 2s infinite'
                }}>
                  ✓
                </div>
              )}
            </div>
            
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              marginBottom: '10px',
              lineHeight: '1.4'
            }}>
              {achievement.description}
            </p>
            
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '15px'
            }}>
              {achievement.requirements} • +{achievement.points} XP • {achievement.reward}
            </div>
            
            {achievement.unlockedDate && (
              <div style={{
                fontSize: '12px',
                color: 'var(--success)',
                fontWeight: '500'
              }}>
                🎉 Unlocked on {achievement.unlockedDate}
              </div>
            )}
          </div>
          
          <div style={{
            textAlign: 'center',
            minWidth: '80px'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '600',
              color: achievement.progress === 100 ? 'var(--success)' : 'var(--accent-primary)',
              marginBottom: '5px'
            }}>
              {achievement.progress}%
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}>
              Progress
            </div>
          </div>
        </div>
        
        <MorphingProgressBar 
          progress={achievement.progress}
          label=""
          color={achievement.unlocked ? getRarityColor(achievement.rarity) : 'var(--text-muted)'}
          showSparkles={achievement.progress > 80}
        />
      </AnimatedCard>
    );
  };

  const StatsCard = ({ title, value, subtitle, icon, color }) => (
    <AnimatedCard className="glass-card" style={{
      padding: '20px',
      textAlign: 'center',
      border: `1px solid ${color}30`
    }}>
      <div style={{
        fontSize: '32px',
        marginBottom: '10px',
        animation: 'bounce 3s infinite'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '28px',
        fontWeight: '600',
        color: color,
        marginBottom: '5px'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '5px'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        {subtitle}
      </div>
    </AnimatedCard>
  );

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const completionRate = ((unlockedCount / achievements.length) * 100).toFixed(1);

  return (
    <div className="achievements-screen">
      {/* Confetti Effect */}
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Header */}
      <div style={{
        padding: '30px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="trophy" width="60" height="60" patternUnits="userSpaceOnUse"%3E%3Ctext x="30" y="30" text-anchor="middle" dominant-baseline="middle" fill="rgba(255,255,255,0.1)" font-size="20"%3E🏆%3C/text%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23trophy)"/%3E%3C/svg%3E")',
          opacity: 0.3
        }} />
        
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          position: 'relative'
        }}>
          🏆 Achievements
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '16px',
          position: 'relative'
        }}>
          Celebrate your fitness milestones
        </p>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Stats Dashboard */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <StatsCard
            title="Unlocked"
            value={unlockedCount}
            subtitle={`of ${achievements.length} total`}
            icon="🏆"
            color="#fbbf24"
          />
          <StatsCard
            title="Completion"
            value={`${completionRate}%`}
            subtitle="Achievement rate"
            icon="📊"
            color="#10b981"
          />
          <StatsCard
            title="XP Earned"
            value={totalPoints}
            subtitle="Total points"
            icon="⭐"
            color="#3b82f6"
          />
          <StatsCard
            title="Rarest"
            value="Epic"
            subtitle="Highest rarity"
            icon="💎"
            color="#8b5cf6"
          />
        </div>

        {/* Category Filter */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '25px',
          overflowX: 'auto',
          padding: '5px 0'
        }}>
          {achievementCategories.map((category) => (
            <TactileButton
              key={category.id}
              variant={selectedCategory === category.id ? 'primary' : 'secondary'}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: selectedCategory === category.id ? category.color : undefined
              }}
              size="small"
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </TactileButton>
          ))}
        </div>

        {/* Achievements Grid */}
        <div>
          {filteredAchievements.map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              index={index}
            />
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <AnimatedCard className="glass-card" style={{
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>
              🏆
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '10px'
            }}>
              No achievements found
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Try selecting a different category or start working towards your first achievement!
            </p>
          </AnimatedCard>
        )}
      </div>

      {/* Achievement Detail Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        achievement={newAchievement}
        onClose={() => {
          setShowCelebration(false);
          setNewAchievement(null);
        }}
      />

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }} />
    </div>
  );
};

export default AchievementsScreen;