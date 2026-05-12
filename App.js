import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './context/AuthContext';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import InventoryScreen from './screens/InventoryScreen';
import AddItemScreen from './screens/AddItemScreen';
import ProfileScreen from './screens/ProfileScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import MealSuggestionsScreen from './screens/MealSuggestionsScreen';
import ProDashboardScreen from './screens/ProDashboardScreen';
import { registerForPushNotifications, scheduleExpiringNotifications } from './utils/notifications';
import { loadItems } from './utils/firestoreStorage';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      registerForPushNotifications();
      const checkExpiring = async () => {
        const items = await loadItems();
        await scheduleExpiringNotifications(items);
      };
      checkExpiring();
    }
  }, [currentUser]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {currentUser ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Scan" component={ScanScreen} options={{ headerShown: true, title: 'Scan Barcode' }} />
          <Stack.Screen name="AddItem" component={AddItemScreen} options={{ headerShown: true, title: 'Add Item' }} />
          <Stack.Screen name="Inventory" component={InventoryScreen} options={{ headerShown: true, title: 'My Inventory' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Profile' }} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: true, title: 'Pantry Pal Pro' }} />
          <Stack.Screen name="MealSuggestions" component={MealSuggestionsScreen} options={{ headerShown: true, title: 'Meal Suggestions' }} />
          <Stack.Screen name="ProDashboard" component={ProDashboardScreen} options={{ headerShown: true, title: 'Pantry Pal Pro' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = React.useState(true);

  const handleSplashFinish = () => {
    setIsSplashVisible(false);
  };

  if (isSplashVisible) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}