// This script should be run once to create the first admin user
// You can run this in the browser console after signing up normally

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export async function createFirstAdmin(userId: string) {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role: 'admin',
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: 'system', // System approved
    });
    
    console.log('User has been made admin and approved successfully!');
    console.log('Please refresh the page to see the changes.');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Instructions:
// 1. Sign up normally through the UI
// 2. Copy your user ID from Firebase Console or use the browser console
// 3. Run: createFirstAdmin('your-user-id-here')
// 4. Refresh the page

// To get your user ID, you can run this in browser console after signing up:
export function getCurrentUserId() {
  // This will be available when Firebase is loaded
  // Check the Network tab for the auth token or use Firebase Auth methods
  console.log('Check the Firebase Auth object or Network tab for your user ID');
}