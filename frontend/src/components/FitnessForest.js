import React, { useState, useEffect } from 'react';
import '../styles/ProfessionalDesign.css';

const LegacyFitnessForest = ({ userProfile }) => {
  const [forestData, setForestData] = useState({
    trees: [],
    currentTree: null,
    forestLevel: 1,
    seedsCollected: 0,
    achievements: []
  });

  const [selectedTree, setSelectedTree] = useState(null);
  const [showNewTreeModal, setShowNewTreeModal] = useState(false);

  // Tree types based on user progress
  const treeTypes = [
    { 
      id: 'sapling', 
      name: 'Sapling', 
      requiredLevel: 1, 
      emoji: '🌱', 
      color: '#22c55e',
      description: 'Your fitness journey begins here'
    },
    { 
      id: 'oak', 
      name: 'Oak Tree', 
      requiredLevel: 5, 
      emoji: '🌳', 
      color: '#16a34a',
      description: 'Strong foundation in fitness'
    },
    { 
      id: 'pine', 
      name: 'Pine Tree', 
      requiredLevel: 10, 
      emoji: '🌲', 
      color: '#166534',
      description: 'Consistent training excellence'
    },
    { 
      id: 'cherry', 
      name: 'Cherry Blossom', 
      requiredLevel: 15, 
      emoji: '🌸', 
      color: '#ec4899',
      description: 'Beautiful dedication to health'
    },
    { 
      id: 'redwood', 
      name: 'Redwood', 
      requiredLevel: 25, 
      emoji: '🏔️', 
      color: '#7c2d12',
      description: 'Legendary fitness achievement'
    }
  ];

  useEffect(() => {
    // Initialize forest based on user progress
    const userLevel = userProfile?.level || 1;
    const workoutStreak = userProfile?.consecutive_days || 0;
    const totalWorkouts = userLevel * 10; // Mock calculation

    // Generate trees based on milestones
    const trees = [];
    let treeId = 1;

    // Add trees for every 5 levels
    for (let level = 5; level <= userLevel; level += 5) {
      const treeType = treeTypes.find(t => t.requiredLevel <= level) || treeTypes[0];
      trees.push({
        id: treeId++,
        type: treeType,
        plantedAt: new Date(Date.now() - (userLevel - level) * 7 * 24 * 60 * 60 * 1000),
        height: Math.min(100, level * 4),
        healthScore: Math.min(100, workoutStreak * 2),
        achievements: [`Level ${level} reached`, 'Consistency milestone']
      });
    }

    // Current growing tree
    const currentTreeType = treeTypes.find(t => t.requiredLevel <= userLevel) || treeTypes[0];
    const currentTree = {
      id: 'current',
      type: currentTreeType,
      height: (userLevel % 5) * 20,
      healthScore: Math.min(100, workoutStreak * 3),
      isGrowing: true
    };

    setForestData({
      trees,
      currentTree,
      forestLevel: Math.floor(userLevel / 5) + 1,
      seedsCollected: userLevel * 2,
      achievements: [
        'First Tree Planted',
        'Week Streak',
        'Month Streak'
      ].slice(0, Math.min(3, Math.floor(userLevel / 5)))
    });
  }, [userProfile]);

  const TreeComponent = ({ tree, onClick, isCurrentTree = false }) => {
    const size = isCurrentTree ? 120 : Math.min(100, 60 + tree.height * 0.4);
    
    return (
      <div
        className="tree-component scale-in"
        onClick={() => onClick(tree)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${size * 0.6}px`,
          transition: 'all 0.3s ease',
          filter: tree.healthScore > 70 ? 'brightness(1.1)' : 'brightness(0.8)'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
        }}
      >
        {tree.type.emoji}
        
        {/* Growth indicator */}
        <div style={{
          position: 'absolute',
          bottom: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${tree.height}%`,
            height: '100%',
            background: tree.type.color,
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }}></div>
        </div>

        {/* Health indicator */}
        {tree.healthScore < 50 && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            width: '20px',
            height: '20px',
            background: 'var(--warning)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}>
            ⚠️
          </div>
        )}
      </div>
    );
  };

  const TreeModal = ({ tree, onClose }) => {
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
        padding: 'var(--space-lg)'
      }}>
        <div className="glass-card" style={{
          maxWidth: '400px',
          width: '100%',
          padding: 'var(--space-xl)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: 'var(--space-lg)'
          }}>
            <div style={{ fontSize: '80px', marginBottom: 'var(--space-md)' }}>
              {tree.type.emoji}
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: 'var(--space-sm)'
            }}>
              {tree.type.name}
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-lg)'
            }}>
              {tree.type.description}
            </p>
          </div>

          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-md)'
            }}>
              <div className="glass-card" style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                <div style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                  {tree.height}%
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Growth
                </div>
              </div>
              <div className="glass-card" style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                <div style={{ color: 'var(--success)', fontWeight: '600' }}>
                  {tree.healthScore}%
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Health
                </div>
              </div>
            </div>
          </div>

          {tree.achievements && (
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: 'var(--space-sm)'
              }}>
                Achievements
              </h3>
              {tree.achievements.map((achievement, index) => (
                <div
                  key={index}
                  style={{
                    background: 'var(--card-bg)',
                    padding: 'var(--space-sm)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 'var(--space-xs)',
                    fontSize: '14px'
                  }}
                >
                  🏆 {achievement}
                </div>
              ))}
            </div>
          )}

          <button
            className="btn-primary"
            onClick={onClose}
            style={{ width: '100%' }}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fitness-forest">
      {/* Header */}
      <div style={{
        padding: 'var(--space-xl) var(--space-lg)',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0f4c3a 0%, #1a5d3a 100%)'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: 'var(--space-sm)',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Your Fitness Forest
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '16px'
        }}>
          Watch your progress grow into a magnificent forest
        </p>
      </div>

      {/* Forest Stats */}
      <div style={{ padding: '0 var(--space-lg) var(--space-lg)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)'
        }}>
          <div className="glass-card" style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--accent-primary)',
              marginBottom: 'var(--space-xs)'
            }}>
              {forestData.trees.length + 1}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Trees
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--success)',
              marginBottom: 'var(--space-xs)'
            }}>
              {forestData.forestLevel}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Forest Level
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--accent-secondary)',
              marginBottom: 'var(--space-xs)'
            }}>
              {forestData.seedsCollected}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Seeds
            </div>
          </div>
        </div>
      </div>

      {/* Current Growing Tree */}
      {forestData.currentTree && (
        <div style={{
          padding: '0 var(--space-lg) var(--space-xl)',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: 'var(--space-lg)'
          }}>
            Currently Growing
          </h2>
          
          <div className="glass-card" style={{
            padding: 'var(--space-xl)',
            textAlign: 'center',
            marginBottom: 'var(--space-lg)'
          }}>
            <TreeComponent
              tree={forestData.currentTree}
              onClick={setSelectedTree}
              isCurrentTree={true}
            />
            
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: 'var(--space-sm)'
              }}>
                {forestData.currentTree.type.name}
              </h3>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-md)'
              }}>
                <span>Growth Progress</span>
                <span style={{ color: 'var(--accent-primary)' }}>
                  {forestData.currentTree.height}%
                </span>
              </div>
              
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${forestData.currentTree.height}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-primary) 0%, var(--success) 100%)',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forest Display */}
      <div style={{ padding: '0 var(--space-lg) var(--space-2xl)' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: 'var(--space-lg)',
          textAlign: 'center'
        }}>
          Your Forest
        </h2>
        
        {forestData.trees.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: 'var(--space-lg)',
            justifyItems: 'center',
            padding: 'var(--space-lg)',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)',
            borderRadius: 'var(--radius-lg)',
            minHeight: '200px'
          }}>
            {forestData.trees.map((tree, index) => (
              <TreeComponent
                key={tree.id}
                tree={tree}
                onClick={setSelectedTree}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{
            padding: 'var(--space-2xl)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '60px', marginBottom: 'var(--space-md)' }}>
              🌱
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: 'var(--space-sm)'
            }}>
              Your Forest Awaits
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-lg)'
            }}>
              Complete workouts to grow your first tree and start building your fitness forest!
            </p>
          </div>
        )}
      </div>

      {/* Achievements */}
      {forestData.achievements.length > 0 && (
        <div style={{ padding: '0 var(--space-lg) var(--space-2xl)' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: 'var(--space-lg)',
            textAlign: 'center'
          }}>
            Forest Achievements
          </h2>
          
          <div style={{
            display: 'grid',
            gap: 'var(--space-sm)'
          }}>
            {forestData.achievements.map((achievement, index) => (
              <div
                key={index}
                className="glass-card slide-up"
                style={{
                  padding: 'var(--space-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div style={{ fontSize: '24px' }}>🏆</div>
                <div style={{ fontWeight: '500' }}>{achievement}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tree Detail Modal */}
      <TreeModal
        tree={selectedTree}
        onClose={() => setSelectedTree(null)}
      />

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }}></div>
    </div>
  );
};

export default FitnessForest;