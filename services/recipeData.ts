// Mock recipe data - centralized for reuse across screens
export const MOCK_RECIPES = [
  {
    id: '1',
    title: 'Chicken Stir Fry',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
    ingredients: ['chicken', 'onion', 'garlic', 'bell pepper', 'soy sauce'],
    instructions: [
      'Cut chicken into bite-sized pieces',
      'Chop vegetables',
      'Heat oil in a large pan',
      'Cook chicken until golden',
      'Add vegetables and stir fry',
      'Add soy sauce and serve'
    ],
    cookTime: 20,
    cuisine: 'Asian',
    dietary: ['gluten-free'],
    difficulty: 'Easy'
  },
  {
    id: '2',
    title: 'Pasta Carbonara',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
    ingredients: ['pasta', 'eggs', 'cheese', 'garlic', 'pepper'],
    instructions: [
      'Cook pasta according to package',
      'Beat eggs with cheese',
      'Sauté garlic',
      'Combine pasta with egg mixture',
      'Add pepper and serve'
    ],
    cookTime: 15,
    cuisine: 'Italian',
    dietary: ['vegetarian'],
    difficulty: 'Medium'
  },
  {
    id: '3',
    title: 'Simple Salad',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    ingredients: ['lettuce', 'tomato', 'cucumber', 'olive oil', 'salt'],
    instructions: [
      'Wash and chop vegetables',
      'Combine in a bowl',
      'Drizzle with olive oil',
      'Season with salt and serve'
    ],
    cookTime: 5,
    cuisine: 'Mediterranean',
    dietary: ['vegan', 'gluten-free'],
    difficulty: 'Easy'
  },
  {
    id: '4',
    title: 'Scrambled Eggs',
    image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400',
    ingredients: ['eggs', 'butter', 'salt', 'pepper'],
    instructions: [
      'Crack eggs into a bowl',
      'Whisk until combined',
      'Heat butter in pan',
      'Pour in eggs and scramble',
      'Season and serve'
    ],
    cookTime: 10,
    cuisine: 'American',
    dietary: ['gluten-free'],
    difficulty: 'Easy'
  },
  {
    id: '5',
    title: 'Rice and Beans',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    ingredients: ['rice', 'beans', 'onion', 'garlic', 'salt'],
    instructions: [
      'Cook rice according to package',
      'Sauté onion and garlic',
      'Add beans and heat through',
      'Combine with rice',
      'Season and serve'
    ],
    cookTime: 25,
    cuisine: 'Mexican',
    dietary: ['vegan', 'gluten-free'],
    difficulty: 'Easy'
  },
  {
    id: '6',
    title: 'Grilled Cheese Sandwich',
    image: 'https://images.unsplash.com/photo-1528735602781-4a98ef4a30c3?w=400',
    ingredients: ['bread', 'cheese', 'butter'],
    instructions: [
      'Butter one side of each bread slice',
      'Place cheese between bread slices',
      'Heat pan over medium heat',
      'Cook until golden brown on both sides',
      'Serve hot'
    ],
    cookTime: 8,
    cuisine: 'American',
    dietary: ['vegetarian'],
    difficulty: 'Easy'
  },
  {
    id: '7',
    title: 'Tomato Soup',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    ingredients: ['tomato', 'onion', 'garlic', 'olive oil', 'salt', 'pepper'],
    instructions: [
      'Chop tomatoes and onion',
      'Sauté onion and garlic in olive oil',
      'Add tomatoes and cook until soft',
      'Blend until smooth',
      'Season with salt and pepper'
    ],
    cookTime: 30,
    cuisine: 'Mediterranean',
    dietary: ['vegan', 'gluten-free'],
    difficulty: 'Easy'
  },
  {
    id: '8',
    title: 'Pancakes',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
    ingredients: ['flour', 'eggs', 'milk', 'butter', 'sugar', 'salt'],
    instructions: [
      'Mix dry ingredients in a bowl',
      'Whisk wet ingredients separately',
      'Combine wet and dry ingredients',
      'Heat pan with butter',
      'Pour batter and cook until bubbles form',
      'Flip and cook other side'
    ],
    cookTime: 20,
    cuisine: 'American',
    dietary: ['vegetarian'],
    difficulty: 'Easy'
  }
];

export interface Recipe {
  id: string;
  title: string;
  image: string;
  ingredients: string[];
  instructions: string[];
  cookTime: number;
  cuisine: string;
  dietary: string[];
  difficulty: string;
}

export const getRecipeById = (id: string): Recipe | undefined => {
  return MOCK_RECIPES.find(recipe => recipe.id === id);
};

export const filterRecipesByIngredients = (
  recipes: Recipe[],
  userIngredients: string[],
  mode: 'normal' | 'loose' | 'surprise'
): Recipe[] => {
  switch (mode) {
    case 'normal':
      return recipes.filter(recipe =>
        recipe.ingredients.every(ingredient => 
          userIngredients.includes(ingredient.toLowerCase())
        )
      );
    case 'loose':
      return recipes.filter(recipe => {
        const missingIngredients = recipe.ingredients.filter(ingredient =>
          !userIngredients.includes(ingredient.toLowerCase())
        );
        return missingIngredients.length <= 3;
      });
    case 'surprise':
      return recipes.filter(recipe => {
        const matchingIngredients = recipe.ingredients.filter(ingredient =>
          userIngredients.includes(ingredient.toLowerCase())
        );
        return matchingIngredients.length >= 2;
      });
    default:
      return recipes;
  }
};

export const filterRecipesByCuisine = (recipes: Recipe[], cuisine: string): Recipe[] => {
  if (cuisine === 'all') return recipes;
  return recipes.filter(recipe => recipe.cuisine === cuisine);
};

export const filterRecipesByDietary = (recipes: Recipe[], dietary: string): Recipe[] => {
  if (dietary === 'all') return recipes;
  return recipes.filter(recipe => recipe.dietary.includes(dietary));
}; 