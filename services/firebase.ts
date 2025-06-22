import { getApps, initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../constants/firebaseConfig';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = initializeAuth(app);

const db = getFirestore(app);

// Save user ingredients to Firebase
export const saveIngredientsToFirebase = async (ingredients: string[]) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in, saving to local storage only');
      return;
    }

    await setDoc(doc(db, 'users', user.uid), {
      ingredients: ingredients,
      updatedAt: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving ingredients to Firebase:', error);
    throw error;
  }
};

// Get user ingredients from Firebase
export const getIngredientsFromFirebase = async (): Promise<string[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in, returning empty array');
      return [];
    }

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists() && userDoc.data().ingredients) {
      return userDoc.data().ingredients;
    }
    return [];
  } catch (error) {
    console.error('Error getting ingredients from Firebase:', error);
    return [];
  }
};

export { auth, db };
export default app;
