// Firestore Database Service

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from './types';
import { StudySession } from './analytics';

export interface FirestoreUser extends Omit<UserProfile, 'id'> {
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface FirestoreStudySession extends Omit<StudySession, 'id' | 'startTime' | 'endTime'> {
  startTime: any; // Firestore Timestamp
  endTime: any; // Firestore Timestamp
  createdAt: any; // Firestore Timestamp
}

export interface SyncStatus {
  lastSyncTime: Date;
  pendingChanges: number;
  isOnline: boolean;
}

class FirestoreService {
  private syncStatus: SyncStatus = {
    lastSyncTime: new Date(),
    pendingChanges: 0,
    isOnline: typeof window !== 'undefined' ? navigator.onLine : false
  };

  constructor() {
    // Monitor online status only in browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.syncStatus.isOnline = true;
        this.syncPendingChanges();
      });

      window.addEventListener('offline', () => {
        this.syncStatus.isOnline = false;
      });
    }
  }

  // User Profile Operations
  async createUserProfile(userId: string, profile: UserProfile): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const firestoreProfile: FirestoreUser = {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(userRef, firestoreProfile);
      console.log('User profile created successfully');
    } catch (error) {
      console.error('Error creating user profile:', error);
      this.handleOfflineOperation('createUser', { userId, profile });
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data() as FirestoreUser;
        return {
          id: userSnap.id,
          ...data,
          joinedAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      // Fallback to localStorage
      return this.getLocalUserProfile(userId);
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const firestoreUpdates = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userRef, firestoreUpdates);
      
      // Also update localStorage
      this.updateLocalUserProfile(userId, updates);
      
      console.log('User profile updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
      this.handleOfflineOperation('updateUser', { userId, updates });
      
      // Update localStorage as fallback
      this.updateLocalUserProfile(userId, updates);
    }
  }

  // Study Session Operations
  async saveStudySession(session: StudySession): Promise<string> {
    try {
      const sessionsRef = collection(db, 'studySessions');
      const firestoreSession: FirestoreStudySession = {
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(sessionsRef, firestoreSession);
      console.log('Study session saved successfully');
      return docRef.id;
    } catch (error) {
      console.error('Error saving study session:', error);
      this.handleOfflineOperation('saveSession', { session });
      
      // Save to localStorage as fallback
      this.saveLocalStudySession(session);
      return session.id;
    }
  }

  async getStudySessions(
    userId: string, 
    limitCount: number = 50
  ): Promise<StudySession[]> {
    try {
      const sessionsRef = collection(db, 'studySessions');
      const q = query(
        sessionsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const sessions: StudySession[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreStudySession;
        sessions.push({
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate?.() || new Date(),
          endTime: data.endTime?.toDate?.() || new Date()
        });
      });
      
      return sessions;
    } catch (error) {
      console.error('Error getting study sessions:', error);
      // Fallback to localStorage
      return this.getLocalStudySessions(userId);
    }
  }

  // Real-time subscriptions
  subscribeToUserProfile(
    userId: string, 
    callback: (profile: UserProfile | null) => void
  ): Unsubscribe {
    const userRef = doc(db, 'users', userId);
    
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as FirestoreUser;
        const profile: UserProfile = {
          id: doc.id,
          ...data,
          joinedAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        };
        callback(profile);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error in user profile subscription:', error);
      callback(null);
    });
  }

  subscribeToStudySessions(
    userId: string,
    callback: (sessions: StudySession[]) => void
  ): Unsubscribe {
    const sessionsRef = collection(db, 'studySessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const sessions: StudySession[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreStudySession;
        sessions.push({
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate?.() || new Date(),
          endTime: data.endTime?.toDate?.() || new Date()
        });
      });
      
      callback(sessions);
    }, (error) => {
      console.error('Error in study sessions subscription:', error);
      callback([]);
    });
  }

  // Sync operations
  async syncPendingChanges(): Promise<void> {
    if (!this.syncStatus.isOnline) {
      return;
    }

    try {
      const pendingOperations = this.getPendingOperations();
      
      for (const operation of pendingOperations) {
        await this.executePendingOperation(operation);
      }
      
      this.clearPendingOperations();
      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.pendingChanges = 0;
      
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Error during sync:', error);
    }
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Offline operations handling
  private handleOfflineOperation(type: string, data: any): void {
    const operation = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: new Date().toISOString()
    };
    
    const pendingOps = this.getPendingOperations();
    pendingOps.push(operation);
    
    localStorage.setItem('pending_operations', JSON.stringify(pendingOps));
    this.syncStatus.pendingChanges = pendingOps.length;
  }

  private getPendingOperations(): any[] {
    try {
      const ops = localStorage.getItem('pending_operations');
      return ops ? JSON.parse(ops) : [];
    } catch (error) {
      console.error('Error getting pending operations:', error);
      return [];
    }
  }

  private clearPendingOperations(): void {
    localStorage.removeItem('pending_operations');
  }

  private async executePendingOperation(operation: any): Promise<void> {
    switch (operation.type) {
      case 'createUser':
        await this.createUserProfile(operation.data.userId, operation.data.profile);
        break;
      case 'updateUser':
        await this.updateUserProfile(operation.data.userId, operation.data.updates);
        break;
      case 'saveSession':
        await this.saveStudySession(operation.data.session);
        break;
      default:
        console.warn('Unknown operation type:', operation.type);
    }
  }

  // LocalStorage fallback methods
  private getLocalUserProfile(userId: string): UserProfile | null {
    try {
      const userData = localStorage.getItem('takken_rpg_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting local user profile:', error);
      return null;
    }
  }

  private updateLocalUserProfile(userId: string, updates: Partial<UserProfile>): void {
    try {
      const userData = localStorage.getItem('takken_rpg_user');
      if (userData) {
        const profile = JSON.parse(userData);
        const updatedProfile = { ...profile, ...updates };
        localStorage.setItem('takken_rpg_user', JSON.stringify(updatedProfile));
      }
    } catch (error) {
      console.error('Error updating local user profile:', error);
    }
  }

  private saveLocalStudySession(session: StudySession): void {
    try {
      const sessions = this.getLocalStudySessions(session.userId);
      sessions.push(session);
      localStorage.setItem(`study_sessions_${session.userId}`, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving local study session:', error);
    }
  }

  private getLocalStudySessions(userId: string): StudySession[] {
    try {
      const sessions = localStorage.getItem(`study_sessions_${userId}`);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Error getting local study sessions:', error);
      return [];
    }
  }

  // Batch operations for efficiency
  async batchUpdateUserProfiles(updates: { userId: string; data: Partial<UserProfile> }[]): Promise<void> {
    // Implementation would use Firestore batch operations
    console.log('Batch update not implemented yet');
  }

  // Data migration utilities
  async migrateLocalDataToFirestore(userId: string): Promise<void> {
    try {
      // Migrate user profile
      const localProfile = this.getLocalUserProfile(userId);
      if (localProfile) {
        await this.createUserProfile(userId, localProfile);
      }

      // Migrate study sessions
      const localSessions = this.getLocalStudySessions(userId);
      for (const session of localSessions) {
        await this.saveStudySession(session);
      }

      console.log('Data migration completed successfully');
    } catch (error) {
      console.error('Error during data migration:', error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();