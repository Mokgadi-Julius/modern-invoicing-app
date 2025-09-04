import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(user, { displayName });

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName,
        companyName,
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
      // Validate setup key
      if (setupKey !== import.meta.env.VITE_ADMIN_SETUP_KEY) {
        throw new Error('Invalid setup key');
      }

      // Check if admin already exists
      if (hasAdmin) {
        throw new Error('Admin account already exists');
      }

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(user, { displayName });

      // Create admin profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName,
        companyName,
        role: 'admin',
        status: 'approved', // Admin is automatically approved
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedBy: 'system',
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      setHasAdmin(true);
      
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

  // Load user profile from Firestore
  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Check if admin exists
  const checkAdminExists = async () => {
    try {
      const q = query(
        collection(db, 'users'), 
        where('role', '==', 'admin')
      );
      const snapshot = await getDocs(q);
      setHasAdmin(!snapshot.empty);
    } catch (error) {
      console.error('Error checking admin existence:', error);
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

  // Check admin existence on app load
  useEffect(() => {
    checkAdminExists();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Listen for pending users (admin only)
  useEffect(() => {
    if (!isAdmin) {
      setPendingUsers([]);
      return;
    }

    console.log('Setting up pending users listener for admin');

    const q = query(
      collection(db, 'users'), 
      where('status', '==', 'pending')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
      });
      console.log('Pending users updated:', users.length);
      setPendingUsers(users);
    }, (error) => {
      console.error('Error listening for pending users:', error);
    });

    return unsubscribe;
  }, [isAdmin]);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    isAuthenticated,
    isApproved,
    isAdmin,
    hasAdmin,
    loading,
    login,
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