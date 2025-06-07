import React, { useState, useEffect } from 'react';
import { AnimatedStar, AnimatedCheckmark } from './AnimatedSVGs';

// Find Friends Component - Duolingo-style contact matching
const FindFriends = ({ userProfile }) => {
  const [step, setStep] = useState('permission'); // permission, importing, matching, results
  const [contacts, setContacts] = useState([]);
  const [matchedFriends, setMatchedFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const requestContactPermission = async () => {
    setLoading(true);
    
    try {
      // For web apps, we'll use a file upload approach since direct contact access is limited
      // In a real mobile app, this would use native contact APIs
      if ('contacts' in navigator && 'ContactsManager' in window) {
        // Chrome's Contact Picker API (limited support)
        const contacts = await navigator.contacts.select(['name', 'email', 'tel'], {
          multiple: true
        });
        setContacts(contacts);
        setPermissionGranted(true);
        setStep('matching');
        await findMatches(contacts);
      } else {
        // Fallback: Ask user to upload contacts or manually enter
        setStep('manual');
      }
    } catch (error) {
      console.error('Contact permission error:', error);
      setStep('manual');
    } finally {
      setLoading(false);
    }
  };

  const handleContactUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csv = e.target.result;
        const parsedContacts = parseCSVContacts(csv);
        setContacts(parsedContacts);
        setStep('matching');
        await findMatches(parsedContacts);
      };
      reader.readAsText(file);
    }
  };

  const parseCSVContacts = (csv) => {
    const lines = csv.split('\n');
    const contacts = [];
    
    for (let i = 1; i < lines.length; i++) {
      const [name, email, phone] = lines[i].split(',');
      if (name && (email || phone)) {
        contacts.push({
          name: name.trim(),
          email: email?.trim(),
          tel: phone?.trim()
        });
      }
    }
    
    return contacts;
  };

  const findMatches = async (contactsList) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/social/find-friends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userProfile?.token || 'demo_user'}`
        },
        body: JSON.stringify({
          contacts: contactsList.map(contact => ({
            name: contact.name,
            email: contact.email,
            phone: contact.tel
          }))
        })
      });

      if (response.ok) {
        const matches = await response.json();
        setMatchedFriends(matches.friends || []);
        setStep('results');
      }
    } catch (error) {
      console.error('Error finding friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/social/friend-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userProfile?.token || 'demo_user'}`
        },
        body: JSON.stringify({
          friend_id: friendId
        })
      });

      if (response.ok) {
        setSentRequests(prev => new Set([...prev, friendId]));
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const renderPermissionStep = () => (
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
        margin: '0 auto 20px',
        fontSize: '32px'
      }}>
        👥
      </div>
      
      <h2 style={{
        fontSize: '1.4em',
        fontWeight: '600',
        marginBottom: '12px'
      }}>
        Find Your Friends
      </h2>
      
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: '24px',
        lineHeight: '1.5'
      }}>
        Connect with friends who are already on LiftLink. We'll help you find them by 
        safely checking your contacts.
      </p>
      
      <button
        className="btn-primary mobile-button"
        onClick={requestContactPermission}
        disabled={loading}
        style={{
          width: '100%',
          minHeight: '52px',
          fontSize: '1.1em',
          marginBottom: '16px'
        }}
      >
        {loading ? '🔄 Requesting Access...' : '📱 Access Contacts'}
      </button>
      
      <div style={{
        margin: '16px 0',
        fontSize: '0.9em',
        color: 'var(--text-secondary)'
      }}>
        or
      </div>
      
      <label style={{
        display: 'block',
        width: '100%',
        minHeight: '48px',
        padding: '12px 16px',
        background: 'linear-gradient(135deg, rgba(196, 214, 0, 0.2), rgba(178, 255, 102, 0.1))',
        border: '1px solid rgba(196, 214, 0, 0.4)',
        borderRadius: '12px',
        color: '#C4D600',
        fontSize: '1em',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        📄 Upload Contacts CSV
        <input
          type="file"
          accept=".csv"
          onChange={handleContactUpload}
          style={{ display: 'none' }}
        />
      </label>
      
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(196, 214, 0, 0.1)',
        borderRadius: '12px',
        fontSize: '0.85em',
        color: 'var(--text-secondary)',
        lineHeight: '1.4'
      }}>
        🔒 <strong>Privacy Protected:</strong> Your contacts are only used for finding friends and are immediately 
        deleted after matching. We never store your contact list.
      </div>
    </div>
  );

  const renderMatchingStep = () => (
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
        margin: '0 auto 20px',
        animation: 'pulse 2s infinite'
      }}>
        🔍
      </div>
      
      <h2 style={{
        fontSize: '1.3em',
        fontWeight: '600',
        marginBottom: '12px'
      }}>
        Finding Your Friends
      </h2>
      
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: '24px'
      }}>
        We're securely matching your contacts with LiftLink users...
      </p>
      
      <div style={{
        width: '100%',
        height: '8px',
        background: 'rgba(196, 214, 0, 0.2)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '70%',
          height: '100%',
          background: 'linear-gradient(90deg, #C4D600, #B2FF66)',
          animation: 'loading 2s infinite'
        }} />
      </div>
    </div>
  );

  const renderResultsStep = () => (
    <div style={{ width: '100%' }}>
      <div className="glass-card" style={{
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '12px'
      }}>
        <h2 style={{
          fontSize: '1.3em',
          fontWeight: '600',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AnimatedCheckmark size={24} color="#C4D600" />
          Found {matchedFriends.length} Friends
        </h2>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95em',
          margin: 0
        }}>
          People you know who are already using LiftLink
        </p>
      </div>

      {matchedFriends.length > 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {matchedFriends.map((friend, index) => (
            <div key={friend.user_id} className="glass-card" style={{
              padding: '16px',
              borderRadius: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: `linear-gradient(45deg, #C4D600, #B2FF66)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {friend.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div>
                    <div style={{
                      fontSize: '1em',
                      fontWeight: '500',
                      marginBottom: '2px'
                    }}>
                      {friend.name}
                    </div>
                    <div style={{
                      fontSize: '0.85em',
                      color: 'var(--text-secondary)'
                    }}>
                      {friend.mutual_friends > 0 && `${friend.mutual_friends} mutual friends • `}
                      {friend.location && `${friend.location} • `}
                      {friend.specialties?.join(', ') || 'Fitness enthusiast'}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => sendFriendRequest(friend.user_id)}
                  disabled={sentRequests.has(friend.user_id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.9em',
                    fontWeight: '500',
                    cursor: sentRequests.has(friend.user_id) ? 'default' : 'pointer',
                    touchAction: 'manipulation',
                    background: sentRequests.has(friend.user_id)
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'linear-gradient(135deg, rgba(196, 214, 0, 0.2), rgba(178, 255, 102, 0.1))',
                    color: sentRequests.has(friend.user_id) ? '#22C55E' : '#C4D600',
                    border: `1px solid ${sentRequests.has(friend.user_id) ? '#22C55E' : '#C4D600'}`
                  }}
                >
                  {sentRequests.has(friend.user_id) ? '✓ Sent' : '+ Add'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{
          padding: '24px',
          textAlign: 'center',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{
            fontSize: '1.1em',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            No Friends Found Yet
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '20px',
            lineHeight: '1.4'
          }}>
            None of your contacts are using LiftLink yet. Invite them to join and 
            start your fitness journey together!
          </p>
          
          <button
            className="btn-secondary"
            style={{
              padding: '12px 20px',
              fontSize: '1em'
            }}
          >
            📤 Invite Friends
          </button>
        </div>
      )}
      
      <button
        onClick={() => setStep('permission')}
        style={{
          width: '100%',
          marginTop: '16px',
          padding: '12px',
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          color: 'var(--text-secondary)',
          fontSize: '0.9em',
          cursor: 'pointer'
        }}
      >
        ← Search Again
      </button>
    </div>
  );

  return (
    <div className="mobile-scroll-container" style={{
      width: '100%',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      {step === 'permission' && renderPermissionStep()}
      {step === 'matching' && renderMatchingStep()}
      {step === 'results' && renderResultsStep()}
    </div>
  );
};

export default FindFriends;