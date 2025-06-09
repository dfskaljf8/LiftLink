#!/usr/bin/env python3
"""
LiftLink iPad Screenshot Generator
Generates actual PNG images for App Store Connect upload
"""

import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def setup_driver():
    """Set up Chrome driver with proper options for screenshot generation"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--hide-scrollbars')
    chrome_options.add_argument('--disable-web-security')
    chrome_options.add_argument('--allow-running-insecure-content')
    
    # Set up high DPI for crisp screenshots
    chrome_options.add_argument('--force-device-scale-factor=1')
    chrome_options.add_argument('--high-dpi-support=1')
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def create_screenshots():
    """Generate iPad screenshots for App Store Connect"""
    
    # Create screenshots directory
    screenshots_dir = "/app/frontend/public/screenshots"
    os.makedirs(screenshots_dir, exist_ok=True)
    
    # Screenshot configurations
    screens = [
        {
            'name': 'home',
            'title': '01-Home-Dashboard',
            'description': 'Main dashboard with user progress and gamification'
        },
        {
            'name': 'trainer-search',
            'title': '02-Trainer-Search',
            'description': 'Browse and book certified fitness trainers'
        },
        {
            'name': 'health-devices',
            'title': '03-Health-Integrations',
            'description': 'Connect fitness devices and track activity'
        }
    ]
    
    # iPad dimensions (App Store Connect compatible)
    dimensions = [
        {'name': 'portrait', 'width': 2048, 'height': 2732},
        {'name': 'landscape', 'width': 2732, 'height': 2048}
    ]
    
    driver = setup_driver()
    
    try:
        # Load the screenshot generator page
        generator_url = "http://localhost:3000/generate-screenshots.html"
        print(f"Loading generator at: {generator_url}")
        driver.get(generator_url)
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "screenshotContainer"))
        )
        
        for dimension in dimensions:
            print(f"\n🔄 Generating {dimension['name']} screenshots ({dimension['width']}x{dimension['height']})...")
            
            # Set window size
            driver.set_window_size(dimension['width'] + 100, dimension['height'] + 100)
            
            # Set screenshot container size via JavaScript
            driver.execute_script(f"""
                const container = document.getElementById('screenshotContainer');
                container.className = 'screenshot-container {dimension['name']}';
                container.style.width = '{dimension['width']}px';
                container.style.height = '{dimension['height']}px';
            """)
            
            time.sleep(2)  # Let layout settle
            
            for screen in screens:
                print(f"  📱 Capturing {screen['name']}...")
                
                # Switch to the screen
                if screen['name'] == 'home':
                    driver.execute_script("showHomeScreen();")
                elif screen['name'] == 'trainer-search':
                    driver.execute_script("showTrainerSearch();")
                elif screen['name'] == 'health-devices':
                    driver.execute_script("showHealthDevices();")
                
                # Hide controls
                driver.execute_script("""
                    document.querySelector('.screenshot-controls').style.display = 'none';
                """)
                
                time.sleep(1)  # Let content load
                
                # Take screenshot
                container = driver.find_element(By.ID, "screenshotContainer")
                
                filename = f"{screen['title']}-{dimension['name']}.png"
                filepath = os.path.join(screenshots_dir, filename)
                
                # Capture screenshot of the container element
                container.screenshot(filepath)
                
                print(f"    ✅ Saved: {filename}")
                
                # Show controls again
                driver.execute_script("""
                    document.querySelector('.screenshot-controls').style.display = 'block';
                """)
        
        print(f"\n🎉 All screenshots generated successfully!")
        print(f"📁 Location: {screenshots_dir}")
        print(f"📱 Total files: {len(screens) * len(dimensions)}")
        
        # List generated files
        print("\n📋 Generated files:")
        for file in sorted(os.listdir(screenshots_dir)):
            if file.endswith('.png'):
                filepath = os.path.join(screenshots_dir, file)
                size = os.path.getsize(filepath)
                print(f"  • {file} ({size // 1024} KB)")
        
    except Exception as e:
        print(f"❌ Error generating screenshots: {e}")
        
    finally:
        driver.quit()

def create_additional_screens():
    """Create additional static screenshot mockups"""
    
    mockups = [
        {
            'name': '04-Social-Hub',
            'content': 'Social features, friends, and leaderboards'
        },
        {
            'name': '05-Progress-Analytics', 
            'content': 'Detailed fitness analytics and goal tracking'
        },
        {
            'name': '06-Session-Checkin',
            'content': 'GPS-verified training session attendance'
        }
    ]
    
    print("\n📝 Additional mockups needed:")
    for mockup in mockups:
        print(f"  • {mockup['name']}: {mockup['content']}")

if __name__ == "__main__":
    print("🎨 LiftLink iPad Screenshot Generator")
    print("=" * 50)
    
    # Check if Chrome is installed
    try:
        create_screenshots()
        create_additional_screens()
        
        print(f"\n📋 Next Steps:")
        print(f"1. Check /app/frontend/public/screenshots/ for generated PNG files")
        print(f"2. Upload to App Store Connect in App Information > App Store Preview")
        print(f"3. Use exact dimensions: 2048×2732 (portrait) or 2732×2048 (landscape)")
        print(f"4. Upload 6-10 screenshots showing key app features")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"💡 Make sure Chrome/Chromium is installed for headless browsing")