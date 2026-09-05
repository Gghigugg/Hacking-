package com.sayra.ai

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import android.widget.Button
import android.widget.TextView
import java.util.Locale

class MainActivity : Activity(), TextToSpeech.OnInitListener {
    private lateinit var tts: TextToSpeech
    private lateinit var status: TextView
    private lateinit var result: TextView
    private val voiceRequest = 100

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        status = findViewById(R.id.statusText)
        result = findViewById(R.id.resultText)
        tts = TextToSpeech(this, this)
        findViewById<Button>(R.id.micButton).setOnClickListener { startListening() }
    }

    private fun startListening() {
        if (android.os.Build.VERSION.SDK_INT >= 23 && checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), voiceRequest)
            return
        }
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "hi-IN")
            putExtra(RecognizerIntent.EXTRA_PROMPT, "SAYRA ko boliye...")
        }
        status.text = "Listening..."
        try { startActivityForResult(intent, voiceRequest) } catch (_: Exception) { status.text = "Voice input unavailable" }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != voiceRequest || resultCode != RESULT_OK) { status.text = "Just Say It."; return }
        val text = data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull() ?: return
        result.text = text
        status.text = "SAYRA is speaking..."
        val reply = when {
            text.contains("hello", true) || text.contains("hi", true) || text.contains("हेलो") -> "Hello! Main SAYRA hoon. Aap mujhe kya karna chahte hain?"
            text.contains("time", true) || text.contains("समय") -> "Main abhi time feature connect karne ke liye ready hoon."
            else -> "Maine suna: $text. Real AI brain next phase mein connect hoga."
        }
        tts.speak(reply, TextToSpeech.QUEUE_FLUSH, null, "sayra-reply")
        status.text = "Just Say It."
    }

    override fun onInit(statusCode: Int) {
        if (statusCode == TextToSpeech.SUCCESS) tts.language = Locale("hi", "IN")
    }

    override fun onDestroy() {
        tts.stop(); tts.shutdown(); super.onDestroy()
    }
}
