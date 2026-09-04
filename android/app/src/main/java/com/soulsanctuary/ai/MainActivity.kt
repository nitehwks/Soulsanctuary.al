package com.soulsanctuary.ai

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(ClerkNativePlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}