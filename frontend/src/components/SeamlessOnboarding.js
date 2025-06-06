import React, { useState, useEffect } from 'react';
import { LiftLinkLogo, AnimatedDumbbell, AnimatedStar, AnimatedTrophy, AnimatedHeart, AnimatedFire } from './AnimatedSVGs';

// Seamless Onboarding Experience - Following LiftLink Design Philosophy
const SeamlessOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    fitnessGoals: [],
    experience: '',
    preferredWorkout: '',
    motivation: ''
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to LiftLink',
      subtitle: 'Your fitness journey starts here',
      component: WelcomeStep
    },
    {
      id: 'name',
      title: 'What should we call you?',
      subtitle: 'Let\'s personalize your experience',
      component: NameStep
    },
    {
      id: 'goals',
      title: 'What are your fitness goals?',
      subtitle: 'Choose what matters most to you',
      component: GoalsStep
    },
    {
      id: 'experience',
      title: 'What\'s your experience level?',
      subtitle: 'Help us match you with the right trainers',
      component: ExperienceStep
    },
    {
      id: 'workout',
      title: 'What\'s your preferred workout style?',
      subtitle: 'We\'ll find trainers who specialize in this',
      component: WorkoutStep
    },
    {
      id: 'motivation',
      title: 'What motivates you most?',
      subtitle: 'We\'ll keep you engaged your way',
      component: MotivationStep
    },
    {
      id: 'complete',
      title: 'You\'re all set!',
      subtitle: 'Let\'s find your perfect trainer',
      component: CompleteStep
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const updateUserData = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const totalSteps = steps.length;
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #111111 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.05,
        pointerEvents: 'none'
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              background: '#C4D600',
              borderRadius: '50%',
              animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'rgba(255, 255, 255, 0.1)',
        zIndex: 1000
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #C4D600, #B2FF66)',
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 0 20px rgba(196, 214, 0, 0.5)'
        }} />
      </div>

      {/* Mobile-Optimized Header with Navigation */}
      {currentStep > 0 && currentStep < steps.length - 1 && (
        <div style={{
          position: 'fixed',
          top: '4px',
          left: 0,
          right: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(20px)',
          padding: 'var(--space-md)',
          zIndex: 999,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            style={{
              padding: 'var(--space-sm) var(--space-md)',
              background: currentStep > 0 ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: currentStep > 0 ? 'white' : 'rgba(255, 255, 255, 0.3)',
              fontSize: '14px',
              cursor: currentStep > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
          >
            ← Back
          </button>
          
          <span style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            fontWeight: '500'
          }}>
            {steps[currentStep]?.title}
          </span>
          
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            background: 'rgba(196, 214, 0, 0.2)',
            padding: 'var(--space-xs) var(--space-sm)',
            borderRadius: '12px'
          }}>
            {steps[currentStep]?.step}/{totalSteps}
          </div>
        </div>
      )}

      {/* Mobile-Optimized Header with Navigation */}
      {currentStep > 0 && currentStep < steps.length - 1 && (
        <div style={{
          position: 'fixed',
          top: '4px',
          left: 0,
          right: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(20px)',
          padding: 'var(--space-md)',
          zIndex: 999,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            style={{
              padding: 'var(--space-sm) var(--space-md)',
              background: currentStep > 0 ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: currentStep > 0 ? 'white' : 'rgba(255, 255, 255, 0.3)',
              fontSize: '14px',
              cursor: currentStep > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
          >
            ← Back
          </button>
          
          <span style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            fontWeight: '500'
          }}>
            {steps[currentStep]?.title}
          </span>
          
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            background: 'rgba(196, 214, 0, 0.2)',
            padding: 'var(--space-xs) var(--space-sm)',
            borderRadius: '12px'
          }}>
            {steps[currentStep]?.step}/{totalSteps}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--space-md)',
        paddingTop: currentStep > 0 && currentStep < steps.length - 1 ? '80px' : '60px',
        maxWidth: '100%',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Step Content */}
        <div style={{
          width: '100%',
          transform: isAnimating ? 'translateY(20px)' : 'translateY(0)',
          opacity: isAnimating ? 0 : 1,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <CurrentStepComponent
            userData={userData}
            updateUserData={updateUserData}
            nextStep={nextStep}
            prevStep={prevStep}
            currentStep={currentStep}
            totalSteps={steps.length}
            stepData={steps[currentStep]}
            onComplete={onComplete}
          />
        </div>
      </div>

      {/* Navigation Dots */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 'var(--space-sm)',
        zIndex: 1000
      }}>
        {steps.map((_, index) => (
          <div
            key={index}
            style={{
              width: index === currentStep ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: index <= currentStep ? '#C4D600' : 'rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onClick={() => index < currentStep && setCurrentStep(index)}
          />
        ))}
      </div>

      {/* Floating Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

// Welcome Step Component
const WelcomeStep = ({ nextStep, stepData }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      nextStep();
    }, 3000);
    return () => clearTimeout(timer);
  }, [nextStep]);

  return (
    <div style={{
      textAlign: 'center',
      animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{
        marginBottom: 'var(--space-xl)',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        <LiftLinkLogo size={120} animate={true} />
      </div>
      
      <h1 style={{
        fontSize: 'clamp(28px, 5vw, 48px)',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #C4D600, #B2FF66)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        marginBottom: 'var(--space-md)',
        letterSpacing: '-0.02em'
      }}>
        {stepData.title}
      </h1>
      
      <p style={{
        fontSize: '20px',
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 'var(--space-xl)',
        fontWeight: '300'
      }}>
        {stepData.subtitle}
      </p>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--space-md)',
        marginTop: 'var(--space-xl)'
      }}>
        <AnimatedDumbbell size={32} color="#C4D600" />
        <AnimatedFire size={32} />
        <AnimatedTrophy size={32} active={true} />
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

// Name Step Component
const NameStep = ({ userData, updateUserData, nextStep, prevStep, stepData }) => {
  const [name, setName] = useState(userData.name || '');

  const handleSubmit = () => {
    if (name.trim()) {
      updateUserData('name', name.trim());
      nextStep();
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        marginBottom: 'var(--space-xl)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-lg)',
          fontSize: '32px'
        }}>
          👋
        </div>
        
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: '600',
          color: 'white',
          marginBottom: 'var(--space-sm)'
        }}>
          {stepData.title}
        </h2>
        
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: 'var(--space-xl)'
        }}>
          {stepData.subtitle}
        </p>
      </div>

      <div style={{
        marginBottom: 'var(--space-xl)'
      }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          autoFocus
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: 'var(--space-lg)',
            fontSize: '18px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            color: 'white',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#C4D600';
            e.target.style.boxShadow = '0 0 20px rgba(196, 214, 0, 0.3)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--space-md)',
        justifyContent: 'center'
      }}>
        <button
          onClick={prevStep}
          style={{
            padding: 'var(--space-md) var(--space-lg)',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
        >
          ← Back
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          style={{
            padding: 'var(--space-md) var(--space-xl)',
            background: name.trim() ? 'linear-gradient(45deg, #C4D600, #B2FF66)' : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '12px',
            color: name.trim() ? 'black' : 'rgba(255, 255, 255, 0.5)',
            fontSize: '16px',
            fontWeight: '600',
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            transform: name.trim() ? 'scale(1)' : 'scale(0.95)',
            boxShadow: name.trim() ? '0 8px 24px rgba(196, 214, 0, 0.3)' : 'none'
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

// Goals Step Component
const GoalsStep = ({ userData, updateUserData, nextStep, prevStep, stepData }) => {
  const [selectedGoals, setSelectedGoals] = useState(userData.fitnessGoals || []);

  const goals = [
    { id: 'weight_loss', label: 'Lose Weight', icon: '🔥', color: '#FF6B6B' },
    { id: 'muscle_gain', label: 'Build Muscle', icon: '💪', color: '#4ECDC4' },
    { id: 'strength', label: 'Get Stronger', icon: '🏋️', color: '#45B7D1' },
    { id: 'endurance', label: 'Improve Endurance', icon: '🏃', color: '#96CEB4' },
    { id: 'flexibility', label: 'Increase Flexibility', icon: '🧘', color: '#FFEAA7' },
    { id: 'health', label: 'General Health', icon: '❤️', color: '#FF7675' }
  ];

  const toggleGoal = (goalId) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const getGoalLabels = (goalIds) => {
    return goalIds.map(id => {
      const goal = goals.find(g => g.id === id);
      return goal ? goal.label : id;
    }).join(', ');
  };

  const handleContinue = () => {
    if (selectedGoals.length > 0) {
      updateUserData('fitnessGoals', selectedGoals);
      nextStep();
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-lg)',
          fontSize: '32px'
        }}>
          🎯
        </div>
        
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: '600',
          color: 'white',
          marginBottom: 'var(--space-sm)'
        }}>
          {stepData.title}
        </h2>
        
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: 'var(--space-xl)'
        }}>
          {stepData.subtitle}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-xl)',
        maxWidth: '500px',
        margin: '0 auto var(--space-xl)'
      }}>
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            style={{
              padding: 'var(--space-lg)',
              background: selectedGoals.includes(goal.id) 
                ? 'linear-gradient(45deg, #C4D600, #B2FF66)'
                : 'rgba(255, 255, 255, 0.1)',
              border: selectedGoals.includes(goal.id)
                ? '2px solid #C4D600'
                : '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              color: selectedGoals.includes(goal.id) ? 'black' : 'white',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: selectedGoals.includes(goal.id) ? 'scale(1.05)' : 'scale(1)',
              boxShadow: selectedGoals.includes(goal.id) 
                ? '0 8px 24px rgba(196, 214, 0, 0.3)'
                : 'none',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: 'var(--space-sm)' }}>
              {goal.icon}
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {goal.label}
            </div>
          </button>
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--space-md)',
        justifyContent: 'center'
      }}>
        <button onClick={prevStep} style={{
          padding: 'var(--space-md) var(--space-lg)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)'
        }}>
          ← Back
        </button>
        
        <button
          onClick={handleContinue}
          disabled={selectedGoals.length === 0}
          style={{
            padding: 'var(--space-md) var(--space-xl)',
            background: selectedGoals.length > 0 
              ? 'linear-gradient(45deg, #C4D600, #B2FF66)' 
              : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '12px',
            color: selectedGoals.length > 0 ? 'black' : 'rgba(255, 255, 255, 0.5)',
            fontSize: '16px',
            fontWeight: '600',
            cursor: selectedGoals.length > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            transform: selectedGoals.length > 0 ? 'scale(1)' : 'scale(0.95)',
            boxShadow: selectedGoals.length > 0 ? '0 8px 24px rgba(196, 214, 0, 0.3)' : 'none'
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

// Experience Step Component
const ExperienceStep = ({ userData, updateUserData, nextStep, prevStep, stepData }) => {
  const [selectedExperience, setSelectedExperience] = useState(userData.experience || '');

  const experienceLevels = [
    { 
      id: 'beginner', 
      label: 'Beginner', 
      description: 'New to fitness or returning after a break',
      icon: '🌱',
      gradient: 'linear-gradient(45deg, #81C784, #4CAF50)'
    },
    { 
      id: 'intermediate', 
      label: 'Intermediate', 
      description: 'Some experience with regular workouts',
      icon: '🚀',
      gradient: 'linear-gradient(45deg, #64B5F6, #2196F3)'
    },
    { 
      id: 'advanced', 
      label: 'Advanced', 
      description: 'Experienced with complex training routines',
      icon: '💪',
      gradient: 'linear-gradient(45deg, #FFB74D, #FF9800)'
    },
    { 
      id: 'expert', 
      label: 'Expert', 
      description: 'Highly experienced, specific training goals',
      icon: '🏆',
      gradient: 'linear-gradient(45deg, #E57373, #F44336)'
    }
  ];

  const handleContinue = () => {
    if (selectedExperience) {
      updateUserData('experience', selectedExperience);
      nextStep();
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-lg)',
          fontSize: '32px'
        }}>
          📊
        </div>
        
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: '600',
          color: 'white',
          marginBottom: 'var(--space-sm)'
        }}>
          {stepData.title}
        </h2>
        
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: 'var(--space-xl)'
        }}>
          {stepData.subtitle}
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-xl)',
        maxWidth: '500px',
        margin: '0 auto var(--space-xl)'
      }}>
        {experienceLevels.map((level) => (
          <button
            key={level.id}
            onClick={() => setSelectedExperience(level.id)}
            style={{
              padding: 'var(--space-lg)',
              background: selectedExperience === level.id 
                ? 'linear-gradient(45deg, #C4D600, #B2FF66)'
                : 'rgba(255, 255, 255, 0.1)',
              border: selectedExperience === level.id
                ? '2px solid #C4D600'
                : '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              color: selectedExperience === level.id ? 'black' : 'white',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: selectedExperience === level.id ? 'scale(1.02)' : 'scale(1)',
              boxShadow: selectedExperience === level.id 
                ? '0 8px 24px rgba(196, 214, 0, 0.3)'
                : 'none',
              backdropFilter: 'blur(10px)',
              textAlign: 'left'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)'
            }}>
              <div style={{ fontSize: '24px' }}>{level.icon}</div>
              <div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: 'var(--space-xs)'
                }}>
                  {level.label}
                </div>
                <div style={{
                  fontSize: '14px',
                  opacity: 0.8
                }}>
                  {level.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--space-md)',
        justifyContent: 'center'
      }}>
        <button onClick={prevStep} style={{
          padding: 'var(--space-md) var(--space-lg)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)'
        }}>
          ← Back
        </button>
        
        <button
          onClick={handleContinue}
          disabled={!selectedExperience}
          style={{
            padding: 'var(--space-md) var(--space-xl)',
            background: selectedExperience 
              ? 'linear-gradient(45deg, #C4D600, #B2FF66)' 
              : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '12px',
            color: selectedExperience ? 'black' : 'rgba(255, 255, 255, 0.5)',
            fontSize: '16px',
            fontWeight: '600',
            cursor: selectedExperience ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            transform: selectedExperience ? 'scale(1)' : 'scale(0.95)',
            boxShadow: selectedExperience ? '0 8px 24px rgba(196, 214, 0, 0.3)' : 'none'
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

// Workout Step Component
const WorkoutStep = ({ userData, updateUserData, nextStep, prevStep, stepData }) => {
  const [selectedWorkout, setSelectedWorkout] = useState(userData.preferredWorkout || '');

  const workoutTypes = [
    { id: 'strength', label: 'Strength Training', icon: '🏋️', description: 'Build muscle and power' },
    { id: 'cardio', label: 'Cardio & HIIT', icon: '🏃', description: 'Burn calories and improve endurance' },
    { id: 'yoga', label: 'Yoga & Flexibility', icon: '🧘', description: 'Improve flexibility and mindfulness' },
    { id: 'boxing', label: 'Boxing & Combat', icon: '🥊', description: 'High-intensity combat training' },
    { id: 'dance', label: 'Dance Fitness', icon: '💃', description: 'Fun, rhythmic workouts' },
    { id: 'outdoor', label: 'Outdoor Activities', icon: '🏔️', description: 'Fresh air fitness adventures' }
  ];

  const handleContinue = () => {
    if (selectedWorkout) {
      updateUserData('preferredWorkout', selectedWorkout);
      nextStep();
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-lg)',
          fontSize: '32px'
        }}>
          🎯
        </div>
        
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: '600',
          color: 'white',
          marginBottom: 'var(--space-sm)'
        }}>
          {stepData.title}
        </h2>
        
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: 'var(--space-xl)'
        }}>
          {stepData.subtitle}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-xl)',
        maxWidth: '600px',
        margin: '0 auto var(--space-xl)'
      }}>
        {workoutTypes.map((workout) => (
          <button
            key={workout.id}
            onClick={() => setSelectedWorkout(workout.id)}
            style={{
              padding: 'var(--space-lg)',
              background: selectedWorkout === workout.id 
                ? 'linear-gradient(45deg, #C4D600, #B2FF66)'
                : 'rgba(255, 255, 255, 0.1)',
              border: selectedWorkout === workout.id
                ? '2px solid #C4D600'
                : '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              color: selectedWorkout === workout.id ? 'black' : 'white',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: selectedWorkout === workout.id ? 'scale(1.05)' : 'scale(1)',
              boxShadow: selectedWorkout === workout.id 
                ? '0 8px 24px rgba(196, 214, 0, 0.3)'
                : 'none',
              backdropFilter: 'blur(10px)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: 'var(--space-sm)' }}>
              {workout.icon}
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: 'var(--space-xs)'
            }}>
              {workout.label}
            </div>
            <div style={{
              fontSize: '12px',
              opacity: 0.8
            }}>
              {workout.description}
            </div>
          </button>
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--space-md)',
        justifyContent: 'center'
      }}>
        <button onClick={prevStep} style={{
          padding: 'var(--space-md) var(--space-lg)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)'
        }}>
          ← Back
        </button>
        
        <button
          onClick={handleContinue}
          disabled={!selectedWorkout}
          style={{
            padding: 'var(--space-md) var(--space-xl)',
            background: selectedWorkout 
              ? 'linear-gradient(45deg, #C4D600, #B2FF66)' 
              : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '12px',
            color: selectedWorkout ? 'black' : 'rgba(255, 255, 255, 0.5)',
            fontSize: '16px',
            fontWeight: '600',
            cursor: selectedWorkout ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            transform: selectedWorkout ? 'scale(1)' : 'scale(0.95)',
            boxShadow: selectedWorkout ? '0 8px 24px rgba(196, 214, 0, 0.3)' : 'none'
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

// Motivation Step Component
const MotivationStep = ({ userData, updateUserData, nextStep, prevStep, stepData }) => {
  const [selectedMotivation, setSelectedMotivation] = useState(userData.motivation || '');

  const motivations = [
    { id: 'competition', label: 'Competition', icon: '🏆', description: 'I love competing with others' },
    { id: 'personal', label: 'Personal Growth', icon: '🌱', description: 'I focus on beating my own records' },
    { id: 'community', label: 'Community', icon: '👥', description: 'I enjoy working out with others' },
    { id: 'rewards', label: 'Rewards & Achievements', icon: '🎁', description: 'I like earning badges and rewards' }
  ];

  const handleContinue = () => {
    if (selectedMotivation) {
      updateUserData('motivation', selectedMotivation);
      nextStep();
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-lg)',
          fontSize: '32px'
        }}>
          ⚡
        </div>
        
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: '600',
          color: 'white',
          marginBottom: 'var(--space-sm)'
        }}>
          {stepData.title}
        </h2>
        
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: 'var(--space-xl)'
        }}>
          {stepData.subtitle}
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-xl)',
        maxWidth: '500px',
        margin: '0 auto var(--space-xl)'
      }}>
        {motivations.map((motivation) => (
          <button
            key={motivation.id}
            onClick={() => setSelectedMotivation(motivation.id)}
            style={{
              padding: 'var(--space-lg)',
              background: selectedMotivation === motivation.id 
                ? 'linear-gradient(45deg, #C4D600, #B2FF66)'
                : 'rgba(255, 255, 255, 0.1)',
              border: selectedMotivation === motivation.id
                ? '2px solid #C4D600'
                : '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              color: selectedMotivation === motivation.id ? 'black' : 'white',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: selectedMotivation === motivation.id ? 'scale(1.02)' : 'scale(1)',
              boxShadow: selectedMotivation === motivation.id 
                ? '0 8px 24px rgba(196, 214, 0, 0.3)'
                : 'none',
              backdropFilter: 'blur(10px)',
              textAlign: 'left'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)'
            }}>
              <div style={{ fontSize: '24px' }}>{motivation.icon}</div>
              <div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: 'var(--space-xs)'
                }}>
                  {motivation.label}
                </div>
                <div style={{
                  fontSize: '14px',
                  opacity: 0.8
                }}>
                  {motivation.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--space-md)',
        justifyContent: 'center'
      }}>
        <button onClick={prevStep} style={{
          padding: 'var(--space-md) var(--space-lg)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)'
        }}>
          ← Back
        </button>
        
        <button
          onClick={handleContinue}
          disabled={!selectedMotivation}
          style={{
            padding: 'var(--space-md) var(--space-xl)',
            background: selectedMotivation 
              ? 'linear-gradient(45deg, #C4D600, #B2FF66)' 
              : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '12px',
            color: selectedMotivation ? 'black' : 'rgba(255, 255, 255, 0.5)',
            fontSize: '16px',
            fontWeight: '600',
            cursor: selectedMotivation ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            transform: selectedMotivation ? 'scale(1)' : 'scale(0.95)',
            boxShadow: selectedMotivation ? '0 8px 24px rgba(196, 214, 0, 0.3)' : 'none'
          }}
        >
          Almost Done →
        </button>
      </div>
    </div>
  );
};

// Complete Step Component
const CompleteStep = ({ userData, onComplete, stepData }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(userData);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete, userData]);

  return (
    <div style={{
      textAlign: 'center',
      animation: 'celebrate 1s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{
        marginBottom: 'var(--space-xl)',
        position: 'relative'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-lg)',
          fontSize: '48px',
          animation: 'bounce 1s ease-in-out infinite'
        }}>
          <AnimatedTrophy size={48} active={true} />
        </div>
        
        {/* Confetti effect */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                background: i % 2 === 0 ? '#C4D600' : '#B2FF66',
                borderRadius: '50%',
                animation: `confetti ${Math.random() * 2 + 1}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      </div>
      
      <h1 style={{
        fontSize: 'clamp(28px, 5vw, 48px)',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #C4D600, #B2FF66)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        marginBottom: 'var(--space-md)',
        letterSpacing: '-0.02em'
      }}>
        {stepData.title}
      </h1>
      
      <p style={{
        fontSize: '20px',
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 'var(--space-xl)',
        fontWeight: '300'
      }}>
        {stepData.subtitle}
      </p>

      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: 'var(--space-xl)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        marginBottom: 'var(--space-xl)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#C4D600',
          marginBottom: 'var(--space-md)'
        }}>
          Welcome, {userData.name}! 🎉
        </h3>
        
        <div style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.8)',
          lineHeight: '1.6'
        }}>
          We're finding trainers perfect for your goals:<br/>
          <strong style={{ color: '#C4D600' }}>
            {(() => {
              const goals = [
                { id: 'weight_loss', label: 'Lose Weight' },
                { id: 'muscle_gain', label: 'Build Muscle' },
                { id: 'strength', label: 'Get Stronger' },
                { id: 'endurance', label: 'Improve Endurance' },
                { id: 'flexibility', label: 'Increase Flexibility' },
                { id: 'health', label: 'General Health' }
              ];
              
              const experiences = {
                'beginner': 'Beginner',
                'intermediate': 'Intermediate', 
                'advanced': 'Advanced',
                'expert': 'Expert'
              };
              
              const workouts = {
                'strength': 'Strength Training',
                'cardio': 'Cardio & HIIT',
                'yoga': 'Yoga & Flexibility',
                'boxing': 'Boxing & Combat',
                'dance': 'Dance Fitness',
                'outdoor': 'Outdoor Activities'
              };
              
              const goalLabels = userData.fitnessGoals?.map(id => {
                const goal = goals.find(g => g.id === id);
                return goal ? goal.label : id;
              }).join(', ') || '';
              
              const experienceLabel = experiences[userData.experience] || userData.experience || '';
              const workoutLabel = workouts[userData.preferredWorkout] || userData.preferredWorkout || '';
              
              return `${goalLabels} • ${experienceLabel} level • ${workoutLabel}`;
            })()}
          </strong>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--space-lg)',
        marginTop: 'var(--space-xl)'
      }}>
        <AnimatedDumbbell size={32} color="#C4D600" />
        <AnimatedFire size={32} />
        <AnimatedHeart size={32} beating={true} liked={true} />
      </div>

      <style jsx>{`
        @keyframes celebrate {
          0% { opacity: 0; transform: translateY(50px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes confetti {
          0% { 
            opacity: 1; 
            transform: translateY(0) rotate(0deg) scale(1);
          }
          100% { 
            opacity: 0; 
            transform: translateY(-100px) rotate(720deg) scale(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SeamlessOnboarding;
