import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { FIREBASE_AUTH } from '@/FirebaseConfig';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { GoogleSignInResult } from './authTypes';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = "your-web-client-id";
const IOS_CLIENT_ID = "259419561288-8f4tvvmh572s0lmbpmmgdedu4be5bklo.apps.googleusercontent.com";
const ANDROID_CLIENT_ID = "your-android-client-id";
const EXPO_CLIENT_ID = "your-expo-client-id"; // For Expo Go

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: EXPO_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  const handleSignIn = async (): Promise<GoogleSignInResult> => {
    try {
      const result = await promptAsync();
      
      if (result.type !== 'success') {
        return {
          success: false,
          error: { code: 'cancelled', message: 'User cancelled the sign-in process' }
        };
      }

      const { id_token, access_token } = result.params;
      await SecureStore.setItemAsync('google_token', id_token);

      // Create Firebase credential with both tokens
      const credential = GoogleAuthProvider.credential(id_token, access_token);
      const userCredential = await signInWithCredential(FIREBASE_AUTH, credential);

      if (!userCredential.user.email) {
        throw new Error('No email found in Google account');
      }

      return {
        success: true,
        user: {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || '',
          photoURL: userCredential.user.photoURL || '',
          uid: userCredential.user.uid,
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
    isReady: !!request, // Helpful for UI state
  };
}