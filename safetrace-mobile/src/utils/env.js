import Constants, { ExecutionEnvironment } from 'expo-constants';

// executionEnvironment is the modern, reliable way to detect Expo Go.
// appOwnership is deprecated and may return null in some SDK 54 configurations.
export const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
