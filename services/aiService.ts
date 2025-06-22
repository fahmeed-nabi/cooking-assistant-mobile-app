// AI/ML Service for intelligent recipe matching and recommendations
import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_CONFIG } from '../constants/apiConfig';
import { Recipe } from './recipeData';

const genAI = new GoogleGenerativeAI(API_CONFIG.GEMINI_API_KEY);

export interface RecipeMatch {
  recipe: Recipe;
  matchScore: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  substitutionSuggestions: string[];
}

export interface UserPreferences {
  cuisine: string[];
  dietary: string[];
  difficulty: string[];
  cookTime: number;
  spiceLevel: number;
  favoriteIngredients: string[];
  dislikedIngredients: string[];
}

class AIService {
  // Ingredient compatibility matrix (simplified version)
  private ingredientCompatibility: { [key: string]: string[] } = {
    'chicken': ['onion', 'garlic', 'herbs', 'lemon', 'olive oil', 'salt', 'pepper'],
    'beef': ['onion', 'garlic', 'herbs', 'red wine', 'butter', 'salt', 'pepper'],
    'salmon': ['lemon', 'dill', 'garlic', 'butter', 'olive oil', 'salt', 'pepper'],
    'tomato': ['basil', 'garlic', 'onion', 'olive oil', 'cheese', 'salt', 'pepper'],
    'pasta': ['tomato', 'garlic', 'olive oil', 'cheese', 'basil', 'salt', 'pepper'],
    'rice': ['onion', 'garlic', 'butter', 'herbs', 'salt', 'pepper'],
    'potato': ['onion', 'garlic', 'butter', 'herbs', 'salt', 'pepper', 'cheese'],
    'egg': ['cheese', 'milk', 'butter', 'salt', 'pepper', 'herbs'],
    'mushroom': ['garlic', 'onion', 'butter', 'herbs', 'salt', 'pepper', 'wine'],
    'spinach': ['garlic', 'onion', 'olive oil', 'lemon', 'salt', 'pepper', 'cheese'],
  };

  // Cuisine-specific ingredient preferences
  private cuisinePreferences: { [key: string]: string[] } = {
    'Italian': ['tomato', 'basil', 'olive oil', 'garlic', 'onion', 'parmesan', 'mozzarella', 'pasta'],
    'Mexican': ['tomato', 'onion', 'garlic', 'cilantro', 'lime', 'chili', 'tortilla', 'cheese'],
    'Asian': ['soy sauce', 'ginger', 'garlic', 'sesame oil', 'rice', 'noodles', 'vegetables'],
    'Indian': ['onion', 'garlic', 'ginger', 'turmeric', 'cumin', 'coriander', 'rice', 'lentils'],
    'Mediterranean': ['olive oil', 'garlic', 'lemon', 'herbs', 'tomato', 'cheese', 'vegetables'],
    'American': ['butter', 'onion', 'garlic', 'cheese', 'potato', 'bread', 'meat'],
    'French': ['butter', 'wine', 'garlic', 'onion', 'herbs', 'cheese', 'cream'],
    'Thai': ['coconut milk', 'fish sauce', 'lime', 'garlic', 'ginger', 'chili', 'rice'],
  };

  // Dietary restriction mappings
  private dietaryRestrictions: { [key: string]: { allowed: string[], forbidden: string[] } } = {
    'vegetarian': {
      allowed: ['vegetables', 'fruits', 'grains', 'dairy', 'eggs', 'nuts', 'seeds'],
      forbidden: ['meat', 'fish', 'poultry', 'bacon', 'sausage', 'ham']
    },
    'vegan': {
      allowed: ['vegetables', 'fruits', 'grains', 'nuts', 'seeds', 'legumes'],
      forbidden: ['meat', 'fish', 'poultry', 'dairy', 'eggs', 'honey']
    },
    'gluten-free': {
      allowed: ['rice', 'quinoa', 'corn', 'potato', 'vegetables', 'fruits', 'meat', 'fish'],
      forbidden: ['wheat', 'barley', 'rye', 'bread', 'pasta', 'flour']
    },
    'dairy-free': {
      allowed: ['vegetables', 'fruits', 'grains', 'meat', 'fish', 'nuts', 'seeds'],
      forbidden: ['milk', 'cheese', 'yogurt', 'butter', 'cream']
    },
    'keto': {
      allowed: ['meat', 'fish', 'eggs', 'dairy', 'vegetables', 'nuts', 'seeds'],
      forbidden: ['grains', 'sugar', 'fruits', 'potato', 'bread', 'pasta']
    },
    'paleo': {
      allowed: ['meat', 'fish', 'eggs', 'vegetables', 'fruits', 'nuts', 'seeds'],
      forbidden: ['grains', 'dairy', 'legumes', 'processed foods']
    }
  };

  // Intelligent recipe matching with AI scoring
  async matchRecipesByIngredients(
    recipes: Recipe[], 
    userIngredients: string[], 
    mode: 'normal' | 'loose' | 'surprise',
    userPreferences?: UserPreferences
  ): Promise<RecipeMatch[]> {
    const matches: RecipeMatch[] = [];

    for (const recipe of recipes) {
      const match = this.calculateRecipeMatch(recipe, userIngredients, mode, userPreferences);
      if (match.matchScore > 0) {
        matches.push(match);
      }
    }

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Apply mode-specific filtering
    switch (mode) {
      case 'normal':
        return matches.filter(match => match.matchScore >= 0.6);
      case 'loose':
        return matches.filter(match => match.matchScore >= 0.3);
      case 'surprise':
        return this.applySurpriseMeLogic(matches, userPreferences);
      default:
        return matches;
    }
  }

  // Calculate recipe match score using ML-like algorithm
  private calculateRecipeMatch(
    recipe: Recipe, 
    userIngredients: string[], 
    mode: 'normal' | 'loose' | 'surprise',
    userPreferences?: UserPreferences
  ): RecipeMatch {
    const recipeIngredients = this.normalizeIngredients(recipe.ingredients);
    const normalizedUserIngredients = this.normalizeIngredients(userIngredients);

    // Calculate ingredient overlap
    const matchedIngredients = recipeIngredients.filter(ingredient =>
      normalizedUserIngredients.some(userIngredient =>
        this.ingredientSimilarity(ingredient, userIngredient) > 0.7
      )
    );

    const missingIngredients = recipeIngredients.filter(ingredient =>
      !matchedIngredients.includes(ingredient)
    );

    // Calculate base match score
    let matchScore = matchedIngredients.length / recipeIngredients.length;

    // Apply compatibility bonus
    const compatibilityBonus = this.calculateCompatibilityBonus(matchedIngredients);
    matchScore += compatibilityBonus * 0.2;

    // Apply substitution bonus
    const substitutionBonus = this.calculateSubstitutionBonus(missingIngredients, normalizedUserIngredients);
    matchScore += substitutionBonus * 0.15;

    // Apply user preference bonus
    if (userPreferences) {
      const preferenceBonus = this.calculatePreferenceBonus(recipe, userPreferences);
      matchScore += preferenceBonus * 0.25;
    }

    // Apply cuisine preference bonus
    const cuisineBonus = this.calculateCuisineBonus(recipe, matchedIngredients);
    matchScore += cuisineBonus * 0.1;

    // Cap score at 1.0
    matchScore = Math.min(matchScore, 1.0);

    // Generate substitution suggestions
    const substitutionSuggestions = this.generateSubstitutionSuggestions(missingIngredients, normalizedUserIngredients);

    return {
      recipe,
      matchScore,
      matchedIngredients,
      missingIngredients,
      substitutionSuggestions
    };
  }

  // Normalize ingredients for better matching
  private normalizeIngredients(ingredients: string[]): string[] {
    return ingredients.map(ingredient => {
      // Remove measurements and common words
      let normalized = ingredient.toLowerCase()
        .replace(/\d+\s*(cup|tbsp|tsp|oz|g|kg|lb|ml|l|pound|gram|ounce|teaspoon|tablespoon|cup)/g, '')
        .replace(/\s+(of|and|or|with|to|for|in|on|at|by|from|into|during|including|until|against|among|throughout|despite|towards|upon|concerning|to|for|in|of|with|by)/g, ' ')
        .trim();

      // Remove common preparation words
      normalized = normalized.replace(/\s+(chopped|diced|minced|sliced|grated|shredded|crushed|ground|fresh|dried|frozen|canned|raw|cooked|roasted|grilled|fried|baked|steamed|boiled)/g, '');

      return normalized.trim();
    }).filter(ingredient => ingredient.length > 0);
  }

  // Calculate ingredient similarity using fuzzy matching
  private ingredientSimilarity(ingredient1: string, ingredient2: string): number {
    const words1 = ingredient1.split(' ');
    const words2 = ingredient2.split(' ');

    let maxSimilarity = 0;
    for (const word1 of words1) {
      for (const word2 of words2) {
        const similarity = this.levenshteinSimilarity(word1, word2);
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
    }

    return maxSimilarity;
  }

  // Levenshtein distance similarity
  private levenshteinSimilarity(str1: string, str2: string): number {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const distance = matrix[len2][len1];
    const maxLength = Math.max(len1, len2);
    return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
  }

  // Calculate compatibility bonus based on ingredient pairs
  private calculateCompatibilityBonus(matchedIngredients: string[]): number {
    let bonus = 0;
    let pairs = 0;

    for (let i = 0; i < matchedIngredients.length; i++) {
      for (let j = i + 1; j < matchedIngredients.length; j++) {
        const ingredient1 = matchedIngredients[i];
        const ingredient2 = matchedIngredients[j];

        // Check if ingredients are compatible
        if (this.ingredientCompatibility[ingredient1]?.includes(ingredient2) ||
            this.ingredientCompatibility[ingredient2]?.includes(ingredient1)) {
          bonus += 1;
        }
        pairs++;
      }
    }

    return pairs > 0 ? bonus / pairs : 0;
  }

  // Calculate substitution bonus
  private calculateSubstitutionBonus(missingIngredients: string[], userIngredients: string[]): number {
    let bonus = 0;
    let substitutions = 0;

    for (const missing of missingIngredients) {
      const substitution = this.findBestSubstitution(missing, userIngredients);
      if (substitution) {
        bonus += 0.5; // Partial credit for substitutions
        substitutions++;
      }
    }

    return substitutions > 0 ? bonus / substitutions : 0;
  }

  // Find best substitution for missing ingredient
  private findBestSubstitution(missingIngredient: string, userIngredients: string[]): string | null {
    const substitutions: { [key: string]: string[] } = {
      'milk': ['almond milk', 'soy milk', 'oat milk', 'coconut milk'],
      'butter': ['olive oil', 'coconut oil', 'margarine'],
      'eggs': ['flax eggs', 'chia eggs', 'banana'],
      'flour': ['almond flour', 'coconut flour', 'oat flour'],
      'sugar': ['honey', 'maple syrup', 'stevia'],
      'cheese': ['nutritional yeast', 'cashew cheese'],
      'meat': ['tofu', 'tempeh', 'seitan', 'beans'],
      'pasta': ['zucchini noodles', 'spaghetti squash', 'rice'],
      'rice': ['quinoa', 'cauliflower rice', 'couscous'],
      'bread': ['lettuce wraps', 'tortillas', 'collard greens'],
    };

    for (const [original, substitutes] of Object.entries(substitutions)) {
      if (this.ingredientSimilarity(missingIngredient, original) > 0.7) {
        for (const substitute of substitutes) {
          if (userIngredients.some(ingredient => 
            this.ingredientSimilarity(ingredient, substitute) > 0.7
          )) {
            return substitute;
          }
        }
      }
    }

    return null;
  }

  // Calculate user preference bonus
  private calculatePreferenceBonus(recipe: Recipe, preferences: UserPreferences): number {
    let bonus = 0;

    // Cuisine preference
    if (preferences.cuisine.includes(recipe.cuisine)) {
      bonus += 0.3;
    }

    // Dietary preference
    const dietaryMatch = preferences.dietary.some(diet => 
      recipe.dietary.includes(diet)
    );
    if (dietaryMatch) {
      bonus += 0.3;
    }

    // Difficulty preference
    if (preferences.difficulty.includes(recipe.difficulty)) {
      bonus += 0.2;
    }

    // Cook time preference
    if (recipe.cookTime <= preferences.cookTime) {
      bonus += 0.2;
    }

    // Favorite ingredients
    const favoriteMatches = preferences.favoriteIngredients.filter(favorite =>
      recipe.ingredients.some(ingredient =>
        this.ingredientSimilarity(ingredient, favorite) > 0.7
      )
    ).length;
    bonus += (favoriteMatches / preferences.favoriteIngredients.length) * 0.2;

    return bonus;
  }

  // Calculate cuisine bonus
  private calculateCuisineBonus(recipe: Recipe, matchedIngredients: string[]): number {
    const cuisinePrefs = this.cuisinePreferences[recipe.cuisine] || [];
    const matches = matchedIngredients.filter(ingredient =>
      cuisinePrefs.some(pref => this.ingredientSimilarity(ingredient, pref) > 0.7)
    );

    return cuisinePrefs.length > 0 ? matches.length / cuisinePrefs.length : 0;
  }

  // Generate substitution suggestions
  private generateSubstitutionSuggestions(missingIngredients: string[], userIngredients: string[]): string[] {
    const suggestions: string[] = [];

    for (const missing of missingIngredients) {
      const substitution = this.findBestSubstitution(missing, userIngredients);
      if (substitution) {
        suggestions.push(`Use ${substitution} instead of ${missing}`);
      }
    }

    return suggestions;
  }

  // Apply surprise me logic for creative suggestions
  private applySurpriseMeLogic(matches: RecipeMatch[], userPreferences?: UserPreferences): RecipeMatch[] {
    // Add randomness to scores for surprise factor
    const surprisedMatches = matches.map(match => ({
      ...match,
      matchScore: match.matchScore * (0.7 + Math.random() * 0.6) // 70-130% of original score
    }));

    // Sort by new surprise score
    surprisedMatches.sort((a, b) => b.matchScore - a.matchScore);

    // Add some completely random recipes if user preferences allow
    if (userPreferences && Math.random() > 0.7) {
      // This would integrate with the API service to get random recipes
      // For now, we'll just return the surprised matches
    }

    return surprisedMatches;
  }

  // Get personalized recommendations based on user history
  async getPersonalizedRecommendations(
    userHistory: Recipe[],
    userPreferences: UserPreferences,
    limit: number = 10
  ): Promise<Recipe[]> {
    // Analyze user history to build preference profile
    const preferenceProfile = this.buildPreferenceProfile(userHistory);
    
    // Combine with explicit preferences
    const combinedPreferences = this.combinePreferences(preferenceProfile, userPreferences);
    
    // This would integrate with the API service to get recommendations
    // For now, return empty array as placeholder
    return [];
  }

  // Build preference profile from user history
  private buildPreferenceProfile(userHistory: Recipe[]): UserPreferences {
    const cuisines = new Map<string, number>();
    const difficulties = new Map<string, number>();
    const cookTimes: number[] = [];
    const ingredients = new Map<string, number>();

    userHistory.forEach(recipe => {
      // Count cuisines
      cuisines.set(recipe.cuisine, (cuisines.get(recipe.cuisine) || 0) + 1);
      
      // Count difficulties
      difficulties.set(recipe.difficulty, (difficulties.get(recipe.difficulty) || 0) + 1);
      
      // Collect cook times
      cookTimes.push(recipe.cookTime);
      
      // Count ingredients
      recipe.ingredients.forEach(ingredient => {
        const normalized = this.normalizeIngredients([ingredient])[0];
        ingredients.set(normalized, (ingredients.get(normalized) || 0) + 1);
      });
    });

    // Get top preferences
    const topCuisines = Array.from(cuisines.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cuisine]) => cuisine);

    const topDifficulties = Array.from(difficulties.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([difficulty]) => difficulty);

    const avgCookTime = cookTimes.length > 0 ? 
      cookTimes.reduce((sum, time) => sum + time, 0) / cookTimes.length : 30;

    const favoriteIngredients = Array.from(ingredients.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ingredient]) => ingredient);

    return {
      cuisine: topCuisines,
      dietary: [],
      difficulty: topDifficulties,
      cookTime: Math.round(avgCookTime),
      spiceLevel: 5,
      favoriteIngredients,
      dislikedIngredients: []
    };
  }

  // Combine implicit and explicit preferences
  private combinePreferences(implicit: UserPreferences, explicit: UserPreferences): UserPreferences {
    return {
      cuisine: [...new Set([...implicit.cuisine, ...explicit.cuisine])],
      dietary: explicit.dietary, // Explicit dietary preferences take precedence
      difficulty: [...new Set([...implicit.difficulty, ...explicit.difficulty])],
      cookTime: Math.min(implicit.cookTime, explicit.cookTime),
      spiceLevel: explicit.spiceLevel,
      favoriteIngredients: [...new Set([...implicit.favoriteIngredients, ...explicit.favoriteIngredients])],
      dislikedIngredients: explicit.dislikedIngredients
    };
  }

  async generateRecipe(ingredients: string[]): Promise<Recipe | null> {
    if (!API_CONFIG.GEMINI_API_KEY || API_CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
      console.log('🤖 Gemini API key not found, returning null');
      return null;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = this.createRecipePrompt(ingredients);

    try {
      console.log('🧠 Calling Gemini API...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini response received');
      
      const recipeJson = this.parseRecipeJson(text);
      
      // Add a unique ID and default image to the AI-generated recipe
      recipeJson.id = `ai-${Date.now()}`;
      recipeJson.image = `https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?w=400`; // Default image

      return recipeJson as Recipe;
    } catch (error) {
      console.error('❌ Error generating recipe with AI:', error);
      return null;
    }
  }

  private parseRecipeJson(text: string): any {
    console.log('📄 Parsing response text:', text);
    try {
      // Find the start and end of the JSON block
      const startIndex = text.indexOf('```json');
      const endIndex = text.lastIndexOf('```');

      if (startIndex === -1 || endIndex === -1) {
        throw new Error('Could not find JSON block in response');
      }

      // Extract and parse the JSON string
      const jsonString = text.substring(startIndex + 7, endIndex).trim();
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('❌ Error parsing recipe JSON:', error);
      throw new Error('Failed to parse AI-generated recipe');
    }
  }

  private createRecipePrompt(ingredients: string[]): string {
    return `
      You are a creative chef and culinary expert. Your task is to invent a unique and delicious recipe based on a given list of ingredients.

      Ingredients provided: ${ingredients.join(', ')}

      Your response MUST be a single, valid JSON object that follows this exact structure:
      \`\`\`json
      {
        "title": "A creative and appealing recipe title",
        "ingredients": [
          "List of all ingredients required, including amounts (e.g., '1 cup flour', '2 large eggs'). You can include ingredients not from the provided list if necessary.",
          "..."
        ],
        "instructions": [
          "A clear, step-by-step instruction for preparing the recipe.",
          "Another step.",
          "..."
        ],
        "cookTime": "The total cook time in minutes (e.g., 30)",
        "cuisine": "The most appropriate cuisine (e.g., 'Italian', 'Fusion')",
        "dietary": ["A list of dietary characteristics if applicable (e.g., 'vegan', 'gluten-free')"],
        "difficulty": "The difficulty of the recipe ('Easy', 'Medium', or 'Hard')"
      }
      \`\`\`

      Do not include any text, explanation, or markdown formatting before or after the JSON object. Your entire response must be only the JSON.
    `;
  }
}

export const aiService = new AIService(); 