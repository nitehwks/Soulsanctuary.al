# App Store Submission Guide

## Overview

This guide covers the complete process of submitting SoulSanctuary to the Apple App Store, from building the archive to successful publication.

---

## Prerequisites

Before starting:
- [ ] Apple Developer Program membership active
- [ ] App created in App Store Connect
- [ ] All app metadata prepared (see APPLE_DEVELOPER_SETUP.md)
- [ ] Privacy policy URL live
- [ ] App icon and screenshots ready
- [ ] Xcode installed with signing configured

---

## Step 1: Prepare Your Build

### Update Version Number

In Xcode:
1. Select the App target
2. Go to "General" tab
3. Set **Version**: 1.0.0 (or your version)
4. Set **Build**: 1 (increment for each upload)

### Sync Latest Web Assets

```bash
npm run build
npx cap sync ios
```

### Open in Xcode

```bash
npx cap open ios
```

---

## Step 2: Archive Your App

### Configure for Release

1. In Xcode, select "Any iOS Device (arm64)" as the build target
2. Go to Product → Scheme → Edit Scheme
3. Set "Run" to **Release** configuration

### Create Archive

1. Go to **Product → Archive**
2. Wait for the build to complete (may take several minutes)
3. The Organizer window will open automatically

### Validate Archive

1. In the Organizer, select your archive
2. Click **Validate App**
3. Follow the prompts
4. Fix any errors before proceeding

---

## Step 3: Upload to App Store Connect

### Distribute App

1. In Organizer, click **Distribute App**
2. Select **App Store Connect**
3. Click **Next**
4. Choose **Upload** (not Export)
5. Select options:
   - ✅ Include bitcode (if asked)
   - ✅ Upload symbols
   - ✅ Manage version and build number
6. Click **Next**
7. Review and click **Upload**

### Wait for Processing

- Upload takes 5-15 minutes
- Processing takes 15-30 minutes
- You'll receive an email when ready

---

## Step 4: Complete App Store Listing

### In App Store Connect:

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Select your app
3. Click on the version (1.0)

### Fill In All Sections:

#### App Information
- Name: SoulSanctuary
- Subtitle: Faith-Based AI Companion
- Category: Health & Fitness
- Secondary Category: Lifestyle

#### Pricing and Availability
- Price: Free (or choose pricing)
- Availability: All territories (or select specific)

#### Version Information

**What's New in This Version:**
```
Welcome to SoulSanctuary - your faith-integrated AI companion for emotional wellness and spiritual growth.

Features:
• Dual-mode support: Chat and Therapist modes
• Evidence-based therapy techniques (CBT, DBT, ACT)
• Optional faith integration with prayer and scripture
• Crisis detection and safety resources
• Privacy-first design with encryption
• Works on iPhone and iPad
```

**Description:**
```
Find your sanctuary within with SoulSanctuary - a unique AI companion that combines Christian pastoral care with evidence-based therapeutic practices.

FEATURES:
• Two Modes: Switch between casual Chat mode and focused Therapist mode
• Faith Integration: Prayer support, scripture guidance, and spiritual encouragement (can be disabled)
• Therapy Techniques: CBT, DBT, ACT, mindfulness, and grounding exercises
• Crisis Support: Real-time safety detection with professional resources
• Privacy First: AES-256 encryption, no data selling, GDPR compliant
• Remembers You: The AI learns your story and preferences over time

WHAT MAKES US DIFFERENT:
SoulSanctuary is the only AI that seamlessly blends faith and science. Whether you're seeking spiritual guidance, evidence-based coping strategies, or simply someone to listen, we're here 24/7.

PRIVACY MATTERS:
Your conversations are encrypted and protected. We never sell your data. You control what we remember.

Perfect for:
• Christians seeking faith-integrated mental health support
• Anyone wanting accessible therapy techniques
• People valuing privacy and security
• Those needing 24/7 emotional support

Start your journey to emotional wellness and spiritual growth today.
```

**Keywords:**
```
christian,therapy,mental health,prayer,counseling,AI,faith,wellness,CBT,anxiety
```

**Support URL:**
```
https://your-support-url.com
```

**Privacy Policy URL:**
```
https://your-privacy-policy-url.com
```

#### Screenshots
Upload screenshots for each device size required.

#### App Review Information
- Contact name and email
- Phone number
- Demo account (if needed)
- Notes for reviewers

---

## Step 5: Submit for Review

### Pre-Submission Checklist

- [ ] All metadata complete
- [ ] Screenshots uploaded for all sizes
- [ ] App icon displays correctly
- [ ] Privacy policy URL works
- [ ] Build selected for submission
- [ ] Age rating completed
- [ ] Export compliance answered

### Submit

1. Click **Add for Review**
2. Select your build from the dropdown
3. Answer export compliance questions:
   - Uses encryption? **Yes** (AES-256 for data protection)
   - Exempt from regulations? **Yes** (standard data protection)
4. Click **Submit to App Review**

---

## Step 6: App Review Process

### Timeline
- **Standard Review**: 24-48 hours typically
- **May take longer** for first submission or complex apps

### Possible Outcomes

1. **Approved** - App goes live (or on your chosen date)
2. **Rejected** - Fix issues and resubmit
3. **Metadata Rejected** - Only metadata needs fixing

### Common Rejection Reasons

| Issue | Solution |
|-------|----------|
| Guideline 4.2 - Minimum Functionality | Add more native features |
| Guideline 5.1.1 - Data Collection | Update privacy disclosures |
| Crashes or Bugs | Fix and resubmit |
| Incomplete Information | Provide demo account or clarify |

### If Rejected

1. Read the rejection reason carefully
2. Reply in Resolution Center if unclear
3. Make required changes
4. Increment build number
5. Upload new build
6. Resubmit for review

---

## Step 7: Post-Approval

### When Approved

1. Choose release option:
   - **Immediately**: Goes live within hours
   - **Manual**: You control when it goes live
   - **Scheduled**: Choose a specific date

2. Monitor in App Store Connect:
   - Downloads
   - Ratings and reviews
   - Crash reports

### Update Process

For future updates:
1. Increment version number
2. Build and archive
3. Upload new build
4. Add "What's New" text
5. Submit for review

---

## Appendix: Export Compliance

### For SoulSanctuary

When asked about encryption:

**Does your app use encryption?**
→ Yes

**Does your app qualify for any exemptions?**
→ Yes - App uses standard encryption for data protection

**What type of encryption?**
→ AES-256-GCM for local data protection

This qualifies as **exempt** encryption under U.S. export regulations.

---

## Helpful Resources

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Common App Rejections](https://developer.apple.com/app-store/review/rejections/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Resolution Center Guide](https://developer.apple.com/help/app-store-connect/manage-submissions/reply-to-app-review-messages)

---

## Quick Reference

| Step | Action |
|------|--------|
| 1 | `npm run build && npx cap sync ios` |
| 2 | Open Xcode: `npx cap open ios` |
| 3 | Product → Archive |
| 4 | Validate App |
| 5 | Distribute App → App Store Connect |
| 6 | Complete listing in App Store Connect |
| 7 | Submit to App Review |
| 8 | Wait for approval (24-48 hrs) |
| 9 | Release to App Store |

---

*Good luck with your submission!*
