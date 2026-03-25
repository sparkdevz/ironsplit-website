import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { WorkoutProvider } from "@/context/WorkoutContext";

export default function RootLayout() {
  return (
    <WorkoutProvider>
      <StatusBar style="light" />
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
