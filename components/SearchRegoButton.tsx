import React from 'react';
import { TouchableOpacity, StyleSheet, Image } from 'react-native';

const SearchRegoButton = ({onPress, style }) => {
  const defaultSearchIcon = 'https://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/search-icon.png';
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Image source={{ uri: defaultSearchIcon }} style={styles.icon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 30,
    height: 30,
  },
});

export default SearchRegoButton;
