const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /\.local\/.*/,
  /commercial\/.*/,
  /artifacts\/.*/,
  /store-assets\/.*/,
];

module.exports = config;
