# MealMatch - Cooking Assistant Mobile App

A React Native mobile application that helps users discover recipes based on ingredients they already have at home. Built with Expo, Firebase, and TypeScript.

## 🍳 Features

### Core Features
- **Ingredient Management**: Add, edit, and remove ingredients from your personal inventory
- **Recipe Discovery**: Find recipes based on your available ingredients
- **Three Recipe Modes**:
  - **Normal**: Uses only ingredients you have (100% match)
  - **Loose**: Allows up to 3 additional ingredients
  - **Surprise Me**: Creative recipes with at least 2 matching ingredients
- **Recipe Details**: Full instructions, ingredients list, and cooking information
- **Save Favorites**: Save recipes you like for future reference
- **User Authentication**: Sign up, sign in, and manage your account
- **Filtering**: Filter recipes by cuisine and dietary preferences

### User Experience
- **Guest Mode**: Browse recipes without creating an account
- **Autocomplete**: Smart ingredient suggestions as you type
- **Visual Feedback**: See which ingredients you have vs. missing
- **Responsive Design**: Optimized for mobile devices
- **Offline Support**: Basic functionality works without internet

## 🛠 Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **Backend**: Firebase (Authentication & Firestore)
- **Language**: TypeScript
- **UI Components**: React Native + Expo Vector Icons
- **State Management**: React Hooks
- **Styling**: StyleSheet API

## 📱 Screens

1. **Welcome Screen**: App introduction and authentication options
2. **Authentication**: Sign in and sign up screens
3. **Ingredients Tab**: Manage your ingredient inventory
4. **Recipes Tab**: Discover recipes with filtering and modes
5. **Saved Recipes Tab**: View your favorite recipes
6. **Profile Tab**: User account management and stats
7. **Recipe Detail**: Full recipe information and save functionality

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cooking-assistant-mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Update `constants/firebaseConfig.js` with your Firebase configuration

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   ```bash
   # For Android
   npm run android
   
   # For iOS
   npm run ios
   
   # For web
   npm run web
   ```

## 📊 Project Structure

```
cooking-assistant-mobile-app/
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Ingredients screen
│   │   ├── recipes.tsx    # Recipe discovery
│   │   ├── saved.tsx      # Saved recipes
│   │   └── profile.tsx    # User profile
│   ├── recipe/            # Recipe detail screens
│   ├── login.tsx          # Authentication
│   ├── signup.tsx         # User registration
│   └── _layout.tsx        # Root layout
├── services/              # Business logic and data
│   ├── firebase.js        # Firebase configuration
│   └── recipeData.ts      # Recipe data and utilities
├── constants/             # Configuration files
│   └── firebaseConfig.js  # Firebase config
├── assets/                # Static assets
└── package.json           # Dependencies and scripts
```

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Set up security rules for Firestore
5. Update the Firebase configuration in `constants/firebaseConfig.js`

### Environment Variables
Create a `.env` file in the root directory:
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## 📋 Business Rules

### Ingredients
- Minimum 2 characters required
- Stored in lowercase
- No duplicates per user
- Case-insensitive matching

### Recipes
- Generated based on user ingredients
- Three matching modes (Normal, Loose, Surprise)
- Filterable by cuisine and dietary preferences
- Save/unsave functionality for authenticated users

### Authentication
- Email/password authentication
- Guest mode available for basic features
- User data persisted in Firestore

## 🎨 Design System

### Colors
- Primary: `#2f4f2f` (Dark Green)
- Background: `#FDF9EC` (Cream)
- Text: `#2f4f2f` (Dark Green)
- Secondary Text: `#666` (Gray)
- Accent: `#ff6b6b` (Coral Red)

### Typography
- Headers: Bold, 24-28px
- Body: Regular, 16px
- Captions: Regular, 14px

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Ingredient addition and removal
- [ ] Recipe discovery in all three modes
- [ ] Recipe filtering by cuisine and dietary
- [ ] Recipe saving and unsaving
- [ ] Navigation between screens
- [ ] Guest mode functionality
- [ ] Error handling and validation

## 📦 Building for Production

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

**Team 2:**
- Fahmeed Nabi
- Zarar

**Course:** CS 4720  
**Professor:** Daniel Graham  
**Due Date:** 10 July 2025

## 🔮 Future Enhancements

### Stretch Features
- **Image Recognition**: Take photos of ingredients for automatic detection
- **Shopping List**: Generate shopping lists based on missing ingredients
- **Recipe Ratings**: Rate and review saved recipes
- **Meal Planning**: Plan meals for the week
- **Nutritional Information**: Display nutritional facts for recipes
- **Social Features**: Share recipes with friends

### Technical Improvements
- **Real Recipe API**: Integrate with Spoonacular or similar API
- **Offline Database**: Local storage for offline functionality
- **Push Notifications**: Reminders for meal planning
- **Performance Optimization**: Image caching and lazy loading
- **Accessibility**: Screen reader support and accessibility features

## 🐛 Known Issues

- Mock recipe data is limited (8 recipes)
- No real-time ingredient synchronization
- Basic error handling
- Limited offline functionality

## 📞 Support

For questions or issues, please contact the development team or create an issue in the repository.
