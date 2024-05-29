import {CameraView, CameraProps, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import MlkitOcr from 'react-native-mlkit-ocr';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';


export default function AppCamera() {
  // @ts-ignore: just being lazy with types here
  const cameraRef = useRef<CameraView>(undefined);
  const [facing, setFacing] = useState<CameraProps["facing"]>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [pickedImagePath, setPickedImagePath] = useState('');
  const [image, setImage] = useState(null);
  
  const [extractedText, setExtractedText] = useState('');
  const [carNumberLines, setCarNumberLines] = useState<string[]>([]);
  const [carNumbers, setCarNumbers] = useState<string[]>([]);

  const carNumberPattern = /\b[A-Za-z0-9 ]{1,6}\b/g;

  const saveAndReadPhoto = async () => {
    try {

      const photo = await cameraRef.current?.takePictureAsync();

      // Request camera roll permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
       alert('Sorry, we need camera roll permissions to save photos!');
        return;
      }
  
      // Save the photo to the media library
      const asset = await MediaLibrary.createAssetAsync(photo.uri);
      
  
      const pickedImage = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });


      alert("Image Picker Result:", pickedImage); // Log the entire result for debugging

      // Check if MlkitOcr is properly initialized
      if (!MlkitOcr || typeof MlkitOcr.detectFromUri !== 'function') {
        throw new Error('MlkitOcr is not initialized correctly.');
      }
    
      // Perform OCR on the saved photo
      const ocrResult = await MlkitOcr.detectFromUri(pickedImage.assets[0].uri);
  
      const text = ocrResult.map(block => block.text).join('\n');

      setExtractedText(text)
     
      const linesWithCarNumbers = extractedText.split('\n').filter(line => carNumberPattern.test(line));
      setCarNumberLines(linesWithCarNumbers)

      const carNumberMatches = linesWithCarNumbers
        .flatMap(line => line.match(carNumberPattern) || [])
        .filter(Boolean);

      setCarNumbers(carNumberMatches);

    } catch (error) {
      // Log and alert the error
      alert(JSON.stringify(error, Object.getOwnPropertyNames(error)))
      console.log(JSON.stringify(error, Object.getOwnPropertyNames(error)))
    }
  };
  
  

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
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
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* Overlap the camera preview with a transparent button container for visual appeal */}
        <TouchableOpacity style={styles.buttonContainer} onPress={() => { }}>
          {/* Empty onPress handler to prevent unnecessary actions */}
        </TouchableOpacity>

        {/* Add the control buttons directly inside the CameraView */}
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
       {extractedText !== '' && (
        <View style={styles.container}>
          <Text>{extractedText}</Text>
        </View>
      )}

      {carNumbers.length > 0 && (
        <View style={styles.container}>
          <Text>Detected Car Numbers:</Text>
          {carNumbers.map((number, index) => (
            <Text key={index}>{number}</Text>
          ))}
        </View>
      )}
    </View>
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
    marginTop:'15%',
    right: '1%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cameraPanel: {
    position: 'absolute',
    bottom: 30, // Adjust as needed
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf:'center',
    paddingHorizontal: 20,
  },
  flipButton: {
    backgroundColor: 'grey',
    padding: 5,
    borderRadius: 20,
  },
  captureButton: {
    backgroundColor: 'yellow',
    padding: 7,
    borderRadius: 20,
  },
  permissionsContainer: {
    flex: 1,
    marginTop:'25%',
    marginBottom:'25%',
  }
});
