import { signInAnonymously, onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';

import { auth } from '@/config/firebase';
import { useAuthStore } from '@/store/auth';

/**
 * Sign in anonymously
 * Creates a new anonymous user or returns existing one
 */
export async function signInAnonymous(): Promise<User> {
  try {
    console.log('🔐 Signing in anonymously...');
    const result = await signInAnonymously(auth);
    console.log('✅ Anonymous sign-in successful:', result.user.uid);
    return result.user;
  } catch (error: any) {
    console.error('❌ Anonymous sign-in failed:', error.message);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    console.log('🔐 Signing out...');
    await firebaseSignOut(auth);
    useAuthStore.getState().signOut();
    console.log('✅ Sign out successful');
  } catch (error: any) {
    console.error('❌ Sign out failed:', error.message);
    throw error;
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Get current user UID
 */
export function getCurrentUserId(): string | null {
  return auth.currentUser?.uid || null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}

/**
 * Initialize auth listener
 * This should be called once on app startup
 */
export function initializeAuthListener(): () => void {
  const unsubscribe = onAuthStateChanged(
    auth,
    async (user) => {
      const { setUser, setInitialized, initialized } = useAuthStore.getState();
      
      if (user) {
        setUser(user);
      } else {
        try {
          const newUser = await signInAnonymous();
          setUser(newUser);
        } catch (error) {
          console.error('❌ Failed to sign in anonymously:', error);
          setUser(null);
        }
      }
      
      if (!initialized) {
        setInitialized(true);
      }
    },
    (error) => {
      console.error('❌ Auth state change error:', error);
      useAuthStore.getState().setUser(null);
      useAuthStore.getState().setInitialized(true);
    }
  );

  return unsubscribe;
}

/**
 * Wait for auth to be initialized
 */
export function waitForAuth(): Promise<User | null> {
  return new Promise((resolve) => {
    const { initialized, user } = useAuthStore.getState();
    
    if (initialized) {
      resolve(user);
      return;
    }

    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.initialized) {
        unsubscribe();
        resolve(state.user);
      }
    });
  });
}