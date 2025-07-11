import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, cleanupSavedRecipes, getSavedRecipesFromFirebase, removeRecipeFromFirebase } from '../../services/firebase';

export default function SavedRecipesScreen() {
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Load recipes when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadSavedRecipes();
    }, [])
  );

  const loadSavedRecipes = async () => {
    console.log('🔄 Loading saved recipes...');
    const user = auth.currentUser;
    if (!user) {
      console.log('❌ No user logged in');
      setLoading(false);
      return;
    }

    console.log('👤 User is logged in:', user.uid);

    try {
      const recipes = await getSavedRecipesFromFirebase();
      console.log('📊 Loaded recipes from Firebase:', recipes.length, recipes);
      setSavedRecipes(recipes);
    } catch (error) {
      console.error('❌ Error loading saved recipes:', error);
      Alert.alert('Error', 'Failed to load saved recipes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSavedRecipes();
    setRefreshing(false);
  };

  const handleCleanup = async () => {
    Alert.alert(
      'Clean Up Saved Recipes',
      'This will remove any saved recipes that no longer exist. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clean Up', 
          onPress: async () => {
            setLoading(true);
            await cleanupSavedRecipes();
            await loadSavedRecipes();
            setLoading(false);
          }
        }
      ]
    );
  };

  const isPlaceholderRecipe = (recipe: any) => {
    return recipe.title.startsWith('Recipe ') && recipe.ingredients.includes('Missing data');
  };

  const handleRecipePress = (recipe: any) => {
    if (isPlaceholderRecipe(recipe)) {
      Alert.alert(
        'Recipe Not Available',
        'This recipe is no longer available. Would you like to remove it from your saved recipes?',
        [
          { text: 'Keep', style: 'cancel' },
          { 
            text: 'Remove', 
            onPress: () => removeInvalidRecipe(recipe.id)
          }
        ]
      );
      return;
    }
    
    // Navigate to recipe detail with full recipe data
    router.push(`/recipe/${recipe.id}?recipe=${encodeURIComponent(JSON.stringify(recipe))}`);
  };

  const removeInvalidRecipe = async (recipeId: string) => {
    try {
      const success = await removeRecipeFromFirebase(recipeId);
      if (success) {
        await loadSavedRecipes();
        Alert.alert('Success', 'Invalid recipe removed from your saved list');
      } else {
        Alert.alert('Error', 'Failed to remove invalid recipe');
      }
    } catch (error) {
      console.error('Error removing invalid recipe:', error);
      Alert.alert('Error', 'Failed to remove invalid recipe');
    }
  };

  const renderRecipe = ({ item }: { item: any }) => {
    const isPlaceholder = isPlaceholderRecipe(item);
    
    return (
      <TouchableOpacity
        style={[styles.recipeCard, isPlaceholder && styles.placeholderCard]}
        onPress={() => handleRecipePress(item)}
      >
        {isPlaceholder && (
          <View style={styles.placeholderBadge}>
            <Ionicons name="warning-outline" size={12} color="#ff6b6b" />
            <Text style={styles.placeholderBadgeText}>Unavailable</Text>
          </View>
        )}
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

          <View style={styles.tags}>
              {item.dietary.map((diet: string) => (
              <View key={diet} style={styles.tag}>
                <Text style={styles.tagText}>{diet}</Text>
              </View>
              ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f4f2f" />
        <Text style={styles.loadingText}>Loading saved recipes...</Text>
      </View>
    );
  }

  if (!auth.currentUser) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="person-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Sign in to save recipes</Text>
        <Text style={styles.emptySubtext}>
          Create an account to save your favorite recipes
        </Text>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (savedRecipes.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="heart-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No saved recipes yet</Text>
        <Text style={styles.emptySubtext}>
          Save recipes you like to find them here later
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push('/(tabs)/recipes')}
        >
          <Text style={styles.browseButtonText}>Browse Recipes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Saved Recipes</Text>
          <TouchableOpacity
            style={styles.cleanupButton}
            onPress={handleCleanup}
          >
            <Ionicons name="refresh" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          {savedRecipes.length} recipe{savedRecipes.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      <FlatList
        data={savedRecipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.recipesList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2f4f2f']}
            tintColor="#2f4f2f"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF9EC',
    padding: 16,
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
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: '#2f4f2f',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  browseButton: {
    backgroundColor: '#2f4f2f',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cleanupButton: {
    padding: 8,
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
  placeholderCard: {
    opacity: 0.7,
    borderColor: '#ff6b6b',
    borderWidth: 1,
  },
  placeholderBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  placeholderBadgeText: {
    fontSize: 10,
    color: '#ff6b6b',
    marginLeft: 4,
    fontWeight: '600',
  },
});