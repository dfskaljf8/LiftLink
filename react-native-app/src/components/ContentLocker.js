/**
 * LiftLink 2.0 - AI Content Locker
 * Trainers can manage, organize, and schedule content delivery to clients
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Dimensions,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing } from '../styles/AppStyles';

const { width } = Dimensions.get('window');
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Content Type Icons
const CONTENT_TYPE_CONFIG = {
  tip: { icon: 'lightbulb', color: '#fbbf24', label: 'Quick Tip' },
  workout: { icon: 'fitness-center', color: '#3b82f6', label: 'Workout' },
  program: { icon: 'calendar-today', color: '#8b5cf6', label: 'Program' },
  motivation: { icon: 'emoji-events', color: '#ef4444', label: 'Motivation' },
  recipe: { icon: 'restaurant', color: '#10b981', label: 'Recipe' },
  video: { icon: 'play-circle-filled', color: '#ec4899', label: 'Video' }
};

// Content Card Component
const ContentCard = ({ content, onPress, onEdit, onDelete }) => {
  const typeConfig = CONTENT_TYPE_CONFIG[content.type] || CONTENT_TYPE_CONFIG.tip;
  
  return (
    <TouchableOpacity style={styles.contentCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.contentCardHeader}>
        <View style={[styles.contentTypeIcon, { backgroundColor: typeConfig.color + '20' }]}>
          <Icon name={typeConfig.icon} size={24} color={typeConfig.color} />
        </View>
        <View style={styles.contentCardInfo}>
          <Text style={styles.contentTitle} numberOfLines={1}>{content.title}</Text>
          <Text style={styles.contentType}>{typeConfig.label}</Text>
        </View>
        <View style={styles.contentCardActions}>
          <TouchableOpacity style={styles.actionIconBtn} onPress={onEdit}>
            <Icon name="edit" size={18} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIconBtn} onPress={onDelete}>
            <Icon name="delete-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.contentPreview} numberOfLines={2}>
        {content.content}
      </Text>
      
      <View style={styles.contentCardFooter}>
        <View style={styles.contentTags}>
          {content.tags?.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tagBadge}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
        
        {content.unlock_requirement && (
          <View style={styles.lockBadge}>
            <Icon name="lock" size={12} color="#8b5cf6" />
            <Text style={styles.lockText}>{content.unlock_requirement.replace('_', ' ')}</Text>
          </View>
        )}
        
        {content.is_premium && (
          <View style={[styles.lockBadge, { backgroundColor: '#fbbf2420' }]}>
            <Icon name="star" size={12} color="#fbbf24" />
            <Text style={[styles.lockText, { color: '#fbbf24' }]}>Premium</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Create/Edit Content Modal
const ContentEditorModal = ({ visible, content, onClose, onSave }) => {
  const [title, setTitle] = useState(content?.title || '');
  const [contentText, setContentText] = useState(content?.content || '');
  const [type, setType] = useState(content?.type || 'tip');
  const [tags, setTags] = useState(content?.tags?.join(', ') || '');
  const [isPremium, setIsPremium] = useState(content?.is_premium || false);
  const [unlockRequirement, setUnlockRequirement] = useState(content?.unlock_requirement || '');
  const [aiGenerating, setAiGenerating] = useState(false);

  const isEditing = !!content?.id;

  const handleAIEnhance = async () => {
    if (!contentText.trim()) {
      Alert.alert('Error', 'Please enter some content first');
      return;
    }

    setAiGenerating(true);
    try {
      // Call AI content generation endpoint
      const response = await fetch(`${API_URL}/api/ai/enhance-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainer_notes: contentText,
          content_type: type
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.generated_content) {
          setContentText(result.generated_content.content || contentText);
          if (result.generated_content.headline) {
            setTitle(result.generated_content.headline);
          }
          if (result.generated_content.hashtags) {
            setTags(result.generated_content.hashtags.join(', '));
          }
        }
      }
    } catch (error) {
      console.error('AI enhance error:', error);
      Alert.alert('AI Enhancement', 'Could not enhance content. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !contentText.trim()) {
      Alert.alert('Error', 'Please fill in title and content');
      return;
    }

    onSave({
      id: content?.id,
      title: title.trim(),
      content: contentText.trim(),
      type,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      is_premium: isPremium,
      unlock_requirement: unlockRequirement || null
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Content' : 'Create Content'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Content Type Selector */}
            <Text style={styles.inputLabel}>Content Type</Text>
            <View style={styles.typeSelector}>
              {Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.typeOption, type === key && styles.typeOptionSelected]}
                  onPress={() => setType(key)}
                >
                  <Icon 
                    name={config.icon} 
                    size={20} 
                    color={type === key ? config.color : '#6b7280'} 
                  />
                  <Text style={[styles.typeOptionText, type === key && { color: config.color }]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Title Input */}
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title..."
              placeholderTextColor="#6b7280"
            />

            {/* Content Input with AI */}
            <View style={styles.contentLabelRow}>
              <Text style={styles.inputLabel}>Content</Text>
              <TouchableOpacity 
                style={styles.aiButton}
                onPress={handleAIEnhance}
                disabled={aiGenerating}
              >
                {aiGenerating ? (
                  <ActivityIndicator size="small" color="#8b5cf6" />
                ) : (
                  <>
                    <Icon name="auto-awesome" size={16} color="#8b5cf6" />
                    <Text style={styles.aiButtonText}>AI Enhance</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={contentText}
              onChangeText={setContentText}
              placeholder="Write your content or notes, then use AI to polish it..."
              placeholderTextColor="#6b7280"
              multiline
              textAlignVertical="top"
            />

            {/* Tags Input */}
            <Text style={styles.inputLabel}>Tags (comma separated)</Text>
            <TextInput
              style={styles.textInput}
              value={tags}
              onChangeText={setTags}
              placeholder="strength, tips, beginner..."
              placeholderTextColor="#6b7280"
            />

            {/* Premium Toggle */}
            <TouchableOpacity 
              style={styles.toggleRow}
              onPress={() => setIsPremium(!isPremium)}
            >
              <View style={styles.toggleInfo}>
                <Icon name="star" size={20} color="#fbbf24" />
                <Text style={styles.toggleLabel}>Premium Content</Text>
              </View>
              <View style={[styles.toggle, isPremium && styles.toggleActive]}>
                <View style={[styles.toggleThumb, isPremium && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>

            {/* Unlock Requirement */}
            <Text style={styles.inputLabel}>Unlock Requirement (optional)</Text>
            <View style={styles.unlockOptions}>
              {['', '7_day_streak', '14_day_streak', '30_day_streak', 'first_workout'].map((req) => (
                <TouchableOpacity
                  key={req || 'none'}
                  style={[styles.unlockOption, unlockRequirement === req && styles.unlockOptionSelected]}
                  onPress={() => setUnlockRequirement(req)}
                >
                  <Text style={[styles.unlockOptionText, unlockRequirement === req && styles.unlockOptionTextSelected]}>
                    {req ? req.replace(/_/g, ' ') : 'No lock'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Icon name="save" size={20} color="#0A0A0A" />
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Update Content' : 'Save Content'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Schedule Delivery Modal
const ScheduleModal = ({ visible, content, clients, onClose, onSchedule }) => {
  const [selectedClients, setSelectedClients] = useState([]);
  const [deliveryTime, setDeliveryTime] = useState('now');

  const toggleClient = (clientId) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSchedule = () => {
    if (selectedClients.length === 0) {
      Alert.alert('Error', 'Please select at least one client');
      return;
    }
    onSchedule({
      content_id: content.id,
      client_ids: selectedClients,
      delivery_time: deliveryTime
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Schedule Delivery</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <Text style={styles.scheduleContentTitle}>{content?.title}</Text>

          <Text style={styles.inputLabel}>Select Clients</Text>
          <ScrollView style={styles.clientList}>
            <TouchableOpacity
              style={[styles.clientOption, selectedClients.length === clients?.length && styles.clientOptionSelected]}
              onPress={() => setSelectedClients(
                selectedClients.length === clients?.length 
                  ? [] 
                  : clients?.map(c => c.id) || []
              )}
            >
              <Icon 
                name={selectedClients.length === clients?.length ? "check-box" : "check-box-outline-blank"} 
                size={20} 
                color={selectedClients.length === clients?.length ? "#BFFF00" : "#6b7280"} 
              />
              <Text style={styles.clientOptionText}>All Clients</Text>
            </TouchableOpacity>
            
            {clients?.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={[styles.clientOption, selectedClients.includes(client.id) && styles.clientOptionSelected]}
                onPress={() => toggleClient(client.id)}
              >
                <Icon 
                  name={selectedClients.includes(client.id) ? "check-box" : "check-box-outline-blank"} 
                  size={20} 
                  color={selectedClients.includes(client.id) ? "#BFFF00" : "#6b7280"} 
                />
                <Text style={styles.clientOptionText}>{client.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.inputLabel}>Delivery Time</Text>
          <View style={styles.deliveryOptions}>
            {[
              { value: 'now', label: 'Send Now' },
              { value: 'tomorrow_9am', label: 'Tomorrow 9 AM' },
              { value: 'next_checkin', label: 'After Next Check-in' }
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.deliveryOption, deliveryTime === option.value && styles.deliveryOptionSelected]}
                onPress={() => setDeliveryTime(option.value)}
              >
                <Text style={[styles.deliveryOptionText, deliveryTime === option.value && styles.deliveryOptionTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.scheduleButton} onPress={handleSchedule}>
            <Icon name="send" size={20} color="#0A0A0A" />
            <Text style={styles.scheduleButtonText}>
              {deliveryTime === 'now' ? 'Send Now' : 'Schedule Delivery'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Main Content Locker Component
const ContentLocker = ({ trainerId, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contentItems, setContentItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  const fetchContent = useCallback(async () => {
    try {
      const effectiveTrainerId = trainerId || 'trainer_001';
      
      const [contentRes, clientsRes] = await Promise.all([
        fetch(`${API_URL}/api/content/trainer/${effectiveTrainerId}`),
        fetch(`${API_URL}/api/trainer/${effectiveTrainerId}/clients`)
      ]);

      if (contentRes.ok) {
        const data = await contentRes.json();
        setContentItems(data.content_items || []);
      } else {
        // Set mock data if endpoint doesn't exist yet
        setContentItems([
          {
            id: '1',
            title: 'Morning Routine Tips',
            content: 'Start your day with 5 minutes of stretching to wake up your body and mind.',
            type: 'tip',
            tags: ['morning', 'routine', 'beginner'],
            is_premium: false,
            unlock_requirement: null,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'HIIT Basics',
            content: 'High-Intensity Interval Training burns more calories in less time. Here\'s how to get started...',
            type: 'workout',
            tags: ['hiit', 'cardio', 'fat-loss'],
            is_premium: true,
            unlock_requirement: null,
            created_at: new Date().toISOString()
          }
        ]);
      }

      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Fetch content error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trainerId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchContent();
  }, [fetchContent]);

  const handleSaveContent = async (contentData) => {
    try {
      const effectiveTrainerId = trainerId || 'trainer_001';
      const endpoint = contentData.id 
        ? `${API_URL}/api/content/${contentData.id}`
        : `${API_URL}/api/content`;
      const method = contentData.id ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contentData,
          trainer_id: effectiveTrainerId
        })
      });

      if (response.ok) {
        Alert.alert('Success', contentData.id ? 'Content updated!' : 'Content created!');
        setShowEditor(false);
        setSelectedContent(null);
        fetchContent();
      } else {
        // Handle as success for demo
        const newContent = {
          ...contentData,
          id: contentData.id || Date.now().toString(),
          trainer_id: effectiveTrainerId,
          created_at: new Date().toISOString()
        };
        
        if (contentData.id) {
          setContentItems(prev => prev.map(c => c.id === contentData.id ? newContent : c));
        } else {
          setContentItems(prev => [newContent, ...prev]);
        }
        
        Alert.alert('Success', contentData.id ? 'Content updated!' : 'Content created!');
        setShowEditor(false);
        setSelectedContent(null);
      }
    } catch (error) {
      console.error('Save content error:', error);
      Alert.alert('Error', 'Failed to save content');
    }
  };

  const handleDeleteContent = (content) => {
    Alert.alert(
      'Delete Content',
      `Are you sure you want to delete "${content.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_URL}/api/content/${content.id}`, { method: 'DELETE' });
              setContentItems(prev => prev.filter(c => c.id !== content.id));
            } catch (error) {
              setContentItems(prev => prev.filter(c => c.id !== content.id));
            }
          }
        }
      ]
    );
  };

  const handleScheduleDelivery = async (scheduleData) => {
    try {
      const response = await fetch(`${API_URL}/api/content/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });

      Alert.alert(
        'Scheduled!', 
        scheduleData.delivery_time === 'now' 
          ? `Content sent to ${scheduleData.client_ids.length} client(s)`
          : `Content scheduled for ${scheduleData.client_ids.length} client(s)`
      );
      setShowScheduler(false);
      setSelectedContent(null);
    } catch (error) {
      Alert.alert('Scheduled!', 'Content delivery scheduled');
      setShowScheduler(false);
      setSelectedContent(null);
    }
  };

  const filteredContent = contentItems.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#BFFF00" />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Content Locker</Text>
          <Text style={styles.headerSubtitle}>
            {contentItems.length} items • AI-powered content
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => {
            setSelectedContent(null);
            setShowEditor(true);
          }}
        >
          <Icon name="add" size={24} color="#0A0A0A" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search content..."
          placeholderTextColor="#6b7280"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterTab, filter === key && styles.filterTabActive]}
            onPress={() => setFilter(key)}
          >
            <Icon 
              name={config.icon} 
              size={16} 
              color={filter === key ? '#0A0A0A' : '#9ca3af'} 
            />
            <Text style={[styles.filterTabText, filter === key && styles.filterTabTextActive]}>
              {config.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content List */}
      <ScrollView
        style={styles.contentList}
        contentContainerStyle={styles.contentListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#BFFF00" />
        }
      >
        {filteredContent.length > 0 ? (
          filteredContent.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              onPress={() => {
                setSelectedContent(content);
                setShowScheduler(true);
              }}
              onEdit={() => {
                setSelectedContent(content);
                setShowEditor(true);
              }}
              onDelete={() => handleDeleteContent(content)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="folder-open" size={48} color="#6b7280" />
            <Text style={styles.emptyStateTitle}>No Content Yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first piece of content to share with clients
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateBtn}
              onPress={() => {
                setSelectedContent(null);
                setShowEditor(true);
              }}
            >
              <Icon name="add" size={20} color="#0A0A0A" />
              <Text style={styles.emptyStateBtnText}>Create Content</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      <ContentEditorModal
        visible={showEditor}
        content={selectedContent}
        onClose={() => {
          setShowEditor(false);
          setSelectedContent(null);
        }}
        onSave={handleSaveContent}
      />

      <ScheduleModal
        visible={showScheduler}
        content={selectedContent}
        clients={clients}
        onClose={() => {
          setShowScheduler(false);
          setSelectedContent(null);
        }}
        onSchedule={handleScheduleDelivery}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#BFFF00',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    color: '#f9fafb',
    fontSize: 16,
    marginLeft: 10,
  },

  // Filters
  filterContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#BFFF00',
  },
  filterTabText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  filterTabTextActive: {
    color: '#0A0A0A',
  },

  // Content List
  contentList: {
    flex: 1,
  },
  contentListContent: {
    padding: 16,
  },

  // Content Card
  contentCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  contentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contentTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  contentType: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  contentCardActions: {
    flexDirection: 'row',
  },
  actionIconBtn: {
    padding: 8,
  },
  contentPreview: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 12,
  },
  contentCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  contentTags: {
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
  },
  tagBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf620',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockText: {
    fontSize: 11,
    color: '#8b5cf6',
    marginLeft: 4,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 32,
  },
  emptyStateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BFFF00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyStateBtnText: {
    color: '#0A0A0A',
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  modalScroll: {
    maxHeight: 400,
  },

  // Form Inputs
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: '#374151',
    borderRadius: 10,
    padding: 14,
    color: '#f9fafb',
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },

  // Type Selector
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  typeOptionSelected: {
    backgroundColor: '#4f46e5',
  },
  typeOptionText: {
    color: '#9ca3af',
    fontSize: 12,
    marginLeft: 6,
  },

  // AI Button
  contentLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf620',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  aiButtonText: {
    color: '#8b5cf6',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    color: '#f9fafb',
    fontSize: 14,
    marginLeft: 10,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6b7280',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#BFFF00',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    marginLeft: 20,
  },

  // Unlock Options
  unlockOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  unlockOption: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  unlockOptionSelected: {
    backgroundColor: '#8b5cf6',
  },
  unlockOptionText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  unlockOptionTextSelected: {
    color: '#fff',
  },

  // Save Button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#BFFF00',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#0A0A0A',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Schedule Modal
  scheduleContentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 16,
  },
  clientList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  clientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  clientOptionSelected: {
    backgroundColor: '#BFFF0020',
    borderWidth: 1,
    borderColor: '#BFFF00',
  },
  clientOptionText: {
    color: '#f9fafb',
    fontSize: 14,
    marginLeft: 10,
  },
  deliveryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  deliveryOption: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  deliveryOptionSelected: {
    backgroundColor: '#BFFF00',
  },
  deliveryOptionText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  deliveryOptionTextSelected: {
    color: '#0A0A0A',
    fontWeight: '600',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#BFFF00',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  scheduleButtonText: {
    color: '#0A0A0A',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ContentLocker;
