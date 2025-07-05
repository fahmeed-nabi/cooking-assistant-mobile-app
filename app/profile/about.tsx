import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'About MealMatch',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="arrow-back" size={24} color="#FF6B6B" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="information-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.title}>About MealMatch</Text>
          <Text style={styles.subtitle}>
            MealMatch helps you discover recipes based on the ingredients you have, save your favorites, and cook smarter on a budget.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.bodyText}>
            We believe everyone should be able to cook delicious meals with what they have on hand. MealMatch is designed to reduce food waste, save money, and make home cooking fun and accessible for all.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acknowledgments</Text>
          <Text style={styles.bodyText}>
            MealMatch was created as a class project by students at the University of Virginia. We thank our instructor for his support and feedback.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF9EC', padding: 16 },
  header: { alignItems: 'center', marginBottom: 24, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FF6B6B', marginTop: 12 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 8 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2f4f2f', marginBottom: 12 },
  bodyText: { fontSize: 15, color: '#666', marginTop: 2 },
});