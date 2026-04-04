package com.sanjayamurmu.onedot;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register custom plugins BEFORE super.onCreate()
        // because super.onCreate() initializes the bridge and loads the WebView
        registerPlugin(WallpaperPlugin.class);

        super.onCreate(savedInstanceState);
    }
}
