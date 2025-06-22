# 🍳 MealMatch - AI-Powered Recipe Discovery App

A React Native mobile app that helps users discover recipes based on ingredients they have at home, using AI/ML for intelligent matching and external recipe databases for comprehensive coverage.

## 🚀 Features

### **Core Functionality**
- **Ingredient Search**: Real-time search with 300,000+ ingredients from multiple databases
- **AI-Powered Recipe Matching**: Intelligent algorithm that considers ingredient compatibility, user preferences, and dietary restrictions
- **Three Matching Modes**:
  - **Normal**: Exact ingredient matches
  - **Loose**: Similar ingredients and substitutions
  - **Surprise Me**: AI-powered creative suggestions
- **Recipe Management**: Save, organize, and share favorite recipes
- **User Authentication**: Secure login/signup with Firebase

### **AI/ML Capabilities**
- **Intelligent Ingredient Matching**: Fuzzy matching with Levenshtein distance
- **Recipe Compatibility Scoring**: ML-based algorithm considering ingredient pairs
- **Substitution Suggestions**: Smart ingredient replacement recommendations
- **Personalization**: Learns user preferences over time
- **Cuisine-Specific Matching**: Optimized for different cooking styles

### **Data Sources**
- **Spoonacular API**: 5,000+ recipes with detailed nutrition and instructions
- **TheMealDB API**: 2.3M+ recipes (free fallback)
- **USDA Food Database**: 300,000+ ingredients with nutritional data
- **Local Fallback**: Curated recipes when APIs are unavailable

## 🛠️ Technology Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Authentication, Firestore)
- **APIs**: Spoonacular, TheMealDB, USDA Food Database
- **AI/ML**: Custom algorithms for recipe matching and personalization
- **Language**: TypeScript
- **State Management**: React Hooks
- **Navigation**: Expo Router

## 📱 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cooking-assistant-mobile-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Copy your Firebase config to `constants/firebaseConfig.js`:
```javascript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 4. API Configuration (Optional but Recommended)

#### Spoonacular API (Recommended)
1. Get a free API key at [Spoonacular](https://spoonacular.com/food-api)
2. Update `constants/apiConfig.ts`:
```typescript
export const API_CONFIG = {
  SPOONACULAR_API_KEY: 'your-spoonacular-api-key',
  // ... other settings
};
```

#### Alternative APIs (Free, No Key Required)
- **TheMealDB**: Automatically used as fallback
- **USDA Food Database**: Automatically used as fallback

### 5. Run the App
```bash
npm start
```

## 🔧 Configuration

### API Settings (`constants/apiConfig.ts`)
```typescript
export const API_CONFIG = {
  // Spoonacular API (Recommended)
  SPOONACULAR_API_KEY: 'YOUR_SPOONACULAR_API_KEY',
  
  // Search Settings
  MAX_INGREDIENT_SEARCH_RESULTS: 10,
  MAX_RECIPE_SEARCH_RESULTS: 20,
  
  // AI/ML Settings
  MIN_MATCH_SCORE: 0.3,     // Minimum score for loose mode
  NORMAL_MATCH_SCORE: 0.6,  // Minimum score for normal mode
  SURPRISE_RANDOMNESS: 0.3, // Randomness factor for surprise mode
};
```

### Feature Flags
```typescript
export const FEATURES = {
  ENABLE_AI_MATCHING: true,
  ENABLE_SUBSTITUTION_SUGGESTIONS: true,
  ENABLE_PERSONALIZATION: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_CACHING: true,
};
```

## 🏗️ Architecture

### **Services Layer**
- **`apiService.ts`**: Handles all external API calls with fallback mechanisms
- **`aiService.ts`**: AI/ML algorithms for recipe matching and personalization
- **`firebase.ts`**: Firebase authentication and data persistence
- **`recipeData.ts`**: Local recipe data and filtering utilities

### **API Integration Strategy**
1. **Primary**: Spoonacular API (most comprehensive)
2. **Fallback 1**: TheMealDB API (free, no key required)
3. **Fallback 2**: Local curated recipes
4. **Graceful Degradation**: App works offline with local data

### **AI/ML Algorithms**
- **Ingredient Similarity**: Levenshtein distance for fuzzy matching
- **Recipe Compatibility**: Matrix-based ingredient pair scoring
- **Substitution Logic**: Smart ingredient replacement suggestions
- **Personalization**: User preference learning from history

## 📊 Data Flow

```
User Input → API Service → AI Matching → Recipe Display
     ↓           ↓           ↓            ↓
Local Cache → Fallback APIs → Scoring → User Interface
```

## 🎯 Key Features Explained

### **Intelligent Recipe Matching**
The app uses a sophisticated algorithm that considers:
- **Ingredient Overlap**: Percentage of user ingredients in recipe
- **Compatibility Bonus**: How well ingredients work together
- **Substitution Bonus**: Available ingredient replacements
- **User Preferences**: Cuisine, dietary, difficulty preferences
- **Cuisine Context**: Cuisine-specific ingredient preferences

### **Three Matching Modes**
1. **Normal Mode**: Strict matching with high accuracy
2. **Loose Mode**: Flexible matching with substitutions
3. **Surprise Me**: Creative suggestions with randomness

### **Offline Capability**
- Local recipe database for offline use
- Cached ingredient searches
- Graceful API failure handling

## 🔒 Security & Privacy

- **API Keys**: Stored in configuration files (not in code)
- **User Data**: Encrypted in Firebase
- **No Data Collection**: User preferences stored locally
- **Rate Limiting**: Respects API limits

## 🚀 Deployment

### Expo Build
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

### App Store Deployment
1. Configure app.json with your app details
2. Build production version
3. Submit to App Store/Play Store

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review the [Documentation](docs/)
3. Contact the development team

## 🔮 Future Enhancements

- **Advanced AI**: Integration with GPT for recipe generation
- **Image Recognition**: Photo-based ingredient detection
- **Social Features**: Recipe sharing and community
- **Nutrition Tracking**: Detailed nutritional analysis
- **Meal Planning**: Weekly meal planning with shopping lists
- **Voice Commands**: Voice-based ingredient input
- **AR Features**: Augmented reality cooking assistance

---

**Built with ❤️ using React Native, Firebase, and AI/ML technologies**
