import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { saveItem } from '../utils/storage';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    const productName = `Product ${data.slice(-6)}`;
    
    Alert.alert(
      'Item Scanned',
      `Found: ${productName}`,
      [
        {
          text: 'Add to Pantry',
          onPress: async () => {
            await saveItem({
              name: productName,
              barcode: data,
              expiry: null,
              addedAt: new Date().toISOString(),
            });
            setScanned(false);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setScanned(false),
        },
      ]
    );
  };

  // Permission not yet requested
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back to Pantry</Text>
      </TouchableOpacity>

      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_e', 'upc_a', 'code128', 'code39', 'qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.instruction}>Align barcode within the frame</Text>
        </View>
      </CameraView>

      {scanned && (
        <TouchableOpacity 
          style={styles.scanAgainButton}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: { 
    position: 'absolute', 
    top: 60, 
    left: 20, 
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  camera: { 
    flex: 1,
    width: '100%',
  },
  overlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 180,
    borderWidth: 3,
    borderColor: '#22c55e',
    borderRadius: 12,
  },
  instruction: {
    color: '#fff',
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    zIndex: 20,
  },
  scanAgainText: { 
    color: '#000', 
    fontSize: 16, 
    fontWeight: '700' 
  },
});