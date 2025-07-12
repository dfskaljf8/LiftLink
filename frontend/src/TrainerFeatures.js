import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

// Enhanced Trainer Schedule Component
export const TrainerSchedule = ({ user }) => {
  const { darkMode } = useContext(AppContext);
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, [user.id, selectedDate]);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`${API}/trainer/${user.id}/schedule`);
      setSchedule(response.data.schedule);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return darkMode ? 'text-green-400' : 'text-green-600';
      case 'pending': return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'cancelled': return darkMode ? 'text-red-400' : 'text-red-600';
      default: return darkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Schedule Management
          </h1>
          <button
            onClick={() => setShowNewAppointment(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              darkMode 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            + New Appointment
          </button>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-800/50 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-green-400`}
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading schedule...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.length === 0 ? (
              <div className="text-center py-8">
                <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No appointments scheduled for this date
                </div>
              </div>
            ) : (
              schedule.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
                    darkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {appointment.title}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        📍 {appointment.location}
                      </p>
                      {appointment.notes && (
                        <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          💭 {appointment.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.toUpperCase()}
                      </span>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {appointment.session_type}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Trainer Earnings Component
export const TrainerEarnings = ({ user }) => {
  const { darkMode } = useContext(AppContext);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('');

  useEffect(() => {
    fetchEarnings();
  }, [user.id]);

  const fetchEarnings = async () => {
    try {
      const response = await axios.get(`${API}/trainer/${user.id}/earnings`);
      setEarnings(response.data);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async () => {
    try {
      const amount = Math.round(parseFloat(payoutAmount) * 100); // Convert to cents
      await axios.post(`${API}/trainer/${user.id}/payout`, { amount });
      alert(`Payout request of $${payoutAmount} submitted successfully!`);
      setPayoutAmount('');
      fetchEarnings();
    } catch (error) {
      alert('Failed to request payout. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6 text-center`}>
        <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading earnings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Earnings Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              ${earnings?.total_earnings?.toFixed(2) || '0.00'}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Earnings</div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              ${earnings?.this_month?.toFixed(2) || '0.00'}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Month</div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              ${earnings?.pending_payments?.toFixed(2) || '0.00'}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Payments
            </h3>
            <div className="space-y-2">
              {earnings?.recent_payments?.map((payment, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {payment.client_name}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {payment.date} • {payment.session_type}
                    </div>
                  </div>
                  <div className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ${payment.amount.toFixed(2)}
                  </div>
                </div>
              )) || []}
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Request Payout
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-800/50 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-green-400`}
                  placeholder="0.00"
                />
              </div>
              <button
                onClick={requestPayout}
                disabled={!payoutAmount || parseFloat(payoutAmount) <= 0}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  !payoutAmount || parseFloat(payoutAmount) <= 0
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : darkMode
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Request Payout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Trainer Reviews Component
export const TrainerReviews = ({ user }) => {
  const { darkMode } = useContext(AppContext);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [user.id]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/trainer/${user.id}/reviews`);
      setReviews(response.data.reviews);
      setAvgRating(response.data.avg_rating);
      setTotalReviews(response.data.total_reviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
    ));
  };

  if (loading) {
    return (
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6 text-center`}>
        <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Reviews & Ratings
        </h1>

        <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-6 rounded-lg border ${
          darkMode ? 'border-gray-600' : 'border-gray-200'
        } mb-6`}>
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-yellow-400">
              {avgRating.toFixed(1)}
            </div>
            <div>
              <div className="flex text-xl">
                {renderStars(Math.round(avgRating))}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Based on {totalReviews} reviews
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
                darkMode ? 'border-gray-600' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {review.client_name}
                  </h3>
                  <div className="flex text-sm text-yellow-400">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {review.date}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {review.session_type}
                  </div>
                </div>
              </div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Trainer Profile Component
export const TrainerProfile = ({ user }) => {
  const { darkMode } = useContext(AppContext);
  const [profile, setProfile] = useState({
    bio: "Certified personal trainer with 5+ years of experience helping clients achieve their fitness goals.",
    specialties: ["Weight Loss", "Strength Training", "Nutrition Coaching"],
    certifications: ["NASM-CPT", "Precision Nutrition Level 1"],
    hourlyRate: 75,
    availability: "Monday-Friday 6AM-8PM"
  });

  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log('Saving profile:', profile);
    setEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Trainer Profile
          </h1>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              darkMode 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {editing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              disabled={!editing}
              rows={4}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-800/50 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-400 ${!editing ? 'cursor-not-allowed opacity-75' : ''}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Hourly Rate ($)
            </label>
            <input
              type="number"
              value={profile.hourlyRate}
              onChange={(e) => setProfile({...profile, hourlyRate: parseInt(e.target.value)})}
              disabled={!editing}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-800/50 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-400 ${!editing ? 'cursor-not-allowed opacity-75' : ''}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Availability
            </label>
            <input
              type="text"
              value={profile.availability}
              onChange={(e) => setProfile({...profile, availability: e.target.value})}
              disabled={!editing}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-800/50 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-400 ${!editing ? 'cursor-not-allowed opacity-75' : ''}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Specialties
            </label>
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm ${
                    darkMode ? 'bg-green-600 text-white' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Certifications
            </label>
            <div className="flex flex-wrap gap-2">
              {profile.certifications.map((cert, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm ${
                    darkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};