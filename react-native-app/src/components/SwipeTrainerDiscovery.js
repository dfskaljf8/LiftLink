import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../styles/AppStyles';
import { SuccessAnimation } from './Animations';

const { width, height } = Dimensions.get('window');

/**
 * Tinder-Style Swipe Trainer Discovery
 * Swipe right to like/save, swipe left to pass
 */

const SwipeTrainerDiscovery = ({ trainers, onTrainerLiked, onTrainerPassed, onExit, onBookSession }) => {
  const swiperRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedTrainer, setMatchedTrainer] = useState(null);

  const handleSwipeRight = (cardIndex) => {
    const trainer = trainers[cardIndex];
    setMatchedTrainer(trainer);
    setShowMatch(true);
    
    setTimeout(() => {
      setShowMatch(false);
      onTrainerLiked(trainer);
    }, 1500);
  };

  const handleSwipeLeft = (cardIndex) => {
    const trainer = trainers[cardIndex];
    onTrainerPassed(trainer);
  };

  const renderCard = (trainer) => {
    if (!trainer) return null;

    return (
      <View style={styles.card}>
        {/* Trainer Photo */}
        <View style={styles.photoContainer}>
          {trainer.photo_url ? (
            <Image source={{ uri: trainer.photo_url }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Icon name="person" size={80} color={colors.textSecondary} />
            </View>
          )}
          
          {/* Verification Badge */}
          {trainer.cert_verified && (
            <View style={styles.verifiedBadge}>
              <Icon name="verified" size={24} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Trainer Info */}
        <ScrollView style={styles.infoContainer} showsVerticalScrollIndicator={false}>
          {/* Name and Age */}
          <View style={styles.header}>
            <Text style={styles.name}>{trainer.name}</Text>
            <Text style={styles.age}>{trainer.age || '25'}</Text>
          </View>

          {/* Rating */}
          {trainer.rating && (
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name="star"
                  size={18}
                  color={star <= Math.round(trainer.rating) ? colors.warning : colors.textSecondary}
                />
              ))}
              <Text style={styles.ratingText}>
                {trainer.rating.toFixed(1)} ({trainer.reviews || 0} reviews)
              </Text>
            </View>
          )}

          {/* Certifications */}
          {trainer.certifications && trainer.certifications.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="verified-user" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Certifications</Text>
              </View>
              {trainer.certifications.map((cert, index) => (
                <View key={index} style={styles.certItem}>
                  <Icon name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.certText}>{cert}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Specialties */}
          {trainer.specialties && trainer.specialties.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="fitness-center" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Specialties</Text>
              </View>
              <View style={styles.tagsContainer}>
                {trainer.specialties.map((specialty, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Session Types */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="event" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Session Types</Text>
            </View>
            <View style={styles.sessionTypes}>
              <View style={styles.sessionType}>
                <Icon name="videocam" size={18} color={colors.secondary} />
                <Text style={styles.sessionTypeText}>Virtual - ${trainer.virtual_rate || 50}/hr</Text>
              </View>
              <View style={styles.sessionType}>
                <Icon name="place" size={18} color={colors.secondary} />
                <Text style={styles.sessionTypeText}>In-Person - ${trainer.in_person_rate || 75}/hr</Text>
              </View>
            </View>
          </View>

          {/* Availability */}
          {trainer.availability && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="schedule" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Availability</Text>
              </View>
              <Text style={styles.availabilityText}>{trainer.availability}</Text>
            </View>
          )}

          {/* Location */}
          {trainer.location && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="location-on" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Location</Text>
              </View>
              <Text style={styles.locationText}>{trainer.location}</Text>
            </View>
          )}

          {/* Bio */}
          {trainer.bio && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="info" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>About</Text>
              </View>
              <Text style={styles.bioText}>{trainer.bio}</Text>
            </View>
          )}

          {/* Book Session Button */}
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => onBookSession(trainer)}
          >
            <Icon name="event-available" size={20} color={colors.text} />
            <Text style={styles.bookButtonText}>Book Session</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderNoMoreCards = () => (
    <View style={styles.noMoreCards}>
      <Icon name="explore-off" size={60} color={colors.textSecondary} />
      <Text style={styles.noMoreCardsText}>No more trainers</Text>
      <Text style={styles.noMoreCardsSubtext}>Check back later for more!</Text>
      <TouchableOpacity style={styles.exitButton} onPress={onExit}>
        <Text style={styles.exitButtonText}>Back to List</Text>
      </TouchableOpacity>
    </View>
  );

  if (!trainers || trainers.length === 0) {
    return renderNoMoreCards();
  }

  return (
    <View style={styles.container}>
      {/* Header with Exit Button */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Discover Trainers</Text>
        <TouchableOpacity style={styles.exitIconButton} onPress={onExit}>
          <Icon name="close" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {trainers.length}
        </Text>
      </View>

      {/* Swiper */}
      <Swiper
        ref={swiperRef}
        cards={trainers}
        renderCard={renderCard}
        onSwipedRight={handleSwipeRight}
        onSwipedLeft={handleSwipeLeft}
        onSwiped={(cardIndex) => setCurrentIndex(cardIndex + 1)}
        cardIndex={currentIndex}
        backgroundColor="transparent"
        stackSize={3}
        stackSeparation={15}
        overlayLabels={{
          left: {
            title: 'PASS',
            style: {
              label: {
                backgroundColor: colors.error,
                color: colors.text,
                fontSize: 24,
                fontWeight: 'bold',
                borderRadius: 10,
                padding: 10,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                marginTop: 30,
                marginLeft: -30,
              },
            },
          },
          right: {
            title: 'LIKE',
            style: {
              label: {
                backgroundColor: colors.success,
                color: colors.text,
                fontSize: 24,
                fontWeight: 'bold',
                borderRadius: 10,
                padding: 10,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginTop: 30,
                marginLeft: 30,
              },
            },
          },
        }}
        animateOverlayLabelsOpacity
        animateCardOpacity
        verticalSwipe={false}
        disableTopSwipe
        disableBottomSwipe
      >
        {renderNoMoreCards()}
      </Swiper>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => swiperRef.current.swipeLeft()}
        >
          <Icon name="close" size={32} color={colors.error} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.infoButton]}
          onPress={() => Alert.alert('Trainer Info', 'Scroll down to see full profile')}
        >
          <Icon name="info" size={28} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => swiperRef.current.swipeRight()}
        >
          <Icon name="favorite" size={32} color={colors.success} />
        </TouchableOpacity>
      </View>

      {/* Match Animation */}
      {showMatch && matchedTrainer && (
        <View style={styles.matchOverlay}>
          <SuccessAnimation size={150} />
          <Text style={styles.matchText}>It's a Match!</Text>
          <Text style={styles.matchSubtext}>You liked {matchedTrainer.name}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  exitIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  card: {
    flex: 0.75,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginHorizontal: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  photoContainer: {
    height: height * 0.35,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 8,
  },
  infoContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  age: {
    fontSize: 22,
    color: colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  certText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  sessionTypes: {
    marginTop: 5,
  },
  sessionType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTypeText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  availabilityText: {
    fontSize: 14,
    color: colors.text,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
  },
  bioText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  bookButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  passButton: {
    backgroundColor: colors.surface,
  },
  likeButton: {
    backgroundColor: colors.surface,
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  infoButton: {
    backgroundColor: colors.surface,
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  noMoreCards: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noMoreCardsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
  },
  noMoreCardsSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 10,
    marginBottom: 30,
  },
  exitButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  matchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  matchText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.success,
    marginTop: 20,
  },
  matchSubtext: {
    fontSize: 18,
    color: colors.text,
    marginTop: 10,
  },
});

export default SwipeTrainerDiscovery;
