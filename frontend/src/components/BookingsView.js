import React, { useState, useEffect } from 'react';
import { TactileButton, FloatingMascot } from '../DelightfulAnimations';
import { AnimatedCard } from '../DelightfulComponents';
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

  const BookingCard = ({ booking }) => (
    <AnimatedCard className="glass-card" style={{
      padding: 'var(--space-lg)',
      marginBottom: 'var(--space-md)',
      border: `1px solid var(--accent-primary)`
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
            objectFit: 'cover'
          }}
        />
        
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: 0
          }}>
            {booking.trainerName}
          </h3>
          
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            marginBottom: 'var(--space-xs)'
          }}>
            {booking.sessionType} • {booking.duration} minutes
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
    </AnimatedCard>
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
        background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '10px',
          color: 'white'
        }}>
          📅 My Bookings
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: '16px'
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
              📅
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '10px'
            }}>
              No {activeTab} bookings
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              No bookings found for this category.
            </p>
          </AnimatedCard>
        )}
      </div>

      {/* Floating Mascot */}
      {showMascot && (
        <FloatingMascot
          emotion="encouraging"
          message="Stay consistent with your training sessions!"
          onDismiss={() => setShowMascot(false)}
        />
      )}

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }} />
    </div>
  );
};

export default BookingsView;