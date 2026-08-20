/// <reference types="vite/client" />

// Compile-time flag set by vite.config.ts based on the presence of the
// ".admin-key" file in the project root. True only in admin builds.
declare const __ADMIN_BUILD__: boolean;

// Admin Ed25519 keypair (base64), embedded only in admin builds. Empty
// strings in user builds. The secret key never leaves the owner's machine:
// it is used locally to sign server-issued login challenges.
declare const __ADMIN_PUBLIC_KEY__: string;
declare const __ADMIN_SECRET_KEY__: string;
