import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import ScanScreen from "./screens/ScanScreen";
import InventoryScreen from "./screens/InventoryScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
<<<<<<< Updated upstream
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Scan" 
          component={ScanScreen} 
          options={{ title: 'Scan Barcode' }} 
        />
        <Stack.Screen 
          name="Inventory" 
          component={InventoryScreen} 
          options={{ title: 'My Inventory' }} 
=======
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Pantry Pal 🥬" }}
        />
        <Stack.Screen
          name="Scan"
          component={ScanScreen}
          options={{ title: "Scan Barcode" }}
        />
        <Stack.Screen
          name="Inventory"
          component={InventoryScreen}
          options={{ title: "My Inventory" }}
>>>>>>> Stashed changes
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
