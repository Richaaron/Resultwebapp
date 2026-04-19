import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export const useCamera = () => {
  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // Allows user to choose between camera and gallery
        width: 600,
        height: 600
      });

      return image.dataUrl;
    } catch (error) {
      console.error('Camera error:', error);
      return null;
    }
  };

  return {
    takePhoto
  };
};
