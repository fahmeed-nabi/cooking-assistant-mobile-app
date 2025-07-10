import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
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
import { auth, db } from '../../services/firebase';

export default function SavedRecipesScreen() {
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]); // Changed type to any[] as Recipe is removed
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadSavedRecipes();
  }, []);

  const loadSavedRecipes = async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const savedRecipeIds = userDoc.data().savedRecipes || [];
        // Fetch actual recipe data from Firebase or a separate data source if needed
        // For now, we'll just use the IDs to display a placeholder
        const recipes = savedRecipeIds.map(id => ({
          id,
          title: 'Recipe Title Placeholder',
          image: 'https://via.placeholder.com/150',
          cookTime: 30,
          cuisine: 'Cuisine Placeholder',
          dietary: ['Dietary Placeholder'],
        }));
        setSavedRecipes(recipes);
      }
    } catch (error) {
      console.error('Error loading saved recipes:', error);
      Alert.alert('Error', 'Failed to load saved recipes');
    } finally {
      setLoading(false);
    }
  };

  const renderRecipe = ({ item }: { item: any }) => ( // Changed type to any
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
        <Text style={styles.title}>Saved Recipes</Text>
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
}); 