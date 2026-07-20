const projectConfigAndroid = require('@react-native-community/cli-config-android');

module.exports = {
  platforms: {
    android: {
      projectConfig: projectConfigAndroid.projectConfig,
      dependencyConfig: projectConfigAndroid.dependencyConfig,
    },
  },
  project: {
    android: {
      sourceDir: './android',
      appName: 'app',
      packageName: 'com.trung219203.superappmobile',
    },
  },
};
