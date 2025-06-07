#!/usr/bin/env python3

import http.server
import socketserver
import os
import threading
import time

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='/app', **kwargs)
    
    def end_headers(self):
        # Add CORS headers to allow downloads
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()
    
    def do_GET(self):
        # Serve the main download page
        if self.path == '/' or self.path == '/download':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            html_content = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LiftLink - Download Deployment Package</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #000000, #1a1a1a, #000000);
            color: #ffffff;
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }
        
        .logo {
            font-size: 48px;
            font-weight: bold;
            color: #C4D600;
            margin-bottom: 20px;
            text-shadow: 0 0 20px rgba(196, 214, 0, 0.5);
        }
        
        .subtitle {
            font-size: 24px;
            color: #888888;
            margin-bottom: 40px;
        }
        
        .download-section {
            background: rgba(196, 214, 0, 0.1);
            border: 1px solid rgba(196, 214, 0, 0.2);
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 40px;
        }
        
        .download-title {
            font-size: 28px;
            color: #C4D600;
            margin-bottom: 16px;
        }
        
        .download-desc {
            font-size: 18px;
            color: #cccccc;
            margin-bottom: 24px;
            line-height: 1.6;
        }
        
        .download-btn {
            display: inline-block;
            background: linear-gradient(45deg, #C4D600, #B2FF66);
            color: #000000;
            padding: 20px 40px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: bold;
            font-size: 20px;
            margin: 10px;
            transition: transform 0.2s ease;
            box-shadow: 0 4px 15px rgba(196, 214, 0, 0.3);
        }
        
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(196, 214, 0, 0.4);
        }
        
        .secondary-btn {
            display: inline-block;
            background: transparent;
            color: #C4D600;
            border: 1px solid #C4D600;
            padding: 16px 32px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
            margin: 10px;
            transition: all 0.2s ease;
        }
        
        .secondary-btn:hover {
            background: rgba(196, 214, 0, 0.1);
            transform: translateY(-2px);
        }
        
        .files-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        
        .file-card {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(196, 214, 0, 0.2);
            border-radius: 12px;
            padding: 20px;
            text-align: left;
        }
        
        .file-title {
            font-size: 18px;
            font-weight: 600;
            color: #C4D600;
            margin-bottom: 8px;
        }
        
        .file-desc {
            font-size: 14px;
            color: #cccccc;
            margin-bottom: 16px;
            line-height: 1.5;
        }
        
        .file-link {
            display: inline-block;
            background: #C4D600;
            color: #000000;
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            font-size: 14px;
        }
        
        .status-badge {
            display: inline-block;
            background: #C4D600;
            color: #000000;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 30px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .instructions {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 24px;
            text-align: left;
            margin: 40px 0;
        }
        
        .instructions h3 {
            color: #C4D600;
            margin-bottom: 16px;
        }
        
        .instructions ol {
            color: #cccccc;
            padding-left: 20px;
            line-height: 1.8;
        }
        
        .instructions code {
            background: rgba(196, 214, 0, 0.2);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">LiftLink</div>
        <div class="subtitle">Deployment Package Download Center</div>
        
        <div class="status-badge">✅ Ready for App Store Deployment</div>
        
        <div class="download-section">
            <div class="download-title">📦 Complete Deployment Package</div>
            <div class="download-desc">
                Everything you need to deploy LiftLink to the App Store in one 61MB package.
                Includes the mobile app, deployment scripts, documentation, and marketing assets.
            </div>
            
            <a href="/LiftLink_Deployment_Package.tar.gz" class="download-btn" download>
                📥 Download Complete Package (61MB)
            </a>
            
            <div style="margin-top: 20px;">
                <a href="/screenshots-preview.html" class="secondary-btn" target="_blank">
                    📱 Preview Screenshots
                </a>
                <a href="/deployment-ready.html" class="secondary-btn" target="_blank">
                    📋 View Dashboard
                </a>
            </div>
        </div>
        
        <div class="files-grid">
            <div class="file-card">
                <div class="file-title">🚀 Deployment Script</div>
                <div class="file-desc">Automated iOS deployment script with your credentials pre-configured</div>
                <a href="/LiftLink_Deployment_Package/deploy-ios-expo.sh" class="file-link" download>Download Script</a>
            </div>
            
            <div class="file-card">
                <div class="file-title">📱 Mobile App</div>
                <div class="file-desc">Complete Expo React Native app ready for App Store submission</div>
                <a href="/LiftLink_Deployment_Package/LiftLinkMobile.tar.gz" class="file-link">Browse App Files</a>
            </div>
            
            <div class="file-card">
                <div class="file-title">📋 Setup Guide</div>
                <div class="file-desc">App Store Connect setup with your Apple Developer credentials</div>
                <a href="/APP_STORE_CONNECT_SETUP.md" class="file-link" download>Download Guide</a>
            </div>
            
            <div class="file-card">
                <div class="file-title">🎨 Marketing Assets</div>
                <div class="file-desc">App descriptions, screenshots, keywords, and promotional materials</div>
                <a href="/APP_STORE_ASSETS.md" class="file-link" download>Download Assets</a>
            </div>
            
            <div class="file-card">
                <div class="file-title">📖 Complete Guide</div>
                <div class="file-desc">Full deployment instructions from download to App Store launch</div>
                <a href="/COMPLETE_DEPLOYMENT_GUIDE.md" class="file-link" download>Download Guide</a>
            </div>
            
            <div class="file-card">
                <div class="file-title">📱 Screenshots</div>
                <div class="file-desc">HTML mockups for generating App Store screenshots</div>
                <a href="/screenshots-preview.html" class="file-link" target="_blank">View Screenshots</a>
            </div>
        </div>
        
        <div class="instructions">
            <h3>🚀 Quick Deployment Steps</h3>
            <ol>
                <li><strong>Download</strong> the complete package above (61MB)</li>
                <li><strong>Extract</strong>: <code>tar -xzf LiftLink_Deployment_Package.tar.gz</code></li>
                <li><strong>Navigate</strong>: <code>cd LiftLink_Deployment_Package</code></li>
                <li><strong>Install tools</strong>: <code>npm install -g @expo/cli eas-cli</code></li>
                <li><strong>Deploy</strong>: <code>./deploy-ios-expo.sh</code></li>
                <li><strong>Wait</strong>: Apple review (24-48 hours)</li>
                <li><strong>🎉 Launch</strong>: Your app goes live!</li>
            </ol>
        </div>
        
        <div style="margin-top: 40px; padding: 20px; background: rgba(196, 214, 0, 0.1); border-radius: 12px;">
            <h3 style="color: #C4D600; margin-bottom: 12px;">🔐 Your Configured Credentials</h3>
            <p><strong>Expo Account:</strong> ksurepalli259</p>
            <p><strong>Apple Developer:</strong> lift.link.email@gmail.com</p>
            <p><strong>Bundle ID:</strong> com.liftlink.app</p>
            <p><strong>App Name:</strong> LiftLink</p>
        </div>
        
        <div style="margin-top: 40px; color: #888888; text-align: center;">
            <p>⏱️ <strong>Timeline:</strong> 30 minutes setup + 24-48 hours Apple review = Live on App Store!</p>
            <p>💰 <strong>Cost:</strong> $99/year Apple Developer Account (required for App Store)</p>
        </div>
    </div>
</body>
</html>
            '''
            
            self.wfile.write(html_content.encode())
            return
        
        # For all other requests, use the default handler
        super().do_GET()

def start_download_server():
    print("🌐 Starting LiftLink Download Server...")
    print("=====================================")
    
    PORT = 8080
    
    # Change to app directory to serve files
    os.chdir('/app')
    
    # Create server
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"✅ Download server running on port {PORT}")
        print(f"🔗 Access your files at: http://localhost:{PORT}")
        print(f"📦 Direct download: http://localhost:{PORT}/LiftLink_Deployment_Package.tar.gz")
        print(f"📱 Screenshots: http://localhost:{PORT}/screenshots-preview.html")
        print("")
        print("🎯 Instructions:")
        print("1. Copy the server URL from your browser address bar")
        print("2. Replace 'localhost' with the actual domain/IP")
        print("3. Access the download page to get your files")
        print("")
        print("⚠️  Server will run until stopped with Ctrl+C")
        print("")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Download server stopped")

if __name__ == "__main__":
    start_download_server()