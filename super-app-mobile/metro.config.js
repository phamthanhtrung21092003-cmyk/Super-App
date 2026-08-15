// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Block corrupted / unreadable file paths on Windows NTFS
config.resolver = config.resolver || {};
config.resolver.blockList = [
  /node_modules[\\/]\.es-abstract-.*/,
  /node_modules[\\/]es-abstract[\\/](2018|2019)[\\/]IsAccessorDescriptor\.js/
];

module.exports = config;
