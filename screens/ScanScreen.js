import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ScanScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const json = await response.json();
      const product = json.product;

      if (product) {
        const newItem = {
          id: Date.now().toString(),
          barcode: data,
          name: product.product_name || 'Unknown Product',
          brand: product.brands || '',
          expiryDate: '',
          location: 'Fridge',
          quantity: 1,
          addedDate: new Date().toISOString()
        };

        Alert.alert(
          'Item Found',
          `${newItem.name}\nDo you want to add it?`,
          [
            { text: 'Cancel', onPress: () => navigation.goBack() },
            {
              text: 'Add',
              onPress: async () => {
                const stored = await AsyncStorage.getItem('pantryItems');
                const items = stored ? JSON.parse(stored) : [];
                items.push(newItem);
                await AsyncStorage.setItem('pantryItems', JSON.stringify(items));
                Alert.alert('Success', 'Item added to inventory!');
                navigation.navigate('Home');
              }
            }
          ]
        );
      } else {
        Alert.alert('Not Found', 'Could not find product. Try manual entry next version.');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to lookup product');
      navigation.goBack();
    }
  };

  if (hasPermission === null) return <Text>Requesting camera permission...</Text>;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' }
});