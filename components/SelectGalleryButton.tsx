import React from 'react';
import { TouchableOpacity, StyleSheet, Image } from 'react-native';
import searchIcon from '../assets/images/icons/gallery-icon.png'

const SelectGalleryButton = ({ onPress, style }) => {

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Image source={searchIcon} style={styles.image} />
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
