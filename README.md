# SmartMoney React Native App Setup Guide

## 📱 Project Overview
This is a mobile money management app for Android that tracks and analyzes financial transactions using AI (Gemma 3n). The app provides insights into mobile money usage patterns.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Navigate to your project directory
cd your-project-name

# Install required packages
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-vector-icons

# For Android
npx react-native link react-native-vector-icons
```

### 2. Android Setup (react-native-screens)
Add to `android/app/src/main/java/.../MainActivity.java`:
```java
import android.os.Bundle;
// Add this import
import com.swmansion.rnscreens.RNScreens;

public class MainActivity extends ReactActivity {
  // Add this method
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);
  }
}
```

### 3. Create Directory Structure
```
src/
├── components/
│   ├── common/
│   │   └── LoadingScreen.jsx
│   ├── home/
│   │   ├── SummaryCards.jsx
│   │   ├── AccountsList.jsx
│   │   └── TransactionsList.jsx
├── screens/
│   ├── SplashScreen.jsx
│   ├── OnboardingScreen.jsx
│   ├── HomeScreen.jsx
│   ├── TransactionHistoryScreen.jsx
│   └── TransactionDetailScreen.jsx
├── navigation/
│   └── AppNavigator.jsx
└── utils/
    ├── colors.js
    ├── formatters.js
    └── mockData.js
```

### 4. Replace App.jsx
Replace your existing App.tsx/App.js with the provided App.jsx file.

### 5. Copy All Components
Copy all the provided component files into their respective directories.

## 🎨 Key Features

### ✅ Implemented Features
- **Splash Screen** - App loading with SmartMoney branding
- **Onboarding** - Welcome screen with illustration
- **Home Dashboard** - Financial summary with revenue/transfers/expenses
- **Mobile Accounts** - Display of Orange Money and MTN MoMo accounts
- **Transaction History** - Phone credit purchase history
- **Transaction Details** - Detailed view with SMS origin
- **AI Processing Screen** - Loading screen for Gemma 3 integration

### 🎯 App Flow
1. **SplashScreen** → Shows app logo and name
2. **OnboardingScreen** → Welcome message and get started
3. **HomeScreen** → Main dashboard with:
   - Weekly summary cards (Revenue, Transfers, Expenses)
   - Mobile money accounts list
   - Transaction categories list
4. **TransactionHistoryScreen** → Phone credit transactions
5. **TransactionDetailScreen** → Individual transaction details

## 🔧 Customization

### Colors
Modify `src/utils/colors.js` to change the app's color scheme:
```javascript
export const colors = {
  primary: '#FF8A80',     // Main pink/coral color
  secondary: '#4CAF50',   // Success green
  warning: '#FF9800',     // Orange for transfers
  danger: '#F44336',      // Red for expenses
  // ... other colors
};
```

### Mock Data
Update `src/utils/mockData.js` to match your actual data structure:
```javascript
export const mockData = {
  summary: {
    revenue: 52150,
    transfer: 28230,
    expense: 34180,
  },
  accounts: [
    // Your mobile money accounts
  ],
  transactions: [
    // Your transaction data
  ],
};
```

## 🤖 AI Integration Points

### Where to Add Gemma 3n
1. **SMS Processing** - In `TransactionDetailScreen.jsx`, the SMS text analysis
2. **Transaction Categorization** - In `formatters.js`, for auto-categorizing transactions
3. **Spending Insights** - In `HomeScreen.jsx`, for generating financial insights
4. **Fraud Detection** - In transaction processing for security alerts


## 📱 Running the App

### Development
```bash
# Start Metro bundler
npx react-native start

# Run on Android
npx react-native run-android
```

### Build for Production
```bash
# Generate release APK
cd android
./gradlew assembleRelease

# APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

## 🎯 Competition Notes

This app showcases Gemma 3n usage through:
- **Smart SMS Analysis** - AI processes transaction SMS messages
- **Intelligent Categorization** - Auto-categorizes transactions
- **Financial Insights** - Provides spending pattern analysis
- **User-Friendly Interface** - Clean, modern mobile money management

## 🐛 Troubleshooting

### Common Issues
1. **Performance issues** - End device requires at least 8Gb RAM with GPU support.