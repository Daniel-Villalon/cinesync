import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FIREBASE_STORAGE } from '@/FirebaseConfig';
import { Platform } from 'react-native';

export const uploadImageToStorage = async (
  imageUri: string, 
  path: string
): Promise<string> => {
  try {
    console.log('uploadImageToStorage called with:', { imageUri, path });
    
    // For web development, return the original URI for now to avoid CORS issues
    if (Platform.OS === 'web' && imageUri.startsWith('data:')) {
      console.log('Development mode - using base64 URI directly');
      return imageUri;
    }
    
    // Convert the image URI to a blob
    console.log('Fetching image from URI...');
    const response = await fetch(imageUri);
    console.log('Fetch response status:', response.status);
    
    const blob = await response.blob();
    console.log('Blob created, size:', blob.size, 'type:', blob.type);
    
    // Create a reference to the storage location
    const imageRef = ref(FIREBASE_STORAGE, path);
    console.log('Storage reference created for path:', path);
    
    // Upload the image
    console.log('Starting upload to Firebase Storage...');
    await uploadBytes(imageRef, blob);
    console.log('Upload to storage completed');
    
    // Get the download URL
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(imageRef);
    console.log('Download URL obtained:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Fallback: return the original URI for development
    if (Platform.OS === 'web') {
      console.log('Fallback: using original URI due to upload error');
      return imageUri;
    }
    
    throw new Error('Failed to upload image');
  }
};

export const generateImagePath = (userId: string, type: 'avatar' | 'group', id?: string): string => {
  const timestamp = Date.now();
  
  if (type === 'avatar') {
    return `users/${userId}/avatar_${timestamp}.jpg`;
  } else {
    return `groups/${id || 'temp'}/image_${timestamp}.jpg`;
  }
}; 