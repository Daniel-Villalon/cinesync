import React from 'react';
import { Link } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');


export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Floating circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />
      <View style={[styles.circle, styles.circle4]} />
      <View style={[styles.circle, styles.circle5]} />

      {/* App title */}
      <Text style={styles.title}>CineSync</Text>
      <Text style={styles.tagline}>Where friends and movies come together.</Text>

      {/* Buttons */}
      <Link href="/SignIn" asChild>
        <TouchableOpacity style={styles.signInButton}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/SignUp" asChild>
        <TouchableOpacity style={styles.signUpButton}>
          <Text style={[styles.buttonText, { color: '#2B2C5A' }]}>Sign Up</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/MovieSearch" asChild>
        <TouchableOpacity style={styles.someButton}>
          <Text style={styles.buttonText}>Test Movie Search</Text>
        </TouchableOpacity>
      </Link>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2B2C5A', // deep navy blue
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#F7EEDB',
    marginTop: -40,
    fontFamily: 'Georgia',
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 40,
    marginTop: 8,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: '#DD775C',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  signUpButton: {
    backgroundColor: '#F7D491',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  someButton: {
    backgroundColor: '#F7D491',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#2B2C5A',
    fontWeight: '600',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.9,
  },
  circle1: {
    backgroundColor: '#F7D491',
    width: 150,
    height: 150,
    top: -30,
    right: -60,
  },
  circle2: {
    backgroundColor: '#8BBCA6',
    width: 100,
    height: 100,
    top: 60,
    left: -40,
  },
  circle3: {
    backgroundColor: '#DD775C',
    width: 80,
    height: 80,
    top: 120,
    left: 60,
  },
  circle4: {
    backgroundColor: '#DD775C',
    width: 280,
    height: 280,
    bottom: -80,
    left: -100,
  },
  circle5: {
    backgroundColor: '#8BBCA6',
    width: 100,
    height: 100,
    bottom: 40,
    right: -20,
  },
});
