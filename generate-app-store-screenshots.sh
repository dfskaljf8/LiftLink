#!/bin/bash

# LiftLink App Store Screenshot Generator
# Creates properly sized screenshots for App Store submission

echo "📸 LiftLink App Store Screenshot Generator"
echo "=========================================="
echo ""

# Create screenshots directory
mkdir -p /app/AppStoreScreenshots
cd /app/AppStoreScreenshots

# App Store required dimensions
declare -A DIMENSIONS=(
    ["iphone_67_primary"]="1320x2868"
    ["iphone_67_alt"]="1290x2796" 
    ["iphone_65"]="1242x2688"
    ["iphone_67_pro"]="1284x2778"
)

# Screenshot types needed
SCREENSHOT_TYPES=(
    "welcome:Welcome Screen"
    "health:Health Integration"
    "gps:GPS Session Check-In"
    "trainers:Find Trainers"
    "progress:Progress Analytics"
    "social:Social Features"
    "verification:ID Verification"
    "dashboard:Dashboard"
    "sessions:Session Management"
    "rewards:Rewards System"
)

# Function to create HTML template for specific screenshot
create_screenshot_html() {
    local type=$1
    local dimensions=$2
    local width=$(echo $dimensions | cut -d'x' -f1)
    local height=$(echo $dimensions | cut -d'x' -f2)
    
    case $type in
        "welcome")
            cat > "temp_${type}_${dimensions}.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LiftLink - Welcome</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #000000, #1a1a1a, #000000);
            color: #ffffff;
            width: ${width}px;
            height: ${height}px;
            overflow: hidden;
            padding: 80px 40px 40px;
        }
        
        .container {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            text-align: center;
            margin-bottom: 60px;
        }
        
        .logo {
            font-size: 72px;
            font-weight: bold;
            color: #C4D600;
            margin-bottom: 16px;
            text-shadow: 0 0 40px rgba(196, 214, 0, 0.8);
        }
        
        .tagline {
            font-size: 32px;
            color: #888888;
            margin-bottom: 24px;
        }
        
        .user-stats {
            background: rgba(196, 214, 0, 0.15);
            border: 2px solid rgba(196, 214, 0, 0.4);
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 40px;
        }
        
        .stats-text {
            font-size: 28px;
            color: #C4D600;
            font-weight: 600;
            text-align: center;
        }
        
        .features-grid {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
            margin-bottom: 40px;
        }
        
        .feature-card {
            background: rgba(196, 214, 0, 0.1);
            border: 2px solid rgba(196, 214, 0, 0.3);
            border-radius: 20px;
            padding: 32px;
            display: flex;
            align-items: center;
            gap: 24px;
        }
        
        .feature-icon {
            font-size: 48px;
        }
        
        .feature-content h3 {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .feature-content p {
            font-size: 24px;
            color: #cccccc;
        }
        
        .status-badge {
            background: #C4D600;
            color: #000;
            padding: 8px 16px;
            border-radius: 16px;
            font-size: 18px;
            font-weight: 700;
            margin-left: auto;
        }
        
        .cta-button {
            background: linear-gradient(45deg, #C4D600, #B2FF66);
            color: #000000;
            padding: 32px;
            border-radius: 20px;
            text-align: center;
            font-weight: bold;
            font-size: 36px;
            border: none;
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
                    <p>Apple Health & Google Fit</p>
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
                <div class="feature-icon">🔒</div>
                <div class="feature-content">
                    <h3>ID Verification</h3>
                    <p>Secure age verification</p>
                </div>
                <div class="status-badge">LIVE</div>
            </div>
        </div>
        
        <button class="cta-button">Get Started - Join Elite Fitness</button>
    </div>
</body>
</html>
EOF
            ;;
        
        "health")
            cat > "temp_${type}_${dimensions}.html" << EOF
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
            width: ${width}px;
            height: ${height}px;
            overflow: hidden;
            padding: 80px 40px 40px;
        }
        
        .container {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            text-align: center;
            margin-bottom: 50px;
        }
        
        .title {
            font-size: 48px;
            font-weight: bold;
            color: #C4D600;
            margin-bottom: 16px;
        }
        
        .subtitle {
            font-size: 32px;
            color: #888888;
            margin-bottom: 40px;
        }
        
        .health-providers {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            margin-bottom: 60px;
        }
        
        .provider-card {
            background: rgba(196, 214, 0, 0.1);
            border: 2px solid rgba(196, 214, 0, 0.3);
            border-radius: 24px;
            padding: 40px;
            text-align: center;
            position: relative;
        }
        
        .provider-card.connected {
            border-color: #C4D600;
            background: rgba(196, 214, 0, 0.2);
        }
        
        .provider-icon {
            width: 120px;
            height: 120px;
            background: #C4D600;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            font-size: 48px;
            color: #000;
        }
        
        .provider-name {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .provider-status {
            font-size: 24px;
            color: #C4D600;
        }
        
        .connected-badge {
            position: absolute;
            top: 16px;
            right: 16px;
            background: #C4D600;
            color: #000;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }
        
        .health-data {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 24px;
            padding: 40px;
            margin-bottom: 40px;
        }
        
        .data-title {
            font-size: 36px;
            font-weight: 600;
            color: #C4D600;
            margin-bottom: 32px;
            text-align: center;
        }
        
        .data-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }
        
        .data-item {
            text-align: center;
            background: rgba(196, 214, 0, 0.1);
            border-radius: 16px;
            padding: 24px;
        }
        
        .data-value {
            font-size: 40px;
            font-weight: bold;
            color: #C4D600;
        }
        
        .data-label {
            font-size: 24px;
            color: #cccccc;
            margin-top: 8px;
        }
        
        .sync-button {
            background: linear-gradient(45deg, #C4D600, #B2FF66);
            color: #000000;
            padding: 32px;
            border-radius: 20px;
            text-align: center;
            font-weight: bold;
            font-size: 32px;
            border: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">🏥 Health Integration</div>
            <div class="subtitle">Connect your health devices</div>
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
    </div>
</body>
</html>
EOF
            ;;
            
        "gps")
            cat > "temp_${type}_${dimensions}.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LiftLink - GPS Check-In</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #000000, #1a1a1a, #000000);
            color: #ffffff;
            width: ${width}px;
            height: ${height}px;
            overflow: hidden;
            padding: 80px 40px 40px;
        }
        
        .container {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .title {
            font-size: 48px;
            font-weight: bold;
            color: #C4D600;
            margin-bottom: 16px;
        }
        
        .subtitle {
            font-size: 32px;
            color: #888888;
        }
        
        .session-card {
            background: rgba(196, 214, 0, 0.1);
            border: 2px solid rgba(196, 214, 0, 0.3);
            border-radius: 24px;
            padding: 40px;
            margin-bottom: 40px;
        }
        
        .session-header {
            display: flex;
            align-items: center;
            gap: 24px;
            margin-bottom: 32px;
        }
        
        .trainer-avatar {
            width: 100px;
            height: 100px;
            background: #C4D600;
            border-radius: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            font-weight: bold;
            color: #000;
        }
        
        .session-info h3 {
            font-size: 36px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .session-time {
            font-size: 28px;
            color: #C4D600;
        }
        
        .session-details {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 32px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
        }
        
        .detail-label {
            color: #888888;
            font-size: 28px;
        }
        
        .detail-value {
            color: #ffffff;
            font-size: 28px;
            font-weight: 500;
        }
        
        .location-section {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 24px;
            padding: 40px;
            margin-bottom: 40px;
        }
        
        .location-title {
            font-size: 36px;
            font-weight: 600;
            color: #C4D600;
            margin-bottom: 32px;
            text-align: center;
        }
        
        .location-status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            background: rgba(196, 214, 0, 0.2);
            border: 2px solid #C4D600;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 32px;
        }
        
        .location-text {
            font-size: 28px;
            color: #C4D600;
            font-weight: 500;
        }
        
        .coordinates {
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 24px;
            color: #888888;
            text-align: center;
            margin-bottom: 32px;
        }
        
        .accuracy-badge {
            background: #C4D600;
            color: #000;
            padding: 8px 16px;
            border-radius: 24px;
            font-size: 24px;
            font-weight: 600;
            display: block;
            text-align: center;
            margin: 0 auto;
        }
        
        .checkin-button {
            background: linear-gradient(45deg, #C4D600, #B2FF66);
            color: #000000;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            font-weight: bold;
            font-size: 36px;
            border: none;
            margin-bottom: 32px;
        }
        
        .reward-preview {
            background: rgba(196, 214, 0, 0.1);
            border: 2px solid rgba(196, 214, 0, 0.3);
            border-radius: 16px;
            padding: 24px;
            text-align: center;
        }
        
        .reward-text {
            font-size: 28px;
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
                <span style="font-size: 32px;">✅</span>
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
            ;;
    esac
}

# Function to convert HTML to PNG (requires wkhtmltopdf or similar)
convert_html_to_png() {
    local html_file=$1
    local output_file=$2
    local width=$3
    local height=$4
    
    if command -v wkhtmltoimage &> /dev/null; then
        wkhtmltoimage --width $width --height $height --format png "$html_file" "$output_file"
        return $?
    elif command -v google-chrome &> /dev/null; then
        google-chrome --headless --disable-gpu --window-size=$width,$height --screenshot="$output_file" "$html_file"
        return $?
    elif command -v chromium-browser &> /dev/null; then
        chromium-browser --headless --disable-gpu --window-size=$width,$height --screenshot="$output_file" "$html_file"
        return $?
    else
        echo "❌ No suitable HTML to PNG converter found"
        echo "   Please install: wkhtmltopdf, google-chrome, or chromium-browser"
        return 1
    fi
}

# Generate screenshots for each type and dimension
echo "🎨 Generating App Store screenshots..."
echo ""

screenshot_count=0
success_count=0

for type_info in "${SCREENSHOT_TYPES[@]}"; do
    type=$(echo $type_info | cut -d':' -f1)
    title=$(echo $type_info | cut -d':' -f2)
    
    echo "📱 Creating '$title' screenshots..."
    
    for device in "${!DIMENSIONS[@]}"; do
        dimensions=${DIMENSIONS[$device]}
        width=$(echo $dimensions | cut -d'x' -f1)
        height=$(echo $dimensions | cut -d'x' -f2)
        
        # Create HTML template
        create_screenshot_html "$type" "$dimensions"
        
        # Convert to PNG
        html_file="temp_${type}_${dimensions}.html"
        png_file="${type}_${device}_${dimensions}.png"
        
        if convert_html_to_png "$html_file" "$png_file" "$width" "$height"; then
            echo "  ✅ $title - $device ($dimensions)"
            ((success_count++))
        else
            echo "  ❌ Failed: $title - $device ($dimensions)"
        fi
        
        # Clean up temp HTML
        rm -f "$html_file"
        ((screenshot_count++))
    done
    
    echo ""
done

echo "📊 Screenshot Generation Summary:"
echo "================================="
echo "Total screenshots attempted: $screenshot_count"
echo "Successfully generated: $success_count"
echo "Failed: $((screenshot_count - success_count))"
echo ""
echo "📁 Screenshots location: $(pwd)"
echo ""

if [ $success_count -eq 0 ]; then
    echo "❌ No screenshots were generated successfully"
    echo ""
    echo "🔧 Installation options:"
    echo "  Ubuntu/Debian: sudo apt-get install wkhtmltopdf"
    echo "  macOS: brew install wkhtmltopdf"
    echo "  Or install Google Chrome/Chromium"
    echo ""
    echo "💡 Alternative: Use the HTML files in a browser and take manual screenshots"
else
    echo "🎉 Screenshots generated successfully!"
    echo "📱 Ready for App Store submission!"
fi

# Create index file for easy viewing
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>LiftLink App Store Screenshots</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .screenshot { margin: 20px 0; text-align: center; }
        .screenshot img { max-width: 300px; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .screenshot h3 { color: #333; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
    </style>
</head>
<body>
    <h1>LiftLink App Store Screenshots</h1>
    <p>Generated screenshots for App Store submission</p>
    
    <div class="grid">
EOF

# Add generated screenshots to index
for png_file in *.png; do
    if [ -f "$png_file" ]; then
        echo "        <div class=\"screenshot\">" >> index.html
        echo "            <h3>$png_file</h3>" >> index.html
        echo "            <img src=\"$png_file\" alt=\"$png_file\">" >> index.html
        echo "        </div>" >> index.html
    fi
done

cat >> index.html << 'EOF'
    </div>
</body>
</html>
EOF

echo "📄 Created index.html for viewing all screenshots"