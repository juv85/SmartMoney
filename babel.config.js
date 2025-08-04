module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { 'legacy': true }], // Must be first
    ['@nozbe/babel-plugin-watermelondb', {
      // You can specify your database path here if it's not the default
      // For now, leave it as default if your models are in `src/models`
      // or specify the path to your `src/models` directory.
      // For example: { 'databasePath': 'src/models' }
    }],
    // Other plugins you might have, e.g., 'react-native-reanimated/plugin'
  ],
};
