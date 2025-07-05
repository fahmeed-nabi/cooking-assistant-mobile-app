import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { apiService, Ingredient } from '../../services/apiService';
import { getIngredientsFromFirebase, saveIngredientsToFirebase } from '../../services/firebase';

const DIETARY_OPTIONS = [
  'vegetarian',
  'vegan',
  'gluten free',
];
const CUISINES = [
  'italian',
  'mexican',
  'chinese',
  'indian',
  'french',
  'japanese',
  'thai',
  'mediterranean',
  'american',
  'middle eastern',
  'spanish',
  'korean',
];

export default function IngredientInputScreen() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [showNoRecipes, setShowNoRecipes] = useState(false);

  useEffect(() => {
    loadSavedIngredients();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchIngredients();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadSavedIngredients = async () => {
    try {
      const savedIngredients = await getIngredientsFromFirebase();
      if (savedIngredients.length > 0) {
        setIngredients(savedIngredients);
      }
    } catch (error) {
      console.error('Error loading saved ingredients:', error);
    }
  };

  const searchIngredients = async () => {
    if (searchQuery.length < 3) return;

    setIsSearching(true);
    try {
      const results = await apiService.searchIngredients(searchQuery, 10);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching ingredients:', error);
      Alert.alert('Error', 'Failed to search ingredients. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const addIngredient = (ingredient: string) => {
    const normalizedIngredient = ingredient.toLowerCase().trim();
    if (!ingredients.includes(normalizedIngredient)) {
      const newIngredients = [...ingredients, normalizedIngredient];
      setIngredients(newIngredients);
      saveIngredientsToFirebase(newIngredients);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeIngredient = (ingredient: string) => {
    const newIngredients = ingredients.filter(i => i !== ingredient);
    setIngredients(newIngredients);
    saveIngredientsToFirebase(newIngredients);
  };

  const generateRecipes = async (mode: 'normal' | 'loose' | 'surprise') => {
    console.log('🚀 generateRecipes called with mode:', mode);
    console.log('📝 Current ingredients:', ingredients);

    const recipes = await apiService.searchRecipesByIngredients(
      ingredients,
      mode,
      selectedCuisines,
      selectedDietary
    );
    
    if (ingredients.length === 0) {
      setIsLoading(false);
      setShowNoRecipes(true);
      console.log('❌ No ingredients found');
      Alert.alert('No Ingredients', 'Please add some ingredients first.');
      return;
    }

    if (recipes.length === 0) {
      setIsLoading(false);
      setShowNoRecipes(true);
      return;
    }

    console.log('⏳ Setting loading state...');
    setIsLoading(true);
    
    try {
      console.log('🔍 Calling apiService.searchRecipesByIngredients...');
      // Use API service for recipe matching
      const recipes = await apiService.searchRecipesByIngredients(
        ingredients, 
        mode, 
        selectedCuisines, 
        selectedDietary);
      
      console.log('📊 Recipes found:', recipes.length);
      
      if (recipes.length === 0) {
        console.log('❌ No recipes found');
        Alert.alert(
          'No Recipes Found',
          'No recipes found with your ingredients. Try adding more ingredients or using a different mode.',
          [
            { text: 'Add More Ingredients', onPress: () => {} },
            { text: 'Try Loose Mode', onPress: () => generateRecipes('loose') },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }

      console.log('🧭 Navigating to recipes screen...');
      // Navigate to recipes screen with the found recipes
      router.push({
        pathname: '/recipes',
        params: { 
          recipes: JSON.stringify(recipes),
          mode: mode,
          ingredients: JSON.stringify(ingredients),
          cuisines: JSON.stringify(selectedCuisines),
          dietary: JSON.stringify(selectedDietary),
        }
      });
    } catch (error) {
      console.error('❌ Error generating recipes:', error);
      Alert.alert('Error', 'Failed to generate recipes. Please try again.');
    } finally {
      console.log('✅ Clearing loading state...');
      setIsLoading(false);
    }
  };

  // UI for cuisine and dietary filters
  const renderFilters = () => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>FILTERS</Text>
      <Text style={{ fontWeight: '600', marginBottom: 4 }}>Cuisine</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {CUISINES.map(cuisine => (
          <TouchableOpacity
            key={cuisine}
            style={{
              backgroundColor: selectedCuisines.includes(cuisine) ? '#007AFF' : '#e0e0e0',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              marginRight: 8,
              marginBottom: 8,
            }}
            onPress={() => {
              setSelectedCuisines(prev =>
                prev.includes(cuisine)
                  ? prev.filter(c => c !== cuisine)
                  : [...prev, cuisine]
              );
            }}
          >
            <Text style={{ color: selectedCuisines.includes(cuisine) ? 'white' : '#333' }}>
              {cuisine}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{ fontWeight: '600', marginBottom: 4 }}>Dietary Preferences</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {DIETARY_OPTIONS.map(option => (
          <TouchableOpacity
            key={option}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 16,
              marginBottom: 8,
            }}
            onPress={() => {
              setSelectedDietary(prev =>
                prev.includes(option)
                  ? prev.filter(d => d !== option)
                  : [...prev, option]
              );
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#007AFF',
                backgroundColor: selectedDietary.includes(option) ? '#007AFF' : 'white',
                marginRight: 6,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {selectedDietary.includes(option) && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <Text style={{ color: '#333' }}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderIngredientItem = ({ item }: { item: Ingredient }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => addIngredient(item.name)}
    >
      <Text style={styles.searchResultText}>{item.name}</Text>
      {item.category && (
        <Text style={styles.searchResultCategory}>{item.category}</Text>
      )}
    </TouchableOpacity>
  );

  const renderAddedIngredient = ({ item }: { item: string }) => (
    <View style={styles.ingredientTag}>
      <Text style={styles.ingredientText}>{item}</Text>
      <TouchableOpacity
        onPress={() => removeIngredient(item)}
        style={styles.removeButton}
      >
        <Ionicons name="close-circle" size={16} color="#ff6b6b" />
      </TouchableOpacity>
    </View>
  );

  return (
  <>
    <Modal
      visible={showNoRecipes}
      transparent
      animationType="fade"
      onRequestClose={() => setShowNoRecipes(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Ionicons name="sad-outline" size={48} color="#FF6B6B" style={{ marginBottom: 12 }} />
          <Text style={styles.noRecipesTitle}>No Recipes Found</Text>
          <Text style={styles.noRecipesText}>
            We couldn't find any recipes with your current ingredients and filters.{"\n"}
            Try adding more ingredients, changing your filters, or using Surprise Me!
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity
              style={styles.noRecipesButton}
              onPress={() => setShowNoRecipes(false)}
            >
              <Text style={styles.noRecipesButtonText}>Add Ingredients</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.noRecipesButton, { backgroundColor: '#FF6B6B' }]}
              onPress={() => {
                setShowNoRecipes(false);
                generateRecipes('surprise');
              }}
            >
              <Text style={styles.noRecipesButtonText}>Try Surprise Me</Text>
            </TouchableOpacity>
          </View>
          <Pressable
            style={styles.closeButton}
            onPress={() => setShowNoRecipes(false)}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={24} color="#888" />
          </Pressable>
        </View>
      </View>
    </Modal>

    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>What's in your kitchen?</Text>
        <Text style={styles.subtitle}>
          Add ingredients you have and we'll find recipes for you
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for ingredients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {isSearching && (
            <ActivityIndicator size="small" color="#007AFF" style={styles.searchLoader} />
          )}
        </View>

        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            <FlatList
              data={searchResults}
              renderItem={renderIngredientItem}
              keyExtractor={(item) => item.id}
              style={styles.searchResultsList}
            />
          </View>
        )}
      </View>

      {ingredients.length > 0 && (
        <View style={styles.ingredientsContainer}>
          <Text style={styles.ingredientsTitle}>Your Ingredients ({ingredients.length})</Text>
          <FlatList
            data={ingredients}
            renderItem={renderAddedIngredient}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.ingredientsList}
          />
        </View>
      )}

      {renderFilters()}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.generateButton, styles.normalButton]}
          onPress={() => {
            console.log('🔘 Find Recipes button pressed!');
            generateRecipes('normal');
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="restaurant" size={20} color="white" />
              <Text style={styles.generateButtonText}>Find Recipes</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.modeButtonsContainer}>
          <TouchableOpacity
            style={[styles.modeButton, styles.looseButton]}
            onPress={() => {
              console.log('🔘 Loose Match button pressed!');
              generateRecipes('loose');
            }}
            disabled={isLoading}
          >
            <Ionicons name="options" size={16} color="#007AFF" />
            <Text style={styles.modeButtonText}>Loose Match</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, styles.surpriseButton]}
            onPress={() => {
              console.log('🔘 Surprise Me button pressed!');
              generateRecipes('surprise');
            }}
            disabled={isLoading}
          >
            <Ionicons name="sparkles" size={16} color="#FF6B6B" />
            <Text style={styles.modeButtonText}>Surprise Me!</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>How it works:</Text>
        <View style={styles.infoItem}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.infoText}>Find Recipes: Uses your exact ingredients</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="options" size={16} color="#007AFF" />
          <Text style={styles.infoText}>Loose Match: Suggests recipes with similar ingredients</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="sparkles" size={16} color="#FF6B6B" />
          <Text style={styles.infoText}>Surprise Me: AI-powered creative suggestions</Text>
        </View>
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  searchLoader: {
    marginLeft: 8,
  },
  searchResults: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultsList: {
    borderRadius: 12,
  },
  searchResultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  searchResultText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  searchResultCategory: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  ingredientsContainer: {
    marginBottom: 30,
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  ingredientsList: {
    flexGrow: 0,
  },
  ingredientTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  ingredientText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  },
  removeButton: {
    marginLeft: 4,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  normalButton: {
    backgroundColor: '#007AFF',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  modeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    flex: 0.48,
  },
  looseButton: {
    backgroundColor: 'white',
    borderColor: '#007AFF',
  },
  surpriseButton: {
    backgroundColor: 'white',
    borderColor: '#FF6B6B',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
    flex: 1,
  },
  noRecipesContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginVertical: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noRecipesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  noRecipesText: {
    fontSize: 15,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 16,
  },
  noRecipesButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 4,
  },
  noRecipesButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent dark overlay
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
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
});