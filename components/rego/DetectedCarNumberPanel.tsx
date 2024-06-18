import React from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from '../../assets/style/style'; // Importing styles from your styles.js file

const DetectedCarNumberPanel = ({ carNumber, headingText, handleChange, cancelEditing, checkCarRegistration }) => {
  return (
    <SafeAreaView style={styles.detectedCarNumbersContainer}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.card}>
          <Text style={styles.detectedCarNumbersTitle}>{headingText}</Text>
          <View style={styles.detectedCarNumbersContent}>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={carNumber}
                onChangeText={handleChange}
              />
            </View>
          </View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={checkCarRegistration}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetectedCarNumberPanel;
