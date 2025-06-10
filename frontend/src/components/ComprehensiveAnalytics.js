import React, { useState, useEffect } from 'react';
import { AnimatedCard } from '../DelightfulComponents';
import { AnimatedCoin, AnimatedFire } from './AnimatedSVGs';

const ComprehensiveAnalytics = ({ userProfile }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Mock analytics data - in real app, this would come from API
  useEffect(() => {
    const mockData = {
      overview: {
        totalSessions: 24,
        totalMinutes: 1680,
        caloriesBurned: 3240,
        avgHeartRate: 142,
        consistencyScore: 92,
        improvements: {
          sessions: '+15%',
          minutes: '+8%',
          calories: '+12%',
          consistency: '+5%'
        }
      },
      workouts: {
        weeklyData: [
          { day: 'Mon', sessions: 1, minutes: 75, calories: 320, intensity: 'High' },
          { day: 'Tue', sessions: 0, minutes: 0, calories: 0, intensity: 'Rest' },
          { day: 'Wed', sessions: 1, minutes: 60, calories: 280, intensity: 'Medium' },
          { day: 'Thu', sessions: 1, minutes: 45, calories: 200, intensity: 'Low' },
          { day: 'Fri', sessions: 1, minutes: 90, calories: 410, intensity: 'High' },
          { day: 'Sat', sessions: 1, minutes: 120, calories: 520, intensity: 'High' },
          { day: 'Sun', sessions: 0, minutes: 0, calories: 0, intensity: 'Rest' }
        ],
        workoutTypes: [
          { type: 'Strength Training', sessions: 12, percentage: 50, color: '#C4D600' },
          { type: 'Cardio', sessions: 8, percentage: 33, color: '#ff6b6b' },
          { type: 'Flexibility', sessions: 4, percentage: 17, color: '#4ecdc4' }
        ],
        intensityDistribution: {
          high: 40,
          medium: 35,
          low: 25
        }
      },
      health: {
        vitals: {
          restingHeartRate: 62,
          maxHeartRate: 185,
          avgSleepHours: 7.2,
          avgSteps: 8543,
          bodyWeight: 165,
          bodyFat: 15.2
        },
        trends: {
          weight: [-2.3, 'down'],
          bodyFat: [-1.8, 'down'],
          muscle: [+3.1, 'up'],
          stamina: [+15, 'up']
        },
        healthScore: 85
      },
      progress: {
        strengthProgress: [
          { exercise: 'Bench Press', current: 185, previous: 175, improvement: '+10 lbs' },
          { exercise: 'Squat', current: 225, previous: 210, improvement: '+15 lbs' },
          { exercise: 'Deadlift', current: 275, previous: 260, improvement: '+15 lbs' },
          { exercise: 'Pull-ups', current: 12, previous: 8, improvement: '+4 reps' }
        ],
        enduranceProgress: [
          { activity: '5K Run', current: '24:30', previous: '26:15', improvement: '-1:45' },
          { activity: 'Plank Hold', current: '3:20', previous: '2:45', improvement: '+35s' },
          { activity: 'Burpees (1 min)', current: 18, previous: 14, improvement: '+4 reps' }
        ]
      }
    };

    const mockGoals = [
      {
        id: 'goal_1',
        title: 'Lose 10 pounds',
        target: 10,
        current: 7.2,
        unit: 'lbs',
        progress: 72,
        deadline: '2025-08-01',
        category: 'weight-loss',
        status: 'on-track'
      },
      {
        id: 'goal_2',
        title: 'Bench Press 200 lbs',
        target: 200,
        current: 185,
        unit: 'lbs',
        progress: 85,
        deadline: '2025-07-15',
        category: 'strength',
        status: 'on-track'
      },
      {
        id: 'goal_3',
        title: 'Run 5K under 22 minutes',
        target: 22,
        current: 24.5,
        unit: 'minutes',
        progress: 65,
        deadline: '2025-09-01',
        category: 'endurance',
        status: 'behind'
      },
      {
        id: 'goal_4',
        title: 'Workout 5 days per week',
        target: 20,
        current: 18,
        unit: 'sessions',
        progress: 90,
        deadline: '2025-06-30',
        category: 'consistency',
        status: 'on-track'
      }
    ];

    const mockAchievements = [
      {
        id: 'ach_1',
        title: 'First Week Complete',
        description: 'Completed your first week of workouts',
        earnedDate: '2025-05-15',
        icon: '🎉',
        rarity: 'common'
      },
      {
        id: 'ach_2',
        title: 'Strength Warrior',
        description: 'Increased bench press by 20+ lbs',
        earnedDate: '2025-06-01',
        icon: '💪',
        rarity: 'rare'
      },
      {
        id: 'ach_3',
        title: 'Consistency Champion',
        description: '30-day workout streak',
        earnedDate: '2025-06-05',
        icon: '🔥',
        rarity: 'epic'
      },
      {
        id: 'ach_4',
        title: 'Calorie Crusher',
        description: 'Burned 1000+ calories in a week',
        earnedDate: '2025-06-08',
        icon: '⚡',
        rarity: 'rare'
      }
    ];

    setAnalyticsData(mockData);
    setGoals(mockGoals);
    setAchievements(mockAchievements);
  }, [timeRange]);

  const MetricCard = ({ title, value, change, icon, color = '#C4D600' }) => (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
      <h3 style={{ 
        margin: '0 0 8px 0', 
        fontSize: '14px', 
        color: 'rgba(255, 255, 255, 0.7)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {title}
      </h3>
      <div style={{ 
        fontSize: '28px', 
        fontWeight: '700', 
        color: color,
        marginBottom: '8px'
      }}>
        {value}
      </div>
      {change && (
        <div style={{ 
          fontSize: '12px',
          color: change.startsWith('+') ? '#00ff88' : '#ff6b6b',
          background: change.startsWith('+') ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 107, 107, 0.1)',
          padding: '4px 8px',
          borderRadius: '8px',
          display: 'inline-block'
        }}>
          {change} from last {timeRange}
        </div>
      )}
    </div>
  );

  const Chart = ({ data, type = 'bar', height = 200 }) => {
    if (type === 'bar') {
      const maxValue = Math.max(...data.map(d => d.sessions || d.minutes || d.calories || 0));
      
      return (
        <div style={{ 
          height: `${height}px`, 
          display: 'flex', 
          alignItems: 'end', 
          justifyContent: 'space-between',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          gap: '8px'
        }}>
          {data.map((item, index) => {
            const value = item.sessions || item.minutes || item.calories || 0;
            const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            
            return (
              <div key={index} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flex: 1
              }}>
                <div style={{
                  width: '100%',
                  maxWidth: '40px',
                  height: `${heightPercentage * 1.4 || 2}px`,
                  background: value > 0 ? '#C4D600' : 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px 4px 0 0',
                  marginBottom: '8px',
                  transition: 'all 0.3s ease'
                }} />
                <span style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255, 255, 255, 0.7)',
                  textAlign: 'center'
                }}>
                  {item.day}
                </span>
                <span style={{ 
                  fontSize: '10px', 
                  color: '#C4D600',
                  textAlign: 'center'
                }}>
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    if (type === 'pie') {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: `${height}px`,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ position: 'relative' }}>
            {/* Simple pie chart representation */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `conic-gradient(
                #C4D600 0% ${data[0]?.percentage || 0}%,
                #ff6b6b ${data[0]?.percentage || 0}% ${(data[0]?.percentage || 0) + (data[1]?.percentage || 0)}%,
                #4ecdc4 ${(data[0]?.percentage || 0) + (data[1]?.percentage || 0)}% 100%
              )`,
              marginRight: '20px'
            }} />
          </div>
          <div>
            {data.map((item, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: item.color,
                  borderRadius: '2px',
                  marginRight: '8px'
                }} />
                <span style={{ color: '#ffffff' }}>
                  {item.type}: {item.sessions} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const GoalCard = ({ goal }) => (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      border: `1px solid ${goal.status === 'on-track' ? '#C4D600' : goal.status === 'behind' ? '#ff6b6b' : 'rgba(255, 255, 255, 0.1)'}`,
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#ffffff', fontSize: '18px' }}>
            {goal.title}
          </h3>
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Target: {goal.target} {goal.unit} by {new Date(goal.deadline).toLocaleDateString()}
          </div>
        </div>
        <div style={{
          background: goal.status === 'on-track' ? 'rgba(196, 214, 0, 0.2)' : 'rgba(255, 107, 107, 0.2)',
          color: goal.status === 'on-track' ? '#C4D600' : '#ff6b6b',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'uppercase'
        }}>
          {goal.status.replace('-', ' ')}
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '16px', color: '#C4D600', fontWeight: '600' }}>
            {goal.current} / {goal.target} {goal.unit}
          </span>
          <span style={{ fontSize: '14px', color: '#ffffff' }}>
            {goal.progress}%
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
            width: `${goal.progress}%`,
            height: '100%',
            background: goal.status === 'on-track' ? '#C4D600' : '#ff6b6b',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
        {goal.target - goal.current > 0 ? 
          `${(goal.target - goal.current).toFixed(1)} ${goal.unit} remaining` :
          'Goal achieved! 🎉'
        }
      </div>
    </div>
  );

  const AchievementBadge = ({ achievement }) => (
    <div style={{
      background: achievement.rarity === 'epic' ? 'linear-gradient(135deg, #ffd700, #ffed4e)' :
                 achievement.rarity === 'rare' ? 'linear-gradient(135deg, #c39bd3, #d7bde2)' :
                 'linear-gradient(135deg, #aed6f1, #d5dbdb)',
      borderRadius: '16px',
      padding: '16px',
      textAlign: 'center',
      color: '#000',
      minWidth: '140px',
      margin: '8px'
    }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{achievement.icon}</div>
      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>
        {achievement.title}
      </h4>
      <p style={{ margin: '0 0 8px 0', fontSize: '12px', opacity: 0.8 }}>
        {achievement.description}
      </p>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '600' }}>
        {achievement.rarity}
      </div>
    </div>
  );

  const ProgressComparison = ({ data, title, unit }) => (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '16px'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#ffffff' }}>{title}</h3>
      {data.map((item, index) => (
        <div key={index} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: index < data.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
        }}>
          <span style={{ color: '#ffffff', fontSize: '14px' }}>{item.exercise || item.activity}</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#C4D600', fontWeight: '600', fontSize: '16px' }}>
              {item.current} {unit}
            </div>
            <div style={{ 
              color: item.improvement.startsWith('+') || item.improvement.startsWith('-') && item.improvement.includes('-') ? '#00ff88' : '#00ff88',
              fontSize: '12px'
            }}>
              {item.improvement}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!analyticsData) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
        <p>Loading your analytics...</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          margin: '0 0 16px 0',
          background: 'linear-gradient(135deg, #ffffff, #C4D600)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Comprehensive Progress Analytics
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'rgba(255, 255, 255, 0.7)',
          margin: 0
        }}>
          Track your fitness journey with detailed insights and progress metrics
        </p>
      </div>

      {/* Time Range & Metric Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['week', 'month', '3months', 'year'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                background: timeRange === range ? '#C4D600' : 'rgba(255, 255, 255, 0.1)',
                color: timeRange === range ? '#000' : '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {range === '3months' ? '3 Months' : range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['overview', 'workouts', 'health', 'goals'].map(metric => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              style={{
                background: selectedMetric === metric ? '#C4D600' : 'rgba(255, 255, 255, 0.1)',
                color: selectedMetric === metric ? '#000' : '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metrics */}
      {selectedMetric === 'overview' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <MetricCard
              title="Total Sessions"
              value={analyticsData.overview.totalSessions}
              change={analyticsData.overview.improvements.sessions}
              icon="🏋️‍♂️"
            />
            <MetricCard
              title="Total Minutes"
              value={`${Math.floor(analyticsData.overview.totalMinutes / 60)}h ${analyticsData.overview.totalMinutes % 60}m`}
              change={analyticsData.overview.improvements.minutes}
              icon="⏱️"
            />
            <MetricCard
              title="Calories Burned"
              value={analyticsData.overview.caloriesBurned.toLocaleString()}
              change={analyticsData.overview.improvements.calories}
              icon="🔥"
            />
            <MetricCard
              title="Consistency Score"
              value={`${analyticsData.overview.consistencyScore}%`}
              change={analyticsData.overview.improvements.consistency}
              icon="📈"
            />
          </div>

          {/* Weekly Activity Chart */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '32px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#ffffff' }}>Weekly Activity Overview</h2>
            <Chart data={analyticsData.workouts.weeklyData} type="bar" height={250} />
          </div>
        </div>
      )}

      {/* Workout Analytics */}
      {selectedMetric === 'workouts' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Workout Types Distribution */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#ffffff' }}>Workout Types</h3>
              <Chart data={analyticsData.workouts.workoutTypes} type="pie" height={200} />
            </div>

            {/* Intensity Distribution */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#ffffff' }}>Intensity Distribution</h3>
              <div style={{ padding: '20px' }}>
                {Object.entries(analyticsData.workouts.intensityDistribution).map(([intensity, percentage]) => (
                  <div key={intensity} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#ffffff', textTransform: 'capitalize' }}>{intensity} Intensity</span>
                      <span style={{ color: '#C4D600' }}>{percentage}%</span>
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
                        background: intensity === 'high' ? '#ff6b6b' : intensity === 'medium' ? '#ffa726' : '#C4D600',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Comparisons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px'
          }}>
            <ProgressComparison 
              data={analyticsData.progress.strengthProgress}
              title="Strength Progress"
              unit=""
            />
            <ProgressComparison 
              data={analyticsData.progress.enduranceProgress}
              title="Endurance Progress"
              unit=""
            />
          </div>
        </div>
      )}

      {/* Health Analytics */}
      {selectedMetric === 'health' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <MetricCard
              title="Health Score"
              value={`${analyticsData.health.healthScore}/100`}
              icon="💚"
              color="#00ff88"
            />
            <MetricCard
              title="Resting HR"
              value={`${analyticsData.health.vitals.restingHeartRate} BPM`}
              icon="❤️"
              color="#ff6b6b"
            />
            <MetricCard
              title="Avg Sleep"
              value={`${analyticsData.health.vitals.avgSleepHours}h`}
              icon="😴"
              color="#4ecdc4"
            />
            <MetricCard
              title="Daily Steps"
              value={analyticsData.health.vitals.avgSteps.toLocaleString()}
              icon="👟"
              color="#ffa726"
            />
          </div>

          {/* Health Trends */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#ffffff' }}>Health Trends</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {Object.entries(analyticsData.health.trends).map(([metric, [value, direction]]) => (
                <div key={metric} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '16px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    color: '#ffffff',
                    textTransform: 'capitalize',
                    fontSize: '16px'
                  }}>
                    {metric === 'bodyFat' ? 'Body Fat' : metric}
                  </h4>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      fontSize: '24px',
                      color: direction === 'up' ? '#00ff88' : '#C4D600'
                    }}>
                      {direction === 'up' ? '↗️' : '↘️'}
                    </span>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: direction === 'up' && (metric === 'weight' || metric === 'bodyFat') ? '#00ff88' : '#C4D600'
                    }}>
                      {Math.abs(value)}{metric.includes('weight') || metric.includes('Fat') ? ' lbs' : metric === 'stamina' ? '%' : ' lbs'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Goals & Achievements */}
      {selectedMetric === 'goals' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '32px'
          }}>
            {/* Goals */}
            <div>
              <h2 style={{ margin: '0 0 24px 0', color: '#ffffff', fontSize: '24px' }}>
                Current Goals
              </h2>
              {goals.map(goal => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>

            {/* Achievements */}
            <div>
              <h2 style={{ margin: '0 0 24px 0', color: '#ffffff', fontSize: '24px' }}>
                Recent Achievements
              </h2>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                {achievements.map(achievement => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveAnalytics;