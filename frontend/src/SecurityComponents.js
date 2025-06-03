import React, { useState, useEffect } from 'react';
import api from './api';

// KYC Document Upload Component
export const KYCUpload = ({ userProfile, onUploadComplete }) => {
  const [documentType, setDocumentType] = useState('government_id');
  const [documentFile, setDocumentFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await api.get('/api/kyc/status');
      setKycStatus(response.data);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!documentFile) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target.result.split(',')[1];
        
        await api.post('/api/kyc/upload-document', {
          document_type: documentType,
          document_data: base64Data
        });
        
        setDocumentFile(null);
        fetchKYCStatus();
        onUploadComplete && onUploadComplete();
        alert('Document uploaded successfully! Under review.');
      };
      reader.readAsDataURL(documentFile);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading document');
    }
    setUploading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return '#28a745';
      case 'pending': return '#ffc107';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="kyc-upload">
      <div className="kyc-header">
        <h2>🛡️ Identity Verification</h2>
        <p>Secure your account and build trust in the LiftLink community</p>
        
        {kycStatus && (
          <div className="kyc-status">
            <h3>Verification Status: 
              <span style={{ color: getStatusColor(kycStatus.kyc_status) }}>
                {kycStatus.kyc_status.replace('_', ' ').toUpperCase()}
              </span>
            </h3>
          </div>
        )}
      </div>

      <div className="documents-grid">
        {kycStatus?.documents?.map((doc) => (
          <div key={doc.document_id} className="document-card">
            <div className="document-type">
              {doc.document_type === 'government_id' ? '🪪 Government ID' :
               doc.document_type === 'certification' ? '📜 Certification' :
               doc.document_type === 'selfie' ? '🤳 Selfie' : doc.document_type}
            </div>
            <div className={`status ${doc.verification_status}`}>
              {doc.verification_status === 'verified' ? '✅ Verified' :
               doc.verification_status === 'pending' ? '⏳ Under Review' :
               doc.verification_status === 'rejected' ? '❌ Rejected' : 'Unknown'}
            </div>
            {doc.verification_notes && (
              <div className="verification-notes">{doc.verification_notes}</div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleFileUpload} className="upload-form">
        <h3>Upload New Document</h3>
        
        <div className="form-group">
          <label>Document Type</label>
          <select 
            value={documentType} 
            onChange={(e) => setDocumentType(e.target.value)}
            className="form-select"
          >
            <option value="government_id">🪪 Government ID</option>
            <option value="selfie">🤳 Selfie Verification</option>
            {userProfile?.role === 'trainer' && (
              <option value="certification">📜 Trainer Certification</option>
            )}
          </select>
        </div>
        
        <div className="form-group">
          <label>Choose File</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setDocumentFile(e.target.files[0])}
            className="form-input"
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!documentFile || uploading}
          className="upload-btn"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>

      <div className="security-notice">
        <h4>🔒 Your Privacy is Protected</h4>
        <ul>
          <li>All documents are encrypted and stored securely</li>
          <li>Only verified admins can review your documents</li>
          <li>Documents are automatically deleted after verification</li>
          <li>Face matching technology prevents identity theft</li>
        </ul>
      </div>
    </div>
  );
};

// Messaging Component with Security
export const SecureMessaging = ({ userProfile }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.user_id);
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/api/messages/conversations');
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    setLoading(false);
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const response = await api.get(`/api/messages/conversation/${otherUserId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      await api.post('/api/messages/send', {
        recipient_id: activeConversation.user_id,
        content: newMessage,
        message_type: 'text'
      });
      
      setNewMessage('');
      fetchMessages(activeConversation.user_id);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };

  if (loading) return <div className="loading">Loading messages...</div>;

  return (
    <div className="secure-messaging">
      <div className="messaging-header">
        <h2>💬 Secure Messages</h2>
        <p>End-to-end encrypted conversations with trainers and clients</p>
      </div>

      <div className="messaging-container">
        <div className="conversations-list">
          <h3>Conversations</h3>
          {conversations.length === 0 ? (
            <div className="no-conversations">
              <p>No conversations yet</p>
              <p>Book a session with a trainer to start chatting!</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div 
                key={conv.user_id}
                className={`conversation-item ${activeConversation?.user_id === conv.user_id ? 'active' : ''}`}
                onClick={() => setActiveConversation(conv)}
              >
                <div className="user-avatar">
                  {conv.user_name.charAt(0)}
                </div>
                <div className="conversation-info">
                  <div className="user-name">{conv.user_name}</div>
                  <div className="user-role">
                    {conv.user_role === 'trainer' ? '🏋️‍♂️ Trainer' : '💪 Member'}
                  </div>
                  {conv.unread_count > 0 && (
                    <div className="unread-badge">{conv.unread_count}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="messages-area">
          {activeConversation ? (
            <>
              <div className="conversation-header">
                <div className="user-avatar">
                  {activeConversation.user_name.charAt(0)}
                </div>
                <div className="user-info">
                  <h3>{activeConversation.user_name}</h3>
                  <span>{activeConversation.user_role === 'trainer' ? '🏋️‍♂️ Trainer' : '💪 Member'}</span>
                </div>
                <div className="security-indicator">
                  <span className="encrypted-badge">🔒 Encrypted</span>
                </div>
              </div>

              <div className="messages-list">
                {messages.map((message) => (
                  <div 
                    key={message.message_id}
                    className={`message ${message.sender_id === userProfile.user_id ? 'sent' : 'received'} ${message.is_flagged ? 'flagged' : ''}`}
                  >
                    <div className="message-content">
                      {message.content}
                      {message.is_flagged && (
                        <div className="flag-warning">⚠️ Flagged for review</div>
                      )}
                    </div>
                    <div className="message-time">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="message-form">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="message-input"
                  maxLength={500}
                />
                <button type="submit" className="send-btn">Send</button>
              </form>

              <div className="safety-notice">
                <p>🛡️ Safety Reminder: Keep conversations professional. Report inappropriate behavior.</p>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <div className="placeholder-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the left to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Review System Component
export const ReviewSystem = ({ trainerId, userProfile }) => {
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    review_text: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trainerId) {
      fetchReviews();
    }
  }, [trainerId]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/api/reviews/trainer/${trainerId}`);
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
    setLoading(false);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/reviews/create', {
        trainer_id: trainerId,
        rating: newReview.rating,
        review_text: newReview.review_text
      });
      
      setNewReview({ rating: 5, review_text: '' });
      setShowReviewForm(false);
      fetchReviews();
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    }
  };

  if (loading) return <div className="loading">Loading reviews...</div>;

  return (
    <div className="review-system">
      <div className="reviews-header">
        <h3>⭐ Client Reviews</h3>
        {userProfile?.role === 'user' && (
          <button 
            onClick={() => setShowReviewForm(true)}
            className="write-review-btn"
          >
            Write Review
          </button>
        )}
      </div>

      {showReviewForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Write a Review</h3>
              <button onClick={() => setShowReviewForm(false)} className="close-btn">×</button>
            </div>
            
            <form onSubmit={submitReview} className="review-form">
              <div className="form-group">
                <label>Rating</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= newReview.rating ? 'filled' : ''}`}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Review</label>
                <textarea
                  value={newReview.review_text}
                  onChange={(e) => setNewReview({ ...newReview, review_text: e.target.value })}
                  placeholder="Share your experience with this trainer..."
                  className="form-textarea"
                  required
                  maxLength={500}
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-btn">Submit Review</button>
                <button type="button" onClick={() => setShowReviewForm(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet</p>
            <p>Be the first to review this trainer!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.review_id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <strong>{review.reviewer_name}</strong>
                  {review.is_verified_client && (
                    <span className="verified-badge">✅ Verified Client</span>
                  )}
                </div>
                <div className="review-rating">
                  {'⭐'.repeat(review.rating)}
                </div>
              </div>
              <div className="review-content">
                {review.review_text}
              </div>
              <div className="review-date">
                {new Date(review.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Report User Component
export const ReportUser = ({ reportedUserId, onReportSubmitted }) => {
  const [showForm, setShowForm] = useState(false);
  const [reportData, setReportData] = useState({
    reason: 'inappropriate_content',
    description: '',
    evidence: ''
  });

  const submitReport = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/reports/create', {
        reported_user_id: reportedUserId,
        reason: reportData.reason,
        description: reportData.description,
        evidence: reportData.evidence
      });
      
      setReportData({
        reason: 'inappropriate_content',
        description: '',
        evidence: ''
      });
      setShowForm(false);
      onReportSubmitted && onReportSubmitted();
      alert('Report submitted successfully. Thank you for keeping LiftLink safe.');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report');
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowForm(true)}
        className="report-btn"
      >
        🚨 Report User
      </button>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>🚨 Report User</h3>
              <button onClick={() => setShowForm(false)} className="close-btn">×</button>
            </div>
            
            <form onSubmit={submitReport} className="report-form">
              <div className="form-group">
                <label>Reason for Report</label>
                <select
                  value={reportData.reason}
                  onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
                  className="form-select"
                  required
                >
                  <option value="inappropriate_content">Inappropriate Content</option>
                  <option value="harassment">Harassment</option>
                  <option value="fake_profile">Fake Profile</option>
                  <option value="scam">Scam/Fraud</option>
                  <option value="safety_concern">Safety Concern</option>
                  <option value="grooming">Inappropriate Behavior (Grooming)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={reportData.description}
                  onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                  placeholder="Please describe the issue in detail..."
                  className="form-textarea"
                  required
                  maxLength={1000}
                />
              </div>
              
              <div className="form-group">
                <label>Evidence (Optional)</label>
                <textarea
                  value={reportData.evidence}
                  onChange={(e) => setReportData({ ...reportData, evidence: e.target.value })}
                  placeholder="Any additional evidence (screenshots, message content, etc.)"
                  className="form-textarea"
                  maxLength={500}
                />
              </div>
              
              <div className="safety-notice">
                <h4>🛡️ Your Safety Matters</h4>
                <p>All reports are taken seriously and reviewed by our safety team. 
                   For immediate safety concerns, please contact local authorities.</p>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-btn">Submit Report</button>
                <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Tree Progression Component with Seed to Redwood
export const EnhancedTreeProgression = ({ userProfile }) => {
  const [progression, setProgression] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgression();
  }, []);

  const fetchProgression = async () => {
    try {
      const response = await api.get(`/api/tree/progression/${userProfile.user_id}`);
      setProgression(response.data);
    } catch (error) {
      console.error('Error fetching tree progression:', error);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading">Loading your growth...</div>;

  const { current_stage, next_stage, progress_points, progress_to_next } = progression;

  return (
    <div className="tree-progression">
      <div className="progression-header">
        <h2>🌱 Your Fitness Journey</h2>
        <p>From seed to mighty redwood - watch your growth!</p>
      </div>

      <div className="current-stage">
        <div className="stage-visual">
          <div className="stage-icon" style={{ fontSize: '4rem' }}>
            {current_stage.icon}
          </div>
          <h3>{current_stage.name}</h3>
          <p>{current_stage.description}</p>
        </div>
        
        <div className="stage-stats">
          <div className="stat">
            <span className="stat-number">{progress_points}</span>
            <span className="stat-label">Growth Points</span>
          </div>
          <div className="stat">
            <span className="stat-number">{Math.round(progress_to_next)}%</span>
            <span className="stat-label">To Next Stage</span>
          </div>
        </div>
      </div>

      {next_stage && (
        <div className="next-stage">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress_to_next}%` }}
            ></div>
          </div>
          <div className="next-stage-info">
            <div className="next-icon">{next_stage.icon}</div>
            <div className="next-details">
              <h4>Next: {next_stage.name}</h4>
              <p>Need {next_stage.required_points - progress_points} more points</p>
            </div>
          </div>
        </div>
      )}

      <div className="growth-path">
        <h3>🌲 Growth Path</h3>
        <div className="stages-grid">
          {[
            { name: 'Seed', icon: '🌱', points: 0 },
            { name: 'Sprout', icon: '🌿', points: 100 },
            { name: 'Sapling', icon: '🌳', points: 500 },
            { name: 'Young Tree', icon: '🌲', points: 1500 },
            { name: 'Mature Tree', icon: '🌴', points: 3000 },
            { name: 'Ancient Tree', icon: '🌳', points: 6000 },
            { name: 'Mighty Redwood', icon: '🌲', points: 10000 }
          ].map((stage, index) => (
            <div 
              key={stage.name}
              className={`stage-milestone ${progress_points >= stage.points ? 'completed' : 'upcoming'}`}
            >
              <div className="milestone-icon">{stage.icon}</div>
              <div className="milestone-name">{stage.name}</div>
              <div className="milestone-points">{stage.points} pts</div>
            </div>
          ))}
        </div>
      </div>

      <div className="growth-tips">
        <h4>🌱 How to Grow</h4>
        <ul>
          <li>Complete workout sessions (+50-100 points)</li>
          <li>Achieve fitness goals (+100-200 points)</li>
          <li>Maintain workout streaks (+25 points/day)</li>
          <li>Leave helpful reviews (+10 points)</li>
          <li>Complete profile verification (+100 points)</li>
        </ul>
      </div>
    </div>
  );
};
