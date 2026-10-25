package com.example.tastemem

import android.app.AlertDialog
import android.content.Context
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.EditText
import android.widget.LinearLayout
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback

class MainActivity : ComponentActivity() {
  private lateinit var webView: WebView
  private var currentServerUrl: String = ""

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    currentServerUrl = intent.getStringExtra(EXTRA_WEB_APP_URL)
      ?: prefs.getString(KEY_SERVER_URL, null)
      ?: DEFAULT_WEB_APP_URL

    webView = WebView(this).apply {
      settings.apply {
        javaScriptEnabled = true
        domStorageEnabled = true
        cacheMode = WebSettings.LOAD_DEFAULT
        mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        useWideViewPort = true
        loadWithOverviewMode = true
      }
      webViewClient = object : WebViewClient() {
        override fun onReceivedError(
          view: WebView?,
          request: WebResourceRequest?,
          error: WebResourceError?
        ) {
          if (request?.isForMainFrame == true) {
            showConnectionErrorDialog(error?.description?.toString())
          }
        }
      }
      webChromeClient = WebChromeClient()
    }
    setContentView(webView)

    // Handle back button for web view history
    onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        if (webView.canGoBack()) {
          webView.goBack()
        } else {
          isEnabled = false
          onBackPressedDispatcher.onBackPressed()
        }
      }
    })

    loadApp(currentServerUrl)
  }

  private fun loadApp(url: String) {
    currentServerUrl = url
    getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString(KEY_SERVER_URL, url)
      .apply()
    webView.loadUrl(url)
  }

  private fun showConnectionErrorDialog(errorDetails: String?) {
    val input = EditText(this).apply {
      setText(currentServerUrl)
      hint = "https://your-app.vercel.app/"
      setSingleLine()
    }
    val container = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(60, 20, 60, 10)
      addView(input)
    }

    AlertDialog.Builder(this)
      .setTitle("Connection Error")
      .setMessage("Unable to load TasteMem from:\n$currentServerUrl\n\n${errorDetails ?: "Please verify your internet connection or enter the live server URL:"}")
      .setView(container)
      .setPositiveButton("Connect") { _, _ ->
        val newUrl = input.text.toString().trim()
        if (newUrl.isNotBlank()) {
          val formattedUrl = if (newUrl.startsWith("http://") || newUrl.startsWith("https://")) newUrl else "https://$newUrl"
          loadApp(formattedUrl)
        }
      }
      .setNeutralButton("Retry") { _, _ ->
        webView.reload()
      }
      .setNegativeButton("Default Cloud") { _, _ ->
        loadApp(DEFAULT_WEB_APP_URL)
      }
      .setCancelable(true)
      .show()
  }

  override fun onDestroy() {
    webView.destroy()
    super.onDestroy()
  }

  companion object {
    const val PREFS_NAME = "tastemem_settings"
    const val KEY_SERVER_URL = "server_url"
    const val EXTRA_WEB_APP_URL = "com.example.tastemem.WEB_APP_URL"
    const val DEFAULT_WEB_APP_URL = "https://qloo-agentic-hackathon.vercel.app/"
  }
}

