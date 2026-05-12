import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Modal, TextInput, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveItem } from '../utils/storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FOOD_EMOJIS = ['🍎', '🥑', '🥦', '🍞', '🥓', '🍒', '🥬', '🍌', '🥜', '🍪'];

export default function ScanScreen({ navigation }) {
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

  // Animated scanning line (fixed - using translateY)
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
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const data = await response.json();
      if (data.status === 1 && data.product) {
        return {
          name: data.product.product_name || `Product ${barcode.slice(-6)}`,
          brand: data.product.brands || '',
          image: data.product.image_url || null,
        };
      }
    } catch (e) {
      console.log('API error:', e);
    }
    return { name: `Product ${barcode.slice(-6)}`, brand: '', image: null };
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;
    setScanned(true);

    const product = await lookupProduct(data);

    setScannedItem({
      barcode: data,
      name: product.name,
      brand: product.brand,
      image: product.image,
    });
    setItemName(product.name);
    setExpiryDate(null);
    setShowAddModal(true);
  };

  const triggerFoodConfetti = () => {
    setShowConfetti(true);
    confettiAnims.length = 0;

    for (let i = 0; i < 12; i++) {
      const anim = {
        translateY: new Animated.Value(SCREEN_HEIGHT * 0.6),
        translateX: new Animated.Value(Math.random() * SCREEN_WIDTH - 50),
        rotate: new Animated.Value(0),
        opacity: new Animated.Value(1),
        emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
      };
      confettiAnims.push(anim);

      Animated.parallel([
        Animated.timing(anim.translateY, {
          toValue: -100,
          duration: 1400 + Math.random() * 600,
          useNativeDriver: true,
        }),
        Animated.timing(anim.rotate, {
          toValue: Math.random() > 0.5 ? 1 : -1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 1600,
          delay: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }

    setTimeout(() => {
      setShowConfetti(false);
      confettiAnims.length = 0;
    }, 2200);
  };

  const handleAddToPantry = async () => {
    if (!scannedItem) return;

    await saveItem({
      name: itemName.trim() || scannedItem.name,
      barcode: scannedItem.barcode,
      expiry: expiryDate ? expiryDate.toISOString().split('T')[0] : null,
      addedAt: new Date().toISOString(),
      brand: scannedItem.brand,
    });

    setShowAddModal(false);
    setScanned(false);
    setScannedItem(null);

    // Trigger the fun food emoji animation
    triggerFoodConfetti();

    setTimeout(() => {
      Alert.alert('Added! 🎉', `${itemName} is now in your pantry!`, [
        { text: 'Scan More', onPress: () => setScanned(false) },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    }, 800);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setExpiryDate(selectedDate);
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

      {/* Add Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Pantry</Text>

            <TextInput
              style={styles.input}
              value={itemName}
              onChangeText={setItemName}
              placeholder="Item name"
            />

            {scannedItem?.brand ? <Text style={styles.brandText}>Brand: {scannedItem.brand}</Text> : null}

            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>
                {expiryDate ? `Expires: ${expiryDate.toDateString()}` : 'Set Expiration Date (optional)'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker value={expiryDate || new Date()} mode="date" display="default" onChange={onDateChange} />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setShowAddModal(false); setScanned(false); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={handleAddToPantry}>
                <Text style={styles.addText}>Add to Pantry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Food Emoji Confetti */}
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {confettiAnims.map((anim, index) => (
            <Animated.Text
              key={index}
              style={{
                position: 'absolute',
                fontSize: 32,
                transform: [
                  { translateX: anim.translateX },
                  { translateY: anim.translateY },
                  { rotate: anim.rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
                ],
                opacity: anim.opacity,
              }}
            >
              {anim.emoji}
            </Animated.Text>
          ))}
        </View>
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '90%', maxWidth: 340 },
  modalTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 16 },
  brandText: { color: '#666', marginBottom: 12, fontSize: 14 },
  dateButton: { backgroundColor: '#f0f0f0', padding: 14, borderRadius: 10, marginBottom: 20 },
  dateButtonText: { textAlign: 'center', fontSize: 16, color: '#333' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelButton: { flex: 1, padding: 14, alignItems: 'center', marginRight: 8, borderRadius: 10, backgroundColor: '#eee' },
  cancelText: { color: '#333', fontWeight: '600' },
  addButton: { flex: 1, padding: 14, alignItems: 'center', marginLeft: 8, borderRadius: 10, backgroundColor: '#22c55e' },
  addText: { color: '#fff', fontWeight: '700' },
  confettiContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
});