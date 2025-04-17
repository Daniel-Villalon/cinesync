import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { FIREBASE_AUTH } from '@/FirebaseConfig';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { GoogleSignInResult } from './authTypes';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = "259419561288-b6i6j8kbhe4g5p7h0ti30fmh79fmfojm.apps.googleusercontent.com";
const IOS_CLIENT_ID = "259419561288-8f4tvvmh572s0lmbpmmgdedu4be5bklo.apps.googleusercontent.com";
const EXPO_CLIENT_ID = WEB_CLIENT_ID; // Using web client ID for Expo Go

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: EXPO_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  const handleSignIn = async (): Promise<GoogleSignInResult> => {
    try {
      const result = await promptAsync();
      
      if (result.type !== 'success') {
        throw new Error('Google Sign In was cancelled or failed');
      }

      const { id_token } = result.params;
      await SecureStore.setItemAsync('google_token', id_token);

      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(FIREBASE_AUTH, credential);

      return {
        success: true,
        user: {
          email: userCredential.user.email!,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
        },
      };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return {
        success: false,
        error: {
          code: error.code || 'unknown',
          message: error.message || 'An unknown error occurred',
        },
      };
    }
  };

  return {
    request,
    response,
    handleSignIn,
  };
} 