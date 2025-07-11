import { getApps, initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { doc, getDoc, getDocFromServer, getFirestore, setDoc } from 'firebase/firestore';
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

// Save a recipe to Firebase
export const saveRecipeToFirebase = async (recipe: any) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('❌ No user logged in, cannot save recipe');
      return false;
    }

    console.log('💾 Saving recipe to Firebase:', recipe.id, recipe.title);

    // Save the full recipe data
    await setDoc(doc(db, 'recipes', recipe.id), recipe);
    console.log('✅ Recipe data saved to recipes collection');
    
    // Verify the recipe was saved by trying to read it back
    const savedRecipeDoc = await getDoc(doc(db, 'recipes', recipe.id));
    if (savedRecipeDoc.exists()) {
      console.log('✅ Verified: Recipe was saved successfully');
    } else {
      console.log('❌ ERROR: Recipe was not saved properly');
      return false;
    }
    
    // Add recipe ID to user's saved recipes
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    let savedRecipes = [];
    if (userDoc.exists() && userDoc.data().savedRecipes) {
      savedRecipes = userDoc.data().savedRecipes;
    }
    
    console.log('📋 Current saved recipes:', savedRecipes);
    
    if (!savedRecipes.includes(recipe.id)) {
      savedRecipes.push(recipe.id);
      
      // Get the current user data and update it properly
      const currentUserData = userDoc.exists() ? userDoc.data() : {};
      const updatedUserData = {
        ...currentUserData,
        savedRecipes: savedRecipes // Ensure savedRecipes is set last to override any existing value
      };
      
      await setDoc(userDocRef, updatedUserData, { merge: true });
      console.log('✅ Recipe ID added to user saved recipes:', savedRecipes);
      
      // Verify the user document was updated by reading it back with a fresh read
      const updatedUserDoc = await getDocFromServer(userDocRef);
      if (updatedUserDoc.exists()) {
        const updatedSavedRecipes = updatedUserDoc.data().savedRecipes || [];
        console.log('🔍 Verification: Updated saved recipes:', updatedSavedRecipes);
        if (updatedSavedRecipes.includes(recipe.id)) {
          console.log('✅ Verification: Recipe ID confirmed in user document');
        } else {
          console.log('❌ ERROR: Recipe ID not found in updated user document');
          return false;
        }
      }
    } else {
      console.log('ℹ️ Recipe already in saved list');
    }
    
    console.log('🎉 Recipe saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving recipe to Firebase:', error);
    return false;
  }
};

// Remove a recipe from Firebase
export const removeRecipeFromFirebase = async (recipeId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in, cannot remove recipe');
      return false;
    }

    console.log(`🗑️ Removing recipe ${recipeId} from user's saved list`);

    // Remove recipe ID from user's saved recipes
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDocFromServer(userDocRef);
    
    if (userDoc.exists() && userDoc.data().savedRecipes) {
      const currentSavedRecipes = userDoc.data().savedRecipes;
      const updatedSavedRecipes = currentSavedRecipes.filter((id: string) => id !== recipeId);
      
      console.log(`📋 Before removal: ${currentSavedRecipes.length} recipes`);
      console.log(`📋 After removal: ${updatedSavedRecipes.length} recipes`);
      
      // Get current user data and update it properly
      const currentUserData = userDoc.data();
      const updatedUserData = {
        ...currentUserData,
        savedRecipes: updatedSavedRecipes // Ensure savedRecipes is set last
      };
      
      await setDoc(userDocRef, updatedUserData, { merge: true });
      
      // Verify the removal
      const verificationDoc = await getDocFromServer(userDocRef);
      if (verificationDoc.exists()) {
        const verificationRecipes = verificationDoc.data().savedRecipes || [];
        if (!verificationRecipes.includes(recipeId)) {
          console.log('✅ Recipe successfully removed from user saved list');
        } else {
          console.log('❌ ERROR: Recipe still found in saved list after removal');
          return false;
        }
      }
    } else {
      console.log('📝 No saved recipes found to remove from');
    }
    
    console.log('Recipe removed successfully');
    return true;
  } catch (error) {
    console.error('Error removing recipe from Firebase:', error);
    return false;
  }
};

// Get saved recipes from Firebase
export const getSavedRecipesFromFirebase = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('🚫 No user logged in, returning empty array');
      return [];
    }

    console.log('🔍 Getting saved recipes for user:', user.uid);
    // Force a fresh read from server to avoid cache issues
    const userDoc = await getDocFromServer(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.log('📄 User document does not exist');
      return [];
    }

    const userData = userDoc.data();
    console.log('📋 User document data:', userData);

    if (!userData.savedRecipes) {
      console.log('📝 No savedRecipes field found');
      return [];
    }

    const savedRecipeIds = userData.savedRecipes;
    console.log('🆔 Saved recipe IDs:', savedRecipeIds);
    const recipes = [];

    // Fetch each recipe's full data
    for (const recipeId of savedRecipeIds) {
      console.log(`🔍 Fetching recipe: ${recipeId}`);
      // Force fresh read from server to avoid cache issues
      const recipeDoc = await getDocFromServer(doc(db, 'recipes', recipeId));
      if (recipeDoc.exists()) {
        const recipeData = { id: recipeId, ...recipeDoc.data() };
        console.log(`✅ Found recipe:`, recipeData);
        recipes.push(recipeData);
      } else {
        console.log(`❌ Recipe not found: ${recipeId}`);
        // Create a placeholder for missing recipes
        const placeholderRecipe = {
          id: recipeId,
          title: `Recipe ${recipeId}`,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
          ingredients: ['Missing data'],
          instructions: ['Recipe data not available'],
          cookTime: 30,
          cuisine: 'Unknown',
          dietary: [],
          difficulty: 'Easy'
        };
        console.log(`🔄 Using placeholder for missing recipe:`, placeholderRecipe);
        recipes.push(placeholderRecipe);
      }
    }

    console.log('📊 Final recipes array:', recipes);
    return recipes;
  } catch (error) {
    console.error('❌ Error getting saved recipes from Firebase:', error);
    return [];
  }
};

// Check if a recipe is saved
export const isRecipeSaved = async (recipeId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists() && userDoc.data().savedRecipes) {
      return userDoc.data().savedRecipes.includes(recipeId);
    }
    return false;
  } catch (error) {
    console.error('Error checking if recipe is saved:', error);
    return false;
  }
};

// Clean up invalid recipe IDs from user's saved recipes
export const cleanupSavedRecipes = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('❌ No user logged in, cannot cleanup');
      return false;
    }

    console.log('🧹 Cleaning up invalid saved recipes...');
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDocFromServer(userDocRef);
    
    if (!userDoc.exists() || !userDoc.data().savedRecipes) {
      console.log('📄 No saved recipes to clean up');
      return true;
    }

    const savedRecipeIds = userDoc.data().savedRecipes;
    const validRecipeIds = [];

    console.log(`🔍 Checking ${savedRecipeIds.length} saved recipes...`);

    // Check each recipe ID
    for (const recipeId of savedRecipeIds) {
      console.log(`🔍 Checking recipe: ${recipeId}`);
      const recipeDoc = await getDocFromServer(doc(db, 'recipes', recipeId));
      if (recipeDoc.exists()) {
        validRecipeIds.push(recipeId);
        console.log(`✅ Valid recipe: ${recipeId}`);
      } else {
        console.log(`🗑️ Removing invalid recipe: ${recipeId}`);
      }
    }

    // Update user document with only valid recipe IDs
    const currentUserData = userDoc.data();
    const updatedUserData = {
      ...currentUserData,
      savedRecipes: validRecipeIds // Ensure savedRecipes is set last
    };
    
    await setDoc(userDocRef, updatedUserData, { merge: true });

    // Verify the cleanup
    const verificationDoc = await getDocFromServer(userDocRef);
    if (verificationDoc.exists()) {
      const finalSavedRecipes = verificationDoc.data().savedRecipes || [];
      console.log(`🔍 Verification: Final saved recipes:`, finalSavedRecipes);
    }

    console.log(`🎉 Cleanup complete. ${validRecipeIds.length}/${savedRecipeIds.length} recipes kept`);
    return true;
  } catch (error) {
    console.error('❌ Error cleaning up saved recipes:', error);
    return false;
  }
};

export default app;
