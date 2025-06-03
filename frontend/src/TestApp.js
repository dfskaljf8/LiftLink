import React from 'react';
import './ThemeSystem.css';
import './ModernDesign.css';

// Simple test component to verify basic rendering
const TestApp = () => {
  return (
    <div className="mobile-app">
      <div className="main-content">
        <div className="card">
          <h1 className="text-2xl font-bold text-primary mb-4">LiftLink Test</h1>
          <p className="text-secondary mb-4">If you can see this, React is working correctly!</p>
          
          <div className="grid gap-4">
            <button className="btn btn-primary">Test Button Primary</button>
            <button className="btn btn-secondary">Test Button Secondary</button>
          </div>
          
          <div className="mt-6 p-4 bg-brand-success text-white rounded-lg">
            ✅ App is rendering successfully!
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestApp;