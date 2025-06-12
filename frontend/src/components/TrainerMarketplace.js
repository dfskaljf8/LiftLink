import React, { useState, useEffect } from 'react';
import { AnimatedCard } from '../DelightfulComponents';
import { LiftLinkLogo, AnimatedDumbbell } from './AnimatedSVGs';

const TrainerMarketplace = ({ userProfile, onTrainerSelect }) => {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [rating, setRating] = useState('all');
  const [distance, setDistance] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [favoriteTrainers, setFavoriteTrainers] = useState([]);

  // Mock trainer data - in real app, this would come from API
  useEffect(() => {
    const mockTrainers = [
      {
        id: 'trainer_001',
        name: 'Sarah Johnson',
        avatar: '👩‍💪',
        specialty: 'Strength Training',
        secondarySpecialties: ['Weight Loss', 'Muscle Building'],
        rating: 4.9,
        reviewCount: 127,
        hourlyRate: 85,
        experience: '8 years',
        certifications: ['NASM-CPT', 'ACSM', 'Nutrition Specialist'],
        location: 'Downtown Fitness Center',
        distance: 2.3,
        availability: 'Today',
        nextAvailable: '2:00 PM',
        bio: 'Passionate about helping clients achieve their strength and muscle building goals. Specialized in powerlifting and functional fitness.',
        achievements: ['Top Rated Trainer 2023', '500+ Success Stories'],
        languages: ['English', 'Spanish'],
        verified: true,
        featured: true,
        sessions: 1250,
        responseTime: '< 2 hours'
      },
      {
        id: 'trainer_002',
        name: 'Mike Rodriguez',
        avatar: '👨‍💪',
        specialty: 'CrossFit & HIIT',
        secondarySpecialties: ['Cardio', 'Athletic Performance'],
        rating: 4.8,
        reviewCount: 203,
        hourlyRate: 95,
        experience: '12 years',
        certifications: ['CrossFit Level 3', 'NSCA-CSCS'],
        location: 'Elite Athletics Gym',
        distance: 1.8,
        availability: 'Tomorrow',
        nextAvailable: '6:00 AM',
        bio: 'Former competitive athlete turned trainer. Expertise in high-intensity workouts and athletic performance optimization.',
        achievements: ['CrossFit Games Competitor', 'Master Trainer'],
        languages: ['English'],
        verified: true,
        featured: false,
        sessions: 890,
        responseTime: '< 1 hour'
      },
      {
        id: 'trainer_003',
        name: 'Alex Chen',
        avatar: '🏋️',
        specialty: 'Powerlifting',
        secondarySpecialties: ['Strength Training', 'Competition Prep'],
        rating: 5.0,
        reviewCount: 89,
        hourlyRate: 110,
        experience: '15 years',
        certifications: ['USAPL Coach', 'Starting Strength'],
        location: 'Iron Paradise Gym',
        distance: 3.1,
        availability: 'This Week',
        nextAvailable: 'Friday 5:00 PM',
        bio: 'World-class powerlifting coach with multiple national records. Specializes in technical lifting and competition preparation.',
        achievements: ['National Champion', 'World Record Holder'],
        languages: ['English', 'Mandarin'],
        verified: true,
        featured: true,
        sessions: 650,
        responseTime: '< 3 hours'
      },
      {
        id: 'trainer_004',
        name: 'Emma Davis',
        avatar: '👩‍🏫',
        specialty: 'Yoga & Flexibility',
        secondarySpecialties: ['Mindfulness', 'Injury Recovery'],
        rating: 4.9,
        reviewCount: 156,
        hourlyRate: 75,
        experience: '10 years',
        certifications: ['RYT-500', 'Physical Therapy Assistant'],
        location: 'Zen Wellness Studio',
        distance: 1.5,
        availability: 'Today',
        nextAvailable: '4:00 PM',
        bio: 'Holistic approach to fitness combining yoga, mindfulness, and injury prevention. Helping clients find balance in body and mind.',
        achievements: ['Yoga Alliance Certified', 'Wellness Expert'],
        languages: ['English', 'French'],
        verified: true,
        featured: false,
        sessions: 980,
        responseTime: '< 1 hour'
      },
      {
        id: 'trainer_005',
        name: 'David Kim',
        avatar: '🥊',
        specialty: 'Boxing & MMA',
        secondarySpecialties: ['Self Defense', 'Cardio Conditioning'],
        rating: 4.7,
        reviewCount: 178,
        hourlyRate: 90,
        experience: '9 years',
        certifications: ['USA Boxing Coach', 'Krav Maga Instructor'],
        location: 'Fight Club Gym',
        distance: 4.2,
        availability: 'This Week',
        nextAvailable: 'Monday 7:00 PM',
        bio: 'Former professional boxer and MMA fighter. Teaches practical self-defense and high-energy combat fitness.',
        achievements: ['Pro Fighter', 'Self Defense Expert'],
        languages: ['English', 'Korean'],
        verified: true,
        featured: false,
        sessions: 720,
        responseTime: '< 4 hours'
      },
      {
        id: 'trainer_006',
        name: 'Lisa Thompson',
        avatar: '🏃‍♀️',
        specialty: 'Running & Endurance',
        secondarySpecialties: ['Marathon Training', 'Injury Prevention'],
        rating: 4.8,
        reviewCount: 134,
        hourlyRate: 80,
        experience: '11 years',
        certifications: ['RRCA Certified', 'Sports Medicine'],
        location: 'Outdoor Training Zones',
        distance: 2.8,
        availability: 'Tomorrow',
        nextAvailable: '6:30 AM',
        bio: 'Marathon specialist and running coach. Helped 200+ runners complete their first marathon and achieve personal records.',
        achievements: ['Boston Marathon Qualifier', 'Endurance Coach'],
        languages: ['English'],
        verified: true,
        featured: false,
        sessions: 1100,
        responseTime: '< 2 hours'
      }
    ];
    
    setTrainers(mockTrainers);
    setFilteredTrainers(mockTrainers);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...trainers];

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(trainer =>
        trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.secondarySpecialties.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Specialty filter
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(trainer =>
        trainer.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
        trainer.secondarySpecialties.some(spec => 
          spec.toLowerCase().includes(selectedSpecialty.toLowerCase())
        )
      );
    }

    // Price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(trainer => {
        if (max) {
          return trainer.hourlyRate >= min && trainer.hourlyRate <= max;
        } else {
          return trainer.hourlyRate >= min;
        }
      });
    }

    // Rating filter
    if (rating !== 'all') {
      const minRating = parseFloat(rating);
      filtered = filtered.filter(trainer => trainer.rating >= minRating);
    }

    // Distance filter
    if (distance !== 'all') {
      const maxDistance = parseFloat(distance);
      filtered = filtered.filter(trainer => trainer.distance <= maxDistance);
    }

    // Availability filter
    if (availability !== 'all') {
      filtered = filtered.filter(trainer => 
        trainer.availability.toLowerCase() === availability.toLowerCase()
      );
    }

    // Sort trainers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.hourlyRate - b.hourlyRate;
        case 'price-high':
          return b.hourlyRate - a.hourlyRate;
        case 'distance':
          return a.distance - b.distance;
        case 'experience':
          return parseInt(b.experience) - parseInt(a.experience);
        case 'sessions':
          return b.sessions - a.sessions;
        default:
          return b.rating - a.rating;
      }
    });

    // Prioritize featured trainers
    const featuredTrainers = filtered.filter(trainer => trainer.featured);
    const regularTrainers = filtered.filter(trainer => !trainer.featured);
    
    setFilteredTrainers([...featuredTrainers, ...regularTrainers]);
  }, [trainers, searchTerm, selectedSpecialty, priceRange, rating, distance, availability, sortBy]);

  const specialties = [
    'all', 'Strength Training', 'CrossFit & HIIT', 'Powerlifting', 
    'Yoga & Flexibility', 'Boxing & MMA', 'Running & Endurance',
    'Weight Loss', 'Muscle Building', 'Cardio'
  ];

  const toggleFavorite = (trainerId) => {
    setFavoriteTrainers(prev => 
      prev.includes(trainerId) 
        ? prev.filter(id => id !== trainerId)
        : [...prev, trainerId]
    );
  };

  const openBookingModal = (trainer) => {
    setSelectedTrainer(trainer);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setSelectedTrainer(null);
    setShowBookingModal(false);
  };

  const TrainerCard = ({ trainer, isListView = false }) => (
    <AnimatedCard 
      key={trainer.id}
      className={`trainer-card ${isListView ? 'list-view' : 'grid-view'} ${trainer.featured ? 'featured' : ''}`}
      style={{
        background: trainer.featured 
          ? 'linear-gradient(135deg, rgba(196, 214, 0, 0.1), rgba(196, 214, 0, 0.05))'
          : 'rgba(255, 255, 255, 0.05)',
        border: trainer.featured ? '2px solid #C4D600' : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginBottom: isListView ? '16px' : '0'
      }}
      onClick={() => openBookingModal(trainer)}
    >
      {trainer.featured && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: '#C4D600',
          color: '#000',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          ⭐ FEATURED
        </div>
      )}

      <div className="trainer-header" style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '48px',
          marginRight: '16px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(196, 214, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: '#C4D600'
        }}>
          {trainer.name.charAt(0)}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff'
            }}>
              {trainer.name}
            </h3>
            {trainer.verified && (
              <span style={{
                background: '#C4D600',
                color: '#000',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                ✓
              </span>
            )}
          </div>
          <p style={{
            margin: '4px 0',
            color: '#C4D600',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            {trainer.specialty}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            <span>⭐ {trainer.rating} ({trainer.reviewCount})</span>
            <span>📍 {trainer.distance} miles</span>
            <span>🕒 {trainer.experience}</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(trainer.id);
          }}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: favoriteTrainers.includes(trainer.id) ? '#ff4757' : 'rgba(255, 255, 255, 0.5)'
          }}
        >
          {favoriteTrainers.includes(trainer.id) ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="trainer-info" style={{
        marginBottom: '16px'
      }}>
        <p style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.8)',
          lineHeight: '1.4'
        }}>
          {trainer.bio}
        </p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          {trainer.secondarySpecialties.map((spec, index) => (
            <span key={index} style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#ffffff'
            }}>
              {spec}
            </span>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          <div>📅 Available: {trainer.availability}</div>
          <div>⚡ Responds: {trainer.responseTime}</div>
          <div>🏆 Sessions: {trainer.sessions}</div>
          <div>🗣️ {trainer.languages.join(', ')}</div>
        </div>
      </div>

      <div className="trainer-footer" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#C4D600'
        }}>
          ${trainer.hourlyRate}/hour
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            openBookingModal(trainer);
          }}
          style={{
            background: '#C4D600',
            color: '#000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          Book Session
        </button>
      </div>
    </AnimatedCard>
  );

  const BookingModal = () => {
    if (!selectedTrainer) return null;

    return (
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
        padding: '20px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          border: '1px solid rgba(196, 214, 0, 0.3)',
          borderRadius: '24px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, color: '#ffffff', fontSize: '24px' }}>
              Book with {selectedTrainer.name}
            </h2>
            <button
              onClick={closeBookingModal}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>

          {/* Trainer Details */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '48px', marginRight: '16px' }}>
                {selectedTrainer.avatar}
              </span>
              <div>
                <h3 style={{ margin: 0, color: '#ffffff' }}>{selectedTrainer.name}</h3>
                <p style={{ margin: '4px 0', color: '#C4D600' }}>{selectedTrainer.specialty}</p>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  ⭐ {selectedTrainer.rating} • 📍 {selectedTrainer.distance} miles • ${selectedTrainer.hourlyRate}/hour
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#C4D600' }}>Certifications</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedTrainer.certifications.map((cert, index) => (
                  <span key={index} style={{
                    background: 'rgba(196, 214, 0, 0.2)',
                    color: '#C4D600',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#C4D600' }}>Achievements</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'rgba(255, 255, 255, 0.8)' }}>
                {selectedTrainer.achievements.map((achievement, index) => (
                  <li key={index} style={{ fontSize: '14px' }}>{achievement}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Booking Form */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#ffffff' }}>Book Your Session</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#ffffff', marginBottom: '8px' }}>
                Session Type
              </label>
              <select style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px'
              }}>
                <option value="personal">Personal Training (1-on-1)</option>
                <option value="small-group">Small Group (2-4 people)</option>
                <option value="consultation">Initial Consultation</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#ffffff', marginBottom: '8px' }}>
                Preferred Date & Time
              </label>
              <input
                type="datetime-local"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#ffffff', marginBottom: '8px' }}>
                Goals & Notes
              </label>
              <textarea
                placeholder="Tell us about your fitness goals and any specific requirements..."
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={closeBookingModal}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle booking submission
                  alert(`Booking request sent to ${selectedTrainer.name}! They'll respond within ${selectedTrainer.responseTime}.`);
                  closeBookingModal();
                }}
                style={{
                  flex: 2,
                  background: '#C4D600',
                  border: 'none',
                  color: '#000',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Send Booking Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="trainer-marketplace" style={{
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
          Verified Trainer Marketplace
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'rgba(255, 255, 255, 0.7)',
          margin: 0
        }}>
          Connect with certified fitness professionals in your area
        </p>
      </div>

      {/* Search and Filters */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '32px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '12px 16px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <span style={{ fontSize: '20px', marginRight: '12px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search trainers by name, specialty, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '16px'
              }}
            />
          </div>
        </div>

        {/* Filters Row 1 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div>
            <label style={{ display: 'block', color: '#ffffff', marginBottom: '6px', fontSize: '14px' }}>
              Specialty
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            >
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>
                  {specialty === 'all' ? 'All Specialties' : specialty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#ffffff', marginBottom: '6px', fontSize: '14px' }}>
              Price Range
            </label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            >
              <option value="all">All Prices</option>
              <option value="0-75">$0 - $75</option>
              <option value="75-90">$75 - $90</option>
              <option value="90-105">$90 - $105</option>
              <option value="105">$105+</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#ffffff', marginBottom: '6px', fontSize: '14px' }}>
              Rating
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            >
              <option value="all">All Ratings</option>
              <option value="4.8">4.8+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#ffffff', marginBottom: '6px', fontSize: '14px' }}>
              Distance
            </label>
            <select
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            >
              <option value="all">Any Distance</option>
              <option value="2">Within 2 miles</option>
              <option value="5">Within 5 miles</option>
              <option value="10">Within 10 miles</option>
            </select>
          </div>
        </div>

        {/* Filters Row 2 & Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', color: '#ffffff', marginBottom: '6px', fontSize: '14px' }}>
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px'
                }}
              >
                <option value="all">Any Time</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this week">This Week</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#ffffff', marginBottom: '6px', fontSize: '14px' }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px'
                }}
              >
                <option value="rating">Rating</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="distance">Distance</option>
                <option value="experience">Experience</option>
                <option value="sessions">Most Sessions</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>View:</span>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#C4D600' : 'rgba(255, 255, 255, 0.1)',
                color: viewMode === 'grid' ? '#000' : '#ffffff',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? '#C4D600' : 'rgba(255, 255, 255, 0.1)',
                color: viewMode === 'list' ? '#000' : '#ffffff',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <p style={{
          margin: 0,
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '16px'
        }}>
          Found {filteredTrainers.length} trainer{filteredTrainers.length !== 1 ? 's' : ''}
          {searchTerm && ` for "${searchTerm}"`}
        </p>

        {favoriteTrainers.length > 0 && (
          <button
            onClick={() => {
              const favoriteTrainersList = trainers.filter(t => favoriteTrainers.includes(t.id));
              setFilteredTrainers(favoriteTrainersList);
            }}
            style={{
              background: 'rgba(255, 71, 87, 0.2)',
              color: '#ff4757',
              border: '1px solid #ff4757',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ❤️ View Favorites ({favoriteTrainers.length})
          </button>
        )}
      </div>

      {/* Trainers Grid/List */}
      <div className={`trainers-container ${viewMode}`} style={{
        display: viewMode === 'grid' ? 'grid' : 'flex',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(400px, 1fr))' : 'none',
        flexDirection: viewMode === 'list' ? 'column' : 'row',
        gap: '24px'
      }}>
        {filteredTrainers.map(trainer => (
          <TrainerCard 
            key={trainer.id} 
            trainer={trainer} 
            isListView={viewMode === 'list'} 
          />
        ))}
      </div>

      {filteredTrainers.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#ffffff' }}>No trainers found</h3>
          <p style={{ margin: 0 }}>
            Try adjusting your filters or search terms to find more trainers.
          </p>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && <BookingModal />}
    </div>
  );
};

export default TrainerMarketplace;