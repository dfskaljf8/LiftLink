import React, { useState, useEffect } from 'react';
import { TactileButton, FloatingMascot } from './DelightfulAnimations';
import { AnimatedCard } from './DelightfulComponents';
import '../styles/ProfessionalDesign.css';

const BookingsView = ({ userProfile }) => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showMascot, setShowMascot] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    // Mock bookings data
    const mockBookings = [
      {
        id: 1,
        trainerId: 1,
        trainerName: 'Sarah Chen',
        trainerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        sessionType: 'Weight Loss',
        date: '2025-01-20',
        time: '09:00',
        duration: 60,
        price: 75,
        status: 'upcoming',
        location: 'Manhattan Fitness Center',
        notes: 'Focus on cardio and strength training',
        paymentStatus: 'paid',
        canCancel: true,
        canReschedule: true
      },
      {
        id: 2,
        trainerId: 2,
        trainerName: 'Marcus Torres',
        trainerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        sessionType: 'HIIT',
        date: '2025-01-22',
        time: '18:00',
        duration: 45,
        price: 85,
        status: 'upcoming',
        location: 'Brooklyn CrossFit',
        notes: 'High intensity interval training session',
        paymentStatus: 'paid',
        canCancel: true,
        canReschedule: true
      },
      {
        id: 3,
        trainerId: 3,
        trainerName: 'Emma Rodriguez',
        trainerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b190?w=150&h=150&fit=crop&crop=face',
        sessionType: 'Yoga',
        date: '2025-01-15',
        time: '10:00',
        duration: 75,
        price: 65,
        status: 'completed',
        location: 'Queens Wellness Studio',
        notes: 'Relaxing yoga session - completed successfully',
        paymentStatus: 'paid',
        canCancel: false,
        canReschedule: false,
        rating: 5,
        feedback: 'Amazing session! Emma is incredibly knowledgeable and helped me improve my flexibility.'
      },
      {
        id: 4,
        trainerId: 4,
        trainerName: 'David Kim',
        trainerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        sessionType: 'Strength Training',
        date: '2025-01-10',
        time: '07:00',
        duration: 60,
        price: 90,
        status: 'completed',
        location: 'Manhattan Powerlifting Gym',
        notes: 'Deadlift and squat form training',
        paymentStatus: 'paid',
        canCancel: false,
        canReschedule: false,
        rating: 5,
        feedback: 'David helped me perfect my deadlift form. Excellent technical guidance!'
      },
      {
        id: 5,
        trainerId: 1,
        trainerName: 'Sarah Chen',
        trainerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        sessionType: 'Strength Training',
        date: '2025-01-05',
        time: '14:00',
        duration: 60,
        price: 75,
        status: 'cancelled',
        location: 'Manhattan Fitness Center',
        notes: 'Cancelled due to trainer illness',
        paymentStatus: 'refunded',
        canCancel: false,
        canReschedule: false,
        cancellationReason: 'Trainer illness'
      }
    ];

    setBookings(mockBookings);
  };

  const getFilteredBookings = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (activeTab) {
      case 'upcoming':
        return bookings.filter(booking => {
          const bookingDate = new Date(booking.date);
          return booking.status === 'upcoming' && bookingDate >= today;
        });
      case 'past':
        return bookings.filter(booking => 
          booking.status === 'completed' || 
          (booking.status === 'upcoming' && new Date(booking.date) < today)
        );
      case 'cancelled':
        return bookings.filter(booking => booking.status === 'cancelled');
      default:
        return bookings;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'var(--accent-primary)';
      case 'completed': return 'var(--success)';
      case 'cancelled': return 'var(--error)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return '📅';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleRescheduleBooking = (booking) => {
    setSelectedBooking(booking);
    setShowRescheduleModal(true);
  };

  const confirmCancelBooking = () => {
    setBookings(prev => prev.map(booking => 
      booking.id === selectedBooking.id 
        ? { ...booking, status: 'cancelled', cancellationReason: 'Cancelled by user' }
        : booking
    ));
    setShowCancelModal(false);
    setSelectedBooking(null);
  };

  const BookingCard = ({ booking }) => (
    <AnimatedCard className="glass-card" style={{
      padding: 'var(--space-lg)',
      marginBottom: 'var(--space-md)',
      border: `1px solid ${getStatusColor(booking.status)}30`
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-md)'
      }}>
        <img
          src={booking.trainerAvatar}
          alt={booking.trainerName}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: `3px solid ${getStatusColor(booking.status)}`
          }}
        />
        
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            marginBottom: 'var(--space-xs)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              margin: 0
            }}>
              {booking.trainerName}
            </h3>
            <span style={{
              background: getStatusColor(booking.status),
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {getStatusIcon(booking.status)} {booking.status}
            </span>
          </div>
          
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            marginBottom: 'var(--space-xs)'
          }}>
            {booking.sessionType} • {booking.duration} minutes
          </div>
          
          <div style={{
            color: 'var(--text-muted)',
            fontSize: '12px'
          }}>
            📍 {booking.location}
          </div>
        </div>
        
        <div style={{
          textAlign: 'right'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '600',
            color: 'var(--accent-primary)',
            marginBottom: 'var(--space-xs)'
          }}>
            ${booking.price}
          </div>
          <div style={{
            fontSize: '12px',
            color: booking.paymentStatus === 'paid' ? 'var(--success)' : 'var(--warning)'
          }}>
            {booking.paymentStatus === 'paid' ? '✅ Paid' : 
             booking.paymentStatus === 'refunded' ? '🔄 Refunded' : '⏳ Pending'}
          </div>
        </div>
      </div>
      
      {/* Date and Time */}
      <div style={{
        background: 'var(--card-bg)',
        padding: 'var(--space-md)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--space-md)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-md)'
        }}>
          <div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: 'var(--space-xs)'
            }}>
              Date
            </div>
            <div style={{ fontWeight: '500' }}>
              {formatDate(booking.date)}
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: 'var(--space-xs)'
            }}>
              Time
            </div>
            <div style={{ fontWeight: '500' }}>
              {formatTime(booking.time)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Notes */}
      {booking.notes && (
        <div style={{
          marginBottom: 'var(--space-md)'
        }}>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-xs)'
          }}>
            Notes
          </div>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            lineHeight: '1.4',
            margin: 0
          }}>
            {booking.notes}
          </p>
        </div>
      )}
      
      {/* Feedback for completed sessions */}
      {booking.status === 'completed' && booking.feedback && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md)',
          marginBottom: 'var(--space-md)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            marginBottom: 'var(--space-sm)'
          }}>
            <span style={{ fontSize: '16px' }}>⭐</span>
            <span style={{ fontWeight: '600' }}>Your Rating: {booking.rating}/5</span>
          </div>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            lineHeight: '1.4',
            margin: 0
          }}>
            "{booking.feedback}"
          </p>
        </div>
      )}
      
      {/* Cancellation reason */}
      {booking.status === 'cancelled' && booking.cancellationReason && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md)',
          marginBottom: 'var(--space-md)'
        }}>
          <div style={{
            fontSize: '12px',
            color: 'var(--error)',
            fontWeight: '600',
            marginBottom: 'var(--space-xs)'
          }}>
            Cancellation Reason
          </div>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            {booking.cancellationReason}
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      {booking.status === 'upcoming' && (
        <div style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          marginTop: 'var(--space-md)'
        }}>
          {booking.canReschedule && (
            <TactileButton
              variant="secondary"
              size="small"
              onClick={() => handleRescheduleBooking(booking)}
              style={{ flex: 1 }}
            >
              📅 Reschedule
            </TactileButton>
          )}
          {booking.canCancel && (
            <TactileButton
              variant="secondary"
              size="small"
              onClick={() => handleCancelBooking(booking)}
              style={{ 
                flex: 1,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'var(--error)',
                color: 'var(--error)'
              }}
            >
              ❌ Cancel
            </TactileButton>
          )}
          <TactileButton
            variant="primary"
            size="small"
            style={{ flex: 1 }}
          >
            💬 Message Trainer
          </TactileButton>
        </div>
      )}
      
      {booking.status === 'completed' && !booking.rating && (
        <div style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          marginTop: 'var(--space-md)'
        }}>
          <TactileButton
            variant="primary"
            size="small"
            style={{ flex: 1 }}
          >
            ⭐ Rate Session
          </TactileButton>
          <TactileButton
            variant="secondary"
            size="small"
            style={{ flex: 1 }}
          >
            🔄 Book Again
          </TactileButton>
        </div>
      )}
    </AnimatedCard>
  );

  const CancelModal = () => (
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
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>
          ⚠️
        </div>
        
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '10px'
        }}>
          Cancel Booking?
        </h2>
        
        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: '20px',
          lineHeight: '1.5'
        }}>
          Are you sure you want to cancel your session with {selectedBooking?.trainerName}? 
          This action cannot be undone.
        </p>
        
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '20px'
        }}>
          <TactileButton
            variant="secondary"
            onClick={() => setShowCancelModal(false)}
            style={{ flex: 1 }}
          >
            Keep Booking
          </TactileButton>
          <TactileButton
            variant="primary"
            onClick={confirmCancelBooking}
            style={{ 
              flex: 1,
              backgroundColor: 'var(--error)'
            }}
          >
            Cancel Booking
          </TactileButton>
        </div>
      </AnimatedCard>
    </div>
  );

  const filteredBookings = getFilteredBookings();

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', icon: '📅' },
    { id: 'past', label: 'Past', icon: '✅' },
    { id: 'cancelled', label: 'Cancelled', icon: '❌' }
  ];

  return (
    <div className="bookings-view">
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
          background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="bookings" width="40" height="40" patternUnits="userSpaceOnUse"%3E%3Ctext x="20" y="20" text-anchor="middle" dominant-baseline="middle" fill="rgba(255,255,255,0.1)" font-size="16"%3E📅%3C/text%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23bookings)"/%3E%3C/svg%3E")',
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
          📅 My Bookings
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '16px',
          position: 'relative'
        }}>
          Manage your training sessions
        </p>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '25px',
          overflowX: 'auto',
          padding: '5px 0'
        }}>
          {tabs.map((tab) => (
            <TactileButton
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.id)}
              style={{
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span style={{
                background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {getFilteredBookings().length}
              </span>
            </TactileButton>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        ) : (
          <AnimatedCard className="glass-card" style={{
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>
              {activeTab === 'upcoming' ? '📅' : 
               activeTab === 'past' ? '✅' : '❌'}
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '10px'
            }}>
              No {activeTab} bookings
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {activeTab === 'upcoming' ? 
                "You don't have any upcoming sessions. Book a trainer to get started!" :
                activeTab === 'past' ?
                "No completed sessions yet. Your fitness journey is just beginning!" :
                "No cancelled bookings. Great job staying committed!"}
            </p>
            {activeTab === 'upcoming' && (
              <TactileButton variant="primary">
                🔍 Find a Trainer
              </TactileButton>
            )}
          </AnimatedCard>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && <CancelModal />}

      {/* Floating Mascot */}
      {showMascot && activeTab === 'upcoming' && (
        <FloatingMascot
          emotion="encouraging"
          message="Stay consistent with your training sessions! Your future self will thank you! 💪"
          onDismiss={() => setShowMascot(false)}
        />
      )}

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }} />
    </div>
  );
};

export default BookingsView;