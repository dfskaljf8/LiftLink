// Mock for react-native-image-picker
const ImagePicker = {
  launchCamera: (options, callback) => {
    console.log('ImagePicker.launchCamera called with:', options);
    const response = {
      assets: [{
        uri: 'mock://camera-image.jpg',
        type: 'image/jpeg',
        fileSize: 1024,
        fileName: 'camera-image.jpg',
        width: 800,
        height: 600,
      }],
    };
    if (callback) callback(response);
    return Promise.resolve(response);
  },
  launchImageLibrary: (options, callback) => {
    console.log('ImagePicker.launchImageLibrary called with:', options);
    const response = {
      assets: [{
        uri: 'mock://library-image.jpg',
        type: 'image/jpeg',
        fileSize: 1024,
        fileName: 'library-image.jpg',
        width: 800,
        height: 600,
      }],
    };
    if (callback) callback(response);
    return Promise.resolve(response);
  },
  MediaType: {
    photo: 'photo',
    video: 'video',
    mixed: 'mixed',
  },
};

export default ImagePicker;