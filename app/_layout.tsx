import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { WorkoutProvider } from "@/context/WorkoutContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    Font.loadAsync(Ionicons.font).then(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  return (
    <WorkoutProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1a1a1a" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "4-Day Split", headerShown: false }} />
        <Stack.Screen
          name="workout/[day]"
          options={{ title: "Workout", headerShown: true }}
        />
      </Stack>
    </WorkoutProvider>
  );
}
