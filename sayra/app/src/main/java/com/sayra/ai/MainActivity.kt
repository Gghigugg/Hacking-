package com.sayra.ai

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import android.view.View
import android.view.animation.DecelerateInterpolator
import android.widget.Button
import android.widget.TextView
import java.util.Locale

class MainActivity : Activity(), TextToSpeech.OnInitListener {
    private lateinit var tts: TextToSpeech
    private lateinit var status: TextView
    private lateinit var result: TextView
    private lateinit var micButton: Button
    private val voiceRequest = 100
    private val permissionRequest = 101

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        status = findViewById(R.id.statusText)
        result = findViewById(R.id.resultText)
        micButton = findViewById(R.id.micButton)
        tts = TextToSpeech(this, this)

        micButton.setOnClickListener { startListening() }
    }

    private fun startListening() {
        if (android.os.Build.VERSION.SDK_INT >= 23 &&
            checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED
        ) {
            requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), permissionRequest)
            return
        }

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "hi-IN")
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "hi-IN")
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
            putExtra(RecognizerIntent.EXTRA_PROMPT, "SAYRA ko boliye...")
        }

        setListeningState(true)
        try {
            startActivityForResult(intent, voiceRequest)
        } catch (_: Exception) {
            setListeningState(false)
            status.text = "Voice input unavailable"
            result.text = "Please check microphone / Google voice input."
        }
    }

    private fun setListeningState(listening: Boolean) {
        if (listening) {
            status.text = "Listening…"
            micButton.text = "●\nLISTENING"
            micButton.animate().scaleX(1.06f).scaleY(1.06f).setDuration(220)
                .setInterpolator(DecelerateInterpolator()).start()
        } else {
            status.text = "Just Say It."
            micButton.text = "🎙\nTAP TO TALK"
            micButton.animate().scaleX(1f).scaleY(1f).setDuration(180).start()
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == permissionRequest && grantResults.firstOrNull() == PackageManager.PERMISSION_GRANTED) {
            startListening()
        } else if (requestCode == permissionRequest) {
            status.text = "Microphone permission needed"
            result.text = "Allow microphone access to talk with SAYRA."
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != voiceRequest) return

        if (resultCode != RESULT_OK) {
            setListeningState(false)
            return
        }

        val text = data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull()
        if (text.isNullOrBlank()) {
            setListeningState(false)
            result.text = "I didn't catch that. Try again."
            return
        }

        result.text = text
        status.text = "SAYRA is speaking…"
        val reply = when {
            text.contains("hello", true) || text.contains("hi", true) || text.contains("हेलो") || text.contains("नमस्ते") ->
                "Hello! Main SAYRA hoon. Aap mujhe kya karna chahte hain?"
            text.contains("time", true) || text.contains("समय") || text.contains("टाइम") ->
                "Time feature ready hai. Next phase mein main real-time utilities connect karungi."
            text.contains("who are you", true) || text.contains("तुम कौन", true) ->
                "Main SAYRA AI hoon — your smart voice assistant. Just Say It."
            else ->
                "Maine suna: $text. Real AI brain integration next phase mein connect hoga."
        }

        tts.speak(reply, TextToSpeech.QUEUE_FLUSH, null, "sayra-reply")
        micButton.postDelayed({ setListeningState(false) }, 900)
    }

    override fun onInit(statusCode: Int) {
        if (statusCode == TextToSpeech.SUCCESS) {
            val resultCode = tts.setLanguage(Locale("hi", "IN"))
            if (resultCode == TextToSpeech.LANG_MISSING_DATA || resultCode == TextToSpeech.LANG_NOT_SUPPORTED) {
                tts.language = Locale.US
            }
        }
    }

    override fun onDestroy() {
        if (::tts.isInitialized) {
            tts.stop()
            tts.shutdown()
        }
        super.onDestroy()
    }
}
