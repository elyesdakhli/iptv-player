package com.iptvyk.app;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getBridge().getWebView().getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        // Apply system bar insets to the FrameLayout that contains the WebView
        // (android.R.id.content). Padding on this container repositions the WebView
        // as a child, which reliably pushes all content below the status bar.
        // This is the standard Android edge-to-edge migration pattern and works on
        // Android 15+ where setDecorFitsSystemWindows is ignored.
        View contentView = findViewById(android.R.id.content);
        ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, insets) -> {
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
    }
}
