import React from 'react';
import { TouchableOpacity, StyleSheet, Image } from 'react-native';
import searchIcon from '../../assets/images/icons/search-icon.png'

const SearchRegoButton = ({ onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Image source={searchIcon} style={styles.icon} />
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
