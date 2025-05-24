// src/components/GenreFilter.tsx
import React from 'react';
import { View, TextInput } from 'react-native';
import { styles } from '@/styles/GenreFilter.styles';

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

export default GenreFilter;