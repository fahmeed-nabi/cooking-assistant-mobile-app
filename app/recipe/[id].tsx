import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  auth,
  getIngredientsFromFirebase,
  isRecipeSaved,
  removeRecipeFromFirebase,
  saveRecipeToFirebase
} from '../../services/firebase';

export default function RecipeDetailScreen() {
  const params = useLocalSearchParams();
  const { id, recipe: recipeParam } = params;
  const router = useRouter();
  const [recipe, setRecipe] = useState<any | null>(null); // Changed to any for now as Recipe type is removed
  const [userIngredients, setUserIngredients] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    loadRecipe();
    loadUserData();
  }, [id, recipeParam]);

  const loadRecipe = async () => {
    setLoading(true);
    try {
      console.log('Recipe detail screen - params:', params);
      console.log('Recipe param:', recipeParam);
      
      // Get recipe data from navigation params
      if (recipeParam) {
        const foundRecipe = JSON.parse(decodeURIComponent(recipeParam as string));
        console.log('Parsed recipe:', foundRecipe);
        
        // Check if this is a placeholder recipe
        if (foundRecipe.title.startsWith('Recipe ') && foundRecipe.ingredients.includes('Missing data')) {
          console.log('❌ Placeholder recipe detected');
          Alert.alert(
            'Recipe Not Available',
            'This recipe is no longer available. Please remove it from your saved recipes.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          return;
        }
        
        setRecipe(foundRecipe);
      } else {
        console.log('No recipe param found');
        Alert.alert('Error', 'Recipe not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading recipe details:', error);
      Alert.alert('Error', 'Could not load recipe details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const ingredients = await getIngredientsFromFirebase();
      const saved = await isRecipeSaved(id as string);
      setUserIngredients(ingredients);
      setIsSaved(saved);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const toggleSaveRecipe = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.log('❌ No user logged in, showing login modal');
      setShowLoginModal(true);
      return;
    }

    if (!recipe) {
      console.log('❌ No recipe data available');
      return;
    }

    if (saving) {
      console.log('⏳ Save operation already in progress, ignoring duplicate call');
      return;
    }

    console.log('🔄 Toggling save for recipe:', recipe.id, recipe.title);
    setSaving(true);
    try {
      if (isSaved) {
        console.log('🗑️ Removing recipe from saved');
        const success = await removeRecipeFromFirebase(recipe.id);
        if (success) {
          setIsSaved(false);
          console.log('✅ Recipe removed successfully');
        } else {
          console.log('❌ Failed to remove recipe');
          Alert.alert('Error', 'Failed to remove recipe from saved');
        }
      } else {
        console.log('💾 Saving recipe');
        const success = await saveRecipeToFirebase(recipe);
        if (success) {
          setIsSaved(true);
          console.log('✅ Recipe saved successfully');
          // Small delay to ensure data propagates to all Firebase replicas
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log('❌ Failed to save recipe');
          Alert.alert('Error', 'Failed to save recipe. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  const getMissingIngredients = () => {
    if (!recipe) return [];
    return recipe.ingredients.filter((ingredient: string) =>
      !userIngredients.includes(ingredient.toLowerCase())
    );
  };

  const getMatchingIngredients = () => {
    if (!recipe) return [];
    return recipe.ingredients.filter((ingredient: string) =>
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
    <>
      {/* Login Required Modal */}
      <Modal
        visible={showLoginModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="lock-closed-outline" size={48} color="#FF6B6B" style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitle}>Sign In Required</Text>
            <Text style={styles.modalText}>
              You must be logged in to save recipes.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowLoginModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#FF6B6B' }]}
                onPress={() => {
                  setShowLoginModal(false);
                  router.replace('/login');
                }}
              >
                <Text style={styles.modalButtonText}>Log In</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowLoginModal(false)}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Main Recipe Detail UI */}
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
            {(recipe.dietary ?? []).map((diet: string) => (
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
            {recipe.ingredients.map((ingredient: string, index: number) => {
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
            {recipe.instructions.map((instruction: string, index: number) => (
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
    </>
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
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 15,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 4,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
}); 