# Firebase Configuration Setup

The "Missing Firebase env" error means the Firebase environment variables are not configured. Follow these steps to fix it:

## Prerequisites

- A Firebase project created at https://console.firebase.google.com/

## Frontend Configuration

1. **Locate your Firebase credentials:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Click the settings icon (⚙️) → Project Settings
   - Go to the **General** tab
   - Under "Your apps", find your web app (or create one if it doesn't exist)
   - Copy the config object

2. **Update `.env.local` in the `frontend/` directory:**

   ```bash
   VITE_FIREBASE_API_KEY=<your_api_key>
   VITE_FIREBASE_AUTH_DOMAIN=<your_project_id>.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=<your_project_id>
   VITE_FIREBASE_STORAGE_BUCKET=<your_project_id>.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=<your_messaging_sender_id>
   VITE_FIREBASE_APP_ID=<your_app_id>
   ```

   Example:

   ```bash
   VITE_FIREBASE_API_KEY=AIzaSyDj4WK1-4j2h3k4l5m6n7o8p9q0r1s2t3u
   VITE_FIREBASE_AUTH_DOMAIN=collab-mind.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=collab-mind
   VITE_FIREBASE_STORAGE_BUCKET=collab-mind.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcd
   ```

## Backend Configuration

1. **Create a Firebase Service Account:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Click the settings icon (⚙️) → Project Settings
   - Go to the **Service Accounts** tab
   - Click "Generate New Private Key"
   - A JSON file will download

2. **Add the service account key to backend:**
   - Save the downloaded JSON file as `serviceAccountKey.json` in the `backend/` directory
   - **IMPORTANT:** Add `backend/serviceAccountKey.json` to `.gitignore` (never commit this file)

## Testing the Configuration

After setting up both frontend and backend:

```bash
# Frontend
cd frontend
npm run dev

# Backend (in another terminal)
cd backend
npm start
```

If the error persists, make sure:

- ✅ All 6 Firebase variables are set in `frontend/.env.local`
- ✅ None of the values are empty or contain placeholder text like "your_api_key"
- ✅ `backend/serviceAccountKey.json` exists (for backend functionality)
- ✅ You've restarted the dev server after updating `.env.local`
