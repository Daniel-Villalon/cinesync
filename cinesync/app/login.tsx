import { FIREBASE_AUTH } from '@/FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { styles } from "../styles/SignIn.styles";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log('Signed in!', response.user.email);
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