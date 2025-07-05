import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../constants/firebaseConfig';

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

let auth;

if (Constants?.platform?.ios || Constants?.platform?.android) {
  // Native (Expo Go or standalone app)
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  // Web
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
export default app;