import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { saveItem } from '../utils/storage';

export default function ScanScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

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

  if (hasPermission === null) return <Text style={styles.center}>Requesting camera...</Text>;
  if (hasPermission === false) return <Text style={styles.center}>No camera permission</Text>;

  return (
    <View style={styles.container}>
      <BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={StyleSheet.absoluteFillObject} />
      {scanned && <Button title="Scan Again" onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  center: { flex: 1, textAlign: 'center', marginTop: 50, fontSize: 18 }
});