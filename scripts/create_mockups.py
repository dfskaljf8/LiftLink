#!/usr/bin/env python3
"""
LiftLink iPad Screenshot Mockup Generator
Creates PNG mockups for App Store Connect using PIL/Pillow
"""

import os
from PIL import Image, ImageDraw, ImageFont
import textwrap

def create_mockup_images():
    """Generate iPad mockup images for App Store Connect"""
    
    # Create screenshots directory
    screenshots_dir = "/app/frontend/public/screenshots"
    os.makedirs(screenshots_dir, exist_ok=True)
    
    # iPad dimensions for App Store Connect
    portrait_size = (2048, 2732)
    landscape_size = (2732, 2048)
    
    # Colors from LiftLink theme
    bg_color = "#0a0a0a"
    accent_color = "#C4D600"
    text_color = "#ffffff"
    card_color = "#1a1a1a"
    
    print("🎨 Creating LiftLink iPad Screenshot Mockups...")
    
    # Screenshot 1: Home Dashboard (Portrait)
    create_home_mockup(screenshots_dir, portrait_size, bg_color, accent_color, text_color, card_color)
    
    # Screenshot 2: Trainer Search (Portrait)
    create_trainer_search_mockup(screenshots_dir, portrait_size, bg_color, accent_color, text_color, card_color)
    
    # Screenshot 3: Health Integrations (Portrait)
    create_health_mockup(screenshots_dir, portrait_size, bg_color, accent_color, text_color, card_color)
    
    # Screenshot 4: Progress Analytics (Landscape)
    create_analytics_mockup(screenshots_dir, landscape_size, bg_color, accent_color, text_color, card_color)
    
    # Screenshot 5: Social Hub (Portrait)
    create_social_mockup(screenshots_dir, portrait_size, bg_color, accent_color, text_color, card_color)
    
    # Screenshot 6: Session Check-in (Portrait)
    create_session_mockup(screenshots_dir, portrait_size, bg_color, accent_color, text_color, card_color)
    
    print(f"\n🎉 All mockups generated successfully!")
    print(f"📁 Location: {screenshots_dir}")
    
    # List generated files
    print("\n📋 Generated mockup files:")
    for file in sorted(os.listdir(screenshots_dir)):
        if file.endswith('.png'):
            filepath = os.path.join(screenshots_dir, file)
            size = os.path.getsize(filepath)
            print(f"  • {file} ({size // 1024} KB)")

def create_home_mockup(screenshots_dir, size, bg_color, accent_color, text_color, card_color):
    """Create home dashboard mockup"""
    img = Image.new('RGB', size, bg_color)
    draw = ImageDraw.Draw(img)
    
    # Header
    header_height = 160
    draw.rectangle([0, 0, size[0], header_height], fill="#0f0f0f")
    
    # App title
    try:
        title_font = ImageFont.truetype("arial.ttf", 60)
        subtitle_font = ImageFont.truetype("arial.ttf", 40)
        text_font = ImageFont.truetype("arial.ttf", 32)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
    
    draw.text((80, 50), "🏋️ LiftLink", font=title_font, fill=text_color)
    draw.text((size[0]-300, 50), "🪙 150  Lv. 5", font=subtitle_font, fill=accent_color)
    
    # Hero section
    hero_y = header_height + 80
    draw.text((80, hero_y), "Welcome back, Demo!", font=title_font, fill=accent_color)
    draw.text((80, hero_y + 80), "Ready to crush your fitness goals today?", font=subtitle_font, fill=text_color)
    draw.text((80, hero_y + 140), "🔥 7 day streak", font=text_font, fill=accent_color)
    
    # Quick actions grid
    actions_y = hero_y + 250
    action_width = (size[0] - 240) // 2
    action_height = 200
    
    actions = [
        ("🔍", "Find Trainers", "Discover certified trainers"),
        ("📊", "Track Progress", "View your fitness analytics"),
        ("🏆", "Achievements", "Unlock new badges"),
        ("👥", "Social Hub", "Connect with friends")
    ]
    
    for i, (icon, title, desc) in enumerate(actions):
        x = 80 + (i % 2) * (action_width + 40)
        y = actions_y + (i // 2) * (action_height + 40)
        
        # Card background
        draw.rectangle([x, y, x + action_width, y + action_height], fill=card_color, outline=accent_color, width=2)
        
        # Content
        draw.text((x + 40, y + 20), icon, font=title_font, fill=accent_color)
        draw.text((x + 40, y + 100), title, font=subtitle_font, fill=text_color)
        draw.text((x + 40, y + 150), desc, font=text_font, fill="#888888")
    
    # Progress section
    progress_y = actions_y + 480
    draw.text((80, progress_y), "Your Progress", font=title_font, fill=text_color)
    
    # Progress bars
    bar_y = progress_y + 100
    draw.rectangle([80, bar_y, size[0] - 80, bar_y + 60], fill=card_color, outline=accent_color, width=2)
    draw.rectangle([100, bar_y + 20, 100 + int((size[0] - 200) * 0.75), bar_y + 40], fill=accent_color)
    draw.text((120, bar_y - 30), "XP Points: 450 / 600", font=text_font, fill=text_color)
    
    img.save(os.path.join(screenshots_dir, "01-Home-Dashboard-Portrait.png"))
    print("  ✅ Home Dashboard mockup created")

def create_trainer_search_mockup(screenshots_dir, size, bg_color, accent_color, text_color, card_color):
    """Create trainer search mockup"""
    img = Image.new('RGB', size, bg_color)
    draw = ImageDraw.Draw(img)
    
    try:
        title_font = ImageFont.truetype("arial.ttf", 60)
        subtitle_font = ImageFont.truetype("arial.ttf", 40)
        text_font = ImageFont.truetype("arial.ttf", 32)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
    
    # Header
    header_height = 160
    draw.rectangle([0, 0, size[0], header_height], fill="#0f0f0f")
    draw.text((80, 50), "🔍 Find Trainers", font=title_font, fill=text_color)
    
    # Search bar
    search_y = header_height + 40
    draw.rectangle([80, search_y, size[0] - 80, search_y + 80], fill=card_color, outline=accent_color, width=2)
    draw.text((120, search_y + 25), "🔍 Search trainers near you...", font=subtitle_font, fill="#888888")
    
    # Filter chips
    filter_y = search_y + 120
    filters = ["Strength Training", "5 stars", "< 5 miles", "Available today"]
    x_pos = 80
    for filter_text in filters:
        width = len(filter_text) * 20 + 40
        color = accent_color if filter_text == "Strength Training" else "#333333"
        text_col = "#000000" if filter_text == "Strength Training" else text_color
        
        draw.rectangle([x_pos, filter_y, x_pos + width, filter_y + 50], fill=color)
        draw.text((x_pos + 20, filter_y + 15), filter_text, font=text_font, fill=text_col)
        x_pos += width + 20
    
    # Trainer cards
    cards_y = filter_y + 100
    trainers = [
        ("👩‍💪", "Sarah Johnson", "Strength Training", "⭐ 4.9 (127)", "$85/hour"),
        ("👨‍💪", "Mike Rodriguez", "CrossFit & HIIT", "⭐ 4.8 (203)", "$95/hour"),
        ("🏋️", "Alex Chen", "Powerlifting", "⭐ 5.0 (89)", "$110/hour"),
        ("👩‍🏫", "Emma Davis", "Yoga & Flexibility", "⭐ 4.9 (156)", "$75/hour")
    ]
    
    card_width = (size[0] - 240) // 2
    card_height = 300
    
    for i, (icon, name, specialty, rating, price) in enumerate(trainers):
        x = 80 + (i % 2) * (card_width + 40)
        y = cards_y + (i // 2) * (card_height + 40)
        
        # Card background
        draw.rectangle([x, y, x + card_width, y + card_height], fill=card_color, outline="#333333", width=2)
        
        # Content
        draw.text((x + 40, y + 20), icon, font=title_font, fill=accent_color)
        draw.text((x + 40, y + 100), name, font=subtitle_font, fill=text_color)
        draw.text((x + 40, y + 150), specialty, font=text_font, fill="#888888")
        draw.text((x + 40, y + 190), rating, font=text_font, fill=accent_color)
        
        # Book button
        btn_x = x + card_width - 150
        btn_y = y + card_height - 60
        draw.rectangle([btn_x, btn_y, btn_x + 120, btn_y + 40], fill=accent_color)
        draw.text((btn_x + 20, btn_y + 10), "Book", font=text_font, fill="#000000")
        
        # Price
        draw.text((x + 40, y + card_height - 50), price, font=subtitle_font, fill=text_color)
    
    img.save(os.path.join(screenshots_dir, "02-Trainer-Search-Portrait.png"))
    print("  ✅ Trainer Search mockup created")

def create_health_mockup(screenshots_dir, size, bg_color, accent_color, text_color, card_color):
    """Create health integrations mockup"""
    img = Image.new('RGB', size, bg_color)
    draw = ImageDraw.Draw(img)
    
    try:
        title_font = ImageFont.truetype("arial.ttf", 60)
        subtitle_font = ImageFont.truetype("arial.ttf", 40)
        text_font = ImageFont.truetype("arial.ttf", 32)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
    
    # Header
    header_height = 160
    draw.rectangle([0, 0, size[0], header_height], fill="#0f0f0f")
    draw.text((80, 50), "📱 Health Devices", font=title_font, fill=text_color)
    
    # Integration cards
    integrations_y = header_height + 80
    devices = [
        ("🍎", "Apple Health", "✓ Connected", "#00ff00"),
        ("📱", "Google Fit", "Not Connected", "#ff6464"),
        ("⌚", "Fitbit", "✓ Connected", "#00ff00"),
        ("🏃", "Garmin Connect", "Not Connected", "#ff6464")
    ]
    
    card_width = (size[0] - 240) // 2
    card_height = 300
    
    for i, (icon, name, status, status_color) in enumerate(devices):
        x = 80 + (i % 2) * (card_width + 40)
        y = integrations_y + (i // 2) * (card_height + 40)
        
        # Card background
        draw.rectangle([x, y, x + card_width, y + card_height], fill=card_color, outline="#333333", width=2)
        
        # Content
        draw.text((x + card_width//2 - 50, y + 40), icon, font=title_font, fill=accent_color)
        draw.text((x + 40, y + 140), name, font=subtitle_font, fill=text_color)
        draw.text((x + 40, y + 190), status, font=text_font, fill=status_color)
        
        # Button
        btn_color = "#ff6464" if "Connected" in status else accent_color
        btn_text = "Disconnect" if "Connected" in status else "Connect"
        btn_text_color = text_color if "Connected" in status else "#000000"
        
        btn_x = x + 40
        btn_y = y + card_height - 80
        draw.rectangle([btn_x, btn_y, btn_x + 150, btn_y + 40], fill=btn_color)
        draw.text((btn_x + 20, btn_y + 10), btn_text, font=text_font, fill=btn_text_color)
    
    # Activity summary
    activity_y = integrations_y + 680
    draw.text((80, activity_y), "Today's Activity", font=title_font, fill=text_color)
    
    activities = [
        ("👟", "8,542", "Steps"),
        ("❤️", "72 BPM", "Heart Rate"),
        ("🔥", "2,140", "Calories"),
        ("😴", "7.5h", "Sleep")
    ]
    
    activity_card_width = (size[0] - 320) // 4
    for i, (icon, value, label) in enumerate(activities):
        x = 80 + i * (activity_card_width + 40)
        y = activity_y + 80
        
        draw.rectangle([x, y, x + activity_card_width, y + 150], fill=card_color, outline="#333333", width=2)
        draw.text((x + activity_card_width//2 - 30, y + 20), icon, font=subtitle_font, fill=accent_color)
        draw.text((x + 20, y + 70), value, font=subtitle_font, fill=accent_color)
        draw.text((x + 20, y + 110), label, font=text_font, fill="#888888")
    
    img.save(os.path.join(screenshots_dir, "03-Health-Integrations-Portrait.png"))
    print("  ✅ Health Integrations mockup created")

def create_analytics_mockup(screenshots_dir, size, bg_color, accent_color, text_color, card_color):
    """Create progress analytics mockup (landscape)"""
    img = Image.new('RGB', size, bg_color)
    draw = ImageDraw.Draw(img)
    
    try:
        title_font = ImageFont.truetype("arial.ttf", 60)
        subtitle_font = ImageFont.truetype("arial.ttf", 40)
        text_font = ImageFont.truetype("arial.ttf", 32)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
    
    # Header
    header_height = 160
    draw.rectangle([0, 0, size[0], header_height], fill="#0f0f0f")
    draw.text((80, 50), "📊 Progress Analytics", font=title_font, fill=text_color)
    
    # Metrics cards
    metrics_y = header_height + 80
    metrics = [
        ("Total Sessions", "24", "+15%"),
        ("Active Minutes", "420", "+8%"),
        ("Calories Burned", "3,240", "+12%"),
        ("Consistency", "92%", "+5%")
    ]
    
    metric_width = (size[0] - 400) // 4
    for i, (label, value, change) in enumerate(metrics):
        x = 80 + i * (metric_width + 40)
        y = metrics_y
        
        draw.rectangle([x, y, x + metric_width, y + 150], fill=card_color, outline="#333333", width=2)
        draw.text((x + 20, y + 20), label, font=text_font, fill="#888888")
        draw.text((x + 20, y + 60), value, font=title_font, fill=accent_color)
        draw.text((x + 20, y + 110), change, font=text_font, fill="#00ff00")
    
    # Chart area
    chart_y = metrics_y + 200
    chart_width = size[0] - 160
    chart_height = 400
    
    draw.rectangle([80, chart_y, 80 + chart_width, chart_y + chart_height], fill=card_color, outline="#333333", width=2)
    draw.text((100, chart_y + 20), "Weekly Activity Chart", font=subtitle_font, fill=text_color)
    
    # Simple bar chart
    bar_start_y = chart_y + 100
    bar_width = (chart_width - 200) // 7
    heights = [60, 80, 45, 90, 75, 95, 85]  # Percentages
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    
    for i, (height, day) in enumerate(zip(heights, days)):
        x = 120 + i * (bar_width + 20)
        bar_height = int(250 * height / 100)
        y = bar_start_y + 250 - bar_height
        
        draw.rectangle([x, y, x + bar_width, bar_start_y + 250], fill=accent_color)
        draw.text((x + 10, bar_start_y + 270), day, font=text_font, fill=text_color)
    
    # Goals section
    goals_x = size[0] - 400
    goals_y = chart_y + 100
    goals_width = 350
    
    draw.rectangle([goals_x, goals_y, goals_x + goals_width, chart_y + chart_height], fill="#111111", outline="#333333", width=2)
    draw.text((goals_x + 20, goals_y + 20), "Goals Progress", font=subtitle_font, fill=text_color)
    
    goals = [
        ("Lose 10 lbs", 70),
        ("Build muscle", 45),
        ("Run 5K sub-25", 85)
    ]
    
    for i, (goal, progress) in enumerate(goals):
        y = goals_y + 80 + i * 80
        draw.text((goals_x + 20, y), goal, font=text_font, fill=text_color)
        
        # Progress bar
        bar_y = y + 30
        bar_bg_width = goals_width - 40
        draw.rectangle([goals_x + 20, bar_y, goals_x + 20 + bar_bg_width, bar_y + 20], fill="#333333")
        progress_width = int(bar_bg_width * progress / 100)
        draw.rectangle([goals_x + 20, bar_y, goals_x + 20 + progress_width, bar_y + 20], fill=accent_color)
    
    img.save(os.path.join(screenshots_dir, "04-Progress-Analytics-Landscape.png"))
    print("  ✅ Progress Analytics mockup created")

def create_social_mockup(screenshots_dir, size, bg_color, accent_color, text_color, card_color):
    """Create social hub mockup"""
    img = Image.new('RGB', size, bg_color)
    draw = ImageDraw.Draw(img)
    
    try:
        title_font = ImageFont.truetype("arial.ttf", 60)
        subtitle_font = ImageFont.truetype("arial.ttf", 40)
        text_font = ImageFont.truetype("arial.ttf", 32)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
    
    # Header
    header_height = 160
    draw.rectangle([0, 0, size[0], header_height], fill="#0f0f0f")
    draw.text((80, 50), "👥 Social Hub", font=title_font, fill=text_color)
    
    # Friends activity feed
    feed_y = header_height + 80
    draw.text((80, feed_y), "Friends Activity", font=subtitle_font, fill=text_color)
    
    activities = [
        ("👩", "Sarah Chen", "completed a strength session", "2h ago", "💪"),
        ("👨", "Mike Torres", "reached a 30-day streak!", "4h ago", "🔥"),
        ("👩‍🦱", "Emma Rodriguez", "earned 'Consistency Champion'", "1d ago", "🏆")
    ]
    
    for i, (avatar, name, action, time, icon) in enumerate(activities):
        y = feed_y + 80 + i * 120
        
        # Activity card
        draw.rectangle([80, y, size[0] - 80, y + 100], fill=card_color, outline="#333333", width=2)
        
        # Avatar
        draw.rectangle([100, y + 20, 160, y + 80], fill=accent_color)
        draw.text((115, y + 35), avatar, font=subtitle_font, fill="#000000")
        
        # Content
        draw.text((180, y + 20), f"{name} {action}", font=text_font, fill=text_color)
        draw.text((180, y + 55), time, font=text_font, fill="#888888")
        
        # Icon
        draw.text((size[0] - 150, y + 35), icon, font=subtitle_font, fill=accent_color)
    
    # Leaderboard section
    leaderboard_y = feed_y + 480
    draw.text((80, leaderboard_y), "Weekly Leaderboard", font=subtitle_font, fill=text_color)
    
    leaderboard = [
        ("🥇", "You", 1250, accent_color),
        ("🥈", "Alex Kim", 1180, "#C0C0C0"),
        ("🥉", "Lisa Park", 1050, "#CD7F32")
    ]
    
    for i, (medal, name, points, color) in enumerate(leaderboard):
        y = leaderboard_y + 80 + i * 80
        
        # Leaderboard item
        bg_color_item = "#222222" if name == "You" else card_color
        draw.rectangle([80, y, size[0] - 80, y + 60], fill=bg_color_item, outline=color, width=2)
        
        draw.text((100, y + 15), medal, font=subtitle_font, fill=color)
        draw.text((160, y + 15), name, font=text_font, fill=text_color)
        draw.text((size[0] - 200, y + 15), f"{points} pts", font=text_font, fill=color)
    
    img.save(os.path.join(screenshots_dir, "05-Social-Hub-Portrait.png"))
    print("  ✅ Social Hub mockup created")

def create_session_mockup(screenshots_dir, size, bg_color, accent_color, text_color, card_color):
    """Create session check-in mockup"""
    img = Image.new('RGB', size, bg_color)
    draw = ImageDraw.Draw(img)
    
    try:
        title_font = ImageFont.truetype("arial.ttf", 60)
        subtitle_font = ImageFont.truetype("arial.ttf", 40)
        text_font = ImageFont.truetype("arial.ttf", 32)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
    
    # Header
    header_height = 160
    draw.rectangle([0, 0, size[0], header_height], fill="#0f0f0f")
    draw.text((80, 50), "📍 Session Check-in", font=title_font, fill=text_color)
    draw.text((size[0] - 300, 80), "10:00 AM - 11:00 AM", font=text_font, fill=accent_color)
    
    # Trainer info card
    trainer_y = header_height + 80
    draw.rectangle([80, trainer_y, size[0] - 80, trainer_y + 200], fill=card_color, outline="#333333", width=2)
    
    # Trainer avatar
    draw.rectangle([120, trainer_y + 40, 220, trainer_y + 140], fill=accent_color)
    draw.text((150, trainer_y + 70), "👨‍💪", font=title_font, fill="#000000")
    
    # Trainer details
    draw.text((260, trainer_y + 40), "Alex Rodriguez", font=subtitle_font, fill=text_color)
    draw.text((260, trainer_y + 90), "Strength Training Session", font=text_font, fill="#888888")
    draw.text((260, trainer_y + 130), "📍 FitLife Gym - Studio A", font=text_font, fill="#888888")
    
    # Status badge
    status_x = size[0] - 200
    draw.rectangle([status_x, trainer_y + 60, status_x + 150, trainer_y + 110], fill="#00ff00")
    draw.text((status_x + 20, trainer_y + 75), "✓ Verified", font=text_font, fill="#000000")
    
    # GPS verification
    gps_y = trainer_y + 250
    draw.rectangle([80, gps_y, (size[0] - 80) // 2 - 20, gps_y + 200], fill=card_color, outline=accent_color, width=2)
    draw.text((120, gps_y + 30), "🎯", font=title_font, fill=accent_color)
    draw.text((120, gps_y + 100), "GPS Verified", font=subtitle_font, fill=accent_color)
    draw.text((120, gps_y + 140), "You're at the correct location!", font=text_font, fill=text_color)
    
    # Session timer
    timer_x = (size[0] - 80) // 2 + 20
    draw.rectangle([timer_x, gps_y, size[0] - 80, gps_y + 200], fill=card_color, outline="#333333", width=2)
    draw.text((timer_x + 40, gps_y + 30), "⏱️", font=title_font, fill=accent_color)
    draw.text((timer_x + 40, gps_y + 90), "45:32", font=title_font, fill=accent_color)
    draw.text((timer_x + 40, gps_y + 150), "Session Duration", font=text_font, fill="#888888")
    
    # Action buttons
    buttons_y = gps_y + 250
    
    # Check out button
    btn_width = (size[0] - 240) // 2
    draw.rectangle([80, buttons_y, 80 + btn_width, buttons_y + 80], fill=accent_color)
    draw.text((120, buttons_y + 25), "Check Out & Get Certificate", font=text_font, fill="#000000")
    
    # Emergency button
    emergency_x = 80 + btn_width + 40
    draw.rectangle([emergency_x, buttons_y, emergency_x + btn_width, buttons_y + 80], fill="#ff6464")
    draw.text((emergency_x + 40, buttons_y + 25), "Emergency Contact", font=text_font, fill=text_color)
    
    # Rewards section
    rewards_y = buttons_y + 120
    draw.text((80, rewards_y), "Session Rewards", font=subtitle_font, fill=text_color)
    
    rewards = [
        ("🪙", "+25 LiftCoins"),
        ("⚡", "+50 XP Points"),
        ("🏆", "Progress Toward Badge")
    ]
    
    for i, (icon, reward) in enumerate(rewards):
        y = rewards_y + 60 + i * 60
        draw.rectangle([80, y, size[0] - 80, y + 50], fill=card_color, outline="#333333", width=2)
        draw.text((120, y + 10), icon, font=subtitle_font, fill=accent_color)
        draw.text((180, y + 10), reward, font=text_font, fill=text_color)
    
    img.save(os.path.join(screenshots_dir, "06-Session-Checkin-Portrait.png"))
    print("  ✅ Session Check-in mockup created")

if __name__ == "__main__":
    print("🎨 LiftLink iPad Screenshot Mockup Generator")
    print("=" * 50)
    
    try:
        create_mockup_images()
        
        print(f"\n📋 App Store Connect Instructions:")
        print(f"1. Go to App Store Connect > Your App > App Information")
        print(f"2. Scroll to 'App Store Preview' section")
        print(f"3. Upload screenshots for iPad Pro (6th generation)")
        print(f"4. Use the generated PNG files from /app/frontend/public/screenshots/")
        print(f"5. Make sure to upload 6-10 screenshots showing key features")
        print(f"6. Add descriptive captions for each screenshot")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"💡 Make sure PIL/Pillow is installed: pip install Pillow")