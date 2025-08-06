SmartMoney: AI-Powered Mobile Money Management
🌟 Project Overview

SmartMoney is an innovative React Native mobile application designed to provide users with effortless and intelligent management of their mobile money transactions. By leveraging Gemma 3n, a powerful on-device AI model, SmartMoney automates the tedious process of tracking, categorizing, and analyzing financial activities directly from SMS notifications, all while prioritizing user privacy and data security.

This project showcases the practical application of advanced on-device AI for real-world financial insights, making mobile money management smarter and more accessible.
✨ Key Features

    AI-Powered Transaction Parsing: Utilizes Gemma 3n to intelligently extract key financial details (amount, fees, balance, transaction ID, involved parties) from raw SMS messages.

    Automated Categorization: Automatically classifies transactions into predefined categories (e.g., Incoming Transfer, Outgoing Transfer, Deposit, Withdrawal, Mobile Payment, Electricity) using Gemma 3n's inference capabilities.

    On-Device Privacy: All sensitive SMS data processing and AI inference occur directly on the user's device, ensuring that financial information remains private and never leaves the phone.

    Local Data Persistence: Securely stores all parsed transactions, accounts, and SMS records in a local SQLite database.

    Intuitive Dashboard: Provides a clear overview of financial flows, including total income, expenses, and transfers.

    Detailed Transaction & Category Views: Allows users to drill down into specific transactions and view aggregated data per category.

    Robust SMS Management: Tracks processed SMS messages to prevent duplicates and ensure data integrity.

🚀 Technical Stack

    Frontend Framework: React Native (for cross-platform mobile development, targeting Android).

    AI Model: Gemma 3n (on-device inference for natural language processing of SMS).

    Database: React Native SQLite Database (react-native-sqlite-storage) for local, persistent, and structured data storage.

    Navigation: @react-navigation/stack for seamless screen transitions.

    State Management: React's built-in useState and useEffect hooks for component-level state.

    Unique IDs: uuid for generating universally unique identifiers for database records.

    Permissions: React Native's PermissionsAndroid and Linking for handling Android runtime permissions, including special handling for MANAGE_EXTERNAL_STORAGE on Android 11+.

📂 Project Structure

SmartMoney/
├── App.jsx                     # Main application entry point, sets up navigation
├── babel.config.js             # Babel configuration (includes WatermelonDB plugin for optimization)
├── package.json                # Project dependencies and scripts
├── README.md                   # This file
└── src/
    ├── assets/                 # Static assets like images and icons
    │   ├── images/
    │   │   ├── logo.png
    │   │   └── welcome-illustration.png
    │   └── icons/
    │       ├── refresh.png
    │       └── back.png
    ├── components/             # Reusable UI components
    │   ├── StatCard.jsx
    │   └── TransactionItem.jsx
    ├── database/               # Database-related services and initialization
    │   ├── db-service.js       # SQLite database initialization and core transaction functions
    │   └── schema.js           # SQLite table schema definitions (CREATE TABLE statements)
    ├── screens/                # Individual application screens
    │   ├── Splashscreen.jsx
    │   ├── WelcomeScreen.jsx
    │   ├── OnboardingScreen.jsx
    │   ├── LoadingScreen.jsx   # Core SMS processing and AI inference orchestration
    │   ├── HomeScreen.jsx
    │   ├── DetailClasseScreen.jsx
    │   └── DetailTransactionScreen.jsx
    └── utils/                  # Utility functions and helpers
        ├── images.js           # Image imports
        ├── smsProcessor.js     # Mock SMS data, Gemma prompt, and SMS formatting
        ├── gemmaParser.js      # Function to parse Gemma's JSON response
        └── PermissionManager.js # Handles Android runtime permissions

🛠️ Getting Started

    Note: Ensure you have completed the React Native Environment Setup Guide before proceeding. This project targets Android only.

1. Clone the Repository

git clone <your-repo-url>
cd SmartMoney

2. Install Dependencies

Install the project's dependencies:

# Using npm
npm install

# OR using Yarn
yarn install

3. Configure Babel

Ensure your babel.config.js includes the @babel/plugin-proposal-decorators and @nozbe/babel-plugin-watermelondb plugins. This is crucial for WatermelonDB's performance optimizations (even if using SQLite directly, this plugin is often part of the setup for related libraries).

// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { 'legacy': true }], // Must be first
    ['@nozbe/babel-plugin-watermelondb', {}], // Ensure this is present
    // other plugins
  ],
};

4. Place Gemma 3n Model

Place your gemma.task AI model file in the following directory on your Android device/emulator:

/storage/emulated/0/Documents/gemma.task

This path requires special permissions on Android 11+ (see Step 5).
5. Grant Android Permissions

Your app requires specific permissions to function:

    SMS Access: To read transaction SMS messages.

    Storage Access: To load the Gemma 3n model from external storage.

On Android 11 (API 30) and above, "All files access" is a special permission that cannot be granted via a standard pop-up. The app will attempt to redirect you to the system settings to enable this manually.

Before running the app for the first time:

    Add Permissions to AndroidManifest.xml:
    Open android/app/src/main/AndroidManifest.xml and ensure these lines are inside the <manifest> tag, usually before <application>:

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />

    Runtime Permission Handling: The app's LoadingScreen.jsx includes logic to request these permissions at runtime. Follow the prompts. For Android 11+, you will be redirected to settings to grant "All files access" manually.

6. Start Metro Bundler

Open your terminal in the project root and start the Metro dev server:

# Using npm
npm start -- --reset-cache

# OR using Yarn
yarn start --reset-cache

Keep this terminal window open.
7. Build and Run the App (Android)

Open a new terminal window from the project root and run:

# Using npm
npm run android

# OR using Yarn
yarn android

This will build and install the app on your connected Android device or emulator.
⚙️ Development & Troubleshooting

    Fast Refresh: Changes to your JavaScript code in App.jsx or other components will automatically update in the running app thanks to Fast Refresh.

    Troubleshooting: If you encounter issues, refer to the React Native Troubleshooting Guide. For native crashes during Gemma model loading, check adb logcat for Out-Of-Memory (OOM) errors or other native exceptions.

🎉 Congratulations!

You've successfully set up and run the SmartMoney app, powered by Gemma 3n!
📚 Learn More

    React Native Website

    React Native SQLite Storage

    Gemma 3n Documentation (Refer to official Google AI documentation for Gemma 3n specifics)
