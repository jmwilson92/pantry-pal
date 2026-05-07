import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function ScanScreen() {
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    Alert.alert('Scanned!', `Barcode: ${data}`, [
      { text: 'Add Item', onPress: () => console.log('Add item logic here') }
    ]);
  };

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Text style={styles.scanAgain}>Tap to scan again</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scanAgain: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10 }
});
