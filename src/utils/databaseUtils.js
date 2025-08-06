// src/utils/databaseUtils.js

import { getDatabase } from '../models';

export const clearDatabase = async () => {
  const db = getDatabase();
  try {
    await db.transaction((tx) => {
      // Drop all tables
      tx.executeSql('DROP TABLE IF EXISTS transactions');
      tx.executeSql('DROP TABLE IF EXISTS sms');
      tx.executeSql('DROP TABLE IF EXISTS accounts');
      tx.executeSql('DROP TABLE IF EXISTS categories');
      
      // Recreate tables (you can import these from your database setup)
      // This is just an example - adjust according to your schema
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          phone_number TEXT UNIQUE NOT NULL,
          operator_name TEXT NOT NULL,
          current_balance REAL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Add other table creation queries as needed
      
      console.log('Database cleared successfully');
    });
    
    // Clear any cached data or state
    // You might need to clear AsyncStorage if you're using it
    // await AsyncStorage.clear();
    
    return { success: true };
  } catch (error) {
    console.error('Error clearing database:', error);
    return { success: false, error: error.message };
  }
};