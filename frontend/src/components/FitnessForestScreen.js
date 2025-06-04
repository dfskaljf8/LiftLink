import React, { useState, useEffect, useRef } from 'react';
import { TactileButton, StreakCounter, FloatingMascot, Confetti } from './DelightfulAnimations';
import { AnimatedCard, MorphingProgressBar } from './DelightfulComponents';
import '../styles/ProfessionalDesign.css';

const FitnessForestScreen = ({ userProfile }) => {
  const [forestData, setForestData] = useState({
    currentLevel: 0,
    trees: [],
    totalTrees: 0,
    weeklyActivity: 0,
    environmentType: 'mystical',
    availableItems: []
  });
  
  const [selectedTree, setSelectedTree] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [animatingGrowth, setAnimatingGrowth] = useState(false);
  const [showMascot, setShowMascot] = useState(true);
  const canvasRef = useRef(null);

  // Tree progression system: Seed → Sprout → Sapling → Young Tree → Mature Oak → Ancient Oak → Young Redwood → Mighty Redwood → Ancient Redwood → Legendary Redwood
  const treeStages = [
    { level: 0, name: 'Seed', emoji: '🌰', color: '#8B4513', description: 'Your fitness journey begins here' },
    { level: 1, name: 'Sprout', emoji: '🌱', color: '#90EE90', description: 'First signs of growth' },
    { level: 2, name: 'Sapling', emoji: '🌿', color: '#32CD32', description: 'Building healthy habits' },
    { level: 3, name: 'Young Tree', emoji: '🌳', color: '#228B22', description: 'Growing stronger every day' },
    { level: 5, name: 'Mature Oak', emoji: '🌲', color: '#006400', description: 'Strong foundation established' },
    { level: 8, name: 'Ancient Oak', emoji: '🏔️', color: '#2F4F4F', description: 'Wisdom through consistency' },
    { level: 12, name: 'Young Redwood', emoji: '🌲', color: '#8B4513', description: 'Reaching new heights' },
    { level: 18, name: 'Mighty Redwood', emoji: '🌲', color: '#A0522D', description: 'Towering strength' },
    { level: 25, name: 'Ancient Redwood', emoji: '🌲', color: '#CD853F', description: 'Legendary dedication' },
    { level: 35, name: 'Legendary Redwood', emoji: '🌲', color: '#DAA520', description: 'Master of fitness' }
  ];

  const environmentItems = [
    { id: 1, name: 'Mystical Fireflies', emoji: '✨', unlockLevel: 3, cost: 50 },
    { id: 2, name: 'Flowing Stream', emoji: '🏞️', unlockLevel: 5, cost: 100 },
    { id: 3, name: 'Ancient Stones', emoji: '🗿', unlockLevel: 8, cost: 200 },
    { id: 4, name: 'Mountain View', emoji: '🏔️', unlockLevel: 12, cost: 350 },
    { id: 5, name: 'Aurora Borealis', emoji: '🌌', unlockLevel: 20, cost: 500 }
  ];

  useEffect(() => {
    initializeForest();
    drawForestCanvas();
  }, [userProfile]);

  const initializeForest = () => {
    const level = userProfile?.level || 0;
    const currentStage = getCurrentTreeStage(level);
    const treesUnlocked = Math.floor(level / 2) + 1; // More trees as you level up
    
    const trees = [];
    for (let i = 0; i < treesUnlocked; i++) {
      const treeLevel = Math.max(0, level - i * 2);
      const stage = getCurrentTreeStage(treeLevel);
      trees.push({
        id: i,
        level: treeLevel,
        stage: stage,
        x: 20 + (i * 15) % 80,
        y: 60 + Math.sin(i) * 20,
        health: 100,
        growth: (treeLevel % 1) * 100,
        lastWatered: Date.now() - Math.random() * 86400000
      });
    }

    setForestData({
      currentLevel: level,
      trees: trees,
      totalTrees: treesUnlocked,
      weeklyActivity: userProfile?.consecutive_days || 0,
      environmentType: 'mystical',
      availableItems: environmentItems.filter(item => item.unlockLevel <= level)
    });
  };

  const getCurrentTreeStage = (level) => {
    for (let i = treeStages.length - 1; i >= 0; i--) {
      if (level >= treeStages[i].level) {
        return treeStages[i];
      }
    }
    return treeStages[0];
  };

  const drawForestCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height/2);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width/2, height/2);
    
    // Draw mystical particles
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * width/2,
        Math.random() * height/2,
        Math.random() * 2 + 1,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(0, 212, 170, ${Math.random() * 0.5})`;
      ctx.fill();
    }
  };

  const waterTree = async (treeId) => {
    setAnimatingGrowth(true);
    
    // Simulate growth animation
    setTimeout(() => {
      setForestData(prev => ({
        ...prev,
        trees: prev.trees.map(tree => 
          tree.id === treeId 
            ? { ...tree, health: Math.min(100, tree.health + 10), lastWatered: Date.now() }
            : tree
        )
      }));
      setAnimatingGrowth(false);
    }, 1000);
  };

  const TreeComponent = ({ tree, onClick }) => {
    const size = 60 + (tree.level * 8);
    const healthColor = tree.health > 70 ? '#00d4aa' : tree.health > 40 ? '#f59e0b' : '#ef4444';
    
    return (
      <div
        onClick={() => onClick(tree)}
        style={{
          position: 'absolute',
          left: `${tree.x}%`,
          top: `${tree.y}%`,
          width: `${size}px`,
          height: `${size}px`,
          cursor: 'pointer',
          transform: animatingGrowth && selectedTree?.id === tree.id ? 'scale(1.2)' : 'scale(1)',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          filter: tree.health < 50 ? 'grayscale(0.3)' : 'none'
        }}
      >
        <div style={{
          fontSize: `${size * 0.7}px`,
          marginBottom: '4px',
          animation: 'bounce 3s infinite',
          animationDelay: `${tree.id * 0.5}s`
        }}>
          {tree.stage.emoji}
        </div>
        
        {/* Health bar */}
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${tree.health}%`,
            height: '100%',
            background: healthColor,
            borderRadius: '2px',
            transition: 'width 0.5s ease'
          }} />
        </div>
        
        {/* Level indicator */}
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          background: tree.stage.color,
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          color: 'white'
        }}>
          {tree.level}
        </div>
      </div>
    );
  };

  const TreeDetailModal = ({ tree, onClose, onWater }) => {
    if (!tree) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1002,
        padding: '20px'
      }}>
        <AnimatedCard className="glass-card" style={{
          maxWidth: '400px',
          width: '100%',
          padding: '30px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>
            {tree.stage.emoji}
          </div>
          
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '10px',
            color: tree.stage.color
          }}>
            {tree.stage.name}
          </h2>
          
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '20px'
          }}>
            {tree.stage.description}
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '25px'
          }}>
            <div className="glass-card" style={{ padding: '15px' }}>
              <div style={{ color: 'var(--accent-primary)', fontWeight: '600', fontSize: '18px' }}>
                Level {tree.level}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Tree Level
              </div>
            </div>
            <div className="glass-card" style={{ padding: '15px' }}>
              <div style={{ color: 'var(--success)', fontWeight: '600', fontSize: '18px' }}>
                {tree.health}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Health
              </div>
            </div>
          </div>
          
          <MorphingProgressBar 
            progress={tree.growth}
            label="Growth Progress"
            color={tree.stage.color}
            showSparkles={true}
          />
          
          <div style={{
            display: 'flex',
            gap: '10px',
            marginTop: '20px'
          }}>
            <TactileButton
              variant="secondary"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Close
            </TactileButton>
            <TactileButton
              variant="primary"
              onClick={() => onWater(tree.id)}
              style={{ flex: 1 }}
            >
              💧 Water Tree
            </TactileButton>
          </div>
        </AnimatedCard>
      </div>
    );
  };

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
      <CelebrationModal
        isOpen={showLevelUp}
        achievement={{
          title: "Forest Level Up!",
          description: "Your dedication has unlocked new growth!"
        }}
        onClose={() => setShowLevelUp(false)}
      />

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