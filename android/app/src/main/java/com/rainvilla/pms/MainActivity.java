package com.rainvilla.pms;

import android.graphics.Rect;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import java.util.Collections;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    WebView webView = this.bridge.getWebView();

    webView.post(() -> {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        int height = webView.getHeight();
        // Claim the left 48px strip so Android's own edge back-gesture
        // doesn't swallow touches meant for our own swipe-to-open-drawer.
        Rect leftEdge = new Rect(0, 0, 48, height);
        webView.setSystemGestureExclusionRects(
          Collections.singletonList(leftEdge)
        );
      }
    });
  }
}