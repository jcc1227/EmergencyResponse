import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '@/config/api';

import UserLogin from '@/screens/UserLogin';
import UserDashboard from '@/screens/UserDashboard';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: { email: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const handleLogin = async (email: string, token: string) => {
    await SecureStore.setItemAsync('userToken', token);
    await SecureStore.setItemAsync('userEmail', email);
    setIsAuthenticated(true);
    setUserEmail(email);
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userEmail');
    // Only remove userId, do NOT touch alertHistory
    try { await AsyncStorage.removeItem('userId'); } catch {}
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  // Background poller: keep local alertHistory updated from the server
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const startPolling = () => {
      if (pollRef.current) return;
      pollRef.current = setInterval(async () => {
        try {
          const raw = await AsyncStorage.getItem('alertHistory');
          if (!raw) return;
          let local: any[] = [];
          try { local = JSON.parse(raw); } catch { return; }

          // Find alerts that are not resolved/cancelled and have an id
          const toCheck = local.filter(a => a && a.id && a.status && a.status !== 'resolved' && a.status !== 'cancelled');
          if (toCheck.length === 0) return;

          let changed = false;
          for (const item of toCheck) {
            try {
              const res = await fetch(`${API_URL}/alerts/${item.id}`);
              if (!res.ok) continue;
              const body = await res.json();
              const serverStatus = body.alert?.status;
              if (serverStatus && (serverStatus === 'resolved' || serverStatus === 'cancelled')) {
                // update local record
                for (let i = 0; i < local.length; i++) {
                  if (local[i].id === item.id) {
                    local[i].status = serverStatus === 'resolved' ? 'resolved' : 'cancelled';
                    changed = true;
                    break;
                  }
                }
              }
            } catch (e) {
              // ignore individual fetch errors
            }
          }

          if (changed) {
            try { await AsyncStorage.setItem('alertHistory', JSON.stringify(local)); } catch {}
          }
        } catch (e) {
          // ignore top-level errors
        }
      }, 10000);
    };

    startPolling();
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current as NodeJS.Timeout);
        pollRef.current = null;
      }
    };
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Dashboard">
            {(props) => (
              <UserDashboard 
                {...props} 
                email={userEmail!} 
                onLogout={handleLogout} 
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login">
            {(props) => (
              <UserLogin 
                {...props} 
                onLogin={handleLogin} 
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
