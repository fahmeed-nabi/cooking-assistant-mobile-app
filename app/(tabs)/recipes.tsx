import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Recipe } from '../../services/aiService';

export default function RecipesScreen() {
  const params = useLocalSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'normal' | 'loose' | 'surprise'>('normal');
  const [ingredients, setIngredients] = useState<string[]>([]);

  useEffect(() => {
    console.log('📱 Recipes screen mounted with params:', params);
    if (params.recipes && params.mode && params.ingredients) {
      try {
        const parsedRecipes = JSON.parse(params.recipes as string);
        const parsedIngredients = JSON.parse(params.ingredients as string);
        const recipeMode = params.mode as 'normal' | 'loose' | 'surprise';
        
        console.log('📋 Parsed recipes:', parsedRecipes.length);
        console.log('🥕 Parsed ingredients:', parsedIngredients);
        
        setRecipes(parsedRecipes);
        setMode(recipeMode);
        setIngredients(parsedIngredients);
      } catch (error) {
        console.error('❌ Error parsing recipe params:', error);
        Alert.alert('Error', 'Failed to load recipes');
      }
    } else {
      console.log('⚠️ Missing params:', { recipes: !!params.recipes, mode: !!params.mode, ingredients: !!params.ingredients });
    }
  }, []);

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => {
        console.log(`Navigating to recipe with ID: ${item.id}`);
        console.log('Recipe data:', JSON.stringify(item, null, 2));
        try {
          router.push({
            pathname: '/recipe/[id]' as any,
            params: { id: item.id, recipe: JSON.stringify(item) }
          });
        } catch (error) {
          console.error('Navigation error:', error);
        }
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.recipeImage}
        resizeMode="cover"
      />
      
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.recipeMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{item.cookTime} min</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="restaurant-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{item.cuisine}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="star-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{item.difficulty}</Text>
          </View>
        </View>

        <View style={styles.dietaryTags}>
          {(item.dietary ?? []).map((diet, index) => (
            <View key={index} style={styles.dietaryTag}>
              <Text style={styles.dietaryText}>{diet}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Ionicons
          name={
            mode === 'normal'
              ? 'restaurant'
              : mode === 'loose'
              ? 'options'
              : 'sparkles'
          }
          size={32}
          color={
            mode === 'normal'
              ? '#007AFF'
              : mode === 'loose'
              ? '#007AFF'
              : '#FF6B6B'
          }
          style={{ marginBottom: 8 }}
        />
        <Text style={styles.headerTitle}>
          {mode === 'normal'
            ? 'Perfect Matches'
            : mode === 'loose'
            ? 'Similar Recipes'
            : 'Surprise Recipes'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {ingredients.length > 0 && (
        <View style={styles.ingredientsSummary}>
          <Text style={styles.ingredientsTitle}>Based on your ingredients:</Text>
          <View style={styles.ingredientsList}>
            {ingredients.slice(0, 5).map((ingredient, index) => (
              <View key={index} style={styles.ingredientChip}>
                <Ionicons name="ellipse" size={10} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.ingredientChipText}>{ingredient}</Text>
              </View>
            ))}
            {ingredients.length > 5 && (
              <Text style={styles.moreIngredients}>+{ingredients.length - 5} more</Text>
            )}
          </View>
        </View>
      )}

      {mode !== 'normal' && (
        <View style={styles.modeInfo}>
          <Ionicons
            name={mode === 'loose' ? 'options' : 'sparkles'}
            size={18}
            color={mode === 'loose' ? '#007AFF' : '#FF6B6B'}
          />
          <Text style={styles.modeInfoText}>
            {mode === 'loose'
              ? 'Showing recipes with similar ingredients'
              : 'AI-powered creative suggestions'}
          </Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          {mode === 'normal' ? 'Finding perfect matches...' :
           mode === 'loose' ? 'Finding similar recipes...' : 'Getting creative suggestions...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTop: {
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 4,
    textAlign: 'center',
  },
  ingredientsSummary: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'stretch',
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
    marginBottom: 4,
  },
  ingredientChipText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  moreIngredients: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  modeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f6fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'stretch',
  },
  modeInfoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
    flex: 1,
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 200,
  },
  recipeInfo: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    lineHeight: 24,
  },
  recipeMeta: {
    flexDirection: 'row',
    marginBottom: 12,
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
  dietaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dietaryTag: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  dietaryText: {
    fontSize: 12,
    color: '#2d5a2d',
    fontWeight: '500',
  },
}); 