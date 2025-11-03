const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration with JavaScript obfuscation
 * Obfuscates JavaScript code to prevent reverse engineering
 */

const config = getDefaultConfig(__dirname);

// Enable JavaScript obfuscation in production builds
if (process.env.NODE_ENV === 'production') {
  const obfuscatorOptions = {
    // Compact output
    compact: true,
    
    // Control flow flattening - makes code harder to read
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    
    // Dead code injection - adds fake code
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    
    // Debug protection - prevents debugging
    debugProtection: false, // Set to true in production if needed
    debugProtectionInterval: 0,
    
    // Disable console output
    disableConsoleOutput: true,
    
    // Identifier names generation
    identifierNamesGenerator: 'hexadecimal',
    
    // Rename global identifiers
    renameGlobals: false, // Can break React Native
    
    // Rename properties (careful with this)
    renameProperties: false, // Can break React Native
    
    // Self defending code (prevents code beautification)
    selfDefending: true,
    
    // String array encoding
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.75,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    
    // Transform object keys
    transformObjectKeys: true,
    
    // Unicode escape sequence
    unicodeEscapeSequence: false,
    
    // Seed for random generator (for reproducible builds)
    seed: 12345,
    
    // Source maps (disable in production for security)
    sourceMap: false,
    sourceMapMode: 'separate',
    
    // Split strings
    splitStrings: true,
    splitStringsChunkLength: 10,
    
    // Reserved names (don't obfuscate these)
    reservedNames: [
      // React Native core
      'React',
      'Component',
      'PureComponent',
      'useState',
      'useEffect',
      'useContext',
      'useCallback',
      'useMemo',
      'useRef',
      'StyleSheet',
      'View',
      'Text',
      'Image',
      'TouchableOpacity',
      'ScrollView',
      'FlatList',
      'SafeAreaView',
      
      // Navigation
      'navigation',
      'route',
      'navigate',
      
      // Common props
      'props',
      'state',
      'children',
      'style',
      'onPress',
      'onChange',
      
      // Keep API-related names
      'fetch',
      'axios',
      'get',
      'post',
      'put',
      'delete',
      
      // Keep error handling
      'error',
      'catch',
      'then',
      'finally'
    ],
    
    // Reserved strings (don't encrypt these)
    reservedStrings: [
      // API endpoints
      '/api',
      'https',
      'http',
      
      // Environment variables
      'REACT_APP',
      'NODE_ENV',
      'production',
      'development'
    ]
  };
  
  // Apply obfuscation transformer
  config.transformer = {
    ...config.transformer,
    minifierConfig: obfuscatorOptions
  };
}

module.exports = config;
