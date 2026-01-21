package com.liftlinkapp;

import android.os.Bundle;
import android.view.Display;
import android.view.Window;
import android.view.WindowManager;
import android.os.Build;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

/**
 * MainActivity for LiftLink Android App
 * 
 * This is the main activity that hosts the React Native application.
 * It includes support for deep linking, 120fps display, and the new React Native architecture.
 */
public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "LiftLinkMobile";
    }

    /**
     * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
     * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
     * (aka React 18) with two boolean flags.
     */
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new DefaultReactActivityDelegate(
            this,
            getMainComponentName(),
            // If you opted-in for the New Architecture, we enable the Fabric Renderer.
            DefaultNewArchitectureEntryPoint.getFabricEnabled());
    }

    /**
     * Called when the activity is first created.
     * This is where you should do all of your normal static set up: create views, bind data to lists, etc.
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable 120fps/high refresh rate support
        enableHighRefreshRate();
        
        // Handle deep linking
        handleDeepLink();
    }

    /**
     * Enable high refresh rate (120fps) on supported devices
     * Works on Android 11+ devices with high refresh rate displays
     */
    private void enableHighRefreshRate() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+ (API 30+) - Use Display.Mode for precise control
            try {
                Window window = getWindow();
                WindowManager.LayoutParams params = window.getAttributes();
                
                // Set the preferred refresh rate to maximum available
                Display display = getDisplay();
                if (display != null) {
                    Display.Mode[] modes = display.getSupportedModes();
                    float maxRefreshRate = 60f;
                    Display.Mode bestMode = null;
                    
                    for (Display.Mode mode : modes) {
                        if (mode.getRefreshRate() > maxRefreshRate) {
                            maxRefreshRate = mode.getRefreshRate();
                            bestMode = mode;
                        }
                    }
                    
                    if (bestMode != null && maxRefreshRate >= 90f) {
                        params.preferredDisplayModeId = bestMode.getModeId();
                        window.setAttributes(params);
                        android.util.Log.d("LiftLink", "120fps mode enabled: " + maxRefreshRate + "Hz");
                    }
                }
            } catch (Exception e) {
                android.util.Log.e("LiftLink", "Failed to enable high refresh rate: " + e.getMessage());
            }
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // Android 6-10 - Use preferredRefreshRate
            try {
                Window window = getWindow();
                WindowManager.LayoutParams params = window.getAttributes();
                params.preferredRefreshRate = 120f;
                window.setAttributes(params);
                android.util.Log.d("LiftLink", "Preferred refresh rate set to 120Hz");
            } catch (Exception e) {
                android.util.Log.e("LiftLink", "Failed to set preferred refresh rate: " + e.getMessage());
            }
        }
    }

    /**
     * Handle deep links for the application
     * This allows external apps and websites to open specific screens in the app
     */
    private void handleDeepLink() {
        android.content.Intent intent = getIntent();
        String action = intent.getAction();
        android.net.Uri data = intent.getData();
        
        if (data != null) {
            // Deep link URI will be handled by React Native navigation
            // Format: liftlink://screen/params
            String scheme = data.getScheme();
            String host = data.getHost();
            String path = data.getPath();
            
            // Log deep link for debugging
            android.util.Log.d("LiftLink", "Deep link received - Scheme: " + scheme + ", Host: " + host + ", Path: " + path);
        }
    }

    /**
     * Handle new intents when the activity is already running
     * This is important for handling deep links when the app is in the background
     */
    @Override
    public void onNewIntent(android.content.Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleDeepLink();
    }
}
