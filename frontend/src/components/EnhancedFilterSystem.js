import React, { useState, useEffect } from 'react';
import { AnimatedDumbbell, AnimatedStar, AnimatedCheckmark } from './AnimatedSVGs';

// Enhanced Filter System Component
const EnhancedFilterSystem = ({ onFiltersChange, userLocation = null }) => {
  const [filters, setFilters] = useState({
    specialties: [],
    categories: [],
    priceRange: { min: 0, max: 150 },
    experience: 0,
    rating: 0,
    availability: 'any',
    certifiedOnly: false,
    location: {
      radius: 25,
      enabled: false
    }
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [specialtyCategories, setSpecialtyCategories] = useState([]);
  const [popularSpecialties, setPopularSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Load specialty data from backend
  useEffect(() => {
    loadSpecialtyData();
  }, []);

  const loadSpecialtyData = async () => {
    try {
      const [categoriesRes, popularRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/specialties/categories`),
        fetch(`${API_BASE_URL}/api/specialties/popular`)
      ]);

      if (categoriesRes.ok && popularRes.ok) {
        const categoriesData = await categoriesRes.json();
        const popularData = await popularRes.json();
        
        setSpecialtyCategories(categoriesData.categories || []);
        setPopularSpecialties(popularData.popular_specialties || []);
      }
    } catch (error) {
      console.error('Error loading specialty data:', error);
      // Fallback data
      setPopularSpecialties([
        { specialty: 'Weight Loss', category: 'Weight Management', animated_svg: 'AnimatedStar' },
        { specialty: 'Strength Training', category: 'Strength & Power', animated_svg: 'AnimatedDumbbell' },
        { specialty: 'HIIT', category: 'Cardio & Endurance', animated_svg: 'AnimatedStar' },
        { specialty: 'Yoga', category: 'Flexibility & Recovery', animated_svg: 'AnimatedStar' },
        { specialty: 'Boxing Training', category: 'Combat & Martial Arts', animated_svg: 'AnimatedStar' },
        { specialty: 'Running Coaching', category: 'Cardio & Endurance', animated_svg: 'AnimatedStar' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Update filters and notify parent
  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  // Toggle specialty filter
  const toggleSpecialty = (specialty) => {
    const newSpecialties = filters.specialties.includes(specialty)
      ? filters.specialties.filter(s => s !== specialty)
      : [...filters.specialties, specialty];
    
    updateFilters({ specialties: newSpecialties });
  };

  // Toggle category filter
  const toggleCategory = (categoryKey) => {
    const newCategories = filters.categories.includes(categoryKey)
      ? filters.categories.filter(c => c !== categoryKey)
      : [...filters.categories, categoryKey];
    
    updateFilters({ categories: newCategories });
  };

  // Clear all filters
  const clearAllFilters = () => {
    const clearedFilters = {
      specialties: [],
      categories: [],
      priceRange: { min: 0, max: 150 },
      experience: 0,
      rating: 0,
      availability: 'any',
      certifiedOnly: false,
      location: {
        radius: 25,
        enabled: false
      }
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  if (loading) {
    return (
      <div style={{
        padding: 'var(--space-lg)',
        textAlign: 'center'
      }}>
        <AnimatedDumbbell size={32} color="#C4D600" />
        <p style={{
          marginTop: 'var(--space-sm)',
          color: 'var(--text-secondary)'
        }}>
          Loading filters...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--glass-bg)',
      borderRadius: 'var(--border-radius)',
      padding: 'var(--space-lg)',
      marginBottom: 'var(--space-lg)'
    }}>
      {/* Filter Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-lg)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)'
        }}>
          🔍 Find Your Perfect Trainer
        </h3>
        
        <button
          onClick={clearAllFilters}
          style={{
            background: 'none',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'var(--text-secondary)',
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: 'var(--border-radius)',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Clear All
        </button>
      </div>

      {/* Popular Specialties - Quick Filters */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: 'var(--space-md)',
          color: 'var(--text-secondary)'
        }}>
          Popular Specialties
        </h4>
        
        <div style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          flexWrap: 'wrap'
        }}>
          {popularSpecialties.slice(0, 8).map((item, index) => (
            <FilterChip
              key={item.specialty}
              label={item.specialty}
              active={filters.specialties.includes(item.specialty)}
              onClick={() => toggleSpecialty(item.specialty)}
              category={item.category}
            />
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: 'var(--space-md)',
          color: 'var(--text-secondary)'
        }}>
          Price Range (per hour)
        </h4>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)'
        }}>
          <input
            type="range"
            min="0"
            max="150"
            value={filters.priceRange.max}
            onChange={(e) => updateFilters({
              priceRange: { ...filters.priceRange, max: parseInt(e.target.value) }
            })}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: `linear-gradient(to right, #C4D600 0%, #C4D600 ${(filters.priceRange.max/150)*100}%, rgba(255,255,255,0.2) ${(filters.priceRange.max/150)*100}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#C4D600',
            minWidth: '60px'
          }}>
            ${filters.priceRange.min} - ${filters.priceRange.max}
          </span>
        </div>
      </div>

      {/* Quick Filters Row */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-sm)',
        flexWrap: 'wrap',
        marginBottom: 'var(--space-lg)'
      }}>
        <FilterToggle
          label="Certified Only"
          active={filters.certifiedOnly}
          onClick={() => updateFilters({ certifiedOnly: !filters.certifiedOnly })}
          icon="🏆"
        />
        
        <FilterToggle
          label="Available Today"
          active={filters.availability === 'today'}
          onClick={() => updateFilters({ 
            availability: filters.availability === 'today' ? 'any' : 'today' 
          })}
          icon="📅"
        />
        
        {userLocation && (
          <FilterToggle
            label="Near Me"
            active={filters.location.enabled}
            onClick={() => updateFilters({
              location: { ...filters.location, enabled: !filters.location.enabled }
            })}
            icon="📍"
          />
        )}
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={{
          width: '100%',
          background: 'rgba(196, 214, 0, 0.1)',
          border: '1px solid rgba(196, 214, 0, 0.3)',
          color: '#C4D600',
          padding: 'var(--space-md)',
          borderRadius: 'var(--border-radius)',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-sm)',
          marginBottom: showAdvanced ? 'var(--space-lg)' : 0
        }}
      >
        {showAdvanced ? '▼' : '▶'} Advanced Filters
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div style={{
          padding: 'var(--space-lg)',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 'var(--border-radius)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Specialty Categories */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: 'var(--space-md)',
              color: 'var(--text-secondary)'
            }}>
              Specialty Categories
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-sm)'
            }}>
              {specialtyCategories.map((category) => (
                <CategoryCard
                  key={category.key}
                  category={category}
                  active={filters.categories.includes(category.key)}
                  onClick={() => toggleCategory(category.key)}
                />
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: 'var(--space-md)',
              color: 'var(--text-secondary)'
            }}>
              Minimum Experience
            </h4>
            
            <div style={{
              display: 'flex',
              gap: 'var(--space-sm)',
              flexWrap: 'wrap'
            }}>
              {[0, 1, 2, 5, 10].map((years) => (
                <FilterChip
                  key={years}
                  label={years === 0 ? 'Any' : `${years}+ years`}
                  active={filters.experience === years}
                  onClick={() => updateFilters({ experience: years })}
                />
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: 'var(--space-md)',
              color: 'var(--text-secondary)'
            }}>
              Minimum Rating
            </h4>
            
            <div style={{
              display: 'flex',
              gap: 'var(--space-sm)'
            }}>
              {[0, 3, 4, 4.5].map((rating) => (
                <FilterChip
                  key={rating}
                  label={rating === 0 ? 'Any' : `${rating}+ ⭐`}
                  active={filters.rating === rating}
                  onClick={() => updateFilters({ rating })}
                />
              ))}
            </div>
          </div>

          {/* Location Radius */}
          {userLocation && filters.location.enabled && (
            <div>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: 'var(--space-md)',
                color: 'var(--text-secondary)'
              }}>
                Search Radius
              </h4>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)'
              }}>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={filters.location.radius}
                  onChange={(e) => updateFilters({
                    location: { ...filters.location, radius: parseInt(e.target.value) }
                  })}
                  style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    background: `linear-gradient(to right, #C4D600 0%, #C4D600 ${(filters.location.radius/100)*100}%, rgba(255,255,255,0.2) ${(filters.location.radius/100)*100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#C4D600',
                  minWidth: '60px'
                }}>
                  {filters.location.radius} km
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {(filters.specialties.length > 0 || filters.categories.length > 0 || filters.certifiedOnly) && (
        <div style={{
          marginTop: 'var(--space-lg)',
          padding: 'var(--space-md)',
          background: 'rgba(196, 214, 0, 0.1)',
          borderRadius: 'var(--border-radius)',
          border: '1px solid rgba(196, 214, 0, 0.3)'
        }}>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-sm)'
          }}>
            Active Filters:
          </div>
          
          <div style={{
            display: 'flex',
            gap: 'var(--space-xs)',
            flexWrap: 'wrap'
          }}>
            {filters.specialties.map((specialty) => (
              <ActiveFilterTag
                key={specialty}
                label={specialty}
                onRemove={() => toggleSpecialty(specialty)}
              />
            ))}
            
            {filters.categories.map((categoryKey) => {
              const category = specialtyCategories.find(c => c.key === categoryKey);
              return category ? (
                <ActiveFilterTag
                  key={categoryKey}
                  label={`${category.name} Category`}
                  onRemove={() => toggleCategory(categoryKey)}
                />
              ) : null;
            })}
            
            {filters.certifiedOnly && (
              <ActiveFilterTag
                label="Certified Only"
                onRemove={() => updateFilters({ certifiedOnly: false })}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Filter Chip Component
const FilterChip = ({ label, active, onClick, category }) => (
  <button
    onClick={onClick}
    style={{
      padding: 'var(--space-sm) var(--space-md)',
      background: active ? '#C4D600' : 'rgba(255, 255, 255, 0.1)',
      color: active ? 'black' : 'var(--text-primary)',
      border: active ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: active ? '600' : '400',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap'
    }}
  >
    {label}
  </button>
);

// Filter Toggle Component
const FilterToggle = ({ label, active, onClick, icon }) => (
  <button
    onClick={onClick}
    style={{
      padding: 'var(--space-sm) var(--space-md)',
      background: active ? 'rgba(196, 214, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
      color: active ? '#C4D600' : 'var(--text-secondary)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: 'var(--border-radius)',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-xs)'
    }}
  >
    <span>{icon}</span>
    {label}
  </button>
);

// Category Card Component
const CategoryCard = ({ category, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: 'var(--space-md)',
      background: active ? 'rgba(196, 214, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
      border: `1px solid ${active ? '#C4D600' : 'rgba(255, 255, 255, 0.1)'}`,
      borderRadius: 'var(--border-radius)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'left'
    }}
  >
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm)',
      marginBottom: 'var(--space-xs)'
    }}>
      <span style={{ fontSize: '18px' }}>{category.icon}</span>
      <span style={{
        fontSize: '14px',
        fontWeight: '600',
        color: active ? '#C4D600' : 'var(--text-primary)'
      }}>
        {category.name}
      </span>
    </div>
    
    <div style={{
      fontSize: '12px',
      color: 'var(--text-secondary)'
    }}>
      {category.specialty_count} specialties
    </div>
  </button>
);

// Active Filter Tag Component
const ActiveFilterTag = ({ label, onRemove }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    padding: 'var(--space-xs) var(--space-sm)',
    background: '#C4D600',
    color: 'black',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  }}>
    {label}
    <button
      onClick={onRemove}
      style={{
        background: 'none',
        border: 'none',
        color: 'black',
        cursor: 'pointer',
        fontSize: '14px',
        lineHeight: 1,
        padding: 0
      }}
    >
      ×
    </button>
  </span>
);

export default EnhancedFilterSystem;
