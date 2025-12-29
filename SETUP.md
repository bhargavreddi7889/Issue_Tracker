# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd issue-tracker
npm install
```

## Step 2: Firebase Setup

### Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name (e.g., "issue-tracker")
4. Disable Google Analytics (optional)
5. Click "Create project"

### Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Click on **Email/Password** provider
4. Enable the first toggle (Email/Password)
5. Click "Save"

### Create Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click "Create database"
3. Select **Start in test mode** (for development)
4. Choose your preferred location
5. Click "Enable"

### Get Firebase Configuration

1. Click the gear icon ⚙️ → **Project settings**
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register your app with a nickname
5. Copy the configuration values

## Step 3: Configure Environment Variables

Update the `.env.local` file with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
```

## Step 4: Update Firestore Rules (Production)

For production, update Firestore security rules:

1. Go to **Firestore Database** → **Rules**
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /issues/{issueId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null && 
                      resource.data.createdBy == request.auth.token.email;
    }
  }
}
```

3. Click "Publish"

## Step 5: Run the App

```bash
npm run dev
```

Open http://localhost:3000

## Step 6: Test the Application

1. Go to `/signup` and create an account
2. Log in with your credentials
3. Create a test issue
4. Try changing issue status
5. Test the filters

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

Or push to GitHub and import in Vercel dashboard.

**Important**: Add all environment variables in Vercel project settings!

## Common Issues

### "Firebase: Error (auth/invalid-api-key)"
- Check that your API key is correct in `.env.local`
- Make sure the file name is exactly `.env.local`

### "Missing or insufficient permissions"
- Update your Firestore security rules
- Ensure Authentication is enabled

### "Module not found: Can't resolve '@/...'""
- Make sure you ran `npm install`
- Check that `tsconfig.json` has the correct path aliases

### Changes not reflecting
- Restart the dev server
- Clear `.next` folder: `rm -rf .next`

---

You're all set! 🎉

