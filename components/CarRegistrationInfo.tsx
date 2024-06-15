import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../assets/style/style"; // Adjust the import path based on your actual file structure

const CarRegistrationInfo = ({ registrationInfo, onClose }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vehicle Registration Details</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Registration Number:</Text>
        <Text style={styles.value}>{registrationInfo.registrationNumber}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{registrationInfo.registrationStatus}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Body Type:</Text>
        <Text style={styles.value}>{registrationInfo.bodyType}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Colour:</Text>
        <Text style={styles.value}>{registrationInfo.colour}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Make:</Text>
        <Text style={styles.value}>{registrationInfo.make}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Model:</Text>
        <Text style={styles.value}>{registrationInfo.model}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Transfer In Dispute:</Text>
        <Text style={styles.value}>{registrationInfo.transferInDispute}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Written off:</Text>
        <Text style={styles.value}>{registrationInfo.writtenOff}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Stolen:</Text>
        <Text style={styles.value}>{registrationInfo.stolen}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Engine Number:</Text>
        <Text style={styles.value}>{registrationInfo.engineNumber}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>VIN Number:</Text>
        <Text style={styles.value}>{registrationInfo.vinNumber}</Text>
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CarRegistrationInfo;
