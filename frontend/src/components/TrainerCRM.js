import React, { useState, useEffect } from 'react';
import { AnimatedDumbbell, AnimatedCoin, AnimatedStar, AnimatedCheckmark, AnimatedChart } from './AnimatedSVGs';

// Main Trainer CRM Dashboard Component
const TrainerCRM = ({ userProfile }) => {
  const [activeView, setActiveView] = useState('overview');
  const [crmData, setCrmData] = useState({
    overview: null,
    clients: [],
    analytics: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    loadCrmData();
  }, [activeView]);

  const loadCrmData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = userProfile?.token || 'demo_trainer';
      
      let endpoint = '';
      switch (activeView) {
        case 'overview':
          endpoint = '/api/trainer/crm/overview';
          break;
        case 'clients':
          endpoint = '/api/trainer/crm/clients';
          break;
        case 'analytics':
          endpoint = '/api/trainer/crm/analytics';
          break;
        case 'ai-assistant':
          // No API call needed for AI assistant
          setLoading(false);
          return;
        default:
          endpoint = '/api/trainer/crm/overview';
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load CRM data');
      }

      const data = await response.json();
      
      setCrmData(prev => ({
        ...prev,
        [activeView]: data
      }));
      
    } catch (err) {
      setError(err.message);
      console.error('CRM data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const crmViews = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'clients', label: 'Clients', icon: '👥' },
    { key: 'analytics', label: 'Analytics', icon: '📈' },
    { key: 'ai-assistant', label: 'AI Assistant', icon: '🤖' }
  ];

  return (
    <div style={{
      padding: 'var(--space-lg)',
      paddingTop: '80px',
      minHeight: '100vh',
      background: 'var(--bg-primary)'
    }}>
      {/* CRM Header */}
      <div style={{
        marginBottom: 'var(--space-xl)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-lg)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AnimatedDumbbell size={24} color="black" />
          </div>
          
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: 0,
              marginBottom: '4px'
            }}>
              Trainer CRM Dashboard
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              margin: 0,
              fontSize: '14px'
            }}>
              Manage your clients and grow your fitness business
            </p>
          </div>
        </div>

        {/* CRM Navigation */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-lg)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-sm)'
        }}>
          {crmViews.map((view) => (
            <button
              key={view.key}
              onClick={() => setActiveView(view.key)}
              className={activeView === view.key ? 'btn-primary' : 'btn-secondary'}
              style={{
                padding: 'var(--space-md) var(--space-lg)',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                whiteSpace: 'nowrap',
                minWidth: 'auto'
              }}
            >
              <span>{view.icon}</span>
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: 'rgba(255, 68, 68, 0.1)',
          border: '1px solid rgba(255, 68, 68, 0.3)',
          borderRadius: 'var(--border-radius)',
          padding: 'var(--space-lg)',
          marginBottom: 'var(--space-lg)',
          color: '#FF4444'
        }}>
          <p style={{ margin: 0 }}>⚠️ {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-2xl)',
          textAlign: 'center'
        }}>
          <AnimatedDumbbell size={48} color="#C4D600" />
          <p style={{
            marginTop: 'var(--space-lg)',
            color: 'var(--text-secondary)'
          }}>
            Loading CRM data...
          </p>
        </div>
      )}

      {/* CRM Content */}
      {!loading && (
        <>
          {activeView === 'overview' && (
            <OverviewDashboard data={crmData.overview} />
          )}
          
          {activeView === 'clients' && (
            <ClientsManagement data={crmData.clients} onRefresh={loadCrmData} />
          )}
          
          {activeView === 'analytics' && (
            <AnalyticsDashboard data={crmData.analytics} />
          )}

          {activeView === 'ai-assistant' && (
            <AIAssistantDashboard userProfile={userProfile} />
          )}
        </>
      )}
    </div>
  );
};

// AI Assistant Dashboard Component
const AIAssistantDashboard = ({ userProfile }) => {
  return (
    <div>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(196, 214, 0, 0.3)',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #C4D600, #B2FF66)',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '24px' }}>🤖</span>
          </div>
          <div>
            <h2 style={{ 
              margin: '0 0 4px 0', 
              color: '#ffffff', 
              fontSize: '24px',
              fontWeight: '700'
            }}>
              AI Business Assistant
            </h2>
            <p style={{ 
              margin: 0, 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px'
            }}>
              Get AI-powered insights for your training business
            </p>
          </div>
        </div>
        
        {/* AI Chat Interface */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid rgba(196, 214, 0, 0.2)',
          height: '600px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <iframe 
            src="https://app.relevanceai.com/agents/bcbe5a/9ca4a28df27a-44f4-8786-dd1756011081/8d932862-d19b-446a-80f7-387a5090d8a3/share?hide_tool_steps=false&hide_file_uploads=false&hide_conversation_list=false&bubble_style=agent&primary_color=%23685FFF&bubble_icon=pd%2Fchat&input_placeholder_text=Type+your+message...&hide_logo=false&hide_description=false" 
            width="100%" 
            height="100%" 
            frameBorder="0"
            style={{
              borderRadius: '12px',
              background: 'transparent'
            }}
            title="LiftLink AI Business Assistant"
          />
        </div>
        
        {/* AI Business Features Info */}
        <div style={{
          marginTop: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            background: 'rgba(196, 214, 0, 0.1)',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>💼</div>
            <h4 style={{ margin: '0 0 4px 0', color: '#C4D600', fontSize: '14px' }}>
              Business Insights
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Revenue optimization and growth strategies
            </p>
          </div>
          
          <div style={{
            background: 'rgba(196, 214, 0, 0.1)',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>👥</div>
            <h4 style={{ margin: '0 0 4px 0', color: '#C4D600', fontSize: '14px' }}>
              Client Management
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Smart client engagement recommendations
            </p>
          </div>
          
          <div style={{
            background: 'rgba(196, 214, 0, 0.1)',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>📈</div>
            <h4 style={{ margin: '0 0 4px 0', color: '#C4D600', fontSize: '14px' }}>
              Performance Analysis
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Data-driven business performance insights
            </p>
          </div>
          
          <div style={{
            background: 'rgba(196, 214, 0, 0.1)',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>🎯</div>
            <h4 style={{ margin: '0 0 4px 0', color: '#C4D600', fontSize: '14px' }}>
              Marketing Support
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              AI-generated marketing content and strategies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Overview Dashboard Component
const OverviewDashboard = ({ data }) => {
  if (!data) return null;

  const { overview, recent_activity, upcoming_sessions } = data;

  return (
    <div>
      {/* Key Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-xl)'
      }}>
        <MetricCard
          title="Total Bookings"
          value={overview.total_bookings}
          change={overview.booking_growth}
          icon="📅"
          color="#C4D600"
        />
        
        <MetricCard
          title="This Month"
          value={overview.this_month_bookings}
          subtitle="bookings"
          icon="📊"
          color="#B2FF66"
        />
        
        <MetricCard
          title="Total Revenue"
          value={`$${overview.total_revenue?.toFixed(2) || '0.00'}`}
          subtitle="earned"
          icon="💰"
          color="#FFD700"
        />
        
        <MetricCard
          title="Active Clients"
          value={overview.total_clients}
          subtitle="clients"
          icon="👥"
          color="#00D4AA"
        />
      </div>

      {/* Recent Activity & Upcoming Sessions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: 'var(--space-lg)'
      }}>
        {/* Recent Activity */}
        <div className="glass-card" style={{
          padding: 'var(--space-lg)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)'
          }}>
            📋 Recent Activity
          </h3>
          
          {recent_activity && recent_activity.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)'
            }}>
              {recent_activity.slice(0, 5).map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          ) : (
            <EmptyState message="No recent activity" />
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="glass-card" style={{
          padding: 'var(--space-lg)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)'
          }}>
            ⏰ Upcoming Sessions
          </h3>
          
          {upcoming_sessions && upcoming_sessions.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)'
            }}>
              {upcoming_sessions.slice(0, 5).map((session, index) => (
                <SessionItem key={index} session={session} />
              ))}
            </div>
          ) : (
            <EmptyState message="No upcoming sessions" />
          )}
        </div>
      </div>
    </div>
  );
};

// Clients Management Component
const ClientsManagement = ({ data, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  if (!data) return null;

  const { clients, pagination } = data;
  const filteredClients = clients?.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div>
      {/* Client Search */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-lg)',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-md)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--border-radius)',
              background: 'var(--glass-bg)',
              color: 'var(--text-primary)',
              fontSize: '16px'
            }}
          />
        </div>
        
        <button
          onClick={onRefresh}
          className="btn-secondary"
          style={{
            padding: 'var(--space-md)',
            fontSize: '16px'
          }}
        >
          🔄
        </button>
      </div>

      {/* Client Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-lg)'
      }}>
        <StatCard
          label="Total Clients"
          value={clients?.length || 0}
          icon="👥"
        />
        
        <StatCard
          label="Active This Month"
          value={clients?.filter(c => c.last_booking_date && new Date(c.last_booking_date) > new Date(Date.now() - 30*24*60*60*1000)).length || 0}
          icon="✅"
        />
        
        <StatCard
          label="New Clients"
          value={clients?.filter(c => c.client_since && new Date(c.client_since) > new Date(Date.now() - 30*24*60*60*1000)).length || 0}
          icon="🆕"
        />
      </div>

      {/* Clients List */}
      <div className="glass-card" style={{
        padding: 'var(--space-lg)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: 'var(--space-lg)'
        }}>
          Your Clients ({filteredClients.length})
        </h3>
        
        {filteredClients.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--space-lg)'
          }}>
            {filteredClients.map((client, index) => (
              <ClientCard
                key={client.user_id || index}
                client={client}
                onClick={() => setSelectedClient(client)}
              />
            ))}
          </div>
        ) : (
          <EmptyState message="No clients found" />
        )}
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};

// Analytics Dashboard Component
const AnalyticsDashboard = ({ data }) => {
  const [timePeriod, setTimePeriod] = useState('month');

  if (!data) return null;

  const { revenue_trend, client_retention, popular_sessions } = data;

  return (
    <div>
      {/* Period Selector */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-sm)',
        marginBottom: 'var(--space-xl)'
      }}>
        {['week', 'month', 'quarter', 'year'].map((period) => (
          <button
            key={period}
            className={timePeriod === period ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setTimePeriod(period)}
            style={{
              padding: 'var(--space-sm) var(--space-md)',
              fontSize: '14px',
              textTransform: 'capitalize'
            }}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Analytics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: 'var(--space-lg)'
      }}>
        {/* Revenue Trend */}
        <div className="glass-card" style={{
          padding: 'var(--space-lg)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)'
          }}>
            📈 Revenue Trend
          </h3>
          
          {revenue_trend && revenue_trend.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)'
            }}>
              {revenue_trend.slice(-7).map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-sm)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--border-radius)'
                }}>
                  <span style={{ fontSize: '14px' }}>
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#C4D600'
                  }}>
                    ${item.revenue?.toFixed(2) || '0.00'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No revenue data available" />
          )}
        </div>

        {/* Client Retention */}
        <div className="glass-card" style={{
          padding: 'var(--space-lg)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)'
          }}>
            🔄 Client Retention
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-lg)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Repeat Clients</span>
              <span style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#C4D600'
              }}>
                {client_retention?.repeat_clients || 0}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Total Clients</span>
              <span style={{
                fontSize: '18px',
                fontWeight: '600'
              }}>
                {client_retention?.total_clients || 0}
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
                width: `${client_retention?.total_clients > 0 ? (client_retention.repeat_clients / client_retention.total_clients) * 100 : 0}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #C4D600, #B2FF66)'
              }} />
            </div>
          </div>
        </div>

        {/* Popular Sessions */}
        <div className="glass-card" style={{
          padding: 'var(--space-lg)',
          gridColumn: 'span 2'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)'
          }}>
            🔥 Popular Sessions
          </h3>
          
          {popular_sessions && popular_sessions.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-md)'
            }}>
              {popular_sessions.slice(0, 6).map((session, index) => (
                <div key={index} style={{
                  padding: 'var(--space-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--border-radius)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: 'var(--space-sm)'
                  }}>
                    {session._id || 'Unknown'}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-sm)'
                  }}>
                    {session.count} sessions
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#C4D600',
                    fontWeight: '600'
                  }}>
                    ${session.revenue?.toFixed(2) || '0.00'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No session data available" />
          )}
        </div>
      </div>
    </div>
  );
};

// Supporting Components

const MetricCard = ({ title, value, change, subtitle, icon, color }) => (
  <div className="glass-card" style={{
    padding: 'var(--space-lg)',
    textAlign: 'center'
  }}>
    <div style={{
      fontSize: '24px',
      marginBottom: 'var(--space-sm)'
    }}>
      {icon}
    </div>
    
    <div style={{
      fontSize: '24px',
      fontWeight: '700',
      color: color,
      marginBottom: 'var(--space-xs)'
    }}>
      {value}
    </div>
    
    <div style={{
      fontSize: '14px',
      color: 'var(--text-secondary)',
      marginBottom: 'var(--space-sm)'
    }}>
      {title}
    </div>
    
    {change !== undefined && (
      <div style={{
        fontSize: '12px',
        color: change >= 0 ? '#00D4AA' : '#FF4444'
      }}>
        {change >= 0 ? '↗' : '↘'} {Math.abs(change).toFixed(1)}%
      </div>
    )}
    
    {subtitle && (
      <div style={{
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }}>
        {subtitle}
      </div>
    )}
  </div>
);

const StatCard = ({ label, value, icon }) => (
  <div style={{
    padding: 'var(--space-md)',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 'var(--border-radius)',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '20px', marginBottom: 'var(--space-xs)' }}>
      {icon}
    </div>
    <div style={{
      fontSize: '18px',
      fontWeight: '600',
      color: '#C4D600',
      marginBottom: 'var(--space-xs)'
    }}>
      {value}
    </div>
    <div style={{
      fontSize: '12px',
      color: 'var(--text-secondary)'
    }}>
      {label}
    </div>
  </div>
);

const ActivityItem = ({ activity }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-md)',
    padding: 'var(--space-sm)',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 'var(--border-radius)'
  }}>
    <div style={{
      width: '32px',
      height: '32px',
      background: '#C4D600',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '600',
      color: 'black'
    }}>
      {activity.client_name?.charAt(0) || '?'}
    </div>
    
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '2px'
      }}>
        {activity.client_name || 'Unknown Client'}
      </div>
      <div style={{
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }}>
        {activity.status || 'Session'} • ${activity.amount || '0.00'}
      </div>
    </div>
    
    <div style={{
      fontSize: '12px',
      color: 'var(--text-secondary)'
    }}>
      {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'Today'}
    </div>
  </div>
);

const SessionItem = ({ session }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--space-sm)',
    background: 'rgba(196, 214, 0, 0.1)',
    borderRadius: 'var(--border-radius)',
    border: '1px solid rgba(196, 214, 0, 0.3)'
  }}>
    <div>
      <div style={{
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '2px'
      }}>
        {session.client_name || 'Unknown Client'}
      </div>
      <div style={{
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }}>
        {session.session_date ? new Date(session.session_date).toLocaleDateString() : 'TBD'}
      </div>
    </div>
    
    <div style={{
      fontSize: '12px',
      color: '#C4D600',
      fontWeight: '600'
    }}>
      ${session.amount || '0.00'}
    </div>
  </div>
);

const ClientCard = ({ client, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: 'var(--space-md)',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 'var(--border-radius)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.target.style.background = 'rgba(196, 214, 0, 0.1)';
      e.target.style.borderColor = 'rgba(196, 214, 0, 0.3)';
    }}
    onMouseLeave={(e) => {
      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }}
  >
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm)',
      marginBottom: 'var(--space-sm)'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        background: '#C4D600',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '600',
        color: 'black'
      }}>
        {client.name?.charAt(0) || '?'}
      </div>
      
      <div>
        <div style={{
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {client.name || 'Unknown Client'}
        </div>
        <div style={{
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          {client.email || 'No email'}
        </div>
      </div>
    </div>
    
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: 'var(--text-secondary)'
    }}>
      <span>{client.total_bookings || 0} sessions</span>
      <span>{client.completed_sessions || 0} completed</span>
    </div>
  </div>
);

const ClientDetailModal = ({ client, onClose }) => (
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
    zIndex: 1000,
    padding: 'var(--space-lg)'
  }}>
    <div style={{
      background: 'var(--glass-bg)',
      borderRadius: 'var(--border-radius)',
      padding: 'var(--space-xl)',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-lg)'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          margin: 0
        }}>
          Client Details
        </h3>
        
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)'
      }}>
        <div>
          <strong>Name:</strong> {client.name || 'Unknown'}
        </div>
        <div>
          <strong>Email:</strong> {client.email || 'Not provided'}
        </div>
        <div>
          <strong>Total Sessions:</strong> {client.total_bookings || 0}
        </div>
        <div>
          <strong>Completed Sessions:</strong> {client.completed_sessions || 0}
        </div>
        <div>
          <strong>Client Since:</strong> {client.client_since ? new Date(client.client_since).toLocaleDateString() : 'Unknown'}
        </div>
        <div>
          <strong>Last Booking:</strong> {client.last_booking_date ? new Date(client.last_booking_date).toLocaleDateString() : 'Never'}
        </div>
      </div>
    </div>
  </div>
);

const EmptyState = ({ message }) => (
  <div style={{
    textAlign: 'center',
    padding: 'var(--space-xl)',
    color: 'var(--text-secondary)'
  }}>
    <div style={{
      fontSize: '48px',
      marginBottom: 'var(--space-md)',
      opacity: 0.5
    }}>
      📭
    </div>
    <p style={{ margin: 0 }}>{message}</p>
  </div>
);

export default TrainerCRM;