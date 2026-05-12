import React from 'react';
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

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { currentUser } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {currentUser ? (
        // Logged in screens
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Scan" component={ScanScreen} options={{ headerShown: true, title: 'Scan Barcode' }} />
          <Stack.Screen name="Inventory" component={InventoryScreen} options={{ headerShown: true, title: 'My Inventory' }} />
        </>
      ) : (
        // Auth screens
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