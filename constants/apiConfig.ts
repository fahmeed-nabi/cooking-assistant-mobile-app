// API Configuration - Update these with your own API keys
export const API_CONFIG = {
  // Spoonacular API (Recommended - Most comprehensive)
  // Get free API key at: https://spoonacular.com/food-api
  SPOONACULAR_API_KEY: 'f636bdf58d5e49229f293a840761ba8a',
  
  // Alternative APIs (Free, no key required)
  USE_MEALDB_FALLBACK: true, // TheMealDB API as fallback
  USE_USDA_FALLBACK: true,   // USDA Food Database as fallback
  
  // API Rate Limits (requests per day)
  SPOONACULAR_DAILY_LIMIT: 150, // Free tier limit
  MEALDB_DAILY_LIMIT: 1000,     // No limit for free tier
  
  // Search Settings
  MAX_INGREDIENT_SEARCH_RESULTS: 10,
  MAX_RECIPE_SEARCH_RESULTS: 20,
  SEARCH_TIMEOUT_MS: 10000, // 10 seconds
  
  // AI/ML Settings
  MIN_MATCH_SCORE: 0.3,     // Minimum score for loose mode
  NORMAL_MATCH_SCORE: 0.6,  // Minimum score for normal mode
  SURPRISE_RANDOMNESS: 0.3, // Randomness factor for surprise mode

  GEMINI_API_KEY: 'REPLACE_WITH_YOUR_GEMINI_API_KEY',

  
  // Unsplash API for recipe images
  // Get free API key at: https://unsplash.com/developers
  UNSPLASH_ACCESS_KEY: 'oW5wQUf6YZOyQkmGYePXaS4e9tA-zomAzwOj02Qxq0s',
};

// API Endpoints
export const API_ENDPOINTS = {
  SPOONACULAR: {
    BASE_URL: 'https://api.spoonacular.com',
    INGREDIENTS_SEARCH: '/food/ingredients/search',
    RECIPES_SEARCH: '/recipes/complexSearch',
    RECIPES_BY_INGREDIENTS: '/recipes/findByIngredients',
    RECIPE_INFO: '/recipes/{id}/information',
  },
  MEALDB: {
    BASE_URL: 'https://www.themealdb.com/api/json/v1/1',
    SEARCH: '/search.php',
    RANDOM: '/random.php',
    BY_ID: '/lookup.php',
  },
  USDA: {
    BASE_URL: 'https://api.nal.usda.gov/fdc/v1',
    SEARCH: '/foods/search',
  },
  UNSPLASH: {
    BASE_URL: 'https://api.unsplash.com',
    SEARCH: '/search/photos',
  },
};

// Feature Flags
export const FEATURES = {
  ENABLE_AI_MATCHING: true,
  ENABLE_SUBSTITUTION_SUGGESTIONS: true,
  ENABLE_PERSONALIZATION: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_CACHING: true,
};

// Cache Settings
export const CACHE_CONFIG = {
  INGREDIENT_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  RECIPE_CACHE_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days
  MAX_CACHE_SIZE: 100, // Maximum number of cached items
};

// User Preferences Defaults
export const DEFAULT_USER_PREFERENCES = {
  cuisine: ['American', 'Italian', 'Mexican'],
  dietary: [],
  difficulty: ['Easy', 'Medium'],
  cookTime: 45, // minutes
  spiceLevel: 5, // 1-10 scale
  favoriteIngredients: [],
  dislikedIngredients: [],
}; 