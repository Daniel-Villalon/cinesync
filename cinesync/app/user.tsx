import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/User.styles';

const User = () => {
    const [username, setUsername] = useState('User');
    const [bio, setBio] = useState('');
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const isDarkMode = theme === 'dark';

    const navigation = useNavigation();

    const themeStyles = {
        backgroundColor: isDarkMode ? '#121212' : '#ffffff',
        textColor: isDarkMode ? '#ffffff' : '#000000',
        inputBackground: isDarkMode ? '#1e1e1e' : '#f0f0f0',
        inputBorderColor: isDarkMode ? '#444' : '#ccc',
        highlightColor: '#f0c94d',
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
                
                {/* Header */}
                <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[styles.backText, { color: themeStyles.highlightColor }]}>{'< Back'}</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: themeStyles.textColor }]}>Profile</Text>
                <TouchableOpacity>
                    <Text style={[styles.saveButtonText, { color: themeStyles.textColor }]}>Save</Text>
                </TouchableOpacity>
                </View>

                {/* Existing content */}
                <TouchableOpacity style={styles.avatarContainer}>
                    <View style={[styles.avatar, { backgroundColor: themeStyles.highlightColor }]}>
                        <Ionicons name="person" size={80} color={isDarkMode ? '#121212' : '#ffffff'} />
                        <View style={[styles.editIcon, { backgroundColor: themeStyles.highlightColor }]}>
                            <Ionicons name="pencil" size={20} color={isDarkMode ? '#000' : '#000'} />
                        </View>
                    </View>
                </TouchableOpacity>

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
                        maxLength={250}
                        numberOfLines={4}
                    />
                    <Text style={[styles.charCount, { color: '#888' }]}>{bio.length}/150</Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={[styles.label, { color: themeStyles.textColor }]}>
                        Favorite Genres: <Text style={{ color: themeStyles.highlightColor }}>Sci-fi, Comedy</Text>
                    </Text>
                </View>

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

                <Pressable style={[styles.logoutButton, { backgroundColor: isDarkMode ? '#ffffff' : '#121212' }]}>
                    <Text style={[styles.logoutText, { color: isDarkMode ? '#121212' : '#ffffff' }]}>Logout</Text>
                </Pressable>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default User;
