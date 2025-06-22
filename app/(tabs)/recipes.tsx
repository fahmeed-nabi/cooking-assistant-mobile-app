import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../../services/firebase';
import {
    MOCK_RECIPES,
    Recipe,
    filterRecipesByCuisine,
    filterRecipesByDietary,
    filterRecipesByIngredients
} from '../../services/recipeData';

type RecipeMode = 'normal' | 'loose' | 'surprise';

export default function RecipesScreen() {
  const [mode, setMode] = useState<RecipeMode>('normal');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [selectedDietary, setSelectedDietary] = useState<string>('all');
  const router = useRouter();

  const cuisines = ['all', 'Asian', 'Italian', 'American', 'Mexican', 'Mediterranean'];
  const dietaryOptions = ['all', 'vegan', 'vegetarian', 'gluten-free'];

  useEffect(() => {
    loadUserIngredients();
  }, []);

  useEffect(() => {
    if (ingredients.length > 0) {
      generateRecipes();
    }
  }, [ingredients, mode, selectedCuisine, selectedDietary]);

  const loadUserIngredients = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().ingredients) {
        setIngredients(userDoc.data().ingredients);
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const generateRecipes = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let filteredRecipes = [...MOCK_RECIPES];

      // Apply filters
      filteredRecipes = filterRecipesByCuisine(filteredRecipes, selectedCuisine);
      filteredRecipes = filterRecipesByDietary(filteredRecipes, selectedDietary);
      filteredRecipes = filterRecipesByIngredients(filteredRecipes, ingredients, mode);

      setRecipes(filteredRecipes);
      setLoading(false);
    }, 1000);
  };

  const getMissingIngredients = (recipe: Recipe) => {
    return recipe.ingredients.filter(ingredient =>
      !ingredients.includes(ingredient.toLowerCase())
    );
  };

  const getMatchingIngredients = (recipe: Recipe) => {
    return recipe.ingredients.filter(ingredient =>
      ingredients.includes(ingredient.toLowerCase())
    );
  };

  const renderRecipe = ({ item }: { item: Recipe }) => {
    const missingIngredients = getMissingIngredients(item);
    const matchingIngredients = getMatchingIngredients(item);

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => router.push(`/recipe/${item.id}`)}
      >
        <Image source={{ uri: item.image }} style={styles.recipeImage} />
        <View style={styles.recipeContent}>
          <Text style={styles.recipeTitle}>{item.title}</Text>
          <View style={styles.recipeMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{item.cookTime} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="restaurant-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{item.cuisine}</Text>
            </View>
          </View>
          
          <View style={styles.ingredientsInfo}>
            <Text style={styles.ingredientsText}>
              {matchingIngredients.length}/{item.ingredients.length} ingredients match
            </Text>
            {missingIngredients.length > 0 && mode !== 'normal' && (
              <Text style={styles.missingText}>
                Missing: {missingIngredients.slice(0, 2).join(', ')}
                {missingIngredients.length > 2 && '...'}
              </Text>
            )}
          </View>

          <View style={styles.tags}>
            {item.dietary.map(diet => (
              <View key={diet} style={styles.tag}>
                <Text style={styles.tagText}>{diet}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderModeButton = (modeName: RecipeMode, label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.modeButton, mode === modeName && styles.modeButtonActive]}
      onPress={() => setMode(modeName)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={mode === modeName ? '#fff' : '#2f4f2f'} 
      />
      <Text style={[styles.modeButtonText, mode === modeName && styles.modeButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterButton = (
    value: string, 
    label: string, 
    selectedValue: string, 
    onSelect: (value: string) => void
  ) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedValue === value && styles.filterButtonActive]}
      onPress={() => onSelect(value)}
    >
      <Text style={[styles.filterButtonText, selectedValue === value && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Recipes</Text>
        <Text style={styles.subtitle}>
          {ingredients.length > 0 
            ? `Based on your ${ingredients.length} ingredient${ingredients.length !== 1 ? 's' : ''}`
            : 'Add ingredients to find recipes'
          }
        </Text>
      </View>

      {ingredients.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="restaurant-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No ingredients yet</Text>
          <Text style={styles.emptySubtext}>
            Go to the Ingredients tab to add what you have
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.modesContainer}>
            {renderModeButton('normal', 'Normal', 'checkmark-circle')}
            {renderModeButton('loose', 'Loose', 'add-circle')}
            {renderModeButton('surprise', 'Surprise', 'sparkles')}
          </View>

          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Cuisine:</Text>
            <FlatList
              data={cuisines}
              renderItem={({ item }) => renderFilterButton(
                item, 
                item === 'all' ? 'All' : item, 
                selectedCuisine, 
                setSelectedCuisine
              )}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtersList}
            />
          </View>

          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Dietary:</Text>
            <FlatList
              data={dietaryOptions}
              renderItem={({ item }) => renderFilterButton(
                item, 
                item === 'all' ? 'All' : item, 
                selectedDietary, 
                setSelectedDietary
              )}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtersList}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2f4f2f" />
              <Text style={styles.loadingText}>Finding recipes...</Text>
            </View>
          ) : (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>
                {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
              </Text>
              <FlatList
                data={recipes}
                renderItem={renderRecipe}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.recipesList}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF9EC',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2f4f2f',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 20,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  modesContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#2f4f2f',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2f4f2f',
    marginLeft: 4,
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f4f2f',
    marginBottom: 8,
  },
  filtersList: {
    maxHeight: 40,
  },
  filterButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#2f4f2f',
    borderColor: '#2f4f2f',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2f4f2f',
    marginBottom: 16,
  },
  recipesList: {
    paddingBottom: 20,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  recipeContent: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f4f2f',
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    marginBottom: 8,
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
  ingredientsInfo: {
    marginBottom: 12,
  },
  ingredientsText: {
    fontSize: 14,
    color: '#2f4f2f',
    fontWeight: '500',
  },
  missingText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
}); 