import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Modal, TextInput, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveItem } from '../utils/firestoreStorage';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FOOD_EMOJIS = ['🍎', '🥑', '🥦', '🍞', '🥓', '🍒', '🥬', '🍌', '🥜', '🍪'];

export default function ScanScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [scannedItem, setScannedItem] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [itemName, setItemName] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef([]).current;
  const productCache = useRef(new Map()).current;

  useEffect(() => {
    if (!scanned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
    return () => scanLineAnim.stopAnimation();
  }, [scanned]);

  const lookupProduct = async (barcode) => {
    if (productCache.has(barcode)) {
      return productCache.get(barcode);
    }

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const contentType = response.headers.get('content-type');
      
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        if (response.status === 429) {
          console.log('Open Food Facts rate limit hit - using fallback name');
        }
        const fallback = { name: `Product ${barcode.slice(-6)}`, brand: '', image: null };
        productCache.set(barcode, fallback);
        return fallback;
      }

      const data = await response.json();

      if (data.status === 1 && data.product) {
        const result = {
          name: data.product.product_name || `Product ${barcode.slice(-6)}`,
          brand: data.product.brands || '',
          image: data.product.image_url || null,
        };
        productCache.set(barcode, result);
        return result;
      }
    } catch (e) {
      console.log('API error (handled):', e.message);
    }

    const fallback = { name: `Product ${barcode.slice(-6)}`, brand: '', image: null };
    productCache.set(barcode, fallback);
    return fallback;
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;
    setScanned(true);

    const product = await lookupProduct(data);

    navigation.navigate('AddItem', {
      name: product.name,
      barcode: data,
      brand: product.brand,
    });
  };

  if (!permission) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_e', 'upc_a', 'code128', 'code39', 'qr'],
        }}
      />

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.scanFrame} />
        
        <Animated.View
          style={[
            styles.scanLine,
            {
              transform: [{
                translateY: scanLineAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [80, 280],
                }),
              }],
            },
          ]}
        />

        <Text style={styles.instruction}>Align barcode within the frame</Text>
      </View>

      {scanned && (
        <TouchableOpacity style={styles.scanAgainButton} onPress={() => setScanned(false)}>
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 280, height: 200, borderWidth: 3, borderColor: '#22c55e', borderRadius: 12 },
  scanLine: { position: 'absolute', width: 260, height: 5, backgroundColor: '#ef4444', borderRadius: 3 },
  instruction: { position: 'absolute', bottom: 80, color: '#fff', fontSize: 16, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  backButton: { position: 'absolute', top: 60, left: 20, zIndex: 30, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  scanAgainButton: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: '#22c55e', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 25, zIndex: 20 },
  scanAgainText: { color: '#000', fontSize: 16, fontWeight: '700' },
  permissionText: { color: '#fff', fontSize: 18, marginBottom: 20, textAlign: 'center' },
  permissionButton: { backgroundColor: '#22c55e', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 25 },
  permissionButtonText: { color: '#000', fontSize: 16, fontWeight: '700' },
});