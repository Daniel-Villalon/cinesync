import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SignInScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Floating Circles */}
      <View style={[styles.circle, styles.circleTopLeft]} />
      <View style={[styles.circle, styles.circleTopRight]} />
      <View style={[styles.circle, styles.circleMidSmall]} />
      <View style={[styles.circle, styles.circleBottomLeft]} />
      <View style={[styles.circle, styles.circleBottomRight]} />
      <View style={[styles.circle, styles.circleTiny]} />

      {/* Text Title */}
      <Text style={styles.title}>Create an</Text>
      <Text style={styles.title}>Account</Text>

      {/* Email Field */}
      <Text style={styles.labelEmail}>Email Address*</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#F7D491"
        style={styles.inputEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Field */}
      <TextInput
        placeholder="Password*"
        placeholderTextColor="#8BBCA6"
        style={styles.inputPassword}
        secureTextEntry
      />

      {/* Sign In Button */}
      <TouchableOpacity style={styles.signInButton}>
        <Text style={styles.signInText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2B2C5A',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#F7EEDB',
    fontFamily: 'Georgia',
    textAlign: 'left',
    marginLeft: 6,
  },
  labelEmail: {
    color: '#F7D491',
    marginTop: 32,
    marginLeft: 6,
    marginBottom: 4,
    fontWeight: '600',
  },
  inputEmail: {
    borderColor: '#F7D491',
    borderWidth: 2,
    borderRadius: 20,
    padding: 14,
    color: '#F7EEDB',
    marginBottom: 20,
  },
  labelPassword: {
    color: '#8BBCA6',
    marginLeft: 6,
    marginBottom: 4,
    fontWeight: '600',
  },
  inputPassword: {
    borderColor: '#8BBCA6',
    borderWidth: 2,
    borderRadius: 20,
    padding: 14,
    color: '#F7EEDB',
    marginBottom: 30,
  },
  signInButton: {
    backgroundColor: '#DD775C',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  signInText: {
    color: '#2B2C5A',
    fontSize: 18,
    fontWeight: '700',
  },

  // Floating circles
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.9,
  },
  circleTopLeft: {
    backgroundColor: '#DD775C',
    width: 280,
    height: 280,
    top: -80,
    left: -80,
  },
  circleTopRight: {
    backgroundColor: '#8BBCA6',
    width: 130,
    height: 130,
    top: -20,
    right: -40,
  },
  circleMidSmall: {
    backgroundColor: '#F7D491',
    width: 70,
    height: 70,
    top: 100,
    right: 40,
  },
  circleBottomLeft: {
    backgroundColor: '#8BBCA6',
    width: 100,
    height: 100,
    bottom: 160,
    left: -30,
  },
  circleBottomRight: {
    backgroundColor: '#F7D491',
    width: 300,
    height: 300,
    bottom: -60,
    right: -100,
  },
  circleTiny: {
    backgroundColor: '#DD775C',
    width: 40,
    height: 40,
    bottom: 120,
    left: 20,
  },
});
