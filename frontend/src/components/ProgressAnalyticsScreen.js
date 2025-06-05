import React, { useState, useEffect } from 'react';
import { TactileButton, StreakCounter } from '../DelightfulAnimations';
import { AnimatedCard, MorphingProgressBar } from '../DelightfulComponents';
import { 
  AnimatedChart, AnimatedTrophy, AnimatedCoin, AnimatedFire, AnimatedStar, 
  AnimatedHeart, AnimatedCheckmark, AnimatedUser, AnimatedSpinner,
  AnimatedSuccess, AnimatedSettings 
} from './AnimatedSVGs';
import '../styles/ProfessionalDesign.css';

const ProgressAnalyticsScreen = ({ userProfile }) => {
  const [analyticsData, setAnalyticsData] = useState({
    weeklyStats: [],
    monthlyGoals: [],
    achievements: [],
    streaks: {},
    bodyMetrics: {},
    workoutHistory: [],
    nutritionData: []
  });
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('workouts');
  const [animatingStreaks, setAnimatingStreaks] = useState(false);

  useEffect(() => {
    generateAnalyticsData();
  }, [userProfile, selectedTimeframe]);

  const generateAnalyticsData = () => {
    const userLevel = userProfile?.level || 1;
    const consecutiveDays = userProfile?.consecutive_days || 0;
    const liftCoins = userProfile?.lift_coins || 0;

    // Generate realistic workout data based on timeframe
    const timeframes = {
      week: 7,
      month: 30,
      year: 365
    };
    
    const days = timeframes[selectedTimeframe];
    const weeklyStats = Array.from({ length: days }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - index));
      
      return {
        date: date.toISOString().split('T')[0],
        day: days === 7 ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] : 
              days === 30 ? date.getDate() : 
              date.toLocaleDateString('en-US', { month: 'short' }),
        workouts: Math.floor(Math.random() * 3) + (consecutiveDays > index ? 1 : 0),
        calories: Math.floor(Math.random() * 400) + 200,
        duration: Math.floor(Math.random() * 60) + 30,
        heartRate: Math.floor(Math.random() * 40) + 140,
        steps: Math.floor(Math.random() * 5000) + 8000
      };
    });

    const monthlyGoals = [
      { 
        id: 1, 
        title: 'Workout Frequency', 
        target: 20, 
        current: Math.min(20, userLevel * 2), 
        unit: 'sessions',
        icon: <AnimatedHeart size={24} beating={true} liked={true} />,
        color: '#00d4aa'
      },
      { 
        id: 2, 
        title: 'Calories Burned', 
        target: 8000, 
        current: Math.min(8000, userLevel * 300), 
        unit: 'kcal',
        icon: <AnimatedFire size={24} intensity={1} />,
        color: '#f59e0b'
      },
      { 
        id: 3, 
        title: 'Active Minutes', 
        target: 1200, 
        current: Math.min(1200, userLevel * 50), 
        unit: 'min',
        icon: <AnimatedSpinner size={24} color="#3b82f6" />,
        color: '#3b82f6'
      },
      { 
        id: 4, 
        title: 'Steps Taken', 
        target: 300000, 
        current: Math.min(300000, userLevel * 15000), 
        unit: 'steps',
        icon: <AnimatedUser size={24} active={true} />,
        color: '#8b5cf6'
      }
    ];

    const workoutHistory = [
      { date: '2024-01-15', type: 'Strength Training', duration: 45, calories: 320, rating: 4 },
      { date: '2024-01-14', type: 'Cardio', duration: 30, calories: 250, rating: 5 },
      { date: '2024-01-13', type: 'Yoga', duration: 60, calories: 180, rating: 4 },
      { date: '2024-01-12', type: 'HIIT', duration: 25, calories: 290, rating: 5 },
      { date: '2024-01-11', type: 'Swimming', duration: 40, calories: 350, rating: 4 }
    ];

    const nutritionData = [
      { date: '2024-01-15', calories: 2100, protein: 120, carbs: 250, fat: 80, water: 8 },
      { date: '2024-01-14', calories: 1950, protein: 110, carbs: 220, fat: 75, water: 7 },
      { date: '2024-01-13', calories: 2050, protein: 115, carbs: 240, fat: 78, water: 8 },
      { date: '2024-01-12', calories: 2200, protein: 125, carbs: 260, fat: 85, water: 9 },
      { date: '2024-01-11', calories: 1980, protein: 108, carbs: 230, fat: 72, water: 6 }
    ];

    setAnalyticsData({
      weeklyStats,
      monthlyGoals,
      achievements: [
        'First Workout Complete',
        'Week Streak Achieved', 
        'Month Streak Achieved',
        'Level 5 Reached',
        'Calories Champion',
        'Consistency King'
      ].slice(0, Math.min(6, Math.floor(userLevel / 2))),
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
      },
      workoutHistory,
      nutritionData
    });
  };

  const MetricCard = ({ title, value, unit, change, icon, color = 'var(--accent-primary)', delay = 0 }) => (
    <AnimatedCard delay={delay} className="glass-card" style={{
      padding: '20px',
      textAlign: 'center',
      border: `1px solid ${color}20`
    }}>
      <div style={{
        fontSize: '32px',
        marginBottom: '10px',
        animation: 'bounce 2s infinite',
        animationDelay: `${delay}ms`
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '28px',
        fontWeight: '600',
        color: color,
        marginBottom: '5px'
      }}>
        {value} {unit}
      </div>
      <div style={{
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '5px'
      }}>
        {title}
      </div>
      {change && (
        <div style={{
          fontSize: '14px',
          color: change > 0 ? 'var(--success)' : 'var(--error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}>
          {change > 0 ? '📈' : '📉'} {Math.abs(change)}% vs last {selectedTimeframe}
        </div>
      )}
    </AnimatedCard>
  );

  const ChartComponent = ({ data, metric }) => {
    const maxValue = Math.max(...data.map(d => d[metric]));
    const avgValue = data.reduce((sum, d) => sum + d[metric], 0) / data.length;
    
    return (
      <div className="glass-card" style={{
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
            {metric.charAt(0).toUpperCase() + metric.slice(1)} Trend
          </h3>
          <div style={{
            fontSize: '14px',
            color: 'var(--text-muted)'
          }}>
            Avg: {avgValue.toFixed(1)}
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'end',
          gap: selectedTimeframe === 'week' ? '12px' : '4px',
          height: '200px',
          padding: '20px 0',
          background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
          borderRadius: '12px',
          position: 'relative'
        }}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(ratio => (
            <div
              key={ratio}
              style={{
                position: 'absolute',
                left: '0',
                right: '0',
                top: `${(1 - ratio) * 100}%`,
                height: '1px',
                background: 'rgba(255, 255, 255, 0.1)'
              }}
            />
          ))}
          
          {data.map((item, index) => (
            <div
              key={index}
              className="chart-bar"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                position: 'relative'
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
                  background: `linear-gradient(180deg, 
                    ${item[metric] === maxValue ? '#00d4aa' : '#3b82f6'} 0%, 
                    ${item[metric] === maxValue ? '#00b894' : '#1d4ed8'} 100%)`,
                  borderRadius: '4px 4px 0 0',
                  height: `${(item[metric] / maxValue) * 140}px`,
                  transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  animationDelay: `${index * 0.1}s`,
                  position: 'relative',
                  minHeight: '2px'
                }}
              >
                {item[metric] === maxValue && (
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '16px',
                    animation: 'bounce 2s infinite'
                  }}>
                    🏆
                  </div>
                )}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                fontWeight: '500',
                textAlign: 'center',
                transform: selectedTimeframe === 'year' ? 'rotate(-45deg)' : 'none',
                transformOrigin: 'center'
              }}>
                {item.day}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const GoalProgressCard = ({ goal }) => {
    const percentage = Math.min(100, (goal.current / goal.target) * 100);
    
    return (
      <AnimatedCard className="glass-card" style={{
        padding: '20px',
        marginBottom: '15px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>{goal.icon}</span>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600' }}>
                {goal.title}
              </h4>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-muted)'
              }}>
                {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
              </div>
            </div>
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: goal.color
          }}>
            {percentage.toFixed(1)}%
          </div>
        </div>
        
        <MorphingProgressBar 
          progress={percentage}
          label=""
          color={goal.color}
          showSparkles={percentage > 80}
        />
        
        {percentage >= 100 && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.2), transparent)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'var(--success)',
            textAlign: 'center',
            animation: 'pulse 2s infinite'
          }}>
            🎉 Goal Completed! Amazing work!
          </div>
        )}
      </AnimatedCard>
    );
  };

  return (
    <div className="progress-analytics-screen">
      {/* Header */}
      <div style={{
        padding: '30px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grid)"/%3E%3C/svg%3E")',
          opacity: 0.3
        }} />
        
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          position: 'relative'
        }}>
          📊 Progress Analytics
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '16px',
          position: 'relative'
        }}>
          Track your fitness journey with detailed insights
        </p>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <MetricCard
            title="Current Streak"
            value={analyticsData.streaks.current}
            unit="days"
            change={15}
            icon="🔥"
            color="var(--warning)"
            delay={100}
          />
          <MetricCard
            title="Total Workouts"
            value={userProfile?.level * 4 || 8}
            unit=""
            change={12}
            icon="💪"
            color="var(--accent-primary)"
            delay={200}
          />
          <MetricCard
            title="LiftCoins"
            value={userProfile?.lift_coins || 0}
            unit=""
            change={25}
            icon="🪙"
            color="var(--accent-secondary)"
            delay={300}
          />
          <MetricCard
            title="Level"
            value={userProfile?.level || 1}
            unit=""
            icon="⭐"
            color="var(--success)"
            delay={400}
          />
        </div>

        {/* Timeframe Selector */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '25px',
          justifyContent: 'center'
        }}>
          {[
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'year', label: 'This Year' }
          ].map((timeframe) => (
            <TactileButton
              key={timeframe.id}
              variant={selectedTimeframe === timeframe.id ? 'primary' : 'secondary'}
              onClick={() => setSelectedTimeframe(timeframe.id)}
              size="small"
            >
              {timeframe.label}
            </TactileButton>
          ))}
        </div>

        {/* Metric Selector */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '25px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'workouts', label: '💪 Workouts', color: '#00d4aa' },
            { id: 'calories', label: '🔥 Calories', color: '#f59e0b' },
            { id: 'duration', label: '⏱️ Duration', color: '#3b82f6' },
            { id: 'steps', label: '👣 Steps', color: '#8b5cf6' }
          ].map((metric) => (
            <TactileButton
              key={metric.id}
              variant={selectedMetric === metric.id ? 'primary' : 'secondary'}
              onClick={() => setSelectedMetric(metric.id)}
              size="small"
              style={{
                backgroundColor: selectedMetric === metric.id ? metric.color : undefined
              }}
            >
              {metric.label}
            </TactileButton>
          ))}
        </div>

        {/* Chart Section */}
        <ChartComponent data={analyticsData.weeklyStats} metric={selectedMetric} />

        {/* Monthly Goals */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            🎯 Monthly Goals
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '15px'
          }}>
            {analyticsData.monthlyGoals.map((goal) => (
              <GoalProgressCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>

        {/* Body Metrics */}
        <AnimatedCard delay={600} className="glass-card" style={{
          padding: '25px',
          marginBottom: '30px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            📏 Body Metrics
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '15px'
          }}>
            {[
              { label: 'Weight', value: analyticsData.bodyMetrics.weight?.toFixed(1), unit: 'kg', icon: '⚖️', color: '#00d4aa' },
              { label: 'Body Fat', value: analyticsData.bodyMetrics.bodyFat?.toFixed(1), unit: '%', icon: '📊', color: '#f59e0b' },
              { label: 'Muscle Mass', value: analyticsData.bodyMetrics.muscle?.toFixed(1), unit: '%', icon: '💪', color: '#10b981' },
              { label: 'BMI', value: analyticsData.bodyMetrics.bmi?.toFixed(1), unit: '', icon: '📏', color: '#3b82f6' }
            ].map((metric, index) => (
              <div
                key={metric.label}
                className="glass-card"
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  border: `1px solid ${metric.color}20`,
                  animation: `slideUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                  {metric.icon}
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: metric.color,
                  marginBottom: '5px'
                }}>
                  {metric.value} {metric.unit}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>

        {/* Recent Achievements */}
        {analyticsData.achievements.length > 0 && (
          <AnimatedCard delay={700} className="glass-card" style={{
            padding: '25px',
            marginBottom: '30px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              🏆 Recent Achievements
            </h2>
            
            <div style={{
              display: 'grid',
              gap: '10px'
            }}>
              {analyticsData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="glass-card"
                  style={{
                    padding: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    animation: `slideInRight 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div style={{ fontSize: '28px' }}>🏆</div>
                  <div style={{ flex: 1 }}>
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
                  <div style={{
                    background: 'var(--accent-primary)',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}>
                    ✓
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>
        )}
      </div>

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }} />
    </div>
  );
};

export default ProgressAnalyticsScreen;