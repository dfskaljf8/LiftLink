import React from 'react';

const AIFitnessMatchmaker = () => (
  <div>
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '20px',
      padding: '24px',
      border: '1px solid rgba(196, 214, 0, 0.3)',
      marginBottom: '32px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #C4D600, #B2FF66)',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '24px' }}>🎯</span>
        </div>
        <div>
          <h2 style={{ 
            margin: '0 0 4px 0', 
            color: '#ffffff', 
            fontSize: '24px',
            fontWeight: '700'
          }}>
            AI Fitness Matchmaker
          </h2>
          <p style={{ 
            margin: 0, 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '16px'
          }}>
            Expert AI that analyzes your profile and pairs you with your ideal personal trainer
          </p>
        </div>
      </div>
      
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid rgba(196, 214, 0, 0.2)',
        height: '600px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <iframe 
          src="https://app.relevanceai.com/agents/bcbe5a/9ca4a28df27a-44f4-8786-dd1756011081/4404a7fd-b8b0-42b8-ad0a-dbec47bda145/share?hide_tool_steps=false&hide_file_uploads=false&hide_conversation_list=false&bubble_style=agent&primary_color=%23685FFF&bubble_icon=pd%2Fchat&input_placeholder_text=Type+your+message...&hide_logo=false&hide_description=false" 
          width="100%" 
          height="100%" 
          frameBorder="0"
          style={{
            borderRadius: '12px',
            background: 'transparent'
          }}
          title="LiftLink AI Fitness Matchmaker"
        />
      </div>
      
      <div style={{
        marginTop: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          background: 'rgba(196, 214, 0, 0.1)',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>📋</div>
          <h4 style={{ margin: '0 0 4px 0', color: '#C4D600', fontSize: '14px' }}>
            Profile Analysis
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Analyzes your fitness goals and preferences
          </p>
        </div>
        
        <div style={{
          background: 'rgba(196, 214, 0, 0.1)',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>🔍</div>
          <h4 style={{ margin: '0 0 4px 0', color: '#C4D600', fontSize: '14px' }}>
            Smart Matching
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Pairs you with the most compatible trainers
          </p>
        </div>
        
        <div style={{
          background: 'rgba(196, 214, 0, 0.1)',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>⭐</div>
          <h4 style={{ margin: '0 0 4px 0', color: '#C4D600', fontSize: '14px' }}>
            Quality Ranking
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Ranks trainers by compatibility score
          </p>
        </div>
        
        <div style={{
          background: 'rgba(196, 214, 0, 0.1)',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>🎯</div>
          <h4 style={{ margin: '0 0 4px 0', color: '#C4D600', fontSize: '14px' }}>
            Personalized Recommendations
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Custom suggestions based on your needs
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default AIFitnessMatchmaker;
