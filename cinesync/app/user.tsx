import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '@/FirebaseConfig';
import styles from '../styles/User.styles';

const User = () => {
  const [username, setUsername] = useState('User');
  const [bio, setBio] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showGenreSelector, setShowGenreSelector] = useState(false);

  const isDarkMode = theme === 'dark';
  const router = useRouter();

  const themeStyles = {
    backgroundColor: isDarkMode ? '#121212' : '#ffffff',
    textColor: isDarkMode ? '#ffffff' : '#000000',
    inputBackground: isDarkMode ? '#1e1e1e' : '#f0f0f0',
    inputBorderColor: isDarkMode ? '#444' : '#ccc',
    highlightColor: '#f0c94d',
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const toggleGenre = (genre: string) => {
    if (favoriteGenres.includes(genre)) {
      setFavoriteGenres(favoriteGenres.filter((g) => g !== genre));
    } else {
      setFavoriteGenres([...favoriteGenres, genre]);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const genreOptions = [
    'Fantasy',
    'Sci-fi',
    'Comedy',
    'Drama',
    'Horror',
    'Romance',
    'Action',
    'Mystery',
    'Documentary',
  ];

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backText, { color: themeStyles.highlightColor }]}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeStyles.textColor }]}>Profile</Text>
          <TouchableOpacity>
            <Text style={[styles.saveButtonText, { color: themeStyles.textColor }]}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          <View style={[styles.avatar, { backgroundColor: themeStyles.highlightColor, overflow: 'hidden' }]}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={80} color={isDarkMode ? '#121212' : '#ffffff'} />
            )}
          </View>
        </TouchableOpacity>

        {/* Username */}
        <TextInput
          style={[
            styles.usernameInput,
            {
              color: themeStyles.textColor,
              borderColor: themeStyles.textColor,
            },
          ]}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor="#888"
          textAlign="center"
        />

        {/* Bio */}
        <View style={styles.bioContainer}>
          <TextInput
            style={[
              styles.bioInput,
              {
                color: themeStyles.textColor,
                borderColor: themeStyles.inputBorderColor,
                backgroundColor: themeStyles.inputBackground,
              },
            ]}
            placeholder="Write your bio..."
            placeholderTextColor="#888"
            multiline
            value={bio}
            onChangeText={setBio}
            maxLength={150}
            numberOfLines={4}
          />
          <Text style={[styles.charCount, { color: '#888' }]}>{bio.length}/150</Text>
        </View>

        {/* Favorite Genres */}
        <View style={styles.infoSection}>
        <TouchableOpacity onPress={() => setShowGenreSelector(true)}>
            <Text style={[styles.label, { color: themeStyles.textColor }]} numberOfLines={0} >
            Favorite Genres:{' '}
            <Text style={styles.genres}>
                {favoriteGenres.length > 0
                ? favoriteGenres.filter((genre) => genre.trim() !== '').join(', ')
                : 'None'}
            </Text>
            </Text>
        </TouchableOpacity>
        </View>

        {/* Theme Toggle */}
        <View style={[styles.infoSection, { marginTop: 20 }]}>
          <Text style={[styles.label, { color: themeStyles.textColor }]}>Theme: </Text>
          <Pressable onPress={() => setTheme('dark')}>
            <Ionicons
              name="moon"
              size={30}
              color={theme === 'dark' ? themeStyles.highlightColor : themeStyles.textColor}
              style={{ marginHorizontal: 8 }}
            />
          </Pressable>
          <Pressable onPress={() => setTheme('light')}>
            <Ionicons
              name="sunny"
              size={30}
              color={theme === 'light' ? themeStyles.highlightColor : themeStyles.textColor}
              style={{ marginHorizontal: 8 }}
            />
          </Pressable>
        </View>

        {/* Logout */}
        <Pressable
          style={[styles.logoutButton, { backgroundColor: isDarkMode ? '#ffffff' : '#121212' }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: isDarkMode ? '#121212' : '#ffffff' }]}>Logout</Text>
        </Pressable>

        {/* Genre Selector Modal */}
        <Modal visible={showGenreSelector} animationType="slide" transparent>
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
            <View style={[styles.modalContent, { backgroundColor: themeStyles.backgroundColor }]}>
              <Text style={[styles.modalTitle, { color: themeStyles.textColor }]}>Select Favorite Genres</Text>
              <ScrollView>
                {genreOptions.map((genre) => (
                  <TouchableOpacity
                    key={genre}
                    style={[
                      styles.genreOption,
                      {
                        backgroundColor: favoriteGenres.includes(genre)
                          ? themeStyles.highlightColor
                          : themeStyles.inputBackground,
                        borderColor: themeStyles.inputBorderColor,
                      },
                    ]}
                    onPress={() => toggleGenre(genre)}
                  >
                    <Text
                      style={{
                        color: favoriteGenres.includes(genre) ? '#000' : themeStyles.textColor,
                      }}
                    >
                      {genre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: themeStyles.highlightColor }]}
                onPress={() => setShowGenreSelector(false)}
              >
                <Text style={{ color: '#000' }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </TouchableWithoutFeedback>
  );
};

export default User;