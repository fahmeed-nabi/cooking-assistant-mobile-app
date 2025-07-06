import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HelpScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Help & Support',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="help-circle-outline" size={64} color="#007AFF" />
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>
            Need assistance? Find answers to common questions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <Text style={styles.question}>• How do I save a recipe?</Text>
          <Text style={styles.answer}>Sign in and tap the heart icon on any recipe to save it to your favorites.</Text>
          <Text style={styles.question}>• Can I use MealMatch without creating an account?</Text>
          <Text style={styles.answer}>Yes, you can browse recipes and ingredients without an account, but you will need to sign in to save recipes.</Text>
          <Text style={styles.question}>• How do I contact support?</Text>
          <Text style={styles.answer}>There is no contact support for this app. This application was created as a project by students at the University of Virginia. We do not actively maintain this application.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF9EC', padding: 16 },
  header: { alignItems: 'center', marginBottom: 24, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', marginTop: 12 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 8 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2f4f2f', marginBottom: 12 },
  question: { fontSize: 16, fontWeight: '600', color: '#2f4f2f', marginTop: 10 },
  answer: { fontSize: 15, color: '#666', marginLeft: 10, marginTop: 2 },
});