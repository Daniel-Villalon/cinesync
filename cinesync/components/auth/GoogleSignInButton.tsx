import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { useGoogleAuth } from '@/services/auth/googleAuth';
import { GoogleIcon } from '@/components/GoogleIcon';

interface Props {
  onSignInComplete?: (success: boolean) => void;
}

export function GoogleSignInButton({ onSignInComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const { handleSignIn } = useGoogleAuth();

  const onPress = async () => {
    setLoading(true);
    try {
      const result = await handleSignIn();
      onSignInComplete?.(result.success);
      
      if (!result.success) {
        console.error('Sign in failed:', result.error?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.contentWrapper}>
        <View style={styles.iconWrapper}>
          {loading ? (
            <ActivityIndicator size="small" color="#3c4043" />
          ) : (
            <GoogleIcon />
          )}
        </View>
        <Text style={styles.text}>Continue with Google</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ffffff',
    height: 40,
    minWidth: 240,
    paddingHorizontal: 12,
    marginVertical: 8,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    overflow: 'hidden',
  },
  buttonDisabled: {
    backgroundColor: '#f1f1f1',
    opacity: 0.9,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#3c4043',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.25,
  },
}); 