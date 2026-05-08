import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert, Animated, Modal, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveItem } from '../utils/storage';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pendingItem, setPendingItem] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastAnim = useRef(new Animated.Value(-400)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (!scanned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(scanLineAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scanLineAnim.stopAnimation();
      pulseAnim.stopAnimation();
    }
  }, [scanned]);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const json = await response.json();
      const productName = json.product ? json.product.product_name || 'Unknown Item' : 'Unknown Item';
      
      setPendingItem({ name: productName, barcode: data });
      
      Alert.alert(
        '✅ Item Found!',
        `Name: ${productName}`,
        [
          { 
            text: 'Add with NA expiry', 
            onPress: () => {
              saveItem({ name: productName, barcode: data, expiry: 'NA' });
              showSlidingToast('Food added! ✅');
              setTimeout(() => {
                setScanned(false);
                navigation.navigate('Inventory');
              }, 1200);
            }
          },
          { 
            text: 'Add expiry date', 
            onPress: () => {
              setShowDateModal(true);
            }
          },
          { text: 'Cancel', onPress: () => setScanned(false) }
        ]
      );
    } catch (e) {
      setScanned(false);
    }
  };

  const handleDateConfirm = () => {
    if (pendingItem) {
      saveItem({ 
        name: pendingItem.name, 
        barcode: pendingItem.barcode, 
        expiry: selectedDate.toISOString().split('T')[0] 
      });
      showSlidingToast('Food added! ✅');
      setTimeout(() => {
        setShowDateModal(false);
        setScanned(false);
        setPendingItem(null);
        navigation.navigate('Inventory');
      }, 1200);
    }
  };

  const showSlidingToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    
    Animated.timing(toastAnim, {
      toValue: 20,
      duration: 400,
      useNativeDriver: true,
    }).start();
    
    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -400,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setShowToast(false);
        toastAnim.setValue(-400);
      });
    }, 2000);
  };

  if (!permission) return <Text style={styles.center}>Requesting camera...</Text>;
  if (!permission.granted) return <Text style={styles.center}>No camera permission</Text>;

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

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

      <View style={styles.overlay}>
        <Animated.View style={[styles.scanBox, { transform: [{ scale: pulseAnim }] }]}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineTranslate }] }]} />
        </Animated.View>
        <Text style={styles.instruction}>Align barcode inside the box</Text>
      </View>

      {scanned && <Button title="Scan Again" onPress={() => setScanned(false)} />}

      {showToast && (
        <Animated.View 
          style={[styles.toast, { transform: [{ translateX: toastAnim }] }]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <Modal visible={showDateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Expiry Date</Text>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={(event, date) => date && setSelectedDate(date)}
              minimumDate={new Date()}
              style={{ width: 320, height: 200 }}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowDateModal(false); setScanned(false); }}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleDateConfirm}>
                <Text style={styles.btnText}>Add to Pantry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  center: { flex: 1, textAlign: 'center', marginTop: 50, fontSize: 18 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanBox: { width: 280, height: 280, borderWidth: 3, borderColor: '#00ff9f', backgroundColor: 'transparent', position: 'relative' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#00ff9f', borderWidth: 4 },
  topLeft: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: '#00ff9f', shadowColor: '#00ff9f', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10 },
  instruction: { color: '#fff', fontSize: 16, marginTop: 30, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  toast: { 
    position: 'absolute', 
    top: 80, 
    left: 0,
    backgroundColor: '#00ff9f', 
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, width: '90%', maxWidth: 380, alignItems: 'center' },
  modalTitle: { color: '#000000', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { backgroundColor: '#f0f0f0', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  confirmBtn: { backgroundColor: '#00ff9f', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#000000', fontSize: 16, fontWeight: '600' },
});