package com.liftlinkapp;

import android.os.Bundle;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

/**
 * MainActivity for LiftLink Android App
 * 
 * This is the main activity that hosts the React Native application.
 * It includes support for deep linking and the new React Native architecture.
 */
public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "LiftLink";
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
        
        // Handle deep linking
        handleDeepLink();
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
    protected void onNewIntent(android.content.Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleDeepLink();
    }
}
