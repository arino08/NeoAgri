const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add tflite to the asset extensions so the model is bundled
config.resolver.assetExts.push('tflite');

module.exports = config;
