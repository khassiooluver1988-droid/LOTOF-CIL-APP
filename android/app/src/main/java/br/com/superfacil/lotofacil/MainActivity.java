package br.com.superfacil.lotofacil;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

public class MainActivity extends Activity {
    private static final String HOME = "https://superfacil-estrategia.lovable.app/";
    private WebView webView;
    private LinearLayout placeholder;
    private ProgressBar progress;
    private TextView message;
    private boolean mainFrameError = false;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(33, 6, 75));
        getWindow().setNavigationBarColor(Color.rgb(33, 6, 75));

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(33, 6, 75));
        webView = new WebView(this);
        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));

        placeholder = new LinearLayout(this);
        placeholder.setOrientation(LinearLayout.VERTICAL);
        placeholder.setGravity(Gravity.CENTER);
        placeholder.setPadding(dp(28), dp(20), dp(28), dp(20));
        placeholder.setBackgroundColor(Color.rgb(33, 6, 75));
        FrameLayout.LayoutParams cover = new FrameLayout.LayoutParams(-1, -1);
        root.addView(placeholder, cover);

        ImageView clover = new ImageView(this);
        clover.setImageResource(R.drawable.ic_launcher);
        LinearLayout.LayoutParams cloverParams = new LinearLayout.LayoutParams(dp(148), dp(148));
        placeholder.addView(clover, cloverParams);

        TextView brandTop = new TextView(this);
        brandTop.setText("Super");
        brandTop.setTextColor(Color.WHITE);
        brandTop.setTextSize(46);
        brandTop.setTypeface(Typeface.create("sans-serif", Typeface.BOLD));
        brandTop.setGravity(Gravity.CENTER);
        placeholder.addView(brandTop);

        TextView brandBottom = new TextView(this);
        brandBottom.setText("Fácil");
        brandBottom.setTextColor(Color.rgb(79, 235, 46));
        brandBottom.setTextSize(45);
        brandBottom.setTypeface(Typeface.create("sans-serif", Typeface.BOLD));
        brandBottom.setGravity(Gravity.CENTER);
        placeholder.addView(brandBottom);

        message = new TextView(this);
        message.setText("Apostas e estratégias para a Lotofácil");
        message.setTextColor(Color.rgb(231, 219, 254));
        message.setTextSize(14);
        message.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams textLayout = new LinearLayout.LayoutParams(-1, -2);
        textLayout.topMargin = dp(12);
        placeholder.addView(message, textLayout);

        progress = new ProgressBar(this);
        LinearLayout.LayoutParams progressParams = new LinearLayout.LayoutParams(dp(40), dp(40));
        progressParams.topMargin = dp(30);
        placeholder.addView(progress, progressParams);

        Button retry = new Button(this);
        retry.setId(View.generateViewId());
        retry.setText("Tentar novamente");
        LinearLayout.LayoutParams buttonLayout = new LinearLayout.LayoutParams(-2, -2);
        buttonLayout.topMargin = dp(20);
        placeholder.addView(retry, buttonLayout);
        retry.setVisibility(View.GONE);
        retry.setOnClickListener(v -> {
            mainFrameError = false;
            progress.setVisibility(View.VISIBLE);
            retry.setVisibility(View.GONE);
            message.setText("Conectando ao SuperFácil...");
            webView.loadUrl(HOME);
        });

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();
                String host = uri.getHost();
                if ("https".equalsIgnoreCase(scheme) &&
                        "superfacil-estrategia.lovable.app".equalsIgnoreCase(host)) {
                    return false;
                }
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (ActivityNotFoundException ignored) {}
                return true;
            }

            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                mainFrameError = false;
                placeholder.setVisibility(View.VISIBLE);
                progress.setVisibility(View.VISIBLE);
                retry.setVisibility(View.GONE);
            }

            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    mainFrameError = true;
                    progress.setVisibility(View.GONE);
                    retry.setVisibility(View.VISIBLE);
                    message.setText("Não foi possível carregar. Verifique a internet.");
                }
            }

            @Override public void onPageFinished(WebView view, String url) {
                if (!mainFrameError) placeholder.setVisibility(View.GONE);
            }

            private final Button retry = (Button) placeholder.getChildAt(5);
        });

        setContentView(root);
        message.setText("Conectando ao SuperFácil...");
        webView.loadUrl(HOME);
    }

    private int dp(int d) { return (int) (d * getResources().getDisplayMetrics().density + .5f); }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override protected void onDestroy() {
        if (webView != null) { webView.destroy(); webView = null; }
        super.onDestroy();
    }
}
