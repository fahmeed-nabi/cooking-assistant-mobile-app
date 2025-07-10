// Image Service for fetching professional recipe images
import { API_CONFIG, API_ENDPOINTS } from '../constants/apiConfig';

interface UnsplashPhoto {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  description: string;
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
}

class ImageService {
  private unsplashAccessKey = API_CONFIG.UNSPLASH_ACCESS_KEY;
  private unsplashBaseUrl = API_ENDPOINTS.UNSPLASH.BASE_URL;

  /**
   * Search for a recipe image using the recipe title
   * @param recipeTitle - The title of the recipe to search for
   * @param cuisine - Optional cuisine type to improve search results
   * @returns Promise<string> - URL of the best matching image
   */
  async searchRecipeImage(recipeTitle: string, cuisine?: string): Promise<string> {
    // If no Unsplash API key is configured, return a default image
    if (!this.unsplashAccessKey || this.unsplashAccessKey === 'YOUR_UNSPLASH_ACCESS_KEY') {
      console.log('⚠️ No Unsplash API key configured, using default image');
      return this.getDefaultRecipeImage();
    }

    try {
      // Create search query combining recipe title and cuisine
      let searchQuery = recipeTitle;
      if (cuisine && cuisine.toLowerCase() !== 'international') {
        searchQuery += ` ${cuisine} food`;
      }
      
      // Add food-related terms to improve results
      searchQuery += ' food recipe cooking';

      console.log(`🔍 Searching Unsplash for: "${searchQuery}"`);

      const response = await fetch(
        `${this.unsplashBaseUrl}/search/photos?query=${encodeURIComponent(searchQuery)}&orientation=landscape&per_page=5`,
        {
          headers: {
            'Authorization': `Client-ID ${this.unsplashAccessKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data: UnsplashSearchResponse = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Return the first (best) result
        const imageUrl = data.results[0].urls.regular;
        console.log(`✅ Found recipe image: ${imageUrl}`);
        return imageUrl;
      } else {
        console.log('❌ No images found, using default');
        return this.getDefaultRecipeImage();
      }
    } catch (error) {
      console.error('❌ Error searching for recipe image:', error);
      return this.getDefaultRecipeImage();
    }
  }

  /**
   * Get a default recipe image when search fails
   * @returns string - URL of a default food image
   */
  private getDefaultRecipeImage(): string {
    // Return a high-quality default food image from Unsplash
    return 'https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?w=400&fit=crop&crop=center';
  }

  /**
   * Search for multiple recipe images in batch
   * @param recipes - Array of recipes with titles
   * @returns Promise<Map<string, string>> - Map of recipe ID to image URL
   */
  async searchRecipeImages(recipes: Array<{ id: string; title: string; cuisine?: string }>): Promise<Map<string, string>> {
    const imageMap = new Map<string, string>();
    
    // Process recipes sequentially to avoid rate limiting
    for (const recipe of recipes) {
      try {
        const imageUrl = await this.searchRecipeImage(recipe.title, recipe.cuisine);
        imageMap.set(recipe.id, imageUrl);
        
        // Add a small delay between requests to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Error getting image for recipe ${recipe.id}:`, error);
        imageMap.set(recipe.id, this.getDefaultRecipeImage());
      }
    }
    
    return imageMap;
  }

  /**
   * Get a cuisine-specific default image
   * @param cuisine - The cuisine type
   * @returns string - URL of a cuisine-appropriate default image
   */
  getCuisineDefaultImage(cuisine: string): string {
    const cuisineImages: { [key: string]: string } = {
      'italian': 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&fit=crop',
      'mexican': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&fit=crop',
      'asian': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&fit=crop',
      'indian': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&fit=crop',
      'mediterranean': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&fit=crop',
      'american': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&fit=crop',
      'french': 'https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?w=400&fit=crop',
      'thai': 'https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?w=400&fit=crop',
    };

    const normalizedCuisine = cuisine.toLowerCase();
    return cuisineImages[normalizedCuisine] || this.getDefaultRecipeImage();
  }
}

export const imageService = new ImageService(); 