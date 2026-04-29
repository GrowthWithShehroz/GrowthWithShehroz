import { Platform } from 'react-native';

type FirebaseAuth = ReturnType<typeof loadAuth>;
type FirebaseFirestore = ReturnType<typeof loadFirestore>;

let authInstance: ReturnType<NonNullable<FirebaseAuth>> | null = null;
let firestoreInstance: ReturnType<NonNullable<FirebaseFirestore>> | null = null;
let initError: Error | null = null;

function loadAuth() {
  try {
    return require('@react-native-firebase/auth').default as () => unknown;
  } catch (e) {
    initError = e as Error;
    return null;
  }
}

function loadFirestore() {
  try {
    return require('@react-native-firebase/firestore').default as () => unknown;
  } catch (e) {
    initError = e as Error;
    return null;
  }
}

export function getAuth() {
  if (authInstance) return authInstance;
  const factory = loadAuth();
  if (!factory) return null;
  authInstance = factory();
  return authInstance;
}

export function getFirestore() {
  if (firestoreInstance) return firestoreInstance;
  const factory = loadFirestore();
  if (!factory) return null;
  firestoreInstance = factory();
  return firestoreInstance;
}

export function isFirebaseAvailable(): boolean {
  return Platform.OS === 'android' && getAuth() !== null && getFirestore() !== null;
}

export function getInitError(): Error | null {
  return initError;
}
