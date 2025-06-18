import React, { useState, useEffect } from 'react';
import { LiftCoin } from './UniqueSVGs';

const EnhancedLiftCoins = ({ userProfile }) => {
  const [userCoins, setUserCoins] = useState(0);
  const [userTier, setUserTier] = useState('Bronze');
  const [availableRewards, setAvailableRewards] = useState([]);

  // Real valuable reward system
  const rewardTiers = {
    Bronze: { minCoins: 0, discount: 0, color: '#CD7F32' },
    Silver: { minCoins: 500, discount: 5, color: '#C0C0C0' },
    Gold: { minCoins: 1500, discount: 10, color: '#FFD700' },
    Platinum: { minCoins: 3000, discount: 15, color: '#E5E4E2' },
    Diamond: { minCoins: 6000, discount: 20, color: '#B9F2FF' }
  };

  const realRewards = [
    {
      id: 'session_10_discount',
      name: '10% Session Discount',
      description: 'Save 10% on your next training session',
      cost: 200,
      type: 'discount',
      value: '10%',
      savings: '$8-15 average',
      icon: '💰'
    },
    {
      id: 'session_20_discount', 
      name: '20% Session Discount',
      description: 'Save 20% on your next training session',
      cost: 400,
      type: 'discount',
      value: '20%',
      savings: '$16-30 average',
      icon: '💎'
    },
    {
      id: 'free_session',
      name: 'Free 30-min Session',
      description: 'Complimentary 30-minute training session',
      cost: 800,
      type: 'free_service',
      value: 'Free Session',
      savings: '$40-60 value',
      icon: '🎁'
    },
    {
      id: 'priority_booking',
      name: 'Priority Booking (30 days)',
      description: 'Skip waitlists and book top trainers first',
      cost: 300,
      type: 'access',
      value: 'VIP Access',
      savings: 'Priceless convenience',
      icon: '⭐'
    },
    {
      id: 'nutrition_plan',
      name: 'Custom Nutrition Plan',
      description: 'Personalized meal plan from certified nutritionist',
      cost: 600,
      type: 'service',
      value: 'Full Plan',
      savings: '$100-150 value',
      icon: '🥗'
    },
    {
      id: 'equipment_discount',
      name: 'Fitness Gear 25% Off',
      description: 'Discount on partner fitness equipment stores',
      cost: 250,
      type: 'partner_discount',
      value: '25% Off',
      savings: 'Up to $200',
      icon: '🏋️'
    }
  ];

  // Trainer-specific rewards
  const trainerRewards = [
    {
      id: 'reduced_commission',
      name: 'Reduced Commission (1 month)',
      description: 'Pay 2% less commission for 30 days',
      cost: 1000,
      type: 'commission_reduction',
      value: '2% Less',
      savings: '$50-200/month',
      icon: '📈'
    },
    {
      id: 'featured_listing',
      name: 'Featured Trainer Spot',
      description: 'Appear at top of trainer marketplace for 7 days',
      cost: 500,
      type: 'marketing',
      value: 'Top Placement',
      savings: '5x more views',
      icon: '🌟'
    },
    {
      id: 'certification_rebate',
      name: 'Certification Course Rebate',
      description: '$100 rebate on approved certification courses',
      cost: 400,
      type: 'education',
      value: '$100 Credit',
      savings: '$100 direct',
      icon: '🎓'
    }
  ];

  const earningActivities = [
    { activity: 'Complete Session', coins: 50, description: 'Finish a training session' },
    { activity: 'Weekly Consistency (7 days)', coins: 100, description: '7 consecutive days of activity' },
    { activity: 'Monthly Streak (30 days)', coins: 500, description: '30 days of consistent training' },
    { activity: 'Refer a Friend', coins: 200, description: 'Friend completes first session' },
    { activity: 'Leave Trainer Review', coins: 25, description: 'Write detailed trainer review' },
    { activity: 'Complete Health Check-in', coins: 15, description: 'Log weekly health metrics' },
    { activity: 'Yearly Milestone', coins: 2000, description: 'Complete 365 days of activity' }
  ];

  useEffect(() => {
    // Calculate user tier based on coins
    const tier = Object.entries(rewardTiers)
      .reverse()
      .find(([_, tierInfo]) => userCoins >= tierInfo.minCoins)?.[0] || 'Bronze';
    setUserTier(tier);

    // Set available rewards based on user type
    const rewards = userProfile?.role === 'trainer' ? trainerRewards : realRewards;
    setAvailableRewards(rewards.filter(reward => userCoins >= reward.cost));
  }, [userCoins, userProfile]);

  const redeemReward = async (reward) => {
    if (userCoins >= reward.cost) {
      setUserCoins(prev => prev - reward.cost);
      
      // Call backend API to process reward
      try {
        const response = await fetch('/api/rewards/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rewardId: reward.id,
            userId: userProfile.id,
            coinsCost: reward.cost
          })
        });
        
        if (response.ok) {
          alert(`🎉 ${reward.name} redeemed successfully! Check your account for details.`);
        }
      } catch (error) {
        console.error('Reward redemption failed:', error);
      }
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
      borderRadius: '20px',
      padding: '24px',
      border: '1px solid rgba(196, 214, 0, 0.3)'
    }}>
      {/* LiftCoins Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LiftCoin size={48} animated={true} />
          <div>
            <h2 style={{ margin: 0, color: '#FFD700', fontSize: '24px' }}>
              {userCoins.toLocaleString()} LiftCoins
            </h2>
            <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)' }}>
              {userTier} Tier • {rewardTiers[userTier].discount}% Session Discount
            </p>
          </div>
        </div>
        
        <div style={{
          background: rewardTiers[userTier].color,
          color: '#000',
          padding: '8px 16px',
          borderRadius: '12px',
          fontWeight: '600'
        }}>
          {userTier} Member
        </div>
      </div>

      {/* Earning Activities */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: '#C4D600', marginBottom: '16px' }}>Earn LiftCoins</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '12px'
        }}>
          {earningActivities.map((activity, index) => (
            <div key={index} style={{
              background: 'rgba(196, 214, 0, 0.1)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(196, 214, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: '500', fontSize: '14px' }}>
                    {activity.activity}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                    {activity.description}
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#FFD700',
                  fontWeight: '600'
                }}>
                  <LiftCoin size={16} animated={false} />
                  {activity.coins}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Rewards */}
      <div>
        <h3 style={{ color: '#C4D600', marginBottom: '16px' }}>Redeem Rewards</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {availableRewards.map((reward) => (
            <div key={reward.id} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                fontSize: '24px'
              }}>
                {reward.icon}
              </div>
              
              <h4 style={{ margin: '0 0 8px 0', color: '#ffffff' }}>
                {reward.name}
              </h4>
              
              <p style={{ margin: '0 0 12px 0', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                {reward.description}
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ color: '#C4D600', fontWeight: '600' }}>
                    {reward.value}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                    {reward.savings}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#FFD700'
                }}>
                  <LiftCoin size={16} animated={false} />
                  {reward.cost}
                </div>
              </div>
              
              <button
                onClick={() => redeemReward(reward)}
                disabled={userCoins < reward.cost}
                style={{
                  width: '100%',
                  background: userCoins >= reward.cost ? '#C4D600' : 'rgba(255, 255, 255, 0.1)',
                  color: userCoins >= reward.cost ? '#000' : 'rgba(255, 255, 255, 0.5)',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: userCoins >= reward.cost ? 'pointer' : 'not-allowed'
                }}
              >
                {userCoins >= reward.cost ? 'Redeem Now' : 'Need More Coins'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedLiftCoins;
