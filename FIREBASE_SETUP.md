# Firebase Setup Instructions

## 1. Firebase Project Configuration

You need to update the Firebase configuration in `/src/firebase/config.ts` with your actual project credentials.

### Get Firebase Config:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **invoicewritenow**
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click "Add app" and select Web (</>) if you haven't already
6. Copy the configuration object

### Update config.ts:
Replace the placeholder values in `/src/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY_HERE",
  authDomain: "invoicewritenow.firebaseapp.com",
  projectId: "invoicewritenow",
  storageBucket: "invoicewritenow.appspot.com", 
  messagingSenderId: "638450798392",
  appId: "YOUR_ACTUAL_APP_ID_HERE"
};
```

## 2. Enable Firebase Services

### Enable Authentication:
1. Go to Firebase Console > Authentication
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider

### Enable Firestore:
1. Go to Firebase Console > Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location (choose closest to your users)

## 3. Firestore Security Rules

Update your Firestore security rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Admins can read all user profiles for approval management
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      // Admins can update user status for approvals
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
        request.resource.data.keys().hasOnly(['status', 'approvedAt', 'approvedBy']);
    }
  }
}
```

## 4. Create First Admin User

Since this is an admin-approval system, you need to create the first admin user manually:

### Method 1: Using Firebase Console
1. Sign up through your app normally
2. Go to Firebase Console > Firestore Database
3. Find your user document in the `users` collection
4. Edit the document and change:
   - `role`: `"admin"`
   - `status`: `"approved"`
   - Add `approvedAt`: current timestamp
   - Add `approvedBy`: `"system"`

### Method 2: Using Browser Console (after implementing the helper)
1. Sign up through your app
2. Open browser dev tools > Console
3. Import and run the admin creation script:
   ```javascript
   // First get your user ID (check Network tab or Firebase Auth)
   // Then run:
   createFirstAdmin('your-user-id-here')
   ```

## 5. Test the System

1. **Test Admin Login**: Login with your admin account - you should see "User Approvals" in navigation
2. **Test User Registration**: Create a new account - it should show "Pending Approval" 
3. **Test Admin Approval**: Use admin account to approve/reject the new user
4. **Test Approved User**: Login with approved user - should access the main app

## 6. Deploy to Firebase Hosting

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting (if not done already)
firebase init hosting

# Build the app
npm run build

# Deploy
firebase deploy
```

## 7. Environment Variables (Optional)

For better security, you can use environment variables:

1. Create `.env.local` file:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=invoicewritenow.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=invoicewritenow
   VITE_FIREBASE_STORAGE_BUCKET=invoicewritenow.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=638450798392
   VITE_FIREBASE_APP_ID=your-app-id
   ```

2. Update `config.ts` to use environment variables:
   ```typescript
   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID
   };
   ```

## Authentication Flow

1. **New User Registration**: 
   - User fills signup form
   - Account created with `status: "pending"`
   - User sees "Pending Approval" screen
   
2. **Admin Approval**:
   - Admin sees pending users in "User Approvals" page
   - Admin can approve/reject with one click
   - User status updated to "approved" or "rejected"
   
3. **Approved User Login**:
   - User can now access the full application
   - All features are available
   
4. **Rejected User**:
   - User sees "Access Denied" message
   - Cannot access the application

## Security Features

- ✅ Email/Password authentication
- ✅ Admin approval required for new accounts  
- ✅ Role-based access control (admin vs user)
- ✅ Protected routes
- ✅ Firestore security rules
- ✅ User profile management
- ✅ Real-time approval status updates