import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Priority: runtime env (process.env.API_URL) -> expo extra (app.json) -> sensible defaults
const expoExtraApi = (Constants.expoConfig && (Constants.expoConfig as any).extra && (Constants.expoConfig as any).extra.API_URL) ||
  (Constants.manifest && (Constants.manifest as any).extra && (Constants.manifest as any).extra.API_URL);

const envApi = (process && (process as any).env && (process as any).env.API_URL) || null;

function defaultForPlatform() {
  // For web running on dev machine
  if (Platform.OS === 'web') return 'http://localhost:5000/api';

  // Android emulator on Windows/mac uses 10.0.2.2 to reach host machine
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api';

  // iOS simulator can use localhost
  return 'http://localhost:5000/api';
}

export const API_URL = envApi || expoExtraApi || defaultForPlatform();

export default API_URL;
