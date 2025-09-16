import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  companyName: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isApproved: boolean;
  isAdmin: boolean;
  hasAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, displayName: string, companyName: string) => Promise<void>;
  registerAdmin: (email: string, password: string, displayName: string, companyName: string, setupKey: string) => Promise<void>;
  logout: () => Promise<void>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  pendingUsers: UserProfile[];
  refreshPendingUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [hasAdmin, setHasAdmin] = useState(false);

  const isAuthenticated = !!currentUser;
  const isApproved = userProfile?.status === 'approved';
  const isAdmin = userProfile?.role === 'admin';

  // Register new user
  const register = async (email: string, password: string, displayName: string, companyName: string) => {
    try {
      // Input validation
      if (!email?.trim() || !password?.trim() || !displayName?.trim() || !companyName?.trim()) {
        throw new Error('All fields are required');
      }
      
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(user, { displayName: displayName.trim() });

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: displayName.trim(),
        companyName: companyName.trim(),
        role: 'user',
        status: 'pending', // Requires admin approval
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Register first admin user
  const registerAdmin = async (email: string, password: string, displayName: string, companyName: string, setupKey: string) => {
    try {
      // Input validation
      if (!email?.trim() || !password?.trim() || !displayName?.trim() || !companyName?.trim() || !setupKey?.trim()) {
        throw new Error('All fields are required');
      }
      
      if (password.length < 12) { // Stricter password requirement for admin
        throw new Error('Admin password must be at least 12 characters long');
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate setup key
      if (setupKey.trim() !== import.meta.env.VITE_ADMIN_SETUP_KEY) {
        throw new Error('Invalid setup key');
      }

      // Check if admin already exists
      if (hasAdmin) {
        throw new Error('Admin account already exists');
      }

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(user, { displayName: displayName.trim() });

      // Create admin profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: displayName.trim(),
        companyName: companyName.trim(),
        role: 'admin',
        status: 'approved', // Admin is automatically approved
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedBy: 'system',
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      // Create the admin status document
      await setDoc(doc(db, 'system', 'admin_status'), { 
        exists: true,
        createdAt: new Date().toISOString(),
        createdBy: user.uid
      });

      // Update local state immediately
      setHasAdmin(true);
      setUserProfile(userProfile);
      
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      // Check if user profile exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // Create user profile for new Google user
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || user.email!.split('@')[0],
          companyName: '', // Will need to be filled later
          role: 'user',
          status: 'pending', // Requires admin approval
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', user.uid), userProfile);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Approve user (admin only)
  const approveUser = async (userId: string) => {
    if (!isAdmin) throw new Error('Unauthorized');
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser!.uid,
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Reject user (admin only)
  const rejectUser = async (userId: string) => {
    if (!isAdmin) throw new Error('Unauthorized');
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'rejected',
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser!.uid,
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Manual refresh for pending users
  const refreshPendingUsers = async () => {
    if (!isAdmin) return;
    
    try {
      console.log('Manually refreshing pending users...');
      const q = query(
        collection(db, 'users'), 
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      const users: UserProfile[] = [];
      snapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
      });
      console.log('Manual refresh found:', users.length, 'pending users');
      setPendingUsers(users);
    } catch (error) {
      console.error('Error refreshing pending users:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    const adminStatusDoc = doc(db, 'system', 'admin_status');
    const unsubscribeAdminCheck = onSnapshot(adminStatusDoc, (doc) => {
      setHasAdmin(doc.exists());
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeAdminCheck();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      // Get user profile once
      const fetchUserProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userProfileData = userDoc.data() as UserProfile;
            setUserProfile(userProfileData);
            
            // If admin, fetch pending users once
            if (userProfileData.role === 'admin') {
              // Inline fetch to avoid dependency issues
              const fetchPendingUsers = async () => {
                try {
                  const q = query(collection(db, 'users'), where('status', '==', 'pending'));
                  const snapshot = await getDocs(q);
                  const users: UserProfile[] = [];
                  snapshot.forEach((doc) => {
                    users.push(doc.data() as UserProfile);
                  });
                  setPendingUsers(users);
                } catch (error) {
                  console.error('Error fetching pending users:', error);
                  setPendingUsers([]);
                }
              };
              fetchPendingUsers();
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      };
      
      fetchUserProfile();
    } else {
      setUserProfile(null);
      setPendingUsers([]);
    }
  }, [currentUser]);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    isAuthenticated,
    isApproved,
    isAdmin,
    hasAdmin,
    loading,
    login,
    loginWithGoogle,
    register,
    registerAdmin,
    logout,
    approveUser,
    rejectUser,
    pendingUsers,
    refreshPendingUsers,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}