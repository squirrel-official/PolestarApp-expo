import React, { useState, useRef } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View, TextInput, KeyboardAvoidingView } from "react-native";
import Slider from '@react-native-community/slider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import { CameraView, CameraProps, useCameraPermissions } from "expo-camera";
import MlkitOcr from 'react-native-mlkit-ocr';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function AppCamera() {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraProps["facing"]>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [carNumber, setCarNumber] = useState('');
  const [zoom, setZoom] = useState(0); // Zoom state

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
      // const carNumber = "1022MF"
      setCarNumber(carNumber);
    } catch (error) {
      console.log(JSON.stringify(error, Object.getOwnPropertyNames(error)));
    }
  };


  const checkCarRegistration = (regoNumber) => {
    var url = "https://api.mynetra.com/check-registration?regoNumber=" + regoNumber
    alert('checkCarRegistration')
    alert(JSON.stringify(regoNumber))
    axios.get(url)
      .then(response => {
        alert(JSON.stringify(response.data))
        alert(JSON.stringify(response.data.registrationInfo))
      })
      .catch(error => {
        alert(JSON.stringify(error.message));
      });
  };

  const handleChange = (text) => {
    setCarNumber(text);
  };

  const cancelEditing = () => {
    // clearing the car number
    setCarNumber('');
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

        {carNumber.length > 0 && (
          <View>
            <Text style={styles.detectedCarNumbersTitle}>Detected Car Numbers:</Text>
            <View style={styles.detectedCarNumbersContainer}>
              <View style={styles.textInputContainer}>
            <TextInput
              value={carNumber}
              onChangeText={(text) => handleChange(text)}
                  style={styles.carNumberInput}
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
        )}

    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  flipPanel: {
    position: 'absolute',
    marginTop: '15%',
    right: '1%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cameraPanel: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  flipButton: {
    backgroundColor: 'transparent', // Remove background
    padding: 5,
    borderRadius: 20,
  },
  captureButton: {
    backgroundColor: 'yellow',
    padding: 7,
    borderRadius: 20,
  },
  zoomControl: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    height: '70%',
    width: 40,
  },
  slider: {
    flex: 1,
    transform: [{ rotate: '270deg' }],
  },
  permissionsContainer: {
    flex: 1,
    marginTop: '25%',
    marginBottom: '25%',
  },
  detectedCarNumbersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detectedCarNumbersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  textInputContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  textInput: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#33CC33', // Consider a green color
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
    flex: 1,
    marginLeft: 5,
  },
  cancelButton: {
    backgroundColor: '#FF0000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
    flex: 1,
    marginRight: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  captureButtonText: {
    color: 'white',
    fontSize: 16,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Align controls to the right
  },
  carNumberInput: {
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});
