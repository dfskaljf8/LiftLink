#!/bin/bash

# LiftLink App Store Screenshot Generator
# Creates HTML mockups that can be used to generate actual screenshots

echo "📱 Creating LiftLink App Store Screenshot Mockups"
echo "================================================"

# Create screenshots directory
mkdir -p /app/AppStoreAssets/Screenshots

# Screenshot 1: Welcome Screen
cat > /app/AppStoreAssets/Screenshots/screenshot1_welcome.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LiftLink - Welcome Screen</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #000000, #1a1a1a, #000000);
            color: #ffffff;
            width: 375px;
            height: 812px;
            overflow: hidden;
            position: relative;
        }
        
        .container {
            padding: 60px 20px 20px;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 36px;
            font-weight: bold;
            color: #C4D600;
            margin-bottom: 8px;
            text-shadow: 0 0 20px rgba(196, 214, 0, 0.8);
            animation: glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
            from { text-shadow: 0 0 20px rgba(196, 214, 0, 0.8); }
            to { text-shadow: 0 0 30px rgba(196, 214, 0, 1), 0 0 40px rgba(196, 214, 0, 0.8); }
        }
        
        .tagline {
            font-size: 16px;
            color: #888888;
            margin-bottom: 16px;
        }
        
        .user-stats {
            background: rgba(196, 214, 0, 0.1);
            border: 1px solid rgba(196, 214, 0, 0.3);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 20px;
        }
        
        .stats-text {
            font-size: 14px;
            color: #C4D600;
            font-weight: 500;
        }
        
        .features-grid {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
            margin-bottom: 20px;
        }
        
        .feature-card {
            background: rgba(196, 214, 0, 0.1);
            border: 1px solid rgba(196, 214, 0, 0.2);
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .feature-icon {
            font-size: 24px;
        }
        
        .feature-content h3 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .feature-content p {
            font-size: 12px;
            color: #cccccc;
        }
        
        .status-badge {
            background: #C4D600;
            color: #000;
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 8px;
            font-weight: 600;
            margin-left: auto;
        }
        
        .cta-button {
            background: linear-gradient(45deg, #C4D600, #B2FF66);
            color: #000000;
            padding: 16px;
            border-radius: 12px;
            text-align: center;
            font-weight: bold;
            font-size: 18px;
            border: none;
            cursor: pointer;
            margin-bottom: 12px;
        }
        
        .secondary-button {
            background: transparent;
            color: #C4D600;
            border: 1px solid #C4D600;
            padding: 16px;
            border-radius: 12px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">LiftLink</div>
            <div class="tagline">Elite Fitness Training Platform</div>
            <div class="user-stats">
                <div class="stats-text">Level 5 • 150 LiftCoins • 7 Day Streak 🔥</div>
            </div>
        </div>
        
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">🏋️</div>
                <div class="feature-content">
                    <h3>Certified Trainers</h3>
                    <p>Verified fitness professionals</p>
                </div>
                <div class="status-badge">LIVE</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">📊</div>
                <div class="feature-content">
                    <h3>Health Integration</h3>
                    <p>Apple Health & Google Fit sync</p>
                </div>
                <div class="status-badge">LIVE</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">📍</div>
                <div class="feature-content">
                    <h3>GPS Verification</h3>
                    <p>Session attendance tracking</p>
                </div>
                <div class="status-badge">LIVE</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">👥</div>
                <div class="feature-content">
                    <h3>Find Friends</h3>
                    <p>Connect with contacts</p>
                </div>
                <div class="status-badge">LIVE</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">🔒</div>
                <div class="feature-content">
                    <h3>ID Verification</h3>
                    <p>Secure age verification</p>
                </div>
                <div class="status-badge">LIVE</div>
            </div>
        </div>
        
        <button class="cta-button">Get Started - Join Elite Fitness</button>
        <button class="secondary-button">Sign In to Your Account</button>
    </div>
</body>
</html>
EOF

# Screenshot 2: Health Integration
cat > /app/AppStoreAssets/Screenshots/screenshot2_health.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LiftLink - Health Integration</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #000000, #1a1a1a, #000000);
            color: #ffffff;
            width: 375px;
            height: 812px;
            overflow: hidden;
            position: relative;
        }
        
        .container {
            padding: 60px 20px 20px;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #C4D600;
            margin-bottom: 8px;
        }
        
        .subtitle {
            font-size: 16px;
            color: #888888;
            margin-bottom: 20px;
        }
        
        .health-providers {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 30px;
        }
        
        .provider-card {
            background: rgba(196, 214, 0, 0.1);
            border: 1px solid rgba(196, 214, 0, 0.2);
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            position: relative;
        }
        
        .provider-card.connected {
            border-color: #C4D600;
            background: rgba(196, 214, 0, 0.2);
        }
        
        .provider-icon {
            width: 60px;
            height: 60px;
            background: #C4D600;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px;
            font-size: 24px;
            color: #000;
        }
        
        .provider-name {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .provider-status {
            font-size: 12px;
            color: #C4D600;
        }
        
        .connected-badge {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #C4D600;
            color: #000;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
        
        .health-data {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .data-title {
            font-size: 18px;
            font-weight: 600;
            color: #C4D600;
            margin-bottom: 16px;
            text-align: center;
        }
        
        .data-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        
        .data-item {
            text-align: center;
            background: rgba(196, 214, 0, 0.1);
            border-radius: 8px;
            padding: 12px;
        }
        
        .data-value {
            font-size: 20px;
            font-weight: bold;
            color: #C4D600;
        }
        
        .data-label {
            font-size: 12px;
            color: #cccccc;
            margin-top: 4px;
        }
        
        .sync-button {
            background: linear-gradient(45deg, #C4D600, #B2FF66);
            color: #000000;
            padding: 16px;
            border-radius: 12px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            border: none;
            margin-bottom: 16px;
        }
        
        .privacy-note {
            background: rgba(196, 214, 0, 0.1);
            border: 1px solid rgba(196, 214, 0, 0.2);
            border-radius: 8px;
            padding: 12px;
            font-size: 12px;
            color: #cccccc;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">🏥 Health Integration</div>
            <div class="subtitle">Connect your health devices for automatic tracking</div>
        </div>
        
        <div class="health-providers">
            <div class="provider-card connected">
                <div class="connected-badge">✓</div>
                <div class="provider-icon">🍎</div>
                <div class="provider-name">Apple Health</div>
                <div class="provider-status">Connected</div>
            </div>
            
            <div class="provider-card">
                <div class="provider-icon">🏃</div>
                <div class="provider-name">Google Fit</div>
                <div class="provider-status">Available</div>
            </div>
        </div>
        
        <div class="health-data">
            <div class="data-title">Today's Health Data</div>
            <div class="data-grid">
                <div class="data-item">
                    <div class="data-value">8,542</div>
                    <div class="data-label">Steps</div>
                </div>
                <div class="data-item">
                    <div class="data-value">72 bpm</div>
                    <div class="data-label">Heart Rate</div>
                </div>
                <div class="data-item">
                    <div class="data-value">2,140</div>
                    <div class="data-label">Calories</div>
                </div>
                <div class="data-item">
                    <div class="data-value">45 min</div>
                    <div class="data-label">Active Time</div>
                </div>
            </div>
        </div>
        
        <button class="sync-button">🔄 Sync Health Data Now</button>
        
        <div class="privacy-note">
            🔒 Your health data is encrypted and never shared with third parties. Only you and your chosen trainers can access your fitness metrics.
        </div>
    </div>
</body>
</html>
EOF

# Screenshot 3: GPS Session Check-In
cat > /app/AppStoreAssets/Screenshots/screenshot3_gps.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LiftLink - GPS Session Check-In</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #000000, #1a1a1a, #000000);
            color: #ffffff;
            width: 375px;
            height: 812px;
            overflow: hidden;
            position: relative;
        }
        
        .container {
            padding: 60px 20px 20px;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #C4D600;
            margin-bottom: 8px;
        }
        
        .subtitle {
            font-size: 16px;
            color: #888888;
        }
        
        .session-card {
            background: rgba(196, 214, 0, 0.1);
            border: 1px solid rgba(196, 214, 0, 0.2);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .session-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }
        
        .trainer-avatar {
            width: 50px;
            height: 50px;
            background: #C4D600;
            border-radius: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: bold;
            color: #000;
        }
        
        .session-info h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .session-time {
            font-size: 14px;
            color: #C4D600;
        }
        
        .session-details {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .detail-label {
            color: #888888;
            font-size: 14px;
        }
        
        .detail-value {
            color: #ffffff;
            font-size: 14px;
            font-weight: 500;
        }
        
        .location-section {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .location-title {
            font-size: 18px;
            font-weight: 600;
            color: #C4D600;
            margin-bottom: 16px;
            text-align: center;
        }
        
        .location-status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: rgba(196, 214, 0, 0.2);
            border: 1px solid #C4D600;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
        }
        
        .location-text {
            font-size: 14px;
            color: #C4D600;
            font-weight: 500;
        }
        
        .coordinates {
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 12px;
            color: #888888;
            text-align: center;
            margin-bottom: 16px;
        }
        
        .accuracy-badge {
            background: #C4D600;
            color: #000;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
            margin: 0 auto;
        }
        
        .checkin-button {
            background: linear-gradient(45deg, #C4D600, #B2FF66);
            color: #000000;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            font-weight: bold;
            font-size: 18px;
            border: none;
            margin-bottom: 16px;
            position: relative;
            overflow: hidden;
        }
        
        .checkin-button::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { width: 0; height: 0; opacity: 1; }
            100% { width: 100%; height: 100%; opacity: 0; }
        }
        
        .reward-preview {
            background: rgba(196, 214, 0, 0.1);
            border: 1px solid rgba(196, 214, 0, 0.3);
            border-radius: 8px;
            padding: 12px;
            text-align: center;
        }
        
        .reward-text {
            font-size: 14px;
            color: #C4D600;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">📍 Session Check-In</div>
            <div class="subtitle">GPS verification for accountability</div>
        </div>
        
        <div class="session-card">
            <div class="session-header">
                <div class="trainer-avatar">AR</div>
                <div class="session-info">
                    <h3>Alex Rodriguez</h3>
                    <div class="session-time">Today • 10:00 AM - 11:00 AM</div>
                </div>
            </div>
            
            <div class="session-details">
                <div class="detail-row">
                    <span class="detail-label">Session Type:</span>
                    <span class="detail-value">Personal Training</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">FitLife Gym - Studio A</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">60 minutes</span>
                </div>
            </div>
        </div>
        
        <div class="location-section">
            <div class="location-title">🎯 Location Verification</div>
            
            <div class="location-status">
                <span>✅</span>
                <span class="location-text">Location Verified - Ready to Check In</span>
            </div>
            
            <div class="coordinates">
                GPS: 37.7749° N, 122.4194° W
            </div>
            
            <div style="text-align: center;">
                <span class="accuracy-badge">±3m accuracy</span>
            </div>
        </div>
        
        <button class="checkin-button">
            📍 Check In to Session
        </button>
        
        <div class="reward-preview">
            <div class="reward-text">💰 Earn 25 LiftCoins for attending this session!</div>
        </div>
    </div>
</body>
</html>
EOF

echo "✅ Screenshot mockups created successfully!"
echo ""
echo "📁 Created files:"
echo "   - screenshot1_welcome.html (Welcome & Features)"
echo "   - screenshot2_health.html (Health Integration)"  
echo "   - screenshot3_gps.html (GPS Session Check-In)"
echo ""
echo "📱 To generate actual screenshots:"
echo "   1. Open HTML files in browser"
echo "   2. Set browser window to iPhone dimensions (375x812)"
echo "   3. Take screenshots for App Store submission"
echo ""
echo "🎯 Recommended screenshot sizes:"
echo "   - iPhone 6.7\": 1290 x 2796 pixels"
echo "   - iPhone 5.5\": 1242 x 2208 pixels"