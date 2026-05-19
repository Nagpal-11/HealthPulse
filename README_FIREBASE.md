# Firebase Setup & Production Deployment Guide

This document provides instructions for handling Firebase Authentication issues in both the AI Studio preview and after deploying to GitHub Pages.

## 1. Fixing AI Studio Preview Login (Rapid Open/Close)

If the Sign In window opens and closes rapidly, it usually means the domain is not authorized in your Firebase project.

### The Fix:
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project: **aqueous-voyager-drwfn**.
3.  Navigate to **Authentication** > **Settings** > **Authorized Domains**.
4.  Click **Add Domain** and add the following:
    *   `ais-dev-ugnop4b4qsfyqagj6bqtfd-420122892996.asia-east1.run.app`
    *   `ais-pre-ugnop4b4qsfyqagj6bqtfd-420122892996.asia-east1.run.app`
5.  **Restart the app** and try signing in again.

> **Note on Permissions:** If you see "Limited access" or cannot add domains, ensure you are logged into the Firebase Console with the **same Google account** you use for AI Studio.

---

## 2. Deploying to GitHub Pages

To make the app work on your GitHub Pages (`your-username.github.io`), you MUST add your GitHub domain to the Authorized Domains list.

### Steps:
1.  In the Firebase Console, add `your-username.github.io` to **Authorized Domains**.
2.  Enable **GitHub Actions** in your repository.
3.  Add the following **Secrets** to your GitHub repository (Settings > Secrets and variables > Actions):
    *   `VITE_FIREBASE_API_KEY`
    *   `VITE_FIREBASE_AUTH_DOMAIN`
    *   `VITE_FIREBASE_PROJECT_ID`
    *   `VITE_FIREBASE_STORAGE_BUCKET`
    *   `VITE_FIREBASE_MESSAGING_SENDER_ID`
    *   `VITE_FIREBASE_APP_ID`
    
    You can find these values in your `firebase-applet-config.json` or in Firebase Console > Project Settings.

---

## 3. Recommended: Using Your Own Firebase Project

If you encounter persistent permission issues with the platform-provisioned project, we recommend creating your own:

1.  Go to [Firebase Console](https://console.firebase.google.com/) and click **Add Project**.
2.  Enable **Firestore** and **Authentication** (Google Provider).
3.  Create a "Web App" in Project Settings to get a config object.
4.  Update `firebase-applet-config.json` in this project with your new credentials.
5.  Deploy the Firestore rules using AI Studio or manually copying `firestore.rules`.
