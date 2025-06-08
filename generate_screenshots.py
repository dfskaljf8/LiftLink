#!/usr/bin/env python3

import os
import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class LiftLinkScreenshotGenerator:
    def __init__(self):
        self.setup_chrome_driver()
        self.screenshots_dir = "/app/AppStoreScreenshots"
        os.makedirs(self.screenshots_dir, exist_ok=True)
        
        # App Store screenshot dimensions
        self.dimensions = {
            "iphone_67_primary": (1320, 2868),  # iPhone 14 Pro Max, 15 Pro Max
            "iphone_67_alt": (1290, 2796),      # iPhone 14 Pro Max, 15 Pro Max alternative
            "iphone_65": (1242, 2688),          # iPhone XS Max, 11 Pro Max
            "iphone_67_pro": (1284, 2778),      # iPhone 12/13/14 Pro Max
        }
        
    def setup_chrome_driver(self):
        """Setup Chrome WebDriver for screenshot generation"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--remote-debugging-port=9222")
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
        except Exception as e:
            print(f"Chrome driver setup failed: {e}")
            print("Please install ChromeDriver or use alternative method")
            self.driver = None
    
    def create_screenshot_html(self, screen_type, content_type):
        """Create HTML templates for different screenshot types"""
        
        if content_type == "welcome":
            return self.create_welcome_screen_html(screen_type)
        elif content_type == "health":
            return self.create_health_screen_html(screen_type)
        elif content_type == "gps":
            return self.create_gps_screen_html(screen_type)
        elif content_type == "trainers":
            return self.create_trainers_screen_html(screen_type)
        elif content_type == "progress":
            return self.create_progress_screen_html(screen_type)
        elif content_type == "social":
            return self.create_social_screen_html(screen_type)
        elif content_type == "verification":
            return self.create_verification_screen_html(screen_type)
        elif content_type == "dashboard":
            return self.create_dashboard_screen_html(screen_type)
        elif content_type == "sessions":
            return self.create_sessions_screen_html(screen_type)
        elif content_type == "rewards":
            return self.create_rewards_screen_html(screen_type)
    
    def create_welcome_screen_html(self, screen_type):
        width, height = self.dimensions[screen_type]
        return f'''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LiftLink - Welcome</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #000000, #1a1a1a, #000000);
            color: #ffffff;
            width: {width}px;
            height: {height}px;
            overflow: hidden;
            position: relative;
            padding: 80px 40px 40px;
        }}
        
        .container {{
            height: 100%;
            display: flex;
            flex-direction: column;
        }}
        
        .header {{
            text-align: center;
            margin-bottom: 60px;
        }}
        
        .logo {{
            font-size: 72px;
            font-weight: bold;
            color: #C4D600;
            margin-bottom: 16px;
            text-shadow: 0 0 40px rgba(196, 214, 0, 0.8);
            animation: glow 2s ease-in-out infinite alternate;
        }}
        
        @keyframes glow {{
            from {{ text-shadow: 0 0 40px rgba(196, 214, 0, 0.8); }}
            to {{ text-shadow: 0 0 60px rgba(196, 214, 0, 1), 0 0 80px rgba(196, 214, 0, 0.8); }}
        }}
        
        .tagline {{
            font-size: 32px;
            color: #888888;
            margin-bottom: 24px;
        }}
        
        .user-stats {{
            background: rgba(196, 214, 0, 0.15);
            border: 2px solid rgba(196, 214, 0, 0.4);
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 40px;
        }}
        
        .stats-text {{
            font-size: 28px;
            color: #C4D600;
            font-weight: 600;
            text-align: center;
        }}
        
        .features-grid {{
            flex: 1;
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
            margin-bottom: 40px;
        }}
        
        .feature-card {{
            background: rgba(196, 214, 0, 0.1);
            border: 2px solid rgba(196, 214, 0, 0.3);
            border-radius: 20px;
            padding: 32px;
            display: flex;
            align-items: center;
            gap: 24px;
        }}
        
        .feature-icon {{
            font-size: 48px;
        }}
        
        .feature-content h3 {{
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 8px;
        }}
        
        .feature-content p {{
            font-size: 24px;
            color: #cccccc;
        }}
        
        .status-badge {{
            background: #C4D600;
            color: #000;
            padding: 8px 16px;
            border-radius: 16px;
            font-size: 18px;
            font-weight: 700;
            margin-left: auto;
        }}
        
        .cta-button {{
            background: linear-gradient(45deg, #C4D600, #B2FF66);
            color: #000000;
            padding: 32px;
            border-radius: 20px;
            text-align: center;
            font-weight: bold;
            font-size: 36px;
            border: none;
            cursor: pointer;
            margin-bottom: 24px;
        }}
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
        '''
    
    def generate_all_screenshots(self):
        """Generate all required screenshots for App Store submission"""
        
        if not self.driver:
            print("❌ Chrome driver not available. Please install ChromeDriver")
            return False
        
        screenshot_configs = [
            ("welcome", "Welcome Screen"),
            ("health", "Health Integration"),
            ("gps", "GPS Session Check-In"),
            ("trainers", "Find Trainers"),
            ("progress", "Progress Analytics"),
            ("social", "Social Features"),
            ("verification", "ID Verification"),
            ("dashboard", "Dashboard"),
            ("sessions", "Session Management"),
            ("rewards", "Rewards System")
        ]
        
        print(f"📸 Generating LiftLink App Store Screenshots")
        print(f"============================================")
        
        for content_type, title in screenshot_configs:
            print(f"\\n🎨 Creating {title} screenshots...")
            
            for screen_name, dimensions in self.dimensions.items():
                try:
                    html_content = self.create_screenshot_html(screen_name, content_type)
                    
                    # Create temporary HTML file
                    temp_html = f"/tmp/screenshot_{content_type}_{screen_name}.html"
                    with open(temp_html, 'w') as f:
                        f.write(html_content)
                    
                    # Set window size and take screenshot
                    self.driver.set_window_size(dimensions[0], dimensions[1])
                    self.driver.get(f"file://{temp_html}")
                    
                    # Wait for page to load
                    time.sleep(2)
                    
                    # Take screenshot
                    screenshot_path = f"{self.screenshots_dir}/{content_type}_{screen_name}_{dimensions[0]}x{dimensions[1]}.png"
                    self.driver.save_screenshot(screenshot_path)
                    
                    print(f"  ✅ {title} - {screen_name} ({dimensions[0]}x{dimensions[1]})")
                    
                    # Clean up temp file
                    os.remove(temp_html)
                    
                except Exception as e:
                    print(f"  ❌ Failed {title} - {screen_name}: {e}")
        
        print(f"\\n🎉 Screenshot generation complete!")
        print(f"📁 Screenshots saved to: {self.screenshots_dir}")
        
        self.driver.quit()
        return True

def main():
    generator = LiftLinkScreenshotGenerator()
    generator.generate_all_screenshots()

if __name__ == "__main__":
    main()