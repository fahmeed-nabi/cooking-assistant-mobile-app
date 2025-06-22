import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayRemove, arrayUnion, doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from '../../services/firebase';
import { getRecipeById, Recipe } from '../../services/recipeData';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [userIngredients, setUserIngredients] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRecipe();
    loadUserData();
  }, [id]);

  const loadRecipe = () => {
    const foundRecipe = getRecipeById(id as string);
    if (foundRecipe) {
      setRecipe(foundRecipe);
    } else {
      Alert.alert('Error', 'Recipe not found');
      router.back();
    }
    setLoading(false);
  };

  const loadUserData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserIngredients(data.ingredients || []);
        setIsSaved(data.savedRecipes?.includes(id) || false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const toggleSaveRecipe = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save recipes');
      return;
    }

    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      if (isSaved) {
        await setDoc(userRef, {
          savedRecipes: arrayRemove(id)
        }, { merge: true });
        setIsSaved(false);
      } else {
        await setDoc(userRef, {
          savedRecipes: arrayUnion(id)
        }, { merge: true });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  const getMissingIngredients = () => {
    if (!recipe) return [];
    return recipe.ingredients.filter(ingredient =>
      !userIngredients.includes(ingredient.toLowerCase())
    );
  };

  const getMatchingIngredients = () => {
    if (!recipe) return [];
    return recipe.ingredients.filter(ingredient =>
      userIngredients.includes(ingredient.toLowerCase())
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f4f2f" />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Recipe not found</Text>
      </View>
    );
  }

  const missingIngredients = getMissingIngredients();
  const matchingIngredients = getMatchingIngredients();

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: recipe.image }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{recipe.title}</Text>
          <TouchableOpacity
            style={[styles.saveButton, isSaved && styles.saveButtonActive]}
            onPress={toggleSaveRecipe}
            disabled={saving}
          >
            <Ionicons 
              name={isSaved ? "heart" : "heart-outline"} 
              size={24} 
              color={isSaved ? "#fff" : "#2f4f2f"} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{recipe.cookTime} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="restaurant-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{recipe.cuisine}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{recipe.difficulty}</Text>
          </View>
        </View>

        <View style={styles.tags}>
          {recipe.dietary.map(diet => (
            <View key={diet} style={styles.tag}>
              <Text style={styles.tagText}>{diet}</Text>
            </View>
          ))}
        </View>

        <View style={styles.ingredientsSection}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <Text style={styles.ingredientsInfo}>
            {matchingIngredients.length}/{recipe.ingredients.length} ingredients match
          </Text>
          {missingIngredients.length > 0 && (
            <Text style={styles.missingText}>
              Missing: {missingIngredients.join(', ')}
            </Text>
          )}
          {recipe.ingredients.map((ingredient, index) => {
            const hasIngredient = userIngredients.includes(ingredient.toLowerCase());
            return (
              <View key={index} style={styles.ingredientItem}>
                <Ionicons 
                  name={hasIngredient ? "checkmark-circle" : "ellipse-outline"} 
                  size={20} 
                  color={hasIngredient ? "#4CAF50" : "#ccc"} 
                />
                <Text style={[
                  styles.ingredientText,
                  !hasIngredient && styles.missingIngredientText
                ]}>
                  {ingredient}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF9EC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF9EC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF9EC',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2f4f2f',
    flex: 1,
    marginRight: 16,
  },
  saveButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: '#2f4f2f',
  },
  saveButtonActive: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff6b6b',
  },
  meta: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  ingredientsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2f4f2f',
    marginBottom: 8,
  },
  ingredientsInfo: {
    fontSize: 14,
    color: '#2f4f2f',
    fontWeight: '500',
    marginBottom: 4,
  },
  missingText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  ingredientText: {
    fontSize: 16,
    color: '#2f4f2f',
    marginLeft: 12,
    flex: 1,
  },
  missingIngredientText: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  instructionsSection: {
    marginBottom: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    backgroundColor: '#2f4f2f',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 16,
    color: '#2f4f2f',
    flex: 1,
    lineHeight: 24,
  },
}); 