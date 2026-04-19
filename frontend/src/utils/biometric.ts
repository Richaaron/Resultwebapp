import { NativeBiometric } from 'capacitor-native-biometric';
import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'biometric_credentials';

export const useBiometrics = () => {
  const isAvailable = async () => {
    try {
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable;
    } catch {
      return false;
    }
  };

  const getBiometryType = async () => {
    try {
      const result = await NativeBiometric.isAvailable();
      return result.biometryType; // BiometryType.FaceId, TouchId, etc.
    } catch {
      return null;
    }
  };

  const setCredentials = async (username: string, password: string, server: string) => {
    await NativeBiometric.setCredentials({
      username,
      password,
      server,
    });
    await Preferences.set({ key: STORAGE_KEY, value: 'true' });
  };

  const getCredentials = async (server: string) => {
    try {
      return await NativeBiometric.getCredentials({
        server,
      });
    } catch (error) {
      console.error('Failed to get biometric credentials', error);
      return null;
    }
  };

  const clearCredentials = async (server: string) => {
    await NativeBiometric.deleteCredentials({
      server,
    });
    await Preferences.remove({ key: STORAGE_KEY });
  };

  const isConfigured = async () => {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    return value === 'true';
  };

  const authenticate = async (reason: string = 'Authenticate to login') => {
    try {
      await NativeBiometric.verifyIdentity({
        reason,
        title: 'Biometric Login',
        subtitle: 'Log in to your account',
        description: 'Use your fingerprint or Face ID',
      });
      return true;
    } catch (error) {
      console.error('Biometric authentication failed', error);
      return false;
    }
  };

  return {
    isAvailable,
    getBiometryType,
    setCredentials,
    getCredentials,
    clearCredentials,
    isConfigured,
    authenticate,
  };
};
