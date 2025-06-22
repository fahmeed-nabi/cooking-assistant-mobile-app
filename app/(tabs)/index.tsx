import { Ionicons } from '@expo/vector-icons';
import {
    doc,
    getDoc,
    setDoc
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from '../../services/firebase';

// Common ingredients for autocomplete
const COMMON_INGREDIENTS = [
  'chicken', 'beef', 'pork', 'salmon', 'shrimp', 'eggs', 'milk', 'cheese',
  'butter', 'olive oil', 'onion', 'garlic', 'tomato', 'potato', 'carrot',
  'broccoli', 'spinach', 'lettuce', 'bell pepper', 'mushroom', 'rice',
  'pasta', 'bread', 'flour', 'sugar', 'salt', 'pepper', 'basil', 'oregano',
  'lemon', 'lime', 'apple', 'banana', 'strawberry', 'blueberry', 'avocado',
  'cucumber', 'celery', 'corn', 'peas', 'beans', 'lentils', 'chickpeas',
  'almonds', 'walnuts', 'peanut butter', 'honey', 'maple syrup', 'vinegar',
  'soy sauce', 'ketchup', 'mustard', 'mayonnaise', 'sour cream', 'yogurt'
];

export default function IngredientsScreen() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        loadUserIngredients(user.uid);
      }
    });

    return unsubscribe;
  }, []);

  const loadUserIngredients = async (userId: string) => {
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists() && userDoc.data().ingredients) {
        setIngredients(userDoc.data().ingredients);
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
      Alert.alert('Error', 'Failed to load your ingredients');
    } finally {
      setLoading(false);
    }
  };

  const saveIngredients = async (newIngredients: string[]) => {
    if (!user) return;
    
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ingredients: newIngredients,
        updatedAt: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving ingredients:', error);
      Alert.alert('Error', 'Failed to save ingredients');
    }
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    if (text.length >= 2) {
      const filtered = COMMON_INGREDIENTS.filter(ingredient =>
        ingredient.toLowerCase().includes(text.toLowerCase()) &&
        !ingredients.includes(ingredient.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const addIngredient = async (ingredient: string) => {
    const normalizedIngredient = ingredient.toLowerCase().trim();
    
    if (normalizedIngredient.length < 2) {
      Alert.alert('Invalid Input', 'Ingredient name must be at least 2 characters');
      return;
    }

    if (ingredients.includes(normalizedIngredient)) {
      Alert.alert('Duplicate', 'This ingredient is already in your list');
      return;
    }

    const newIngredients = [...ingredients, normalizedIngredient];
    setIngredients(newIngredients);
    setInputValue('');
    setSuggestions([]);
    
    if (user) {
      await saveIngredients(newIngredients);
    }
  };

  const removeIngredient = async (ingredient: string) => {
    const newIngredients = ingredients.filter(i => i !== ingredient);
    setIngredients(newIngredients);
    
    if (user) {
      await saveIngredients(newIngredients);
    }
  };

  const renderIngredient = ({ item }: { item: string }) => (
    <View style={styles.ingredientItem}>
      <Text style={styles.ingredientText}>{item}</Text>
      <TouchableOpacity
        onPress={() => removeIngredient(item)}
        style={styles.removeButton}
      >
        <Ionicons name="close-circle" size={20} color="#ff6b6b" />
      </TouchableOpacity>
    </View>
  );

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => addIngredient(item)}
    >
      <Text style={styles.suggestionText}>{item}</Text>
      <Ionicons name="add" size={16} color="#2f4f2f" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f4f2f" />
        <Text style={styles.loadingText}>Loading your ingredients...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Ingredients</Text>
        <Text style={styles.subtitle}>
          {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''} • 
          {ingredients.length > 0 ? ' You can make recipes!' : ' Add some ingredients to get started'}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add an ingredient..."
          value={inputValue}
          onChangeText={handleInputChange}
          onSubmitEditing={() => addIngredient(inputValue)}
        />
        {inputValue.length > 0 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addIngredient(inputValue)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggestions:</Text>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsList}
          />
        </View>
      )}

      <View style={styles.ingredientsContainer}>
        <Text style={styles.sectionTitle}>Your Ingredients:</Text>
        {ingredients.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No ingredients yet</Text>
            <Text style={styles.emptySubtext}>Add ingredients to start finding recipes</Text>
          </View>
        ) : (
          <FlatList
            data={ingredients}
            renderItem={renderIngredient}
            keyExtractor={(item) => item}
            style={styles.ingredientsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#2f4f2f',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  suggestionsList: {
    maxHeight: 40,
  },
  suggestionItem: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#2f4f2f',
    marginRight: 4,
  },
  ingredientsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2f4f2f',
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  ingredientsList: {
    flex: 1,
  },
  ingredientItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ingredientText: {
    fontSize: 16,
    color: '#2f4f2f',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
}); 