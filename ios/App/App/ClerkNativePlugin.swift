import Capacitor
import ClerkKit
import Foundation

@objc(ClerkNative)
public final class ClerkNativePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ClerkNative"
    public let jsName = "ClerkNative"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "configure", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startHostedAuth", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getToken", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "signOut", returnType: CAPPluginReturnPromise)
    ]

    private var isConfigured = false
    private var publishableKey: String?

    @objc public func configure(_ call: CAPPluginCall) {
        guard let key = call.getString("publishableKey")?.trimmingCharacters(in: .whitespacesAndNewlines),
              !key.isEmpty else {
            call.reject("A non-empty Clerk publishableKey is required.")
            return
        }

        Task { @MainActor [weak self] in
            guard let self else { return }

            do {
                if let configuredKey = self.publishableKey, configuredKey != key {
                    call.reject("ClerkNative is already configured with a different publishableKey.")
                    return
                }

                if !self.isConfigured {
                    Clerk.configure(publishableKey: key)
                    self.publishableKey = key
                    self.isConfigured = true
                }

                try await self.waitUntilLoaded()
                call.resolve(self.state())
            } catch {
                call.reject("Unable to configure Clerk: \(error.localizedDescription)", nil, error)
            }
        }
    }

    @objc public func getState(_ call: CAPPluginCall) {
        Task { @MainActor [weak self] in
            guard let self else { return }
            call.resolve(self.state())
        }
    }

    @objc public func startHostedAuth(_ call: CAPPluginCall) {
        guard let modeValue = call.getString("mode"),
              let mode = hostedAuthMode(for: modeValue) else {
            call.reject("mode must be either 'signIn' or 'signUp'.")
            return
        }

        Task { @MainActor [weak self] in
            guard let self else { return }
            guard self.isConfigured else {
                call.reject("ClerkNative must be configured before starting hosted authentication.")
                return
            }

            do {
                try await Clerk.shared.auth.startHostedAuth(mode: mode)
                call.resolve(self.state())
            } catch {
                call.reject("Clerk hosted authentication failed: \(error.localizedDescription)", nil, error)
            }
        }
    }

    @objc public func getToken(_ call: CAPPluginCall) {
        Task { @MainActor [weak self] in
            guard let self else { return }
            guard self.isConfigured else {
                call.reject("ClerkNative must be configured before retrieving a token.")
                return
            }

            do {
                let token = try await Clerk.shared.auth.getToken()
                call.resolve(["token": self.jsonValue(token)])
            } catch {
                call.reject("Unable to retrieve Clerk token: \(error.localizedDescription)", nil, error)
            }
        }
    }

    @objc public func signOut(_ call: CAPPluginCall) {
        Task { @MainActor [weak self] in
            guard let self else { return }
            guard self.isConfigured else {
                call.reject("ClerkNative must be configured before signing out.")
                return
            }

            do {
                try await Clerk.shared.auth.signOut()
                call.resolve(self.state())
            } catch {
                call.reject("Clerk sign out failed: \(error.localizedDescription)", nil, error)
            }
        }
    }

    @MainActor private func state() -> PluginCallResultData {
        guard isConfigured else {
            return [
                "isLoaded": false,
                "isSignedIn": false,
                "user": NSNull()
            ]
        }

        guard let user = Clerk.shared.user else {
            return [
                "isLoaded": true,
                "isSignedIn": false,
                "user": NSNull()
            ]
        }

        let primaryEmailAddress: Any
        if let emailAddress = user.primaryEmailAddress {
            primaryEmailAddress = ["emailAddress": emailAddress.emailAddress]
        } else {
            primaryEmailAddress = NSNull()
        }

        return [
            "isLoaded": Clerk.shared.isLoaded,
            "isSignedIn": true,
            "user": [
                "id": user.id,
                "firstName": jsonValue(user.firstName),
                "lastName": jsonValue(user.lastName),
                "imageUrl": user.imageUrl,
                "primaryEmailAddress": primaryEmailAddress
            ]
        ]
    }

    @MainActor private func waitUntilLoaded() async throws {
        for _ in 0..<150 {
            if Clerk.shared.isLoaded {
                return
            }
            try await Task.sleep(nanoseconds: 100_000_000)
        }
        throw NSError(
            domain: "ClerkNative",
            code: 1,
            userInfo: [NSLocalizedDescriptionKey: "Clerk did not finish loading."]
        )
    }

    private func jsonValue(_ value: String?) -> Any {
        if let value {
            return value
        }
        return NSNull()
    }

    private func hostedAuthMode(for value: String) -> HostedAuthMode? {
        switch value {
        case "signIn":
            return .signIn
        case "signUp":
            return .signUp
        default:
            return nil
        }
    }
}