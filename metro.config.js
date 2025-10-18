const { withNativeWind } = require('nativewind/metro');
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");
const path = require('path');

const config = getSentryExpoConfig(__dirname);

// Add comprehensive path resolution for @ alias
config.resolver = {
  ...config.resolver,
  alias: {
    '@': path.resolve(__dirname, '.'),
    '@/components': path.resolve(__dirname, 'components'),
    '@/constants': path.resolve(__dirname, 'constants'),
    '@/lib': path.resolve(__dirname, 'lib'),
    '@/store': path.resolve(__dirname, 'store'),
    '@/assets': path.resolve(__dirname, 'assets'),
  },
};

module.exports = withNativeWind(config, { input: './app/globals.css' })