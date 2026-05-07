import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { saveItem } from '../utils/storage';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const json = await response.json();
      const productName = json.product ? json.product.product_name || 'Unknown Item' : 'Unknown Item';
      
      Alert.alert('✅ Item Found!', `Name: ${productName}`, [
        { text: 'Cancel', onPress: () => setScanned(false) },
        { text: 'Add with NA expiry', onPress: () => {
          saveItem({ name: productName, barcode: data, expiry: 'NA' });
          navigation.navigate('Inventory');
        }}
      ]);
    } catch (e) {
      Alert.alert('Barcode Scanned', `Code: ${data}`, [
        { text: 'Add Manually', onPress: () => navigation.navigate('Inventory') }
      ]);
    }
  };

  if (!permission) return <Text style={styles.center}>Requesting camera...</Text>;
  if (!permission.granted) return <Text style={styles.center}>No camera permission</Text>;

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_e', 'upc_a', 'qr', 'code39', 'code128'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      {scanned && <Button title="Scan Again" onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  center: { flex: 1, textAlign: 'center', marginTop: 50, fontSize: 18 }
});