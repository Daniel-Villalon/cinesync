import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { updateCurrentUser } from 'firebase/auth';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { styles } from '../styles/SignUp.styles';

const { width, height } = Dimensions.get('window');

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const db = FIRESTORE_DB;
  const router = useRouter();
  const signUp = async () => {
    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const userRef = doc(db, "users", user.uid); 
        setDoc(userRef, {
          email: user.email,
          createdAt: new Date(),
          groups: [],
        });
        updateCurrentUser(auth, user)
      })
      .catch((error) => {
        // Handle errors
      });
      alert("w sign up")
    } catch (error: any) {
      console.log(error);
      alert('Sign up failed: ' + error.message)
    } finally {
      setLoading(false);
    }
  }
  function login() {
    router.push('/login');
   }
  return (
    <View style={styles.container}>
      {/* Text Title */}
      <Text style={styles.title}>Create an</Text>
      <Text style={styles.title}>Account</Text>

      {/* Email Field */}
      <Text style={styles.labelEmail}>Email Address*</Text>
      <TextInput
        value={email}
        placeholder="Email"
        placeholderTextColor="#E8EDDF"
        style={styles.inputEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(text) => setEmail(text)}
      />

      {/* Password Field */}
      <TextInput
        value={password}
        placeholder="Password*"
        placeholderTextColor="#E8EDDF"
        style={styles.inputPassword}
        secureTextEntry={true}
        autoCapitalize="none"
        onChangeText={(text) => setPassword(text)}
      />

      {/* Sign In Button */}
      <TouchableOpacity onPress={signUp} style={styles.signInButton}>
        <Text style={styles.signInText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.loginButton}>
              <Text style={styles.greyText}>Already have an account? </Text>
              <TouchableOpacity onPress={login}>
                <Text style={styles.registerLink}>Login</Text>
              </TouchableOpacity>
      </View>
    </View>
  );
}
