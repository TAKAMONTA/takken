import type { FirebaseApp } from 'firebase/app';
import type { Auth, User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

export const app: FirebaseApp | null;
export const auth: Auth | null;
export const db: Firestore | null;
export const analytics: unknown;

export function checkAuth(): Promise<User>;
export function checkPremiumStatus(userId: string): Promise<boolean>;


