import React from 'react';
import { TouchableOpacity, StyleSheet, Image } from 'react-native';

const SelectGalleryButton = ({ onPress, imageUri, style }) => {
  const defaultImageUri = 'https://icons.iconarchive.com/icons/praveen/minimal-outline/512/gallery-icon.png';

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Image source={{ uri: imageUri || defaultImageUri }} style={styles.image} />
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
  image: {
    width: 30,
    height: 30, 
  },
});


export default SelectGalleryButton;
