import React, { useState, useRef } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, KeyboardAvoidingView } from "react-native";
import Slider from '@react-native-community/slider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import { CameraView, CameraProps, useCameraPermissions } from "expo-camera";
import MlkitOcr from 'react-native-mlkit-ocr';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import SelectGalleryButton from "./SelectGalleryButton"; // Importing the custom button component
import styles from '../assets/style/style';
import CarRegistrationInfo from "./CarRegistrationInfo";
import DetectedCarNumberPanel from "./DetectedCarNumberPanel";

export default function AppCamera() {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraProps["facing"]>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [carNumber, setCarNumber] = useState('');
  const [zoom, setZoom] = useState(0); // Zoom state
  const [loading, setLoading] = useState(false);
  const [showCarNumbers, setShowCarNumbers] = useState(false);
  const [registrationInfo, setRegistrationInfo] = useState(null);
  const [validRegistration, setValidRegistration] = useState(false); // Added state
  const [expiredRegistration, setExpiredRegistration] = useState(false); // Added state
  const [showMessage, setShowMessage] = useState(false);

  const carNumberPattern = /\b[A-Za-z0-9 ]{5,6}\b/g;

  const processImageAndOCR = async (imageUri) => {
    try {
      if (!MlkitOcr || typeof MlkitOcr.detectFromUri !== 'function') {
        throw new Error('MlkitOcr is not initialized correctly.');
      }
      const ocrResult = await MlkitOcr.detectFromUri(imageUri);
      const carNumber = ocrResult.map(block => block.text).join('\n');
      setCarNumber(carNumber);
      setShowCarNumbers(true);
    } catch (error) {
      console.error('Error processing image and OCR:', error);
      // Handle error gracefully, e.g., show an error message
    }
  };

  const saveAndReadPhoto = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync();
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to save photos!');
        return;
      }
      await MediaLibrary.createAssetAsync(photo.uri);
      await processImageAndOCR(photo.uri);
    } catch (error) {
      console.error('Error saving and reading photo:', error);
      // Handle error gracefully, e.g., show an error message
    }
  };

  const openGallery = async () => {
    try {
      const pickedImage = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!pickedImage.cancelled) {
        await processImageAndOCR(pickedImage.uri);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      // Handle error gracefully, e.g., show an error message
    }
  };

  const checkCarRegistration = () => {
    setLoading(true);
    setShowCarNumbers(false);
    axios.get(`https://api.mynetra.com/check-registration?regoNumber=${carNumber}`)
      .then(response => {
        const registrationInfo = response.data.registrationInfo;
        const registrationStatus = registrationInfo.registrationStatus.toLowerCase();
        setRegistrationInfo(registrationInfo);
        // Assuming these states are derived from registrationStatus
        const isValid = registrationStatus.includes("current");
        const isExpired = registrationStatus.includes("expired");
        setValidRegistration(isValid);
        setExpiredRegistration(isExpired);
      })
      .catch(error => {
        setShowMessage(true);
        console.error('Error checking car registration:', error);
        // Handle error gracefully, e.g., show an error message
      })
      .finally(() => setLoading(false));
  };

  const handleChange = (text) => {
    setCarNumber(text);
  };

  const cancelEditing = () => {
    setCarNumber('');
  };

  const clearRegistrationInfo = () => {
    setRegistrationInfo(null);
    setValidRegistration(false); // Reset validity state
    setExpiredRegistration(false); // Reset expiry state
  };

  const handleDismissMessage = () => {
    setShowMessage(false);
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionsContainer}>
        <Text style={{ textAlign: "center" }}>
          Kindly provide permission to show the camera.
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing} zoom={zoom} ref={cameraRef}>
          <TouchableOpacity style={styles.buttonContainer} onPress={() => { }} />

          <View style={styles.flipPanel}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <MaterialIcons name="flip-camera-ios" size={30} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.cameraPanel}>
            <TouchableOpacity style={styles.captureButton} onPress={saveAndReadPhoto}>
              <Fontisto name="camera" size={30} color="black" />
            </TouchableOpacity>
          </View>

          <SelectGalleryButton
            style={styles.galleryButton}
            onPress={openGallery}
            title="Gallery"
          />
        </CameraView>

        <View style={styles.zoomControl}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={0.1}
            value={zoom}
            onValueChange={(value) => setZoom(value)}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
          />
        </View>

        <Spinner
          visible={loading}
          size='large'
          textContent={'Verifying the details...'}
          textStyle={{ color: '#FFF' }}
        />

        {showMessage && (
          <SafeAreaView style={styles.detectedCarNumbersContainer}>
            <ScrollView contentContainerStyle={styles.scrollView}>
              <View style={styles.messageContainer}>
                <View>
                  <Text style={styles.title}>Unfortunately we could not verify the registration, kindly check the number again.</Text>
                  <TouchableOpacity onPress={handleDismissMessage} style={styles.dismissButton}>
                    <Text style={styles.dismissButtonText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}

        {registrationInfo && (
          <CarRegistrationInfo
            registrationInfo={registrationInfo}
            onClose={clearRegistrationInfo}
          />
        )}

        {showCarNumbers && (
          <DetectedCarNumberPanel
            carNumber={carNumber}
            handleChange={handleChange}
            cancelEditing={cancelEditing}
            checkCarRegistration={checkCarRegistration}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

