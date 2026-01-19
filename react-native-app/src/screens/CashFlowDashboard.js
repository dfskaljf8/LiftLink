/**
 * Cash Flow Dashboard - Revenue & Earnings Tracking
 * Shows Stripe balance, revenue trends, transactions, and trainer earnings
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CashFlowDashboard = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [revenueChart, setRevenueChart] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [userRole, setUserRole] = useState('trainer');

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const getAuthToken = async () => {
    return await AsyncStorage.getItem('auth_token');
  };

  const loadData = async () => {
    try {
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [dashboardRes, chartRes, transactionsRes] = await Promise.all([
        axios.get(`${API}/cashflow/dashboard`, { headers }),
        axios.get(`${API}/cashflow/revenue-chart?period=${selectedPeriod}`, { headers }),
        axios.get(`${API}/cashflow/transactions?limit=20`, { headers }),
      ]);

      setDashboardStats(dashboardRes.data);
      setRevenueChart(chartRes.data);
      setTransactions(transactionsRes.data.transactions || []);
    } catch (error) {
      console.error('Error loading cash flow data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [selectedPeriod]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStripeBalance = () => {
    const balance = dashboardStats?.stripe_balance;
    if (!balance || balance.error) return null;

    return (
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Icon name="account-balance-wallet" size={24} color="#22c55e" />
          <Text style={styles.balanceTitle}>Stripe Balance</Text>
        </View>
        <Text style={styles.balanceAmount}>{formatCurrency(balance.available)}</Text>
        <Text style={styles.balanceLabel}>Available</Text>
        
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemValue}>{formatCurrency(balance.pending)}</Text>
            <Text style={styles.balanceItemLabel}>Pending</Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemValue}>{formatCurrency(balance.total)}</Text>
            <Text style={styles.balanceItemLabel}>Total</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStatsGrid = () => (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <Icon name="today" size={20} color="#4f46e5" />
        <Text style={styles.statValue}>{formatCurrency(dashboardStats?.today?.revenue)}</Text>
        <Text style={styles.statLabel}>Today</Text>
      </View>
      
      <View style={styles.statCard}>
        <Icon name="date-range" size={20} color="#8b5cf6" />
        <Text style={styles.statValue}>{formatCurrency(dashboardStats?.this_month?.revenue)}</Text>
        <Text style={styles.statLabel}>This Month</Text>
        {dashboardStats?.this_month?.growth_percent !== 0 && (
          <View style={[
            styles.growthBadge,
            dashboardStats?.this_month?.growth_percent > 0 ? styles.growthPositive : styles.growthNegative
          ]}>
            <Icon 
              name={dashboardStats?.this_month?.growth_percent > 0 ? "trending-up" : "trending-down"} 
              size={12} 
              color="#fff" 
            />
            <Text style={styles.growthText}>
              {Math.abs(dashboardStats?.this_month?.growth_percent || 0)}%
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.statCard}>
        <Icon name="all-inclusive" size={20} color="#06b6d4" />
        <Text style={styles.statValue}>{formatCurrency(dashboardStats?.all_time?.revenue)}</Text>
        <Text style={styles.statLabel}>All Time</Text>
      </View>
      
      <View style={styles.statCard}>
        <Icon name="receipt-long" size={20} color="#f59e0b" />
        <Text style={styles.statValue}>{dashboardStats?.all_time?.transactions || 0}</Text>
        <Text style={styles.statLabel}>Transactions</Text>
      </View>
    </View>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['7d', '30d', '90d'].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.periodButtonTextActive
          ]}>
            {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSimpleChart = () => {
    if (!revenueChart?.data || revenueChart.data.length === 0) return null;

    const maxRevenue = Math.max(...revenueChart.data.map(d => d.revenue), 1);
    const chartWidth = width - 48;
    const barWidth = (chartWidth / revenueChart.data.length) - 2;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Revenue Trend</Text>
        <Text style={styles.chartTotal}>
          Total: {formatCurrency(revenueChart.total)}
        </Text>
        
        <View style={styles.chartBars}>
          {revenueChart.data.slice(-14).map((item, index) => {
            const height = (item.revenue / maxRevenue) * 100;
            return (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { height: Math.max(height, 2), width: barWidth }
                  ]}
                />
              </View>
            );
          })}
        </View>
        
        <View style={styles.chartLabels}>
          <Text style={styles.chartLabel}>
            {revenueChart.data[0]?.date?.slice(5)}
          </Text>
          <Text style={styles.chartLabel}>
            {revenueChart.data[revenueChart.data.length - 1]?.date?.slice(5)}
          </Text>
        </View>
      </View>
    );
  };

  const renderTransaction = ({ item }) => {
    const isPayment = item.type === 'payment';
    const isIncoming = item.to_user_id && !item.from_user_id;

    return (
      <View style={styles.transactionItem}>
        <View style={[
          styles.transactionIcon,
          { backgroundColor: isPayment ? '#22c55e20' : '#ef444420' }
        ]}>
          <Icon
            name={isPayment ? 'arrow-downward' : 'arrow-upward'}
            size={20}
            color={isPayment ? '#22c55e' : '#ef4444'}
          />
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionType}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
          <Text style={styles.transactionUser}>
            {item.from_user_name || item.to_user_name || 'System'}
          </Text>
          <Text style={styles.transactionDate}>{formatDate(item.created_at)}</Text>
        </View>
        
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.amountText,
            { color: isPayment ? '#22c55e' : '#ef4444' }
          ]}>
            {isPayment ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
          <View style={[
            styles.statusBadge,
            item.status === 'completed' ? styles.statusCompleted : styles.statusPending
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading cash flow data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#f9fafb" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Icon name="account-balance" size={24} color="#22c55e" />
          <Text style={styles.headerText}>Cash Flow</Text>
        </View>
        <TouchableOpacity onPress={onRefresh}>
          <Icon name="refresh" size={24} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stripe Balance Card */}
        {renderStripeBalance()}

        {/* Stats Grid */}
        {renderStatsGrid()}

        {/* Period Selector */}
        {renderPeriodSelector()}

        {/* Revenue Chart */}
        {renderSimpleChart()}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllTransactions')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="receipt-long" size={48} color="#374151" />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            transactions.slice(0, 10).map((item) => (
              <View key={item.id}>
                {renderTransaction({ item })}
              </View>
            ))
          )}
        </View>

        {/* Active Trainers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Stats</Text>
          <View style={styles.platformStats}>
            <View style={styles.platformStatItem}>
              <Text style={styles.platformStatValue}>
                {dashboardStats?.active_trainers || 0}
              </Text>
              <Text style={styles.platformStatLabel}>Active Trainers</Text>
            </View>
            <View style={styles.platformStatItem}>
              <Text style={styles.platformStatValue}>
                {dashboardStats?.this_week?.transactions || 0}
              </Text>
              <Text style={styles.platformStatLabel}>This Week</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9ca3af',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  balanceCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#22c55e30',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 16,
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
  },
  balanceItemLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    width: (width - 44) / 2,
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    gap: 2,
  },
  growthPositive: {
    backgroundColor: '#22c55e',
  },
  growthNegative: {
    backgroundColor: '#ef4444',
  },
  growthText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 4,
    marginTop: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#4f46e5',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  chartContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
  },
  chartTotal: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    marginBottom: 16,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    justifyContent: 'space-between',
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 100,
  },
  bar: {
    backgroundColor: '#4f46e5',
    borderRadius: 2,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4f46e5',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f9fafb',
  },
  transactionUser: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  statusCompleted: {
    backgroundColor: '#22c55e20',
  },
  statusPending: {
    backgroundColor: '#f59e0b20',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
  platformStats: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  platformStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  platformStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  platformStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});

export default CashFlowDashboard;
