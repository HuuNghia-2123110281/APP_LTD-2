import { Stack } from 'expo-router';


export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' },
        animation: 'fade',
        presentation: 'card',
      }}>
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          title: '',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: false,
          title: '',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: false,
          title: '',
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}