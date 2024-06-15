import React, { useState, useRef } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, KeyboardAvoidingView } from "react-native";
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
import styles from  '../assets/style/style'


export default function AppCamera() {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraProps["facing"]>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [carNumber, setCarNumber] = useState('');
  const [zoom, setZoom] = useState(0); // Zoom state
  const [loading, setLoading] = useState(false);
  const [showCarNumbers, setShowCarNumbers] = useState(false);
  const [registrationInfo, setRegistrationInfo] = useState(null);
  const [validRegistration, setValidRegistration] = useState(false);
  const [expiredRegistration, setExpiredRegistration] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const carNumberPattern = /\b[A-Za-z0-9 ]{5,6}\b/g;

  const saveAndReadPhoto = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync();
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to save photos!');
        return;
      }
      await MediaLibrary.createAssetAsync(photo.uri);

      const pickedImage = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!MlkitOcr || typeof MlkitOcr.detectFromUri !== 'function') {
      throw new Error('MlkitOcr is not initialized correctly.');
    }
    const ocrResult = await MlkitOcr.detectFromUri(pickedImage.assets[0].uri);
    const carNumber = ocrResult.map(block => block.text).join('\n');
    // const carNumber = "ABC201"
    setCarNumber(carNumber);
    setShowCarNumbers(true);
    } catch (error) {
      console.log(JSON.stringify(error, Object.getOwnPropertyNames(error)));
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
        if (!MlkitOcr || typeof MlkitOcr.detectFromUri !== 'function') {
          throw new Error('MlkitOcr is not initialized correctly.');
        }
        const ocrResult = await MlkitOcr.detectFromUri(pickedImage.uri);
        const carNumber = ocrResult.map(block => block.text).join('\n');
        setCarNumber(carNumber);
        setShowCarNumbers(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkCarRegistration = () => {
    var url = "https://api.mynetra.com/check-registration?regoNumber="+ carNumber;
    setLoading(true);
    setShowCarNumbers(false);
    axios.get(url)
      .then(response => {
        var registrationInfo =  response.data.registrationInfo;
        var registrationStatus = registrationInfo.registrationStatus.toLowerCase();
        setRegistrationInfo(registrationInfo)
        setValidRegistration(registrationStatus.includes("current"))
        setExpiredRegistration(registrationStatus.includes("expired"))
      })
      .catch(error => {
        setShowMessage(true);
        alert(JSON.stringify(error.message));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChange = (text) => {
    setCarNumber(text);
  };

  const cancelEditing = () => {
    setCarNumber('');
  };

 const clearRegistrationInfo = () =>{
    setRegistrationInfo(null)
  }

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
          
          {/* Use the imported custom button component */}
          <SelectGalleryButton
            style={styles.galleryButton}
            onPress={openGallery} // Use the function to open gallery
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
          <SafeAreaView style={styles.detectedCarNumbersContainer}>
            <ScrollView contentContainerStyle={styles.scrollView}>
              <View style={styles.card}>
                <Text style={styles.title}>Vehicle Registration Details</Text>
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>Registration Number:</Text>
                  <Text style={styles.value}>{registrationInfo.registrationNumber}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>Status: </Text>
                  <Text style={validRegistration ? styles.value : styles.expiredStatus}>
                    {registrationInfo.registrationStatus}
                  </Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>Body Type:</Text>
                  <Text style={styles.value}>{registrationInfo.bodyType}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>Colour: </Text>
                  <Text style={styles.value}>{registrationInfo.colour}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>Make: </Text>
                  <Text style={styles.value}>{registrationInfo.make}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>Model: </Text>
                  <Text style={styles.value}>{registrationInfo.model}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>Transfer In Dispute: </Text>
                  <Text style={styles.value}>{registrationInfo.transferInDispute}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>Written off:</Text>
                  <Text style={styles.value}>{registrationInfo.writtenOff}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>Stolen: </Text>
                  <Text style={styles.value}>{registrationInfo.stolen}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>Engine Number: </Text>
                  <Text style={styles.value}>{registrationInfo.engineNumber}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>VIN Number: </Text>
                  <Text style={styles.value}>{registrationInfo.vinNumber}</Text>
                </View>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity style={styles.closeButton} onPress={clearRegistrationInfo}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}

        {showCarNumbers && (
          <SafeAreaView style={styles.detectedCarNumbersContainer}>
            <ScrollView contentContainerStyle={styles.scrollView}>
              <View style={styles.card}>
                <Text style={styles.detectedCarNumbersTitle}>Detected Car Number</Text>
                <View style={styles.detectedCarNumbersContainer}>
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
        )}
      </View>
    </KeyboardAvoidingView>
  );
}


