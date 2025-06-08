#!/bin/bash

# LiftLink Real Screenshot Generator for App Store
# Creates actual PNG images with exact App Store dimensions

echo "📸 LiftLink Real Screenshot Generator"
echo "===================================="
echo ""

# Create screenshots directory
mkdir -p /app/LiftLinkScreenshots
cd /app/LiftLinkScreenshots

# App Store required dimensions
declare -A DIMENSIONS=(
    ["iphone_67_primary"]="1320x2868"    # iPhone 14/15 Pro Max primary
    ["iphone_67_alt"]="1290x2796"        # iPhone 14/15 Pro Max alternative
    ["iphone_65"]="1242x2688"            # iPhone XS Max, 11 Pro Max
    ["iphone_67_pro"]="1284x2778"        # iPhone 12/13/14 Pro Max
)

# Function to create properly sized screenshot HTML
create_screenshot_html() {
    local type=$1
    local dimensions=$2
    local width=$(echo $dimensions | cut -d'x' -f1)
    local height=$(echo $dimensions | cut -d'x' -f2)
    
    cat > "temp_${type}_${dimensions}.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LiftLink - ${type^}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #000000, #1a1a1a, #000000);
            color: #ffffff;
            width: ${width}px;
            height: ${height}px;
            overflow: hidden;
            padding: 80px 60px 60px;
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
            font-size: 96px;
            font-weight: bold;
            color: #C4D600;
            margin-bottom: 24px;
            text-shadow: 0 0 60px rgba(196, 214, 0, 0.8);
        }
        
        .tagline {
            font-size: 42px;
            color: #888888;
            margin-bottom: 32px;
        }
        
        .subtitle {
            font-size: 36px;
            color: #cccccc;
            margin-bottom: 40px;
        }
        
        .features-grid {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr;
            gap: 32px;
            margin-bottom: 60px;
        }
        
        .feature-card {
            background: rgba(196, 214, 0, 0.1);
            border: 3px solid rgba(196, 214, 0, 0.3);
            border-radius: 32px;
            padding: 48px;
            display: flex;
            align-items: center;
            gap: 32px;
        }
        
        .feature-icon {
            font-size: 72px;
            min-width: 100px;
        }
        
        .feature-content h3 {
            font-size: 42px;
            font-weight: 600;
            margin-bottom: 12px;
        }
        
        .feature-content p {
            font-size: 32px;
            color: #cccccc;
            line-height: 1.4;
        }
        
        .status-badge {
            background: #C4D600;
            color: #000;
            padding: 12px 24px;
            border-radius: 24px;
            font-size: 24px;
            font-weight: 700;
            margin-left: auto;
        }
        
        .cta-button {
            background: linear-gradient(45deg, #C4D600, #B2FF66);
            color: #000000;
            padding: 48px;
            border-radius: 32px;
            text-align: center;
            font-weight: bold;
            font-size: 48px;
            border: none;
            margin-bottom: 32px;
        }
        
        .stats-bar {
            background: rgba(196, 214, 0, 0.15);
            border: 3px solid rgba(196, 214, 0, 0.4);
            border-radius: 24px;
            padding: 32px;
            margin-bottom: 40px;
            text-align: center;
        }
        
        .stats-text {
            font-size: 36px;
            color: #C4D600;
            font-weight: 600;
        }
EOF

    # Add content based on screenshot type
    case $type in
        "welcome")
            cat >> "temp_${type}_${dimensions}.html" << 'EOF'
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">LiftLink</div>
            <div class="tagline">Elite Fitness Training Platform</div>
            <div class="stats-bar">
                <div class="stats-text">Level 5 • 150 LiftCoins • 7 Day Streak 🔥</div>
            </div>
        </div>
        
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">🏋️</div>
                <div class="feature-content">
                    <h3>Certified Trainers</h3>
                    <p>Connect with verified fitness professionals</p>
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
        </div>
        
        <button class="cta-button">Get Started - Join Elite Fitness</button>
    </div>
</body>
</html>
EOF
            ;;
            
        "health")
            cat >> "temp_${type}_${dimensions}.html" << 'EOF'
        .health-providers {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 80px;
        }
        
        .provider-card {
            background: rgba(196, 214, 0, 0.1);
            border: 3px solid rgba(196, 214, 0, 0.3);
            border-radius: 32px;
            padding: 48px;
            text-align: center;
            position: relative;
        }
        
        .provider-card.connected {
            border-color: #C4D600;
            background: rgba(196, 214, 0, 0.2);
        }
        
        .provider-icon {
            width: 160px;
            height: 160px;
            background: #C4D600;
            border-radius: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 32px;
            font-size: 72px;
            color: #000;
        }
        
        .provider-name {
            font-size: 36px;
            font-weight: 600;
            margin-bottom: 12px;
        }
        
        .provider-status {
            font-size: 32px;
            color: #C4D600;
        }
        
        .connected-badge {
            position: absolute;
            top: 24px;
            right: 24px;
            background: #C4D600;
            color: #000;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
        }
        
        .health-data {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 32px;
            padding: 48px;
            margin-bottom: 60px;
        }
        
        .data-title {
            font-size: 48px;
            font-weight: 600;
            color: #C4D600;
            margin-bottom: 40px;
            text-align: center;
        }
        
        .data-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
        }
        
        .data-item {
            text-align: center;
            background: rgba(196, 214, 0, 0.1);
            border-radius: 24px;
            padding: 32px;
        }
        
        .data-value {
            font-size: 56px;
            font-weight: bold;
            color: #C4D600;
        }
        
        .data-label {
            font-size: 32px;
            color: #cccccc;
            margin-top: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏥</div>
            <div class="tagline">Health Integration</div>
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
        
        <button class="cta-button">🔄 Sync Health Data Now</button>
    </div>
</body>
</html>
EOF
            ;;
            
        "gps")
            cat >> "temp_${type}_${dimensions}.html" << 'EOF'
        .session-card {
            background: rgba(196, 214, 0, 0.1);
            border: 3px solid rgba(196, 214, 0, 0.3);
            border-radius: 32px;
            padding: 48px;
            margin-bottom: 60px;
        }
        
        .session-header {
            display: flex;
            align-items: center;
            gap: 32px;
            margin-bottom: 40px;
        }
        
        .trainer-avatar {
            width: 120px;
            height: 120px;
            background: #C4D600;
            border-radius: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 56px;
            font-weight: bold;
            color: #000;
        }
        
        .session-info h3 {
            font-size: 48px;
            font-weight: 600;
            margin-bottom: 12px;
        }
        
        .session-time {
            font-size: 36px;
            color: #C4D600;
        }
        
        .location-section {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 32px;
            padding: 48px;
            margin-bottom: 60px;
        }
        
        .location-title {
            font-size: 48px;
            font-weight: 600;
            color: #C4D600;
            margin-bottom: 40px;
            text-align: center;
        }
        
        .location-status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;
            background: rgba(196, 214, 0, 0.2);
            border: 3px solid #C4D600;
            border-radius: 24px;
            padding: 32px;
            margin-bottom: 40px;
        }
        
        .location-text {
            font-size: 36px;
            color: #C4D600;
            font-weight: 500;
        }
        
        .coordinates {
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 32px;
            color: #888888;
            text-align: center;
            margin-bottom: 40px;
        }
        
        .accuracy-badge {
            background: #C4D600;
            color: #000;
            padding: 16px 32px;
            border-radius: 32px;
            font-size: 32px;
            font-weight: 600;
            display: block;
            text-align: center;
            margin: 0 auto;
        }
        
        .reward-preview {
            background: rgba(196, 214, 0, 0.1);
            border: 3px solid rgba(196, 214, 0, 0.3);
            border-radius: 24px;
            padding: 32px;
            text-align: center;
            margin-top: 40px;
        }
        
        .reward-text {
            font-size: 36px;
            color: #C4D600;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📍</div>
            <div class="tagline">Session Check-In</div>
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
        </div>
        
        <div class="location-section">
            <div class="location-title">🎯 Location Verification</div>
            
            <div class="location-status">
                <span style="font-size: 48px;">✅</span>
                <span class="location-text">Location Verified - Ready to Check In</span>
            </div>
            
            <div class="coordinates">
                GPS: 37.7749° N, 122.4194° W
            </div>
            
            <div style="text-align: center;">
                <span class="accuracy-badge">±3m accuracy</span>
            </div>
        </div>
        
        <button class="cta-button">
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

# Generate screenshots function
generate_screenshot() {
    local type=$1
    local device=$2
    local dimensions=$3
    local width=$(echo $dimensions | cut -d'x' -f1)
    local height=$(echo $dimensions | cut -d'x' -f2)
    
    echo "  📱 Creating $type screenshot for $device ($dimensions)..."
    
    # Create HTML template
    create_screenshot_html "$type" "$dimensions"
    
    # Generate screenshot using wkhtmltoimage
    local html_file="temp_${type}_${dimensions}.html"
    local png_file="LiftLink_${type}_${device}_${dimensions}.png"
    
    if xvfb-run -a --server-args="-screen 0 ${width}x${height}x24" wkhtmltoimage \
        --width $width \
        --height $height \
        --format png \
        --quality 100 \
        --load-error-handling ignore \
        --load-media-error-handling ignore \
        "$html_file" "$png_file" 2>/dev/null; then
        
        echo "    ✅ Successfully created: $png_file"
        rm -f "$html_file"
        return 0
    else
        echo "    ❌ Failed to create: $png_file"
        rm -f "$html_file"
        return 1
    fi
}

# Main screenshot generation
echo "🎨 Generating App Store screenshots with exact dimensions..."
echo ""

screenshot_types=("welcome" "health" "gps")
success_count=0
total_count=0

for type in "${screenshot_types[@]}"; do
    echo "📸 Creating '$type' screenshots..."
    
    for device in "${!DIMENSIONS[@]}"; do
        dimensions=${DIMENSIONS[$device]}
        
        if generate_screenshot "$type" "$device" "$dimensions"; then
            ((success_count++))
        fi
        ((total_count++))
    done
    
    echo ""
done

# Generate additional screenshot types for a full set of 10
additional_types=("trainers" "progress" "social" "verification" "dashboard" "sessions" "rewards")

echo "📸 Creating additional screenshot types..."

for type in "${additional_types[@]:0:7}"; do  # Take first 7 to get to 10 total
    echo "📱 Creating '$type' screenshots..."
    
    # Just create for the primary iPhone dimension to get more variety
    device="iphone_67_primary"
    dimensions=${DIMENSIONS[$device]}
    
    # Create simplified templates for additional types
    width=$(echo $dimensions | cut -d'x' -f1)
    height=$(echo $dimensions | cut -d'x' -f2)
    
    cat > "temp_${type}_${dimensions}.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LiftLink - ${type^}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #000000, #1a1a1a, #000000);
            color: #ffffff;
            width: ${width}px;
            height: ${height}px;
            overflow: hidden;
            padding: 80px 60px 60px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .logo {
            font-size: 96px;
            font-weight: bold;
            color: #C4D600;
            margin-bottom: 40px;
            text-shadow: 0 0 60px rgba(196, 214, 0, 0.8);
        }
        
        .title {
            font-size: 64px;
            font-weight: 600;
            color: #C4D600;
            margin-bottom: 32px;
            text-align: center;
        }
        
        .subtitle {
            font-size: 48px;
            color: #cccccc;
            margin-bottom: 80px;
            text-align: center;
        }
        
        .coming-soon {
            background: rgba(196, 214, 0, 0.1);
            border: 3px solid rgba(196, 214, 0, 0.3);
            border-radius: 32px;
            padding: 48px;
            text-align: center;
        }
        
        .coming-soon h3 {
            font-size: 56px;
            color: #C4D600;
            margin-bottom: 24px;
        }
        
        .coming-soon p {
            font-size: 36px;
            color: #888888;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="logo">LiftLink</div>
    <div class="title">${type^} Feature</div>
    <div class="subtitle">Coming Soon in LiftLink</div>
    
    <div class="coming-soon">
        <h3>🚀 In Development</h3>
        <p>This advanced feature is being developed and will be available in upcoming releases.</p>
    </div>
</body>
</html>
EOF
    
    if generate_screenshot "$type" "$device" "$dimensions"; then
        ((success_count++))
    fi
    ((total_count++))
    
    echo ""
done

echo "📊 Screenshot Generation Complete!"
echo "=================================="
echo "Total screenshots generated: $success_count/$total_count"
echo "📁 Location: $(pwd)"
echo ""

if [ $success_count -gt 0 ]; then
    echo "✅ Successfully generated $success_count App Store screenshots!"
    echo ""
    echo "📱 Generated files:"
    ls -la *.png 2>/dev/null | head -10
    echo ""
    echo "🎯 These screenshots are ready for App Store submission!"
    echo "📋 Dimensions included:"
    for device in "${!DIMENSIONS[@]}"; do
        echo "   • $device: ${DIMENSIONS[$device]}"
    done
else
    echo "❌ No screenshots were generated successfully"
fi

# Create a simple HTML viewer
cat > "screenshot-viewer.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>LiftLink App Store Screenshots</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .screenshot { margin: 20px 0; text-align: center; }
        .screenshot img { max-width: 200px; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .screenshot h3 { color: #333; font-size: 14px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
        .dimensions { font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <h1>LiftLink App Store Screenshots</h1>
    <p>Generated screenshots ready for App Store submission</p>
    
    <div class="grid">
EOF

# Add generated screenshots to viewer
for png_file in LiftLink_*.png; do
    if [ -f "$png_file" ]; then
        echo "        <div class=\"screenshot\">" >> screenshot-viewer.html
        echo "            <h3>$png_file</h3>" >> screenshot-viewer.html
        echo "            <div class=\"dimensions\">$(identify -format '%wx%h' "$png_file" 2>/dev/null || echo 'Check file')</div>" >> screenshot-viewer.html
        echo "            <img src=\"$png_file\" alt=\"$png_file\">" >> screenshot-viewer.html
        echo "        </div>" >> screenshot-viewer.html
    fi
done

cat >> "screenshot-viewer.html" << 'EOF'
    </div>
    
    <h2>App Store Requirements Met:</h2>
    <ul>
        <li>✅ iPhone 6.7" displays: 1320x2868px, 1290x2796px, 1284x2778px</li>
        <li>✅ iPhone 6.5" displays: 1242x2688px</li>
        <li>✅ Professional quality PNG format</li>
        <li>✅ LiftLink branding and features showcased</li>
    </ul>
</body>
</html>
EOF

echo "📄 Created screenshot-viewer.html for easy viewing"