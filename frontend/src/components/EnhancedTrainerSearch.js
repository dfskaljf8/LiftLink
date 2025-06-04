import React, { useState, useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import '../styles/ProfessionalDesign.css';

const EnhancedTrainerSearch = ({ searchQuery, userProfile }) => {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');
  const [filters, setFilters] = useState({
    specialty: '',
    priceRange: [0, 200],
    rating: 0,
    distance: 50
  });
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  useEffect(() => {
    // Mock trainers data with coordinates
    const mockTrainers = [
      {
        id: 1,
        name: 'Sarah Chen',
        specialties: ['Weight Loss', 'Strength Training', 'HIIT'],
        hourlyRate: 75,
        rating: 4.9,
        reviews: 127,
        location: 'Manhattan, NY',
        distance: 0.8,
        coordinates: { lat: 40.7589, lng: -73.9851 },
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
        verified: true,
        bio: 'Certified personal trainer with 8+ years of experience helping clients achieve their fitness goals.',
        experience: '8 years',
        certifications: ['NASM-CPT', 'Nutrition Specialist'],
        availability: ['Morning', 'Evening'],
        languages: ['English', 'Mandarin']
      },
      {
        id: 2,
        name: 'Marcus Torres',
        specialties: ['Athletic Performance', 'HIIT', 'CrossFit'],
        hourlyRate: 85,
        rating: 4.8,
        reviews: 89,
        location: 'Brooklyn, NY',
        distance: 1.2,
        coordinates: { lat: 40.6782, lng: -73.9442 },
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        verified: true,
        bio: 'Former athlete turned trainer, specializing in high-performance training and athletic development.',
        experience: '6 years',
        certifications: ['CSCS', 'ACSM'],
        availability: ['Afternoon', 'Evening'],
        languages: ['English', 'Spanish']
      },
      {
        id: 3,
        name: 'Emma Rodriguez',
        specialties: ['Yoga', 'Pilates', 'Mindfulness'],
        hourlyRate: 65,
        rating: 4.9,
        reviews: 156,
        location: 'Queens, NY',
        distance: 2.1,
        coordinates: { lat: 40.7282, lng: -73.7949 },
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b190?w=200&h=200&fit=crop&crop=face',
        verified: true,
        bio: 'Holistic wellness coach focused on mind-body connection and sustainable fitness practices.',
        experience: '10 years',
        certifications: ['RYT-500', 'Pilates Certified'],
        availability: ['Morning', 'Afternoon'],
        languages: ['English', 'Spanish']
      },
      {
        id: 4,
        name: 'David Kim',
        specialties: ['Strength Training', 'Powerlifting', 'Sports Performance'],
        hourlyRate: 90,
        rating: 4.7,
        reviews: 73,
        location: 'Manhattan, NY',
        distance: 1.5,
        coordinates: { lat: 40.7505, lng: -73.9934 },
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
        verified: true,
        bio: 'Competition powerlifter and strength coach helping clients build functional strength.',
        experience: '7 years',
        certifications: ['NSCA-CSCS', 'USA Powerlifting'],
        availability: ['Morning', 'Evening'],
        languages: ['English', 'Korean']
      }
    ];

    setTrainers(mockTrainers);
    setFilteredTrainers(mockTrainers);
  }, []);

  useEffect(() => {
    // Filter trainers based on search and filters
    let filtered = trainers;

    if (searchTerm) {
      filtered = filtered.filter(trainer => 
        trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (filters.specialty) {
      filtered = filtered.filter(trainer => 
        trainer.specialties.includes(filters.specialty)
      );
    }

    filtered = filtered.filter(trainer => 
      trainer.hourlyRate >= filters.priceRange[0] && 
      trainer.hourlyRate <= filters.priceRange[1] &&
      trainer.rating >= filters.rating &&
      trainer.distance <= filters.distance
    );

    setFilteredTrainers(filtered);
  }, [searchTerm, filters, trainers]);

  // Google Maps Components
  const MapComponent = ({ trainers }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
      if (mapRef.current && !map) {
        const googleMap = new window.google.maps.Map(mapRef.current, {
          center: { lat: 40.7589, lng: -73.9851 },
          zoom: 12,
          styles: [
            {
              "featureType": "all",
              "elementType": "all",
              "stylers": [{"saturation": -100}, {"lightness": 50}]
            },
            {
              "featureType": "road.highway",
              "elementType": "all",
              "stylers": [{"visibility": "simplified"}]
            },
            {
              "featureType": "road.arterial",
              "elementType": "labels.icon",
              "stylers": [{"visibility": "off"}]
            }
          ],
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true
        });
        setMap(googleMap);
      }
    }, [map]);

    useEffect(() => {
      if (map && trainers.length > 0) {
        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));
        
        // Create new markers
        const newMarkers = trainers.map(trainer => {
          const marker = new window.google.maps.Marker({
            position: trainer.coordinates,
            map: map,
            title: trainer.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="15" fill="#00d4aa" stroke="white" stroke-width="3"/>
                  <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold">💪</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20)
            }
          });

          marker.addListener('click', () => {
            setSelectedTrainer(trainer);
          });

          return marker;
        });
        
        setMarkers(newMarkers);
        
        if (newMarkers.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          trainers.forEach(trainer => bounds.extend(trainer.coordinates));
          map.fitBounds(bounds);
        }
      }
    }, [map, trainers, markers]);

    return (
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '400px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      />
    );
  };

  const MapWrapper = ({ trainers }) => {
    const render = (status) => {
      switch (status) {
        case Status.LOADING:
          return (
            <div style={{
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--glass-bg)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
                <div>Loading map...</div>
              </div>
            </div>
          );
        case Status.FAILURE:
          return (
            <div style={{
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--glass-bg)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                <div>Error loading map</div>
              </div>
            </div>
          );
        default:
          return <MapComponent trainers={trainers} />;
      }
    };

    return (
      <Wrapper 
        apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} 
        render={render}
      />
    );
  };

  const TrainerCard = ({ trainer }) => (
    <div className="pro-card" style={{ marginBottom: 'var(--space-lg)' }}>
      <div style={{
        display: 'flex',
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-md)'
      }}>
        <div style={{ position: 'relative' }}>
          <img
            src={trainer.avatar}
            alt={trainer.name}
            style={{
              width: '100px',
              height: '100px',
              borderRadius: 'var(--radius-lg)',
              objectFit: 'cover'
            }}
          />
          {trainer.verified && (
            <div style={{
              position: 'absolute',
              bottom: '-5px',
              right: '-5px',
              background: 'var(--success)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid var(--primary-bg)',
              fontSize: '14px'
            }}>
              ✓
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: 'var(--space-xs)'
          }}>
            {trainer.name}
          </h3>
          
          <div className="pro-rating" style={{ marginBottom: 'var(--space-sm)' }}>
            <span className="star">⭐</span>
            <span style={{ fontWeight: '600' }}>{trainer.rating}</span>
            <span style={{ color: 'var(--text-muted)' }}>({trainer.reviews} reviews)</span>
            <span style={{ 
              color: 'var(--text-muted)', 
              fontSize: '14px',
              marginLeft: 'var(--space-sm)'
            }}>
              📍 {trainer.distance} km away
            </span>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-xs)',
            marginBottom: 'var(--space-md)'
          }}>
            {trainer.specialties.map((specialty, idx) => (
              <span
                key={idx}
                style={{
                  background: 'var(--card-bg)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {specialty}
              </span>
            ))}
          </div>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            marginBottom: 'var(--space-md)',
            lineHeight: '1.5'
          }}>
            {trainer.bio}
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--accent-primary)'
              }}>
                ${trainer.hourlyRate}/hour
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-muted)'
              }}>
                {trainer.experience} experience
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button 
                className="btn-secondary"
                onClick={() => handleViewProfile(trainer)}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  fontSize: '14px',
                  background: 'rgba(196, 214, 0, 0.1)',
                  borderColor: 'var(--accent-primary)',
                  color: 'var(--accent-primary)'
                }}
              >
                👤 View Profile
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleBookSession(trainer)}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  fontSize: '14px',
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                  color: '#000000',
                  fontWeight: '600'
                }}
              >
                📅 Book Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="trainer-search">
      {/* Header */}
      <div style={{
        padding: 'var(--space-xl) var(--space-lg)',
        background: 'linear-gradient(135deg, var(--primary-bg) 0%, var(--secondary-bg) 100%)'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: 'var(--space-sm)',
          textAlign: 'center'
        }}>
          Find Your Perfect Trainer
        </h1>
        
        {/* Search Bar */}
        <div className="search-container" style={{ marginBottom: 'var(--space-lg)' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Quick Filters */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 'var(--space-lg)'
        }}>
          {['All', 'Weight Loss', 'Strength Training', 'Yoga', 'HIIT'].map((filter) => (
            <button
              key={filter}
              className={filters.specialty === (filter === 'All' ? '' : filter) ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setFilters({...filters, specialty: filter === 'All' ? '' : filter})}
              style={{
                padding: 'var(--space-sm) var(--space-md)',
                fontSize: '14px'
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-sm)'
        }}>
          <button
            className={viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setViewMode('list')}
            style={{ padding: 'var(--space-sm) var(--space-lg)', fontSize: '14px' }}
          >
            📋 List View
          </button>
          <button
            className={viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setViewMode('map')}
            style={{ padding: 'var(--space-sm) var(--space-lg)', fontSize: '14px' }}
          >
            🗺️ Map View
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--space-lg)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-lg)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600'
          }}>
            {filteredTrainers.length} trainers found
          </h2>
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: 'var(--space-md)',
                textAlign: 'center'
              }}>
                🗺️ Trainer Locations
              </h3>
              <MapWrapper trainers={filteredTrainers} />
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <>
            {filteredTrainers.length > 0 ? (
              filteredTrainers.map((trainer) => (
                <TrainerCard key={trainer.id} trainer={trainer} />
              ))
            ) : (
              <div className="glass-card" style={{
                padding: 'var(--space-2xl)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '60px', marginBottom: 'var(--space-md)' }}>
                  🔍
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: 'var(--space-sm)'
                }}>
                  No trainers found
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Try adjusting your search criteria or filters
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Selected Trainer Info in Map Mode */}
      {viewMode === 'map' && selectedTrainer && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '20px',
          right: '20px',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{
            padding: 'var(--space-lg)',
            border: '1px solid var(--accent-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <img
                src={selectedTrainer.avatar}
                alt={selectedTrainer.name}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>
                  {selectedTrainer.name}
                </h3>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  ⭐ {selectedTrainer.rating} • ${selectedTrainer.hourlyRate}/hr
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedTrainer(null)}
                  style={{ padding: 'var(--space-sm)', fontSize: '12px' }}
                >
                  ✕
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setShowBookingModal(true)}
                  style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: '12px' }}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }}></div>
    </div>
  );
};

export default EnhancedTrainerSearch;