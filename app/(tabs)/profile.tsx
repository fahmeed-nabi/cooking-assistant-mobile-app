import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../services/firebase';

export default function ProfileScreen() {
  const [user, setUser] = useState(auth.currentUser);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        loadUserData(user.uid);
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/login');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f4f2f" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={80} color="#ccc" />
          <Text style={styles.title}>Welcome to MealMatch</Text>
          <Text style={styles.subtitle}>
            Sign in to save recipes and manage your ingredients
          </Text>
        </View>

        <View style={styles.authSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSignIn}>
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleSignUp}>
            <Ionicons name="person-add-outline" size={20} color="#2f4f2f" />
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="restaurant-outline" size={24} color="#2f4f2f" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Ingredient Management</Text>
              <Text style={styles.featureDescription}>
                Add and manage your available ingredients
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="book-outline" size={24} color="#2f4f2f" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Recipe Discovery</Text>
              <Text style={styles.featureDescription}>
                Find recipes based on your ingredients
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="heart-outline" size={24} color="#2f4f2f" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Save Favorites</Text>
              <Text style={styles.featureDescription}>
                Save your favorite recipes for later
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name={user ? "person-circle" : "person-circle-outline"} size={80} color="#2f4f2f" />
        <Text style={styles.title}>
          {user ? user.email : "Welcome to MealMatch"}
        </Text>
        <Text style={styles.subtitle}>
          {user
            ? "Welcome back!"
            : "Sign in to save recipes and manage your ingredients"}
        </Text>
      </View>

      {!user ? (
        <>
          <View style={styles.authSection}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSignIn}>
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleSignUp}>
              <Ionicons name="person-add-outline" size={20} color="#2f4f2f" />
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featureItem}>
              <Ionicons name="restaurant-outline" size={24} color="#2f4f2f" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Ingredient Management</Text>
                <Text style={styles.featureDescription}>
                  Add and manage your available ingredients
                </Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="book-outline" size={24} color="#2f4f2f" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Recipe Discovery</Text>
                <Text style={styles.featureDescription}>
                  Find recipes based on your ingredients
                </Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="heart-outline" size={24} color="#2f4f2f" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Save Favorites</Text>
                <Text style={styles.featureDescription}>
                  Save your favorite recipes for later
                </Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {userData?.ingredients?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Ingredients</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {userData?.savedRecipes?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Saved Recipes</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/profile/help')}
            >
              <Ionicons name="help-circle-outline" size={20} color="#666" />
              <Text style={styles.actionText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/profile/about')}
            >
              <Ionicons name="information-circle-outline" size={20} color="#666" />
              <Text style={styles.actionText}>About MealMatch</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>MealMatch v1.0.0</Text>
        <Text style={styles.footerSubtext}>Made with ❤️ for budget-conscious cooks</Text>
      </View>
    </ScrollView>
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
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2f4f2f',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  authSection: {
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#2f4f2f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2f4f2f',
  },
  secondaryButtonText: {
    color: '#2f4f2f',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  featuresSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2f4f2f',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureContent: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f4f2f',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2f4f2f',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 16,
    color: '#2f4f2f',
    marginLeft: 16,
    flex: 1,
  },
  signOutButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    marginBottom: 32,
  },
  signOutButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
  },
}); 