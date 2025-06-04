import React, { useState, useEffect } from 'react';
import '../styles/ProfessionalDesign.css';

const ProgressAnalytics = ({ userProfile }) => {
  const [analyticsData, setAnalyticsData] = useState({
    weeklyStats: [],
    monthlyGoals: [],
    achievements: [],
    streaks: {},
    bodyMetrics: {}
  });
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('workouts');

  useEffect(() => {
    // Generate mock analytics data based on user profile
    const userLevel = userProfile?.level || 1;
    const consecutiveDays = userProfile?.consecutive_days || 0;
    const liftCoins = userProfile?.lift_coins || 0;

    // Weekly workout data
    const weeklyStats = Array.from({ length: 7 }, (_, index) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
      workouts: Math.floor(Math.random() * 3) + (consecutiveDays > index ? 1 : 0),
      calories: Math.floor(Math.random() * 400) + 200,
      duration: Math.floor(Math.random() * 60) + 30
    }));

    // Monthly goals
    const monthlyGoals = [
      { 
        id: 1, 
        title: 'Workout Frequency', 
        target: 20, 
        current: Math.min(20, userLevel * 2), 
        unit: 'sessions',
        icon: '💪'
      },
      { 
        id: 2, 
        title: 'Calories Burned', 
        target: 8000, 
        current: Math.min(8000, userLevel * 300), 
        unit: 'kcal',
        icon: '🔥'
      },
      { 
        id: 3, 
        title: 'Active Minutes', 
        target: 1200, 
        current: Math.min(1200, userLevel * 50), 
        unit: 'min',
        icon: '⏱️'
      }
    ];

    setAnalyticsData({
      weeklyStats,
      monthlyGoals,
      achievements: [
        'First Workout Complete',
        'Week Streak Achieved',
        'Month Streak Achieved',
        'Level 5 Reached'
      ].slice(0, Math.min(4, Math.floor(userLevel / 3))),
      streaks: {
        current: consecutiveDays,
        longest: Math.max(consecutiveDays, 15),
        weekly: Math.floor(consecutiveDays / 7)
      },
      bodyMetrics: {
        weight: 70 + Math.random() * 20,
        bodyFat: 15 + Math.random() * 10,
        muscle: 40 + Math.random() * 10,
        bmi: 22 + Math.random() * 3
      }
    });
  }, [userProfile]);

  const MetricCard = ({ title, value, unit, change, icon, color = 'var(--accent-primary)' }) => (
    <div className="glass-card scale-in" style={{
      padding: 'var(--space-lg)',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '32px',
        marginBottom: 'var(--space-sm)'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '24px',
        fontWeight: '600',
        color: color,
        marginBottom: 'var(--space-xs)'
      }}>
        {value} {unit}
      </div>
      <div style={{
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: 'var(--space-xs)'
      }}>
        {title}
      </div>
      {change && (
        <div style={{
          fontSize: '14px',
          color: change > 0 ? 'var(--success)' : 'var(--error)'
        }}>
          {change > 0 ? '↗' : '↘'} {Math.abs(change)}% from last week
        </div>
      )}
    </div>
  );

  const ProgressBar = ({ label, current, target, color = 'var(--accent-primary)' }) => {
    const percentage = Math.min(100, (current / target) * 100);
    
    return (
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-sm)'
        }}>
          <span style={{ fontWeight: '500' }}>{label}</span>
          <span style={{ color: 'var(--text-muted)' }}>
            {current} / {target}
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
            width: `${percentage}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${color} 0%, ${color}aa 100%)`,
            borderRadius: '4px',
            transition: 'width 0.5s ease'
          }}></div>
        </div>
        <div style={{
          textAlign: 'right',
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginTop: 'var(--space-xs)'
        }}>
          {percentage.toFixed(1)}% complete
        </div>
      </div>
    );
  };

  const ChartComponent = ({ data, metric }) => {
    const maxValue = Math.max(...data.map(d => d[metric]));
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'end',
        gap: 'var(--space-sm)',
        height: '200px',
        padding: 'var(--space-lg)',
        background: 'var(--glass-bg)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {data.map((item, index) => (
          <div
            key={index}
            className="chart-bar"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-sm)'
            }}
          >
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontWeight: '500'
            }}>
              {item[metric]}
            </div>
            <div
              className="scale-in"
              style={{
                width: '100%',
                background: `linear-gradient(180deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)`,
                borderRadius: '4px 4px 0 0',
                height: `${(item[metric] / maxValue) * 140}px`,
                transition: 'height 0.5s ease',
                animationDelay: `${index * 0.1}s`
              }}
            ></div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              fontWeight: '500'
            }}>
              {item.day}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="progress-analytics">
      {/* Header */}
      <div style={{
        padding: 'var(--space-xl) var(--space-lg)',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: 'var(--space-sm)',
          background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Progress Analytics
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '16px'
        }}>
          Track your fitness journey with detailed insights
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ padding: '0 var(--space-lg) var(--space-lg)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)'
        }}>
          <MetricCard
            title="Current Streak"
            value={analyticsData.streaks.current}
            unit="days"
            change={5}
            icon="🔥"
            color="var(--warning)"
          />
          <MetricCard
            title="Total Workouts"
            value={userProfile?.level * 4 || 8}
            unit=""
            change={12}
            icon="💪"
            color="var(--accent-primary)"
          />
          <MetricCard
            title="LiftCoins"
            value={userProfile?.lift_coins || 0}
            unit=""
            change={25}
            icon="🪙"
            color="var(--accent-secondary)"
          />
          <MetricCard
            title="Level"
            value={userProfile?.level || 1}
            unit=""
            icon="⭐"
            color="var(--success)"
          />
        </div>
      </div>

      {/* Timeframe Selector */}
      <div style={{ padding: '0 var(--space-lg) var(--space-lg)' }}>
        <div style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-lg)'
        }}>
          {[
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'year', label: 'This Year' }
          ].map((timeframe) => (
            <button
              key={timeframe.id}
              className={selectedTimeframe === timeframe.id ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setSelectedTimeframe(timeframe.id)}
              style={{
                padding: 'var(--space-sm) var(--space-md)',
                fontSize: '14px'
              }}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ padding: '0 var(--space-lg) var(--space-xl)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-lg)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Weekly Activity
          </h2>
          
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-sm)',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
          >
            <option value="workouts">Workouts</option>
            <option value="calories">Calories</option>
            <option value="duration">Duration (min)</option>
          </select>
        </div>

        <ChartComponent data={analyticsData.weeklyStats} metric={selectedMetric} />
      </div>

      {/* Monthly Goals */}
      <div style={{ padding: '0 var(--space-lg) var(--space-xl)' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: 'var(--space-lg)'
        }}>
          Monthly Goals
        </h2>
        
        <div className="glass-card" style={{
          padding: 'var(--space-lg)'
        }}>
          {analyticsData.monthlyGoals.map((goal) => (
            <ProgressBar
              key={goal.id}
              label={`${goal.icon} ${goal.title}`}
              current={goal.current}
              target={goal.target}
              color={goal.id === 1 ? 'var(--accent-primary)' : goal.id === 2 ? 'var(--warning)' : 'var(--success)'}
            />
          ))}
        </div>
      </div>

      {/* Body Metrics */}
      <div style={{ padding: '0 var(--space-lg) var(--space-xl)' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: 'var(--space-lg)'
        }}>
          Body Metrics
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 'var(--space-md)'
        }}>
          <div className="glass-card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: 'var(--space-sm)' }}>⚖️</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--accent-primary)',
              marginBottom: 'var(--space-xs)'
            }}>
              {analyticsData.bodyMetrics.weight?.toFixed(1)} kg
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Weight
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: 'var(--space-sm)' }}>📊</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--warning)',
              marginBottom: 'var(--space-xs)'
            }}>
              {analyticsData.bodyMetrics.bodyFat?.toFixed(1)}%
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Body Fat
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: 'var(--space-sm)' }}>💪</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--success)',
              marginBottom: 'var(--space-xs)'
            }}>
              {analyticsData.bodyMetrics.muscle?.toFixed(1)}%
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Muscle Mass
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: 'var(--space-sm)' }}>📏</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--info)',
              marginBottom: 'var(--space-xs)'
            }}>
              {analyticsData.bodyMetrics.bmi?.toFixed(1)}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              BMI
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {analyticsData.achievements.length > 0 && (
        <div style={{ padding: '0 var(--space-lg) var(--space-2xl)' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: 'var(--space-lg)'
          }}>
            Recent Achievements
          </h2>
          
          <div style={{
            display: 'grid',
            gap: 'var(--space-sm)'
          }}>
            {analyticsData.achievements.map((achievement, index) => (
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
                <div style={{ fontSize: '28px' }}>🏆</div>
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                    {achievement}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)'
                  }}>
                    Earned {Math.floor(Math.random() * 7) + 1} days ago
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }}></div>
    </div>
  );
};

export default ProgressAnalytics;