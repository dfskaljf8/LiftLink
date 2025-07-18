// Mock for react-native-document-picker
const DocumentPicker = {
  pick: (options) => {
    console.log('DocumentPicker.pick called with:', options);
    return Promise.resolve([{
      uri: 'mock://document.pdf',
      name: 'mock_document.pdf',
      type: 'application/pdf',
      size: 1024,
    }]);
  },
  pickSingle: (options) => {
    console.log('DocumentPicker.pickSingle called with:', options);
    return Promise.resolve({
      uri: 'mock://document.pdf',
      name: 'mock_document.pdf',
      type: 'application/pdf',
      size: 1024,
    });
  },
  isCancel: (error) => error.code === 'DOCUMENT_PICKER_CANCELED',
  types: {
    allFiles: '*/*',
    images: 'image/*',
    plainText: 'text/plain',
    audio: 'audio/*',
    pdf: 'application/pdf',
  },
};

export default DocumentPicker;