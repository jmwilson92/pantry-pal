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
    Alert.prompt(
      'Item Scanned',
      `Barcode: ${data}\n\nEnter item name or leave as is:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (name) => {
            const itemName = name || `Item ${data.substring(0,8)}`;
            await saveItem({
              id: Date.now().toString(),
              name: itemName,
              barcode: data,
              expiry: 'NA',
              added: new Date().toISOString()
            });
            Alert.alert('Saved!', `${itemName} added to pantry`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
          }
        }
      ]
    );
  };

  if (hasPermission === null) return <Text style={styles.center}>Requesting camera...</Text>;
  if (hasPermission === false) return <Text style={styles.center}>No camera permission</Text>;

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title="Scan Again" onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', fontSize: 18 }
});