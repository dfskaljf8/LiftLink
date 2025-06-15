import React from 'react';

const AIAccountabilityCoach = () => (
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
          <span style={{ fontSize: '24px' }}>🧠</span>
        </div>
        <div>
          <h2 style={{ 
            margin: '0 0 4px 0', 
            color: '#ffffff', 
            fontSize: '24px',
            fontWeight: '700'
          }}>
            AI Accountability Coach
          </h2>
          <p style={{ 
            margin: 0, 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '16px'
          }}>
            Get emotionally intelligent feedback and meaningful insights on your fitness journey
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
          src="https://app.relevanceai.com/agents/bcbe5a/9ca4a28df27a-44f4-8786-dd1756011081/8d932862-d19b-446a-80f7-387a5090d8a3/share?hide_tool_steps=false&hide_file_uploads=false&hide_conversation_list=false&bubble_style=agent&primary_color=%23685FFF&bubble_icon=pd%2Fchat&input_placeholder_text=Type+your+message...&hide_logo=false&hide_description=false" 
          width="100%" 
          height="100%" 
          frameBorder="0"
          style={{
            borderRadius: '12px',
            background: 'transparent'
          }}
          title="LiftLink AI Accountability Coach"
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
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>📈</div>
          <h4 style={{ margin: '0 0 4px 0', color: '#C4D600', fontSize: '14px' }}>
            Progress Analysis
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Emotional insights on your fitness journey
          </p>
        </div>
        
        <div style={{
          background: 'rgba(196, 214, 0, 0.1)',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>💬</div>
          <h4 style={{ margin: '0 0 4px 0', color: '#C4D600', fontSize: '14px' }}>
            Personalized Feedback
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Meaningful weekly check-in responses
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
            Motivation Support
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Emotionally intelligent encouragement
          </p>
        </div>
        
        <div style={{
          background: 'rgba(196, 214, 0, 0.1)',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>🧘</div>
          <h4 style={{ margin: '0 0 4px 0', color: '#C4D600', fontSize: '14px' }}>
            Wellness Guidance
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Holistic fitness and mental wellness
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default AIAccountabilityCoach;
