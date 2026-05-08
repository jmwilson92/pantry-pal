import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert, Animated, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveItem } from '../utils/storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pendingItem, setPendingItem] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const snackAnims = useRef([]).current;

  const createSnackAnims = () => {
    const snacks = ['🥜', '🍎', '🥕', '🥬', '🌶️', '🥝', '🍌'];
    snackAnims.length = 0;
    
    for (let i = 0; i < 8; i++) {
      const anim = {
        emoji: snacks[Math.floor(Math.random() * snacks.length)],
        translateX: new Animated.Value(Math.random() * SCREEN_WIDTH - 50),
        translateY: new Animated.Value(SCREEN_HEIGHT * 0.15),
        scale: new Animated.Value(0.5),
        opacity: new Animated.Value(1),
        rotate: new Animated.Value(0),
      };
      snackAnims.push(anim);
    }
  };

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
              triggerCelebration('Food added! ✅');
              setTimeout(() => {
                setScanned(false);
              }, 1500);
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
      setShowDateModal(false);
      triggerCelebration('Food added! ✅');
      setTimeout(() => {
        setScanned(false);
        setPendingItem(null);
      }, 1500);
    }
  };

  const triggerCelebration = (message) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    createSnackAnims();
    
    Animated.timing(celebrationAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    
    snackAnims.forEach((snack, index) => {
      const delay = index * 80;
      const randomX = (Math.random() - 0.5) * 300;
      const randomY = Math.random() * 200 + 100;
      
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(snack.translateX, {
            toValue: randomX,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(snack.translateY, {
            toValue: randomY,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(snack.scale, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(snack.rotate, {
            toValue: (Math.random() - 0.5) * 2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(snack.opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(snack.opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }, delay);
    });
    
    setTimeout(() => {
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowCelebration(false);
        celebrationAnim.setValue(0);
      });
    }, 3000); // Now 3 seconds
  };

  if (!permission) return <Text style={styles.center}>Requesting camera...</Text>;
  if (!permission.granted) return <Text style={styles.center}>No camera permission</Text>;

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  const celebrationTranslate = celebrationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
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

      {showCelebration && (
        <View style={styles.celebrationContainer}>
          <Animated.View 
            style={[styles.celebrationBanner, { transform: [{ translateY: celebrationTranslate }] }]}
          >
            <Text style={styles.celebrationText}>{celebrationMessage}</Text>
          </Animated.View>
          
          {snackAnims.map((snack, index) => (
            <Animated.Text
              key={index}
              style={{
                position: 'absolute',
                fontSize: 28,
                opacity: snack.opacity,
                transform: [
                  { translateX: snack.translateX },
                  { translateY: snack.translateY },
                  { scale: snack.scale },
                  { rotate: snack.rotate.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ['-30deg', '30deg'],
                  }) }
                ],
              }}
            >
              {snack.emoji}
            </Animated.Text>
          ))}
        </View>
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
  celebrationContainer: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 100,
  },
  celebrationBanner: {
    position: 'absolute',
    top: 20, // Very top
    backgroundColor: '#00ff9f',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  celebrationText: { color: '#000', fontSize: 22, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, width: '90%', maxWidth: 380, alignItems: 'center' },
  modalTitle: { color: '#000000', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { backgroundColor: '#f0f0f0', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  confirmBtn: { backgroundColor: '#00ff9f', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#000000', fontSize: 16, fontWeight: '600' },
});