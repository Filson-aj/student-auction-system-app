import { Stack } from 'expo-router';

export default function AdminLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="listings" />
            <Stack.Screen name="users" />
            <Stack.Screen name="analytics" />
        </Stack>
    );
}