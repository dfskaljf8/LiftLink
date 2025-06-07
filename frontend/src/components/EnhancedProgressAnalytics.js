import React, { useState, useEffect } from 'react';
import { AnimatedDumbbell, AnimatedStar, AnimatedCoin, AnimatedCheckmark } from './AnimatedSVGs';

// Enhanced Progress Analytics with Health Device Integration
const EnhancedProgressAnalytics = ({ userProfile }) => {
  const [progressData, setProgressData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week'); // week, month, year
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchProgressData();
  }, [selectedTimeframe]);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/progress/enhanced?timeframe=${selectedTimeframe}`, {
        headers: {
          'Authorization': `Bearer ${userProfile?.token || 'demo_user'}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewCards = () => {
    if (!progressData?.overview) return null;

    const cards = [
      {
        title: 'Total Sessions',
        value: progressData.overview.total_sessions,
        icon: '🏋️',
        color: '#C4D600',
        suffix: ' sessions'
      },
      {
        title: 'Hours Trained',
        value: progressData.overview.total_hours_trained,
        icon: '⏱️',
        color: '#06B6D4',
        suffix: ' hours'
      },
      {
        title: 'Avg Heart Rate',
        value: progressData.overview.average_heart_rate,
        icon: '❤️',
        color: '#EF4444',
        suffix: ' BPM'
      },
      {
        title: 'Calories Burned',
        value: progressData.overview.calories_burned.toLocaleString(),
        icon: '🔥',
        color: '#F59E0B',
        suffix: ' cal'
      },
      {
        title: 'Strength Gained',
        value: progressData.overview.strength_gained,
        icon: '💪',
        color: '#8B5CF6',
        suffix: '%'
      },
      {
        title: 'Endurance Improved',
        value: progressData.overview.endurance_improved,
        icon: '🏃',
        color: '#10B981',
        suffix: '%'
      }
    ];

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {cards.map((card, index) => (
          <div key={index} className="glass-card" style={{
            padding: '16px',
            textAlign: 'center',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${card.color}20, ${card.color}10)`
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              {card.icon}
            </div>
            <div style={{
              fontSize: '1.3em',
              fontWeight: '600',
              color: card.color,
              marginBottom: '4px'
            }}>
              {card.value}{card.suffix}
            </div>
            <div style={{
              fontSize: '0.8em',
              color: 'var(--text-secondary)'
            }}>
              {card.title}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWeeklyTrends = () => {
    if (!progressData?.weekly_trends) return null;

    const trends = [
      {
        title: 'Daily Steps',
        data: progressData.weekly_trends.steps,
        color: '#C4D600',
        icon: '👣',
        format: (val) => val.toLocaleString()
      },
      {
        title: 'Workouts',
        data: progressData.weekly_trends.workouts,
        color: '#06B6D4',
        icon: '🏋️',
        format: (val) => val
      },
      {
        title: 'Avg Heart Rate',
        data: progressData.weekly_trends.heart_rate_avg,
        color: '#EF4444',
        icon: '❤️',
        format: (val) => `${val} BPM`
      },
      {
        title: 'Sleep Hours',
        data: progressData.weekly_trends.sleep_hours,
        color: '#8B5CF6',
        icon: '😴',
        format: (val) => `${val}h`
      }
    ];

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '1.2em',
          fontWeight: '600',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📈 Weekly Trends
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {trends.map((trend, index) => (
            <div key={index} className="glass-card" style={{
              padding: '16px',
              borderRadius: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '18px' }}>{trend.icon}</span>
                  <span style={{
                    fontSize: '0.95em',
                    fontWeight: '500'
                  }}>
                    {trend.title}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.9em',
                  color: trend.color,
                  fontWeight: '600'
                }}>
                  {trend.format(trend.data[trend.data.length - 1])}
                </span>
              </div>
              
              {/* Simple bar chart */}
              <div style={{
                display: 'flex',
                alignItems: 'end',
                gap: '4px',
                height: '60px'
              }}>
                {trend.data.map((value, i) => {
                  const maxValue = Math.max(...trend.data);
                  const height = (value / maxValue) * 50 + 10;
                  
                  return (
                    <div key={i} style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <div style={{
                        width: '100%',
                        height: `${height}px`,
                        background: `linear-gradient(to top, ${trend.color}, ${trend.color}80)`,
                        borderRadius: '2px',
                        transition: 'height 0.3s ease'
                      }} />
                      <div style={{
                        fontSize: '0.7em',
                        color: 'var(--text-secondary)'
                      }}>
                        {days[i]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDeviceContributions = () => {
    if (!progressData?.device_contributions) return null;

    const devices = Object.entries(progressData.device_contributions).map(([device, data]) => ({
      name: device.replace('_', ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      ...data,
      icon: device === 'apple_watch' ? '⌚' : device === 'fitbit' ? '📱' : '✏️'
    }));

    const totalDataPoints = devices.reduce((sum, device) => sum + device.data_points, 0);

    return (
      <div className="glass-card" style={{
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <h3 style={{
          fontSize: '1.2em',
          fontWeight: '600',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🔗 Connected Device Activity
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {devices.map((device, index) => {
            const percentage = ((device.data_points / totalDataPoints) * 100).toFixed(1);
            
            return (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flex: 1
                }}>
                  <span style={{ fontSize: '20px' }}>{device.icon}</span>
                  <div>
                    <div style={{
                      fontSize: '0.95em',
                      fontWeight: '500'
                    }}>
                      {device.name}
                    </div>
                    <div style={{
                      fontSize: '0.8em',
                      color: 'var(--text-secondary)'
                    }}>
                      {device.sessions} sessions • {device.data_points.toLocaleString()} data points
                    </div>
                  </div>
                </div>
                
                <div style={{
                  minWidth: '60px',
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '0.9em',
                    fontWeight: '600',
                    color: '#C4D600'
                  }}>
                    {percentage}%
                  </div>
                  
                  <div style={{
                    width: '50px',
                    height: '4px',
                    background: 'rgba(196, 214, 0, 0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginTop: '4px'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #C4D600, #B2FF66)',
                      borderRadius: '2px'
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAchievements = () => {
    if (!progressData?.achievements) return null;

    return (
      <div className="glass-card" style={{
        padding: '20px',
        borderRadius: '12px'
      }}>
        <h3 style={{
          fontSize: '1.2em',
          fontWeight: '600',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🏆 Recent Achievements
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {progressData.achievements.map((achievement, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: 'rgba(196, 214, 0, 0.1)',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '24px',
                width: '40px',
                textAlign: 'center'
              }}>
                {achievement.icon}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.95em',
                  fontWeight: '500',
                  marginBottom: '2px'
                }}>
                  {achievement.title}
                </div>
                <div style={{
                  fontSize: '0.8em',
                  color: 'var(--text-secondary)',
                  marginBottom: '4px'
                }}>
                  {achievement.description}
                </div>
                <div style={{
                  fontSize: '0.75em',
                  color: '#C4D600'
                }}>
                  {new Date(achievement.date).toLocaleDateString()} • {achievement.source}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
      }}>
        <AnimatedDumbbell size={40} color="#C4D600" />
      </div>
    );
  }

  return (
    <div className="mobile-scroll-container" style={{
      width: '100%',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '1.5em',
          fontWeight: '600',
          marginBottom: '8px',
          color: 'var(--text-primary)'
        }}>
          Enhanced Progress Analytics
        </h1>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95em'
        }}>
          Comprehensive insights from your wearables and training sessions
        </p>
      </div>

      {/* Timeframe Selector */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        background: 'rgba(196, 214, 0, 0.1)',
        borderRadius: '12px',
        padding: '4px'
      }}>
        {['week', 'month', 'year'].map((timeframe) => (
          <button
            key={timeframe}
            onClick={() => setSelectedTimeframe(timeframe)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.9em',
              fontWeight: '500',
              cursor: 'pointer',
              background: selectedTimeframe === timeframe 
                ? 'linear-gradient(135deg, #C4D600, #B2FF66)'
                : 'transparent',
              color: selectedTimeframe === timeframe ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      {renderOverviewCards()}

      {/* Weekly Trends */}
      {renderWeeklyTrends()}

      {/* Device Contributions */}
      {renderDeviceContributions()}

      {/* Recent Achievements */}
      {renderAchievements()}
    </div>
  );
};

export default EnhancedProgressAnalytics;