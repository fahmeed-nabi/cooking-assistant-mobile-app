// API Service for external recipe and ingredient databases
import { API_CONFIG, API_ENDPOINTS } from '../constants/apiConfig';
import { aiService } from './aiService';
import { MOCK_RECIPES, Recipe, filterRecipesByIngredients } from './recipeData';

// API Configuration
const SPOONACULAR_API_KEY = API_CONFIG.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = API_ENDPOINTS.SPOONACULAR.BASE_URL;

// USDA Food Database API (free, no key required)
const USDA_BASE_URL = API_ENDPOINTS.USDA.BASE_URL;

// Fallback to TheMealDB (free, no key required)
const MEALDB_BASE_URL = API_ENDPOINTS.MEALDB.BASE_URL;

export interface Ingredient {
  id: string;
  name: string;
  category?: string;
  image?: string;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

export interface APIIngredient {
  id: number;
  name: string;
  image: string;
  aisle?: string;
  category?: string;
}

export interface APIRecipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  cuisines: string[];
  diets: string[];
  dishTypes: string[];
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
  extendedIngredients?: Array<{ original: string; name:string }>;
  analyzedInstructions?: Array<{ name: string; steps: Array<{ number: number; step: string }> }>;
  instructions?: string;
}

export interface SearchParams {
  query?: string;
  cuisine?: string;
  diet?: string;
  intolerances?: string[];
  maxReadyTime?: number;
  offset?: number;
  number?: number;
}

class APIService {
  // Search ingredients using Spoonacular API
  async searchIngredients(query: string, number: number = API_CONFIG.MAX_INGREDIENT_SEARCH_RESULTS): Promise<Ingredient[]> {
    try {
      if (!SPOONACULAR_API_KEY || SPOONACULAR_API_KEY === 'YOUR_SPOONACULAR_API_KEY') {
        // Fallback to local search if no API key
        return this.searchIngredientsLocal(query, number);
      }

      const response = await fetch(
        `${SPOONACULAR_BASE_URL}${API_ENDPOINTS.SPOONACULAR.INGREDIENTS_SEARCH}?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(query)}&number=${number}&addChildren=true`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.results.map((item: APIIngredient) => ({
        id: item.id.toString(),
        name: item.name,
        category: item.aisle,
        image: item.image,
      }));
    } catch (error) {
      console.error('Error searching ingredients:', error);
      // Fallback to local search
      return this.searchIngredientsLocal(query, number);
    }
  }

  // Local ingredient search (fallback)
  private searchIngredientsLocal(query: string, number: number = 10): Ingredient[] {
    const COMMON_INGREDIENTS = [
      // ... (keeping the expanded list as fallback)
      'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'bacon', 'ham', 'sausage', 'hot dog',
      'salmon', 'tuna', 'cod', 'shrimp', 'crab', 'lobster', 'mussels', 'clams', 'tilapia', 'mackerel',
      'eggs', 'tofu', 'tempeh', 'seitan', 'chickpeas', 'lentils', 'black beans', 'kidney beans', 'pinto beans', 'navy beans',
      'milk', 'cheese', 'cheddar', 'mozzarella', 'parmesan', 'feta', 'cream cheese', 'cottage cheese', 'yogurt', 'sour cream',
      'butter', 'margarine', 'heavy cream', 'half and half', 'buttermilk', 'almond milk', 'soy milk', 'oat milk', 'coconut milk',
      'olive oil', 'vegetable oil', 'canola oil', 'coconut oil', 'sesame oil', 'avocado oil', 'ghee', 'lard',
      'onion', 'garlic', 'ginger', 'shallot', 'leek', 'scallion', 'chive',
      'tomato', 'cherry tomato', 'sun-dried tomato', 'tomato paste', 'tomato sauce',
      'potato', 'sweet potato', 'yam', 'russet potato', 'red potato', 'fingerling potato',
      'carrot', 'celery', 'bell pepper', 'jalapeño', 'habanero', 'poblano', 'anaheim pepper',
      'broccoli', 'cauliflower', 'brussels sprouts', 'cabbage', 'red cabbage', 'sauerkraut',
      'spinach', 'kale', 'lettuce', 'romaine', 'iceberg lettuce', 'arugula', 'watercress',
      'mushroom', 'button mushroom', 'portobello', 'shiitake', 'oyster mushroom', 'cremini',
      'cucumber', 'zucchini', 'yellow squash', 'eggplant', 'asparagus', 'artichoke',
      'corn', 'peas', 'green beans', 'wax beans', 'snow peas', 'sugar snap peas',
      'beet', 'turnip', 'radish', 'daikon', 'parsnip', 'rutabaga',
      'pumpkin', 'butternut squash', 'acorn squash', 'spaghetti squash', 'zucchini',
      'rice', 'white rice', 'brown rice', 'basmati rice', 'jasmine rice', 'wild rice', 'arborio rice',
      'pasta', 'spaghetti', 'penne', 'rigatoni', 'fettuccine', 'linguine', 'lasagna', 'macaroni',
      'bread', 'white bread', 'whole wheat bread', 'sourdough', 'rye bread', 'pita bread', 'tortilla',
      'flour', 'all-purpose flour', 'whole wheat flour', 'bread flour', 'cake flour', 'almond flour', 'coconut flour',
      'quinoa', 'couscous', 'bulgur', 'farro', 'barley', 'oats', 'oatmeal', 'steel cut oats',
      'apple', 'banana', 'orange', 'lemon', 'lime', 'grapefruit', 'tangerine', 'clementine',
      'strawberry', 'blueberry', 'raspberry', 'blackberry', 'cranberry', 'gooseberry',
      'grape', 'raisin', 'prune', 'date', 'fig', 'apricot', 'peach', 'nectarine', 'plum',
      'pineapple', 'mango', 'papaya', 'kiwi', 'dragon fruit', 'passion fruit',
      'avocado', 'coconut', 'pomegranate', 'persimmon', 'guava', 'lychee',
      'pear', 'quince', 'cherry', 'olive', 'capers',
      'almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'macadamia', 'hazelnut', 'pine nut',
      'peanut', 'peanut butter', 'almond butter', 'cashew butter', 'sunflower seed', 'pumpkin seed',
      'chia seed', 'flax seed', 'sesame seed', 'poppy seed', 'hemp seed',
      'sugar', 'brown sugar', 'powdered sugar', 'honey', 'maple syrup', 'agave nectar', 'stevia',
      'molasses', 'corn syrup', 'simple syrup', 'confectioners sugar',
      'salt', 'pepper', 'black pepper', 'white pepper', 'cayenne pepper', 'red pepper flakes',
      'vinegar', 'white vinegar', 'apple cider vinegar', 'balsamic vinegar', 'red wine vinegar', 'rice vinegar',
      'soy sauce', 'tamari', 'fish sauce', 'oyster sauce', 'hoisin sauce', 'sriracha', 'hot sauce',
      'ketchup', 'mustard', 'dijon mustard', 'yellow mustard', 'whole grain mustard',
      'mayonnaise', 'aioli', 'ranch dressing', 'blue cheese dressing', 'vinaigrette',
      'worcestershire sauce', 'tabasco', 'chili sauce', 'barbecue sauce', 'teriyaki sauce',
      'basil', 'oregano', 'thyme', 'rosemary', 'sage', 'marjoram', 'bay leaf', 'tarragon',
      'parsley', 'cilantro', 'dill', 'mint', 'chive', 'green onion', 'scallion',
      'cumin', 'coriander', 'cardamom', 'cinnamon', 'nutmeg', 'allspice', 'clove',
      'turmeric', 'curry powder', 'garam masala', 'paprika', 'smoked paprika', 'chili powder',
      'onion powder', 'garlic powder', 'celery salt', 'seasoning salt', 'cajun seasoning',
      'baking soda', 'baking powder', 'yeast', 'active dry yeast', 'instant yeast',
      'vanilla extract', 'almond extract', 'lemon extract', 'orange extract',
      'cocoa powder', 'chocolate chips', 'dark chocolate', 'milk chocolate', 'white chocolate',
      'cornstarch', 'arrowroot', 'gelatin', 'agar agar', 'xanthan gum',
      'canned tomato', 'canned beans', 'canned corn', 'canned tuna', 'canned salmon',
      'pickles', 'pickled jalapeños', 'olives', 'capers', 'sun-dried tomatoes',
      'jam', 'jelly', 'preserves', 'marmalade', 'fruit preserves',
      'chicken broth', 'beef broth', 'vegetable broth', 'fish stock', 'mushroom broth',
      'breadcrumbs', 'panko', 'crackers', 'chips', 'popcorn', 'cereal', 'granola',
      'noodles', 'ramen', 'udon', 'soba', 'rice noodles', 'egg noodles',
      'salsa', 'guacamole', 'hummus', 'tzatziki', 'pesto', 'chimichurri',
      'cream of mushroom soup', 'cream of chicken soup', 'tomato soup',
      'bacon bits', 'croutons', 'sunflower seeds', 'pumpkin seeds',
      'dried fruit', 'raisins', 'cranberries', 'apricots', 'prunes', 'dates',
      'coconut flakes', 'shredded coconut', 'coconut milk', 'coconut cream'
    ];

    const filtered = COMMON_INGREDIENTS
      .filter(ingredient => 
        ingredient.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, number);

    return filtered.map((name, index) => ({
      id: index.toString(),
      name,
      category: 'General',
    }));
  }

  // Search recipes using Spoonacular API
  async searchRecipes(params: SearchParams): Promise<Recipe[]> {
    try {
      if (!SPOONACULAR_API_KEY || SPOONACULAR_API_KEY === 'YOUR_SPOONACULAR_API_KEY') {
        // Fallback to TheMealDB if no Spoonacular key
        return this.searchRecipesFromMealDB(params);
      }

      const queryParams = new URLSearchParams();
      if (params.query) queryParams.append('query', params.query);
      if (params.cuisine) queryParams.append('cuisine', params.cuisine);
      if (params.diet) queryParams.append('diet', params.diet);
      if (params.maxReadyTime) queryParams.append('maxReadyTime', params.maxReadyTime.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      queryParams.append('number', (params.number || API_CONFIG.MAX_RECIPE_SEARCH_RESULTS).toString());
      queryParams.append('apiKey', SPOONACULAR_API_KEY);

      const response = await fetch(
        `${SPOONACULAR_BASE_URL}${API_ENDPOINTS.SPOONACULAR.RECIPES_SEARCH}?${queryParams}`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.results.map((recipe: APIRecipe) => this.transformAPIRecipe(recipe));
    } catch (error) {
      console.error('Error searching recipes:', error);
      // Fallback to TheMealDB
      return this.searchRecipesFromMealDB(params);
    }
  }

  // Search recipes by ingredients (AI-powered matching)
  async searchRecipesByIngredients(
    ingredients: string[],
    mode: 'normal' | 'loose' | 'surprise',
    cuisines: string[] = [],
    dietary: string[] = []
  ): Promise<Recipe[]> {
    console.log('🔍 Searching recipes by ingredients:', { ingredients, mode, cuisines, dietary });

    if (mode === 'surprise') {
      // Pass cuisines and dietary to AI
      const aiRecipe = await aiService.generateRecipe(ingredients, cuisines, dietary);
      if (aiRecipe) {
        return [aiRecipe];
      } else {
        return this.searchRecipesByIngredientsLocal(ingredients, mode, cuisines, dietary);
      }
    }

    try {
      if (!SPOONACULAR_API_KEY || SPOONACULAR_API_KEY === 'YOUR_SPOONACULAR_API_KEY') {
        return this.searchRecipesByIngredientsLocal(ingredients, mode, cuisines, dietary);
      }

      // Add cuisines and dietary to API call if present
      const ingredientsString = ingredients.join(',');
      const ranking = mode === 'normal' ? 1 : mode === 'loose' ? 2 : 3;
      const ignorePantry = mode === 'normal' ? 'true' : 'false';
      let url = `${SPOONACULAR_BASE_URL}${API_ENDPOINTS.SPOONACULAR.RECIPES_BY_INGREDIENTS}?apiKey=${SPOONACULAR_API_KEY}&ingredients=${encodeURIComponent(ingredientsString)}&ranking=${ranking}&ignorePantry=${ignorePantry}&number=${API_CONFIG.MAX_RECIPE_SEARCH_RESULTS}`;

      // Spoonacular's by-ingredients endpoint doesn't support cuisine/diet directly, so filter after fetching
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const detailedRecipes = await Promise.all(
        data.map(async (recipe: any) => {
          try {
            const detailResponse = await fetch(
              `${SPOONACULAR_BASE_URL}${API_ENDPOINTS.SPOONACULAR.RECIPE_INFO.replace('{id}', recipe.id)}?apiKey=${SPOONACULAR_API_KEY}`
            );
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              return this.transformAPIRecipe(detailData);
            }
          } catch (error) {
            console.error('Error fetching recipe details:', error);
          }
          return null;
        })
      );

      // Filter by cuisine and dietary after fetching details
      const validRecipes = (detailedRecipes.filter(recipe => recipe !== null) as Recipe[])
      .filter(recipe => {
        const cuisineMatch =
          cuisines.length === 0 ||
          cuisines.map(c => c.toLowerCase()).includes(recipe.cuisine.toLowerCase());
        const dietaryMatch =
          dietary.length === 0 ||
          dietary.every(diet =>
            recipe.dietary.map(d => d.toLowerCase()).includes(diet.toLowerCase())
          );
        return cuisineMatch && dietaryMatch;
      });

      return validRecipes;
    } catch (error) {
      return this.searchRecipesByIngredientsLocal(ingredients, mode, cuisines, dietary);
    }
  }

  // Local recipe matching (fallback)
  private searchRecipesByIngredientsLocal(
    ingredients: string[],
    mode: 'normal' | 'loose' | 'surprise',
    cuisines: string[] = [],
    dietary: string[] = []
  ): Recipe[] {
    const recipes = filterRecipesByIngredients(MOCK_RECIPES, ingredients, mode);
    console.log('📋 Found local recipes before filter:', recipes.length);

    // ...inside searchRecipesByIngredientsLocal...

    const filtered = recipes.filter(recipe => {
      const recipeCuisine = (recipe.cuisine || '').toLowerCase();
      const isInternational = recipeCuisine === 'international';

      const cuisineMatch =
        cuisines.length === 0 ||
        isInternational ||
        cuisines.map(c => c.toLowerCase()).includes(recipeCuisine);

      const dietaryMatch =
        dietary.length === 0 ||
        dietary.every(diet =>
          (recipe.dietary || []).map(d => d.toLowerCase()).includes(diet.toLowerCase())
        );

      if (!cuisineMatch || !dietaryMatch) {
        console.log('Filtered out:', recipe.title, {cuisine: recipe.cuisine, dietary: recipe.dietary});
      }
      return cuisineMatch && dietaryMatch;
    });
    console.log('📋 Found local recipes after filter:', filtered.length);
    return filtered;
  }

  // Transform Spoonacular API recipe to our Recipe format
  private transformAPIRecipe(apiRecipe: APIRecipe): Recipe {
    const ingredients = apiRecipe.extendedIngredients?.map(ing => ing.original) || [];
    
    let instructions: string[] = [];
    if (apiRecipe.analyzedInstructions && apiRecipe.analyzedInstructions.length > 0) {
      // Flatten all steps from all instruction sections
      instructions = apiRecipe.analyzedInstructions.flatMap(section => section.steps.map(step => step.step));
    } else if (typeof apiRecipe.instructions === 'string') {
      // Basic parsing for string instructions, removing HTML tags
      instructions = apiRecipe.instructions.replace(/<[^>]*>/g, '').split('\\n').filter((i: string) => i.trim() !== '');
    }

    return {
      id: apiRecipe.id.toString(),
      title: apiRecipe.title,
      image: apiRecipe.image,
      ingredients,
      instructions,
      cookTime: apiRecipe.readyInMinutes || 30,
      cuisine: apiRecipe.cuisines?.[0] || 'International',
      dietary: apiRecipe.diets || [],
      difficulty: this.calculateDifficulty(apiRecipe.readyInMinutes || 30),
    };
  }

  // Transform TheMealDB recipe to our Recipe format
  private transformMealDBRecipe(meal: any): Recipe {
    const ingredients = [];
    const instructions = meal.strInstructions ? meal.strInstructions.split('\n').filter((step: string) => step.trim()) : [];

    // Extract ingredients from TheMealDB format
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push(`${measure ? measure.trim() + ' ' : ''}${ingredient.trim()}`);
      }
    }

    return {
      id: meal.idMeal,
      title: meal.strMeal,
      image: meal.strMealThumb,
      ingredients,
      instructions,
      cookTime: 30, // TheMealDB doesn't provide cook time
      cuisine: meal.strArea || 'International',
      dietary: [], // TheMealDB doesn't provide dietary info
      difficulty: 'Medium',
    };
  }

  // Calculate difficulty based on cook time
  private calculateDifficulty(cookTime: number): string {
    if (cookTime <= 15) return 'Easy';
    if (cookTime <= 45) return 'Medium';
    return 'Hard';
  }

  // Search recipes using TheMealDB as a fallback
  private async searchRecipesFromMealDB(params: SearchParams): Promise<Recipe[]> {
    try {
      let url = `${MEALDB_BASE_URL}/search.php?s=${encodeURIComponent(params.query || '')}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`MealDB API request failed: ${response.status}`);
      }
      const data = await response.json();
      if (!data.meals) return [];
      return data.meals.map((meal: any) => this.transformMealDBRecipe(meal));
    } catch (error) {
      console.error('Error searching recipes from MealDB:', error);
      return [];
    }
  }

  // Get recipe details by ID
  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      if (!SPOONACULAR_API_KEY || SPOONACULAR_API_KEY === 'YOUR_SPOONACULAR_API_KEY') {
        // Fallback to local recipe
        const { getRecipeById } = await import('./recipeData');
        const recipe = getRecipeById(id);
        return recipe || null;
      }

      const response = await fetch(
        `${SPOONACULAR_BASE_URL}${API_ENDPOINTS.SPOONACULAR.RECIPE_INFO.replace('{id}', id)}?apiKey=${SPOONACULAR_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformAPIRecipe(data);
    } catch (error) {
      console.error('Error fetching recipe by ID:', error);
      // Fallback to local recipe
      try {
        const { getRecipeById } = await import('./recipeData');
        const recipe = getRecipeById(id);
        return recipe || null;
      } catch (importError) {
        console.error('Error importing recipe data:', importError);
        return null;
      }
    }
  }
}

export const apiService = new APIService(); 