// src/components/GenreFilter.tsx
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface GenreFilterProps {
  genre: string;
  onGenreChange: (value: string) => void;
}

const GenreFilter: React.FC<GenreFilterProps> = ({ genre, onGenreChange }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Filter by genre..."
        value={genre}
        onChangeText={onGenreChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
});

export default GenreFilter;