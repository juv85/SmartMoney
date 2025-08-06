## SmartMoney: AI-Powered Mobile Money Management

This document outlines the **SmartMoney** project, an innovative React Native mobile application that uses an on-device AI model, **Gemma 3n**, to manage mobile money transactions. The app automatically tracks, categorizes, and analyzes financial activities from SMS notifications while ensuring user privacy.

-----

### Key Features

  * **AI-Powered Transaction Parsing**: Uses Gemma 3n to intelligently extract financial details like the amount, fees, balance, transaction ID, and involved parties from SMS messages.
  * **Automated Categorization**: Automatically classifies transactions into categories like "Incoming Transfer," "Outgoing Transfer," "Deposit," "Withdrawal," and "Mobile Payment."
  * **On-Device Privacy**: All sensitive data processing and AI inference happen directly on the user's device. Financial information never leaves the phone.
  * **Local Data Persistence**: Stores all transactions, accounts, and SMS records securely in a local SQLite database.
  * **Intuitive Dashboard**: Provides a clear overview of financial activity, including total income, expenses, and transfers.
  * **Detailed Views**: Users can explore specific transactions and see aggregated data for each category.
  * **Robust SMS Management**: Tracks processed messages to prevent duplicate entries and maintain data integrity.

-----

### Technical Stack

  * **Frontend**: React Native
  * **AI Model**: Gemma 3n (for on-device inference)
  * **Database**: React Native SQLite Database (`react-native-sqlite-storage`)
  * **Navigation**: `@react-navigation/stack`
  * **State Management**: React's built-in `useState` and `useEffect` hooks
  * **Unique IDs**: `uuid`
  * **Permissions**: `PermissionsAndroid` and `Linking` (for Android runtime permissions)

-----

### Project Structure

```
SmartMoney/
├── App.jsx
├── babel.config.js
├── package.json
└── src/
    ├── assets/
    ├── components/
    ├── database/
    │   ├── db-service.js
    │   └── schema.js
    ├── screens/
    │   ├── Splashscreen.jsx
    │   ├── WelcomeScreen.jsx
    │   ├── OnboardingScreen.jsx
    │   ├── LoadingScreen.jsx
    │   ├── HomeScreen.jsx
    │   ├── DetailClasseScreen.jsx
    │   └── DetailTransactionScreen.jsx
    └── utils/
        ├── smsProcessor.js
        ├── gemmaParser.js
        └── PermissionManager.js
```

-----

### Getting Started (Android)

> **Note**: Ensure you have a React Native environment set up before proceeding. This project is for Android only.

1.  **Clone the Repository**
    ```bash
    git clone <your-repo-url>
    cd SmartMoney
    ```
2.  **Install Dependencies**
    ```bash
    # Using npm
    npm install

    # OR using Yarn
    yarn install
    ```
3.  **Configure Babel**
    Ensure your `babel.config.js` includes the following plugins.
    ```javascript
    // babel.config.js
    module.exports = {
      presets: ['module:@react-native/babel-preset'],
      plugins: [
        ['@babel/plugin-proposal-decorators', { 'legacy': true }], // Must be first
        ['@nozbe/babel-plugin-watermelondb', {}],
      ],
    };
    ```
4.  **Place Gemma 3n Model**
    Place your **gemma.task** AI model file in the following directory on your Android device or emulator:
    `/storage/emulated/0/Documents/gemma.task`
5.  **Grant Android Permissions**
    The app needs SMS and storage permissions.
      * **Add to `AndroidManifest.xml`**: Open `android/app/src/main/AndroidManifest.xml` and add these lines inside the `<manifest>` tag.
        ```xml
        <uses-permission android:name="android.permission.INTERNET" />
        <uses-permission android:name="android.permission.READ_SMS" />
        <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
        <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
        <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />
        ```
      * **Runtime Permissions**: The app will prompt you for permissions at runtime. For Android 11+, you may need to manually enable "All files access" in your device's settings.
6.  **Start Metro Bundler**
    Open a terminal in the project root and run:
    ```bash
    # Using npm
    npm start -- --reset-cache

    # OR using Yarn
    yarn start --reset-cache
    ```
7.  **Build and Run the App**
    Open a new terminal window in the project root and run:
    ```bash
    # Using npm
    npm run android

    # OR using Yarn
    yarn android
    ```

This will build and install the app on your connected Android device or emulator.
