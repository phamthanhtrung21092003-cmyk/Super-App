import { Stack } from 'expo-router';

export default function EducationRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="student" />
      <Stack.Screen name="principal" />
      <Stack.Screen name="teacher" />
      <Stack.Screen name="parent" />
    </Stack>
  );
}
