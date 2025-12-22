# Apple Developer Account Setup Guide

## Overview

To publish SoulSanctuary to the App Store, you need an Apple Developer Program membership. This guide walks you through the complete setup process.

---

## Step 1: Create an Apple ID (If Needed)

If you don't have an Apple ID:
1. Go to [appleid.apple.com](https://appleid.apple.com)
2. Click "Create Your Apple ID"
3. Fill in your information
4. Verify your email address

---

## Step 2: Enroll in Apple Developer Program

### Cost
- **$99 USD per year** (individual or organization)
- Free tier available for testing on your own devices only

### Enrollment Process

1. Go to [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll)
2. Click "Start Your Enrollment"
3. Sign in with your Apple ID
4. Choose enrollment type:
   - **Individual**: For personal apps
   - **Organization**: For company apps (requires D-U-N-S number)
5. Complete identity verification
6. Pay the annual fee
7. Wait for approval (usually 24-48 hours)

### For Organizations
You'll need:
- Legal entity name
- D-U-N-S Number (free from Dun & Bradstreet)
- Website with matching domain
- Legal signing authority

---

## Step 3: Configure App Store Connect

Once enrolled:

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Sign in with your Apple Developer account
3. Accept the terms and conditions

### Create Your App

1. Click "My Apps" → "+" → "New App"
2. Fill in the details:
   - **Platform**: iOS
   - **Name**: SoulSanctuary
   - **Primary Language**: English (US)
   - **Bundle ID**: com.soulsanctuary.ai
   - **SKU**: soulsanctuary-ios-001

---

## Step 4: Configure Certificates & Provisioning

### In Xcode:

1. Open Xcode → Preferences → Accounts
2. Click "+" and add your Apple ID
3. Select your team
4. Click "Manage Certificates"
5. Create a "Apple Distribution" certificate

### Automatic Signing (Recommended)

1. Open the project in Xcode
2. Select the App target
3. Go to "Signing & Capabilities"
4. Check "Automatically manage signing"
5. Select your team from the dropdown

---

## Step 5: App Information Required

Before submission, prepare:

### Basic Info
- App name (30 characters max)
- Subtitle (30 characters max)
- Category: Health & Fitness or Lifestyle
- Age rating (complete questionnaire)

### Description
- Full description (4000 characters max)
- Promotional text (170 characters max)
- Keywords (100 characters max, comma-separated)
- Support URL
- Marketing URL (optional)

### Visual Assets
- App Icon (1024x1024 PNG, no transparency)
- Screenshots:
  - iPhone 6.7" (1290 x 2796 or 1284 x 2778)
  - iPhone 6.5" (1284 x 2778 or 1242 x 2688)
  - iPhone 5.5" (1242 x 2208)
  - iPad Pro 12.9" (2048 x 2732)
  - iPad Pro 11" (1668 x 2388)
- App Preview videos (optional)

### Legal
- Privacy Policy URL (required)
- Terms of Service URL (recommended)
- License Agreement (optional)

---

## Step 6: Privacy Policy Requirements

Your privacy policy must include:

1. **Data Collection**: What data you collect
2. **Data Use**: How you use the data
3. **Data Sharing**: Third parties who receive data
4. **Data Retention**: How long you keep data
5. **User Rights**: How users can access/delete data
6. **Contact Info**: How to reach you

### For SoulSanctuary, disclose:
- Conversation data storage
- AI processing of messages
- Encryption practices
- Optional analytics
- Third-party AI providers (OpenRouter)

---

## Step 7: App Privacy Labels

Apple requires privacy labels. For SoulSanctuary:

### Data Linked to You:
- Identifiers (User ID)
- Usage Data (conversations)

### Data Used to Track You:
- None (we don't track)

### Data Collection Purposes:
- App Functionality
- Analytics (if enabled)

---

## Checklist Before Proceeding

- [ ] Apple Developer Program enrolled ($99 paid)
- [ ] App Store Connect account active
- [ ] App created in App Store Connect
- [ ] Certificates configured in Xcode
- [ ] App icon ready (1024x1024)
- [ ] Screenshots prepared (all sizes)
- [ ] Privacy policy published online
- [ ] App description written
- [ ] Keywords selected
- [ ] Support URL ready

---

## Next Steps

Once setup is complete, proceed to:
→ [APP_STORE_SUBMISSION.md](./APP_STORE_SUBMISSION.md)

---

## Helpful Links

- [Apple Developer Program](https://developer.apple.com/programs/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
