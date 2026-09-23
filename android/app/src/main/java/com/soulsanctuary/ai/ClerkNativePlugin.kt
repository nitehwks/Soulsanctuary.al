package com.soulsanctuary.ai

import androidx.lifecycle.lifecycleScope
import com.clerk.api.Clerk
import com.clerk.api.auth.HostedAuthMode
import com.clerk.api.network.serialization.ClerkResult
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

@CapacitorPlugin(name = "ClerkNative")
class ClerkNativePlugin : Plugin() {
    private var publishableKey: String? = null

    @PluginMethod
    fun configure(call: PluginCall) {
        val key = call.getString("publishableKey")
        if (key.isNullOrBlank()) {
            call.reject("publishableKey is required")
            return
        }
        if (publishableKey != null && publishableKey != key) {
            call.reject("ClerkNative is already configured with a different publishableKey")
            return
        }

        activity.lifecycleScope.launch {
            try {
                Clerk.initialize(activity, key)
                publishableKey = key
                kotlinx.coroutines.withTimeout(15_000) {
                    Clerk.isInitialized.filter { it }.first()
                }
                call.resolve(state())
            } catch (error: Exception) {
                call.reject("Unable to configure Clerk", error.message, error)
            }
        }
    }

    @PluginMethod
    fun getState(call: PluginCall) {
        if (publishableKey == null) {
            call.resolve(
                JSObject()
                    .put("isLoaded", false)
                    .put("isSignedIn", false)
                    .put("user", null)
            )
            return
        }
        call.resolve(state())
    }

    @PluginMethod
    fun startHostedAuth(call: PluginCall) {
        if (publishableKey == null) {
            call.reject("ClerkNative must be configured before starting hosted authentication")
            return
        }
        val mode = when (call.getString("mode")) {
            "signIn" -> HostedAuthMode.SIGN_IN
            "signUp" -> HostedAuthMode.SIGN_UP
            else -> {
                call.reject("mode must be either 'signIn' or 'signUp'")
                return
            }
        }

        activity.lifecycleScope.launch {
            try {
                when (val result = Clerk.auth.startHostedAuth(mode)) {
                    is ClerkResult.Success -> call.resolve(state())
                    is ClerkResult.Failure ->
                        call.reject(clerkFailureMessage("Hosted authentication failed", result))
                }
            } catch (error: Exception) {
                call.reject("Hosted authentication failed", error.message, error)
            }
        }
    }

    @PluginMethod
    fun getToken(call: PluginCall) {
        if (publishableKey == null) {
            call.reject("ClerkNative must be configured before retrieving a token")
            return
        }
        activity.lifecycleScope.launch {
            try {
                val token = when (val result = Clerk.auth.getToken()) {
                    is ClerkResult.Success -> result.value
                    is ClerkResult.Failure -> {
                        call.reject(clerkFailureMessage("Unable to retrieve Clerk token", result))
                        return@launch
                    }
                }
                call.resolve(JSObject().put("token", token))
            } catch (error: Exception) {
                call.reject("Unable to retrieve Clerk token", error.message, error)
            }
        }
    }

    @PluginMethod
    fun signOut(call: PluginCall) {
        if (publishableKey == null) {
            call.reject("ClerkNative must be configured before signing out")
            return
        }
        activity.lifecycleScope.launch {
            try {
                when (val result = Clerk.auth.signOut()) {
                    is ClerkResult.Success -> call.resolve(state())
                    is ClerkResult.Failure ->
                        call.reject(clerkFailureMessage("Unable to sign out", result))
                }
            } catch (error: Exception) {
                call.reject("Unable to sign out", error.message, error)
            }
        }
    }

    private fun state(): JSObject {
        val user = Clerk.user
        val state = JSObject()
            .put("isLoaded", Clerk.isInitialized.value)
            .put("isSignedIn", Clerk.isSignedIn)

        if (user == null) {
            state.put("user", null)
            return state
        }

        val primaryEmail = user.primaryEmailAddress?.let {
            JSObject().put("emailAddress", it.emailAddress)
        }
        state.put(
            "user",
            JSObject()
                .put("id", user.id)
                .put("firstName", user.firstName)
                .put("lastName", user.lastName)
                .put("imageUrl", user.imageUrl)
                .put("primaryEmailAddress", primaryEmail)
        )
        return state
    }

    private fun clerkFailureMessage(prefix: String, result: ClerkResult.Failure<*>): String {
        val detail = result.throwable?.message ?: result.error?.toString()
        return if (detail.isNullOrBlank()) prefix else "$prefix: $detail"
    }
}