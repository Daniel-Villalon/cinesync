import { FIREBASE_AUTH } from '@/FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { styles } from "../styles/SignIn.styles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';


export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const auth = FIREBASE_AUTH;

  // For remembering users
  useEffect(() => {
    const loadRememberedInfo = async () => {
      try {
        const remembered = await AsyncStorage.getItem('rememberMe');
        const storedEmail = await AsyncStorage.getItem('rememberedEmail');
  
        if (remembered === 'true' && storedEmail) {
          setRememberMe(true);
          setEmail(storedEmail);
        }
      } catch (error) {
        console.log('Failed to load remembered user:', error);
      }
    };
  
    loadRememberedInfo();
  }, []);
  

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log('Signed in!', response.user.email);
      if (rememberMe) {
        await AsyncStorage.setItem('rememberMe', 'true');
        await AsyncStorage.setItem('rememberedEmail', email);
      } else {
        await AsyncStorage.removeItem('rememberMe');
        await AsyncStorage.removeItem('rememberedEmail');
      }
      // layout.tsx will redirect automatically
    } catch (error: any) {
      console.log(error);
      alert('Sign in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // implement
  function register() {
    router.push('/SignUp');
   }
  
  return (
    <View style={styles.container}>

      {/* Text Title */}
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.title}>Back</Text>

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
      { loading ? (
        <ActivityIndicator size="large" color="0000ff" />
      ) :  (
        <>

      {/* Remember Me Button */}
      <TouchableOpacity
        style={styles.rememberMeContainer}
        onPress={() => setRememberMe(!rememberMe)}
      >
        <View style={[styles.checkbox, rememberMe && styles.checkboxSelected]}>
          {rememberMe && <Ionicons name="checkmark" size={20} color='black' />}
        </View>
        <Text style={styles.rememberMeText}>Remember Me</Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <TouchableOpacity onPress={signIn} style={styles.signInButton}>
        <Text style={styles.signInText} >Sign In</Text>
      </TouchableOpacity>
      </>
      )}
      {/* if someone wants to register from the sign in page, they can press the register button
      !!! Need to implement register function to route user */}
      <View style={styles.registerButton}>
        <Text style={styles.greyText}>Don’t have an account? </Text>
        <TouchableOpacity onPress={register}>
          <Text style={styles.registerLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}