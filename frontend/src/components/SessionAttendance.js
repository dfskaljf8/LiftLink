import React, { useState, useEffect } from 'react';
import { AnimatedCheckmark, AnimatedCoin, AnimatedStar } from './AnimatedSVGs';

// Session Attendance Certification Component
const SessionAttendance = ({ userProfile, sessionId, trainerId, traineId }) => {
  const [attendanceStatus, setAttendanceStatus] = useState('pending'); // pending, checked_in, completed, certified
  const [location, setLocation] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [checkinTime, setCheckinTime] = useState(null);
  const [checkoutTime, setCheckoutTime] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
      getCurrentLocation();
    }
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${userProfile?.token || 'demo_user'}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSessionData(data);
        setAttendanceStatus(data.attendance_status || 'pending');
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          setLocationError('Location access required for attendance verification');
          console.error('Location error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setLocationError('Geolocation not supported by this browser');
    }
  };

  const checkIn = async () => {
    if (!location) {
      setLocationError('Please enable location access to check in');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userProfile?.token || 'demo_user'}`
        },
        body: JSON.stringify({
          location: location,
          timestamp: new Date().toISOString(),
          user_id: userProfile?.user_id || 'demo_user_1'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceStatus('checked_in');
        setCheckinTime(new Date());
        
        // Show success feedback
        setTimeout(() => {
          // Could trigger a success animation or notification
        }, 500);
      } else {
        const errorData = await response.json();
        setLocationError(errorData.detail || 'Check-in failed. Please try again.');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setLocationError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkOut = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userProfile?.token || 'demo_user'}`
        },
        body: JSON.stringify({
          location: location,
          timestamp: new Date().toISOString(),
          user_id: userProfile?.user_id || 'demo_user_1'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceStatus('completed');
        setCheckoutTime(new Date());
        
        // Generate certificate after successful checkout
        await generateCertificate();
      } else {
        const errorData = await response.json();
        setLocationError(errorData.detail || 'Check-out failed. Please try again.');
      }
    } catch (error) {
      console.error('Check-out error:', error);
      setLocationError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userProfile?.token || 'demo_user'}`
        },
        body: JSON.stringify({
          checkin_time: checkinTime,
          checkout_time: checkoutTime,
          session_duration: calculateDuration()
        })
      });

      if (response.ok) {
        const certData = await response.json();
        setCertificate(certData);
        setAttendanceStatus('certified');
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
    }
  };

  const calculateDuration = () => {
    if (checkinTime && checkoutTime) {
      const duration = Math.abs(checkoutTime - checkinTime) / (1000 * 60); // minutes
      return Math.round(duration);
    }
    return 0;
  };

  const renderPendingState = () => (
    <div className="glass-card" style={{
      padding: '24px',
      textAlign: 'center',
      borderRadius: '12px'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        fontSize: '28px'
      }}>
        📍
      </div>
      
      <h2 style={{
        fontSize: '1.3em',
        fontWeight: '600',
        marginBottom: '8px'
      }}>
        Ready to Check In
      </h2>
      
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: '20px',
        lineHeight: '1.4'
      }}>
        Verify your attendance at this training session. Make sure you're at the correct location.
      </p>

      {sessionData && (
        <div style={{
          background: 'rgba(196, 214, 0, 0.1)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Session Details
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Trainer:</strong> {sessionData.trainer_name}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Date:</strong> {new Date(sessionData.date).toLocaleDateString()}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Time:</strong> {sessionData.start_time} - {sessionData.end_time}
          </div>
          <div>
            <strong>Location:</strong> {sessionData.location_name}
          </div>
        </div>
      )}

      {locationError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          color: '#EF4444',
          fontSize: '0.9em'
        }}>
          {locationError}
        </div>
      )}

      <button
        className="btn-primary mobile-button"
        onClick={checkIn}
        disabled={loading || !location}
        style={{
          width: '100%',
          minHeight: '52px',
          fontSize: '1.1em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {loading ? '🔄 Checking In...' : '📍 Check In to Session'}
      </button>

      <div style={{
        marginTop: '16px',
        fontSize: '0.85em',
        color: 'var(--text-secondary)',
        lineHeight: '1.4'
      }}>
        🔒 We use GPS verification to ensure legitimate attendance. Your location data is only used for this session.
      </div>
    </div>
  );

  const renderCheckedInState = () => (
    <div className="glass-card" style={{
      padding: '24px',
      textAlign: 'center',
      borderRadius: '12px'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        background: 'linear-gradient(45deg, #22C55E, #16A34A)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        fontSize: '28px'
      }}>
        ✅
      </div>
      
      <h2 style={{
        fontSize: '1.3em',
        fontWeight: '600',
        marginBottom: '8px',
        color: '#22C55E'
      }}>
        Checked In Successfully
      </h2>
      
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: '20px'
      }}>
        Enjoy your training session! Don't forget to check out when you're done.
      </p>

      <div style={{
        background: 'rgba(34, 197, 94, 0.1)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Session Progress
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Checked in at:</strong> {checkinTime?.toLocaleTimeString()}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Session duration:</strong> {Math.round((new Date() - checkinTime) / (1000 * 60))} minutes
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(34, 197, 94, 0.2)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '60%',
            height: '100%',
            background: 'linear-gradient(90deg, #22C55E, #16A34A)',
            animation: 'pulse 2s infinite'
          }} />
        </div>
      </div>

      <button
        className="btn-secondary mobile-button"
        onClick={checkOut}
        disabled={loading}
        style={{
          width: '100%',
          minHeight: '52px',
          fontSize: '1.1em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {loading ? '🔄 Checking Out...' : '🏁 Check Out & Complete Session'}
      </button>
    </div>
  );

  const renderCertifiedState = () => (
    <div className="glass-card" style={{
      padding: '24px',
      textAlign: 'center',
      borderRadius: '12px'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px'
      }}>
        <AnimatedCheckmark size={40} color="white" />
      </div>
      
      <h2 style={{
        fontSize: '1.4em',
        fontWeight: '600',
        marginBottom: '8px',
        color: '#C4D600'
      }}>
        Session Completed! 🎉
      </h2>
      
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: '20px'
      }}>
        Your attendance has been verified and certified.
      </p>

      {certificate && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(196, 214, 0, 0.1), rgba(178, 255, 102, 0.05))',
          border: '2px solid rgba(196, 214, 0, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Certificate decoration */}
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            fontSize: '20px'
          }}>
            🏆
          </div>
          
          <div style={{
            fontSize: '1.1em',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#C4D600'
          }}>
            Training Session Certificate
          </div>
          
          <div style={{
            fontSize: '0.9em',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            <div><strong>Certificate ID:</strong> {certificate.certificate_id}</div>
            <div><strong>Session Duration:</strong> {certificate.duration} minutes</div>
            <div><strong>Trainer:</strong> {certificate.trainer_name}</div>
            <div><strong>Date:</strong> {new Date(certificate.date).toLocaleDateString()}</div>
            <div><strong>Verified:</strong> ✓ GPS Location Confirmed</div>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <button
          className="btn-primary"
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '0.9em'
          }}
        >
          📄 Download Certificate
        </button>
        
        <button
          className="btn-secondary"
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '0.9em'
          }}
        >
          📤 Share Achievement
        </button>
      </div>

      {/* Achievement unlocked */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '0.9em',
        color: '#F59E0B'
      }}>
        <AnimatedCoin size={16} color="#F59E0B" /> 
        {' '}You earned 25 LiftCoins for completing this session!
      </div>
    </div>
  );

  return (
    <div className="mobile-scroll-container" style={{
      width: '100%',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      {attendanceStatus === 'pending' && renderPendingState()}
      {attendanceStatus === 'checked_in' && renderCheckedInState()}
      {(attendanceStatus === 'completed' || attendanceStatus === 'certified') && renderCertifiedState()}
    </div>
  );
};

export default SessionAttendance;