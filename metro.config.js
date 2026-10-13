// Learn more https://docs.expo.dev/guides/customizing-metro/
// Sentry's Expo Metro config adds Debug IDs so production stack traces can be symbolicated.
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

module.exports = config;
