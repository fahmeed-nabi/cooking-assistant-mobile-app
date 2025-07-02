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
  },
  {
    id: '9',
    title: 'Beef Tacos',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400',
    ingredients: ['beef', 'tortilla', 'onion', 'garlic', 'tomato', 'lettuce', 'cheese'],
    instructions: [
      'Brown beef in a pan',
      'Add chopped onion and garlic',
      'Season with salt and pepper',
      'Warm tortillas',
      'Fill with beef mixture',
      'Top with tomato, lettuce, and cheese'
    ],
    cookTime: 15,
    cuisine: 'Mexican',
    dietary: [],
    difficulty: 'Easy'
  },
  {
    id: '10',
    title: 'Vegetable Curry',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400',
    ingredients: ['onion', 'garlic', 'ginger', 'tomato', 'potato', 'carrot', 'curry powder', 'coconut milk'],
    instructions: [
      'Sauté onion, garlic, and ginger',
      'Add curry powder and cook briefly',
      'Add chopped vegetables',
      'Pour in coconut milk',
      'Simmer until vegetables are tender',
      'Serve with rice'
    ],
    cookTime: 35,
    cuisine: 'Indian',
    dietary: ['vegan', 'gluten-free'],
    difficulty: 'Medium'
  },
  {
    id: '11',
    title: 'Salmon with Lemon',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    ingredients: ['salmon', 'lemon', 'butter', 'garlic', 'salt', 'pepper'],
    instructions: [
      'Season salmon with salt and pepper',
      'Heat butter in pan',
      'Add garlic and cook briefly',
      'Place salmon skin-side down',
      'Cook for 4-5 minutes per side',
      'Squeeze lemon over top'
    ],
    cookTime: 12,
    cuisine: 'Mediterranean',
    dietary: ['gluten-free'],
    difficulty: 'Easy'
  },
  {
    id: '12',
    title: 'Quinoa Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    ingredients: ['quinoa', 'avocado', 'tomato', 'cucumber', 'olive oil', 'lemon', 'salt'],
    instructions: [
      'Cook quinoa according to package',
      'Chop vegetables',
      'Mix quinoa with vegetables',
      'Drizzle with olive oil and lemon',
      'Season with salt and serve'
    ],
    cookTime: 20,
    cuisine: 'Mediterranean',
    dietary: ['vegan', 'gluten-free'],
    difficulty: 'Easy'
  },
  {
    id: '13',
    title: 'Chicken Noodle Soup',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    ingredients: ['chicken', 'noodles', 'carrot', 'celery', 'onion', 'chicken broth', 'salt', 'pepper'],
    instructions: [
      'Simmer chicken in broth',
      'Add chopped vegetables',
      'Cook until vegetables are tender',
      'Add noodles and cook',
      'Shred chicken and return to pot',
      'Season and serve'
    ],
    cookTime: 45,
    cuisine: 'American',
    dietary: [],
    difficulty: 'Medium'
  },
  {
    id: '14',
    title: 'Greek Salad',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    ingredients: ['cucumber', 'tomato', 'olive', 'feta cheese', 'red onion', 'olive oil', 'oregano'],
    instructions: [
      'Chop cucumber and tomato',
      'Slice red onion thinly',
      'Combine with olives and feta',
      'Drizzle with olive oil',
      'Sprinkle oregano and serve'
    ],
    cookTime: 10,
    cuisine: 'Mediterranean',
    dietary: ['gluten-free'],
    difficulty: 'Easy'
  },
  {
    id: '15',
    title: 'Spaghetti Bolognese',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
    ingredients: ['spaghetti', 'beef', 'onion', 'garlic', 'tomato sauce', 'parmesan', 'basil'],
    instructions: [
      'Brown beef in a large pan',
      'Add chopped onion and garlic',
      'Pour in tomato sauce',
      'Simmer for 20 minutes',
      'Cook spaghetti separately',
      'Combine and top with parmesan and basil'
    ],
    cookTime: 35,
    cuisine: 'Italian',
    dietary: [],
    difficulty: 'Medium'
  },
  {
    id: '16',
    title: 'Avocado Toast',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
    ingredients: ['bread', 'avocado', 'salt', 'pepper', 'olive oil'],
    instructions: [
      'Toast bread until golden',
      'Mash avocado in a bowl',
      'Season with salt and pepper',
      'Spread on toast',
      'Drizzle with olive oil'
    ],
    cookTime: 5,
    cuisine: 'American',
    dietary: ['vegan'],
    difficulty: 'Easy'
  },
  {
    id: '17',
    title: 'Beef Stir Fry',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
    ingredients: ['beef', 'broccoli', 'carrot', 'garlic', 'soy sauce', 'sesame oil'],
    instructions: [
      'Slice beef thinly',
      'Chop vegetables',
      'Heat sesame oil in wok',
      'Stir fry beef until browned',
      'Add vegetables and soy sauce',
      'Cook until vegetables are crisp-tender'
    ],
    cookTime: 15,
    cuisine: 'Asian',
    dietary: ['gluten-free'],
    difficulty: 'Medium'
  },
  {
    id: '18',
    title: 'Caprese Salad',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    ingredients: ['tomato', 'mozzarella', 'basil', 'olive oil', 'balsamic vinegar', 'salt'],
    instructions: [
      'Slice tomatoes and mozzarella',
      'Arrange on plate alternating slices',
      'Tear basil leaves and scatter',
      'Drizzle with olive oil and balsamic',
      'Season with salt and serve'
    ],
    cookTime: 8,
    cuisine: 'Italian',
    dietary: ['gluten-free'],
    difficulty: 'Easy'
  },
  {
    id: '19',
    title: 'Chicken Caesar Salad',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    ingredients: ['chicken', 'lettuce', 'parmesan', 'croutons', 'caesar dressing', 'black pepper'],
    instructions: [
      'Grill or pan-fry chicken',
      'Chop lettuce into bite-sized pieces',
      'Shred parmesan cheese',
      'Combine all ingredients',
      'Toss with dressing and serve'
    ],
    cookTime: 20,
    cuisine: 'American',
    dietary: [],
    difficulty: 'Easy'
  },
  {
    id: '20',
    title: 'Vegetable Pasta',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
    ingredients: ['pasta', 'zucchini', 'bell pepper', 'onion', 'garlic', 'olive oil', 'parmesan'],
    instructions: [
      'Cook pasta according to package',
      'Sauté vegetables in olive oil',
      'Add garlic and cook briefly',
      'Combine with pasta',
      'Top with parmesan and serve'
    ],
    cookTime: 20,
    cuisine: 'Italian',
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
  const lowerCaseUserIngredients = userIngredients.map(i => i.toLowerCase());

  switch (mode) {
    case 'normal':
      // Require at least one matching ingredient, allow up to 1 missing
      return recipes.filter(recipe => {
        const recipeIngredients = recipe.ingredients.map(i => i.toLowerCase());
        const matchingIngredients = recipeIngredients.filter(ingredient =>
          lowerCaseUserIngredients.some(userIng =>
            ingredient.includes(userIng)
          )
        );
        const missingIngredients = recipeIngredients.filter(
          ingredient => !lowerCaseUserIngredients.some(userIng =>
            ingredient.includes(userIng)
          )
        );
        return matchingIngredients.length > 0 && missingIngredients.length <= 1;
      });

    case 'loose':
      // Allow up to 3 missing, require at least one match (substring match)
      return recipes.filter(recipe => {
        const recipeIngredients = recipe.ingredients.map(i => i.toLowerCase());
        const matchingIngredients = recipeIngredients.filter(ingredient =>
          lowerCaseUserIngredients.some(userIng =>
            ingredient.includes(userIng)
          )
        );
        const missingIngredients = recipeIngredients.filter(
          ingredient => !lowerCaseUserIngredients.some(userIng =>
            ingredient.includes(userIng)
          )
        );
        return matchingIngredients.length > 0 && missingIngredients.length <= 3;
      });

    case 'surprise':
      // Any recipe with at least one matching ingredient (substring match)
      const surpriseRecipes = recipes.filter(recipe => {
        const recipeIngredients = recipe.ingredients.map(i => i.toLowerCase());
        return recipeIngredients.some(ingredient =>
          lowerCaseUserIngredients.some(userIng =>
            ingredient.includes(userIng)
          )
        );
      });
      // Shuffle for variety
      return surpriseRecipes.sort(() => 0.5 - Math.random());

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