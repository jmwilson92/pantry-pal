import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Alert, 
  Animated, 
  Dimensions 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveItem } from '../utils/firestoreStorage';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FOOD_EMOJIS = ['🍎', '🥑', '🥦', '🍞', '🥓', '🍒', '🥬', '🍌', '🥜', '🍪'];

export default function AddItemScreen({ navigation, route }) {
  const { currentUser } = useAuth();
  const [name, setName] = useState(route?.params?.name || '');
  const [barcode, setBarcode] = useState(route?.params?.barcode || '');
  const [location, setLocation] = useState('Pantry');
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const confettiAnims = useRef([]).current;

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'We need access to your photos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'We need camera access');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const triggerFoodConfetti = () => {
    setShowConfetti(true);
    confettiAnims.length = 0;

    for (let i = 0; i < 14; i++) {
      const anim = {
        translateY: new Animated.Value(SCREEN_HEIGHT * 0.7),
        translateX: new Animated.Value(Math.random() * SCREEN_WIDTH - 50),
        rotate: new Animated.Value(0),
        opacity: new Animated.Value(1),
        emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
      };
      confettiAnims.push(anim);

      Animated.parallel([
        Animated.timing(anim.translateY, {
          toValue: -120,
          duration: 1300 + Math.random() * 700,
          useNativeDriver: true,
        }),
        Animated.timing(anim.rotate, {
          toValue: Math.random() > 0.5 ? 1 : -1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 1500,
          delay: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }

    setTimeout(() => {
      setShowConfetti(false);
      confettiAnims.length = 0;
    }, 2000);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }
    setLoading(true);

    const item = {
      name: name.trim(),
      barcode: barcode || null,
      location,
      quantity,
      expiry: expiryDate ? expiryDate.toISOString().split('T')[0] : null,
      hasExpiry: !!expiryDate,
      photoUri: photoUri || null,
      userId: currentUser.uid,
    };

    await saveItem(item);
    setLoading(false);

    triggerFoodConfetti();

    setTimeout(() => {
      navigation.goBack();
    }, 1800);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add to Pantry</Text>

      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={name}
        onChangeText={setName}
      />

      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.photoPreview} />
      )}

      <View style={styles.photoButtons}>
        <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
          <Text style={styles.photoButtonText}>📷 Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          <Text style={styles.photoButtonText}>🖼️ Choose Photo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateButtonText}>
          {expiryDate ? `Expires: ${expiryDate.toDateString()}` : 'Set Expiration Date (optional)'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={expiryDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setExpiryDate(selectedDate);
          }}
        />
      )}

      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Saving...' : 'Add to Pantry'}
        </Text>
      </TouchableOpacity>

      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {confettiAnims.map((anim, index) => (
            <Animated.Text
              key={index}
              style={{
                position: 'absolute',
                fontSize: 36,
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
  container: {
    flex: 1,
    backgroundColor: '#f8f1e9',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3f2a1d',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8d9c2',
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#e8d9c2',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  photoButtonText: {
    color: '#3f2a1d',
    fontWeight: '600',
  },
  dateButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8d9c2',
  },
  dateButtonText: {
    color: '#3f2a1d',
    fontSize: 16,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#22c55e',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
});