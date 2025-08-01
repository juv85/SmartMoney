import { PermissionsAndroid, Platform } from 'react-native';

export async function ensureStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    {
      title: 'Storage Permission Required',
      message: 'App needs access to your storage to load model files',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    }
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}